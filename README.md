# Drohnen-Simulator

Ein realistischer Drohnen-Simulator in **einer einzigen Datei** – ohne Installation, ohne Abhängigkeiten.

### ▶️ [Direkt im Browser spielen](https://pheonix-studio-cat.github.io/drone-simulator/)

Alternativ einfach [`index.html`](index.html) herunterladen und im Browser öffnen. Läuft auf Desktop, Tablet und Smartphone.

## Features

### Realistische Flugphysik
- 6-Freiheitsgrade-Starrkörpersimulation mit 500 Hz Physik-Takt
- Motormodell mit Anlaufverzögerung, Schub ∝ Drehzahl², Motor-Mixer wie bei echten Flight Controllern
- Aerodynamik: geschwindigkeitsabhängiger Luftwiderstand, Bodeneffekt, Wind mit Böen und Turbulenz (4 Stufen)
- **Wirbelringstadium** beim schnellen Sinkflug und **Prop-Wash** nach harten Figuren – siehe unten
- Batteriemodell: Kapazität, Spannungssackung unter Last, nachlassender Schub bei leerem Akku
- Crash-Erkennung mit harten/sanften Landungen

### 🌀 Wirbelring: wenn sie in den eigenen Abwind sackt

Sinkt ein Drehflügler etwa so schnell, wie seine Rotoren die Luft nach unten beschleunigen, holt er seinen eigenen Abwind wieder ein. Um die Rotoren legt sich ein Ring aus umlaufender Luft, die Blätter arbeiten in ihrer eigenen Turbulenz statt in ruhiger Luft – der Schub bricht ein, das Gerät kippelt, und **mehr Gas macht es schlimmer**. Herauskommen kannst du nur, indem du nach vorn fliegst.

Der Simulator rechnet das aus der Strahltheorie, nicht aus einer Tabelle. Die Abwindgeschwindigkeit ist

> vi = √( G / (2 · ρ · A) )

mit dem Gewicht G, der Luftdichte ρ in der aktuellen Höhe und der gesamten Rotorkreisfläche A. Gefährlich wird es, wenn die Sinkrate in der Grössenordnung von vi liegt.

Gemessen im Simulator (Rennquad, 5 Zoll):

| Zustand | Sinkrate | Ring |
|---|---|---|
| Schweben | 0 m/s | 0,00 |
| Gemächlich sinken | 1,1 m/s | 0,04 |
| **Im Wirbelring** | **7,2 m/s** | **0,99** |
| Sturzflug | 19 m/s | 0,00 |
| 7,2 m/s sinken, 6 m/s vorwärts | – | 0,00 |

Im Ring bleiben bei gleichem Gasweg nur **66 % vom Schub** übrig, und die Drehrate steigt von 0,03 auf **0,72 rad/s** – das sichtbare Kippeln. Das HUD sagt einmal an, was los ist und wie man herauskommt.

Zwei Dinge lösen ihn nicht aus, beide absichtlich: **dicht über dem Boden** strömt die Luft seitlich ab statt sich oben wieder anzusaugen (das Mass ist der Rotor, nicht der Meter – rund vier Durchmesser über Grund), und im **Sturzflug** strömt sie wieder glatt von unten durch. Er baut sich mit 0,45 s Zeitkonstante auf und verschwindet ebenso wieder.

Nicht die Masse entscheidet, sondern die Flächenbelastung: Die 4-kg-Cine hat mit ihren grossen Scheiben den **ruhigeren** Abwind (6,0 m/s) als das 0,65-kg-Rennquad (7,2 m/s) – und gerät deshalb erst später in den Ring.

### 💨 Prop-Wash: das Schütteln nach der Figur

Der kleine Bruder des Wirbelrings, und der Grund, warum sich in echten Aufnahmen nach jeder harten Figur das Bild kurz schüttelt: Die Drohne wirft beim Drehen und Sinken Wirbel in die Luft und fliegt gleich darauf selbst wieder hindurch. Die Blätter treffen für einen Moment ungleichmässig angeströmte Luft, der Regler kommt nicht mehr ganz nach.

Anders als der Wirbelring ist das **kein Zustand, sondern ein Nachlauf** – er ist nach etwa anderthalb Sekunden wieder weg und bringt niemanden zum Absturz. Deshalb auch keine Warnung im HUD: er gehört zum Fliegen dazu.

