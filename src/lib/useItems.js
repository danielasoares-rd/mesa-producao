import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { SEED } from "../theme";
import { displayDate, parseYmd } from "./dates";

// Converte a linha do banco (snake_case) para o formato usado nas telas (camelCase)
const fromRow = (r) => {
  const sd = r.scheduled_date || null; // "YYYY-MM-DD"
  const stages = Array.isArray(r.stages) && r.stages.length === 5 ? r.stages : [false, false, false, false, false];
  const stepsDone = stages.filter(Boolean).length;
  return {
    id: r.id,
    title: r.title,
    platform: r.platform,
    type: r.type,
    status: r.status,
    pilar: r.pilar,
    scheduledDate: sd,
    date: sd ? displayDate(sd) : r.date || "", // texto exibido ("28 JUN")
    dayNum: sd ? parseYmd(sd).getDate() : r.day_num,
    timeSlot: r.time_slot,
    steps: stepsDone,
    total: 5,
    link: r.link || "",
    images: Array.isArray(r.images) ? r.images : [],
    audio: r.audio || null,
    document: Array.isArray(r.document) ? r.document : [],
    stages,
    metrics: r.metrics && typeof r.metrics === "object" ? r.metrics : {},
  };
};

// Converte o item das telas para o formato do banco
const toRow = (item, userId) => {
  const sd = item.scheduledDate || null;
  return {
    user_id: userId,
    title: item.title,
    platform: item.platform,
    type: item.type,
    status: item.status,
    pilar: item.pilar || null,
    scheduled_date: sd,
    date: sd ? displayDate(sd) : item.date || null,
    day_num: sd ? parseYmd(sd).getDate() : item.dayNum ?? null,
    time_slot: item.timeSlot ?? null,
    steps: item.steps ?? 0,
    total: item.total ?? 5,
    link: item.link?.trim() ? item.link.trim() : null,
    images: Array.isArray(item.images) ? item.images : [],
    audio: item.audio || null,
    document: Array.isArray(item.document) ? item.document : [],
    stages: Array.isArray(item.stages) && item.stages.length === 5 ? item.stages : [false, false, false, false, false],
    metrics: item.metrics && typeof item.metrics === "object" ? item.metrics : {},
  };
};

export function useItems(userId) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("content_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setItems(data.map(fromRow));
    setLoading(false);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const addItem = async (item) => {
    const { data, error } = await supabase
      .from("content_items")
      .insert(toRow(item, userId))
      .select()
      .single();
    if (!error && data) {
      const created = fromRow(data);
      setItems((prev) => [created, ...prev]);
      return { error: null, item: created };
    }
    return { error, item: null };
  };

  const updateItem = async (id, item) => {
    const { data, error } = await supabase
      .from("content_items")
      .update(toRow(item, userId))
      .eq("id", id)
      .select()
      .single();
    if (!error && data) setItems((prev) => prev.map((i) => (i.id === id ? fromRow(data) : i)));
    return error;
  };

  const delItem = async (id) => {
    const { error } = await supabase.from("content_items").delete().eq("id", id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
    return error;
  };

  // Insere os 3 conteúdos de exemplo (botão "carregar exemplos" no estado vazio)
  const loadSamples = async () => {
    const rows = SEED.map((s) => toRow(s, userId));
    const { data, error } = await supabase.from("content_items").insert(rows).select();
    if (!error && data) setItems((prev) => [...data.map(fromRow), ...prev]);
    return error;
  };

  return { items, loading, addItem, updateItem, delItem, loadSamples, reload: load };
}
