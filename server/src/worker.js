/* Mehrspieler-Weiche für den Drohnen-Simulator.
 *
 * Der Server war lange bewusst dumm: Räume kennen, Nachrichten weiterreichen,
 * sonst nichts. Das reicht nicht mehr, sobald es Regeln gibt, die auch dann
 * gelten sollen, wenn jemand eine eigene Fassung des Spiels baut – und der
 * Quelltext liegt öffentlich auf GitHub, jeder kann das.
 *
 * Deshalb entscheidet ab jetzt der Server über genau drei Dinge:
 *
 *   1. Wer bist du?  Ein Konto ist eine Kennung plus eine Unterschrift des
 *      Servers darüber (HMAC-SHA256). Ohne gültige Unterschrift bist du
 *      niemand. Gespeichert wird dafür nichts – die Unterschrift trägt sich
 *      selbst, jeder Raum kann sie allein prüfen.
 *   2. Wer darf dir schreiben?  Chatnachrichten gehen nur an Leute, die
 *      deinen Vertrauenscode kennen. Gefiltert wird hier, nicht im Browser.
 *   3. Wer bestimmt im Raum?  Karte, Wetter, Tageszeit, Sperre und Rauswurf
 *      darf nur der Admin. Der Admin-Code ist ein Cloudflare-Geheimnis, steht
 *      also in keiner Datei und in keinem Repository.
 *
 * Alles andere bleibt wie es war: keine Physik, keine Torzeiten, keine
 * Autorität über den Flug. Wer schummeln will, kann das weiterhin – es ist
 * ein Spiel unter Freunden, kein Wettkampfsystem.
 *
 * Läuft im Gratisrahmen von Cloudflare Workers: 100 000 Anfragen pro Tag,
 * eingehende WebSocket-Nachrichten zählen 20:1, ausgehende sind frei. Die
 * Hibernation-API sorgt dafür, dass ein stiller Raum keine Rechenzeit kostet.
 */

const MAX_PER_ROOM = 16;      // reicht für eine Runde unter Freunden
const MAX_MSG = 4096;         // eine Pose ist ~200 Bytes, Chat noch weniger
const MAX_TRUST = 64;         // so viele Freunde darf eine Vertrauensliste haben
const BAN_MS = 10 * 60 * 1000;
const ADMIN_ROOM = '__ADMIN';  // eigener Durable-Object-Name für den Einmal-Code

/* --- Unterschriften: Konten ohne Datenbank ---------------------------------
   Ein Konto ist "id.name.signatur". Die Signatur kann nur der Server
   erzeugen, aber jeder Raum sie prüfen – deshalb braucht es keinen
   gemeinsamen Speicher und keine Anmeldung. Ehrlich gesagt ist das kein
   Login: Wer das Gerät hat, ist du. Für ein Spiel unter Freunden reicht es;
   versprochen wird nicht mehr. */
