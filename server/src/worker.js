/* Mehrspieler-Weiche für den Drohnen-Simulator.
 *
 * Der Server hat bewusst KEINE Spiellogik. Er kennt nur Räume und leitet
 * jede Nachricht unverändert an alle anderen im selben Raum weiter. Jeder
 * Spieler rechnet seine eigene Physik – wie beim bisherigen Zwei-Fenster-
 * Modus, nur eben übers Internet.
 *
 * Läuft im Gratisrahmen von Cloudflare Workers: 100 000 Anfragen pro Tag,
 * eingehende WebSocket-Nachrichten zählen 20:1, ausgehende sind frei. Die
 * Hibernation-API sorgt dafür, dass ein stiller Raum keine Rechenzeit kostet.
 */

const MAX_PER_ROOM = 16;      // reicht für eine Runde unter Freunden
const MAX_MSG = 4096;         // eine Pose ist ~200 Bytes, Chat noch weniger

export class Room {
  constructor(state) {
    this.state = state;
  }

  async fetch(request) {
    if (request.headers.get('Upgrade') !== 'websocket')
      return new Response('Erwartet einen WebSocket', { status: 426 });

    // Hibernation-API: die Sockets überleben, auch wenn das Objekt schläft
    if (this.state.getWebSockets().length >= MAX_PER_ROOM)
      return new Response('Raum voll', { status: 503 });

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.state.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, data) {
    if (typeof data !== 'string' || data.length > MAX_MSG) return;
    // Unverändert an alle anderen weiterreichen – der Server liest nicht mit.
    for (const peer of this.state.getWebSockets()) {
      if (peer === ws) continue;
      try { peer.send(data); } catch (e) { /* geschlossene Sockets ignorieren */ }
    }
  }

  webSocketClose(ws) {
    try { ws.close(); } catch (e) {}
  }

  webSocketError(ws) {
    try { ws.close(); } catch (e) {}
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/health')
      return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });

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
