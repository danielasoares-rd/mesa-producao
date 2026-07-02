import { useState } from "react";
import { C } from "./theme";
import { useAuth } from "./lib/useAuth";
import { useItems } from "./lib/useItems";
import { useIdeas } from "./lib/useIdeas";
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
import SkillsScreen from "./screens/SkillsScreen";
import EditorScreen from "./screens/EditorScreen";

function Loader({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, color: C.muted, fontSize: 14 }}>
      {text}
    </div>
  );
}

export default function App() {
  const { user, name, loading, signOut } = useAuth();

  if (!isConfigured) return <AuthScreen />;
  if (loading) return <Loader text="Carregando…" />;
  if (!user) return <AuthScreen />;

  return <Dashboard user={user} name={name} signOut={signOut} />;
}

function Dashboard({ user, name, signOut }) {
  const isDesktop = useIsDesktop();
  const { items, loading, addItem, updateItem, delItem, loadSamples } = useItems(user.id);
  const { ideas, addIdea, toggleFavorite, delIdea } = useIdeas(user.id);

  const [screen, setScreen] = useState("home");
  const [detail, setDetail] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);     // item em edição no modal
  const [prefill, setPrefill] = useState(null);        // pré-preenchimento (ideia → conteúdo)
  const [fromIdea, setFromIdea] = useState(null);      // ideia de origem (some após virar conteúdo)
  const [editorId, setEditorId] = useState(null);      // página do conteúdo aberta
  const [contentFilter, setContentFilter] = useState(null); // filtro inicial de Conteúdos

  const editorItem = editorId ? items.find((i) => i.id === editorId) : null;

  const openNew = () => { setEditItem(null); setPrefill(null); setFromIdea(null); setShowAdd(true); };
  const openEdit = (item) => { setDetail(null); setEditItem(item); setPrefill(null); setShowAdd(true); };
  const closeModal = () => { setShowAdd(false); setEditItem(null); setPrefill(null); setFromIdea(null); };

  const openEditor = (item) => { setDetail(null); setEditorId(item.id); };
  const closeEditor = () => setEditorId(null);

  const openContentFiltered = (filter) => { setContentFilter(filter); setScreen("content"); };

  // "+" do calendário: novo conteúdo já com a data escolhida
  const openNewOnDate = (dateStr) => {
    setEditItem(null); setFromIdea(null);
    setPrefill({ scheduledDate: dateStr });
    setShowAdd(true);
  };

  // Ideia → conteúdo: abre o modal já com o título preenchido
  const onTransformIdea = (idea) => {
    setEditItem(null);
    setPrefill({ title: idea.text });
    setFromIdea(idea);
    setShowAdd(true);
  };

  const handleSave = async (item) => {
    if (editItem) {
      const error = await updateItem(editItem.id, item);
      if (!error) closeModal();
      return error;
    }
    const { error, item: created } = await addItem(item);
    if (!error) {
      if (fromIdea) await delIdea(fromIdea.id); // a ideia virou conteúdo
      closeModal();
      if (created) openEditor(created); // abre direto a página para escrever o conteúdo
    }
    return error;
  };

  const handleDelete = async (id) => {
    await delItem(id);
    setDetail(null);
    if (editorId === id) setEditorId(null);
  };

  const screenProps = { items, setDetail, setScreen, setShowAdd: openNew, name, signOut, isDesktop };

  const screens = editorItem ? (
    <EditorScreen
      key={editorItem.id}
      item={editorItem}
      onSave={updateItem}
      onBack={closeEditor}
      onDelete={handleDelete}
      isDesktop={isDesktop}
    />
  ) : (
    <>
      {screen === "home" && (
        <HomeScreen
          {...screenProps}
          loadSamples={items.length === 0 ? loadSamples : null}
          ideas={ideas} addIdea={addIdea} toggleFavorite={toggleFavorite} delIdea={delIdea}
          onTransformIdea={onTransformIdea} openContentFiltered={openContentFiltered}
        />
      )}
      {screen === "content" && (
        <ContentScreen
          key={contentFilter || "todos"}
          items={items} setDetail={setDetail} setShowAdd={openNew}
          onOpen={openEditor} onMove={updateItem}
          isDesktop={isDesktop} initialFilter={contentFilter}
        />
      )}
      {screen === "calendar" && <CalendarScreen items={items} detail={detail} setDetail={setDetail} setShowAdd={openNew} onAddOnDate={openNewOnDate} onDelete={handleDelete} onEdit={openEdit} onOpen={openEditor} isDesktop={isDesktop} />}
      {screen === "analytics" && <AnalyticsScreen items={items} isDesktop={isDesktop} />}
      {screen === "skills" && <SkillsScreen isDesktop={isDesktop} />}

      {detail && screen !== "calendar" && (
        <div style={{ padding: "0 16px", maxWidth: 880, margin: "0 auto" }}>
          <DetailPanel item={detail} onClose={() => setDetail(null)} onDelete={handleDelete} onEdit={openEdit} onOpen={openEditor} />
        </div>
      )}
    </>
  );

  const changeScreen = (s) => { setEditorId(null); setContentFilter(null); setScreen(s); };

  /* ── Layout desktop: sidebar + área de conteúdo ───────────────── */
  if (isDesktop) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif", WebkitFontSmoothing: "antialiased" }}>
        <Sidebar screen={screen} setScreen={changeScreen} setShowAdd={openNew} />
        <main style={{ flex: 1, minWidth: 0, position: "relative" }}>
          {loading ? <Loader text="Carregando seus conteúdos…" /> : screens}
          {showAdd && <AddModal onClose={closeModal} onSave={handleSave} initial={editItem} prefill={prefill} />}
        </main>
      </div>
    );
  }

  /* ── Layout mobile ────────────────────────────────────────────── */
  return (
    <div style={{
      maxWidth: 430, margin: "0 auto", background: C.bg, minHeight: "100vh",
      display: "flex", flexDirection: "column", position: "relative",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif", WebkitFontSmoothing: "antialiased",
    }}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? <Loader text="Carregando seus conteúdos…" /> : screens}
      </div>

      <BottomNav screen={screen} setScreen={changeScreen} setShowAdd={openNew} />

      {showAdd && (
        <div style={{ position: "absolute", inset: 0, zIndex: 200 }}>
          <AddModal onClose={closeModal} onSave={handleSave} initial={editItem} prefill={prefill} />
        </div>
      )}
    </div>
  );
}
