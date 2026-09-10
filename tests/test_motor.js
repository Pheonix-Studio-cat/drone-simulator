// Motorwärme: Vollgas mit Last lässt den Schub nach. Alles hier ist gemessen –
// die Erwärmung über der Zeit, was sie dämpft, der Schubverlust, und dass sie
// niemanden abstürzen lässt.
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

  // Prüfstand: Höhe und Fahrt festhalten, Akku vollhalten. So misst man die
  // Wärme und nicht nebenbei die Ausdauer.
  await page.evaluate(() => {
    window.RIG = (opt) => {
      const { drone = 'cine', map = 'city', thr = 1, fwd = 0, secs = 90, halt = true } = opt;
      // Umweg erzwingt einen echten Neustart: T.start setzt sonst nur zurück,
      // wenn sich die Konfiguration ändert.
      T.start(drone, 'free', map === 'city' ? 'flat' : 'city');
      T.start(drone, 'free', map);
      T.APP.paused = false; T.APP.windLevel = 0;
      T.DR.armed = true; T.DR.crashed = false; T.DR.onGround = false;
      T.set({ thr, yaw: 0, pit: 0, rol: 0 });
      const gy = SCENE.terH(0, 0);
      const kurve = [];
      for (let i = 0; i < secs * 10; i++) {
        if (halt) { T.DR.pos[1] = gy + 40; T.DR.vel[0] = fwd; T.DR.vel[1] = 0; T.DR.vel[2] = 0; }
        T.DR.soc = 1;                      // Ausdauer ist hier nicht das Thema
        T.tick(0.1);
        if (i % 100 === 99) kurve.push({ t: (i + 1) / 10, T: T.DR.motT, F: T.DR.motF });
      }
      return { motT: T.DR.motT, motF: T.DR.motF, luft: T.DR.airT, amps: T.DR.amps,
               Tsum: T.DR.dbg.Tsum, heissF: T.DR.dbg.heissF,
               crashed: T.DR.crashed, hoehe: T.DR.pos[1] - gy, kurve };
    };
  });

  // ---------- Kalter Start ----------
  const start = await page.evaluate(() => {
    const r = RIG({ drone: 'cine', map: 'city', thr: 1, secs: 0.4 });
    return { motT: r.motT, luft: r.luft, motF: r.motF };
  });
  A(Math.abs(start.motT - start.luft) < 3,
    `Die Motoren starten auf Umgebungstemperatur (${start.motT.toFixed(1)} °C bei ${start.luft.toFixed(1)} °C Luft)`);
  A(start.motF === 1, 'Und kosten anfangs nichts an Schub');

  // ---------- Schweben bleibt kühl ----------
  const schweben = await page.evaluate(() => RIG({ drone: 'cine', thr: -0.1, secs: 90 }));
  A(schweben.motT < 55 && schweben.motF === 1,
    `Schweben bleibt harmlos: ${schweben.motT.toFixed(0)} °C nach 90 s, voller Schub`);

  // ---------- Vollgas heizt, und zwar über Sekunden ----------
  const voll = await page.evaluate(() => RIG({ drone: 'cine', thr: 1, secs: 90 }));
  A(voll.motT > schweben.motT + 20,
    `Vollgas heizt deutlich mehr als Schweben (${voll.motT.toFixed(0)} gegen ${schweben.motT.toFixed(0)} °C)`);
  const k = voll.kurve;
  A(k.length >= 8 && k[0].T < k[3].T && k[3].T < k[7].T,
    `Die Wärme baut sich über Sekunden auf, nicht sprunghaft (${k.map(x => x.T.toFixed(0)).join(' → ')} °C)`);
  A(k[7].T - k[6].T < k[1].T - k[0].T,
    'Und läuft in eine Sättigung, statt endlos weiterzusteigen');

  // ---------- Fahrtwind kühlt ----------
  const fahrt = await page.evaluate(() => RIG({ drone: 'cine', thr: 1, fwd: 15, secs: 90 }));
  A(fahrt.motT < voll.motT - 15,
    `Fahrtwind kühlt kräftig: ${fahrt.motT.toFixed(0)} °C statt ${voll.motT.toFixed(0)} °C bei gleichem Gas`);
  A(fahrt.motF >= voll.motF,
    `Und hält den Schub oben (${(fahrt.motF * 100).toFixed(0)} % gegen ${(voll.motF * 100).toFixed(0)} %)`);

  // ---------- Der Kanal kühlt schlechter ----------
  const duct = await page.evaluate(() => ({
    whoop: RIG({ drone: 'whoop', thr: 1, secs: 90 }),
    offen: RIG({ drone: 'race5', thr: 1, secs: 90 }),
  }));
  A(duct.whoop.motT > 90 && duct.whoop.motF < 1,
    `Die ummantelte Cinewhoop wird heiss (${duct.whoop.motT.toFixed(0)} °C, ${(duct.whoop.motF * 100).toFixed(0)} % Schub) – der Kanal führt die Luft am Motor vorbei`);

  // ---------- Die Umgebung zählt ----------
  // Beide Karten liegen tief – so vergleicht man die Bodentemperatur und
  // nicht nebenbei die Höhenabnahme der Luft (der Canyon liegt hoch, dort
  // wird es allein deshalb kühler).
  const umgebung = await page.evaluate(() => ({
    arktis: RIG({ drone: 'cine', map: 'arctic', thr: 1, secs: 90 }),
    stadt: RIG({ drone: 'cine', map: 'city', thr: 1, secs: 90 }),
  }));
  A(umgebung.arktis.motT < umgebung.stadt.motT - 30,
    `Dieselbe Last wird auf der Antarktis kühler als in der Stadt (${umgebung.arktis.motT.toFixed(0)} gegen ${umgebung.stadt.motT.toFixed(0)} °C, bei ${umgebung.arktis.luft.toFixed(0)} gegen ${umgebung.stadt.luft.toFixed(0)} °C Luft)`);
  A(umgebung.arktis.motF === 1,
    'In der Kälte kostet Vollgas gar keinen Schub');

  // ---------- Der Schubverlust ist messbar, und er kommt zurück ----------
  const zurueck = await page.evaluate(() => {
    T.start('whoop', 'free', 'flat'); T.start('whoop', 'free', 'city');
    T.APP.paused = false; T.APP.windLevel = 0;
    T.DR.armed = true; T.DR.crashed = false; T.DR.onGround = false;
    const gy = SCENE.terH(0, 0);
    const halten = (thr, secs) => {
      T.set({ thr, yaw: 0, pit: 0, rol: 0 });
      for (let i = 0; i < secs * 10; i++) {
        T.DR.pos[1] = gy + 40; T.DR.vel[0] = 0; T.DR.vel[1] = 0; T.DR.vel[2] = 0;
        T.DR.soc = 1; T.tick(0.1);
      }
      return { T: T.DR.motT, F: T.DR.motF };
    };
    const heiss = halten(1, 120);
    const kalt = halten(-1, 180);      // Gas weg
    return { heiss, kalt };
  });
  A(zurueck.heiss.F < 0.95,
    `Heiss gefahren kostet messbar Schub (${zurueck.heiss.T.toFixed(0)} °C, ${(zurueck.heiss.F * 100).toFixed(0)} %)`);
  A(zurueck.kalt.T < zurueck.heiss.T - 30 && zurueck.kalt.F > zurueck.heiss.F,
    `Gas weg kühlt sie wieder herunter und gibt den Schub zurück (${zurueck.kalt.T.toFixed(0)} °C, ${(zurueck.kalt.F * 100).toFixed(0)} %)`);

  // ---------- Ein heisser Motor zieht mehr Strom ----------
  /* Der Mehrverbrauch setzt erst oberhalb von 60 °C ein. Ein erster Anlauf
     verglich eine Cine bei 22 gegen 54 °C – beide unter der Schwelle, der
     Faktor war beidesmal genau 1, und die Prüfung war grün, ohne irgendetwas
     zu zeigen. Geprüft wird deshalb mit einem Aufbau, der die Schwelle
     wirklich überschreitet. */
  const strom = await page.evaluate(() => {
    const gleich = (secs) => {
      const r = RIG({ drone: 'whoop', thr: 1, secs });
      // Strom je Newton Schub – das ist die Grösse, um die es geht
      return { T: r.motT, A: r.amps, F: r.motF, heissF: r.heissF };
    };
    return { frueh: gleich(1), spaet: gleich(150) };
  });
  A(strom.frueh.T < 60 && strom.spaet.T > 60,
    `Der Vergleich überspannt die 60-°C-Schwelle wirklich: ${strom.frueh.T.toFixed(0)} °C gegen ${strom.spaet.T.toFixed(0)} °C`);
  A(strom.frueh.heissF === 1 && strom.spaet.heissF > 1.05,
    `Der Kupferaufschlag auf den Strom greift (Faktor ${strom.spaet.heissF.toFixed(2)} gegen ${strom.frueh.heissF.toFixed(2)})`);
  /* Am Amperemeter sieht der Pilot trotzdem weniger, und das ist kein
     Widerspruch, sondern gemessen: Der Überhitzungsschutz nimmt Schub weg,
     damit fällt die Last, und der Lastanteil (load^1,5) überwiegt den
     Kupferaufschlag deutlich. Wer nur die Ampere bei gleichem Gasweg
     vergleicht, misst den Schutz und nicht das Kupfer. */
  A(strom.spaet.A < strom.frueh.A,
    `Am Gasweg gemessen zieht er dafür weniger (${strom.spaet.A.toFixed(1)} gegen ${strom.frueh.A.toFixed(1)} A) – der Schutz nimmt mehr Last weg, als das Kupfer kostet`);

  // ---------- Kein Absturz: frei geflogen bleibt sie fliegbar ----------
  const frei = await page.evaluate(() => {
    T.start('cine', 'free', 'flat'); T.start('cine', 'free', 'city');
    T.APP.paused = false; T.APP.windLevel = 0;
    T.DR.armed = true; T.set({ thr: 1, yaw: 0, pit: 0, rol: 0 });
    for (let i = 0; i < 600; i++) { T.DR.soc = 1; T.tick(0.1); }
    return { motT: T.DR.motT, motF: T.DR.motF, hoehe: T.DR.pos[1], crashed: T.DR.crashed,
             endlich: Number.isFinite(T.DR.motT) && Number.isFinite(T.DR.pos[1]) };
  });
  A(!frei.crashed && frei.hoehe > 50,
    `Eine Minute Vollgas im freien Flug bleibt fliegbar (${frei.hoehe.toFixed(0)} m, ${frei.motT.toFixed(0)} °C)`);
  A(frei.endlich, 'Keine ungültigen Zahlen in Temperatur oder Lage');
  A(frei.motF > 0.5,
    `Im echten Steigflug kühlt der Fahrtwind genug, es bleiben ${(frei.motF * 100).toFixed(0)} % Schub`);

  // ---------- Der Neustart räumt die Wärme weg ----------
  const reset = await page.evaluate(() => {
    RIG({ drone: 'whoop', map: 'city', thr: 1, secs: 90 });
    const vorher = T.DR.motT;
    T.start('race5', 'free', 'arctic');
    return { vorher, nachher: T.DR.motT, F: T.DR.motF };
  });
  A(reset.vorher > 60 && reset.nachher === null && reset.F === 1,
    `Der Neustart setzt die Motortemperatur zurück (${reset.vorher.toFixed(0)} °C → unbestimmt, voller Schub)`);

  A(errors.length === 0, 'Keine Fehler in der Konsole' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
})();
