import { invoke } from "@tauri-apps/api/core";
import "./styles.css";

const elements = {
  statusBadge: document.querySelector("#statusBadge"),
  projectPath: document.querySelector("#projectPath"),
  serverStatus: document.querySelector("#serverStatus"),
  port: document.querySelector("#port"),
  message: document.querySelector("#message"),
  startButton: document.querySelector("#startButton"),
  stopButton: document.querySelector("#stopButton"),
  restartButton: document.querySelector("#restartButton"),
  openEditorButton: document.querySelector("#openEditorButton"),
  openWebsiteButton: document.querySelector("#openWebsiteButton"),
  openManualButton: document.querySelector("#openManualButton"),
  quitButton: document.querySelector("#quitButton"),
};

function setMessage(text, isError = false) {
  elements.message.textContent = text || "";
  elements.message.classList.toggle("is-error", Boolean(isError));
}

function renderStatus(status) {
  elements.projectPath.textContent = status.project_dir || "-";
  elements.serverStatus.textContent = status.running
    ? status.managed
      ? "Actief via LWE Control"
      : "Actief buiten LWE Control"
    : "Inactief";
  elements.port.textContent = String(status.port || "-");
  elements.statusBadge.textContent = status.running ? "Actief" : "Inactief";
  elements.statusBadge.classList.toggle("is-active", Boolean(status.running));
  elements.statusBadge.classList.toggle("is-external", Boolean(status.running && !status.managed));
  elements.stopButton.disabled = Boolean(status.running && !status.managed);
  elements.restartButton.disabled = Boolean(status.running && !status.managed);
}

async function refreshStatus() {
  try {
    const status = await invoke("get_status");
    renderStatus(status);
  } catch (error) {
    setMessage(String(error), true);
  }
}

async function runAction(action, successMessage) {
  try {
    setMessage("");
    setBusy(true);
    const status = await invoke(action);
    renderStatus(status);
    setMessage(successMessage);
  } catch (error) {
    setMessage(String(error), true);
  } finally {
    setBusy(false);
  }
}

function setBusy(isBusy) {
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
  });
}

elements.startButton.addEventListener("click", () => runAction("start_server", "Server gestart."));
elements.stopButton.addEventListener("click", () => runAction("stop_server", "Server gestopt."));
elements.restartButton.addEventListener("click", () => runAction("restart_server", "Server herstart."));
elements.openEditorButton.addEventListener("click", () => runAction("open_editor", "Web editor geopend."));
elements.openWebsiteButton.addEventListener("click", () => runAction("open_website", "Website geopend."));
elements.openManualButton.addEventListener("click", () => runAction("open_manual", "Manual geopend."));
elements.quitButton.addEventListener("click", () => runAction("quit_app", "LWE Control sluit af."));

refreshStatus();
setInterval(refreshStatus, 3000);