Gemessen (Rennquad, 5 Zoll):

| Was du tust | Prop-Wash |
|---|---|
| Ruhig geradeaus | 0,00 |
| **Scharfe Rolle im Stand** | **0,54** |
| Dieselbe Rolle, 4,5 m/s Fahrt | 0,27 |
| Dieselbe Rolle, 9 m/s Fahrt | 0,00 |
| Langsam sinken (2,5 m/s) | 0,46 |
| 0,5 s nach der Figur | 0,30 |
| 1,5 s nach der Figur | 0,05 |

Der Regler verfehlt darin seinen eigenen Sollwert um **0,53 rad/s statt 0,11** – spürbar, aber nicht reissend. Was hilft: **Fahrt**, genau wie beim Wirbelring. Was ihn dämpft: **Ducts** (die Cinewhoop kommt auf 0,16 statt 0,54, weil der Kanal den Abwind führt) und eine **ruhige Bauart** (die Kameradrohne bleibt bei 0,15 rad/s Abweichung).

### 4 Flugmodi (je nach Modell)
| Modus | Verhalten |
|---|---|
| **GPS** | Hält Position und Höhe von selbst, Sticks steuern die Geschwindigkeit |
| **ATTI** | Hält die Höhe, driftet aber mit dem Wind |
| **ANGLE** | Selbstaufrichtend mit Neigungsbegrenzung, Gas manuell |
| **ACRO** | Volle manuelle Raten-Steuerung wie im FPV-Racing |

### 15 Drohnenmodelle
Von der winzigen Tiny-Whoop-Klasse (**Typhoon20**) über die 249-g-Ultraleichtdrohne und klassische/professionelle Kameradrohnen bis zu Cinewhoop, 5-Zoll-Racer und zwei Marsfluggeräten – jedes Modell mit eigenen, realen Vorbildern nachempfundenen Kennwerten. Die Modelle sind zudem **unterschiedlich stabil**: leichte, agile Drohnen (Whoops, Micros) tanzen im Wind spürbar, schwere Kameraplattformen liegen wie festgenagelt in der Luft.

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

### 🔴 Mars · Jezero-Krater
Eine Karte auf einem anderen Himmelskörper – und die Physik ändert sich wirklich mit:

| Grösse | Erde | Mars |
|---|---|---|
| Schwerkraft | 9,81 m/s² | **3,721 m/s²** |
| Luftdichte am Boden | 1,225 kg/m³ | **0,020 kg/m³** (1,6 %) |
| Skalenhöhe der Atmosphäre | 8,5 km | **11,1 km** |
| Satellitennavigation | ja | **nein** |

Gemessen im Simulator: ein Fall aus 10 m dauert auf der Erde **1,46 s**, auf dem Mars **2,38 s** (theoretisch 1,43 und 2,32 s).

**Eine normale Drohne hebt dort nicht ab.** Sie bekommt in 1,6 % Luftdichte auch nur 1,6 % ihres Schubs – gemessen **0,30 N gegen 3,3 N Eigengewicht**. Dafür gibt es zwei marstaugliche Fluggeräte mit riesigen Rotoren (1,2 m und 2,4 m Durchmesser), die genau dort schweben, wo alles andere liegen bleibt. Umgekehrt tut sich der Marshubschrauber auf der Erde schwer: dreimal so viel Gewicht, und mehr Luft bringt ihm nichts, weil sein Motordrehmoment begrenzt.

**Du kannst dich dabei nicht verrennen:** Wählst du die Marskarte, stellt der Simulator die Drohne gleich auf eine um, die dort fliegt – und umgekehrt. Ungeeignete Modelle stehen ausgegraut in der Liste, mit Angabe, wie viel Schub ihnen fehlt. Startest du trotzdem eine, die es nicht schafft, sagt das HUD dauerhaft warum.

**Kein GPS**: Auf dem Mars gibt es keine Navigationssatelliten. Der GPS-Modus verschwindet aus der Liste, Return-to-Home sagt klar, warum es nicht geht – geflogen wird in ATTI und ANGLE.

Dazu ein **Staubsturm** als neue Wetterlage: nimmt vor allem die Sicht. Marswind ist schnell, aber kraftlos – die Kraft geht mit der Luftdichte, und die ist fast nicht da.

