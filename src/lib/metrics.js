/* Camada de métricas.
   HOJE: mock determinístico (seed = id do conteúdo → números estáveis).
   AMANHÃ: trocar por um provider da API do Instagram mantendo a mesma interface:
     getMetrics(items, periodDays) → { series, totals, delta, heaters, median }   */

import { parseYmd } from "./dates";

/* ── Gerador pseudo-aleatório com seed (mulberry32 + hash) ─────── */
function rng(seedStr) {
  let h = 1779033703 ^ String(seedStr).length;
  for (let i = 0; i < String(seedStr).length; i++) {
    h = Math.imul(h ^ String(seedStr).charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);

/* ── Métricas totais de UM conteúdo ─────────────────────────────
   Conteúdos reais: usa o que a nutri preencheu na página do conteúdo.
   Conteúdos de exemplo (id "demo-"): números simulados estáveis.  */
export function itemMetrics(item) {
  const isDemo = String(item.id).startsWith("demo-");
  const r = rng(item.id);

  if (!isDemo) {
    const m = item.metrics || {};
    return {
      views: Number(m.views) || 0,
      saves: Number(m.saves) || 0,
      follows: Number(m.follows) || 0,
      dms: Number(m.dms) || 0,
      postDate: item.scheduledDate ? parseYmd(item.scheduledDate) : daysAgo(1),
      real: true,
    };
  }

  const views = Math.round(600 + r() * r() * 28000);       // 600–28K, maioria baixa
  const saves = Math.round(views * (0.015 + r() * 0.085)); // 1,5%–10%
  const follows = Math.round(views * (0.003 + r() * 0.02));
  const dms = Math.round(views * (0.001 + r() * 0.014));
  const postDate = daysAgo(Math.floor(r() * 28) + 1);
  return { views, saves, follows, dms, postDate, real: false };
}

/* ── Série diária agregada (para os sparklines) ────────────────── */
function buildSeries(metricsList, periodDays, offsetDays = 0) {
  const out = { views: [], saves: [], follows: [], dms: [] };
  for (let d = periodDays - 1; d >= 0; d--) {
    const day = daysAgo(d + offsetDays);
    let v = 0, s = 0, f = 0, m = 0;
    for (const it of metricsList) {
      const age = Math.floor((day - it.postDate) / DAY); // dias desde o post
      if (age < 0) continue;
      if (it.real) {
        // dados reais: o valor inteiro entra no dia do post (sem simulação)
        if (age === 0) { v += it.views; s += it.saves; f += it.follows; m += it.dms; }
        continue;
      }
      // demonstração: pico no dia do post com decaimento (~1 semana de vida útil)
      const weight = Math.exp(-age / 3.2);
      const noise = 0.75 + rng(`${it.views}-${d}`)() * 0.5;
      v += it.views * 0.28 * weight * noise;
      s += it.saves * 0.28 * weight * noise;
      f += it.follows * 0.28 * weight * noise;
      m += it.dms * 0.28 * weight * noise;
    }
    out.views.push(Math.round(v));
    out.saves.push(Math.round(s));
    out.follows.push(Math.round(f));
    out.dms.push(Math.round(m));
  }
  return out;
}

const sum = (a) => a.reduce((x, y) => x + y, 0);
const median = (arr) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

/* ── Nota de 1 linha: por que o reel estourou (heurística) ─────── */
function heaterNote(m) {
  const saveRate = m.saves / m.views;
  const dmRate = m.dms / m.views;
  const followRate = m.follows / m.views;
  if (saveRate > 0.06) return "Conteúdo salvável: dica prática que a audiência guardou pra depois.";
  if (dmRate > 0.008) return "Gerou conversa: tema que puxa pergunta no direct — aproveite pra funil.";
  if (followRate > 0.013) return "Atraiu gente nova: gancho forte que converteu quem não te seguia.";
  return "Volume puro: retenção alta nos 3 primeiros segundos segurou a entrega.";
}

/* ── API principal ─────────────────────────────────────────────── */
export function getMetrics(items, periodDays = 30) {
  const list = items.map((it) => ({ item: it, ...itemMetrics(it) }));

  const series = buildSeries(list, periodDays);
  const prev = buildSeries(list, periodDays, periodDays); // janela anterior (p/ delta)

  const totals = {
    views: sum(series.views), saves: sum(series.saves),
    follows: sum(series.follows), dms: sum(series.dms),
  };
  const delta = {};
  for (const k of ["views", "saves", "follows", "dms"]) {
    const prevTotal = sum(prev[k]);
    delta[k] = prevTotal > 0 ? Math.round(((totals[k] - prevTotal) / prevTotal) * 100) : null;
  }

  // Heaters: mediana de views dos posts dos últimos 30 dias; heater = ≥ 2×
  const last30 = list.filter((m) => (Date.now() - m.postDate) / DAY <= 30);
  const med = median(last30.map((m) => m.views));
  const heaters =
    last30.length >= 3 && med > 0
      ? last30
          .filter((m) => m.views >= 2 * med)
          .sort((a, b) => b.views - a.views)
          .slice(0, 5)
          .map((m) => ({ ...m, ratio: m.views / med, note: heaterNote(m) }))
      : [];

  // Quantos conteúdos reais já têm métricas preenchidas
  const filled = list.filter((m) => m.real && (m.views + m.saves + m.follows + m.dms) > 0).length;

  return { series, totals, delta, heaters, median: med, sample: last30.length, filled };
}

/* ── Formata 12400 → "12,4K" ───────────────────────────────────── */
export function fmt(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(".", ",") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(".", ",") + "K";
  return String(n);
}

/* ── Conteúdos de exemplo (modo demonstração) ──────────────────── */
export const DEMO_ITEMS = [
  { id: "demo-374", title: "3 sinais de que seu intestino está pedindo socorro", platform: "instagram", type: "Reels", status: "postado", scheduledDate: null },
  { id: "demo-199", title: "O café da manhã que eu como todo dia (nutri revela)", platform: "instagram", type: "Reels", status: "postado", scheduledDate: null },
  { id: "demo-229", title: "Pare de contar calorias — faça isso primeiro", platform: "instagram", type: "Reels", status: "postado", scheduledDate: null },
  { id: "demo-49",  title: "5 mitos do emagrecimento que sua paciente acredita", platform: "instagram", type: "Carrossel", status: "postado", scheduledDate: null },
  { id: "demo-318", title: "Respondendo: canela emagrece mesmo?", platform: "tiktok", type: "Vídeo", status: "postado", scheduledDate: null },
  { id: "demo-217", title: "Um dia de atendimentos no consultório (vlog)", platform: "instagram", type: "Reels", status: "postado", scheduledDate: null },
  { id: "demo-111", title: "O que eu pediria num restaurante japonês", platform: "instagram", type: "Reels", status: "postado", scheduledDate: null },
  { id: "demo-201", title: "Menopausa e inchaço: o que ninguém te conta", platform: "youtube", type: "Vídeo", status: "postado", scheduledDate: null },
];
