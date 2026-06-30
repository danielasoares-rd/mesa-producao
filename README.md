# 🍽️ Mesa de Produção

App de organização de produção de conteúdo para nutricionistas. Funciona no **celular** e como **dashboard no computador**, com login próprio e dados salvos na nuvem (sincroniza entre os aparelhos).

- **Login/cadastro** profissional (Supabase Auth)
- **Conteúdos** organizados por plataforma, status e pilar
- **Calendário** (mês / semana / dia)
- **Análises** automáticas
- **Responsivo**: celular e desktop

---

## 🚀 Publicar em 1 clique (caminho rápido para a nutri)

Quer colocar o seu app no ar sem mexer em código? Siga 3 passos:

**1) Crie seu banco no Supabase** (grátis) e rode o SQL — veja a [Parte 1](#parte-1--criar-o-banco-no-supabase) abaixo. Anote a **Project URL** e a chave **anon/publishable**.

**2) Clique no botão abaixo** para publicar sua cópia no Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/danielasoares-rd/mesa-producao)

**3) Cole as 2 chaves** quando o Netlify pedir (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) e confirme. Em ~1 minuto seu app está no ar com um link próprio. 🎉

> O botão cria uma cópia do projeto no **seu** GitHub e publica no **seu** Netlify. Seus dados ficam no **seu** Supabase. Cada nutri tem o app totalmente separado.

---

## 🧭 Visão geral (como funciona)

O app usa dois serviços **gratuitos**:

| Serviço | Para quê | Custo |
|---|---|---|
| **Supabase** | Guarda o login e os conteúdos | Grátis |
| **Netlify** | Coloca o app no ar (link para acessar) | Grátis |

Cada nutri cria a **própria conta** nesses dois serviços e tem o seu próprio app, totalmente separado das outras.

---

## ✅ Passo a passo de publicação

> Faça na ordem. Leva ~20 minutos na primeira vez.

### Parte 1 — Criar o banco no Supabase

1. Acesse **https://supabase.com** e crie uma conta (pode entrar com Google).
2. Clique em **New project**. Dê um nome (ex.: `mesa-producao`), crie uma senha de banco (guarde) e escolha a região **South America (São Paulo)**. Clique em **Create new project** e aguarde ~2 min.
3. No menu lateral, abra **SQL Editor** → **New query**.
4. Abra o arquivo [`supabase/schema.sql`](supabase/schema.sql) deste projeto, **copie todo o conteúdo**, cole no editor e clique em **Run**. Deve aparecer "Success".
5. Pegue as suas chaves: menu **Project Settings** (engrenagem) → **API**. Você vai usar dois valores:
   - **Project URL**
   - **Project API keys → `anon` `public`**

> 💡 A chave `anon public` pode ficar no site sem problema — ela é feita pra isso. **Nunca** use a chave `service_role`.

#### (Recomendado) Facilitar o cadastro
Para a nutri entrar **sem precisar confirmar o e-mail** toda vez:
- Vá em **Authentication → Providers → Email** e **desligue** a opção *"Confirm email"*. Salve.
- (Se preferir manter a confirmação por e-mail, tudo bem — só avise que ela precisa clicar no link que chega no e-mail antes do primeiro login.)

---

### Parte 2 — Colocar o app no ar (Netlify)

Você pode usar **GitHub** (recomendado, atualiza sozinho) **ou** arrastar a pasta. Escolha um caminho:

#### Caminho A — com GitHub (recomendado)
1. Suba esta pasta para um repositório no **GitHub**.
2. Acesse **https://app.netlify.com** → **Add new site → Import an existing project** → conecte o GitHub e escolha o repositório.
3. O Netlify já detecta o `netlify.toml`. Confirme:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Antes de publicar, clique em **Add environment variables** e cadastre as **duas** chaves do Supabase:
   - `VITE_SUPABASE_URL` = a *Project URL*
   - `VITE_SUPABASE_ANON_KEY` = a chave *anon public*
5. Clique em **Deploy**. Em ~1 min o app estará no ar com um link `.netlify.app`.

#### Caminho B — sem GitHub (arrastar)
1. No seu computador, dentro desta pasta, rode:
   ```bash
   npm install
   npm run build
   ```
2. Vai aparecer uma pasta **`dist`**.
3. No Netlify, vá em **Sites** e **arraste a pasta `dist`** para a área de upload.
4. Depois entre no site → **Site configuration → Environment variables** e adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. **Rode `npm run build` de novo e re-suba a pasta `dist`** para as chaves valerem.

> ⚠️ No caminho B, sempre que mudar as variáveis, é preciso **buildar e subir de novo**. Por isso o caminho A (GitHub) é mais prático.

---

### Parte 3 — Primeiro acesso
1. Abra o link do Netlify no celular ou no computador.
2. Clique em **Cadastre-se**, crie login e senha.
3. Pronto! Os conteúdos ficam salvos e aparecem nos dois aparelhos.

> 📱 No celular, dá pra "instalar" o app: abra o link no navegador → menu → **Adicionar à Tela de Início**. Fica com cara de aplicativo.

---

## 💻 Rodar localmente (para testar / desenvolver)

```bash
npm install
cp .env.example .env     # depois edite o .env com as suas chaves
npm run dev
```

Abra o endereço que aparecer (geralmente `http://localhost:5173`).

---

## 🛠️ Resolução de problemas

| Problema | Solução |
|---|---|
| Aparece o aviso amarelo "chaves não configuradas" | As variáveis `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` não foram preenchidas. No Netlify, confira em *Environment variables* e faça um novo deploy. |
| "E-mail ou senha incorretos" no primeiro login | Se a confirmação de e-mail estiver ligada, abra o e-mail e clique no link antes de entrar. |
| Cadastrei mas não aparece nada / erro ao salvar | Confirme que o `schema.sql` rodou com sucesso no Supabase (tabela `content_items` criada). |
| Mudei as chaves e não funcionou | No Netlify é preciso **refazer o deploy** depois de alterar variáveis de ambiente. |

---

## 📂 Estrutura do projeto

```
src/
├── components/   → peças reutilizáveis (login, cartão, modal, navegação)
├── screens/      → as 4 telas (Início, Conteúdos, Calendário, Análises)
├── lib/          → Supabase, autenticação e acesso aos dados
├── theme.js      → cores e constantes visuais
└── App.jsx       → monta tudo (decide layout mobile x desktop)
supabase/
└── schema.sql    → estrutura do banco (rodar 1 vez no Supabase)
```

---

## 📝 Observação sobre o calendário

O calendário hoje mostra uma **semana de exemplo (20–26 de maio)** — herdada do protótipo. Os conteúdos com `dayNum` entre 20 e 26 aparecem nele. Para deixá-lo 100% dinâmico (mês atual de verdade, com seletor de data ao criar o conteúdo), é só pedir a próxima evolução. 😉