**Marsrotoren im Editor**, in vier echten und drei erfundenen Grössen. Die vier echten (0,6 m bis 2,4 m) rechnen ernst: die Masse kommt vom Rotor, nicht vom Rahmen, und der Schub aus der Kreisfläche. Die drei Mini-Formate (**8 cm, 16 cm, 30 cm**) heissen im Katalog offen „Spass" – so kleine Scheiben tragen in 0,02 kg/m³ Luft in Wirklichkeit gar nichts. Für sie ist die Luftdichte abgeschaltet, damit man auf dem Mars auch im Whoop-Format herumkurven kann. Marsgeräte bleiben sie trotzdem: ihr Schub ist auf 3,7 m/s² ausgelegt, auf der Erde bleiben davon gemessen nur **0,9–1,1×** statt 2,4–2,8× auf dem Mars.

**Zur Ehrlichkeit:** Die acht Erdkarten stammen aus echten Höhendaten. Das Marsgelände ist dagegen **nachempfunden**, nicht aus Messdaten gebacken – die Geländeform folgt dem Jezero-Krater (Deltafront, Streukrater nach der üblichen Grössenverteilung, Blockfelder, Windrippel), weil die Bauumgebung die NASA- und USGS-Server nicht erreicht. Echt ist die Physik, nicht die Topografie.

### 6 erfundene Karten mit prozeduralem Terrain
- 🌳 **Standard** – Wiesen, Wälder, sanfte Hügel
- 🏚️ **Lostplace** – verlassenes Industriegelände mit 60-m-Schornstein, offener Halle und Bürogerippe (perfekt für FPV-Dives)
- 🧊 **Antarktis** – Eiswüste mit Forschungsstation
- 🏔️ **Berge & Seen** – alpine Gipfel mit Schneegrenze und Bergseen (Wasserlandung = Totalverlust!)
- 🌾 **Flachland** – Felder, Windräder, Bauernhof und eine Hochspannungstrasse
- 🏙️ **Großstadt** – Hochhaus-Schluchten, Straßen mit fahrenden Autos und viele Fußgänger

Auf allen Karten laufen Menschen herum – wer sie anfliegt, crasht. Alle Karten sind prozedural generiert und komplett offline.

**Waffen sind tödlich, ein Zusammenstoss nicht.** Bomben, die Feuerwerkskanone, tief zerplatzende Leuchtkugeln und die Atomrakete können Menschen treffen – im Sprengradius tödlich, im Ring darum rennen sie davon. Ein blosser Zusammenstoss mit der Drohne verletzt dagegen nur: die Person rennt weg, die Drohne ist hin. Getroffene bleiben liegen, bis du zurücksetzt (`R`); gezählt werden sie im Flugbuch. Dargestellt wird das bewusst nüchtern – die Figur kippt um, kein Blut, keine Einzelteile –, und ein Abzeichen gibt es dafür ausdrücklich nicht.

### Tiny Whoop: klein sein hat Folgen
Der **Typhoon20** (50 g, 2S 300 mAh) fliegt nicht einfach wie eine kleinere große Drohne – die Größe ändert die Physik:

| Was | Wirkung |
|---|---|
| **Akku-Innenwiderstand** | Ein 300-mAh-Pack hat rund **60 mΩ** pro Zelle, ein 6S-Rennakku nur **2,4 mΩ**. Beim Vollgasstoß bricht die Spannung des Whoops um **0,50 V pro Zelle** ein, die einer großen Kameradrohne um **0,02 V**. Genau das ist das „Absacken" beim Punch-out. |
| **Luftkanäle** | Der Kanalrand bremst (Luftwiderstand ×2,2) und der Schub fällt mit der Fahrt: **0,89 N** im Schweben, **0,74 N** bei 12 m/s. Ummantelte Rotoren sind Stand-, keine Reiseflug-Antriebe. |
| **Bodeneffekt** | Der Kanal staut die Luft zusätzlich: dicht über dem Boden trägt der Whoop **13 %** mehr, ein offener Propeller nur **7 %**. Whoops saugen sich beim Landen fest. |
| **Propellerschutz** | Der Whoop verträgt einen Anstoß mit **13,2 m/s**, ein 5-Zoll-Racer nur **2,2 m/s**, ein schweres Kinorig **1,9 m/s** – die Aufprallenergie geht mit Masse mal Geschwindigkeit im Quadrat. Mit 6 m/s gegen eine Wand prallt der Whoop ab, der Racer zerlegt sich. |

