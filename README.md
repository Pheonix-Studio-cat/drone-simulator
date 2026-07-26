# Drohnen-Simulator

Ein realistischer Drohnen-Simulator in **einer einzigen Datei** – ohne Installation, ohne Abhängigkeiten.

### ▶️ [Direkt im Browser spielen](https://pheonix-studio-cat.github.io/drone-simulator/)

Alternativ einfach [`index.html`](index.html) herunterladen und im Browser öffnen. Läuft auf Desktop, Tablet und Smartphone.

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

### 13 Drohnenmodelle
Von der winzigen Tiny-Whoop-Klasse (**Typhoon20**) über die 249-g-Ultraleichtdrohne und klassische/professionelle Kameradrohnen bis zu Cinewhoop und 5-Zoll-Racer – jedes Modell mit eigenen, realen Vorbildern nachempfundenen Kennwerten. Die Modelle sind zudem **unterschiedlich stabil**: leichte, agile Drohnen (Whoops, Micros) tanzen im Wind spürbar, schwere Kameraplattformen liegen wie festgenagelt in der Luft.

Ganz oben in der Tempo-Liste steht die **PHÖNIX DRONES SPEEDY** – ein 3D-gedruckter Eigenbau mit hohem weißem Kastenrumpf, Keilnase und rotem Nasenstreifen: 6S-Antrieb, **über 160 km/h im GPS-Modus** (bei voller Empfindlichkeit 225 km/h) und **über 210 km/h in ANGLE/ACRO**, im Sturzflug mehr. Ihr Rahmen steht auch im DIY-Editor zur Auswahl.

### 🌍 8 echte Orte (reale Geodaten)
Karten aus **echten Geländedaten** dieser Welt – kein erfundenes Terrain:

| Karte | Was dich erwartet |
|---|---|
| 🇨🇭 **Zürich** | Echte Innenstadt mit ~2600 realen Gebäudegrundrissen und Höhen, Limmat und Seebecken |
| 🏞️ **Glarus · Klöntal** | 17,5 km Glarnerland: Start am Klöntalersee (838 m, 4,3 km lang), dahinter Glärnisch (2910 m), Fronalpstock und Wiggis-Kette, dazu Glarus und Netstal im Linthtal mit echten Gebäuden |
| 🏔️ **Matterhorn** | Das echte Massiv über Zermatt, Start am Schwarzsee auf 2568 m |
| 🪂 **Lauterbrunnental** | Echtes Trogtal mit fast senkrechten Wänden – der Proximity-Spot |
| 🗻 **Mount Everest** | Start am Basislager auf 5304 m, Gipfelregion bis 8748 m |
| 🏜️ **Grand Canyon** | South Rim mit ~1400 m senkrechtem Abbruch zum Colorado |
| 🌋 **Island** | Isländisches Hochland mit Vulkankegeln |
| 🇳🇴 **Geirangerfjord** | Steilwände fallen über 1600 m direkt ins Meer |

Dazu **dünne Luft nach echter Höhenformel**: auf dem Everest liefert dieselbe Drohne nur noch rund die Hälfte des Schubs und steigt merklich zäher – wie in echt.

### 🗺️ Jeden Ort der Welt fliegen
Über **„Weltkarte öffnen"** im Menü einen Punkt auf der Weltkarte anklicken (oder eine der 16 vorgemerkten Städte wählen, oder Koordinaten eintippen) – und der Simulator lädt daraus live eine spielbare Karte:

- **Echtes Geländeprofil** über 6 km aus offenen Höhendaten
- **Echte Gebäudegrundrisse mit ihren echten Höhen** aus OpenStreetMap, im Umkreis von 2,4 km – inklusive **Wahrzeichen** wie Türmen, Leuchttürmen und Kirchen, die ihre wirkliche Höhe behalten (steht keine Höhe in den Daten, wird sie aus Stockwerkzahl oder Grundfläche geschätzt)
- Die Weltkarte selbst ist ebenfalls aus echten Höhendaten gezeichnet: Meer blau, Land nach Höhe, Hochgebirge weiß

Braucht Internet. Klappt der Abruf nicht, sagt der Simulator das klar und die eingebauten Karten funktionieren weiterhin.

**Datenquellen:** Geländehöhen aus offenen Terrain-Tiles (SRTM u. a.), Gebäudegrundrisse © **Overture Maps / OpenStreetMap-Mitwirkende** (ODbL). Bewusst **keine** Satellitenbilder – die sind proprietär; der Boden wird stattdessen aus echter Höhe, Hangneigung und Wasserlinie eingefärbt.

### 6 erfundene Karten mit prozeduralem Terrain
- 🌳 **Standard** – Wiesen, Wälder, sanfte Hügel
- 🏚️ **Lostplace** – verlassenes Industriegelände mit 60-m-Schornstein, offener Halle und Bürogerippe (perfekt für FPV-Dives)
- 🧊 **Antarktis** – Eiswüste mit Forschungsstation
- 🏔️ **Berge & Seen** – alpine Gipfel mit Schneegrenze und Bergseen (Wasserlandung = Totalverlust!)
- 🌾 **Flachland** – Felder, Windräder, Bauernhof
- 🏙️ **Großstadt** – Hochhaus-Schluchten, Straßen, Autos und viele Fußgänger

