# Mehrspieler-Weiche

Ein winziger Cloudflare Worker, der Räume verwaltet und Nachrichten
weiterleitet. **Mehr macht er nicht** – die Physik rechnet jeder Spieler
selbst, genau wie im lokalen Zwei-Fenster-Modus.

Ohne diesen Server funktioniert der Simulator vollständig weiter; der
Mehrspieler fällt dann auf **„gleiches Gerät"** zurück (zwei Fenster
desselben Browsers).

## Einmal einrichten – ohne Terminal, geht auch am Tablet

Du brauchst ein kostenloses Cloudflare-Konto. Sonst nichts. Cloudflare
holt sich den Code selbst aus GitHub, du klickst nur:

1. **dash.cloudflare.com** öffnen und anmelden
2. Links **Workers und Pages** → oben rechts **Anwendung erstellen**
3. **Repository importieren** wählen und dieses Repository verbinden
4. **Projektname**: `drone-sim-rooms` (muss zum `name` in `wrangler.toml` passen)
5. **Build-Befehl**: leer lassen · **Bereitstellungsbefehl**: `npx wrangler deploy`
6. Unter **Erweiterte Einstellungen** den **Pfad** auf `server` setzen –
   sonst sucht Cloudflare im Hauptverzeichnis und findet die Konfiguration nicht
7. **Bereitstellen**

Von da an deployt jeder Push auf `main`, der `server/` berührt, von selbst.

Gegenprobe: `https://drone-sim-rooms.DEIN-NAME.workers.dev/health` muss
`ok` antworten.

Die Adresse trägst du in `index.html` in **eine einzige Zeile** ein –
suche nach `MP_SERVER`:

```js
let MP_SERVER='https://drone-sim-rooms.DEIN-NAME.workers.dev';
```

Fertig. Wer die Seite aufruft, tippt auf **🌐 Online** und ist bei allen,
die gerade dieselbe Karte fliegen – ohne Code, ohne Absprache.

### Falls du an einem Rechner sitzt

Dann geht es auch direkt:

```bash
cd server
npx wrangler login      # öffnet den Browser, einmal bestätigen
npx wrangler deploy
```

## Kostet das etwas?

Nein, im Gratisrahmen:

| Grenze (Workers Free) | Verbrauch hier |
|---|---|
| 100 000 Anfragen pro Tag | eine pro Verbindungsaufbau |
| eingehende WebSocket-Nachrichten zählen 20:1 | 20 Posen/s werden zu 1 Anfrage/s gerechnet |
| ausgehende Nachrichten | kostenlos |
| Rechenzeit im Leerlauf | keine, dank Hibernation-API |

Eine Stunde zu viert kostet damit gut 3600 gerechnete Anfragen – weit
innerhalb des Tageslimits.

## Lokal ausprobieren

```bash
cd server
npx wrangler dev
```

Dann in `index.html` `MP_SERVER='http://127.0.0.1:8787'` setzen.

## Was der Server jetzt doch entscheidet

Lange stand hier „keine Spiellogik, keine Autorität". Das gilt für den Flug
weiterhin – nicht mehr für drei Dinge, die sich anders nicht durchsetzen
lassen, solange der Quelltext öffentlich ist und jeder eine eigene Fassung
bauen kann:

1. **Wer bist du.** Ein Konto ist eine Kennung plus eine Unterschrift des
   Servers (HMAC-SHA256). Gespeichert wird dafür nichts; die Unterschrift
   trägt sich selbst, jeder Raum prüft sie allein. Ohne gültige Unterschrift
   ist man Gast: fliegen ja, chatten nein.
2. **Wer darf dir schreiben.** Chatnachrichten gehen nur an Leute, die deinen
   Vertrauenscode eingetragen haben. Gefiltert wird hier im Worker – eine
   nachgebaute Oberfläche ändert daran nichts.
3. **Wer bestimmt im Raum.** Karte, Wetter, Tageszeit, Sperre und Rauswurf
   darf nur der Admin.

### Admin-Code hinterlegen

Im Dashboard: *Workers und Pages → drone-sim-rooms → Einstellungen →
Variablen → Verschlüsselte Variable hinzufügen*, Name `ADMIN_CODE`. Damit
steht er in keiner Datei und in keinem Repository. Einlösen lässt er sich
**genau einmal**; danach ist er verbraucht, auch in einem anderen Raum.

Optional `ACCOUNT_SECRET` als zweites Geheimnis für die Konto-Unterschriften.
Ohne das wird `ADMIN_CODE` dafür mitbenutzt – ändert man den, werden alle
bestehenden Konten ungültig und müssen neu angelegt werden.

### Selbst testen

```bash
bash serve.sh          # frischer Worker, Zustand gelöscht
node test_acct.js      # 23 Prüfungen gegen den echten Server
```

Der Einmal-Code ist absichtlich einmalig: Beim zweiten Lauf ohne frischen
Worker überspringt die Suite den Admin-Teil und sagt das auch.

## Was der Server weiterhin nicht tut

- **Keine Autorität über den Flug.** Torzeiten kommen von den Spielern
  selbst. Wer schummeln will, kann das – das ist ein Spiel unter Freunden,
  kein Wettkampfsystem.
- **Fast nichts speichern.** Gespeichert wird nur, was eine Regel braucht:
  pro Raum die eingestellte Welt, wer Admin ist und wer für zehn Minuten
  draussen bleibt – plus die eine Zeile, dass der Einmal-Code verbraucht ist.
  **Keine Konten** (die Unterschrift trägt sich selbst), keine Namenslisten,
  keine Vertrauenslisten über die Verbindung hinaus, keine Chatverläufe,
  keine Flugdaten.
- **Chat nur weiterreichen, nicht auswerten.** Der Server schaut sich von
  einer Chatnachricht genau eines an: an wen sie gehen darf. Inhalt wird
  nicht gelesen, nicht gespeichert und nicht durchsucht. Posen, Torzeiten
  und Baupläne gehen weiterhin völlig unverändert durch.

Ein Raum ist nur über seinen Namen erreichbar. Die **öffentlichen** Räume
heissen absichtlich berechenbar (`P` + Hash der Karte + Ausweichraum) –
dort sollen sich ja Fremde treffen. Der **private** Code ist acht Zeichen
aus 32, also 40 Bit; wer ihn nicht hat, kommt nicht hinein.

Ist ein Raum voll (16 Piloten), weist der Server nicht ab, sondern nimmt
die Verbindung an, schickt `{"t":"full"}` und schliesst mit Code `4001`.
Daran erkennt das Spiel, dass es den nächsten von acht Ausweichräumen
derselben Karte nehmen soll – macht 128 Piloten pro Karte.