Der Baukasten kann jetzt auch wirklich einen Whoop bauen: **Micro-Motoren** (4 g statt 14 g), **Whoop-Propeller** (40 mm) und ein **300-mAh-Pack**. Der Prompt „klein" oder „indoor" baut damit **75 g** statt vorher 226 g.

### Crash, Trümmer & Bergung
Bei einem Absturz zerlegt sich die Drohne in Einzelteile (Propeller, Arme, Akku, Rumpf), die physikalisch korrekt durch die Gegend fliegen. Das Wrack bleibt liegen – und kann mit einer **Bergungsdrohne** (Taste `B`) abgeholt werden: hinfliegen, 2 s darüber hovern, zurücktragen. Das Wrack am Haken verändert die Flugphysik spürbar.

### Foto-Modus
Foto-Button 📷 (Taste `F`): Schnappschüsse landen in einer **Galerie** im Menü (mit Download). Die Foto-Mission speichert ihre Bilder ebenfalls dort.

### 🔧 DIY-Drohnen-Editor

**🚀 Mars-Rotoren, vier Größen.** Im Teilekatalog stehen unter Propeller vier Rotoren für dünne Luft: **0,6 m · 1,2 m · 1,8 m · 2,4 m** Durchmesser. Wer einen davon einbaut, baut ein Marsfluggerät – die Ausleger wachsen mit (Rotorkreise dürfen sich nicht überlappen), GPS fällt weg, und gerechnet wird nach Rotorfläche statt nach Motorleistung. In 1,6 % Luftdichte hilft kein stärkerer Motor, nur Fläche.

Die Zellenmasse hängt am Rotor und ersetzt Rahmen, Motoren und Propeller: ein 1,8-m-Rotor an einem 18-Gramm-Whoop-Rahmen ist kein leichtes Marsfluggerät, sondern gar keins. Geeicht an den beiden eingebauten Marsfluggeräten (1,2 m → 1,8 kg, 2,4 m → 20 kg).

Gemessen über **alle 1600 Kombinationen** aus Rahmen, Motor, Rotor und Akku: Jede einzelne hebt auf dem Mars ab, die schwächste mit **1,08-fachem** Schub – es gibt also keine Sackgasse. Auf der Erde bleibt so ein Aufbau weit zäher als normale Props (**1,1× gegen 2,6×**). Dass die grossen Rotoren auf der Erde überhaupt fliegen, ist kein Fehler: 3,4 kg an 1,8-m-Rotoren heben hier tatsächlich ab.
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

### 👥 Mehrspieler – ohne Raumcode
Zwei Knöpfe, sonst nichts:

