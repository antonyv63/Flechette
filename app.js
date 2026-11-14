'use strict';
/* =====================================================================
   FLÉCHETTE — appli de fléchettes : 01, Cricket, Horloge, Shanghai, Killer
   ===================================================================== */

/* ---------- Utilitaires ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};

const COLORS = ['#e3323c', '#1d9e5c', '#3fa7ff', '#ffc940', '#c04dff', '#ff8a3d', '#2ee6c8', '#ff5fa8'];
const BOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
const IMPOSSIBLE = new Set([163, 166, 169, 172, 173, 175, 176, 178, 179]);

const NICKS = ['Le Sniper', 'Triple Menace', 'Monsieur 180', 'La Fusée', "L'Œil de Lynx", 'Le Métronome', 'Double Trouble',
  "L'Horloger", 'Flèche d\'Or', 'Le Cyclone', 'Captain Checkout', 'Le Baron du Bull', 'La Gâchette', 'Dart Vader',
  'Le Tonton Flingueur', 'Madame Triple', 'The Machine', 'Le Chirurgien', 'Bullseye Bandit', 'La Tornade', 'Le Professeur',
  'Mister Madhouse', 'Le Faucon', 'Big Fish', 'Le Viking', 'Robin des Doubles', 'La Panthère', 'Le Sorcier du 20'];

const LEGENDS = [
  { name: 'Phil Taylor', nick: 'The Power', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', init: 'PT', c1: '#3fa7ff', c2: '#0b3d91',
    titles: '16 titres de champion du monde', text: "Le plus grand de tous les temps. Deux titres BDO puis quatorze PDC : il a écrasé le circuit pendant près de vingt ans. Ses moyennes au-dessus de 100 ont changé le niveau du jeu." },
  { name: 'Luke Littler', nick: 'The Nuke', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', init: 'LL', c1: '#ff8a3d', c2: '#a3280b',
    titles: 'Champion du monde 2025 et 2026', text: "Sacré à 17 ans en 2025, le plus jeune champion du monde de l'histoire. En janvier 2026, il conserve son titre en balayant Gian van Veen 7-1 et devient le premier à empocher un million de livres." },
  { name: 'Michael van Gerwen', nick: 'Mighty Mike', flag: '🇳🇱', init: 'MvG', c1: '#7fff5c', c2: '#1d7a2e',
    titles: '3 titres mondiaux PDC (2014, 2017, 2019)', text: "La machine néerlandaise au crâne rasé et au maillot vert. Champion du monde à 24 ans en 2014, record de précocité qui a tenu jusqu'à Littler. Une décennie de domination sur le circuit." },
  { name: 'Luke Humphries', nick: 'Cool Hand Luke', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', init: 'LH', c1: '#2ee6c8', c2: '#0b6b60',
    titles: 'Champion du monde 2024', text: "Le calme incarné. Il remporte le titre mondial 2024 en battant en finale… un certain Luke Littler, alors âgé de 16 ans." },
  { name: 'Raymond van Barneveld', nick: 'Barney', flag: '🇳🇱', init: 'RvB', c1: '#ff9d00', c2: '#9b4a00',
    titles: '5 titres mondiaux (4 BDO, 1 PDC)', text: "Le héros qui a fait des fléchettes un sport national aux Pays-Bas. En 2007, il bat Phil Taylor en finale PDC au terme d'un leg décisif en mort subite, l'une des finales les plus folles de l'histoire." },
  { name: 'Eric Bristow', nick: 'The Crafty Cockney', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', init: 'EB', c1: '#e3323c', c2: '#5b0a10',
    titles: '5 titres mondiaux dans les années 80', text: "Le premier grand showman des fléchettes, arrogant et génial. C'est aussi lui qui a repéré et soutenu un jeune Phil Taylor à ses débuts." },
  { name: 'John Lowe', nick: 'Old Stoneface', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', init: 'JL', c1: '#9aa7b0', c2: '#3a464e',
    titles: '3 titres mondiaux · 1er nine-darter télévisé', text: "Visage impassible, bras de métronome. En 1984, il réussit le tout premier 501 en neuf fléchettes retransmis à la télévision." },
  { name: 'Gary Anderson', nick: 'The Flying Scotsman', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', init: 'GA', c1: '#3f6bff', c2: '#101e66',
    titles: 'Champion du monde 2015 et 2016', text: "L'un des lancers les plus fluides et les plus beaux du circuit. Doublé mondial 2015-2016, et toujours capable d'aller loin à l'Ally Pally à plus de 50 ans." },
  { name: 'Peter Wright', nick: 'Snakebite', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', init: 'PW', c1: '#c04dff', c2: '#4a0a7a',
    titles: 'Champion du monde 2020 et 2022', text: "Crête colorée, tenues délirantes et un talent fou. Le personnage le plus reconnaissable du circuit, deux fois sacré à l'Ally Pally." },
  { name: 'Gerwyn Price', nick: 'The Iceman', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', init: 'GP', c1: '#bff7ff', c2: '#2a7da3',
    titles: 'Champion du monde 2021', text: "Ancien joueur de rugby gallois reconverti, célèbre pour ses célébrations explosives. Premier Gallois champion du monde PDC." },
  { name: 'Michael Smith', nick: 'Bully Boy', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', init: 'MS', c1: '#ffc940', c2: '#8a5a00',
    titles: 'Champion du monde 2023', text: "Il remporte la finale 2023 contre Van Gerwen avec, au passage, un nine-darter dans un leg où MvG a raté le sien de peu : souvent cité comme le plus grand leg de l'histoire." },
  { name: 'Fallon Sherrock', nick: 'Queen of the Palace', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', init: 'FS', c1: '#ff5fa8', c2: '#7a0a3d',
    titles: 'Pionnière des Mondiaux PDC', text: "En décembre 2019, elle devient la première femme à gagner un match aux championnats du monde PDC, puis enchaîne une deuxième victoire. L'Ally Pally a tremblé." },
  { name: 'Sid Waddell', nick: 'La voix des fléchettes', flag: '🎙️', init: 'SW', c1: '#efe2c4', c2: '#6b5a33',
    titles: 'Commentateur de légende', text: "Ses envolées lyriques ont accompagné l'âge d'or des fléchettes à la télé. Le trophée des champions du monde PDC porte aujourd'hui son nom." }
];

const FACTS = [
  "Le centre de la cible doit être à 1,73 m du sol, et la ligne de tir (l'« oche ») à 2,37 m de la cible.",
  "180, c'est le maximum en une volée : trois fléchettes dans le triple 20.",
  "170 est le plus gros finish possible en double out : T20, T20, Bull. On l'appelle le « Big Fish ».",
  "Sous 170, sept scores ne se finissent pas en 3 fléchettes : 169, 168, 166, 165, 163, 162 et 159. Ce sont les « bogey numbers ».",
  "Un 501 parfait se fait en 9 fléchettes, par exemple 180, 180 puis T20, T19, D12 (141).",
  "26 (20, 5, 1) se dit « Bed & Breakfast » : c'était le prix d'une nuit avec petit-déjeuner, 2 shillings et 6 pence.",
  "Le double 1 est surnommé « Madhouse », la maison des fous : c'est le pire double sur lequel finir.",
  "Les championnats du monde PDC se jouent chaque hiver à l'Alexandra Palace de Londres, surnommé l'« Ally Pally ».",
  "Le 20 est entouré du 5 et du 1 : rater le triple 20, ça coûte cher.",
  "L'ordre des numéros sur la cible : 20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5.",
  "Le Bull extérieur vaut 25, le centre (le Bull's eye) 50, et il compte comme un double pour finir.",
  "En 2026, le champion du monde PDC a touché 1 million de livres, le double de l'année précédente.",
  "Phil Taylor détient le record absolu avec 16 titres de champion du monde.",
  "« Game on ! » : c'est la formule de l'arbitre pour lancer un match.",
  "Quand un joueur bloque sur le triple 20, beaucoup basculent sur le triple 19 : c'est le « switch ».",
  "Le trophée des Mondiaux PDC s'appelle le Sid Waddell Trophy, en hommage au commentateur légendaire.",
  "Le tour de l'horloge (Around the Clock) est l'exercice d'entraînement le plus joué au monde."
];

const T = {
  t180: ['Digne de The Power !', "L'Ally Pally est debout !", 'Luke Littler prend des notes.', 'Trois dans le triple 20, rien que ça.', 'Mighty Mike approuve.', 'Sid Waddell en aurait perdu ses mots.'],
  t140: ['Grosse volée !', 'Ça envoie du lourd.', 'Le public chante ton nom.', 'Snakebite applaudit.'],
  t100: ['La tonne !', 'Le cap des 100 est franchi.', 'Joli coup de bras.', 'Ça, c\'est du solide.'],
  bust: ['On repart du même score.', 'Trop gourmand !', 'Même les rois des fléchettes en font.', 'Respire, vise, recommence.', 'La cible a gagné ce round.'],
  bnb: ['20, 5, 1… le grand classique des pubs anglais.', 'Une nuit et le petit-déj, comme on dit outre-Manche.'],
  zero: ['Même Barney a connu des soirs sans.', "La cible a bougé, c'est sûr.", "On n'en parle plus.", 'Le mur est content, lui.'],
  win: ["L'Ally Pally scande ton nom !", 'Le Sid Waddell Trophy est pour toi (en rêve).', 'Lève les bras comme Gerwyn Price !',
    'Une victoire digne de Mighty Mike.', 'Phil Taylor serait fier.', 'Game shot, and the match !']
};

/* ---------- Réglages ---------- */
const DEF_SET = { caller: true, lang: 'en', vibe: true, wake: true, input: 'pad' };
let SET = Object.assign({}, DEF_SET, store.get('fl_settings', {}));
const saveSet = () => store.set('fl_settings', SET);

