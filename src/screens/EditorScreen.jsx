import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Plus, Type, Image as ImageIcon, X, Trash2, Link2, Check, Loader, Bold, Italic, Underline, Highlighter, List, RemoveFormatting } from "lucide-react";
import { C, PL, statusFromStages } from "../theme";
import { PlatBadge, StatusPill } from "../components/ui";
import StageChecklist from "../components/StageChecklist";
import { compressImage } from "../lib/media";

let blockSeq = 0;
const newId = () => `b${Date.now()}_${blockSeq++}`;

// Converte texto puro (dos blocos antigos) em HTML seguro
const escapeHtml = (s) =>
  String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");

/* ── Barra de formatação (aplica na seleção) ─────────────────────── */
function FormatToolbar() {
  // preventDefault no mousedown mantém a seleção do texto ao clicar no botão
  const apply = (e, cmd, val) => {
    e.preventDefault();
    try { document.execCommand(cmd, false, val); } catch {}
  };
  const btn = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, background: "none", border: "none", cursor: "pointer", borderRadius: 8, padding: "7px 9px", color: C.text, fontSize: 13 };
  const tools = [
    { title: "Negrito", icon: <Bold size={15} />, cmd: "bold" },
    { title: "Itálico", icon: <Italic size={15} />, cmd: "italic" },
    { title: "Sublinhado", icon: <Underline size={15} />, cmd: "underline" },
    { title: "Grifar (marca-texto)", icon: <Highlighter size={15} color={C.gold} />, cmd: "hiliteColor", val: "#F8E6A0" },
    { title: "Fonte serifada", icon: <span style={{ fontFamily: C.serif, fontWeight: 700, fontSize: 14, lineHeight: 1 }}>Aa</span>, cmd: "fontName", val: "Fraunces" },
    { title: "Lista (bullet points)", icon: <List size={15} />, cmd: "insertUnorderedList" },
    { title: "Limpar formatação", icon: <RemoveFormatting size={15} />, cmd: "removeFormat" },
  ];
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", gap: 2,
      background: "#FFFFFF", border: `1px solid ${C.border}`, borderRadius: 12,
      padding: "3px 6px", marginBottom: 16, boxShadow: C.sh, width: "fit-content", maxWidth: "100%", overflowX: "auto",
    }}>
      {tools.map((t, i) => (
        <button key={i} title={t.title} onMouseDown={(e) => apply(e, t.cmd, t.val)}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(43,22,13,0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          style={btn}>
          {t.icon}
        </button>
      ))}
    </div>
  );
}

