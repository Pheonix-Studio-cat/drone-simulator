# Mehrspieler-Weiche

Ein winziger Cloudflare Worker, der Räume verwaltet und Nachrichten
weiterleitet. **Mehr macht er nicht** – die Physik rechnet jeder Spieler
selbst, genau wie im lokalen Zwei-Fenster-Modus.

Ohne diesen Server funktioniert der Simulator vollständig weiter; der
Mehrspieler fällt dann auf **„gleiches Gerät"** zurück (zwei Fenster
desselben Browsers).

## Einmal einrichten

Du brauchst ein kostenloses Cloudflare-Konto. Sonst nichts.

```bash
cd server
npx wrangler login      # öffnet den Browser, einmal bestätigen
npx wrangler deploy
```

Am Ende steht eine Adresse in der Form

```
https://drone-sim-rooms.DEIN-NAME.workers.dev
```

Die trägst du in `index.html` in **eine einzige Zeile** ein – suche nach
`MP_SERVER`:

```js
const MP_SERVER='';   // <- hier die workers.dev-Adresse hinein
```

Fertig. Wer die Seite aufruft, kann ab dann einen Raumcode eingeben und
mit anderen zusammen fliegen.

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

## Was der Server absichtlich nicht tut

- **Keine Spiellogik, keine Autorität.** Torzeiten kommen von den Spielern
  selbst. Wer schummeln will, kann das – das ist ein Spiel unter Freunden,
  kein Wettkampfsystem.
- **Nichts speichern.** Es gibt keine Datenbank, keine Konten, keine Logs
  von Spielinhalten. Ein Raum existiert, solange jemand drin ist.
- **Nicht mitlesen.** Nachrichten werden unverändert weitergereicht.

Ein Raum ist nur über seinen Code erreichbar. Wer den Code nicht kennt,
kommt nicht hinein.
