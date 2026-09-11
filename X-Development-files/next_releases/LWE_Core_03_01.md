# LWE Core 03 Roadmap

LWE Core 03 is de terminal-first opvolger van LWE Core 02.

## Besluit

Desktop-apps, Windows installers, macOS app bundles, Rust en Tauri zijn uit de kern gehaald. De stabiele basis is Node.js + npm + Terminal/CMD + VS Code.

## Klaar voor start

- app/Rust/Tauri bron verwijderd
- Windows installer workflow verwijderd
- terminal-first manual toegevoegd
- Windows en Mac startbestanden toegevoegd
- release-manifest opgeschoond
- updater rolt geen desktop-app meer uit

## Te controleren

- Windows: Node.js via website installeren en start-lwe-windows.cmd testen
- Mac: start-lwe-mac.command testen
- VS Code extensie blijft optioneel beschikbaar
- update van bestaand project naar Core 03 testen op demo
- publicatiecheck blijft ongewijzigd: alleen _site uploaden
