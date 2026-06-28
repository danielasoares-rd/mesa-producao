// Utilitários de data — trabalham com strings "YYYY-MM-DD" (data local, sem fuso).

export const MONTHS_ABBR = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
export const MONTHS_FULL = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
export const WEEKDAYS_MON = ["SEG","TER","QUA","QUI","SEX","SÁB","DOM"]; // começando na segunda
export const WEEKDAYS_LONG = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];

export function ymd(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayStr() {
  return ymd(new Date());
}

export function parseYmd(str) {
  if (!str) return null;
  const [y, m, d] = String(str).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

// "28 JUN"
export function displayDate(str) {
  const d = parseYmd(str);
  if (!d) return "";
  return `${d.getDate()} ${MONTHS_ABBR[d.getMonth()]}`;
}

// índice da semana começando na segunda (0 = segunda ... 6 = domingo)
export function mondayIndex(d) {
  return (d.getDay() + 6) % 7;
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

// segunda-feira da semana que contém a data
export function startOfWeek(d) {
  return addDays(d, -mondayIndex(d));
}

export function sameYmd(a, b) {
  return a && b && ymd(a) === ymd(b);
}