/* Textarea que cresce com o conteúdo — mede DEPOIS do layout (evita altura errada no carregamento) */
function AutoTextarea({ value, onChange, className, style, placeholder }) {
  const ref = useRef(null);
  const measure = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(measure, [value]);
  useEffect(() => {
    // re-mede quando a fonte serifada termina de carregar
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return (
    <textarea ref={ref} rows={1} className={className} style={{ overflow: "hidden", ...style }}
      value={value} placeholder={placeholder} onChange={onChange} />
  );
}

/* Bloco de texto rico (contentEditable, não controlado — preserva o cursor) */
function RichBlock({ block, onInput }) {
  return (
    <div
      className="editor-rich"
      contentEditable
      suppressContentEditableWarning
      data-placeholder="Escreva aqui…"
      ref={(el) => {
        if (el && el.dataset.init !== "1") {
          el.innerHTML = block.html != null ? block.html : escapeHtml(block.text || "");
          el.dataset.init = "1";
        }
      }}
      onInput={(e) => onInput(e.currentTarget.innerHTML)}
    />
  );
}

/* Página completa do conteúdo (estilo Notion):
   título editável, etapas, e blocos de texto/imagem com salvamento automático. */
export default function EditorScreen({ item, onSave, onBack, onDelete, isDesktop }) {
  const [draft, setDraft] = useState(() => ({
    ...item,
    document: (item.document || []).map((b) => ({ id: b.id || newId(), ...b })),
  }));
  const [saveState, setSaveState] = useState("saved"); // saved | saving | error
  const [saveError, setSaveError] = useState(null);
  const timerRef = useRef(null);
  const draftRef = useRef(draft);
  draftRef.current = draft;

  /* ── Salvamento automático (debounce 900ms) ─────────────────── */
  const scheduleSave = useCallback(() => {
    setSaveState("saving");
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const d = draftRef.current;
      const error = await onSave(d.id, d);
      if (error) {
        // Erro mais comum: o banco ainda não tem as colunas novas
        const msg = /column|does not exist|schema|relation/i.test(error.message || "")
          ? "Falta atualizar o banco: rode o SQL de atualização no Supabase (SQL Editor)."
          : error.message || "Verifique a conexão.";
        setSaveError(msg);
        setSaveState("error");
      } else {
        setSaveError(null);
        setSaveState("saved");
      }
    }, 900);
  }, [onSave]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const upd = (patch) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    scheduleSave();
  };

  /* ── Etapas → status automático ─────────────────────────────── */
  const onStages = (stages) => upd({ stages, status: statusFromStages(stages) });

  /* ── Blocos ─────────────────────────────────────────────────── */
  const blocks = draft.document;
  const setBlocks = (document) => upd({ document });

  const addText = () => setBlocks([...blocks, { id: newId(), type: "text", text: "" }]);
  const removeBlock = (id) => setBlocks(blocks.filter((b) => b.id !== id));
  const updBlock = (id, patch) => setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  const addImages = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const imgs = [];
    for (const f of files.slice(0, 8)) {
      try { imgs.push({ id: newId(), type: "image", src: await compressImage(f) }); } catch {}
    }
    if (imgs.length) setBlocks([...blocks, ...imgs]);
  };

  const pad = isDesktop ? "28px 40px 80px" : "16px 16px 60px";
  const maxW = 720;

  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
    <div className="anim-fade-up" style={{ maxWidth: maxW, margin: "0 auto", padding: pad }}>
      {/* Topo: voltar + estado do salvamento + excluir */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <button onClick={onBack} className="press" style={{ display: "flex", alignItems: "center", gap: 4, background: "none", border: "none", cursor: "pointer", color: C.muted, fontSize: 14, padding: 0 }}>
          <ChevronLeft size={18} /> Voltar
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, color: saveState === "error" ? "#9A2B0E" : C.muted }}>
            {saveState === "saving" && <><Loader size={13} className="spin" /> Salvando…</>}
            {saveState === "saved" && <><Check size={14} color="#2f7a4f" /> Salvo</>}
            {saveState === "error" && "Erro ao salvar"}
          </span>
          <button onClick={() => onDelete(draft.id)} title="Excluir conteúdo" className="press" style={{ background: "rgba(43,22,13,0.06)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", display: "flex" }}>
            <Trash2 size={16} color={C.muted} />
          </button>
        </div>
      </div>

      {/* Erro de salvamento (detalhe) */}
      {saveState === "error" && saveError && (
        <div className="anim-fade-up" style={{ background: "#FBE3DA", color: "#9A2B0E", borderRadius: 12, padding: "11px 14px", fontSize: 13, lineHeight: 1.5, marginBottom: 16 }}>
          ⚠️ {saveError}
        </div>
      )}

      {/* Meta */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <PlatBadge platform={draft.platform} size={14} />
        <span style={{ fontSize: 13, color: C.muted }}>{PL[draft.platform]?.label} · {draft.type}</span>
        <StatusPill status={draft.status} />
        {draft.date && <span style={{ fontSize: 12.5, color: C.muted }}>· {draft.date}</span>}
      </div>

      {/* Título */}
      <AutoTextarea
        className="editor-title"
        style={{ fontSize: isDesktop ? 34 : 26, marginBottom: 18 }}
        value={draft.title}
        placeholder="Título do conteúdo"
        onChange={(e) => upd({ title: e.target.value })}
      />

      {/* Etapas */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "16px 18px", boxShadow: C.sh, marginBottom: 14 }}>
        <StageChecklist stages={draft.stages} onChange={onStages} />
      </div>

      {/* Métricas do post (preenchidas pela nutri após postar) */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "14px 18px 16px", boxShadow: C.sh, marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 12.5, color: C.muted, fontWeight: 600 }}>Métricas do post</span>
          <span style={{ fontSize: 11, color: C.muted }}>alimenta a aba Análises</span>
        </div>
        <p style={{ fontSize: 11.5, color: C.muted, margin: "0 0 10px" }}>Depois de postar, copie os números do Instagram e preencha aqui.</p>
        <div style={{ display: "grid", gridTemplateColumns: isDesktop ? "repeat(4,1fr)" : "1fr 1fr", gap: 10 }}>
          {[["views", "Views"], ["saves", "Saves"], ["follows", "Follows"], ["dms", "DMs"]].map(([k, label]) => (
            <div key={k}>
              <label style={{ fontSize: 11, color: C.muted, display: "block", marginBottom: 4, fontWeight: 600 }}>{label}</label>
              <input
                type="number" min="0" inputMode="numeric" placeholder="0"
                value={draft.metrics?.[k] ?? ""}
                onChange={(e) => upd({ metrics: { ...(draft.metrics || {}), [k]: e.target.value === "" ? "" : Math.max(0, Number(e.target.value)) } })}
                style={{ width: "100%", background: "rgba(43,22,13,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "9px 11px", fontSize: 14, color: C.text, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Anexos herdados (link / áudio da ideia) */}
      {(draft.link || draft.audio) && (
        <div style={{ marginBottom: 18 }}>
          {draft.link && (
            <a href={/^https?:\/\//i.test(draft.link) ? draft.link : `https://${draft.link}`} target="_blank" rel="noopener noreferrer"
               style={{ display: "inline-flex", alignItems: "center", gap: 7, color: C.accent, fontSize: 13, textDecoration: "none", marginBottom: 8, wordBreak: "break-all" }}>
              <Link2 size={14} /> {draft.link}
            </a>
          )}
          {draft.audio && <audio src={draft.audio} controls style={{ width: "100%", height: 38, display: "block" }} />}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${C.border}`, marginBottom: 16 }} />

      {/* Barra de formatação (selecione o texto e clique) */}
      <FormatToolbar />

      {/* Blocos do documento */}
      {blocks.length === 0 && (
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginTop: 0 }}>
          Escreva aqui o seu conteúdo — roteiro, legenda, texto dos slides…
          Use <b>+ Texto</b> e <b>+ Imagem</b> abaixo para montar a página do seu jeito.
          Para formatar, <b>selecione o texto</b> e use a barra acima.
        </p>
      )}

      <div>
        {blocks.map((b) => (
          <div key={b.id} style={{ position: "relative", marginBottom: 14 }} className="anim-fade-up">
            {b.type === "text" ? (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <RichBlock block={b} onInput={(html) => updBlock(b.id, { html })} />
                <button onClick={() => removeBlock(b.id)} title="Remover bloco" className="press" style={{ background: "none", border: "none", cursor: "pointer", padding: 4, opacity: 0.5, flexShrink: 0 }}>
                  <X size={14} color={C.muted} />
                </button>
              </div>
            ) : (
              <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
                <img src={b.src} alt="" style={{ maxWidth: "100%", borderRadius: 14, border: `1px solid ${C.border}`, display: "block", boxShadow: C.sh }} />
                <button onClick={() => removeBlock(b.id)} title="Remover imagem" className="press" style={{ position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: "50%", background: "rgba(43,22,13,0.75)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                  <X size={14} color="#FBF6EC" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Adicionar blocos */}
      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button onClick={addText} className="press" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(43,22,13,0.05)", border: `1px dashed ${C.border}`, borderRadius: 12, padding: "10px 16px", cursor: "pointer", color: C.muted, fontSize: 13, fontWeight: 600 }}>
          <Type size={15} color={C.accent} /> Texto
        </button>
        <label className="press" style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(43,22,13,0.05)", border: `1px dashed ${C.border}`, borderRadius: 12, padding: "10px 16px", cursor: "pointer", color: C.muted, fontSize: 13, fontWeight: 600 }}>
          <ImageIcon size={15} color={C.accent} /> Imagem
          <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={addImages} />
        </label>
      </div>
    </div>
    </div>
  );
}
