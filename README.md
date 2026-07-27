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
**Adresse eintippen und dort starten:** Ins Feld im Menü (oder in die Suche der Weltkarte) schreibst du eine ganz normale Adresse – „Bahnhofstrasse 1, Zürich", „Eiffelturm", „Times Square New York". Der Simulator sucht sie, zeigt bei mehreren Möglichkeiten eine Trefferliste zum Anklicken und baut daraus die Karte. Koordinaten gehen weiterhin genauso.

**Die Schweiz zuerst:** Gesucht wird erst im Schweizer Kartenausschnitt, dann weltweit. Damit findest du praktisch jede Schweizer Adresse direkt, ohne Land dazuschreiben zu müssen – „Bahnhofstrasse 1" landet in der Schweiz, nicht irgendwo sonst.

Alternativ über **„Weltkarte öffnen"** einen Punkt auf der Weltkarte anklicken oder eine der 16 vorgemerkten Städte wählen. In jedem Fall lädt der Simulator live eine spielbare Karte:

- **Echtes Geländeprofil** über 6 km aus offenen Höhendaten
- **Echte Gebäudegrundrisse mit ihren echten Höhen** aus OpenStreetMap, im Umkreis von 2,4 km – inklusive **Wahrzeichen** wie Türmen, Leuchttürmen und Kirchen, die ihre wirkliche Höhe behalten (steht keine Höhe in den Daten, wird sie aus Stockwerkzahl oder Grundfläche geschätzt)
- **Farbige Häuser statt grauer Klötze:** Steht die Farbe in den Geodaten, wird sie übernommen; sonst kommt sie aus Gebäudeart und Größe – warme Fassaden mit Ziegel-, Schiefer- und Kupferdächern, kühle Glasfassaden für Bürotürme, helles Mauerwerk für Kirchen
- **Fußgänger auch hier:** Auf den echten Karten laufen Menschen auf freiem, flachem Grund herum – niemand steckt in einer Hauswand
- Die Weltkarte selbst ist ebenfalls aus echten Höhendaten gezeichnet: Meer blau, Land nach Höhe, Hochgebirge weiß

Braucht Internet. Klappt der Abruf nicht, sagt der Simulator das klar und die eingebauten Karten funktionieren weiterhin. Adresssuche über die offenen OSM-Dienste **Photon** und (als Ausweichlösung) **Nominatim**.

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

Es gibt auch **Zubehör** zu finden, das an *jede* selbstgebaute Drohne passt: einen **Kamikaze-Sprengsatz** (der Aufschlag ist die Zündung), ein **unsichtbares Atombomben-Magazin** mit 20 Sprengköpfen und eine **Katze im Tragegurt** 🐱, die unter dem Rumpf hängt und auf Knopfdruck (Taste `Y`) maunzt – der Ton wird im Spiel erzeugt, nachzuladen ist nichts. Ihre 1,6 kg wollen allerdings erst mal gehoben werden. Beide tauchen nach dem Fund im Editor unter **Zubehör** auf. Und eine schlanke **Langstreckendrohne** mit Satellitenkuppel, V-Leitwerk und Waffenpylonen – 200 km/h, 10 Bomben und eine Atombombe.

Der dickste Fund ist ein getarnter **Nurflügler** mit vier in die Fläche versenkten Hubrotoren und zwei **Nuklearraketen**: 100 m Sprengradius, und wer im Umkreis von 200 m steht, wächst hinterher ein paar Gliedmaßen zu viel (Comic-Effekt, je näher desto absurder). Vor dem Abschuss zeigt ein Ring den Sprengradius am Boden – halte selbst Abstand, sonst erwischt dich die Druckwelle.

