import { useState } from "react";
import { SlidersHorizontal, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { C, ST, PL, TIMES } from "../theme";
import { PlatBadge } from "../components/ui";
import DetailPanel from "../components/DetailPanel";
import {
  MONTHS_FULL, WEEKDAYS_LONG, ymd, todayStr, addDays, startOfWeek,
} from "../lib/dates";

export default function CalendarScreen({ items, detail, setDetail, setShowAdd, onDelete, onEdit, isDesktop }) {
  const [tab, setTab] = useState("semana");
  const [cursor, setCursor] = useState(() => new Date()); // dia/mês em foco

  // itens com data definida, indexados por "YYYY-MM-DD"
  const itemsOn = (dateStr) => items.filter((i) => i.scheduledDate === dateStr);

  const padX = isDesktop ? "32px" : "16px";

  return (
    <div style={{ maxWidth: 880, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: isDesktop ? "32px 32px 12px" : "22px 16px 12px" }}>
        <span style={{ fontWeight: 700, fontSize: 20, color: C.text }}>Calendário</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><SlidersHorizontal size={20} color={C.muted} /></button>
          <button onClick={() => setShowAdd(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex" }}><Plus size={21} color={C.text} /></button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", background: "rgba(43,22,13,0.07)", borderRadius: 12, margin: `0 ${padX} 14px`, padding: 3 }}>
        {["Mês", "Semana", "Dia"].map((t) => {
          const active = tab === t.toLowerCase();
          return (
            <button key={t} onClick={() => setTab(t.toLowerCase())} style={{
              flex: 1, padding: "8px 0", borderRadius: 10, border: "none", cursor: "pointer",
              fontWeight: active ? 600 : 400, background: active ? C.dark : "transparent",
              color: active ? "#FBF6EC" : C.muted, fontSize: 14, transition: "all 0.2s",
            }}>{t}</button>
          );
        })}
      </div>

      {tab === "semana" && <WeekView cursor={cursor} setCursor={setCursor} itemsOn={itemsOn} detail={detail} setDetail={setDetail} />}
      {tab === "mês" && <MonthView cursor={cursor} setCursor={setCursor} itemsOn={itemsOn} setDetail={setDetail} />}
      {tab === "dia" && <DayView cursor={cursor} setCursor={setCursor} itemsOn={itemsOn} detail={detail} setDetail={setDetail} />}

      {detail && <DetailPanel item={detail} onClose={() => setDetail(null)} onDelete={onDelete} onEdit={onEdit} />}
    </div>
  );
}

/* ── Cabeçalho com navegação ‹ título › ─────────────────────────── */
function NavHeader({ label, onPrev, onNext }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px 10px" }}>
      <button onClick={onPrev} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}><ChevronLeft size={18} color={C.muted} /></button>
      <span style={{ fontWeight: 500, fontSize: 14, color: C.text }}>{label}</span>
      <button onClick={onNext} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}><ChevronRight size={18} color={C.muted} /></button>
    </div>
  );
}

