# Drohnen-Simulator

Ein realistischer Drohnen-Simulator in **einer einzigen Datei** – ohne Installation, ohne Abhängigkeiten.

**Einfach [`index.html`](index.html) im Browser öffnen und losfliegen.** Läuft auf Desktop, Tablet und Smartphone.

## Features

### Realistische Flugphysik
- 6-Freiheitsgrade-Starrkörpersimulation mit 500 Hz Physik-Takt
- Motormodell mit Anlaufverzögerung, Schub ∝ Drehzahl², Motor-Mixer wie bei echten Flight Controllern
- Aerodynamik: geschwindigkeitsabhängiger Luftwiderstand, Bodeneffekt, Wind mit Böen und Turbulenz (4 Stufen)
- Batteriemodell: Kapazität, Spannungssackung unter Last, nachlassender Schub bei leerem Akku
- Crash-Erkennung mit harten/sanften Landungen

### 4 Flugmodi (je nach Modell)
| Modus | Verhalten |
|---|---|
| **GPS** | Hält Position und Höhe von selbst, Sticks steuern die Geschwindigkeit |
| **ATTI** | Hält die Höhe, driftet aber mit dem Wind |
| **ANGLE** | Selbstaufrichtend mit Neigungsbegrenzung, Gas manuell |
| **ACRO** | Volle manuelle Raten-Steuerung wie im FPV-Racing |

### 11 Drohnenmodelle
Von der 249-g-Ultraleichtdrohne über klassische und professionelle Kameradrohnen bis zu Cinewhoop und 5-Zoll-Racer – jedes Modell mit eigenen, realen Vorbildern nachempfundenen Kennwerten (Masse, Schub, Trägheit, Windempfindlichkeit, Akku, Flugzeit).

### Missionen
- 🏁 **Rennstrecke** – 2 Runden durch 8 Tore, Bestzeit wird gespeichert
- 📷 **Foto-Mission** – 5 Punkte anfliegen und ruhig hovern
- 📦 **Liefermission** – Paket aufnehmen und sanft absetzen (Zuladung verändert die Physik)
- 🎯 **Präzisionslandung** – mit 22 % Restakku auf einer kleinen Plattform landen

### Ansichten
FPV (bei Kameradrohnen gimbal-stabilisiert), Verfolgerkamera und Bodenansicht (Sichtflug) – mit Taste `C` oder Button umschalten.

## Steuerung

**Tastatur (Mode 2):**

| Taste | Funktion |
|---|---|
| `W` / `S` | Gas |
| `A` / `D` | Gieren (Yaw) |
| Pfeiltasten | Nicken / Rollen |
| `Leertaste` | Arm / Disarm |
| `M` | Flugmodus wechseln |
| `C` | Kamera wechseln |
| `R` | Zurücksetzen |
| `1`–`4` | Windstärke |
| `Esc` | Menü |

**Gamepad:** Wird automatisch erkannt – linker Stick Gas/Yaw, rechter Stick Nick/Roll (Mode 2).

**Touch:** Zwei virtuelle Sticks (links Gas/Yaw, rechts Nick/Roll) plus Buttons – voll spielbar auf dem Smartphone.

## Technik

Alles in `index.html`: eigener WebGL-Renderer (ohne Three.js o. Ä.), Physik-Engine, Flight Controller, prozedurale Landschaft, HUD und Motorsound (WebAudio). Keine externen Ressourcen – funktioniert auch offline.

## Lizenz

[Apache 2.0](LICENSE)
