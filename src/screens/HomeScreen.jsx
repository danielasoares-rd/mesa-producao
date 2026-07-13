import { useState } from "react";
import { Plus, FileText, Play, Send, CheckCircle2, Lightbulb, Calendar, Sparkles, LogOut, Star, Trash2, ArrowRight, HelpCircle } from "lucide-react";
import { C, ST } from "../theme";
import ContentCard from "../components/ContentCard";
import Avatar from "../components/Avatar";

export default function HomeScreen({
  items, setDetail, setScreen, setShowAdd, name, signOut, loadSamples, isDesktop,
  ideas, addIdea, toggleFavorite, delIdea, onTransformIdea, openContentFiltered,
  avatar, onUploadAvatar,
}) {
  const [ideaText, setIdeaText] = useState("");
  const [savingIdea, setSavingIdea] = useState(false);

  const counts = {
    planejados: items.length,
    producao: items.filter((i) => i.status === "em-producao").length,
    agendados: items.filter((i) => i.status === "agendado").length,
    postados: items.filter((i) => i.status === "postado").length,
  };
  // Distribuição por status (para a barra do card escuro)
  const dist = Object.keys(ST).map((k) => ({ k, ...ST[k], n: items.filter((i) => i.status === k).length })).filter((d) => d.n > 0);

  const submitIdea = async (e) => {
    e?.preventDefault();
    if (!ideaText.trim() || savingIdea) return;
    setSavingIdea(true);
    await addIdea(ideaText);
    setIdeaText("");
    setSavingIdea(false);
  };

  return (
    <div style={{ padding: isDesktop ? "32px 32px 16px" : "20px 16px 8px", maxWidth: 880, margin: "0 auto" }}>
      {/* Header */}
      <div className="anim-fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Avatar src={avatar} name={name} size={46} onUpload={onUploadAvatar} />
          <div>
            <div style={{ fontWeight: 600, fontSize: isDesktop ? 22 : 19, color: C.text, fontFamily: C.serif, letterSpacing: "-0.01em" }}>Olá, {name || "nutri"} 👋</div>
            <div style={{ fontSize: 12.5, color: C.muted }}>Pronta para criar hoje?</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button onClick={() => setScreen("help")} title="Como usar o app" className="press" style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            <HelpCircle size={20} color={C.muted} />
          </button>
          {!isDesktop && (
            <button onClick={signOut} title="Sair" className="press" style={{ background: "none", border: "none", cursor: "pointer", padding: 8 }}>
              <LogOut size={20} color={C.muted} />
            </button>
          )}
        </div>
      </div>

      {/* Visão geral */}
      <div className="anim-fade-up" style={{ background: `linear-gradient(150deg, ${C.dark} 0%, #4A2A18 70%, #56331d 100%)`, borderRadius: 20, padding: "20px 22px 18px", marginBottom: 24, boxShadow: C.sh2 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ color: "rgba(255,248,239,0.85)", fontWeight: 600, fontSize: 15, fontFamily: C.serif }}>Visão geral</span>
          <span style={{ color: C.gold, fontSize: 12, fontWeight: 600 }}>{counts.planejados} na mesa</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "1fr 1fr", rowGap: 20 }}>
          {[
            [<FileText size={17} />, counts.planejados, "Planejados"],
            [<Play size={17} />, counts.producao, "Em produção"],
            [<Send size={17} />, counts.agendados, "Agendados"],
            [<CheckCircle2 size={17} />, counts.postados, "Postados"],
          ].map(([Icon, val, label], i) => (
            <div key={i}>
              <div style={{ color: "rgba(255,248,239,0.35)", marginBottom: 7 }}>{Icon}</div>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#FBF6EC", lineHeight: 1, letterSpacing: "-0.02em", fontFamily: C.serif }}>{val}</div>
              <div style={{ fontSize: 11, color: "rgba(255,248,239,0.5)", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
        {/* Distribuição por status */}
        {dist.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", height: 8, borderRadius: 5, overflow: "hidden", gap: 2 }}>
              {dist.map((d) => (
                <div key={d.k} className="grow-bar" title={`${d.label}: ${d.n}`} style={{ width: `${(d.n / items.length) * 100}%`, background: d.bg, borderRadius: 3 }} />
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 10 }}>
              {dist.map((d) => (
                <span key={d.k} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "rgba(255,248,239,0.6)" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 3, background: d.bg, display: "inline-block" }} />
                  {d.label} · {d.n}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ações rápidas */}
      <div className="anim-fade-up" style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: C.text, fontFamily: C.serif }}>Ações rápidas</div>
        <div className="stagger" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { icon: <Plus size={20} />, label: "Novo conteúdo", dark: true, action: () => setShowAdd(true) },
            { icon: <Lightbulb size={20} />, label: "Ideias", action: () => openContentFiltered("ideia") },
            { icon: <FileText size={20} />, label: "Roteiros", action: () => openContentFiltered("roteiro-pronto") },
            { icon: <Calendar size={20} />, label: "Calendário", action: () => setScreen("calendar") },
          ].map((a, i) => (
            <button key={i} onClick={a.action} className="card-hover" style={{
              background: a.dark ? C.dark : C.card, border: `1px solid ${a.dark ? "transparent" : C.border}`,
              borderRadius: 14, padding: "13px 6px 11px", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
              boxShadow: a.dark ? C.sh2 : C.sh,
            }}>
              <span style={{ color: a.dark ? C.gold : C.accent }}>{a.icon}</span>
              <span style={{ fontSize: 10.5, color: a.dark ? "rgba(255,248,239,0.8)" : C.muted, lineHeight: 1.3, textAlign: "center" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Próximos conteúdos */}
      <div className="anim-fade-up" style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: C.text, fontFamily: C.serif }}>Próximos conteúdos</span>
          <button onClick={() => setScreen("content")} className="press" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.accent, fontWeight: 600 }}>Ver todos</button>
        </div>
        <div className="stagger">
          {items.slice(0, 3).map((item) => (
            <ContentCard key={item.id} item={item} onClick={setDetail} />
          ))}
        </div>
        {items.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 0", color: C.muted, fontSize: 14 }}>
            <Lightbulb size={28} color={C.gold} style={{ margin: "0 auto 8px", display: "block" }} />
            Nenhum conteúdo ainda. Clique em "Novo conteúdo" para começar.
            {loadSamples && (
              <div style={{ marginTop: 14 }}>
                <button onClick={loadSamples} className="press" style={{ background: "rgba(43,22,13,0.06)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 16px", cursor: "pointer", color: C.accent, fontSize: 13, fontWeight: 600 }}>
                  Carregar exemplos
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banco de ideias */}
      <div className="anim-fade-up" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: C.text, fontFamily: C.serif }}>Banco de ideias</span>
          <span style={{ fontSize: 12, color: C.muted }}>{ideas.length} {ideas.length === 1 ? "ideia" : "ideias"}</span>
        </div>

        {/* Captura rápida */}
        <form onSubmit={submitIdea} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 9, background: C.card, border: `1px solid ${C.border}`, borderRadius: 13, padding: "0 14px", boxShadow: C.sh }}>
            <Sparkles size={16} color={C.gold} style={{ flexShrink: 0 }} />
            <input
              value={ideaText}
              onChange={(e) => setIdeaText(e.target.value)}
              placeholder="Anote uma ideia rápida…"
              style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 13.5, color: C.text, fontFamily: "inherit", padding: "12px 0" }}
            />
          </div>
          <button type="submit" disabled={savingIdea || !ideaText.trim()} className="press" style={{ background: C.gold, border: "none", borderRadius: 13, padding: "0 16px", cursor: "pointer", color: C.dark, fontWeight: 700, fontSize: 13, opacity: savingIdea || !ideaText.trim() ? 0.5 : 1 }}>
            Salvar
          </button>
        </form>

        <div className="stagger">
          {ideas.slice(0, 6).map((idea) => (
            <div key={idea.id} className="card-hover" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 8, display: "flex", alignItems: "center", gap: 11, boxShadow: C.sh }}>
              <button onClick={() => toggleFavorite(idea)} title={idea.favorite ? "Desfavoritar" : "Favoritar"} className="press" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", flexShrink: 0 }}>
                <Star size={16} color={C.gold} fill={idea.favorite ? C.gold : "none"} />
              </button>
              <span style={{ fontSize: 13.5, flex: 1, color: C.text, lineHeight: 1.45 }}>{idea.text}</span>
              <button onClick={() => onTransformIdea(idea)} title="Transformar em conteúdo" className="press" style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(165,106,46,0.1)", border: "none", borderRadius: 9, padding: "6px 10px", cursor: "pointer", color: C.accent, fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>
                Criar <ArrowRight size={12} />
              </button>
              <button onClick={() => delIdea(idea.id)} title="Excluir ideia" className="press" style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", flexShrink: 0, opacity: 0.55 }}>
                <Trash2 size={14} color={C.muted} />
              </button>
            </div>
          ))}
        </div>
        {ideas.length === 0 && (
          <div style={{ textAlign: "center", padding: "16px 0 8px", color: C.muted, fontSize: 13 }}>
            Nenhuma ideia salva ainda. Anote a primeira ali em cima ✨
          </div>
        )}
      </div>
    </div>
  );
}