Was einmal gefunden ist, bleibt: Die freigeschalteten Bauten stehen danach unter **„🥚 Gefundene Easter Eggs"** als Vorlage im Editor und ihre Spezialrahmen tauchen im Teilekatalog auf. Du kannst sie also **komplett umbauen** – anderer Antrieb, anderer Akku, Schwimmer, eigene Farbe – und ihre Besonderheit (Abwurfschacht bzw. Raketen samt kurzer Funkreichweite) nimmst du mit. Die Originale bleiben unangetastet im Flugmenü.

**🎒 Zubehör – drei Steckplätze an jeder Drohne:** Unter *Zubehör – Steckplatz 1/2/3* hängst du bis zu **drei Teile** an eine Drohne, gern auch zweimal dasselbe (zwei Bomben-Magazine = 4 Bomben). Alles wiegt mit und ist am Modell zu sehen:

| Teil | Gewicht | Was es tut |
|---|---|---|
| 💣 **Bomben-Magazin** | 260 g | Zwei Abwurfbomben unter dem Rumpf – Taste `X` |
| 🎆 **Feuerwerks-Magazin** | 140 g | Drei Leuchtkugeln, die bunt am Himmel zerplatzen – Taste `V`. Reine Deko, zerstört nichts |
| 📦 **Pakethaken mit Kiste** | 90 g | Kiste am Seil: mit Taste `P` abwerfen, drüber hovern und wieder aufnehmen. Der **Inhalt** ist wählbar – Luftpolster (200 g), Werkzeug (800 g) oder Ziegelsteine (1,8 kg). Die Last ist in der Flugphysik deutlich zu spüren, abwerfen macht sofort leichter |
| 🎥 **Action-Cam** | 12 g | Winzige Frontkamera als Kameraersatz – deutlich leichter als FPV-Kamera (20 g) und Gimbal (90 g), gibt trotzdem eine FPV-Sicht |
| 🎇 **Feuerwerks-Kanone** | 220 g | Drei Geschosse **nach vorn** – Taste `G`. Sie zerplatzen am Ziel und reißen im Umkreis von 14 m Bäume, Masten, Zäune und Schornsteine weg. Häuser und Hallen bleiben stehen |
| 🐝 **Hornissennest** | 340 g | Dreimal Schwarm – Taste `H`. Die Hornissen suchen sich die nächste **fremde Drohne im Umkreis von 300 m** und holen sie vom Himmel. Ohne Ziel in Reichweite bleiben sie im Nest |
| 🛰️ **Mini-Andockdrohne** | 50 g | Klinkt sich mit Taste `K` aus, fliegt allein eine Erkundungsschleife, **fotografiert unterwegs aus ihrer eigenen Sicht** (die Bilder landen in der Galerie) und dockt danach wieder an. Ein zweiter Druck ruft sie sofort zurück |
| 🪰 **Wespennest** | 280 g | Dreimal Schwarm – Taste `J`. 40 Wespen gehen auf **alle Menschen im Umkreis von 150 m** los; wer gestochen wird, rennt panisch davon und ist gleich darauf über alle Berge. Ist niemand in Reichweite, bleiben sie im Nest |

Angebautes Zubehör **wiegt wirklich mit**: Der Antrieb wird davon nicht stärker, das Schub/Gewicht im Datenblatt sinkt entsprechend. Ein Kompaktrahmen mit Bomben-Magazin fällt von 2,6:1 auf 1,9:1 – und ein überladener Aufbau kommt gar nicht mehr hoch.

### 📡 Fremde Drohnen
Ab und zu – selten, frühestens nach gut einer halben Minute und höchstens zu zweit – taucht eine **fremde KI-Drohne** über der Karte auf, zieht ihre Bahn und blinkt dabei rot. Man erwischt sie mit dem Hornissenschwarm, mit einem Kanonentreffer daneben, mit einer Bombe oder einer Atombombe. Getroffen trudelt sie zu Boden und zerschellt.