- **🌐 Online:** Antippen und drin sein. Du landest automatisch bei allen, die gerade **dieselbe Karte** fliegen – wechselst du die Karte, wechselst du mit. Es gibt nichts einzugeben und nichts abzusprechen.
- **🔒 Privat:** Ein eigener Raum, den nur erreicht, wem du den Link schickst („🔗 Link kopieren"). Der Code steckt im Link und wird nirgends angezeigt.

Im Flug: **`Q`** oder der **💬**-Knopf öffnet den Chat, **`Z`** startet ein gemeinsames Rennen mit Countdown und Live-Rangliste im HUD. Weil sich im Flug schlecht tippt, gibt es sechs Kurzmeldungen zum Antippen.

**Du siehst, was die anderen fliegen.** Über jedem Mitspieler steht sein Name und sein Drohnenmodell, und gezeichnet wird wirklich sein Modell – auch versteckte Bauten, die du selbst noch nicht gefunden hast (freigeschaltet wird dadurch nichts, dein Menü bleibt unverändert). Fliegt jemand eine **selbstgebaute** Drohne, schickt er alle vier Sekunden seinen Bauplan mit, und dein Gerät baut daraus dasselbe Modell – rund 150 Bytes, gespeichert wird nichts.

**Wie das ohne Absprache funktioniert:** Der Raumname wird aus der Karten-Kennung gerechnet (`P` + fünf Zeichen aus einem FNV-1a-Hash + ein Zeichen für den Ausweichraum). Zwei Browser kommen bei derselben Karte zwangsläufig auf denselben Namen – dafür braucht es keinen Lobby-Server und keine Anmeldung. Wird ein Raum voll (16 Piloten), schickt der Server mit dem Schliesscode `4001` in den nächsten von acht Ausweichräumen weiter; **bis zu 128 Piloten pro Karte**, und der Spieler merkt davon nichts.

Der private Code ist acht Zeichen aus einem Alphabet von 32, also **40 Bit** – zum Durchprobieren von aussen zu viel.

**Ein Spielstand, ein Update.** Der Mehrspieler ist ein Schalter in derselben `index.html` auf derselben Adresse – keine zweite Version. Damit sind gespeicherte Drohnen, Abzeichen, Fotos und Bestzeiten automatisch dieselben, und ein Update erreicht beide Spielarten gleichzeitig.

### 👤 Konto, Vertrauenscodes, Admin

**Ein Konto ist hier nur ein Name.** Anzeigename und Benutzername, sonst nichts – kein Alter, keine E-Mail, kein Passwort. Der Server erzeugt dazu eine Kennung und unterschreibt sie (HMAC-SHA256); gespeichert wird dafür **nichts**, die Unterschrift trägt sich selbst und jeder Raum kann sie allein prüfen.

**Ehrlich dazugesagt:** Das ist kein Login. Wer dein Gerät benutzt, ist du. Für ein Spiel unter Freunden reicht es, mehr wird nicht versprochen. Es gibt einen Knopf, der das Konto vom Gerät löscht.

**Deine Kennung ist dein Vertrauenscode.** Im Online-Modus siehst du alle fliegen und kannst mit allen Rennen fahren – **schreiben kann dir nur, wessen Code du eingetragen hast.** Das gilt in die Richtung, in die du das Vertrauen gegeben hast, und Zurücknehmen wirkt sofort.

Entscheidend: **Diese Regel liegt im Server, nicht im Browser.** Eine Nachricht von jemandem, dem du nicht vertraust, wird gar nicht erst weitergereicht – sie wird nicht etwa angezeigt und dann versteckt. Wer eine eigene Fassung des Spiels baut (der Quelltext ist öffentlich), ändert daran nichts, denn er redet weiterhin mit diesem Server. Was er tun kann: einen eigenen Server aufsetzen – dann ist das seine Welt, nicht diese.

**Admin.** Wer den Admin-Code einlöst, darf für alle im Raum die **Karte, das Wetter und die Tageszeit** setzen, den **Raum sperren** und **Spieler rauswerfen**. Der Code ist ein Cloudflare-Geheimnis, steht also in keiner Datei und in keinem Repository, und er lässt sich **genau einmal** einlösen – danach ist er verbraucht, auch in einem anderen Raum.

Einrichten (im Cloudflare-Dashboard, geht auch am Tablet): *Workers und Pages → drone-sim-rooms → Einstellungen → Variablen → Verschlüsselte Variable hinzufügen*, Name `ADMIN_CODE`.

Damit bekommt der Server zum ersten Mal Spiellogik – bewusst, denn ohne das gäbe es keine durchsetzbaren Rechte. Über den **Flug** hat er weiterhin keine Autorität: Physik und Torzeiten kommen von den Spielern.

#### Der Server dazu
Dahinter steht ein winziger **Cloudflare Worker** (`server/`, rund 90 Zeilen), der bereits läuft. Er ist über *Workers Builds* mit diesem Repository verbunden: Jeder Push auf `main`, der `server/` berührt, deployt ihn neu – ohne Terminal, das geht auch vom Tablet aus. Wie man ihn von Grund auf einrichtet, steht in [`server/README.md`](server/README.md).

Ist der Server einmal nicht erreichbar, fällt der Mehrspieler von selbst auf **zwei Fenster desselben Browsers** zurück und sagt es im Menü – kaputt geht dabei nichts.

**Kostenlos**, im Gratisrahmen von Cloudflare: 100 000 Anfragen pro Tag, eingehende WebSocket-Nachrichten zählen 20:1, ausgehende sind frei, und dank Hibernation kostet ein leerer Raum keine Rechenzeit. Gemessen sendet ein Spieler **145 Bytes pro Pose bei 20 Hz, also rund 2,8 kB/s**.

**Was der Server nicht tut:** Er hat keine Spiellogik und keine Autorität – jeder rechnet seine eigene Physik, Torzeiten kommen von den Spielern selbst. Schummeln ist damit technisch möglich; das ist ein Spiel unter Freunden, kein Wettkampfsystem. Gespeichert wird nichts, ein Raum existiert nur, solange jemand drin ist, und wer den Code nicht kennt, kommt nicht hinein. Details in [`server/README.md`](server/README.md).

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

### 🏅 Abzeichen, Flugbuch und Geisterrennen
**20 Abzeichen** zum Freispielen – von „Fliege 200 km/h" über „Landung bei Sturm", „10 Objekte mit einem Kanonenschuss", „Fremde Drohne mit dem Hornissenschwarm holen" bis „Jedes Easter Egg freischalten". Im Menü stehen alle im Raster: gefundene farbig, offene grau mit ihrem Hinweis – man weiß also immer, was noch zu holen ist.

**Flugbuch:** Gesamtflugzeit, Strecke, Starts, Abstürze, Topspeed, höchste Höhe – und eine Tabelle pro Drohne. Bleibt im Browser gespeichert.

**👻 Geisterrennen:** Fliegst du auf einer Karte eine neue Bestzeit, wird die Bahn dazu mitgespeichert (20 Hz, rund 200 Zeichen pro Flugsekunde). Beim nächsten Rennen fliegt dein eigener Bestlauf als halbtransparente Drohne mit, und das HUD sagt dir, ob du vorn oder hinten liegst.

### 🎓 Flugschule
Vier kurze Lektionen als eigene Missionen, jede mit Note (1–6) und gespeichertem Bestwert:

1. **Schweben** – 30 s auf 10 m Höhe halten; die Note kommt aus der mittleren Abweichung
2. **Achter fliegen** – zwei Runden über vier Punkte, sauber und ohne Bodenkontakt
3. **Punktlandung** – 60 m wegfliegen, zurückkommen und mittig sanft aufsetzen
4. **Rückwärtsanflug** – 50 m rückwärts, ohne die Nase zu drehen

Wer alle vier besteht, bekommt den 🎓 **Flugschein** als Abzeichen.

### 🐄 Leben in der Landschaft
**Tiere:** Auf Wiese, Flachland und in den Bergen weiden Kühe, Rehe und Hunde und ziehen ihre Bahnen. Sie erschrecken vor Explosionen, vor der Katze und vor Wespen – und beruhigen sich danach wieder. In der Eiswüste und in der Innenstadt gibt es keine.

**🐦 Vögel:** Alle paar Minuten kreist irgendwo ein Schwarm. Bleibst du **über 40 m**, lassen sie dich in Ruhe. Kommst du tief in ihr Revier, greifen sie an – vier Treffer und die Drohne geht runter. Ein Wespen- oder Hornissenschwarm vertreibt sie wieder.

**⚡ Stromleitungen:** Über das Flachland spannt sich eine Hochspannungstrasse, und im Map-Builder gibt es den **Strommast** als Werkzeug. Die durchhängenden Leitungen sind gegen den Himmel kaum zu sehen und haben eine eigene Kollisionsprüfung: Abstand des Punktes zur Strecke entlang der Kettenlinie, nicht der grobe Zylinder der übrigen Hindernisse. Langsam heranschweben schiebt dich weg – mit Tempo hineinfliegen bedeutet Absturz. Die klassische Drohnenfalle.

**🚗 Verkehr:** In der Großstadt fahren Autos über das Straßenraster, in beide Richtungen und auf ihren Spuren. Auf den **echten Karten gibt es keinen Verkehr** – in den Geodaten sind Gebäude und Gelände eingebacken, aber keine Straßenverläufe.

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

`Shift` gedrückt halten steuert fein – der Knüppel geht dann nur bis 40 % Ausschlag.

**Gamepad / RC-Sender:** Wird automatisch erkannt. Ohne Kalibrierung gilt die übliche Belegung (Achsen 0–3); echte RC-Sender am USB-Adapter liegen meist anders und lassen sich im Menü kalibrieren.

**Touch:** Zwei virtuelle Sticks plus Buttons – voll spielbar auf dem Smartphone. Wahlweise fest in den Ecken (blind zuverlässiger zu treffen) oder schwebend unter dem Finger.

### Steuerung einstellen

Im Menü unter **🎮 Steuerung einstellen**; alles wirkt sofort und wird unter `ds_ctrl` gespeichert.

**Drei Knöpfe reichen.** Ganz oben stehen **Einfach · Normal · Voll realistisch**, und damit ist man fertig – der Rest liegt zugeklappt hinter *Mehr einstellen*. Was die Voreinstellungen unterscheiden, sind genau die vier Dinge, die den Unterschied ausmachen:

| | Verzögerung | Gas-Expo | Totzone | Tastatur-Anstieg |
|---|---|---|---|---|
| **Einfach** | 0 ms | 0,50 | 6 % | langsam |
| **Normal** | 28 ms | 0,35 | 4 % | mittel |
| **Voll realistisch** | 60 ms | 0,15 | 0 % | schnell |

Gemessen: drei Sekunden Vollgas aus dem Stand ergeben **21 m** mit *Einfach*, **84 m** mit *Normal* und **149 m** mit *Voll realistisch*. Wer von Hand etwas verstellt, sieht das oben ausdrücklich – dann ist keine Voreinstellung mehr aktiv.

| Einstellung | Was sie tut |
|---|---|
| **Mode 1–4** | Knüppelbelegung. Gilt für Gamepad, Touch und Tastatur gleichermaßen. Mode 2 ist im deutschsprachigen Raum am verbreitetsten. |
| **Ratenkurve** | Entweder aus dem Drohnenmodell abgeleitet oder eigene Betaflight-Werte (rcRate, superRate, expo) pro Achse. |
| **Gaskurve** | Expo um den Schwebepunkt. Enden und Mitte bleiben fix. |
| **Totzone, Trimmung, Umkehr** | Pro Achse. Hinter der Totzone wird der Rest des Wegs wieder auf voll gestreckt, statt oben abzuschneiden. |
| **Übertragung** | Verzögerung von Funke, Empfänger und Flugregler, 0–120 ms. |
| **Tastatur** | Wie schnell die Knüppel auf Tastendruck auf- und zurücklaufen. |
| **Touch-Sticks** | Fest oder schwebend, Größe. |
| **Gamepad** | Kalibrier-Assistent für Achsnummer, Richtung, Mitte und Endausschläge. |

**Die Ratenkurve ist echt** – dieselbe Formel wie in Betaflight: `expo` verflacht die Mitte, `superRate` zieht die Enden hoch. Bei Empfindlichkeit **Schnell** ergibt voller Ausschlag genau die Höchstrate des Modells, halber Ausschlag aber nur **22 %** davon. Die Vorschau im Menü zeigt, was bei der eingestellten Empfindlichkeit **tatsächlich** ankommt, und die gestrichelte Linie daneben, was ohne diese Bremse möglich wäre:

| Empfindlichkeit | Rollrate der Pocket Mini bei vollem Ausschlag |
|---|---|
| Langsam | 53 °/s |
| Normal | 150 °/s |
| Schnell | 400 °/s (= Katalogwert) |

**Die Verzögerung ist spürbar, nicht kosmetisch.** Gemessen an einer Race 5 Zoll in ACRO – Drehrate 60 ms nach einem vollen Rollausschlag aus der Ruhe:

| Verzögerung | Drehrate nach 60 ms |
|---|---|
| 0 ms | 318 °/s |
| 28 ms (Standard) | 134 °/s |
| 90 ms | 13 °/s |

Voreingestellt sind **28 ms** – das entspricht einer guten realen Anlage. 60–90 ms sind eine träge, 0 ms ist unrealistisch, aber für den Einstieg leichter.

Eine Drohne erreicht ihre befohlene Rate übrigens nicht immer: eine Race 5 Zoll bekommt bei vollem Ausschlag 862 °/s befohlen und dreht tatsächlich 651 °/s. Das ist keine Schummelei, sondern die Drehmoment- und Dämpfungsgrenze – echte Quads verhalten sich bei wenig Gas genauso.

Auf der Tastatur laufen die Knüppel in **0,22 s** von der Mitte auf vollen Ausschlag; Tasten kennen ja nur an und aus.

## Technik

Alles in `index.html`: eigener WebGL-Renderer (ohne Three.js o. Ä.), Physik-Engine, Flight Controller, prozedurale Landschaft, HUD und Motorsound (WebAudio). Keine externen Ressourcen – funktioniert auch offline.

## Lizenz

[Apache 2.0](LICENSE)
