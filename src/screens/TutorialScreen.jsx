import { useState } from "react";
import { ChevronDown, Home, LayoutGrid, FileText, Calendar, Images, BarChart2, Wand2, Sparkles } from "lucide-react";
import { C } from "../theme";

/* Tutorial de uso: passo a passo de cada área do app. */
const SECTIONS = [
  {
    id: "fluxo",
    icon: Sparkles,
    title: "Comece por aqui: o fluxo da Mesa",
    intro: "O app acompanha o ciclo completo da sua produção. O caminho é sempre este:",
    steps: [
      "Anote a ideia no Banco de ideias (tela Início) assim que ela surgir.",
      "Transforme a ideia em conteúdo (botão Criar →) ou crie direto em + Novo conteúdo.",
      "Escreva o roteiro na página do conteúdo e marque as etapas conforme produz.",
      "Acompanhe as datas no Calendário e o andamento no Pipeline.",
      "Depois de postar, preencha as métricas — e veja seus resultados em Análises.",
    ],
  },
  {
    id: "inicio",
    icon: Home,
    title: "Início",
    intro: "Sua central do dia.",
    steps: [
      "Visão geral: quantos conteúdos você tem em cada fase, com o gráfico de distribuição.",
      "Ações rápidas: atalhos para criar conteúdo, ver ideias, roteiros e calendário.",
      "Banco de ideias: digite no campo \"Anote uma ideia rápida…\" e toque em Salvar. Use a ⭐ para favoritar e o botão Criar → para transformar a ideia em conteúdo (ela sai do banco e vira um card).",
      "Sua foto: toque no círculo com o ícone de câmera para colocar sua foto de perfil.",
    ],
  },
  {
    id: "conteudos",
    icon: LayoutGrid,
    title: "Conteúdos e Pipeline",
    intro: "Todos os seus conteúdos, em lista ou em quadro.",
    steps: [
      "Lista: filtre por status (Ideia, Em produção, Agendado…) tocando nos filtros do topo.",
      "Pipeline: alterne no botão ao lado de + Novo. Vira um quadro com colunas por status.",
      "No Pipeline, arraste o card de uma coluna para outra (no computador) ou toque no ícone ⇄ do card e escolha \"Mover para…\" (funciona no celular).",
      "Toque em qualquer card para ver o resumo — e em Abrir conteúdo → para ir à página completa.",
    ],
  },
  {
    id: "pagina",
    icon: FileText,
    title: "Página do conteúdo (a mais importante!)",
    intro: "Onde o conteúdo é escrito e acompanhado. Abre ao criar um conteúdo novo ou pelo botão Abrir conteúdo.",
    steps: [
      "Título e texto: escreva direto na página — salva sozinho (veja o ✓ Salvo no topo).",
      "Formatação: selecione o texto e use a barra — negrito, itálico, sublinhado, marca-texto, fonte elegante e lista de tópicos.",
      "Blocos: use + Texto e + Imagem para montar a página (imagens servem para carrossel e stories).",
      "Etapas de produção: marque Roteiro pronto → Gravado → Editado → Agendado → Postado conforme avança. O status do conteúdo muda sozinho.",
      "Métricas do post: depois de postar, copie os números do Instagram (views, saves, follows, DMs) e preencha aqui. Eles alimentam a aba Análises.",
    ],
  },
  {
    id: "calendario",
    icon: Calendar,
    title: "Calendário",
    intro: "Seus conteúdos organizados por data.",
    steps: [
      "Visão Mês: os conteúdos aparecem dentro dos dias. Toque num dia para ver a agenda dele embaixo.",
      "Visão Semana: colunas por dia com os posts e horários.",
      "Criar na data certa: toque em + Conteúdo (na agenda do dia) ou + Adicionar (na semana) — o conteúdo já nasce com aquela data.",
      "Botão Hoje: volta para a data atual de qualquer lugar.",
    ],
  },
  {
    id: "galeria",
    icon: Images,
    title: "Galeria",
    intro: "Seu banco de fotos para a produção — organizado por tags.",
    steps: [
      "Adicionar fotos: toque no botão e escolha várias de uma vez (elas são comprimidas sozinhas).",
      "Tags: toque numa foto → adicione tags prontas (+ selfies, + comida, + treino…) ou crie a sua digitando no campo.",
      "Filtrar: toque numa tag no topo para ver só aquelas fotos. Dica: com um filtro ativo, as fotos novas já entram com aquela tag.",
      "Baixar: dentro da foto, o botão Baixar foto salva a imagem no aparelho para você usar no post.",
    ],
  },
  {
    id: "analises",
    icon: BarChart2,
    title: "Análises",
    intro: "Seus resultados — com os números que você preenche nos conteúdos postados.",
    steps: [
      "Preencha as métricas de cada conteúdo postado (na página do conteúdo, card \"Métricas do post\").",
      "Os cards mostram Views, Saves, Follows e DMs do período — alterne entre 7, 30 e 90 dias.",
      "Top 5 Heaters: os conteúdos que bateram 2× a sua mediana de views em 30 dias, com uma nota do que fez cada um estourar.",
      "Sem nada postado ainda? Use \"Ver com dados de exemplo\" para conhecer a tela.",
    ],
  },
  {
    id: "skills",
    icon: Wand2,
    title: "Skills",
    intro: "Suas ferramentas de criação com o Claude — baixe e instale no seu projeto.",
    steps: [
      "Siga a ordem: 1) Persona → 2) Linha Editorial → 3) Planejamento Mensal formam a base.",
      "No dia a dia: 4) Modela Conteúdo (transforma referências) e 5) Rotina em Conteúdo (seu dia vira post).",
      "Sempre por último: 6) Humanizer — revisa qualquer texto para não soar IA.",
      "Toque na skill → Baixar skill (.md) → carregue no seu Claude (Personalizar → Habilidades → + → Fazer upload).",
    ],
  },
];

