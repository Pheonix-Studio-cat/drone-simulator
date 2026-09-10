# Prüfungen

Playwright-Suiten gegen die gebaute `index.html`. Jede Suite gibt Zeilen aus,
die mit `PASS ` oder `FAIL ` beginnen; `run.sh` zählt sie zusammen.

```
bash tests/run.sh              # alle
bash tests/run.sh motor kalt   # nur test_motor.js und test_kalt.js
```

Playwright wird beim ersten Lauf installiert. Chromium liegt schon unter
`/opt/pw-browsers/chromium` — **nicht** `playwright install` aufrufen.

## Warum diese Dateien im Repository liegen

Weil sie einmal nicht darin lagen. 26 Suiten mit 958 Prüfungen lagen im
flüchtigen Arbeitsverzeichnis der Sitzung; ein Container-Neustart hat sie
gelöscht, und nur drei waren zurückzuholen.

Dass sie hier liegen, heisst auch, dass sie über GitHub Pages mit ausgeliefert
werden (`pages.yml` lädt `path: .`). Das ist harmlos — reiner Text, den
niemand abruft — und war den Verlust nicht wert.

**Was eine Stunde Arbeit gekostet hat, wird committet, bevor die nächste
Stunde beginnt.**

## Die Suiten

| Datei | Was sie prüft |
| --- | --- |
| `test_vrs.js` | Wirbelringstadium: Abwindgeschwindigkeit gegen die Strahltheorie, Gefahrenzone nach beiden Seiten, Fahrt als Ausweg, Bodennähe, Schubverlust, Kippeln |
| `test_pw.js` | Prop-Wash: Aufbau und Abklingen, Fahrt, Ducts, Bauart, der Regelfehler als Messgrösse, Stabilität der Rückkopplung |
| `test_kalt.js` | Akku in der Kälte: Temperaturkette, Kennlinie, kalter Start, Eigenerwärmung, gezählte Flugzeit, tiefere Sackung |
| `test_motor.js` | Motorwärme: Erwärmung über der Zeit, Fahrtwind, Ducts, Umgebung, Schubverlust und Rückkehr, Kupferaufschlag |

## Zwei Fallen, die hier schon Geld gekostet haben

**`T.start` setzt nur zurück, wenn sich die Konfiguration ändert.** Wer
dieselbe Drohne auf derselben Karte neu startet, erbt Ladestand, Temperatur
und Lage vom vorherigen Prüfblock. Im Prüfstand deshalb immer ein Umweg:

```js
T.start(drohne, 'free', karte === 'city' ? 'flat' : 'city');
T.start(drohne, 'free', karte);
```

**Eine grüne Prüfung ist kein Beweis.** Zwei Prüfungen in diesem Ordner waren
grün und haben nichts gezeigt — eine wegen `|| true`, eine, weil sie die
kommandierte Drehung mass statt des Effekts. Frage vor jeder neuen Prüfung:
*Wäre sie auch grün, wenn ich nichts gebaut hätte?* Wenn die Antwort ja ist,
misst sie das Falsche.
