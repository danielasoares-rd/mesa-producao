import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { C } from "../theme";
import { SKILLS, SKILLS_OUTRO } from "../skills";
import Markdown from "../components/Markdown";

// Dispara o download do arquivo .md da skill
function downloadSkill(skill) {
  try {
    const blob = new Blob([skill.raw], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = skill.file;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    // se falhar, abre o conteúdo numa nova aba como alternativa
    const w = window.open("", "_blank");
    if (w) { w.document.write(`<pre>${skill.raw.replace(/</g, "&lt;")}</pre>`); }
  }
}

export default function SkillsScreen({ isDesktop }) {
  const [selected, setSelected] = useState(null);
  const skill = SKILLS.find((s) => s.id === selected);

  if (skill) return <SkillDetail skill={skill} onBack={() => setSelected(null)} isDesktop={isDesktop} />;

  const pad = isDesktop ? "32px" : "22px 16px";
  return (
    <div style={{ padding: pad, maxWidth: 880, margin: "0 auto" }}>
      <span style={{ fontWeight: 600, fontSize: 22, color: C.text, display: "block", marginBottom: 8, fontFamily: C.serif, letterSpacing: "-0.01em" }}>Skills</span>
      <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, marginTop: 0, marginBottom: 18 }}>
        Suas skills de criação de conteúdo. Siga a ordem: <b style={{ color: C.text }}>1) Persona → 2) Linha Editorial → 3) Planejamento Mensal → 4) Modela Conteúdo</b>. Toque em cada uma para ver os detalhes e baixar o arquivo.
      </p>

      <div style={isDesktop ? { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 } : undefined}>
        {SKILLS.map((s) => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setSelected(s.id)} style={{
              width: "100%", textAlign: "left", background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: "16px", cursor: "pointer", boxShadow: C.sh, marginBottom: isDesktop ? 0 : 12,
              display: "flex", gap: 13, alignItems: "center",
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
                <Icon size={20} color={C.gold} />
                <span style={{ position: "absolute", top: -6, left: -6, width: 20, height: 20, borderRadius: "50%", background: C.accent, color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.step}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 2 }}>{s.title}</div>
                <div style={{ fontSize: 12.5, color: C.muted }}>{s.subtitle}</div>
              </div>
              <ChevronRight size={18} color={C.muted} style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>

      {/* Como as três funcionam juntas */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "4px 18px 6px", boxShadow: C.sh, marginTop: 18 }}>
        <Markdown text={SKILLS_OUTRO} />
      </div>
    </div>
  );
}

function SkillDetail({ skill, onBack, isDesktop }) {
  const Icon = skill.icon;
  return (
    <div style={{ padding: isDesktop ? "24px 32px 40px" : "18px 16px 32px", maxWidth: 820, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, padding: 0 }}>
          <ChevronLeft size={18} /> Voltar
        </button>
        <button onClick={() => downloadSkill(skill)} style={{ display: "flex", alignItems: "center", gap: 7, background: C.dark, border: "none", borderRadius: 12, padding: "9px 14px", cursor: "pointer", color: "#FBF6EC", fontWeight: 600, fontSize: 13 }}>
          <Download size={15} /> Baixar skill (.md)
        </button>
      </div>

      <div style={{ display: "flex", gap: 13, alignItems: "center", marginBottom: 18 }}>
        <div style={{ width: 48, height: 48, borderRadius: 13, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={22} color={C.gold} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 19, color: C.text }}>{skill.title}</div>
          <div style={{ fontSize: 13, color: C.muted }}>Passo {skill.step} · {skill.subtitle}</div>
        </div>
      </div>

      {/* Descrição da skill */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: isDesktop ? "20px 28px" : "16px 18px", boxShadow: C.sh, marginBottom: 18 }}>
        <Markdown text={skill.description} />
      </div>

      {/* Baixar (rodapé também, fácil de achar) */}
      <button onClick={() => downloadSkill(skill)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: C.gold, border: "none", borderRadius: 14, padding: "14px", cursor: "pointer", color: C.dark, fontWeight: 700, fontSize: 15 }}>
        <Download size={17} /> Baixar “{skill.title}” (.md)
      </button>
    </div>
  );
}
