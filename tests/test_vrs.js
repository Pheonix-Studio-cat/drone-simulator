// Wirbelringstadium (Vortex Ring State) und das Kippeln, das dazugehört.
// Alles hier ist gemessen: die Abwindgeschwindigkeit wird gegen die
// Strahltheorie nachgerechnet, der Schubverlust gegen den ungestörten Fall.
const { chromium } = require('playwright');
const A = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 960, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/Failed to load resource|ERR_|net::/i.test(t)) errors.push(t); });
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('file:///home/user/drone-simulator/index.html');
  await page.waitForFunction(() => window.T, null, { timeout: 20000 });

  // Ein Prüfstand: die Drohne wird in der Höhe festgehalten und mit einer
  // vorgegebenen Sink- und Vorwärtsgeschwindigkeit durch die Luft gezogen.
  // So misst man den Ring selbst, nicht die Regelung darum herum.
  await page.evaluate(() => {
    window.RIG = (opt) => {
      const { drone = 'freestyle5', map = 'flat', sink = 0, fwd = 0, alt = 60, secs = 3, thr = 0 } = opt;
      T.start(drone, 'free', map);
      T.APP.paused = false; T.APP.windLevel = 0;
      const gy = SCENE.terH(0, 0);
      T.DR.armed = true; T.DR.crashed = false; T.DR.onGround = false; T.DR.vrs = 0;
      T.DR.pos = [0, gy + alt, 0];
      T.set({ thr, yaw: 0, pit: 0, rol: 0 });
      let peak = 0, wobble = 0, n = 0;
      for (let i = 0; i < secs * 100; i++) {
        // Fahrt und Höhe festhalten – wir prüfen das Modell, nicht den Regler
        T.DR.vel[0] = fwd; T.DR.vel[1] = -sink; T.DR.vel[2] = 0;
        T.DR.pos[1] = gy + alt; T.DR.pos[0] = 0; T.DR.pos[2] = 0;
        T.tick(0.01);
        if (i > secs * 50) {          // erst nach dem Einschwingen messen
          peak = Math.max(peak, T.DR.dbg.vrs || 0);
          wobble += Math.hypot(T.DR.w[0], T.DR.w[2]); n++;
        }
      }
      return { vrs: peak, vi: T.DR.dbg.vi, Tsum: T.DR.dbg.Tsum, wobble: n ? wobble / n : 0 };
    };
    window.VI = (drone, map, alt) => {
      const r = RIG({ drone, map, alt, secs: 0.2 });
      const d = T.APP.model, m = d.mass, w = WORLDS[MAPS.find(x => x.id === map).world || 'earth'];
      const rho = w.rho * Math.exp(-Math.max(T.DR.pos[1], 0) / w.H);
      return { got: r.vi, want: Math.sqrt(m * w.g / (2 * rho * 4 * Math.PI * d.propR * d.propR)) };
    };
  });

  // ---------- Die Abwindgeschwindigkeit stimmt mit der Strahltheorie ----------
  for (const [dr, mp] of [['freestyle5', 'flat'], ['cine', 'flat'], ['mavic', 'standard']]) {
    const v = await page.evaluate(([d, m]) => VI(d, m, 60), [dr, mp]);
    A(Math.abs(v.got - v.want) < 0.05 * v.want,
      `${dr}: Abwind ${v.got.toFixed(2)} m/s, Strahltheorie sagt ${v.want.toFixed(2)} m/s`);
  }
  const viRange = await page.evaluate(() => [VI('freestyle5', 'flat', 60).got, VI('cine', 'flat', 60).got]);
  A(viRange[0] > 3 && viRange[0] < 12, `Ein 5-Zöller wirft die Luft mit ${viRange[0].toFixed(1)} m/s nach unten`);
  A(viRange[1] > viRange[0], 'Die schwerere Cinelifter-Klasse drückt kräftiger nach unten');

  // ---------- Schweben löst nichts aus ----------
  const hover = await page.evaluate(() => RIG({ sink: 0, secs: 3 }));
  A(hover.vrs < 0.01, `Im Schwebeflug kein Ring (${hover.vrs.toFixed(3)})`);

  // ---------- Sinken mit der eigenen Abwindgeschwindigkeit: der gefährliche Fall ----------
  const danger = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    return { vi, ...RIG({ sink: vi, secs: 3 }) };
  });
  A(danger.vrs > 0.85, `Sinken mit ${danger.vi.toFixed(1)} m/s trifft den Ring voll (${danger.vrs.toFixed(2)})`);

  // ---------- Sanftes Sinken bleibt harmlos ----------
  const gentle = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    return { s: vi * 0.15, ...RIG({ sink: vi * 0.15, secs: 3 }) };
  });
  A(gentle.vrs < 0.15, `Ein gemächlicher Sinkflug mit ${gentle.s.toFixed(1)} m/s bleibt sauber (${gentle.vrs.toFixed(2)})`);

  // ---------- Sehr schnelles Sinken: die Luft strömt glatt durch ----------
  const fast = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    return { s: vi * 2.6, ...RIG({ sink: vi * 2.6, secs: 3 }) };
  });
  A(fast.vrs < 0.15, `Bei ${fast.s.toFixed(0)} m/s Sturzflug ist der Ring durchbrochen (${fast.vrs.toFixed(2)})`);

  // ---------- Nach vorn fliegen ist der Ausweg ----------
  const escape = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    return {
      vi,
      still: RIG({ sink: vi, fwd: 0, secs: 3 }).vrs,
      slow: RIG({ sink: vi, fwd: vi * 0.35, secs: 3 }).vrs,
      quick: RIG({ sink: vi, fwd: vi * 0.9, secs: 3 }).vrs,
    };
  });
  A(escape.slow < escape.still * 0.6, `Etwas Fahrt entschärft ihn (${escape.still.toFixed(2)} → ${escape.slow.toFixed(2)})`);
  A(escape.quick < 0.02, `Mit ${(escape.vi * 0.9).toFixed(0)} m/s Fahrt ist er weg (${escape.quick.toFixed(3)})`);

  // ---------- Bodennähe verhindert ihn ----------
  const low = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    return { high: RIG({ sink: vi, alt: 60, secs: 3 }).vrs, low: RIG({ sink: vi, alt: 0.5, secs: 3 }).vrs };
  });
  A(low.low < low.high * 0.35, `Dicht über dem Boden strömt die Luft seitlich ab (${low.high.toFixed(2)} oben, ${low.low.toFixed(2)} unten)`);

  // ---------- Der Schub bricht messbar ein ----------
  const thrust = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    return { clean: RIG({ sink: 0, thr: 0.5, secs: 3 }).Tsum, ring: RIG({ sink: vi, thr: 0.5, secs: 3 }).Tsum };
  });
  A(thrust.ring < thrust.clean * 0.85,
    `Bei gleichem Gas bleiben im Ring nur ${(100 * thrust.ring / thrust.clean).toFixed(0)} % vom Schub`);

  // ---------- Er kippelt ----------
  const shake = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    return { calm: RIG({ sink: 0, secs: 3 }).wobble, ring: RIG({ sink: vi, secs: 3 }).wobble };
  });
  A(shake.ring > shake.calm * 3 && shake.ring > 0.2,
    `Im Ring kippelt sie (Drehrate ${shake.ring.toFixed(2)} statt ${shake.calm.toFixed(2)} rad/s)`);

  // ---------- Er baut sich auf und löst sich wieder auf ----------
  const decay = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    const gy = SCENE.terH(0, 0);
    T.start('freestyle5', 'free', 'flat');
    T.APP.paused = false; T.APP.windLevel = 0;
    T.DR.armed = true; T.DR.crashed = false; T.DR.onGround = false; T.DR.vrs = 0;
    T.DR.pos = [0, gy + 60, 0]; T.set({ thr: 0, yaw: 0, pit: 0, rol: 0 });
    const hold = (sink, fwd, secs) => {
      for (let i = 0; i < secs * 100; i++) {
        T.DR.vel[0] = fwd; T.DR.vel[1] = -sink; T.DR.vel[2] = 0;
        T.DR.pos = [0, gy + 60, 0];
        T.tick(0.01);
      }
      return T.DR.dbg.vrs;
    };
    const t0 = hold(vi, 0, 0.2);      // gerade erst hineingeraten
    const t1 = hold(vi, 0, 2.0);      // drin
    const t2 = hold(vi, vi, 2.0);     // herausgeflogen
    return { t0, t1, t2 };
  });
  A(decay.t0 < 0.45 && decay.t1 > 0.85,
    `Der Ring baut sich auf, statt zu springen (${decay.t0.toFixed(2)} nach 0,2 s, ${decay.t1.toFixed(2)} nach 2 s)`);
  A(decay.t2 < 0.05, `Und löst sich wieder auf, sobald man ihn verlässt (${decay.t2.toFixed(3)})`);

  // ---------- Auf dem Mars gilt dasselbe, nur mit anderen Zahlen ----------
  const mars = await page.evaluate(() => {
    const mv = VI('marscopter', 'mars', 60);
    return { ...mv, earth: VI('freestyle5', 'flat', 60).got, ring: RIG({ drone: 'marscopter', map: 'mars', sink: mv.got, secs: 3 }).vrs };
  });
  A(Math.abs(mars.got - mars.want) < 0.05 * mars.want,
    `Auf dem Mars ebenfalls nach Strahltheorie: ${mars.got.toFixed(1)} m/s`);
  A(mars.got > mars.earth,
    `In dünner Luft muss der Rotor viel schneller wegwerfen (${mars.got.toFixed(0)} statt ${mars.earth.toFixed(0)} m/s)`);
  A(mars.ring > 0.8, `Und der Ring bildet sich auch dort (${mars.ring.toFixed(2)})`);

  // ---------- Nicht armiert, kein Ring ----------
  const off = await page.evaluate(() => {
    const vi = VI('freestyle5', 'flat', 60).got;
    T.start('freestyle5', 'free', 'flat');
    T.APP.paused = false;
    const gy = SCENE.terH(0, 0);
    T.DR.armed = false; T.DR.crashed = false; T.DR.onGround = false;
    for (let i = 0; i < 300; i++) { T.DR.vel = [0, -vi, 0]; T.DR.pos = [0, gy + 60, 0]; T.tick(0.01); }
    return T.DR.dbg.vrs;
  });
  A(off < 0.01, `Mit stehenden Motoren gibt es keinen Abwind und keinen Ring (${off.toFixed(3)})`);

  // ---------- Und der ganze Flug läuft weiterhin sauber durch ----------
  const flight = await page.evaluate(() => {
    T.start('freestyle5', 'free', 'flat');
    T.APP.paused = false; T.DR.armed = true;
    T.set({ thr: 0.8, yaw: 0, pit: 0, rol: 0 });
    for (let i = 0; i < 600; i++) T.tick(0.01);
    const up = T.DR.pos[1];
    T.set({ thr: -0.35, yaw: 0, pit: 0, rol: 0 });
    for (let i = 0; i < 1200; i++) T.tick(0.01);
    return { up, down: T.DR.pos[1], fin: Number.isFinite(T.DR.pos[1]) && Number.isFinite(T.DR.vel[1]) };
  });
  A(flight.up > 5, `Steigen geht unverändert (${flight.up.toFixed(1)} m)`);
  A(flight.down < flight.up, 'Und danach sinkt sie wieder');
  A(flight.fin, 'Keine ungültigen Zahlen in Lage oder Geschwindigkeit');

  A(errors.length === 0, 'Keine Fehler in der Konsole' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
})();
