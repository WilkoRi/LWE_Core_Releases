#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::net::{SocketAddr, TcpStream};
use std::path::{Path, PathBuf};
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::time::Duration;
use tauri::Manager;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Default)]
struct AppState {
    child: Option<Child>,
}

#[derive(Serialize)]
struct ControlStatus {
    project_dir: String,
    port: u16,
    running: bool,
    managed: bool,
    dependencies_ready: bool,
    website_url: String,
    editor_url: String,
}

fn looks_like_lwe_project(path: &Path) -> bool {
    path.join("package.json").exists()
        && (path.join("lcb.config.json").exists()
            || path.join("server.js").exists()
            || path.join("lcb-server.js").exists())
}

fn find_lwe_project_from(start: &Path) -> Option<PathBuf> {
    let mut current = if start.is_file() {
        start.parent()?
    } else {
        start
    };

    loop {
        if looks_like_lwe_project(current) {
            return Some(current.to_path_buf());
        }

        current = current.parent()?;
    }
}

fn resolve_project_dir(configured_project_dir: Option<String>) -> Result<PathBuf, String> {
    if let Some(path) = configured_project_dir
        .as_deref()
        .filter(|path| !path.is_empty())
    {
        let configured = PathBuf::from(path);
        if looks_like_lwe_project(&configured) {
            return Ok(configured);
        }

        return Err(format!(
            "Gekozen projectmap is geen LWE-project: {}",
            configured.display()
        ));
    }

    let exe = std::env::current_exe().map_err(|error| error.to_string())?;

    if cfg!(target_os = "macos") {
        let mut current = exe.as_path();
        while let Some(parent) = current.parent() {
            if parent
                .extension()
                .is_some_and(|extension| extension == "app")
            {
                if let Some(project) = parent.parent().and_then(find_lwe_project_from) {
                    return Ok(project);
                }

                return parent
                    .parent()
                    .map(Path::to_path_buf)
                    .ok_or_else(|| "Projectmap naast LWE Control.app niet gevonden.".to_string());
            }
            current = parent;
        }
    }

    if let Some(project) = find_lwe_project_from(&exe) {
        return Ok(project);
    }

    if let Ok(current_dir) = std::env::current_dir() {
        if let Some(project) = find_lwe_project_from(&current_dir) {
            return Ok(project);
        }
    }

    Err("Kies eerst een LWE projectmap.".to_string())
}

fn configured_port(project_dir: &Path) -> u16 {
    let config_path = project_dir.join("lcb.config.json");
    let Ok(text) = std::fs::read_to_string(config_path) else {
        return 8082;
    };
    let Ok(json) = serde_json::from_str::<serde_json::Value>(&text) else {
        return 8082;
    };

    json.get("port")
        .and_then(serde_json::Value::as_u64)
        .and_then(|value| u16::try_from(value).ok())
        .unwrap_or(8082)
}

fn server_script(project_dir: &Path) -> Result<&'static str, String> {
    if project_dir.join("server.js").exists() {
        return Ok("server.js");
    }

    if project_dir.join("lcb-server.js").exists() {
        return Ok("lcb-server.js");
    }

    Err("Geen LWE serverbestand gevonden: server.js of lcb-server.js ontbreekt.".to_string())
}

fn package_manager_command() -> &'static str {
    if cfg!(target_os = "windows") {
        "npm.cmd"
    } else {
        "npm"
    }
}

fn eleventy_bin(project_dir: &Path) -> PathBuf {
    if cfg!(target_os = "windows") {
        project_dir
            .join("node_modules")
            .join(".bin")
            .join("eleventy.cmd")
    } else {
        project_dir
            .join("node_modules")
            .join(".bin")
            .join("eleventy")
    }
}

fn project_dependencies_ready(project_dir: &Path) -> bool {
    project_dir.join("node_modules").exists() && eleventy_bin(project_dir).exists()
}

fn install_project_dependencies(project_dir: &Path) -> Result<(), String> {
    let mut command = Command::new(package_manager_command());
    command
        .arg("install")
        .current_dir(project_dir)
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    #[cfg(target_os = "windows")]
    command.creation_flags(CREATE_NO_WINDOW);

    let status = command
        .status()
        .map_err(|error| format!("Project voorbereiden mislukt: {error}"))?;

    if !status.success() {
        return Err(
            "Project voorbereiden mislukt. Controleer of Node.js LTS is geinstalleerd en probeer opnieuw."
                .to_string(),
        );
    }

    if !project_dependencies_ready(project_dir) {
        return Err(
            "Project voorbereiden is klaar, maar Eleventy is nog niet gevonden. Controleer package.json en npm install."
                .to_string(),
        );
    }

    Ok(())
}

fn child_is_running(app_state: &mut AppState) -> bool {
    let Some(child) = app_state.child.as_mut() else {
        return false;
    };

    match child.try_wait() {
        Ok(Some(_)) => {
            app_state.child = None;
            false
        }
        Ok(None) => true,
        Err(_) => {
            app_state.child = None;
            false
        }
    }
}

fn port_is_open(port: u16) -> bool {
    let address = SocketAddr::from(([127, 0, 0, 1], port));
    TcpStream::connect_timeout(&address, Duration::from_millis(250)).is_ok()
}

fn status_from_state(
    state: &Mutex<AppState>,
    configured_project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    let project = resolve_project_dir(configured_project_dir)?;
    let port = configured_port(&project);
    let mut app_state = state
        .lock()
        .map_err(|_| "Serverstatus kon niet worden gelezen.".to_string())?;
    let managed = child_is_running(&mut app_state);
    let running = managed || port_is_open(port);

    Ok(ControlStatus {
        project_dir: project.display().to_string(),
        port,
        running,
        managed,
        dependencies_ready: project_dependencies_ready(&project),
        website_url: format!("http://127.0.0.1:{port}/"),
        editor_url: format!("http://127.0.0.1:{port}/__lcb/"),
    })
}