export default function TutorialScreen({ isDesktop }) {
  const [open, setOpen] = useState("fluxo");
  const pad = isDesktop ? "32px 32px 48px" : "22px 16px 40px";

  return (
    <div style={{ padding: pad, maxWidth: 760, margin: "0 auto" }}>
      <span style={{ fontWeight: 600, fontSize: 22, color: C.text, fontFamily: C.serif, letterSpacing: "-0.01em", display: "block", marginBottom: 6 }}>Como usar o app</span>
      <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, margin: "0 0 18px" }}>
        O passo a passo de cada área da sua Mesa de Produção. Toque numa seção para abrir.
      </p>

      <div className="stagger">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isOpen = open === s.id;
          return (
            <div key={s.id} style={{ background: C.card, border: `1px solid ${isOpen ? C.accent : C.border}`, borderRadius: 16, marginBottom: 10, boxShadow: C.sh, overflow: "hidden", transition: "border-color 0.2s" }}>
              <button onClick={() => setOpen(isOpen ? null : s.id)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: "none", border: "none", cursor: "pointer", padding: "15px 16px", textAlign: "left" }}>
                <span style={{ width: 38, height: 38, borderRadius: 11, background: C.dark, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color={C.gold} />
                </span>
                <span style={{ flex: 1, fontWeight: 600, fontSize: 15, color: C.text }}>{s.title}</span>
                <ChevronDown size={17} color={C.muted} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }} />
              </button>
              {isOpen && (
                <div className="anim-fade-up" style={{ padding: "0 16px 16px 66px" }}>
                  <p style={{ fontSize: 13, color: C.muted, margin: "0 0 10px", lineHeight: 1.5 }}>{s.intro}</p>
                  <ol style={{ margin: 0, paddingLeft: 18 }}>
                    {s.steps.map((st, i) => (
                      <li key={i} style={{ fontSize: 13.5, color: C.text, lineHeight: 1.6, marginBottom: 7 }}>{st}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
