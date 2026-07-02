import { useState, useRef, useEffect } from "react";
import { X, Link2, Image as ImageIcon, Mic, Square, Trash2 } from "lucide-react";
import { C, PL, ST, TIMES } from "../theme";
import { todayStr } from "../lib/dates";
import { compressImage, blobToDataUrl, canRecordAudio, pickAudioMime, formatSeconds } from "../lib/media";

const MAX_IMAGES = 6;
const MAX_REC_SECONDS = 120; // limite de 2 min por gravação (voz)

const blank = {
  title: "", platform: "instagram", type: "Reels", status: "ideia", pilar: "",
  scheduledDate: todayStr(), timeSlot: 0, link: "", images: [], audio: null,
};

// Traduz erros técnicos do banco para uma instrução clara
const niceError = (m) =>
  /column|schema cache|does not exist|relation/i.test(m || "")
    ? "Falta atualizar o banco: rode o SQL de atualização no Supabase (SQL Editor → Run)."
    : (m || "tente novamente.");

export default function AddModal({ onClose, onSave, initial, prefill }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(() => initial ? {
    title: initial.title || "", platform: initial.platform || "instagram", type: initial.type || "Reels",
    status: initial.status || "ideia", pilar: initial.pilar || "",
    scheduledDate: initial.scheduledDate || todayStr(),
    timeSlot: typeof initial.timeSlot === "number" ? initial.timeSlot : 0,
    link: initial.link || "", images: Array.isArray(initial.images) ? initial.images : [], audio: initial.audio || null,
  } : { ...blank, ...(prefill || {}) });

  const [saving, setSaving] = useState(false);
  const [mediaMsg, setMediaMsg] = useState(null);

  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);
  const audioSupported = canRecordAudio();

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const typeOpts = { instagram: ["Reels", "Carrossel", "Stories", "Post"], tiktok: ["Vídeo", "Stories"], youtube: ["Vídeo", "Shorts"], linkedin: ["Post", "Artigo"] };

  useEffect(() => () => {
    clearInterval(timerRef.current);
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
  }, []);

  /* ── Imagens (prints) ─────────────────────────────────────────── */
  const onPickImages = async (e) => {
    setMediaMsg(null);
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_IMAGES - form.images.length;
    if (room <= 0) { setMediaMsg(`Máximo de ${MAX_IMAGES} imagens por ideia.`); return; }
    const results = [];
    for (const file of files.slice(0, room)) {
      try { results.push(await compressImage(file)); }
      catch { setMediaMsg("Uma das imagens não pôde ser adicionada (formato não suportado)."); }
    }
    if (results.length) setForm((f) => ({ ...f, images: [...f.images, ...results] }));
  };

  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  /* ── Áudio ────────────────────────────────────────────────────── */
  const startRec = async () => {
    setMediaMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickAudioMime();
      const opts = { audioBitsPerSecond: 32000 };
      if (mime) opts.mimeType = mime;
      const mr = new MediaRecorder(stream, opts);
      chunksRef.current = [];
      mr.ondataavailable = (ev) => { if (ev.data && ev.data.size) chunksRef.current.push(ev.data); };
      mr.onstop = async () => {
        try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
        try {
          const blob = new Blob(chunksRef.current, { type: mr.mimeType || mime || "audio/webm" });
          upd("audio", await blobToDataUrl(blob));
        } catch { setMediaMsg("Não foi possível salvar o áudio. Tente gravar de novo."); }
      };
      mr.start();
      recorderRef.current = mr;
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => {
        setRecSeconds((s) => {
          if (s + 1 >= MAX_REC_SECONDS) { stopRec(); return MAX_REC_SECONDS; }
          return s + 1;
        });
      }, 1000);
    } catch {
      setMediaMsg("Não consegui acessar o microfone. Verifique a permissão do navegador e tente de novo.");
    }
  };

  const stopRec = () => {
    clearInterval(timerRef.current);
    try { if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop(); } catch {}
    setRecording(false);
  };

  const removeAudio = () => { upd("audio", null); setRecSeconds(0); };

  /* ── Salvar ───────────────────────────────────────────────────── */
  const save = async () => {
    if (saving) return;
    if (recording) { setMediaMsg("Pare a gravação do áudio antes de salvar."); return; }
    if (!form.title.trim()) { setMediaMsg("Dê um título para a ideia antes de salvar."); return; }
    setMediaMsg(null);
    setSaving(true);
    try {
      // Ao editar, preserva as etapas e o documento (página) já existentes
      const payload = isEdit
        ? { ...form, steps: initial.steps ?? 0, total: 5, stages: initial.stages, document: initial.document }
        : { ...form, steps: 0, total: 5 };
      const error = await onSave(payload);
      if (error) {
        setSaving(false);
        setMediaMsg("Não foi possível salvar: " + niceError(error.message));
      }
    } catch (e) {
      setSaving(false);
      setMediaMsg("Não foi possível salvar: " + niceError(e?.message));
    }
  };

  const inputStyle = { width: "100%", background: "rgba(43,22,13,0.05)", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 13px", fontSize: 14, color: C.text, fontFamily: "inherit", boxSizing: "border-box" };
  const labelStyle = { fontSize: 12, color: C.muted, marginBottom: 6, display: "block" };
  const chipBtn = { display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: `1px solid ${C.border}`, background: "rgba(43,22,13,0.04)", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontSize: 13, color: C.text, fontFamily: "inherit", fontWeight: 500 };

  return (
    <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(43,22,13,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: "20px 20px 0 0", padding: "20px 20px 32px", width: "100%", maxWidth: 460, maxHeight: "92%", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontWeight: 700, fontSize: 18, color: C.text }}>{isEdit ? "Editar conteúdo" : "Nova ideia"}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}><X size={20} color={C.muted} /></button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input style={inputStyle} value={form.title} onChange={(e) => upd("title", e.target.value)} placeholder="Sobre o que é esse conteúdo?" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Plataforma</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={form.platform} onChange={(e) => { upd("platform", e.target.value); upd("type", typeOpts[e.target.value][0]); }}>
                {Object.entries(PL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Formato</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={form.type} onChange={(e) => upd("type", e.target.value)}>
                {(typeOpts[form.platform] || []).map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Data e horário */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Data</label>
              <input type="date" style={inputStyle} value={form.scheduledDate || ""} onChange={(e) => upd("scheduledDate", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Horário</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={form.timeSlot} onChange={(e) => upd("timeSlot", Number(e.target.value))}>
                {TIMES.map((t, i) => <option key={t} value={i}>{t}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Status</label>
              <select style={{ ...inputStyle, appearance: "none" }} value={form.status} onChange={(e) => upd("status", e.target.value)}>
                {Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Pilar</label>
              <input style={inputStyle} value={form.pilar} onChange={(e) => upd("pilar", e.target.value)} placeholder="Ex: Produtividade" />
            </div>
          </div>

          {/* Link */}
          <div>
            <label style={labelStyle}>Link de referência</label>
            <div style={{ display: "flex", alignItems: "center", gap: 8, ...inputStyle, padding: "0 13px" }}>
              <Link2 size={16} color={C.muted} style={{ flexShrink: 0 }} />
              <input
                style={{ flex: 1, border: "none", background: "none", outline: "none", fontSize: 14, color: C.text, fontFamily: "inherit", padding: "10px 0" }}
                value={form.link}
                onChange={(e) => upd("link", e.target.value)}
                placeholder="Cole um link (opcional)"
                inputMode="url"
              />
            </div>
          </div>

          {/* Prints / imagens */}
          <div>
            <label style={labelStyle}>Prints e imagens</label>
            <label style={{ ...chipBtn, opacity: form.images.length >= MAX_IMAGES ? 0.5 : 1 }}>
              <ImageIcon size={16} color={C.accent} />
              {form.images.length ? "Adicionar mais imagens" : "Adicionar imagens"}
              <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onPickImages} disabled={form.images.length >= MAX_IMAGES} />
            </label>
            {form.images.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                {form.images.map((src, i) => (
                  <div key={i} style={{ position: "relative", width: 64, height: 64 }}>
                    <img src={src} alt="" style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 10, border: `1px solid ${C.border}` }} />
                    <button onClick={() => removeImage(i)} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: C.dark, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>
                      <X size={12} color="#FBF6EC" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Áudio */}
          <div>
            <label style={labelStyle}>Áudio da ideia</label>
            {!audioSupported && (
              <div style={{ fontSize: 12.5, color: C.muted }}>
                Seu navegador não permite gravar áudio aqui. (Tente pelo Chrome ou Safari no celular.)
              </div>
            )}
            {audioSupported && !form.audio && !recording && (
              <button onClick={startRec} style={{ ...chipBtn, width: "100%" }}>
                <Mic size={16} color={C.accent} /> Gravar áudio
              </button>
            )}
            {audioSupported && recording && (
              <button onClick={stopRec} style={{ ...chipBtn, width: "100%", background: "#FBE3DA", border: "1px solid #E9B7A6", color: "#9A2B0E" }}>
                <Square size={14} color="#9A2B0E" /> Parar — {formatSeconds(recSeconds)}
              </button>
            )}
            {form.audio && !recording && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
                <audio src={form.audio} controls style={{ flex: 1, height: 38 }} />
                <button onClick={removeAudio} title="Remover áudio" style={{ background: "rgba(43,22,13,0.06)", border: "none", borderRadius: 10, padding: 9, cursor: "pointer", display: "flex" }}>
                  <Trash2 size={16} color={C.muted} />
                </button>
              </div>
            )}
          </div>

          {mediaMsg && (
            <div style={{ fontSize: 12.5, lineHeight: 1.4, background: "#FBE3DA", color: "#9A2B0E", borderRadius: 10, padding: "9px 12px" }}>{mediaMsg}</div>
          )}

          <button onClick={save} disabled={saving} style={{ background: C.gold, border: "none", borderRadius: 14, padding: "14px", cursor: "pointer", color: C.dark, fontWeight: 700, fontSize: 15, width: "100%", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Adicionar à Mesa"}
          </button>
        </div>
      </div>
    </div>
  );
}