**🛟 Wasser-Landefüße:** Im Abschnitt *Fahrwerk / Landefüße* gibt es neben Landekufen auch **Schwimmer** – damit landet die Drohne sanft auf dem See, treibt dort (sie wippt und rutscht mit dem Wind) und startet wieder. Ohne Schwimmer bleibt Wasser weiterhin ein Totalverlust; und wer mit Karacho aufschlägt, macht sie auch mit Schwimmern kaputt.

Baue im Menü über **„Eigene Drohne bauen"** deine eigene Drohne aus vorgegebenen Teilen: **Gehäuse/Rahmen** (inkl. exklusiver Frames wie Hybrid-FPV, Deadcat, Toothpick und Tiny-Whoop), **Motoren, Propeller, Akku, Kamera, Fahrwerk**, **drei Zubehör-Steckplätze** und **Farbe** – mit Farbpaletten *und* freiem **Farbwähler im Spektrum** für Haupt- und Akzentfarbe. Eine drehende **Live-3D-Vorschau** und laufend aktualisierte Kennwerte (Gewicht, Topspeed, Schub/Gewicht, Flugzeit, Agilität, Stabilität) zeigen sofort, was deine Wahl bewirkt. Gespeicherte Drohnen landen als **DIY** im Flugmenü und fliegen mit der echten Physik – gespeichert bleibt alles lokal im Browser.

### 🛠️ Map-Builder: eigene Karten bauen
Über **„Eigene Karte bauen"** im Menü baust du dir deine eigene Landschaft: **Geländeform** (flach, hügelig, Berge, Wüste), Hügeligkeit, Baumdichte, Zufallszahl und ein **Wasserstand**, der Seen in die Senken legt – der Startplatz liegt immer auf einem trockenen Plateau darüber. In der Draufsicht (800 × 800 m) tippst du dann **Bäume, Häuser, Hochhäuser, Hallen, Mauern, Schornsteine, Felsen und Menschen** hin. Gespeicherte Karten stehen mit dem Abzeichen **EIGENE** im Kartenmenü und bleiben im Browser erhalten.

### 👥 Mehrspieler (lokal)
Im Menü einschalten, den Simulator in einem **zweiten Fenster oder Tab** desselben Browsers öffnen und dort ebenfalls einschalten – ihr seht euch dann gegenseitig live fliegen, mit dem jeweils gewählten Drohnenmodell. Sichtbar ist nur, wer auf derselben Karte unterwegs ist.

Für ein Spiel **über das Internet** bräuchte es einen Server, der die Positionen weiterreicht. Diese Seite liegt auf rein statischem Hosting (GitHub Pages) und hat keinen – deshalb der lokale Weg, der ohne Server auskommt und auch offline funktioniert.

### 🌅 Tageszeit und Wetter
Im Menü vor dem Start wählbar – beides steckt in den eingebackenen Schatten und im Nebel, deshalb wird die Szene beim Wechsel neu aufgebaut.

**Tageszeit:** 🌅 Morgen (tiefe Sonne von Osten, lange Schatten) · ☀️ Mittag · 🌇 Abendrot (rotes Gegenlicht von Westen) · 🌙 Nacht. Nachts steht der Mond am Himmel, es funkeln **Sterne**, und in den Häusern gehen **Fenster an** – in der Großstadt kommen dafür rund 87 000 Dreiecke dazu.

**Wetter:** ☀️ Klar · 🌧️ Regen · ❄️ Schnee · 🌫️ Nebel. Regen und Schnee fallen als Partikel um die Kamera; Nebel drückt die Sicht auf gut 80 m.

Regen und Schnee kosten **ehrlich, aber wenig**: gemessen an einem Race-5-Zöller bei voller Neigung im ANGLE-Modus fällt die Endgeschwindigkeit von 122,2 auf 119,4 km/h (−2,3 %), und der Akku ist nach 16 s bei 57,8 statt 53,9 % Verbrauch. **Im GPS-Modus merkst du davon nichts** – dort gleicht der Regler den Mehrwiderstand aus (54,3 statt 54,7 km/h), genau wie bei einer echten Drohne.

