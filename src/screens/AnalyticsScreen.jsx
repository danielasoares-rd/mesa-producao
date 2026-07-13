import { useMemo, useState } from "react";
import { Eye, Bookmark, UserPlus, MessageCircle, Flame, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { C, ST, PL } from "../theme";
import { PlatBadge } from "../components/ui";
import Sparkline from "../components/Sparkline";
import { getMetrics, fmt, DEMO_ITEMS } from "../lib/metrics";

const PERIODS = [7, 30, 90];

const METRIC_DEFS = [
  { key: "views", label: "Views", icon: Eye, color: "#A56A2E" },
  { key: "saves", label: "Saves", icon: Bookmark, color: "#C8A43A" },
  { key: "follows", label: "Follows", icon: UserPlus, color: "#1E5C38" },
  { key: "dms", label: "DMs", icon: MessageCircle, color: "#3D2B7A" },
];

export default function AnalyticsScreen({ items, isDesktop }) {
  const [period, setPeriod] = useState(30);
  const [demo, setDemo] = useState(false);

  const posted = items.filter((i) => i.status === "postado");
  const usingDemo = posted.length === 0 && demo;
  const source = posted.length > 0 ? posted : usingDemo ? DEMO_ITEMS : [];
  const m = useMemo(() => getMetrics(source, period), [source, period]);

  const pad = isDesktop ? "32px 32px 40px" : "22px 16px 32px";

  return (
    <div style={{ padding: pad, maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
        <span style={{ fontWeight: 600, fontSize: 22, color: C.text, fontFamily: C.serif, letterSpacing: "-0.01em" }}>Análises</span>
        {/* Seletor de período */}
        <div style={{ display: "flex", background: "rgba(43,22,13,0.07)", borderRadius: 10, padding: 3 }}>
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className="press" style={{
              border: "none", cursor: "pointer", background: period === p ? C.dark : "transparent",
              color: period === p ? "#FBF6EC" : C.muted, borderRadius: 8, padding: "6px 13px",
              fontSize: 12.5, fontWeight: 600, transition: "all 0.15s",
            }}>{p}d</button>
          ))}
        </div>
      </div>
      <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 18px" }}>
        {usingDemo ? "Mostrando dados de exemplo — poste conteúdos para ver os seus." : "Métricas que você preenche em cada conteúdo postado (na página do conteúdo)."}
      </p>

      {/* Há postados, mas sem métricas preenchidas */}
      {posted.length > 0 && m.filled === 0 && (
        <div className="anim-fade-up" style={{ background: "#FFF3D8", color: "#6B4D00", borderRadius: 12, padding: "12px 14px", fontSize: 13, lineHeight: 1.55, marginBottom: 16 }}>
          💡 Você tem {posted.length} conteúdo{posted.length > 1 ? "s" : ""} postado{posted.length > 1 ? "s" : ""}, mas sem métricas ainda. Abra o conteúdo (botão <b>Abrir conteúdo</b>) e preencha <b>Views, Saves, Follows e DMs</b> no card "Métricas do post" — os números aparecem aqui na hora.
        </div>
      )}

      {/* Estado vazio: nada postado ainda */}
      {source.length === 0 ? (
        <div className="anim-fade-up" style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 18, padding: "36px 24px", textAlign: "center", boxShadow: C.sh }}>
          <Flame size={30} color={C.gold} style={{ margin: "0 auto 10px", display: "block" }} />
          <div style={{ fontWeight: 600, fontSize: 16, color: C.text, fontFamily: C.serif, marginBottom: 6 }}>Suas análises aparecem aqui</div>
          <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.6, margin: "0 auto 16px", maxWidth: 380 }}>
            Quando você marcar conteúdos como <b style={{ color: C.text }}>Postado</b> (na página do conteúdo ou no pipeline), as views, saves, follows e DMs deles aparecem aqui.
          </p>
          <button onClick={() => setDemo(true)} className="press" style={{ background: C.dark, border: "none", borderRadius: 12, padding: "11px 18px", cursor: "pointer", color: "#FBF6EC", fontWeight: 600, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 7 }}>
            <Sparkles size={15} color={C.gold} /> Ver com dados de exemplo
          </button>
        </div>
      ) : (
        <>
          {/* Cards de métrica */}
          <div className="stagger" style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "1fr 1fr", gap: 10, marginBottom: 26 }}>
            {METRIC_DEFS.map((def) => {
              const Icon = def.icon;
              const d = m.delta[def.key];
              const up = d != null && d >= 0;
              return (
                <div key={def.key} className="card-hover" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 15px 10px", boxShadow: C.sh }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: C.muted, fontWeight: 600 }}>
                      <Icon size={14} color={def.color} /> {def.label}
                    </span>
                    {d != null && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 700, color: up ? "#1E5C38" : "#9A2B0E", background: up ? "#D8EDE0" : "#FBE3DA", borderRadius: 7, padding: "2px 7px" }}>
                        {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {up ? "+" : ""}{d}%
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 600, color: C.text, fontFamily: C.serif, letterSpacing: "-0.02em", marginBottom: 6 }}>{fmt(m.totals[def.key])}</div>
                  <Sparkline values={m.series[def.key]} color={def.color} id={def.key} />
                </div>
              );
            })}
          </div>

          {/* Top 5 Heaters */}
          <div className="anim-fade-up" style={{ marginBottom: 26 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <span style={{ fontWeight: 600, fontSize: 17, color: C.text, fontFamily: C.serif, display: "inline-flex", alignItems: "center", gap: 7 }}>
                <Flame size={17} color="#D2622A" /> Top 5 Heaters
              </span>
              <span style={{ fontSize: 11.5, color: C.muted }}>≥ 2× a mediana de 30 dias ({fmt(Math.round(m.median))} views)</span>
            </div>
            <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 12px" }}>Os conteúdos que estouraram — e o que fez cada um funcionar.</p>

            {m.heaters.length === 0 ? (
              <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 14, padding: "18px", color: C.muted, fontSize: 13, textAlign: "center" }}>
                {m.sample < 3
                  ? `Poste pelo menos 3 conteúdos em 30 dias para detectar heaters (você tem ${m.sample}).`
                  : "Nenhum conteúdo bateu 2× a mediana nos últimos 30 dias. Continue testando ganchos!"}
              </div>
            ) : (
              <div className="stagger">
                {m.heaters.map((h, i) => (
                  <div key={h.item.id} className="card-hover" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "13px 15px", marginBottom: 8, boxShadow: C.sh }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.muted, width: 18, flexShrink: 0 }}>{i + 1}.</span>
                      <PlatBadge platform={h.item.platform} size={12} />
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.item.title}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11.5, fontWeight: 800, color: "#D2622A", background: "#FBE9DA", borderRadius: 8, padding: "3px 8px", flexShrink: 0 }}>
                        <Flame size={11} /> {h.ratio.toFixed(1).replace(".", ",")}×
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 14, paddingLeft: 28, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 700 }}>{fmt(h.views)} <span style={{ color: C.muted, fontWeight: 500 }}>views</span></span>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 700 }}>{fmt(h.saves)} <span style={{ color: C.muted, fontWeight: 500 }}>saves</span></span>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 700 }}>{fmt(h.follows)} <span style={{ color: C.muted, fontWeight: 500 }}>follows</span></span>
                      <span style={{ fontSize: 12, color: C.text, fontWeight: 700 }}>{fmt(h.dms)} <span style={{ color: C.muted, fontWeight: 500 }}>DMs</span></span>
                    </div>
                    <div style={{ paddingLeft: 28, fontSize: 12.5, color: C.muted, lineHeight: 1.5, fontStyle: "italic" }}>💡 {h.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Seções compactas: mesa de produção */}
      <CompactBreakdown items={items} isDesktop={isDesktop} />
    </div>
  );
}