Auf allen Karten laufen Menschen herum – wer sie anfliegt, crasht. Alle Karten sind prozedural generiert und komplett offline.

### Crash, Trümmer & Bergung
Bei einem Absturz zerlegt sich die Drohne in Einzelteile (Propeller, Arme, Akku, Rumpf), die physikalisch korrekt durch die Gegend fliegen. Das Wrack bleibt liegen – und kann mit einer **Bergungsdrohne** (Taste `B`) abgeholt werden: hinfliegen, 2 s darüber hovern, zurücktragen. Das Wrack am Haken verändert die Flugphysik spürbar.

### Foto-Modus
Foto-Button 📷 (Taste `F`): Schnappschüsse landen in einer **Galerie** im Menü (mit Download). Die Foto-Mission speichert ihre Bilder ebenfalls dort.

### 🔧 DIY-Drohnen-Editor
**💬 Einfach hinschreiben, was sie können soll:** Ganz oben im Editor gibt es ein Feld für deinen Wunsch – „schnell und wendig", „lange Flugzeit", „zum Filmen in Rot", „klein für drinnen", „schwere Lasten tragen", „Freestyle". Der Baukasten stellt Rahmen, Motoren, Propeller, Akku, Kamera und Farbe passend ein. *Manche Wünsche schalten etwas frei, das sonst nirgends im Menü steht …*

Was einmal gefunden ist, bleibt: Die freigeschalteten Bauten stehen danach unter **„🥚 Gefundene Easter Eggs"** als Vorlage im Editor und ihre Spezialrahmen tauchen im Teilekatalog auf. Du kannst sie also **komplett umbauen** – anderer Antrieb, anderer Akku, Schwimmer, eigene Farbe – und ihre Besonderheit (Abwurfschacht bzw. Raketen samt kurzer Funkreichweite) nimmst du mit. Die Originale bleiben unangetastet im Flugmenü.

**🛟 Wasser-Landefüße:** Im Abschnitt *Fahrwerk / Landefüße* gibt es neben Landekufen auch **Schwimmer** – damit landet die Drohne sanft auf dem See, treibt dort (sie wippt und rutscht mit dem Wind) und startet wieder. Ohne Schwimmer bleibt Wasser weiterhin ein Totalverlust; und wer mit Karacho aufschlägt, macht sie auch mit Schwimmern kaputt.

Baue im Menü über **„Eigene Drohne bauen"** deine eigene Drohne aus vorgegebenen Teilen: **Gehäuse/Rahmen** (inkl. exklusiver Frames wie Deadcat, Toothpick und Tiny-Whoop), **Motoren, Propeller, Akku, Kamera, Fahrwerk** und **Farbe** – mit Farbpaletten *und* freiem **Farbwähler im Spektrum** für Haupt- und Akzentfarbe. Eine drehende **Live-3D-Vorschau** und laufend aktualisierte Kennwerte (Gewicht, Topspeed, Schub/Gewicht, Flugzeit, Agilität, Stabilität) zeigen sofort, was deine Wahl bewirkt. Gespeicherte Drohnen landen als **DIY** im Flugmenü und fliegen mit der echten Physik – gespeichert bleibt alles lokal im Browser.

### Grafik-Umschalter
Im Menü zwischen **✨ Realistisch** (glatte, produktnahe Rümpfe mit Glanzlicht) und **🧱 Blockig (Retro)** wählen. Die Auswahl wird gespeichert.

### Steuerempfindlichkeit
Drei Stufen (Langsam/Normal/Schnell) – wie die Cine-/Normal-/Sport-Modi echter Drohnen. Auf Touch-Geräten (iPad/Smartphone) startet der Simulator automatisch auf **Langsam**.

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
| `F` | Foto aufnehmen |
| `B` | Bergungsdrohne starten (nach Crash) |
| `X` | Bombe abwerfen (nur mit Abwurfschacht) |
| `R` | Zurücksetzen |
| `1`–`4` | Windstärke |
| `Esc` | Menü |

**Gamepad:** Wird automatisch erkannt – linker Stick Gas/Yaw, rechter Stick Nick/Roll (Mode 2).

**Touch:** Zwei virtuelle Sticks (links Gas/Yaw, rechts Nick/Roll) plus Buttons – voll spielbar auf dem Smartphone.

## Technik

Alles in `index.html`: eigener WebGL-Renderer (ohne Three.js o. Ä.), Physik-Engine, Flight Controller, prozedurale Landschaft, HUD und Motorsound (WebAudio). Keine externen Ressourcen – funktioniert auch offline.

## Lizenz

[Apache 2.0](LICENSE)