/* ── Semana ──────────────────────────────────────────────────────── */
function WeekView({ cursor, setCursor, itemsOn, detail, setDetail }) {
  const monday = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const last = days[6];
  const label = monday.getMonth() === last.getMonth()
    ? `${monday.getDate()} – ${last.getDate()} de ${MONTHS_FULL[monday.getMonth()].toLowerCase()}`
    : `${monday.getDate()} ${MONTHS_FULL[monday.getMonth()].slice(0, 3).toLowerCase()} – ${last.getDate()} ${MONTHS_FULL[last.getMonth()].slice(0, 3).toLowerCase()}`;
  const today = todayStr();

  return (
    <>
      <NavHeader label={label} onPrev={() => setCursor(addDays(cursor, -7))} onNext={() => setCursor(addDays(cursor, 7))} />
      <div style={{ display: "grid", gridTemplateColumns: "40px repeat(7,1fr)", padding: "0 12px", gap: 2, marginBottom: 6 }}>
        <div />
        {days.map((d) => {
          const isToday = ymd(d) === today;
          return (
            <div key={ymd(d)} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{["SEG","TER","QUA","QUI","SEX","SÁB","DOM"][((d.getDay()+6)%7)]}</div>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: isToday ? C.dark : "transparent", color: isToday ? "#FBF6EC" : C.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: isToday ? 600 : 400, margin: "0 auto" }}>{d.getDate()}</div>
              {isToday && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent, margin: "3px auto 0" }} />}
            </div>
          );
        })}
      </div>
      <div style={{ padding: "0 12px" }}>
        {TIMES.map((time, ti) => (
          <div key={time} style={{ display: "grid", gridTemplateColumns: "40px repeat(7,1fr)", gap: 2, minHeight: 54, alignItems: "start", borderTop: `0.5px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.muted, paddingTop: 5 }}>{time}</div>
            {days.map((d) => {
              const item = itemsOn(ymd(d)).find((i) => i.timeSlot === ti);
              const active = detail?.id === item?.id;
              return (
                <div key={ymd(d)} style={{ paddingTop: 4, paddingRight: 2 }}>
                  {item && (
                    <div onClick={() => setDetail(active ? null : item)} style={{
                      background: active ? "rgba(165,106,46,0.15)" : C.card,
                      border: `1px solid ${active ? C.accent : C.border}`,
                      borderRadius: 8, padding: "6px 4px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
                    }}>
                      <PlatBadge platform={item.platform} size={11} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Mês ─────────────────────────────────────────────────────────── */
function MonthView({ cursor, setCursor, itemsOn, setDetail }) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const pad = (firstOfMonth.getDay() + 6) % 7; // quantos dias em branco antes do dia 1
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const today = todayStr();

  return (
    <div style={{ padding: "0 16px" }}>
      <NavHeader
        label={`${MONTHS_FULL[month]} ${year}`}
        onPrev={() => setCursor(new Date(year, month - 1, 1))}
        onNext={() => setCursor(new Date(year, month + 1, 1))}
      />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 8 }}>
        {["S", "T", "Q", "Q", "S", "S", "D"].map((d, i) => <div key={i} style={{ textAlign: "center", fontSize: 11, color: C.muted, paddingBottom: 6 }}>{d}</div>)}
        {Array(pad).fill(null).map((_, i) => <div key={`e${i}`} />)}
        {days.map((d) => {
          const dateStr = ymd(new Date(year, month, d));
          const dayItems = itemsOn(dateStr);
          const isToday = dateStr === today;
          return (
            <div key={d} onClick={() => dayItems.length && setDetail(dayItems[0])} style={{ textAlign: "center", padding: "3px 0", cursor: dayItems.length ? "pointer" : "default" }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: isToday ? C.dark : "transparent", color: isToday ? "#FBF6EC" : C.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, margin: "0 auto 3px", fontWeight: isToday ? 600 : 400 }}>{d}</div>
              {dayItems.length > 0 && <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.accent, margin: "0 auto" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Dia ─────────────────────────────────────────────────────────── */
function DayView({ cursor, setCursor, itemsOn, detail, setDetail }) {
  const dayItems = itemsOn(ymd(cursor));
  const label = `${WEEKDAYS_LONG[cursor.getDay()]}, ${cursor.getDate()} de ${MONTHS_FULL[cursor.getMonth()].toLowerCase()}`;

  return (
    <div style={{ padding: "0 16px" }}>
      <NavHeader label={label} onPrev={() => setCursor(addDays(cursor, -1))} onNext={() => setCursor(addDays(cursor, 1))} />
      {TIMES.map((time, ti) => {
        const item = dayItems.find((i) => i.timeSlot === ti);
        const active = detail?.id === item?.id;
        return (
          <div key={time} style={{ display: "flex", gap: 12, minHeight: 60, borderTop: `0.5px solid ${C.border}`, paddingTop: 8, paddingBottom: 4 }}>
            <div style={{ fontSize: 10, color: C.muted, width: 40, flexShrink: 0, paddingTop: 2 }}>{time}</div>
            {item && (
              <div onClick={() => setDetail(active ? null : item)} style={{
                flex: 1, background: active ? "rgba(165,106,46,0.1)" : ST[item.status]?.bg || C.card,
                border: `1px solid ${active ? C.accent : C.border}`, borderRadius: 12, padding: "10px 13px", cursor: "pointer",
              }}>
                <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
                  <PlatBadge platform={item.platform} size={12} />
                  <span style={{ fontSize: 11, color: ST[item.status]?.tc, fontWeight: 600 }}>{PL[item.platform]?.label}</span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{item.title}</div>
              </div>
            )}
          </div>
        );
      })}
      {dayItems.length === 0 && (
        <div style={{ textAlign: "center", padding: "24px 0", color: C.muted, fontSize: 13 }}>Nenhum conteúdo nesse dia.</div>
      )}
    </div>
  );
}