/* ---------- Annonceur (voix) ---------- */
let voices = [];
function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) {} }
if ('speechSynthesis' in window) { loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {} }
function pickVoice(lang) {
  const l = lang.toLowerCase();
  const same = voices.filter(v => v.lang && v.lang.toLowerCase().replace('_', '-') === l);
  return same.find(v => /daniel|arthur|male|homme|thomas/i.test(v.name)) || same[0] ||
    voices.find(v => v.lang && v.lang.toLowerCase().startsWith(l.slice(0, 2)));
}
function say(lines) {
  if (!SET.caller || !('speechSynthesis' in window) || !lines || !lines.length) return;
  try {
    speechSynthesis.cancel();
    const lang = SET.lang === 'fr' ? 'fr-FR' : 'en-GB';
    const v = pickVoice(lang);
    lines.forEach(t => {
      const u = new SpeechSynthesisUtterance(t);
      u.lang = lang; if (v) u.voice = v;
      u.rate = SET.lang === 'fr' ? 1.02 : 0.95; u.pitch = 0.95;
      speechSynthesis.speak(u);
    });
  } catch (e) {}
}
const vibe = ms => { if (SET.vibe && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };

/* ---------- Fléchettes ---------- */
const dVal = d => d.n * d.m;
function dLabel(d) {
  if (!d || d.m === 0) return 'Raté';
  if (d.n === 25) return d.m === 2 ? 'Bull' : '25';
  return (d.m === 3 ? 'T' : d.m === 2 ? 'D' : '') + d.n;
}

/* ---------- Calcul des finishes ---------- */
const DBL_PREF = [20, 16, 18, 12, 10, 8, 14, 6, 4, 2, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1];
const ALL_DARTS = (() => {
  const a = [];
  for (let n = 20; n >= 1; n--) a.push({ n, m: 3 });
  a.push({ n: 25, m: 2 }, { n: 25, m: 1 });
  for (let n = 20; n >= 1; n--) a.push({ n, m: 1 });
  for (let n = 20; n >= 1; n--) a.push({ n, m: 2 });
  return a;
})();
function setupCost(d) {
  if (d.n === 25) return d.m === 2 ? 2.6 : 2.3;
  if (d.m === 1) return 1;
  if (d.m === 3) return d.n >= 17 ? 1.5 + (20 - d.n) * 0.1 : 2.2;
  return 3;
}
function finRank(d, out) {
  if (out === 'single') return setupCost(d) - 1;
  if (d.n === 25 && d.m === 2) return 12;
  if (d.m === 2) return DBL_PREF.indexOf(d.n);
  if (out === 'master' && d.m === 3) return 15 + (20 - d.n) * 0.01;
  return -1;
}
const finCache = {};
function finByVal(out) {
  if (finCache[out]) return finCache[out];
  const m = {};
  for (const d of ALL_DARTS) {
    const r = finRank(d, out); if (r < 0) continue;
    const v = dVal(d);
    if (!m[v] || r < m[v].r) m[v] = { d, r };
  }
  return (finCache[out] = m);
}
const coCache = {};
function checkout(rem, left, out) {
  const key = rem + '|' + left + '|' + out;
  if (key in coCache) return coCache[key];
  let best = null, bc = Infinity;
  const F = finByVal(out);
  if (rem >= 1 && left >= 1) {
    if (F[rem]) { best = [F[rem].d]; }
    if (!best && left >= 2) {
      for (const a of ALL_DARTS) {
        const f = F[rem - dVal(a)]; if (!f) continue;
        const c = setupCost(a) + f.r; if (c < bc) { bc = c; best = [a, f.d]; }
      }
    }
    if (!best && left >= 3) {
      for (const a of ALL_DARTS) for (const b of ALL_DARTS) {
        const f = F[rem - dVal(a) - dVal(b)]; if (!f) continue;
        const c = setupCost(a) + setupCost(b) + f.r; if (c < bc) { bc = c; best = [a, b, f.d]; }
      }
      if (best && dVal(best[1]) > dVal(best[0])) best = [best[1], best[0], best[2]];
    }
  }
  return (coCache[key] = best);
}

/* =====================================================================
   MOTEURS DE JEU — chaque partie = liste d'événements rejouée (annuler = facile)
   ===================================================================== */
function base(g) {
  return { type: g.type, cfg: g.cfg, cur: 0, roundStart: 0, round: 1, turn: 0, darts: [], over: false, winners: [], fx: [], last: null };
}
function nextTurn(st, info) {
  st.last = Object.assign({ pi: st.cur, darts: st.darts.slice(), turn: st.turn }, info || {});
  st.darts = []; st.turn++;
  const n = st.players.length; let i = st.cur, steps = 0;
  do { i = (i + 1) % n; steps++; if (i === st.roundStart) st.round++; } while (st.players[i].out && steps < n);
  st.cur = i;
}

/* ---- 01 ---- */
const X01 = {
  create(g) {
    const st = base(g), c = g.cfg; st.leg = 1; st.legStarter = 0;
    st.players = g.players.map(p => ({ ...p, score: c.start, opened: c.in !== 'double', legs: 0, sets: 0, vs: c.start, vo: true, legDarts: 0, legVisits: 0,
      s: { pts: 0, darts: 0, f9p: 0, f9d: 0, t180: 0, t140: 0, t100: 0, hiV: 0, hiCo: 0, co: 0, bestLeg: 0 } }));
    return st;
  },
  dart(st, d) {
    const c = st.cfg, p = st.players[st.cur];
    if (!st.darts.length) { p.vs = p.score; p.vo = p.opened; }
    st.darts.push(d); p.legDarts++; p.s.darts++;
    let v = dVal(d);
    if (!p.opened) { if (d.m === 2) p.opened = true; else v = 0; }
    const rem = p.score - v, out = c.out;
    const fin = out === 'single' || d.m === 2 || (out === 'master' && d.m === 3);
    if (rem < 0 || (rem === 1 && out !== 'single') || (rem === 0 && !fin)) {
      p.score = p.vs; p.opened = p.vo; this.close(st, p, 0, true, st.darts.length); return;
    }
    p.score = rem;
    if (rem === 0) { this.close(st, p, p.vs, false, st.darts.length); return; }
    if (st.darts.length === 3) this.close(st, p, p.vs - p.score, false, 3);
  },
  visit(st, total, nd) {
    const c = st.cfg, p = st.players[st.cur];
    p.vs = p.score; p.vo = p.opened; st.darts = [];
    if (!p.opened && total > 0) p.opened = true;
    const rem = p.score - total;
    if (rem < 0 || (rem === 1 && c.out !== 'single')) {
      p.score = p.vs; p.opened = p.vo; p.legDarts += 3; p.s.darts += 3; this.close(st, p, 0, true, 3, total); return;
    }
    p.score = rem; const k = rem === 0 ? nd : 3;
    p.legDarts += k; p.s.darts += k;
    this.close(st, p, total, false, k, total);
  },
  close(st, p, total, bust, nd, typed) {
    const c = st.cfg, s = p.s, pi = st.cur;
    s.pts += total;
    if (p.legVisits < 3) { s.f9p += total; s.f9d += nd; }
    p.legVisits++;
    if (total === 180) s.t180++; else if (total >= 140) s.t140++; else if (total >= 100) s.t100++;
    if (total > s.hiV) s.hiV = total;
    const info = { total, bust, rem: p.score, typed: typed != null ? typed : null };
    if (bust) { st.fx.push({ k: 'bust', pi, typed }); nextTurn(st, info); return; }
    if (p.score === 0) {
      s.co++; if (total > s.hiCo) s.hiCo = total;
      if (!s.bestLeg || p.legDarts < s.bestLeg) s.bestLeg = p.legDarts;
      p.legs++; let setWon = false, match = false;
      if (c.sets > 1) { if (p.legs >= c.legs) { p.sets++; setWon = true; st.players.forEach(q => q.legs = 0); if (p.sets >= c.sets) match = true; } }
      else if (p.legs >= c.legs) match = true;
      info.checkout = true;
      st.fx.push({ k: 'checkout', pi, total, nine: p.legDarts === 9 && c.start === 501, darts: p.legDarts, match, setWon });
      nextTurn(st, info);
      if (match) { st.over = true; st.winners = [pi]; return; }
      st.leg++; st.legStarter = (st.legStarter + 1) % st.players.length;
      st.players.forEach(q => { q.score = c.start; q.opened = c.in !== 'double'; q.legDarts = 0; q.legVisits = 0; });
      st.cur = st.legStarter; st.roundStart = st.legStarter; st.round = 1;
      return;
    }
    st.fx.push({ k: 'visit', pi, total, rem: p.score });
    nextTurn(st, info);
  }
};

/* ---- Cricket ---- */
const CR_T = [20, 19, 18, 17, 16, 15, 25];
const CRICKET = {
  create(g) {
    const st = base(g); st.vm = 0;
    st.players = g.players.map(p => ({ ...p, marks: Object.fromEntries(CR_T.map(t => [t, 0])), pts: 0, s: { marks: 0, darts: 0 } }));
    return st;
  },
  dart(st, d) {
    const mode = st.cfg.mode, p = st.players[st.cur], pi = st.cur;
    st.darts.push(d); p.s.darts++;
    if (d.m > 0 && CR_T.includes(d.n)) {
      const m = d.n === 25 ? Math.min(d.m, 2) : d.m, had = p.marks[d.n];
      const excess = had >= 3 ? m : Math.max(0, had + m - 3);
      let counted = m - excess;
      p.marks[d.n] = Math.min(3, had + m);
      if (excess > 0 && mode !== 'noscore') {
        const opp = st.players.filter(q => q !== p && q.marks[d.n] < 3);
        if (opp.length) {
          counted += excess;
          if (mode === 'cut') opp.forEach(q => q.pts += excess * d.n); else p.pts += excess * d.n;
        }
      }
      p.s.marks += counted; st.vm += counted;
      let w = this.won(st, p) ? pi : st.players.findIndex(q => this.won(st, q));
      if (w >= 0) {
        st.fx.push({ k: 'win', pi: w }); nextTurn(st, { marks: st.vm }); st.vm = 0;
        st.over = true; st.winners = [w]; return;
      }
    }
    if (st.darts.length === 3) {
      const tr = st.darts.filter(x => x.m === 3 && x.n !== 25 && CR_T.includes(x.n));
      const wh = tr.length === 3 && new Set(tr.map(x => x.n)).size === 3;
      st.fx.push({ k: 'crv', pi, marks: st.vm, wh });
      nextTurn(st, { marks: st.vm }); st.vm = 0;
    }
  },
  won(st, p) {
    if (!CR_T.every(t => p.marks[t] >= 3)) return false;
    const o = st.players.filter(q => q !== p);
    if (!o.length || st.cfg.mode === 'noscore') return true;
    return st.cfg.mode === 'cut' ? o.every(q => p.pts <= q.pts) : o.every(q => p.pts >= q.pts);
  }
};

/* ---- Tour de l'horloge ---- */
const CLOCK = {
  create(g) {
    const st = base(g), c = g.cfg;
    const nums = [...Array(20)].map((_, i) => i + 1); if (c.dir === 'desc') nums.reverse(); if (c.bull) nums.push(25);
    st.seq = nums;
    st.players = g.players.map(p => ({ ...p, idx: 0, s: { darts: 0, hits: 0 } }));
    return st;
  },
  dart(st, d) {
    const c = st.cfg, p = st.players[st.cur], pi = st.cur, tgt = st.seq[p.idx];
    st.darts.push(d); p.s.darts++;
    if (d.m > 0 && d.n === tgt) {
      let ok = true, adv = 1;
      if (c.mode === 'double') ok = d.m === 2;
      else if (c.mode === 'triple') ok = tgt === 25 ? d.m === 2 : d.m === 3;
      else if (c.mode === 'bonus' && tgt !== 25) adv = d.m;
      if (ok) {
        p.s.hits++;
        const lim = (c.bull && p.idx < 20) ? 20 : st.seq.length;
        p.idx = Math.min(p.idx + adv, lim);
        if (p.idx >= st.seq.length) { st.fx.push({ k: 'win', pi }); nextTurn(st, {}); st.over = true; st.winners = [pi]; return; }
      }
    }
    if (st.darts.length === 3) nextTurn(st, {});
  }
};

/* ---- Shanghai ---- */
const SHANGHAI = {
  create(g) {
    const st = base(g);
    st.players = g.players.map(p => ({ ...p, pts: 0, s: { darts: 0, hits: 0 } }));
    return st;
  },
  dart(st, d) {
    const p = st.players[st.cur], pi = st.cur, t = st.round;
    st.darts.push(d); p.s.darts++;
    if (d.m > 0 && d.n === t) { p.pts += t * d.m; p.s.hits++; }
    if (st.darts.length === 3) {
      const hits = st.darts.filter(x => x.n === t && x.m > 0);
      const ms = new Set(hits.map(x => x.m));
      const vis = hits.reduce((a, x) => a + dVal(x), 0);
      if (ms.size === 3) { st.fx.push({ k: 'shanghai', pi }); nextTurn(st, { total: vis }); st.over = true; st.winners = [pi]; return; }
      st.fx.push({ k: 'sh', pi, total: vis });
      nextTurn(st, { total: vis });
      if (st.round > st.cfg.rounds) {
        st.over = true;
        const mx = Math.max(...st.players.map(q => q.pts));
        st.winners = st.players.map((q, i) => q.pts === mx ? i : -1).filter(i => i >= 0);
        st.fx.push({ k: 'win', pi: st.winners[0] });
      }
    }
  }
};

/* ---- Killer ---- */
const KILLER = {
  create(g) {
    const st = base(g), c = g.cfg;
    st.players = g.players.map((p, i) => ({ ...p, num: c.nums[i], lives: c.lives, killer: false, out: false, s: { darts: 0, kills: 0 } }));
    return st;
  },
  dart(st, d) {
    const c = st.cfg, p = st.players[st.cur], pi = st.cur;
    st.darts.push(d); p.s.darts++;
    const h = (d.m === 0 || d.n === 25) ? 0 : (c.mode === 'double' ? (d.m === 2 ? 1 : 0) : d.m);
    if (h) {
      const oi = st.players.findIndex(q => q.num === d.n && !q.out);
      if (oi >= 0) {
        const o = st.players[oi];
        if (oi === pi) {
          if (!p.killer) { p.killer = true; st.fx.push({ k: 'killer', pi }); }
          else {
            p.lives = Math.max(0, p.lives - h); st.fx.push({ k: 'oops', pi });
            if (!p.lives) { p.out = true; st.fx.push({ k: 'elim', pi, by: pi }); }
          }
        } else if (p.killer) {
          o.lives = Math.max(0, o.lives - h);
          if (!o.lives) { o.out = true; p.s.kills++; st.fx.push({ k: 'elim', pi: oi, by: pi }); }
          else st.fx.push({ k: 'hit', pi: oi, by: pi });
        }
      }
      const alive = st.players.map((q, i) => q.out ? -1 : i).filter(i => i >= 0);
      if (alive.length <= 1) { nextTurn(st, {}); st.over = true; st.winners = alive; st.fx.push({ k: 'win', pi: alive[0] }); return; }
      if (p.out) { nextTurn(st, {}); return; }
    }
    if (st.darts.length === 3) nextTurn(st, {});
  }
};

const ENG = { x01: X01, cricket: CRICKET, clock: CLOCK, shanghai: SHANGHAI, killer: KILLER };
function replay(game) {
  const E = ENG[game.type], st = E.create(game);
  for (const ev of game.events) { st.fx = []; applyEv(E, st, ev); }
  return st;
}
function applyEv(E, st, ev) {
  if (st.over) return;
  if (ev.t === 'd') E.dart(st, { n: ev.n, m: ev.m });
  else if (ev.t === 'v') E.visit(st, ev.total, ev.nd);
  else if (ev.t === 'end') { const t0 = st.turn; let g = 0; while (st.turn === t0 && !st.over && g++ < 4) E.dart(st, { n: 0, m: 0 }); }
}

/* =====================================================================
   INTERFACE PAR JEU
   ===================================================================== */
const OUT_L = { single: 'Simple', double: 'Double', master: 'Master' };
const pcard = (p, i, st, inner, extra = '') =>
  `<div class="pcard ${i === st.cur && !st.over ? 'cur' : ''} ${p.out ? 'out' : ''} ${st.over && st.winners.includes(i) ? 'win' : ''} ${extra}" style="--pc:${p.color}"><div class="pc-name">${esc(p.name)}</div>${inner}</div>`;
const cardsWrap = (st, html) => `<div class="cards n${st.players.length}">${html}</div>`;
const avg3 = (s, live = 0) => (s.darts - live) > 0 ? (s.pts / (s.darts - live) * 3).toFixed(1) : '–';

const UI = {
  x01: {
    title(st) {
      const c = st.cfg; let t = `${c.start} · ${OUT_L[c.out]}`;
      if (c.in === 'double') t += ' · DI';
      if (c.sets > 1 || c.legs > 1) t += ` · Leg ${st.leg}`;
      return t;
    },
    score(st) {
      const c = st.cfg;
      return cardsWrap(st, st.players.map((p, i) => {
        let lg = '';
        if (c.sets > 1) lg = `<span>Sets <b>${p.sets}</b></span><span>Legs <b>${p.legs}</b></span>`;
        else if (c.legs > 1) lg = `<span>Legs <b>${p.legs}</b>/${c.legs}</span>`;
        return pcard(p, i, st, `<div class="pc-big">${p.score}</div><div class="pc-meta">${lg}<span>Moy <b>${avg3(p.s, i === st.cur && !st.over ? st.darts.length : 0)}</b></span></div>${!p.opened ? '<div class="pc-tag">Double pour ouvrir</div>' : ''}`);
      }).join(''));
    },
    visitTotal(st) { const p = st.players[st.cur]; return st.darts.length ? p.vs - p.score : ''; },
    route(st) { const p = st.players[st.cur]; return p.opened ? checkout(p.score, 3 - st.darts.length, st.cfg.out) : null; },
    info(st) {
      const p = st.players[st.cur], left = 3 - st.darts.length;
      if (!p.opened) return 'Ouvre avec un <b>DOUBLE</b>';
      const r = this.route(st);
      if (r) return `Finish : <b>${r.map(dLabel).join(' · ')}</b>`;
      if (p.score <= 170 && st.cfg.out !== 'single' && S.ui.input !== 'total') return `Pas de finish possible avec ${left} fléchette${left > 1 ? 's' : ''} · prépare-toi un double`;
      if (S.ui.input === 'total') return 'Entre le score de ta volée';
      return `Reste <b>${p.score}</b> · ${left} fléchette${left > 1 ? 's' : ''}`;
    },
    hl(st) { const r = this.route(st); return r ? { set: new Set([r[0].n]) } : {}; },
    lastText(st) {
      const l = st.last, p = st.players[l.pi];
      const ds = l.darts.length ? l.darts.map(dLabel).join(' · ') + ' = ' : '';
      if (l.bust) return `${esc(p.name)} : ${l.darts.map(dLabel).join(' · ')} <b>BUST</b>`;
      if (l.checkout) return `${esc(p.name)} finit <b>${l.total}</b> 🎯`;
      return `${esc(p.name)} : ${ds}<b>${l.total}</b> · reste ${l.rem}`;
    },
    stats(st) {
      const P = st.players, r = (lbl, f) => [lbl, ...P.map(f)];
      const rows = [
        r('Moyenne (3 fl.)', p => avg3(p.s)),
        r('Moy. 9 premières', p => p.s.f9d ? (p.s.f9p / p.s.f9d * 3).toFixed(1) : '–'),
        r('180', p => p.s.t180), r('140+', p => p.s.t140), r('100+', p => p.s.t100),
        r('Meilleure volée', p => p.s.hiV || '–'), r('Meilleur finish', p => p.s.hiCo || '–'),
        r('Meilleur leg', p => p.s.bestLeg ? p.s.bestLeg + ' fl.' : '–'), r('Fléchettes', p => p.s.darts)
      ];
      if (st.cfg.legs > 1 || st.cfg.sets > 1) rows.unshift(r(st.cfg.sets > 1 ? 'Sets' : 'Legs', p => st.cfg.sets > 1 ? p.sets : p.legs));
      return rows;
    }
  },
  cricket: {
    title(st) { return 'Cricket' + ({ std: '', cut: ' · Cut-throat', noscore: ' · Sans points' }[st.cfg.mode]); },
    score(st, inter) {
      const P = st.players, np = P.length, ns = st.cfg.mode === 'noscore';
      let h = `<div class="cr ${inter ? 'inter' : ''}" style="--np:${np}">`;
      h += `<div class="cr-row cr-head">${P.map((p, i) => `<div class="cr-ph ${i === st.cur && !st.over ? 'cur' : ''}" style="--pc:${p.color}"><span>${esc(p.name)}</span><b>${ns ? mprOf(p) : p.pts}</b></div>`).join('')}<div class="cr-num" style="font-size:11px;color:var(--muted);font-family:inherit">${ns ? 'MPR' : 'PTS'}</div>${inter ? '<div></div>' : ''}</div>`;
      for (const t of CR_T) {
        const dead = P.every(p => p.marks[t] >= 3);
        h += `<div class="cr-row ${dead ? 'dead' : ''}">${P.map((p, i) => `<div class="cr-m ${i === st.cur && !st.over ? 'cur' : ''}">${markSVG(p.marks[t], p.color)}</div>`).join('')}<div class="cr-num">${t === 25 ? 'BULL' : t}</div>`;
        if (inter) h += `<div class="cr-btns"><button data-cr="${t}" data-m="1">S</button><button data-cr="${t}" data-m="2">D</button>${t !== 25 ? `<button data-cr="${t}" data-m="3">T</button>` : '<span></span>'}</div>`;
        h += '</div>';
      }
      return h + '</div>';
    },
    visitTotal(st) { return st.darts.length ? st.vm + ' ✕' : ''; },
    info(st) { const p = st.players[st.cur]; return `MPR <b>${mprOf(p)}</b> · ${st.cfg.mode === 'cut' ? 'Cut-throat : tes points vont aux autres !' : 'Ferme 20 → 15 + Bull'}`; },
    hl(st) { return { set: new Set(CR_T.filter(t => !st.players.every(p => p.marks[t] >= 3))) }; },
    lastText(st) { const l = st.last, p = st.players[l.pi]; return `${esc(p.name)} : ${l.darts.map(dLabel).join(' · ')} → <b>${l.marks || 0}</b> marque${l.marks > 1 ? 's' : ''}`; },
    stats(st) {
      const P = st.players;
      return [['Points', ...P.map(p => p.pts)], ['MPR', ...P.map(mprOf)], ['Marques', ...P.map(p => p.s.marks)], ['Fléchettes', ...P.map(p => p.s.darts)]];
    }
  },
  clock: {
    title(st) { return `Horloge · ${st.cfg.dir === 'asc' ? '1 → 20' : '20 → 1'}`; },
    tgt(st, p) { const t = st.seq[p.idx]; return t == null ? '✓' : t === 25 ? 'BULL' : t; },
    score(st) {
      return cardsWrap(st, st.players.map((p, i) => pcard(p, i, st,
        `<div class="pc-big">${this.tgt(st, p)}</div><div class="bar"><i style="width:${p.idx / st.seq.length * 100}%"></i></div><div class="pc-meta"><span>${p.idx}/${st.seq.length}</span><span><b>${p.s.darts}</b> fl.</span></div>`)).join(''));
    },
    info(st) {
      const p = st.players[st.cur], m = st.cfg.mode;
      const z = { simple: '', bonus: ' · double = +2, triple = +3', double: ' · <u>double</u> uniquement', triple: ' · <u>triple</u> uniquement' }[m];
      return `Vise le <b>${this.tgt(st, p)}</b>${z}`;
    },
    hl(st) { const t = st.seq[st.players[st.cur].idx]; return { set: new Set([t]) }; },
    lastText(st) { const l = st.last, p = st.players[l.pi]; return `${esc(p.name)} : ${l.darts.map(dLabel).join(' · ')}`; },
    stats(st) {
      const P = st.players;
      return [['Progression', ...P.map(p => `${p.idx}/${st.seq.length}`)], ['Fléchettes', ...P.map(p => p.s.darts)],
        ['Précision', ...P.map(p => p.s.darts ? Math.round(p.s.hits / p.s.darts * 100) + ' %' : '–')]];
    }
  },
  shanghai: {
    title(st) { return `Shanghai · Manche ${Math.min(st.round, st.cfg.rounds)}/${st.cfg.rounds}`; },
    score(st) {
      return cardsWrap(st, st.players.map((p, i) => pcard(p, i, st, `<div class="pc-big">${p.pts}</div><div class="pc-meta"><span><b>${p.s.hits}</b> touches</span></div>`)).join(''));
    },
    visitTotal(st) { const t = st.round; return st.darts.length ? st.darts.reduce((a, x) => a + (x.n === t ? dVal(x) : 0), 0) : ''; },
    info(st) { return `Manche ${st.round} : vise le <b>${st.round}</b> · S + D + T = SHANGHAI`; },
    hl(st) { return { set: new Set([st.round]) }; },
    lastText(st) { const l = st.last, p = st.players[l.pi]; return `${esc(p.name)} : ${l.darts.map(dLabel).join(' · ')} = <b>${l.total || 0}</b>`; },
    stats(st) {
      const P = st.players;
      return [['Points', ...P.map(p => p.pts)], ['Touches', ...P.map(p => p.s.hits)], ['Précision', ...P.map(p => p.s.darts ? Math.round(p.s.hits / p.s.darts * 100) + ' %' : '–')]];
    }
  },
  killer: {
    title(st) { return `Killer · ${st.cfg.mode === 'double' ? 'Doubles' : 'Segments'}`; },
    score(st) {
      return cardsWrap(st, st.players.map((p, i) => pcard(p, i, st,
        `<div class="knum">${p.num}</div><div class="lives">${'❤️'.repeat(p.lives)}${'🖤'.repeat(Math.max(0, st.cfg.lives - p.lives))}</div>${p.out ? '<div class="pc-tag red">☠️ Éliminé</div>' : p.killer ? '<div class="pc-tag red">🔪 Killer</div>' : '<div class="pc-tag">En attente</div>'}`, 'kcard')).join(''));
    },
    info(st) {
      const p = st.players[st.cur], z = st.cfg.mode === 'double' ? 'le double ' : 'le ';
      return p.killer ? 'Tu es <b>KILLER</b> 🔪 vise les numéros adverses' : `Touche ${z}<b>${p.num}</b> pour devenir Killer`;
    },
    hl(st) {
      const p = st.players[st.cur], own = {};
      st.players.forEach(q => { if (!q.out) own[q.num] = q.color; });
      const set = p.killer ? new Set(st.players.filter(q => q !== p && !q.out).map(q => q.num)) : new Set([p.num]);
      return { set, own };
    },
    lastText(st) { const l = st.last, p = st.players[l.pi]; return `${esc(p.name)} : ${l.darts.map(dLabel).join(' · ')}`; },
    stats(st) {
      const P = st.players;
      return [['Numéro', ...P.map(p => p.num)], ['Vies', ...P.map(p => p.lives)], ['Éliminations', ...P.map(p => p.s.kills)], ['Fléchettes', ...P.map(p => p.s.darts)]];
    }
  }
};
function mprOf(p) { return p.s.darts ? (p.s.marks / (p.s.darts / 3)).toFixed(2) : '0.00'; }
function markSVG(k, color) {
  const c = color || '#fff';
  if (!k) return '';
  const sl = `<line x1="7" y1="25" x2="25" y2="7" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`;
  const bs = `<line x1="7" y1="7" x2="25" y2="25" stroke="${c}" stroke-width="3.4" stroke-linecap="round"/>`;
  const ci = `<circle cx="16" cy="16" r="13" fill="none" stroke="${c}" stroke-width="3"/>`;
  return `<svg viewBox="0 0 32 32">${sl}${k >= 2 ? bs : ''}${k >= 3 ? ci : ''}</svg>`;
}

/* =====================================================================
   CIBLE SVG
   ===================================================================== */
function boardSVG(deco) {
  const R = { bi: 9, bo: 20, ti: 94, to: 110, di: 154, do: 170 };
  const P = (r, a) => { const t = a * Math.PI / 180; return [(r * Math.sin(t)).toFixed(2), (-r * Math.cos(t)).toFixed(2)]; };
  const sector = (r1, r2, a1, a2) => {
    const [x1, y1] = P(r1, a1), [x2, y2] = P(r2, a1), [x3, y3] = P(r2, a2), [x4, y4] = P(r1, a2);
    return `M${x1} ${y1}L${x2} ${y2}A${r2} ${r2} 0 0 1 ${x3} ${y3}L${x4} ${y4}A${r1} ${r1} 0 0 0 ${x1} ${y1}Z`;
  };
  let s = `<svg viewBox="-200 -200 400 400" class="board" xmlns="http://www.w3.org/2000/svg"><circle r="199" class="b-bg" data-n="0" data-m="0"/><circle r="197" class="b-ring"/>`;
  BOARD_ORDER.forEach((n, i) => {
    const a1 = i * 18 - 9, a2 = i * 18 + 9, dark = i % 2 === 0;
    [[R.bo, R.ti, 1, 's'], [R.ti, R.to, 3, 'r'], [R.to, R.di, 1, 's'], [R.di, R.do, 2, 'r']].forEach(([r1, r2, m, k]) => {
      const cls = k === 's' ? (dark ? 'b-dark' : 'b-light') : (dark ? 'b-red' : 'b-green');
      s += `<path d="${sector(r1, r2, a1, a2)}" class="seg ${cls}" data-n="${n}" data-m="${m}"/>`;
    });
    const [tx, ty] = P(185, i * 18);
    s += `<text x="${tx}" y="${ty}" class="b-num" data-num="${n}">${n}</text>`;
  });
  s += `<circle r="${R.bo}" class="seg b-green" data-n="25" data-m="1"/><circle r="${R.bi}" class="seg b-red" data-n="25" data-m="2"/>`;
  if (deco) s += `<g transform="rotate(-35) translate(30 -40)"><path d="M0 0 L120 -6 L120 6 Z" fill="#c9ced3"/><rect x="120" y="-5" width="45" height="10" rx="4" fill="#e3323c"/><path d="M165 -4 L200 -24 L192 0 L200 24 L165 4 Z" fill="#ffc940"/></g>`;
  return s + '<g class="marks"></g></svg>';
}

/* =====================================================================
   ÉTAT APPLI & NAVIGATION
   ===================================================================== */
const DEF_SETUP = {
  type: 'x01',
  x01: { start: 501, in: 'single', out: 'double', legs: 1, sets: 1 },
  cricket: { mode: 'std' },
  clock: { dir: 'asc', mode: 'simple', bull: true },
  shanghai: { rounds: 7 },
  killer: { lives: 3, mode: 'double' },
  players: [{ name: '', color: COLORS[0], nick: '' }, { name: '', color: COLORS[1], nick: '' }]
};
function loadSetup() {
  const s = store.get('fl_setup', null), d = JSON.parse(JSON.stringify(DEF_SETUP));
  if (!s) return d;
  for (const k of Object.keys(d)) if (s[k] != null) d[k] = (typeof d[k] === 'object' && !Array.isArray(d[k])) ? Object.assign(d[k], s[k]) : s[k];
  if (!Array.isArray(d.players) || !d.players.length) d.players = DEF_SETUP.players;
  return d;
}
const S = { game: null, st: null, setup: loadSetup(), ui: { mod: 1, buf: '', marks: [], endShown: false, input: SET.input, lastTurn: -1 } };

function show(id) {
  $$('.screen').forEach(s => s.classList.toggle('active', s.id === id));
  window.scrollTo(0, 0);
  wake(id === 'game');
  if (id === 'home') renderHome();
  if (id === 'setup') renderSetup();
  if (id === 'legends') renderLegends();
  if (id === 'stats') renderStats();
  if (id === 'settings') renderSettings();
}
let wl = null;
async function wake(on) {
  try {
    if (on && SET.wake && 'wakeLock' in navigator) { if (!wl) { wl = await navigator.wakeLock.request('screen'); wl.addEventListener('release', () => { wl = null; }); } }
    else if (!on && wl) { await wl.release(); wl = null; }
  } catch (e) {}
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && $('#game').classList.contains('active')) wake(true); });

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2300);
}
function modal(html, lock) {
  const m = $('#modal'); m.innerHTML = `<div class="sheet">${html}</div>`; m.classList.add('show'); m.dataset.lock = lock ? '1' : '';
}
function closeModal() { const m = $('#modal'); m.classList.remove('show'); m.innerHTML = ''; }
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal' && !e.currentTarget.dataset.lock) closeModal(); });