fn stop_child(app_state: &mut AppState) {
    if let Some(mut child) = app_state.child.take() {
        let _ = child.kill();
        let _ = child.wait();
    }
}

fn open_url(url: &str) -> Result<(), String> {
    let mut command = if cfg!(target_os = "macos") {
        let mut command = Command::new("open");
        command.arg(url);
        command
    } else if cfg!(target_os = "windows") {
        let mut command = Command::new("cmd");
        command.args(["/C", "start", "", url]);
        #[cfg(target_os = "windows")]
        command.creation_flags(CREATE_NO_WINDOW);
        command
    } else {
        let mut command = Command::new("xdg-open");
        command.arg(url);
        command
    };

    command.spawn().map_err(|error| error.to_string())?;
    Ok(())
}

fn spawn_server_command(project: &Path, script: &str) -> Result<Child, String> {
    let mut command = Command::new("node");
    command
        .arg(script)
        .current_dir(project)
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    #[cfg(target_os = "windows")]
    command.creation_flags(CREATE_NO_WINDOW);

    command
        .spawn()
        .map_err(|error| format!("LWE-server starten mislukt: {error}"))
}

#[tauri::command]
fn get_status(
    state: tauri::State<Mutex<AppState>>,
    project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    status_from_state(&state, project_dir)
}

#[tauri::command]
fn start_server(
    state: tauri::State<Mutex<AppState>>,
    project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    {
        let mut app_state = state
            .lock()
            .map_err(|_| "Serverstatus kon niet worden aangepast.".to_string())?;

        if !child_is_running(&mut app_state) {
            let project = resolve_project_dir(project_dir.clone())?;
            if !project_dependencies_ready(&project) {
                return Err(
                    "Project is nog niet voorbereid. Klik eerst op Project voorbereiden."
                        .to_string(),
                );
            }

            let port = configured_port(&project);
            if port_is_open(port) {
                return Err(format!(
                    "Poort {port} is al actief. Waarschijnlijk draait LWE al buiten deze app. Gebruik die server, of stop hem eerst via de terminal."
                ));
            }

            let script = server_script(&project)?;
            let child = spawn_server_command(&project, script)?;

            app_state.child = Some(child);
        }
    }

    status_from_state(&state, project_dir)
}

#[tauri::command]
fn stop_server(
    state: tauri::State<Mutex<AppState>>,
    project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    {
        let mut app_state = state
            .lock()
            .map_err(|_| "Serverstatus kon niet worden aangepast.".to_string())?;

        if child_is_running(&mut app_state) {
            stop_child(&mut app_state);
        }
    }

    status_from_state(&state, project_dir)
}

#[tauri::command]
fn restart_server(
    state: tauri::State<Mutex<AppState>>,
    project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    {
        let mut app_state = state
            .lock()
            .map_err(|_| "Serverstatus kon niet worden aangepast.".to_string())?;

        let project = resolve_project_dir(project_dir.clone())?;
        if !project_dependencies_ready(&project) {
            return Err(
                "Project is nog niet voorbereid. Klik eerst op Project voorbereiden.".to_string(),
            );
        }

        let port = configured_port(&project);

        if child_is_running(&mut app_state) {
            stop_child(&mut app_state);
        } else if port_is_open(port) {
            return Err(format!(
                "Poort {port} is al actief, maar deze server is niet door LWE Control gestart. Stop die eerst voordat je herstart."
            ));
        }

        let script = server_script(&project)?;
        let child = spawn_server_command(&project, script)?;

        app_state.child = Some(child);
    }

    status_from_state(&state, project_dir)
}

#[tauri::command]
fn prepare_project(
    state: tauri::State<Mutex<AppState>>,
    project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    let project = resolve_project_dir(project_dir.clone())?;

    {
        let mut app_state = state
            .lock()
            .map_err(|_| "Serverstatus kon niet worden aangepast.".to_string())?;

        if child_is_running(&mut app_state) {
            return Err("Stop eerst de server voordat je het project voorbereidt.".to_string());
        }
    }

    install_project_dependencies(&project)?;
    status_from_state(&state, project_dir)
}

#[tauri::command]
fn open_website(
    state: tauri::State<Mutex<AppState>>,
    project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    let status = status_from_state(&state, project_dir)?;
    open_url(&status.website_url)?;
    Ok(status)
}

#[tauri::command]
fn open_editor(
    state: tauri::State<Mutex<AppState>>,
    project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    let status = status_from_state(&state, project_dir)?;
    open_url(&status.editor_url)?;
    Ok(status)
}

#[tauri::command]
fn quit_app(
    app: tauri::AppHandle,
    state: tauri::State<Mutex<AppState>>,
    project_dir: Option<String>,
) -> Result<ControlStatus, String> {
    let status = stop_server(state, project_dir)?;
    app.exit(0);
    Ok(status)
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(Mutex::new(AppState::default()))
        .invoke_handler(tauri::generate_handler![
            get_status,
            start_server,
            stop_server,
            restart_server,
            prepare_project,
            open_website,
            open_editor,
            quit_app
        ])
        .on_window_event(|window, event| {
            if matches!(event, tauri::WindowEvent::CloseRequested { .. }) {
                if let Some(state) = window.try_state::<Mutex<AppState>>() {
                    if let Ok(mut app_state) = state.lock() {
                        stop_child(&mut app_state);
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running LWE Control");
}
