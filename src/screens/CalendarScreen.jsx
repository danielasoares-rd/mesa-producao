import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { C, ST, PL, TIMES } from "../theme";
import { PlatBadge, StatusPill } from "../components/ui";
import DetailPanel from "../components/DetailPanel";
import {
  MONTHS_FULL, WEEKDAYS_MON, WEEKDAYS_LONG, ymd, todayStr, addDays, startOfWeek, parseYmd,
} from "../lib/dates";

/* Calendário estilo Notion/Google:
   Mês — grade com os conteúdos visíveis nos dias + agenda do dia selecionado
   Semana — colunas (desktop) ou agenda corrida (celular)
   Em qualquer dia dá pra criar conteúdo direto na data (+). */
export default function CalendarScreen({ items, detail, setDetail, setShowAdd, onAddOnDate, onDelete, onEdit, onOpen, isDesktop }) {
  const [tab, setTab] = useState("mes");
  const [cursor, setCursor] = useState(() => new Date());
  const [selected, setSelected] = useState(() => todayStr());

  const itemsOn = (dateStr) =>
    items.filter((i) => i.scheduledDate === dateStr).sort((a, b) => (a.timeSlot ?? 0) - (b.timeSlot ?? 0));

  const goToday = () => { setCursor(new Date()); setSelected(todayStr()); };
  const pad = isDesktop ? "32px" : "16px";

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: `0 0 24px` }}>
      {/* Cabeçalho */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isDesktop ? "32px 32px 14px" : "22px 16px 14px" }}>
        <span style={{ fontWeight: 600, fontSize: 22, color: C.text, fontFamily: C.serif, letterSpacing: "-0.01em" }}>Calendário</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={goToday} className="press" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 13px", cursor: "pointer", color: C.text, fontSize: 12.5, fontWeight: 600 }}>Hoje</button>
          <div style={{ display: "flex", background: "rgba(43,22,13,0.07)", borderRadius: 10, padding: 3 }}>
            {[["mes", "Mês"], ["semana", "Semana"]].map(([v, label]) => (
              <button key={v} onClick={() => setTab(v)} className="press" style={{
                border: "none", cursor: "pointer", background: tab === v ? C.dark : "transparent",
                color: tab === v ? "#FBF6EC" : C.muted, borderRadius: 8, padding: "7px 14px",
                fontSize: 12.5, fontWeight: 600, transition: "all 0.15s",
              }}>{label}</button>
            ))}
          </div>
          <button onClick={() => onAddOnDate(selected)} className="press" title="Novo conteúdo nesta data" style={{ background: C.accent, border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex" }}>
            <Plus size={16} color="#FBF6EC" />
          </button>
        </div>
      </div>

      <div style={{ padding: `0 ${pad}` }}>
        {tab === "mes" ? (
          <MonthView cursor={cursor} setCursor={setCursor} selected={selected} setSelected={setSelected} itemsOn={itemsOn} setDetail={setDetail} isDesktop={isDesktop} />
        ) : (
          <WeekView cursor={cursor} setCursor={setCursor} itemsOn={itemsOn} setDetail={setDetail} onAddOnDate={onAddOnDate} isDesktop={isDesktop} />
        )}

        {/* Agenda do dia selecionado (na visão Mês) */}
        {tab === "mes" && (
          <DayAgenda dateStr={selected} items={itemsOn(selected)} setDetail={setDetail} onAddOnDate={onAddOnDate} />
        )}
      </div>

      {detail && (
        <div style={{ padding: `0 ${pad}`, marginTop: 12 }}>
          <DetailPanel item={detail} onClose={() => setDetail(null)} onDelete={onDelete} onEdit={onEdit} onOpen={onOpen} />
        </div>
      )}
    </div>
  );
}

/* ── Navegação ‹ título › ───────────────────────────────────────── */
function Nav({ label, onPrev, onNext }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <button onClick={onPrev} className="press" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: 6, cursor: "pointer", display: "flex" }}><ChevronLeft size={16} color={C.muted} /></button>
      <span style={{ fontWeight: 600, fontSize: 15.5, color: C.text, fontFamily: C.serif }}>{label}</span>
      <button onClick={onNext} className="press" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 9, padding: 6, cursor: "pointer", display: "flex" }}><ChevronRight size={16} color={C.muted} /></button>
    </div>
  );
}

