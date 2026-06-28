import { Users, BookOpen, Wand2 } from "lucide-react";

// Conteúdo bruto dos arquivos .md das skills (Vite: ?raw vira string) — usado no download
import personaRaw from "./skills/persona-nutri-builder.md?raw";
import linhaRaw from "./skills/linha-editorial-nutri.md?raw";
import modelaRaw from "./skills/modela-conteudo-nutri.md?raw";

// Descrições (texto que a nutri lê) — escritas pela Daniela.
const personaDesc = `
## Para que serve
Para definir de uma vez por todas com quem você está falando. Sem persona clara, qualquer conteúdo que você cria pode servir para todo mundo e não chegar em ninguém. Essa skill resolve isso.

## Como funciona
Você ativa a skill e ela te faz duas perguntas: qual é o seu nicho e quais problemas você resolve. Com base nas suas respostas, ela constrói a sua cliente ideal completa — com nome, momento de vida, o que ela sente, o que ela teme, o que ela quer e o que a impede de agir.

## O que ela gera
Um arquivo .skill personalizado com 11 seções:

- Identidade da sua cliente (quem ela é, onde está, como chegou até você)
- Medos reais — não os óbvios, os profundos
- Dores físicas, emocionais e práticas
- Desejos de curto prazo, na voz dela
- Sonhos de longo prazo
- Aspirações — quem ela quer se tornar
- Objeções e a crença por trás de cada uma
- O vocabulário que ela usa (não o que você usaria para descrevê-la)
- O que ela não suporta ver ou ouvir
- Os 5 níveis de consciência de Eugene Schwartz com exemplos de gancho para cada nível
- Guia de como usar a persona na prática

Você instala esse arquivo no seu projeto Claude e ele passa a funcionar como contexto permanente. Toda vez que você for criar um post, uma legenda ou uma copy, o Claude já sabe com quem você está falando — sem você precisar explicar de novo.
`.trim();

const linhaDesc = `
## Para que serve
Para você nunca mais abrir o Instagram sem saber o que postar. Essa skill organiza tudo que você pode falar — os assuntos profissionais, os temas de vida pessoal e os temas que ficam no meio do caminho — em pilares claros com intenção definida.

## Como funciona
A skill carrega a sua persona automaticamente (se você já a tiver instalada). Depois, ela te faz três perguntas: quais assuntos de nutrição você gosta de abordar, quais assuntos da sua vida pessoal você toparia compartilhar (moda, skincare, treino, receitas, rotina — o que for real para você) e quais temas adjacentes à nutrição você também domina. Com isso, ela monta a sua linha editorial completa.

## O que ela gera
Um arquivo .skill instalável com:

- Seu posicionamento em uma frase
- Mapa de pilares dividido em três grupos — autoridade profissional (40%), conexão e opinião (30%) e vida real (20%)
- Para cada pilar: intenção, como se alinha com a sua persona, formatos que funcionam, 5 ideias concretas de post e frequência sugerida por mês
- Calendário de equilíbrio mensal por semana
- Tom e voz para cada grupo de pilares
- Lista do que não entra na sua linha — para proteger o posicionamento
- Guia de uso para o dia a dia

Quando instalado no seu projeto, o Claude passa a criar qualquer conteúdo já dentro dos seus pilares. Ele sabe em qual pilar o post se encaixa, qual é a intenção e como deve soar — sem você precisar orientar isso toda vez.
`.trim();

const modelaDesc = `
## Para que serve
Para você parar de olhar para o conteúdo dos outros e não saber o que fazer com isso. Quando você vê um post que funcionou bem — seja de uma colega, de um criador de outro nicho ou de qualquer conta que te inspirou — essa skill transforma aquela referência em um conteúdo 100% original com a sua voz, para o seu nicho e para a sua cliente.

Ela não copia. Ela extrai a arquitetura — o gancho, a estrutura, o mecanismo que fez funcionar — e reconstrói do zero com a sua identidade.

## Como funciona
Você envia o material de referência. Pode ser um print, um screenshot, uma legenda colada no chat, um roteiro que você transcreveu de um vídeo, qualquer coisa. Se você já tiver a persona e a linha editorial instaladas, ela usa essas informações automaticamente. Se não tiver, ela te faz três perguntas rápidas para calibrar antes de começar.

## O que ela gera
O conteúdo adaptado no mesmo formato da referência — pronto para publicar com edição mínima:

- Carrossel com todos os slides escritos
- Script de reels com gancho, desenvolvimento e CTA
- Legenda completa com abertura, corpo e fechamento
- Sequência de stories frame a frame
- E-mail com assunto e corpo

Junto com o conteúdo, ela entrega uma nota curta explicando o que foi preservado da referência, o que foi trocado e em qual pilar da sua linha editorial esse conteúdo se encaixa.

## Variações de uso
- **Rápido:** só o conteúdo, sem explicação
- **Com explicação:** mostra o esqueleto antes de adaptar
- **Múltiplo:** você envia 2 ou 3 referências e ela gera um conteúdo para cada
- **Série:** uma referência vira 3 formatos diferentes — carrossel, reels e legenda
`.trim();

// Nota geral, exibida no fim da lista.
export const SKILLS_OUTRO = `
## Como as três funcionam juntas
**Persona** define com quem você fala. **Linha editorial** define sobre o que você fala. **Modelagem** define como você transforma qualquer referência em conteúdo original que serve a quem você fala e se encaixa no que você decidiu falar.

Quanto mais skills você tiver instaladas no seu projeto, menos você precisa explicar ao Claude — e mais rápido sai o conteúdo pronto.
`.trim();

export const SKILLS = [
  {
    id: "persona",
    icon: Users,
    step: 1,
    title: "Persona Nutri Builder",
    subtitle: "Defina com quem você fala",
    description: personaDesc,
    file: "persona-nutri-builder.md",
    raw: personaRaw,
  },
  {
    id: "linha-editorial",
    icon: BookOpen,
    step: 2,
    title: "Linha Editorial Nutri Builder",
    subtitle: "Defina sobre o que postar",
    description: linhaDesc,
    file: "linha-editorial-nutri.md",
    raw: linhaRaw,
  },
  {
    id: "modela-conteudo",
    icon: Wand2,
    step: 3,
    title: "Modela Conteúdo Nutri",
    subtitle: "Transforme referências em conteúdo seu",
    description: modelaDesc,
    file: "modela-conteudo-nutri.md",
    raw: modelaRaw,
  },
];
