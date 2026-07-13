import { Home, LayoutGrid, Calendar, BarChart2, Plus, Wand2, Images, LogOut, HelpCircle } from "lucide-react";
import { C } from "../theme";
import { useAuth } from "../lib/useAuth";
import Avatar from "./Avatar";

export default function Sidebar({ screen, setScreen, setShowAdd, avatar, onUploadAvatar }) {
  const { name, signOut } = useAuth();
  const tabs = [
    { id: "home", icon: <Home size={20} />, label: "Início" },
    { id: "content", icon: <LayoutGrid size={20} />, label: "Conteúdos" },
    { id: "calendar", icon: <Calendar size={20} />, label: "Calendário" },
    { id: "gallery", icon: <Images size={20} />, label: "Galeria" },
    { id: "analytics", icon: <BarChart2 size={20} />, label: "Análises" },
    { id: "skills", icon: <Wand2 size={20} />, label: "Skills" },
  ];

  return (
    <aside style={{
      width: 240, flexShrink: 0, background: C.card, borderRight: `1px solid ${C.border}`,
      height: "100vh", position: "sticky", top: 0, display: "flex", flexDirection: "column",
      padding: "24px 16px",
    }}>
      {/* Foto da nutri + marca */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 8px", marginBottom: 28 }}>
        <Avatar src={avatar} name={name} size={46} onUpload={onUploadAvatar} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15.5, color: C.text, fontFamily: C.serif, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name || "Minha conta"}</div>
          <div style={{ fontSize: 11.5, color: C.muted }}>Mesa de Produção</div>
        </div>
      </div>

      {/* Novo conteúdo */}
      <button onClick={() => setShowAdd(true)} className="press" style={{ display: "flex", alignItems: "center", gap: 10, background: C.dark, border: "none", borderRadius: 12, padding: "12px 14px", cursor: "pointer", color: "#FBF6EC", fontWeight: 600, fontSize: 14, marginBottom: 24, boxShadow: C.sh2 }}>
        <Plus size={18} /> Novo conteúdo
      </button>

      {/* Navegação */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {tabs.map((t) => {
          const active = screen === t.id;
          return (
            <button key={t.id} onClick={() => setScreen(t.id)} className="press" style={{
              display: "flex", alignItems: "center", gap: 12, border: "none", cursor: "pointer",
              background: active ? "rgba(165,106,46,0.12)" : "transparent",
              borderRadius: 10, padding: "11px 14px", textAlign: "left",
              color: active ? C.accent : C.muted, fontWeight: active ? 600 : 500, fontSize: 14,
              transition: "all 0.15s",
            }}>
              {t.icon} {t.label}
            </button>
          );
        })}
      </nav>

      {/* Ajuda + Sair */}
      <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
        <button onClick={() => setScreen("help")} className="press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: screen === "help" ? "rgba(165,106,46,0.12)" : "none", border: "none", cursor: "pointer", padding: "9px 8px", color: screen === "help" ? C.accent : C.muted, fontSize: 13.5, fontWeight: 600, borderRadius: 10 }}>
          <HelpCircle size={17} /> Como usar o app
        </button>
        <button onClick={signOut} className="press" style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "none", border: "none", cursor: "pointer", padding: "9px 8px", color: C.muted, fontSize: 13.5, fontWeight: 500, borderRadius: 10 }}>
          <LogOut size={17} /> Sair da conta
        </button>
      </div>
    </aside>
  );
}
