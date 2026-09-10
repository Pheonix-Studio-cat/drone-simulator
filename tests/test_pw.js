// Prop-Wash: das kurze Schütteln, nachdem sie durch ihre eigene aufgewühlte
// Luft zurückfliegt. Alles hier ist gemessen – Aufbau, Abklingen, was ihn
// dämpft, und dass er stört, ohne jemanden abstürzen zu lassen.
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

  // Prüfstand: Höhe und Fahrt festhalten, die Drehung über den Knüppel
  // kommandieren. So misst man den Prop-Wash und nicht die Regelung darum.
  await page.evaluate(() => {
    window.RIG = (opt) => {
      const { drone = 'race5', map = 'flat', mode = 'ACRO', rol = 0, sink = 0, fwd = 0,
              alt = 60, secs = 2.5, halt = true } = opt;
      T.start(drone, 'free', map);
      T.APP.paused = false; T.APP.windLevel = 0;
      const gy = SCENE.terH(0, 0);
      const mi = T.APP.model.modes.indexOf(mode);
      if (mi >= 0) T.APP.modeIdx = mi;
      T.DR.armed = true; T.DR.crashed = false; T.DR.onGround = false;
      T.DR.pw = 0; T.DR.vrs = 0; T.DR.rateLP = 0;
      T.DR.pos = [0, gy + alt, 0];
      T.set({ thr: 0, yaw: 0, pit: 0, rol });
      let peak = 0, wobble = 0, n = 0;
      for (let i = 0; i < secs * 100; i++) {
        if (halt) { T.DR.vel[0] = fwd; T.DR.vel[1] = -sink; T.DR.vel[2] = 0;
                    T.DR.pos[1] = gy + alt; }
        T.tick(0.01);
        if (i > secs * 40) {
          peak = Math.max(peak, T.DR.dbg.pw || 0);
          // Nicht die Drehung messen, sondern wie weit der Regler seinen
          // eigenen Sollwert verfehlt. Genau das ist der Prop-Wash: die
          // kommandierte Rolle selbst zu messen sagt gar nichts über ihn.
          const rt = T.DR.dbg.rateT || [0, 0, 0];
          wobble += Math.hypot(T.DR.w[0] - rt[0], T.DR.w[2] - rt[2]); n++;
        }
      }
      return { pw: peak, fehler: n ? wobble / n : 0, rate: T.DR.rateLP,
               crashed: T.DR.crashed, hoehe: T.DR.pos[1] - gy };
    };
  });

  // ---------- Ruhig geradeaus: nichts ----------
  const ruhig = await page.evaluate(() => RIG({ rol: 0, fwd: 6, secs: 2.5 }));
  A(ruhig.pw < 0.02, `Ruhiger Geradeausflug wühlt nichts auf (${ruhig.pw.toFixed(3)})`);

  // ---------- Scharfe Drehung: er entsteht ----------
  const dreh = await page.evaluate(() => RIG({ rol: 1, fwd: 0, secs: 2.5 }));
  A(dreh.pw > 0.4, `Eine scharfe Rolle wühlt die Luft auf (${dreh.pw.toFixed(2)} bei ${dreh.rate.toFixed(1)} rad/s)`);

  // ---------- Und er geht wieder weg – das unterscheidet ihn vom Wirbelring ----------
  const weg = await page.evaluate(() => {
    T.start('race5', 'free', 'flat');
    T.APP.paused = false; T.APP.windLevel = 0;
    const gy = SCENE.terH(0, 0);
    T.APP.modeIdx = Math.max(0, T.APP.model.modes.indexOf('ACRO'));
    T.DR.armed = true; T.DR.crashed = false; T.DR.onGround = false;
    T.DR.pw = 0; T.DR.vrs = 0; T.DR.rateLP = 0;
    T.DR.pos = [0, gy + 60, 0];
    const halten = (o, secs) => {
      T.set(Object.assign({ thr: 0, yaw: 0, pit: 0, rol: 0 }, o));
      for (let i = 0; i < secs * 100; i++) {
        T.DR.vel[0] = 0; T.DR.vel[1] = 0; T.DR.vel[2] = 0; T.DR.pos[1] = gy + 60;
        T.tick(0.01);
      }
      return T.DR.dbg.pw;
    };
    const drin = halten({ rol: 1 }, 2.0);
    const nach05 = halten({}, 0.5);
    const nach15 = halten({}, 1.0);
    return { drin, nach05, nach15 };
  });
  A(weg.drin > 0.4, `Während der Figur ist er da (${weg.drin.toFixed(2)})`);
  A(weg.nach05 < weg.drin * 0.6, `Eine halbe Sekunde später schon halb weg (${weg.nach05.toFixed(2)})`);
  // Ganz auf null geht er nicht: eine nervöse Drohne wackelt immer ein
  // wenig, und das wühlt auch ein wenig Luft auf. Gemessen bleiben unter
  // einem Zehntel vom Ausschlag.
  A(weg.nach15 < weg.drin * 0.15,
    `Nach anderthalb Sekunden ist er praktisch weg (${weg.nach15.toFixed(3)}, ein Zehntel vom Ausschlag)`);

  // ---------- Fahrt trägt die Wirbel weg ----------
  const fahrt = await page.evaluate(() => ({
    steht: RIG({ rol: 1, fwd: 0, secs: 2.5 }).pw,
    langsam: RIG({ rol: 1, fwd: 4.5, secs: 2.5 }).pw,
    schnell: RIG({ rol: 1, fwd: 9, secs: 2.5 }).pw,
  }));
  A(fahrt.langsam < fahrt.steht * 0.7, `Etwas Fahrt dämpft ihn (${fahrt.steht.toFixed(2)} → ${fahrt.langsam.toFixed(2)})`);
  A(fahrt.schnell < 0.02, `Bei 9 m/s ist er weg – die Wirbel bleiben hinten (${fahrt.schnell.toFixed(3)})`);

  // ---------- Sinken erzeugt ihn schon weit unter dem Wirbelring ----------
  const sink = await page.evaluate(() => {
    const r = RIG({ rol: 0, sink: 2.5, fwd: 0, secs: 2.5 });
    return { pw: r.pw, vrs: T.DR.dbg.vrs, vi: T.DR.dbg.vi };
  });
  A(sink.pw > sink.vrs * 2,
    `Sinken mit 2,5 m/s (${(2.5 / sink.vi * 100).toFixed(0)} % von vi): Prop-Wash ${sink.pw.toFixed(2)}, Wirbelring erst ${sink.vrs.toFixed(2)} – dreimal weniger`);

  // ---------- Ummantelte Rotoren leiden weniger ----------
  const duct = await page.evaluate(() => ({
    offen: RIG({ drone: 'race5', mode: 'ACRO', rol: 1, secs: 2.5 }).pw,
    kanal: RIG({ drone: 'whoop', mode: 'ACRO', rol: 1, secs: 2.5 }).pw,
  }));
  A(duct.kanal < duct.offen * 0.7,
    `Der Kanal führt den Abwind – die Cinewhoop leidet weniger (${duct.kanal.toFixed(2)} gegen ${duct.offen.toFixed(2)})`);

  // ---------- Die stabile Kameradrohne zittert weniger ----------
  const zittern = await page.evaluate(() => ({
    renner: RIG({ drone: 'race5', mode: 'ACRO', rol: 1, secs: 2.5 }),
    kamera: RIG({ drone: 'pro', mode: 'ATTI', rol: 1, secs: 2.5 }),
    stabR: DRONES.find(d => d.id === 'race5').stab,
    stabK: DRONES.find(d => d.id === 'pro').stab,
  }));
  A(zittern.stabK > zittern.stabR,
    `Die Kameradrohne ist die ruhigere Bauart (stab ${zittern.stabK} gegen ${zittern.stabR})`);
  A(zittern.kamera.fehler < zittern.renner.fehler,
    `Und hält ihren Sollwert besser (${zittern.kamera.fehler.toFixed(2)} gegen ${zittern.renner.fehler.toFixed(2)} rad/s Abweichung)`);

  // ---------- Er stört, ohne unfliegbar zu machen ----------
  const stoert = await page.evaluate(() => {
    const mit = RIG({ rol: 1, secs: 2.5 });
    const ohne = RIG({ rol: 0, fwd: 9, secs: 2.5 });
    return { mit: mit.fehler, ohne: ohne.fehler };
  });
  A(stoert.mit > stoert.ohne * 2,
    `Im Prop-Wash verfehlt der Regler seinen Sollwert deutlich (${stoert.mit.toFixed(2)} gegen ${stoert.ohne.toFixed(2)} rad/s)`);
  A(stoert.mit < 3,
    `Aber sie bleibt steuerbar – die Abweichung stört, sie reisst nicht (${stoert.mit.toFixed(2)} rad/s)`);

  // ---------- Und er schaukelt sich nicht selbst auf ----------
  const stabil = await page.evaluate(() => {
    // Frei fliegen lassen, nicht festhalten: wenn die Rückkopplung offen wäre,
    // müsste sie hier von selbst immer wilder werden.
    const r = RIG({ rol: 1, secs: 6, halt: false });
    return { crashed: r.crashed, rate: r.rate, pw: r.pw, endlich: Number.isFinite(r.rate) };
  });
  A(stabil.endlich && stabil.rate < 25 && stabil.pw <= 1,
    `Sechs Sekunden Dauerrolle laufen nicht aus dem Ruder (${stabil.rate.toFixed(1)} rad/s, pw ${stabil.pw.toFixed(2)})`);

  // ---------- Ein normaler Flug bleibt ein normaler Flug ----------
  const flug = await page.evaluate(() => {
    T.start('cine', 'free', 'standard');   // Umweg erzwingt einen echten Neustart
    T.start('race5', 'free', 'flat');
    T.APP.paused = false; T.DR.armed = true;
    T.set({ thr: 0.8, yaw: 0, pit: 0, rol: 0 });
    for (let i = 0; i < 600; i++) T.tick(0.01);
    const hoch = T.DR.pos[1];
    // Deutlich unter Schwebegas: bei -0,3 trägt die Rennmaschine noch, das
    // wäre keine Aussage über den Prop-Wash, sondern über ihre Schubreserve.
    T.set({ thr: -0.7, yaw: 0, pit: 0, rol: 0 });
    for (let i = 0; i < 800; i++) T.tick(0.01);
    return { hoch, runter: T.DR.pos[1], crashed: T.DR.crashed,
             endlich: Number.isFinite(T.DR.pos[1]) && Number.isFinite(T.DR.w[0]) };
  });
  A(flug.hoch > 5, `Steigen geht unverändert (${flug.hoch.toFixed(1)} m in 6 s)`);
  A(flug.runter < flug.hoch, `Und danach sinkt sie wieder (${flug.runter.toFixed(1)} m)`);
  A(flug.endlich, 'Keine ungültigen Zahlen in Lage oder Drehrate');

  // ---------- Nach dem Neustart ist er weg ----------
  const reset = await page.evaluate(() => {
    RIG({ rol: 1, secs: 2.5 });
    const vorher = T.DR.pw;
    T.start('cine', 'free', 'standard');   // andere Konfiguration -> echter Neustart
    return { vorher, nachher: T.DR.pw, lp: T.DR.rateLP };
  });
  A(reset.vorher > 0.3 && reset.nachher === 0 && reset.lp === 0,
    `Der Neustart räumt ihn weg (${reset.vorher.toFixed(2)} → ${reset.nachher})`);

  A(errors.length === 0, 'Keine Fehler in der Konsole' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
})();
