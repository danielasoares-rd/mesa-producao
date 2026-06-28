import { useState } from "react";
import { C } from "./theme";
import { useAuth } from "./lib/useAuth";
import { useItems } from "./lib/useItems";
import { useIsDesktop } from "./lib/useMediaQuery";
import { isConfigured } from "./lib/supabase";

import AuthScreen from "./components/AuthScreen";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import AddModal from "./components/AddModal";
import DetailPanel from "./components/DetailPanel";

import HomeScreen from "./screens/HomeScreen";
import CalendarScreen from "./screens/CalendarScreen";
import ContentScreen from "./screens/ContentScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";

function Loader({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, color: C.muted, fontSize: 14 }}>
      {text}
    </div>
  );
}

export default function App() {
  const { user, name, loading, signOut } = useAuth();

  // Supabase não configurado → mostra a tela de auth com o aviso amarelo
  if (!isConfigured) return <AuthScreen />;
  if (loading) return <Loader text="Carregando…" />;
  if (!user) return <AuthScreen />;

  return <Dashboard user={user} name={name} signOut={signOut} />;
}

function Dashboard({ user, name, signOut }) {
  const isDesktop = useIsDesktop();
  const { items, loading, addItem, updateItem, delItem, loadSamples } = useItems(user.id);

  const [screen, setScreen] = useState("home");
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null); // item sendo editado (null = novo)

  const openNew = () => { setEditItem(null); setShowAdd(true); };
  const openEdit = (item) => { setDetail(null); setEditItem(item); setShowAdd(true); };
  const closeModal = () => { setShowAdd(false); setEditItem(null); };

  const handleSave = async (item) => {
    const error = editItem ? await updateItem(editItem.id, item) : await addItem(item);
    if (!error) closeModal(); // só fecha se salvou de verdade
    return error;
  };
  const handleDelete = async (id) => {
    await delItem(id);
    setDetail(null);
  };

  // setShowAdd é passado aos filhos como "abrir novo conteúdo"
  const screenProps = { items, setDetail, setScreen, setShowAdd: openNew, name, signOut, isDesktop };

  const screens = (
    <>
      {screen === "home" && <HomeScreen {...screenProps} loadSamples={items.length === 0 ? loadSamples : null} />}
      {screen === "content" && <ContentScreen items={items} setDetail={setDetail} setShowAdd={openNew} isDesktop={isDesktop} />}
      {screen === "calendar" && <CalendarScreen items={items} detail={detail} setDetail={setDetail} setShowAdd={openNew} onDelete={handleDelete} onEdit={openEdit} isDesktop={isDesktop} />}
      {screen === "analytics" && <AnalyticsScreen items={items} isDesktop={isDesktop} />}

      {detail && screen !== "calendar" && (
        <div style={{ padding: "0 16px", maxWidth: 880, margin: "0 auto" }}>
          <DetailPanel item={detail} onClose={() => setDetail(null)} onDelete={handleDelete} onEdit={openEdit} />
        </div>
      )}
    </>
  );

  /* ── Layout desktop: sidebar + área de conteúdo ───────────────── */
  if (isDesktop) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif", WebkitFontSmoothing: "antialiased" }}>
        <Sidebar screen={screen} setScreen={setScreen} setShowAdd={setShowAdd} />
        <main style={{ flex: 1, minWidth: 0, position: "relative" }}>
          {loading ? <Loader text="Carregando seus conteúdos…" /> : screens}
          {showAdd && <AddModal onClose={closeModal} onSave={handleSave} initial={editItem} />}
        </main>
      </div>
    );
  }

  /* ── Layout mobile: frame de celular + nav inferior ───────────── */
  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", background: C.bg, minHeight: "100vh",
      display: "flex", flexDirection: "column", position: "relative",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? <Loader text="Carregando seus conteúdos…" /> : screens}
      </div>

      <BottomNav screen={screen} setScreen={setScreen} setShowAdd={setShowAdd} />

      {showAdd && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200 }}>
          <AddModal onClose={closeModal} onSave={handleSave} initial={editItem} />
        </div>
      )}
    </div>
  );
}