/* ── Chip de conteúdo dentro da célula ──────────────────────────── */
function EventChip({ item, onClick, full }) {
  const s = ST[item.status] || ST.ideia;
  return (
    <div onClick={(e) => { e.stopPropagation(); onClick(item); }} className="press" title={item.title} style={{
      background: s.bg, color: s.tc, borderRadius: 6, padding: full ? "3px 7px" : "2.5px 6px",
      fontSize: full ? 11 : 10, fontWeight: 600, cursor: "pointer", marginBottom: 3,
      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", lineHeight: 1.5,
    }}>
      {PL[item.platform]?.abbr} · {item.title}
    </div>
  );
}

/* ── Visão Mês ──────────────────────────────────────────────────── */
function MonthView({ cursor, setCursor, selected, setSelected, itemsOn, setDetail, isDesktop }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const gridStart = startOfWeek(new Date(year, month, 1));
  const today = todayStr();

  // 6 semanas fixas → grade estável
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <div className="anim-fade-up">
      <Nav
        label={`${MONTHS_FULL[month]} ${year}`}
        onPrev={() => setCursor(new Date(year, month - 1, 1))}
        onNext={() => setCursor(new Date(year, month + 1, 1))}
      />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", boxShadow: C.sh }}>
        {/* Dias da semana */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${C.border}` }}>
          {WEEKDAYS_MON.map((d) => (
            <div key={d} style={{ textAlign: "center", fontSize: 10.5, fontWeight: 700, color: C.muted, padding: "9px 0", letterSpacing: "0.05em" }}>{isDesktop ? d : d[0]}</div>
          ))}
        </div>
        {/* Células */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
          {cells.map((date, i) => {
            const dstr = ymd(date);
            const inMonth = date.getMonth() === month;
            const isToday = dstr === today;
            const isSelected = dstr === selected;
            const dayItems = itemsOn(dstr);
            const maxChips = isDesktop ? 3 : 0;
            return (
              <div key={i} onClick={() => setSelected(dstr)} style={{
                minHeight: isDesktop ? 96 : 52, padding: isDesktop ? "7px 7px 5px" : "6px 4px 4px",
                borderRight: (i % 7) < 6 ? `0.5px solid ${C.border}` : "none",
                borderBottom: i < 35 ? `0.5px solid ${C.border}` : "none",
                background: isSelected ? "rgba(165,106,46,0.08)" : "transparent",
                opacity: inMonth ? 1 : 0.38, cursor: "pointer", transition: "background 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: isDesktop ? "flex-start" : "center", marginBottom: 4 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: isToday ? 700 : 500,
                    background: isToday ? C.dark : "transparent", color: isToday ? "#FBF6EC" : C.text,
                  }}>{date.getDate()}</span>
                </div>
                {/* Desktop: chips com título · Mobile: bolinhas */}
                {isDesktop ? (
                  <>
                    {dayItems.slice(0, maxChips).map((item) => (
                      <EventChip key={item.id} item={item} onClick={setDetail} />
                    ))}
                    {dayItems.length > maxChips && (
                      <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, paddingLeft: 2 }}>+{dayItems.length - maxChips} mais</div>
                    )}
                  </>
                ) : (
                  dayItems.length > 0 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 3 }}>
                      {dayItems.slice(0, 3).map((it) => (
                        <span key={it.id} style={{ width: 5, height: 5, borderRadius: "50%", background: ST[it.status]?.tc || C.accent, display: "inline-block" }} />
                      ))}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Agenda do dia selecionado ──────────────────────────────────── */
function DayAgenda({ dateStr, items, setDetail, onAddOnDate }) {
  const d = parseYmd(dateStr);
  if (!d) return null;
  const label = `${WEEKDAYS_LONG[d.getDay()]}, ${d.getDate()} de ${MONTHS_FULL[d.getMonth()].toLowerCase()}`;

  return (
    <div className="anim-fade-up" style={{ marginTop: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 15.5, color: C.text, fontFamily: C.serif }}>{label}</span>
        <button onClick={() => onAddOnDate(dateStr)} className="press" style={{ display: "flex", alignItems: "center", gap: 5, background: "rgba(165,106,46,0.1)", border: "none", borderRadius: 9, padding: "7px 12px", cursor: "pointer", color: C.accent, fontSize: 12, fontWeight: 700 }}>
          <Plus size={13} /> Conteúdo
        </button>
      </div>
      {items.length === 0 ? (
        <div style={{ background: C.card, border: `1px dashed ${C.border}`, borderRadius: 14, padding: "18px", textAlign: "center", color: C.muted, fontSize: 13 }}>
          Nada planejado para este dia. Toque em <b style={{ color: C.accent }}>+ Conteúdo</b> para criar.
        </div>
      ) : (
        <div className="stagger">
          {items.map((item) => <AgendaRow key={item.id} item={item} onClick={setDetail} />)}
        </div>
      )}
    </div>
  );
}

function AgendaRow({ item, onClick }) {
  return (
    <div onClick={() => onClick(item)} className="card-hover" style={{
      display: "flex", alignItems: "center", gap: 12, background: C.card,
      border: `1px solid ${C.border}`, borderRadius: 13, padding: "11px 14px",
      marginBottom: 8, cursor: "pointer", boxShadow: C.sh,
    }}>
      <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, width: 40, flexShrink: 0 }}>{TIMES[item.timeSlot ?? 0]}</span>
      <PlatBadge platform={item.platform} size={13} />
      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
      <StatusPill status={item.status} />
    </div>
  );
}

/* ── Visão Semana ───────────────────────────────────────────────── */
function WeekView({ cursor, setCursor, itemsOn, setDetail, onAddOnDate, isDesktop }) {
  const monday = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const last = days[6];
  const today = todayStr();
  const label = monday.getMonth() === last.getMonth()
    ? `${monday.getDate()} – ${last.getDate()} de ${MONTHS_FULL[monday.getMonth()].toLowerCase()}`
    : `${monday.getDate()} ${MONTHS_FULL[monday.getMonth()].slice(0, 3).toLowerCase()} – ${last.getDate()} ${MONTHS_FULL[last.getMonth()].slice(0, 3).toLowerCase()}`;

  if (!isDesktop) {
    /* Celular: agenda corrida da semana */
    return (
      <div className="anim-fade-up">
        <Nav label={label} onPrev={() => setCursor(addDays(cursor, -7))} onNext={() => setCursor(addDays(cursor, 7))} />
        {days.map((d) => {
          const dstr = ymd(d);
          const dayItems = itemsOn(dstr);
          const isToday = dstr === today;
          return (
            <div key={dstr} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12.5, fontWeight: 700, background: isToday ? C.dark : "rgba(43,22,13,0.06)", color: isToday ? "#FBF6EC" : C.text,
                }}>{d.getDate()}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: isToday ? C.accent : C.muted, letterSpacing: "0.04em" }}>{WEEKDAYS_MON[(d.getDay() + 6) % 7]}</span>
                <button onClick={() => onAddOnDate(dstr)} className="press" title="Adicionar" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", opacity: 0.65 }}>
                  <Plus size={15} color={C.accent} />
                </button>
              </div>
              {dayItems.length === 0 ? (
                <div style={{ borderLeft: `2px solid ${C.border}`, marginLeft: 12, padding: "2px 0 2px 14px", color: C.muted, fontSize: 12 }}>—</div>
              ) : (
                dayItems.map((item) => <AgendaRow key={item.id} item={item} onClick={setDetail} />)
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* Desktop: 7 colunas */
  return (
    <div className="anim-fade-up">
      <Nav label={label} onPrev={() => setCursor(addDays(cursor, -7))} onNext={() => setCursor(addDays(cursor, 7))} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
        {days.map((d) => {
          const dstr = ymd(d);
          const dayItems = itemsOn(dstr);
          const isToday = dstr === today;
          return (
            <div key={dstr} style={{ background: C.card, border: `1px solid ${isToday ? C.accent : C.border}`, borderRadius: 14, padding: "10px 8px", minHeight: 190, boxShadow: C.sh, display: "flex", flexDirection: "column" }}>
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.05em", marginBottom: 3 }}>{WEEKDAYS_MON[(d.getDay() + 6) % 7]}</div>
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: isToday ? 700 : 500, background: isToday ? C.dark : "transparent", color: isToday ? "#FBF6EC" : C.text,
                }}>{d.getDate()}</span>
              </div>
              <div style={{ flex: 1 }}>
                {dayItems.map((item) => (
                  <div key={item.id} onClick={() => setDetail(item)} className="press" style={{
                    background: ST[item.status]?.bg, borderRadius: 9, padding: "7px 8px", marginBottom: 6, cursor: "pointer",
                  }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: ST[item.status]?.tc, marginBottom: 2 }}>
                      {TIMES[item.timeSlot ?? 0]} · {PL[item.platform]?.abbr}
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: C.text, lineHeight: 1.35, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.title}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => onAddOnDate(dstr)} className="press" style={{ background: "none", border: `1px dashed ${C.border}`, borderRadius: 9, padding: "6px 0", cursor: "pointer", color: C.muted, fontSize: 11.5, fontWeight: 600, width: "100%" }}>
                + Adicionar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