Passend dazu gibt es den 🔦 **Scheinwerfer** als Zubehör (190 g, Taste `L`): ein Lichtkegel, der den Boden anleuchtet.

### 🏠 Return-to-Home, Videolink und Gimbal
**Return-to-Home** (Taste `T` oder 🏠 im HUD): Beim Armen merkt sich die Drohne ihren Startpunkt. Auf Knopfdruck steigt sie erst auf 35 m Sicherheitshöhe, fliegt dann heim und landet dort selbstständig – im Test aus 281 m Entfernung 0,1 m neben dem Startpunkt. Ein Stickausschlag bricht ab, die Kontrolle bleibt jederzeit bei dir.

**Failsafe:** Unter 15 % Akku oder an der Reichweitengrenze kommt sie von allein zurück – aber **nur aus dem GPS-Modus heraus**. Wer bewusst in ANGLE oder ACRO fliegt, bekommt seine Drohne nicht mitten im Manöver umgeschaltet, sondern nur eine deutliche Warnung. Drohnen ohne GPS haben gar kein RTH.

**Videolink** 📶: Die Verbindung zum Startpunkt wird mitgerechnet. Bis etwa zur halben Reichweite ist sie voll, danach fällt sie ab; **Gebäude in der Sichtlinie** dämpfen zusätzlich. Gemessen in der Großstadt (Reichweite 760 m): 100 % in der Nähe, 78 % bei 500 m, 16 % bei 740 m – und zwischen Hochhäusern auf Bodenhöhe 52 % statt 84 % darüber. Bei schwachem Link flimmert das Bild, bei fast weggebrochenem Signal setzt es ganz aus.

**Gimbal-Neigung:** Mit `,` und `.` die Kamera zwischen −90° (senkrecht nach unten) und +30° schwenken; der 🎥-Knopf schaltet für Touch durch 0/−30/−60/−90°. Wirkt bei Gimbal-Drohnen genauso wie bei fester FPV-Kamera.

**Akkuwarnungen** mit Ton bei 25 % und ab 15 % im Sekundentakt – über denselben Klangerzeuger wie das Motorengeräusch, es wird nichts nachgeladen.

**Windsack** am Startplatz: dreht sich mit dem Wind und hängt bei Flaute schlaff herunter – so siehst du den Wind, statt ihn nur zu spüren.

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
| `N` | Nuklearrakete starten (nur mit Tarnkappen-Nurflügler) |
| `V` | Feuerwerk abschießen (mit Feuerwerks-Magazin) |
| `P` | Kiste abwerfen / wieder aufnehmen (mit Pakethaken) |
| `G` | Feuerwerks-Kanone nach vorn (mit Kanone) |
| `H` | Hornissenschwarm loslassen (mit Hornissennest) |
| `K` | Mini-Andockdrohne ausklinken / zurückrufen |
| `J` | Wespenschwarm loslassen (mit Wespennest) |
| `Y` | Katze miauen lassen (mit Katze im Tragegurt) |
| `L` | Scheinwerfer an/aus (mit Scheinwerfer) |
| `T` | Return-to-Home starten / abbrechen |
| `,` / `.` | Kamera nach unten / oben neigen |
| `R` | Zurücksetzen |
| `1`–`4` | Windstärke |
| `Esc` | Menü |

**Gamepad:** Wird automatisch erkannt – linker Stick Gas/Yaw, rechter Stick Nick/Roll (Mode 2).

**Touch:** Zwei virtuelle Sticks (links Gas/Yaw, rechts Nick/Roll) plus Buttons – voll spielbar auf dem Smartphone.

## Technik

Alles in `index.html`: eigener WebGL-Renderer (ohne Three.js o. Ä.), Physik-Engine, Flight Controller, prozedurale Landschaft, HUD und Motorsound (WebAudio). Keine externen Ressourcen – funktioniert auch offline.

## Lizenz

[Apache 2.0](LICENSE)