let fxTimer = null;
function showFx(o) {
  const el = $('#fx');
  el.innerHTML = `<div class="fx-in ${o.cls || ''}">${o.tag ? `<div class="fx-tag">${o.tag}</div>` : ''}<div class="fx-big">${o.big}</div>${o.flames ? '<div class="fx-flames">🔥🔥🔥</div>' : ''}${o.sub ? `<div class="fx-sub">${o.sub}</div>` : ''}</div>`;
  el.classList.add('show');
  if (o.shake) { document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake'); }
  if (o.confetti) confetti(70);
  clearTimeout(fxTimer); fxTimer = setTimeout(hideFx, o.dur || 1500);
}
function hideFx() { $('#fx').classList.remove('show'); document.body.classList.remove('shake'); }
$('#fx').addEventListener('click', hideFx);
function confetti(n = 120) {
  const cols = ['#e3323c', '#1d9e5c', '#ffc940', '#efe2c4', '#3fa7ff', '#ff8a3d'];
  for (let i = 0; i < n; i++) {
    const c = document.createElement('div'); c.className = 'cf';
    c.style.left = Math.random() * 100 + 'vw'; c.style.background = rnd(cols);
    c.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
    c.style.animationDuration = (2 + Math.random() * 2.2) + 's'; c.style.animationDelay = (Math.random() * .5) + 's';
    document.body.appendChild(c); setTimeout(() => c.remove(), 5000);
  }
}

/* =====================================================================
   ACCUEIL
   ===================================================================== */
const TYPE_L = { x01: '01', cricket: 'Cricket', clock: "Tour de l'horloge", shanghai: 'Shanghai', killer: 'Killer' };
function describe(g) {
  const t = g.type === 'x01' ? String(g.cfg.start) : TYPE_L[g.type];
  return `${t} · ${g.players.map(p => p.name).join(', ')}`;
}
let factIdx = Math.floor(Math.random() * FACTS.length);
function renderHome() {
  if (!$('#hero-board').innerHTML) $('#hero-board').innerHTML = boardSVG(false);
  const cur = store.get('fl_current', null);
  const b = $('#btn-resume');
  if (cur && !cur.over && cur.events && cur.events.length) { b.hidden = false; $('#resume-desc').textContent = describe(cur); }
  else b.hidden = true;
  $('#fact-t').textContent = FACTS[factIdx % FACTS.length];
  const day = Math.floor(Date.now() / 864e5) % LEGENDS.length;
  $('#legend-day').innerHTML = `<div class="ld-h">👑 Légende du jour</div>${legendHTML(LEGENDS[day])}`;
}
$('#fact').addEventListener('click', () => { factIdx++; $('#fact-t').textContent = FACTS[factIdx % FACTS.length]; });
$('#btn-resume').addEventListener('click', () => {
  const cur = store.get('fl_current', null); if (!cur) return;
  S.game = cur; S.st = replay(cur); S.ui.endShown = false; S.ui.lastTurn = S.st.turn; S.ui.buf = ''; S.ui.mod = 1;
  show('game'); renderGame();
});
document.addEventListener('click', e => {
  const g = e.target.closest('[data-go]'); if (g) { show(g.dataset.go); }
});

/* =====================================================================
   CONFIGURATION DE PARTIE
   ===================================================================== */
const GTYPES = [
  { id: 'x01', ic: '🎯', name: '01', desc: '101 à 901' },
  { id: 'cricket', ic: '🏏', name: 'Cricket', desc: '20 → 15 + Bull' },
  { id: 'clock', ic: '🕐', name: 'Horloge', desc: '1 → 20 ou 20 → 1' },
  { id: 'shanghai', ic: '🏮', name: 'Shanghai', desc: 'Manche par manche' },
  { id: 'killer', ic: '🔪', name: 'Killer', desc: 'Le dernier debout' }
];
const OPTS = {
  x01: [['start', 'Score de départ', [[101, '101'], [201, '201'], [301, '301'], [501, '501'], [701, '701'], [901, '901']]],
    ['in', 'Entrée', [['single', 'Directe'], ['double', 'Double in']]],
    ['out', 'Sortie', [['single', 'Simple'], ['double', 'Double'], ['master', 'Master']]],
    ['legs', 'Legs (premier à)', [[1, '1'], [2, '2'], [3, '3'], [4, '4'], [5, '5'], [7, '7']]],
    ['sets', 'Sets (premier à)', [[1, 'Aucun'], [2, '2'], [3, '3'], [4, '4']]]],
  cricket: [['mode', 'Mode', [['std', 'Classique'], ['cut', 'Cut-throat'], ['noscore', 'Sans points']]]],
  clock: [['dir', 'Sens', [['asc', '1 → 20'], ['desc', '20 → 1']]],
    ['mode', 'Zones qui comptent', [['simple', 'Toutes'], ['bonus', 'Bonus D/T'], ['double', 'Doubles'], ['triple', 'Triples']]],
    ['bull', 'Finir au Bull', [[true, 'Oui'], [false, 'Non']]]],
  shanghai: [['rounds', 'Manches', [[7, '1 → 7'], [10, '1 → 10'], [20, '1 → 20']]]],
  killer: [['lives', 'Vies', [[3, '3'], [5, '5']]], ['mode', 'Zones', [['double', 'Doubles (classique)'], ['segment', 'Tout le segment']]]]
};
const HINTS = {
  x01: c => c.start === 501 && c.out === 'double' ? 'Le format des pros : 501 double out. Neuf fléchettes minimum pour un leg parfait.' :
    c.start <= 201 ? 'Format court, parfait pour un apéro ou pour s\'entraîner aux finishes.' : 'Plus le score est haut, plus la partie est longue.',
  cricket: c => ({ std: 'Ferme tes numéros, puis marque des points sur ceux que l\'adversaire n\'a pas fermés.', cut: 'Tes points en trop vont chez les autres : le score le plus bas gagne.', noscore: 'Pas de points : le premier qui ferme tout gagne.' }[c.mode]),
  clock: () => "L'exercice d'entraînement préféré des joueurs de bar comme des pros.",
  shanghai: () => 'Simple + double + triple du numéro de la manche dans la même volée = victoire immédiate.',
  killer: () => 'Chacun reçoit un numéro au hasard. 2 joueurs minimum, encore mieux à 4 ou plus.'
};
function renderSetup() {
  const su = S.setup;
  $('#gtypes').innerHTML = GTYPES.map(t => `<button class="gtype ${su.type === t.id ? 'on' : ''}" data-type="${t.id}"><span class="gi">${t.ic}</span><span><b>${t.name}</b><small>${t.desc}</small></span></button>`).join('');
  const c = su[su.type];
  $('#gopts').innerHTML = OPTS[su.type].map(([k, lbl, opts]) =>
    `<div class="opt"><label>${lbl}</label><div class="chips">${opts.map(([v, l]) => `<button class="chip ${c[k] === v ? 'on' : ''}" data-ok="${k}" data-ov='${JSON.stringify(v)}'>${l}</button>`).join('')}</div></div>`).join('') +
    `<div class="opt-hint">${HINTS[su.type](c)}</div>`;
  renderPlayers();
}
function renderPlayers() {
  const su = S.setup;
  $('#pcount').textContent = `(${su.players.length}/8)`;
  $('#plist').innerHTML = su.players.map((p, i) => `<div class="prow">
      <button class="swatch" style="--pc:${p.color}" data-pcol="${i}" aria-label="Couleur">${i + 1}</button>
      <div class="pmain"><input data-pname="${i}" value="${esc(p.name)}" placeholder="Joueur ${i + 1}" maxlength="16" autocomplete="off" autocapitalize="words"><div class="nick">${p.nick ? '« ' + esc(p.nick) + ' »' : ''}</div></div>
      <button class="pbtn" data-pnick="${i}" aria-label="Surnom">🎲</button>
      ${su.players.length > 1 ? `<button class="pbtn" data-pdel="${i}" aria-label="Retirer">✕</button>` : ''}
    </div>`).join('');
  const names = new Set(su.players.map(p => p.name.trim().toLowerCase()));
  const roster = store.get('fl_roster', []).filter(r => !names.has(r.name.toLowerCase()));
  $('#roster').innerHTML = roster.length && su.players.length < 8 ? roster.slice(0, 12).map(r => `<button class="chip" data-radd="${esc(r.name)}">＋ ${esc(r.name)}</button>`).join('') : '';
  $('#padd').disabled = su.players.length >= 8;
}
const saveSetup = () => store.set('fl_setup', S.setup);
function freeColor() { const used = S.setup.players.map(p => p.color); return COLORS.find(c => !used.includes(c)) || rnd(COLORS); }
$('#setup').addEventListener('click', e => {
  const su = S.setup, t = e.target.closest('button'); if (!t) return;
  if (t.dataset.type) { su.type = t.dataset.type; renderSetup(); }
  else if (t.dataset.ok) { su[su.type][t.dataset.ok] = JSON.parse(t.dataset.ov); renderSetup(); }
  else if (t.dataset.pcol != null) { const p = su.players[+t.dataset.pcol]; p.color = COLORS[(COLORS.indexOf(p.color) + 1) % COLORS.length]; renderPlayers(); }
  else if (t.dataset.pnick != null) { const p = su.players[+t.dataset.pnick]; let n; do { n = rnd(NICKS); } while (n === p.nick); p.nick = n; renderPlayers(); }
  else if (t.dataset.pdel != null) { su.players.splice(+t.dataset.pdel, 1); renderPlayers(); }
  else if (t.dataset.radd != null) { const r = store.get('fl_roster', []).find(x => x.name === t.dataset.radd); su.players.push({ name: t.dataset.radd, color: freeColor(), nick: r && r.nick || '' }); renderPlayers(); }
  else if (t.id === 'padd') { if (su.players.length < 8) { su.players.push({ name: '', color: freeColor(), nick: '' }); renderPlayers(); const ins = $$('#plist input'); ins[ins.length - 1].focus(); } }
  else if (t.id === 'pshuffle') { shuffle(su.players); renderPlayers(); toast('Ordre mélangé 🔀'); }
  else if (t.id === 'start') { startGame(); }
  saveSetup();
});
$('#setup').addEventListener('input', e => { const i = e.target.dataset.pname; if (i != null) { S.setup.players[+i].name = e.target.value; saveSetup(); } });

function startGame() {
  const su = S.setup;
  const players = su.players.map((p, i) => ({ name: (p.name || '').trim() || `Joueur ${i + 1}`, color: p.color, nick: p.nick || '' }));
  if (su.type === 'killer' && players.length < 2) { toast('Le Killer se joue à 2 minimum'); return; }
  const roster = store.get('fl_roster', []);
  players.forEach(p => { if (/^Joueur \d+$/.test(p.name)) return; const i = roster.findIndex(r => r.name.toLowerCase() === p.name.toLowerCase()); if (i >= 0) roster.splice(i, 1); roster.unshift({ name: p.name, nick: p.nick }); });
  store.set('fl_roster', roster.slice(0, 30));
  newGame(su.type, JSON.parse(JSON.stringify(su[su.type])), players);
}
function newGame(type, cfg, players) {
  if (type === 'killer') cfg.nums = shuffle([...Array(20)].map((_, i) => i + 1)).slice(0, players.length);
  S.game = { type, cfg, players, events: [], id: Date.now() };
  S.st = replay(S.game); S.ui.endShown = false; S.ui.marks = []; S.ui.buf = ''; S.ui.mod = 1; S.ui.lastTurn = 0;
  saveCur(); closeModal(); show('game'); renderGame();
  const f = players[0];
  showFx({ tag: TYPE_L[type] === '01' ? String(cfg.start) : TYPE_L[type].toUpperCase(), big: 'GAME ON !', sub: `${esc(f.name)} lance en premier`, dur: 1300 });
  say([SET.lang === 'fr' ? `Game on ! ${f.name}, à toi.` : `Game on! ${f.name} to throw first.`]);
}
function saveCur() { if (!S.game) return; S.game.over = S.st.over; store.set('fl_current', S.game); }

/* =====================================================================
   ÉCRAN DE JEU
   ===================================================================== */
function renderGame() {
  const st = S.st, U = UI[st.type];
  $('#g-title').textContent = U.title(st);
  const modes = st.type === 'x01' ? ['pad', 'board', 'total'] : ['pad', 'board'];
  if (!modes.includes(S.ui.input)) S.ui.input = 'pad';
  $('#g-modes').innerHTML = modes.map(m => `<button data-input="${m}" class="${S.ui.input === m ? 'on' : ''}">${{ pad: 'Pavé', board: 'Cible', total: 'Volée' }[m]}</button>`).join('');
  const crPad = st.type === 'cricket' && S.ui.input === 'pad';
  $('#g-score').innerHTML = U.score(st, crPad && !st.over);
  $('#g-turn').innerHTML = turnHTML(st);
  const gl = $('#g-last');
  gl.innerHTML = st.last ? U.lastText(st) : '';
  if (st.turn !== S.ui.lastTurn) { gl.classList.remove('flash'); void gl.offsetWidth; gl.classList.add('flash'); S.ui.lastTurn = st.turn; }
  renderInput(st, crPad);
}
function turnHTML(st) {
  if (st.over) return `<div class="turn over">🏆 Partie terminée : ${st.winners.map(i => esc(st.players[i].name)).join(' & ')}</div>`;
  const p = st.players[st.cur], U = UI[st.type];
  const slots = [0, 1, 2].map(i => {
    const d = st.darts[i];
    return d ? `<div class="slot f ${d.m === 3 ? 't' : d.m === 2 ? 'd' : ''} ${d.m === 0 ? 'x' : ''}">${esc(dLabel(d))}</div>` : `<div class="slot">${i + 1}</div>`;
  }).join('');
  const tot = U.visitTotal ? U.visitTotal(st) : '';
  const showSlots = !(st.type === 'x01' && S.ui.input === 'total');
  return `<div class="turn" style="--pc:${p.color}"><div class="turn-who"><span class="dot"></span><span>À toi,</span><b>${esc(p.name)}</b>${p.nick ? `<i>« ${esc(p.nick)} »</i>` : ''}</div>
    ${showSlots ? `<div class="slots">${slots}<div class="slot-total">${tot}</div></div>` : ''}
    <div class="turn-info">${U.info(st)}</div></div>`;
}
function renderInput(st, crPad) {
  const el = $('#g-input'), act = $('#g-actions');
  const undoBtn = `<button class="act" data-act="undo" ${S.game.events.length ? '' : 'disabled'}>↩ Annuler</button>`;
  if (st.over) {
    el.innerHTML = `<button class="btn primary" data-act="end">🏆 Voir le résultat</button>`;
    act.className = 'actions one'; act.innerHTML = undoBtn; return;
  }
  if (S.ui.input === 'board') {
    if (!el.querySelector('svg.board')) el.innerHTML = `<div class="board-wrap">${boardSVG(false)}</div>`;
    const h = UI[st.type].hl ? UI[st.type].hl(st) : {};
    $$('svg.board .seg', el).forEach(s => s.classList.toggle('hl', !!(h.set && h.set.has(+s.dataset.n))));
    $$('svg.board .b-num', el).forEach(s => s.classList.toggle('hl', !!(h.set && h.set.has(+s.dataset.num))));
    const mk = S.ui.marks.filter(m => m.turn === st.turn).slice(0, st.darts.length);
    $('svg.board .marks', el).innerHTML = mk.map(m => `<circle class="mk" cx="${m.x}" cy="${m.y}" r="6"/>`).join('');
  } else if (S.ui.input === 'total') el.innerHTML = totalHTML(st);
  else if (crPad) el.innerHTML = '';
  else el.innerHTML = padHTML(st);
  if (S.ui.input === 'total') { act.className = 'actions one'; act.innerHTML = undoBtn; }
  else { act.className = 'actions'; act.innerHTML = `${undoBtn}<button class="act miss" data-act="miss">RATÉ</button><button class="act" data-act="next">Fin de volée ⏭</button>`; }
}
function padHTML(st) {
  const h = UI[st.type].hl ? UI[st.type].hl(st) : {}, m = S.ui.mod, hs = h.set || new Set();
  let s = `<div class="pad m${m}"><div class="mods"><button class="mod ${m === 2 ? 'on' : ''}" data-mod="2">DOUBLE</button><button class="mod ${m === 3 ? 'on' : ''}" data-mod="3">TRIPLE</button></div><div class="nums">`;
  for (let n = 1; n <= 20; n++) {
    const own = h.own && h.own[n];
    s += `<button class="num ${hs.has(n) ? 'hl' : ''} ${own ? 'own' : ''}" data-n="${n}" ${own ? `style="--oc:${own}"` : ''}>${n}</button>`;
  }
  return s + `</div><div class="bulls"><button class="num ${hs.has(25) ? 'hl' : ''}" data-n="25">25</button><button class="num ${hs.has(25) ? 'hl' : ''}" data-n="50">BULL 50</button></div></div>`;
}
function totalHTML(st) {
  const b = S.ui.buf, q = [26, 41, 45, 60, 81, 85, 100, 140, 180];
  const p = st.players[st.cur];
  const fin = p.score <= 180 && !(st.cfg.out !== 'single' && !checkout(p.score, 3, st.cfg.out)) ? `<button class="chip" data-q="${p.score}" style="background:var(--gold);color:#1a1200">🎯 ${p.score}</button>` : '';
  return `<div class="tot"><div class="tot-disp ${b ? '' : 'ph'}">${b || 'Tape le score de ta volée'}</div>
    <div class="tot-quick">${fin}${q.map(v => `<button class="chip" data-q="${v}">${v}</button>`).join('')}</div>
    <div class="tot-keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button class="num" data-k="${k}">${k}</button>`).join('')}<button class="num" data-k="del">⌫</button><button class="num" data-k="0">0</button><button class="num ok" data-k="ok">OK</button></div></div>`;
}

/* ---------- Actions ---------- */
function push(ev) {
  if (!S.st || S.st.over) return;
  S.game.events.push(ev);
  S.st = replay(S.game);
  saveCur(); vibe(12);
  handleFx(S.st);
  renderGame();
}
function throwDart(n, m) { S.ui.mod = 1; push({ t: 'd', n, m }); }
function undo() {
  if (!S.game || !S.game.events.length) return;
  S.game.events.pop(); S.st = replay(S.game); saveCur();
  S.ui.endShown = false; closeModal(); hideFx();
  try { speechSynthesis.cancel(); } catch (e) {}
  S.ui.lastTurn = S.st.turn; renderGame(); toast('Dernière action annulée');
}
function submitTotal(t) {
  const st = S.st; if (st.over) return;
  const p = st.players[st.cur], out = st.cfg.out;
  S.ui.buf = '';
  if (t > 180 || IMPOSSIBLE.has(t)) { toast(`${t} est impossible en 3 fléchettes`); renderGame(); return; }
  if (p.score - t === 0) {
    let k = 0; for (let i = 1; i <= 3; i++) if (checkout(t, i, out)) { k = i; break; }
    if (!k) { toast(`Impossible de finir ${t} en ${out === 'double' ? 'double' : 'master'} out`); renderGame(); return; }
    if (k === 3) { push({ t: 'v', total: t, nd: 3 }); return; }
    modal(`<h3>Game shot ! 🎯</h3><p>En combien de fléchettes as-tu fini ${t} ?</p><div class="row3">${[1, 2, 3].map(i => `<button class="btn" data-nd="${i}" ${i < k ? 'disabled' : ''}>${i}</button>`).join('')}</div>`);
    $$('#modal [data-nd]').forEach(b => b.addEventListener('click', () => { closeModal(); push({ t: 'v', total: t, nd: +b.dataset.nd }); }));
    return;
  }
  push({ t: 'v', total: t, nd: 3 });
}

$('#game').addEventListener('click', e => {
  const t = e.target.closest('button, .seg, .b-bg');
  if (!t || !S.st) return;
  const st = S.st;
  if (t.id === 'g-home') { show('home'); return; }
  if (t.dataset.input) { S.ui.input = t.dataset.input; SET.input = t.dataset.input; saveSet(); S.ui.buf = ''; renderGame(); return; }
  if (t.dataset.act) {
    const a = t.dataset.act;
    if (a === 'undo') undo();
    else if (a === 'end') showEnd();
    else if (a === 'miss') throwDart(0, 0);
    else if (a === 'next') push({ t: 'end' });
    return;
  }
  if (st.over) return;
  if (t.dataset.mod) { const m = +t.dataset.mod; S.ui.mod = S.ui.mod === m ? 1 : m; renderInput(st, false); return; }
  if (t.dataset.cr) { throwDart(+t.dataset.cr, +t.dataset.m); return; }
  if (t.dataset.k != null) {
    const k = t.dataset.k;
    if (k === 'del') S.ui.buf = S.ui.buf.slice(0, -1);
    else if (k === 'ok') { submitTotal(parseInt(S.ui.buf || '0', 10)); return; }
    else if (S.ui.buf.length < 3) S.ui.buf = (S.ui.buf + k).replace(/^0+(?=\d)/, '');
    renderInput(st, false); return;
  }
  if (t.dataset.q) { submitTotal(+t.dataset.q); return; }
  if (t.closest('svg.board')) {
    const svg = t.closest('svg.board'), n = +t.dataset.n, m = +t.dataset.m;
    try {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
      S.ui.marks = S.ui.marks.filter(x => x.turn === st.turn).slice(0, st.darts.length);
      S.ui.marks.push({ x: loc.x.toFixed(1), y: loc.y.toFixed(1), turn: st.turn });
    } catch (err) {}
    if (n === 25 && m === 3) return;
    throwDart(m === 0 ? 0 : n, m);
    return;
  }
  if (t.dataset.n != null && t.closest('.pad')) {
    let n = +t.dataset.n, m = S.ui.mod;
    if (n === 50) { n = 25; m = 2; }
    else if (n === 25 && m === 3) { toast('Pas de triple Bull 😉'); S.ui.mod = 1; renderInput(st, false); return; }
    throwDart(n, m);
  }
});

/* ---------- Effets & annonces ---------- */
function handleFx(st) {
  const lines = [], P = st.players, en = SET.lang !== 'fr';
  let ov = null, delayToast = null;
  const setOv = (o, prio) => { if (!ov || prio > ov.prio) ov = { ...o, prio }; };
  for (const f of st.fx) {
    const p = P[f.pi], nm = p ? esc(p.name) : '';
    switch (f.k) {
      case 'bust':
        lines.push(en ? 'No score' : 'Bust !');
        setOv({ big: 'BUST !', sub: rnd(T.bust), cls: 'bust', dur: 1200 }, 3); break;
      case 'visit': {
        const t = f.total;
        lines.push(t === 180 ? (en ? 'One hundred and eighty!' : 'Cent quatre-vingts !') : t === 0 ? (en ? 'No score' : 'Zéro') : String(t));
        if (t === 180) setOv({ tag: 'ONE HUNDRED AND EIGHTY', big: '180', sub: rnd(T.t180), cls: 'fire', flames: true, shake: true, confetti: true, dur: 2300 }, 8);
        else if (t >= 140) setOv({ tag: 'TON PLUS', big: String(t), sub: rnd(T.t140), cls: 'fire', dur: 1500 }, 5);
        else if (t >= 100) setOv({ tag: 'TON !', big: String(t), sub: rnd(T.t100), dur: 1300 }, 4);
        else if (t === 26) setOv({ tag: 'BED & BREAKFAST 🍳', big: '26', sub: rnd(T.bnb), cls: 'cool', dur: 1600 }, 2);
        else if (t === 0) setOv({ big: 'NO SCORE', sub: rnd(T.zero), cls: 'bust', dur: 1100 }, 1);
        if (f.rem === 2) delayToast = 'Madhouse 🏚️ il te reste le double 1…';
        break;
      }
      case 'checkout': {
        lines.push(en ? (f.match ? 'Game shot, and the match!' : f.setWon ? 'Game shot, and the set!' : 'Game shot, and the leg!') : (f.match ? 'Game shot, et le match !' : f.setWon ? 'Game shot, et le set !' : 'Game shot, et le leg !'));
        const big = f.nine ? '9 DARTS !!!' : f.total === 170 ? 'BIG FISH 🐟' : 'GAME SHOT';
        let sub = f.nine ? 'La perfection : 501 en neuf fléchettes. John Lowe fut le premier à le faire à la télé, en 1984.'
          : `${nm} finit <b>${f.total}</b>${f.total >= 100 ? ', énorme finish !' : ''} en ${f.darts} fléchettes.`;
        if (!f.match) { const nx = P[st.cur]; sub += `<br>${f.setWon ? 'Set' : 'Leg'} pour ${nm}. ${esc(nx.name)} commence le suivant.`; }
        setOv({ tag: f.match ? 'AND THE MATCH' : f.setWon ? 'AND THE SET' : 'AND THE LEG', big, sub, cls: f.nine || f.total === 170 ? 'fire' : '', confetti: f.nine || f.total >= 100, shake: f.nine, dur: f.nine ? 3200 : 2100 }, f.nine ? 10 : 9);
        break;
      }
      case 'crv':
        if (f.wh) { setOv({ tag: 'WHITE HORSE 🐎', big: '9 ✕', sub: 'Trois triples différents dans la même volée !', cls: 'fire', confetti: true, dur: 2000 }, 7); lines.push('White horse!'); }
        else if (f.marks >= 9) { setOv({ big: '9 MARQUES', sub: 'Volée parfaite !', cls: 'fire', dur: 1800 }, 6); lines.push(en ? 'Nine marks!' : 'Neuf marques !'); }
        else if (f.marks >= 6) { setOv({ big: `${f.marks} MARQUES`, sub: 'Grosse volée de cricket.', dur: 1200 }, 3); lines.push(en ? `${f.marks} marks` : `${f.marks} marques`); }
        break;
      case 'shanghai':
        setOv({ tag: '🏮 SIMPLE · DOUBLE · TRIPLE', big: 'SHANGHAI !', sub: `${nm} gagne sur le coup !`, cls: 'fire', confetti: true, shake: true, dur: 2400 }, 9);
        lines.push('Shanghai!'); break;
      case 'sh':
        if (f.total > 0) lines.push(String(f.total)); break;
      case 'killer':
        setOv({ big: 'KILLER ! 🔪', sub: `${nm} est armé. Méfiez-vous…`, cls: 'bust', dur: 1500 }, 5);
        lines.push(en ? `${p.name} is a killer!` : `${p.name} devient killer !`); break;
      case 'oops':
        setOv({ big: 'AÏE ! 🤕', sub: 'Tir dans le pied : tu perds une vie.', cls: 'bust', dur: 1400 }, 4); break;
      case 'hit':
        lines.push(en ? `${p.name} loses a life` : `${p.name} perd une vie`); setOv({ big: '−1 ❤️', sub: `${nm} perd une vie`, cls: 'bust', dur: 900 }, 2); break;
      case 'elim':
        setOv({ big: '☠️ ÉLIMINÉ', sub: `${nm} est hors-jeu !`, cls: 'bust', dur: 1700 }, 6);
        lines.push(en ? `${p.name} is out!` : `${p.name} est éliminé !`); break;
      case 'win':
        if (st.type !== 'x01') lines.push(en ? `Game shot! ${p.name} wins!` : `Game shot ! ${p.name} gagne !`);
        break;
    }
  }
  if (st.type === 'x01' && !st.over && st.darts.length === 0 && st.fx.length) {
    const np = P[st.cur];
    if (np.opened && np.score <= 170 && checkout(np.score, 3, st.cfg.out))
      lines.push(en ? `${np.name}, you require ${np.score}` : `${np.name}, il te reste ${np.score}`);
  }
  if (ov) showFx(ov);
  if (delayToast) setTimeout(() => toast(delayToast), 800);
  say(lines);
  if (st.over) setTimeout(showEnd, ov ? (ov.dur || 1500) + 100 : 500);
}

/* ---------- Fin de partie ---------- */
function showEnd() {
  const st = S.st; if (!st || !st.over || S.ui.endShown) return;
  S.ui.endShown = true; hideFx();
  const W = st.winners.map(i => st.players[i]), rows = UI[st.type].stats(st);
  const html = `<div class="end"><div class="trophy">🏆</div><div class="end-tag">${W.length > 1 ? 'ÉGALITÉ' : 'VICTOIRE'}</div>
    <h2>${W.map(p => esc(p.name)).join(' & ')}</h2><p class="end-sub">${rnd(T.win)}</p>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th></th>${st.players.map(p => `<th style="color:${p.color}">${esc(p.name)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(r => `<tr><td>${r[0]}</td>${r.slice(1).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
    <button class="btn primary" data-end="rematch">🔁 REVANCHE</button>
    <button class="btn" data-end="new">Nouvelle partie</button>
    <button class="btn" data-end="home">Accueil</button>
    <button class="btn ghost" data-end="undo">↩ Annuler la dernière fléchette</button></div>`;
  modal(html, true); confetti(110);
  $$('#modal [data-end]').forEach(b => b.addEventListener('click', () => {
    const a = b.dataset.end;
    if (a === 'undo') { undo(); return; }
    finalize(); closeModal();
    if (a === 'rematch') { const g = S.game, pl = g.players.slice(1).concat(g.players[0]); const cfg = JSON.parse(JSON.stringify(g.cfg)); delete cfg.nums; newGame(g.type, cfg, pl); }
    else if (a === 'new') show('setup');
    else show('home');
  }));
}
function finalize() {
  if (S.game && S.st && S.st.over && !S.game.saved) { saveStats(S.st); S.game.saved = true; saveCur(); }
}
window.addEventListener('pagehide', finalize);

/* =====================================================================
   STATISTIQUES
   ===================================================================== */
function saveStats(st) {
  const all = store.get('fl_stats', {});
  st.players.forEach((p, i) => {
    const key = p.name.trim().toLowerCase();
    const r = all[key] || { name: p.name, color: p.color, games: 0, wins: 0, types: {}, x01: { pts: 0, darts: 0, t180: 0, t140: 0, t100: 0, hiCo: 0, hiV: 0, bestAvg: 0, bestLeg: 0 }, cr: { marks: 0, darts: 0 }, clock: { best: 0 } };
    r.name = p.name; r.color = p.color; r.games++; if (st.winners.includes(i)) r.wins++;
    r.types[st.type] = (r.types[st.type] || 0) + 1;
    if (st.type === 'x01') {
      const x = r.x01, s = p.s;
      x.pts += s.pts; x.darts += s.darts; x.t180 += s.t180; x.t140 += s.t140; x.t100 += s.t100;
      x.hiCo = Math.max(x.hiCo, s.hiCo); x.hiV = Math.max(x.hiV, s.hiV);
      if (s.darts >= 9) x.bestAvg = Math.max(x.bestAvg, s.pts / s.darts * 3);
      if (s.bestLeg && st.cfg.start === 501 && (!x.bestLeg || s.bestLeg < x.bestLeg)) x.bestLeg = s.bestLeg;
    }
    if (st.type === 'cricket') { r.cr.marks += p.s.marks; r.cr.darts += p.s.darts; }
    if (st.type === 'clock' && st.winners.includes(i) && (!r.clock.best || p.s.darts < r.clock.best)) r.clock.best = p.s.darts;
    all[key] = r;
  });
  store.set('fl_stats', all);
}
function renderStats() {
  const all = Object.values(store.get('fl_stats', {})).sort((a, b) => b.games - a.games);
  if (!all.length) { $('#stats-list').innerHTML = `<div class="empty">🎯<br>Pas encore de stats.<br>Joue une partie jusqu'au bout et tes moyennes, 180 et records apparaîtront ici.</div>`; return; }
  $('#stats-list').innerHTML = all.map(r => {
    const x = r.x01, avg = x.darts ? (x.pts / x.darts * 3).toFixed(1) : '–';
    const cells = [['Parties', r.games], ['Victoires', `${r.wins} <small style="font-size:12px">(${Math.round(r.wins / r.games * 100)}%)</small>`], ['Moy. 01', avg],
      ['180', x.t180], ['140+', x.t140], ['100+', x.t100], ['Best finish', x.hiCo || '–'], ['Best moy.', x.bestAvg ? x.bestAvg.toFixed(1) : '–'],
      ['Best leg 501', x.bestLeg ? x.bestLeg + ' fl.' : '–'], ['MPR cricket', r.cr.darts ? (r.cr.marks / (r.cr.darts / 3)).toFixed(2) : '–'],
      ['Horloge', r.clock.best ? r.clock.best + ' fl.' : '–'], ['Best volée', x.hiV || '–']];
    return `<div class="scard" style="--pc:${r.color || '#ffc940'}"><h3>${esc(r.name)} <small>${Object.entries(r.types).map(([k, v]) => `${TYPE_L[k] === '01' ? '01' : TYPE_L[k]} ×${v}`).join(' · ')}</small></h3>
      <div class="sgrid">${cells.map(([l, v]) => `<div><b>${v}</b><span>${l}</span></div>`).join('')}</div></div>`;
  }).join('') + `<button class="btn ghost" id="stats-reset">Effacer toutes les statistiques</button>`;
  $('#stats-reset').addEventListener('click', () => {
    modal(`<h3>Effacer les stats ?</h3><p>Toutes les moyennes et records seront supprimés. Impossible de revenir en arrière.</p><button class="btn primary" id="yes-reset">EFFACER</button><button class="btn" id="no-reset">Annuler</button>`);
    $('#yes-reset').addEventListener('click', () => { store.del('fl_stats'); closeModal(); renderStats(); toast('Stats effacées'); });
    $('#no-reset').addEventListener('click', closeModal);
  });
}

/* =====================================================================
   LÉGENDES & RÉGLAGES
   ===================================================================== */
function legendHTML(l) {
  return `<div class="legend" style="--c1:${l.c1};--c2:${l.c2}"><div class="badge">${l.init}</div><div><h3>${l.flag} ${esc(l.name)}</h3><div class="nn">« ${esc(l.nick)} »</div><div class="tt">${esc(l.titles)}</div><p>${esc(l.text)}</p></div></div>`;
}
function renderLegends() { if (!$('#legend-list').innerHTML) $('#legend-list').innerHTML = LEGENDS.map(legendHTML).join(''); }
function renderSettings() {
  const rows = [
    ['caller', '🎙️ Annonceur', 'Annonce les scores comme à l\'Ally Pally (« One hundred and eighty! »)'],
    ['vibe', '📳 Vibrations', 'Petit retour haptique à chaque fléchette (Android)'],
    ['wake', '🔆 Écran toujours allumé', 'Empêche l\'écran de se mettre en veille pendant une partie']
  ];
  $('#set-list').innerHTML = rows.map(([k, l, d]) => `<div class="set-row"><div><b>${l}</b><small>${d}</small></div><button class="sw ${SET[k] ? 'on' : ''}" data-sw="${k}" aria-label="${l}"></button></div>`).join('') +
    `<div class="set-row"><div><b>🗣️ Langue de l'annonceur</b><small>L'anglais, c'est plus pro !</small></div><div class="chips"><button class="chip ${SET.lang === 'en' ? 'on' : ''}" data-lang="en">English</button><button class="chip ${SET.lang === 'fr' ? 'on' : ''}" data-lang="fr">Français</button></div></div>
     <button class="btn" id="test-voice">🔊 Tester l'annonceur</button>
     <button class="btn ghost" id="reset-all">Tout réinitialiser (joueurs, stats, partie en cours)</button>
     <p class="intro" style="text-align:center;font-size:12px;margin-top:20px">Fléchette 🎯 · Astuce : sur iPhone, Partager → « Sur l'écran d'accueil » pour l'avoir comme une vraie appli.</p>`;
}
$('#settings').addEventListener('click', e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.dataset.sw) { SET[t.dataset.sw] = !SET[t.dataset.sw]; saveSet(); renderSettings(); }
  else if (t.dataset.lang) { SET.lang = t.dataset.lang; saveSet(); renderSettings(); }
  else if (t.id === 'test-voice') { const was = SET.caller; SET.caller = true; say([SET.lang === 'fr' ? 'Cent quatre-vingts !' : 'One hundred and eighty!']); SET.caller = was; }
  else if (t.id === 'reset-all') {
    modal(`<h3>Tout réinitialiser ?</h3><p>Joueurs enregistrés, statistiques et partie en cours seront effacés.</p><button class="btn primary" id="yes-all">TOUT EFFACER</button><button class="btn" id="no-all">Annuler</button>`);
    $('#yes-all').addEventListener('click', () => { ['fl_stats', 'fl_roster', 'fl_current', 'fl_setup'].forEach(store.del); S.setup = loadSetup(); closeModal(); toast('Tout est remis à zéro'); });
    $('#no-all').addEventListener('click', closeModal);
  }
});

/* ---------- Démarrage ---------- */
renderHome();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