/* ── Por plataforma / por status (compacto) ─────────────────────── */
function CompactBreakdown({ items, isDesktop }) {
  const byPlatform = Object.entries(PL).map(([key, { label }]) => ({ key, label, count: items.filter((i) => i.platform === key).length }));
  const byStatus = Object.entries(ST).map(([key, { label, bg, tc }]) => ({ key, label, bg, tc, count: items.filter((i) => i.status === key).length })).filter((s) => s.count > 0);

  return (
    <div className="anim-fade-up" style={{ borderTop: `1px solid ${C.border}`, paddingTop: 18 }}>
      <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 10, fontFamily: C.serif }}>Sua mesa de produção · {items.length} conteúdos</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {byPlatform.map(({ key, label, count }) => (
          <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 12px", fontSize: 12.5, color: C.muted }}>
            <PlatBadge platform={key} size={11} /> <b style={{ color: C.text }}>{count}</b> {label}
          </span>
        ))}
      </div>
      {byStatus.map(({ key, label, bg, tc, count }) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
          <span style={{ background: bg, color: tc, fontSize: 10.5, fontWeight: 600, padding: "2px 8px", borderRadius: 7, width: 96, textAlign: "center", flexShrink: 0 }}>{label}</span>
          <div style={{ flex: 1, background: "rgba(43,22,13,0.07)", borderRadius: 4, height: 5, overflow: "hidden" }}>
            <div className="grow-bar" style={{ height: "100%", borderRadius: 4, background: C.accent, width: `${(count / Math.max(items.length, 1)) * 100}%` }} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text, minWidth: 16, textAlign: "right" }}>{count}</span>
        </div>
      ))}
    </div>
  );
}
