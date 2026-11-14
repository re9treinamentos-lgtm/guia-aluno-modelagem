# Guia do Aluno · Modelagem de Questões

Site do aluno + painel admin, hospedados de graça no GitHub Pages.

| Arquivo | O que é |
|---|---|
| `index.html` | Site do aluno |
| `admin.html` | Painel admin (só funciona para publicar com o seu token) |
| `content.json` | Todo o conteúdo: aulas, exercícios, cores, textos |
| `base.css`, `tema.js`, `app.js`, `admin.js`, `nuvem.js` | Código do site, do painel e do login. Não precisa mexer. |

---

## Parte 1 · Colocar o site no ar (uma vez, uns 15 minutos)

1. **Crie uma conta grátis** em https://github.com/signup (se ainda não tiver).
2. **Crie o repositório:** clique em **+ → New repository**.
   - Repository name: `guia` (esse nome entra no endereço do site).
   - Marque **Public** (o plano grátis do GitHub Pages exige repositório público).
   - Clique em **Create repository**.
3. **Envie os arquivos:** na página do repositório, clique em **uploading an existing file**. Arraste **todos os arquivos desta pasta** (descompactados, não o .zip) e clique em **Commit changes**.
4. **Ligue o GitHub Pages:** no repositório, vá em **Settings → Pages**.
   - Em *Source*, escolha **Deploy from a branch**.
   - Em *Branch*, escolha **main** e a pasta **/ (root)**. Clique em **Save**.
5. Espere 1 a 2 minutos. O site fica em:
   - Site do aluno: `https://SEU-USUARIO.github.io/guia/`
   - Painel admin: `https://SEU-USUARIO.github.io/guia/admin.html`

> Quer um endereço próprio (ex.: `guia.seudominio.com.br`)? Em **Settings → Pages → Custom domain**, digite o subdomínio e crie no seu provedor de domínio um registro **CNAME** apontando para `SEU-USUARIO.github.io`. Isso também é grátis, se você já tiver o domínio.

## Parte 2 · Conectar o painel admin (uma vez, 5 minutos)

1. Abra https://github.com/settings/personal-access-tokens/new
2. **Token name:** `Painel do guia`. **Expiration:** escolha a validade (ex.: 1 ano).
3. **Repository access:** *Only select repositories* → marque o repositório `guia`.
4. **Permissions → Repository permissions → Contents:** *Read and write*.
5. Clique em **Generate token** e copie o token (começa com `github_pat_`).
6. Abra o `admin.html` do seu site → aba **Publicar e backup** → preencha usuário, repositório (`guia`), branch (`main`) e cole o token → **Testar conexão**.

O token fica salvo só no seu navegador. Em outro computador, cole de novo.

## Parte 3 · Dia a dia

1. Abra `admin.html` e ligue a **Prévia ao vivo** (botão no topo).
2. Edite o que quiser:
   - **Marca e design:** nome, logo, paletas prontas, cores, fontes, cantos.
   - **Página inicial:** textos da capa, seções visíveis, ferramentas do menu.
   - **Módulos:** criar, renomear, reordenar, excluir (com opção de mover as aulas).
   - **Aulas e exercícios:** criar, duplicar, reordenar, mudar de módulo; roteiro, link da videoaula, capa, checklist e exercícios (múltipla escolha ou certo/errado).
   - **Quadro de padrões, treino, materiais, glossário.**
   - **Acesso dos alunos:** código de acesso opcional.
3. Clique em **Publicar**. Em 1 a 2 minutos, os alunos veem a nova versão (se não aparecer, peça para recarregar a página).

Enquanto não publica, tudo fica num **rascunho salvo no seu navegador**. Faça um **backup (.json)** antes de mudanças grandes, na aba Publicar e backup.

## Login dos alunos e progresso na conta (recomendado)

No painel, aba **Acesso e login**, escolha **Login com e-mail e senha**. Cada aluno cria a senha com o e-mail da compra (ou entra com Google) e o progresso fica salvo na conta dele: troca de celular ou computador e continua de onde parou. Você acompanha tudo na aba **Alunos e progresso**.

O login usa o **Firebase (Google), plano gratuito Spark**: sem cartão e sem mensalidade. Configuração única (uns 15 minutos), com o passo a passo dentro do painel:

1. Crie um projeto em https://console.firebase.google.com
2. Registre um app Web (ícone `</>`) e cole o `firebaseConfig` no painel.
3. **Authentication → Método de login:** ative **E-mail/senha** e, se quiser, **Google**.
4. **Authentication → Configurações → Domínios autorizados:** adicione `SEU-USUARIO.github.io`.
5. **Firestore Database:** crie o banco (local `southamerica-east1`, modo de produção).
6. **Firestore → Regras:** cole as regras geradas no painel e clique em **Publicar**.
7. No painel, informe os **e-mails de administrador**, copie as regras de novo se mudar, gere o **link de entrada** e **publique o site**.

**Entrada automática pela Memberkit (recomendado):** em **Acesso e login → Quem pode criar acesso**, escolha **“Quem chega pelo link da área de membros”** e clique em **Gerar link**. Publique o site. Depois, na aba **Links para a Memberkit**, copie o link de cada aula e cole na descrição da aula correspondente na Memberkit, por exemplo: “Guia do aluno: Clique AQUI”.

Assim, ninguém precisa cadastrar aluno: a Hotmart libera a pessoa na Memberkit, ela clica no link do guia embaixo da aula, cria a senha no primeiro acesso e cai direto naquela aula do guia. Nos outros aparelhos, ela entra direto pelo endereço do site com e-mail e senha. Quem não tem o link (não comprou) não consegue criar acesso. Se o link vazar, gere um novo e troque os links na Memberkit: quem já tem acesso continua entrando.

**Outras regras de entrada:** “Só e-mails da lista de compradores” (você cola os e-mails exportados da Hotmart) ou “Qualquer pessoa com o endereço do site”.

**Acompanhamento:** a aba Alunos e progresso mostra, para cada aluno, as aulas concluídas, os exercícios respondidos, o percentual de acertos e a última atividade. O botão “Copiar planilha” leva tudo para o Excel ou o Google Planilhas.

## Importar questões prontas do PDF

Aba **Importar questões (PDF)** do painel:

1. Clique em **Enviar PDF** (também aceita .docx, .pptx e .txt; pode enviar vários de uma vez).
2. A **leitura automática** separa cada questão: número, banca/ano entre parênteses, enunciado, alternativas A) B) C)…, gabarito e comentário.
3. Cada questão vai para a aula certa conforme o próprio PDF indica:
   - um **título em maiúsculas** antes das questões, com a aula ou o padrão (ex.: `AULA 05` ou `PADRÃO: TERMOS NEGATIVOS`);
   - ou uma linha `Padrão: …` / `Aula: …` dentro da questão.
4. O gabarito pode vir em cada questão (`Gabarito: C`, `Resposta: Errado`) ou numa tabela **GABARITO** no fim (`1-C 2-E 3-A`).
5. Confira a lista (questões com pendência aparecem com aviso amarelo), ajuste se precisar e clique em **Adicionar às aulas**. Depois, **Publicar**.

O painel tem um **modelo** pronto (botão “Copiar modelo”): cole no Word, preencha e salve como PDF.

**PDF em outro formato (ou escaneado):** use **Ler com IA**. A IA só extrai as questões como estão, sem criar nem alterar, e sugere o padrão quando o PDF não indicar. Há duas opções:
- **Gemini, grátis:** com chave de https://aistudio.google.com/app/apikey. No plano grátis, o Google pode usar o conteúdo enviado.
- **Claude:** copie as instruções, anexe o PDF no Claude e cole a resposta de volta.

## Outros modos de acesso

- **Código de acesso:** um código único que você entrega aos compradores. O progresso fica no aparelho.
- **Aberto:** qualquer pessoa com o link. O progresso fica no aparelho.

Em qualquer modo, o arquivo `content.json` fica num repositório público. Não coloque nele nada que não possa vazar, como os vídeos ou o PDF completo. Use links da plataforma ou do Google Drive para esse material.

## Materiais para baixar

Em cada aula (aba **Aulas e exercícios**), adicione **Materiais para baixar** com nome, tipo e link. Para o Google Drive: clique com o botão direito no arquivo → **Compartilhar** → Acesso geral: **Qualquer pessoa com o link** → **Copiar link**. Os arquivos aparecem na aula com o botão **Baixar** e reunidos na página **Materiais**.

## Custos

Zero: GitHub Pages (repositório público) e Firebase plano Spark são gratuitos. O plano grátis do Firebase comporta milhares de alunos por dia; você só pagaria se escolhesse mudar de plano.

## Progresso dos alunos

Com o login ligado, o progresso fica na conta do aluno, em qualquer aparelho. Sem login, fica no navegador de cada aparelho.
