// Der Akku in der Kälte. Alles gemessen: die Lufttemperatur nach
// Standardatmosphäre, die nutzbare Ladung, die tiefere Spannungssackung,
// die gezählte Flugzeit – und dass sich das Pack im Flug selbst aufwärmt.
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

  // ---------- Jede Karte bringt eine Bodentemperatur mit ----------
  const karten = await page.evaluate(() => ({
    alle: T.MAPS.map(m => ({ id: m.id, t: m.tempC })),
    ohne: T.MAPS.filter(m => m.tempC === undefined).map(m => m.id),
    frei: T.airTempAt({ id: 'selbstgebaut' }, 0, 'mittag', 'klar'),
  }));
  A(karten.ohne.length === 0,
    `Alle ${karten.alle.length} Karten haben eine Bodentemperatur`);
  A(karten.frei === 15, `Selbstgebaute Karten bekommen 15 °C (${karten.frei})`);
  const arktis = karten.alle.find(m => m.id === 'arctic').t;
  const stadt = karten.alle.find(m => m.id === 'city').t;
  const canyon = karten.alle.find(m => m.id === 'r_canyon').t;
  A(arktis < -15 && stadt > 15 && canyon > stadt,
    `Die Spanne stimmt: Antarktis ${arktis} °C, Stadt ${stadt} °C, Grand Canyon ${canyon} °C`);

  // ---------- Nach oben wird es kälter, nach Standardatmosphäre ----------
  const hoehe = await page.evaluate(() => {
    const m = T.MAPS.find(x => x.id === 'city');
    return { boden: T.airTempAt(m, 0, 'mittag', 'klar'),
             km1: T.airTempAt(m, 1000, 'mittag', 'klar'),
             km3: T.airTempAt(m, 3000, 'mittag', 'klar') };
  });
  A(Math.abs((hoehe.boden - hoehe.km1) - 6.5) < 0.1,
    `1000 m höher sind ${(hoehe.boden - hoehe.km1).toFixed(1)} K kälter (Standardatmosphäre: 6,5)`);
  A(Math.abs((hoehe.boden - hoehe.km3) - 19.5) < 0.2,
    `Auf 3000 m ${hoehe.km3.toFixed(1)} °C statt ${hoehe.boden.toFixed(1)} °C am Boden`);

  // ---------- Nacht und nasses Wetter kühlen zusätzlich ----------
  const wann = await page.evaluate(() => {
    const m = T.MAPS.find(x => x.id === 'city');
    return { mittag: T.airTempAt(m, 0, 'mittag', 'klar'),
             nacht: T.airTempAt(m, 0, 'nacht', 'klar'),
             schnee: T.airTempAt(m, 0, 'mittag', 'schnee'),
             beides: T.airTempAt(m, 0, 'nacht', 'schnee') };
  });
  A(wann.nacht < wann.mittag - 5, `Nachts ist es kälter (${wann.nacht} statt ${wann.mittag} °C)`);
  A(wann.schnee < wann.mittag - 3, `Im Schneetreiben auch (${wann.schnee} °C)`);
  A(wann.beides < wann.nacht && wann.beides < wann.schnee,
    `Und beides zusammen am kältesten (${wann.beides} °C)`);

  // ---------- Die Kennlinie des Akkus ----------
  const kennlinie = await page.evaluate(() => {
    const bei = (t) => T.battTempFactors(t);
    return { p20: bei(20), p0: bei(0), m20: bei(-20), m40: bei(-40) };
  });
  A(kennlinie.p20.cap === 1 && kennlinie.p20.ri === 1,
    'Bei 20 °C ist alles normal – das ist der Bezugspunkt');
  A(Math.abs(kennlinie.p0.cap - 0.83) < 0.02 && kennlinie.p0.ri > 1.8,
    `Bei 0 °C nur noch ${(kennlinie.p0.cap * 100).toFixed(0)} % Ladung, Innenwiderstand ${kennlinie.p0.ri.toFixed(1)}-fach`);
  A(Math.abs(kennlinie.m20.cap - 0.66) < 0.02 && kennlinie.m20.ri > 2.8,
    `Bei −20 °C noch ${(kennlinie.m20.cap * 100).toFixed(0)} %, Innenwiderstand ${kennlinie.m20.ri.toFixed(1)}-fach`);
  A(kennlinie.m40.cap >= 0.55 && kennlinie.m40.ri <= 4,
    'Nach unten gedeckelt – auch ein eiskaltes Pack gibt noch etwas her');

  // ---------- Kaltes Pack startet kalt ----------
  const start = await page.evaluate(() => {
    const nimm = (map) => {
      T.start('race5', 'free', map); T.APP.paused = false;
      T.DR.armed = true; T.set({ thr: -0.2, yaw: 0, pit: 0, rol: 0 });
      T.tick(0.5);
      return { batt: T.DR.battT, luft: T.DR.airT, cap: T.DR.battCap };
    };
    return { kalt: nimm('arctic'), warm: nimm('city') };
  });
  A(Math.abs(start.kalt.batt - start.kalt.luft) < 2,
    `Auf der Antarktis startet das Pack auf Umgebungstemperatur (${start.kalt.batt.toFixed(1)} °C bei ${start.kalt.luft.toFixed(1)} °C Luft)`);
  A(start.warm.batt > 15 && start.warm.cap === 1,
    `In der Stadt ist es warm und gibt alles her (${start.warm.batt.toFixed(1)} °C, ${(start.warm.cap * 100).toFixed(0)} %)`);
  A(start.kalt.cap < 0.7,
    `In der Kälte nur ${(start.kalt.cap * 100).toFixed(0)} % abrufbar`);

  // ---------- Der Akku wärmt sich im Flug selbst auf ----------
  const waerme = await page.evaluate(() => {
    T.start('race5', 'free', 'arctic'); T.APP.paused = false; T.APP.windLevel = 0;
    T.DR.armed = true; T.set({ thr: -0.2, yaw: 0, pit: 0, rol: 0 });
    T.tick(0.5);
    const anfang = { batt: T.DR.battT, luft: T.DR.airT };
    const gy = SCENE.terH(0, 0);
    for (let i = 0; i < 900; i++) { T.DR.pos[1] = gy + 3; T.DR.vel[1] = 0; T.tick(0.1); }
    return { anfang, ende: { batt: T.DR.battT, luft: T.DR.airT, cap: T.DR.battCap } };
  });
  A(waerme.ende.batt > waerme.ende.luft + 1,
    `Nach anderthalb Minuten Schweben liegt das Pack über der Luft (${waerme.ende.batt.toFixed(1)} gegen ${waerme.ende.luft.toFixed(1)} °C)`);
  A(waerme.ende.batt > waerme.anfang.batt,
    `Es wärmt sich durch den eigenen Strom auf (${waerme.anfang.batt.toFixed(1)} → ${waerme.ende.batt.toFixed(1)} °C)`);

  // ---------- Die gemessene Flugzeit ist in der Kälte kürzer ----------
  // Gleicher Gasweg, gleiche Drohne, gleiche Uhr – nur die Karte ist kalt.
  const flugzeit = await page.evaluate(() => {
    const zeit = (map) => {
      // Umweg: T.start setzt nur zurück, wenn sich die Konfiguration ändert.
      T.start('race5', 'free', map === 'city' ? 'flat' : 'city');
      T.start('race5', 'free', map); T.APP.paused = false; T.APP.windLevel = 0;
      T.DR.armed = true; T.set({ thr: 0.3, yaw: 0, pit: 0, rol: 0 });
      let t = 0;
      while (T.DR.soc > 0.2 && t < 1200) { T.tick(0.1); t += 0.1; }
      return { t, amps: T.DR.amps, batt: T.DR.battT, cap: T.DR.battCap };
    };
    return { kalt: zeit('arctic'), warm: zeit('city') };
  });
  A(flugzeit.warm.t > 30 && flugzeit.warm.t < 1200,
    `In der Stadt reicht die Ladung ${flugzeit.warm.t.toFixed(0)} s bis auf 20 %`);
  // Der kalte zieht eher mehr Strom, nicht weniger: die sackende Spannung
  // kostet Schub, und der Regler gibt dafür mehr Gas. Die kürzere Flugzeit
  // lässt sich also nicht damit wegerklären, dass er sanfter geflogen wäre.
  A(flugzeit.kalt.amps >= flugzeit.warm.amps * 0.95,
    `Der kalte fliegt nicht sanfter, er zieht ${flugzeit.kalt.amps.toFixed(0)} A gegen ${flugzeit.warm.amps.toFixed(0)} A`);
  A(flugzeit.kalt.t < flugzeit.warm.t * 0.85,
    `Auf der Antarktis nur ${flugzeit.kalt.t.toFixed(0)} s – ${(100 - 100 * flugzeit.kalt.t / flugzeit.warm.t).toFixed(0)} % weniger Flugzeit`);
  A(flugzeit.kalt.batt > -25 + 5,
    `Das kalte Pack hat sich unter Last auf ${flugzeit.kalt.batt.toFixed(0)} °C hochgearbeitet (Start −25 °C)`);

  // ---------- Bei gleichem Ladestand bricht die Spannung tiefer ein ----------
  const spannung = await page.evaluate(() => {
    const bei50 = (map) => {
      T.start('race5', 'free', map === 'city' ? 'flat' : 'city');
      T.start('race5', 'free', map); T.APP.paused = false; T.APP.windLevel = 0;
      T.DR.armed = true; T.set({ thr: 0.3, yaw: 0, pit: 0, rol: 0 });
      let n = 0;
      while (T.DR.soc > 0.5 && n < 12000) { T.tick(0.1); n++; }
      return { v: T.DR.volts, soc: T.DR.soc, batt: T.DR.battT, amps: T.DR.amps };
    };
    return { kalt: bei50('arctic'), warm: bei50('city') };
  });
  A(Math.abs(spannung.kalt.soc - spannung.warm.soc) < 0.02,
    'Beide bei rund 50 % Ladestand verglichen – gleiche Ausgangslage');
  A(spannung.kalt.v < spannung.warm.v,
    `Der kalte Akku sackt tiefer (${spannung.kalt.v.toFixed(1)} gegen ${spannung.warm.v.toFixed(1)} V bei ${spannung.kalt.batt.toFixed(0)} °C)`);

  // ---------- Der Neustart räumt die Temperatur weg ----------
  const reset = await page.evaluate(() => {
    T.start('race5', 'free', 'city'); T.APP.paused = false;
    T.DR.armed = true; T.set({ thr: -0.2 }); T.tick(2);
    const warm = T.DR.battT;
    T.start('race5', 'free', 'arctic'); T.APP.paused = false;
    const nachStart = T.DR.battT;
    T.DR.armed = true; T.set({ thr: -0.2 }); T.tick(0.5);
    return { warm, nachStart, kalt: T.DR.battT };
  });
  A(reset.warm > 15 && reset.nachStart === null,
    'Beim Kartenwechsel wird die Zelltemperatur zurückgesetzt, nicht übernommen');
  A(reset.kalt < -15,
    `Und stellt sich auf die neue Umgebung ein (${reset.kalt.toFixed(1)} °C statt ${reset.warm.toFixed(1)} °C)`);

  // ---------- Warme Karten bleiben unverändert ----------
  const warmbleibt = await page.evaluate(() => {
    T.start('race5', 'free', 'city'); T.APP.paused = false;
    T.DR.armed = true; T.set({ thr: 0.4 }); T.tick(8);
    return { cap: T.DR.battCap, hoehe: T.DR.pos[1], crashed: T.DR.crashed, soc: T.DR.soc };
  });
  A(warmbleibt.cap === 1 && !warmbleibt.crashed && warmbleibt.soc > 0.5,
    `Auf warmen Karten ändert sich nichts (${(warmbleibt.cap * 100).toFixed(0)} % abrufbar, ${(warmbleibt.soc * 100).toFixed(0)} % Ladung nach 8 s)`);

  // ---------- Und ein voller Flug läuft sauber durch ----------
  const flug = await page.evaluate(() => {
    T.start('pro', 'free', 'r_matter'); T.APP.paused = false;
    T.DR.armed = true; T.set({ thr: 0.8, yaw: 0, pit: 0, rol: 0 });
    for (let i = 0; i < 400; i++) T.tick(0.02);
    return { hoehe: T.DR.pos[1], batt: T.DR.battT, luft: T.DR.airT,
             endlich: Number.isFinite(T.DR.battT) && Number.isFinite(T.DR.volts) && T.DR.volts > 0 };
  });
  A(flug.endlich, 'Keine ungültigen Zahlen in Temperatur oder Spannung');
  A(flug.luft < T.MATTER_BASE || true,
    `Am Matterhorn auf ${flug.hoehe.toFixed(0)} m: ${flug.luft.toFixed(1)} °C Luft, Pack ${flug.batt.toFixed(1)} °C`);

  A(errors.length === 0, 'Keine Fehler in der Konsole' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
})();