function secretOf(env) {
  return env.ACCOUNT_SECRET || env.ADMIN_CODE || 'drone-sim-ohne-geheimnis';
}
async function sign(env, data) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secretOf(env)),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return [...new Uint8Array(sig)].slice(0, 12).map(b => b.toString(16).padStart(2, '0')).join('');
}
// Zeitkonstanter Vergleich: sonst verrät die Laufzeit Zeichen für Zeichen,
// wie weit ein geratener Code stimmt.
function sameSecret(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
function cleanId(s) { return String(s || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 16); }
function cleanName(s) { return String(s || '').replace(/[<>"'\\]/g, '').trim().slice(0, 24); }

async function makeAccount(env, name, user) {
  const id = [...crypto.getRandomValues(new Uint8Array(9))]
    .map(b => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 32]).join('');
  const nm = cleanName(name) || 'Pilot';
  const us = cleanName(user) || nm;
  const sig = await sign(env, id + '|' + us);
  return { id, name: nm, user: us, token: id + '.' + us + '.' + sig };
}
async function readToken(env, token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) return null;
  const [id, user, sig] = parts;
  if (!cleanId(id) || id.length < 6) return null;
  const want = await sign(env, id + '|' + user);
  return sameSecret(sig, want) ? { id, user } : null;
}

export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async room() {
    if (!this._room) this._room = (await this.state.storage.get('room')) ||
      { map: '', weather: '', daytime: '', locked: 0, adminId: '', bans: {} };
    return this._room;
  }
  async saveRoom() { await this.state.storage.put('room', this._room); }

  async fetch(request) {
    const url = new URL(request.url);

    /* Einmal-Code: eigener Durable Object unter ADMIN_ROOM. Beim ersten
       Einlösen wird vermerkt, wer ihn hat – danach geht er nicht mehr, auch
       nicht in einem anderen Raum. Genau das war der Wunsch. */
    if (url.pathname === '/claim') {
      const who = cleanId(url.searchParams.get('who'));
      const had = await this.state.storage.get('redeemedBy');
      if (had) return Response.json({ ok: had === who, already: true, by: had });
      if (!who) return Response.json({ ok: false });
      await this.state.storage.put('redeemedBy', who);
      return Response.json({ ok: true, already: false });
    }

    if (request.headers.get('Upgrade') !== 'websocket')
      return new Response('Erwartet einen WebSocket', { status: 426 });

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    const reject = (code, reason, msg) => {
      server.accept();
      try { server.send(msg); } catch (e) {}
      try { server.close(code, reason); } catch (e) {}
      return new Response(null, { status: 101, webSocket: client });
    };

    // Voll: den Socket trotzdem annehmen und sofort mit 4001 schliessen. Ein
    // 503 auf den Upgrade käme im Browser nur als "Verbindung fehlgeschlagen"
    // an – der Spieler wüsste nicht, dass er einfach den nächsten Ausweichraum
    // derselben Karte nehmen soll. Mit dem eigenen Code weiss er es.
    if (this.state.getWebSockets().length >= MAX_PER_ROOM)
      return reject(4001, 'Raum voll', '{"t":"full"}');

    // Konto prüfen. Ohne gültige Unterschrift kommt man rein, gilt aber als
    // Gast: kein Chat, kein Admin. Das hält alte Fassungen des Spiels am
    // Leben, statt sie auszusperren.
    const acc = await readToken(this.env, url.searchParams.get('t'));
    const room = await this.room();

    if (room.locked && (!acc || acc.id !== room.adminId))
      return reject(4003, 'Raum gesperrt', '{"t":"locked"}');
    if (acc && room.bans[acc.id] > Date.now())
      return reject(4004, 'Rausgeworfen', '{"t":"kicked"}');

    this.state.acceptWebSocket(server);
    // Den Herzschlag beantwortet die Laufzeit selbst. Ohne das würde jeder
    // Ping das Objekt wecken und Rechenzeit kosten, obwohl nichts passiert.
    this.state.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('{"t":"ping"}', '{"t":"pong"}'));
    // Was der Server über diesen Socket weiss, hängt am Socket selbst –
    // so überlebt es den Schlaf des Objekts.
    server.serializeAttachment({ id: acc ? acc.id : '', user: acc ? acc.user : '', trust: [] });
    try {
      server.send(JSON.stringify({ t: 'hello', you: acc ? acc.id : '',
        admin: !!(acc && acc.id && acc.id === room.adminId),
        state: { map: room.map, weather: room.weather, daytime: room.daytime, locked: !!room.locked } }));
    } catch (e) {}
    return new Response(null, { status: 101, webSocket: client });
  }

  peers() { return this.state.getWebSockets(); }
  meta(ws) { try { return ws.deserializeAttachment() || {}; } catch (e) { return {}; } }
  setMeta(ws, m) { try { ws.serializeAttachment(m); } catch (e) {} }
  sendTo(ws, o) { try { ws.send(JSON.stringify(o)); } catch (e) {} }
  broadcast(o, except) {
    const s = JSON.stringify(o);
    for (const p of this.peers()) { if (p === except) continue; try { p.send(s); } catch (e) {} }
  }

  async webSocketMessage(ws, data) {
    if (typeof data !== 'string' || data.length > MAX_MSG) return;
    let m = null;
    try { m = JSON.parse(data); } catch (e) { return; }
    if (!m || typeof m !== 'object') return;
    const me = this.meta(ws);

    /* Vertrauensliste: was ich empfangen will. Lügen bringt nichts – man
       müsste den Code des anderen kennen, und der ist das Geheimnis. */
    if (m.t === 'trust') {
      me.trust = Array.isArray(m.ids) ? m.ids.map(cleanId).filter(Boolean).slice(0, MAX_TRUST) : [];
      this.setMeta(ws, me);
      return;
    }

    /* Chat: der Server entscheidet, wer sie bekommt. Genau deshalb liegt die
       Regel hier und nicht im Browser – eine nachgebaute Fassung ändert
       daran nichts. Ohne Konto darf man gar nicht schreiben. */
    if (m.t === 'chat') {
      if (!me.id) { this.sendTo(ws, { t: 'sys', msg: 'Für den Chat brauchst du ein Konto' }); return; }
      const out = JSON.stringify({ t: 'chat', id: me.id, name: m.name, msg: String(m.msg || '').slice(0, 120) });
      for (const p of this.peers()) {
        if (p === ws) continue;
        const o = this.meta(p);
        if (o.trust && o.trust.includes(me.id)) { try { p.send(out); } catch (e) {} }
      }
      // Der Absender erfährt nicht, wer sie nicht bekommen hat.
      return;
    }

    /* Admin-Code einlösen. Verglichen wird gegen das Cloudflare-Geheimnis;
       eingelöst wird genau einmal, global. */
    if (m.t === 'admin') {
      if (!me.id) { this.sendTo(ws, { t: 'sys', msg: 'Erst ein Konto anlegen' }); return; }
      if (!this.env.ADMIN_CODE) { this.sendTo(ws, { t: 'sys', msg: 'Auf diesem Server ist kein Admin-Code hinterlegt' }); return; }
      if (!sameSecret(String(m.code || ''), this.env.ADMIN_CODE)) {
        this.sendTo(ws, { t: 'sys', msg: 'Admin-Code stimmt nicht' }); return;
      }
      const reg = this.env.ROOM.get(this.env.ROOM.idFromName(ADMIN_ROOM));
      const r = await reg.fetch('https://x/claim?who=' + encodeURIComponent(me.id));
      const j = await r.json();
      if (!j.ok) { this.sendTo(ws, { t: 'sys', msg: 'Dieser Code wurde schon eingelöst' }); return; }
      const room = await this.room();
      room.adminId = me.id;
      await this.saveRoom();
      this.sendTo(ws, { t: 'admin', ok: true, already: j.already });
      this.broadcast({ t: 'sys', msg: (m.name || 'Ein Pilot') + ' ist jetzt Admin' }, ws);
      return;
    }

    /* Raumzustand ändern – nur der Admin. Hier bekommt der Server zum ersten
       Mal Spiellogik; ohne das gäbe es keine durchsetzbaren Adminrechte. */
    if (m.t === 'set' || m.t === 'kick') {
      const room = await this.room();
      if (!me.id || me.id !== room.adminId) { this.sendTo(ws, { t: 'sys', msg: 'Das darf nur der Admin' }); return; }
      if (m.t === 'kick') {
        const who = cleanId(m.who);
        room.bans[who] = Date.now() + BAN_MS;
        await this.saveRoom();
        for (const p of this.peers()) {
          if (this.meta(p).id === who) {
            this.sendTo(p, { t: 'kicked' });
            try { p.close(4004, 'Rausgeworfen'); } catch (e) {}
          }
        }
        return;
      }
      if (typeof m.map === 'string') room.map = m.map.slice(0, 40);
      if (typeof m.weather === 'string') room.weather = m.weather.slice(0, 20);
      if (typeof m.daytime === 'string') room.daytime = m.daytime.slice(0, 20);
      if (typeof m.locked !== 'undefined') room.locked = m.locked ? 1 : 0;
      await this.saveRoom();
      this.broadcast({ t: 'state', map: room.map, weather: room.weather,
        daytime: room.daytime, locked: !!room.locked, by: m.name || 'Admin' });
      return;
    }

    // Alles Übrige – Posen, Torzeiten, Rennstart, Baupläne – geht unverändert
    // an alle anderen. Der Server liest es nicht und speichert es nicht.
    for (const p of this.peers()) {
      if (p === ws) continue;
      try { p.send(data); } catch (e) { /* geschlossene Sockets ignorieren */ }
    }
  }

  webSocketClose(ws, code, reason) {
    // Code und Grund durchreichen statt blind zu schliessen – 1005/1006 sind
    // reservierte Codes, die nicht zurückgeschickt werden dürfen.
    try { ws.close(code >= 1000 && code !== 1005 && code !== 1006 ? code : 1000, reason); }
    catch (e) {}
  }

  webSocketError(ws) {
    try { ws.close(); } catch (e) {}
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const cors = { 'Access-Control-Allow-Origin': '*' };

    if (url.pathname === '/health')
      return new Response('ok', { headers: cors });

    /* Konto anlegen: der Server erzeugt Kennung und Unterschrift. Gespeichert
       wird nichts – die Unterschrift trägt sich selbst. Der Browser hebt sie
       auf, sonst niemand. */
    if (url.pathname === '/account') {
      const a = await makeAccount(env, url.searchParams.get('name'), url.searchParams.get('user'));
      return Response.json(a, { headers: cors });
    }

    if (url.pathname !== '/room')
      return new Response('Drohnen-Simulator: Mehrspieler-Weiche. /room?r=CODE', { status: 404 });

    // Raumcode säubern: nur Buchstaben und Ziffern, damit niemand mit
    // absurden Namen Objekte anlegt.
    const raw = (url.searchParams.get('r') || '').toUpperCase();
    const code = raw.replace(/[^A-Z0-9]/g, '').slice(0, 8);
    if (code.length < 3) return new Response('Raumcode zu kurz', { status: 400 });

    const id = env.ROOM.idFromName(code);
    return env.ROOM.get(id).fetch(request);
  },
};
