# 📚 Estuda Enzo

Sistema de estudos para o Enzo (Ensino Fundamental — Anos Finais), feito com base na coleção **SFB — Sistema Farias Brito**, da **Santillana Educação**.

## O que ele faz

- **🧠 Estudar:** o aluno digita o assunto que está vendo na escola e recebe:
  - **resumo** dividido em partes, com palavras-chave;
  - **simulado com 5 questões** (com correção e explicação de cada resposta);
  - **dicas para a hora da prova**;
  - **videoaulas recomendadas** (links que abrem a busca certa no YouTube);
  - uma curiosidade/macete para memorizar.
- **📷 Baseado no livro dele:** dá para anexar fotos das páginas do livro (ou escolher páginas na Estante). Assim o resumo e as questões seguem o que está no livro.
- **📖 Estante:** mostra os livros da coleção SFB do ano escolhido (6º ao 9º), com os 4 volumes de cada matéria. Ao adicionar o PDF do livro digital ou fotos das páginas, ele consegue **ler pelo próprio sistema**, separar páginas para estudar e pedir **“Explicar esta página”**.
- **💬 Tutor:** chat para tirar dúvidas, explicar o que ele não entendeu e corrigir exercícios passo a passo (aceita foto).
- **⭐ Histórico:** guarda tudo que já foi estudado e as notas dos simulados.

Os assuntos marcados com ✅ na tela inicial (Revolução Industrial, Segundo Reinado, Imperialismo) já vêm prontos e funcionam **sem chave e sem internet**.

## Como usar

O site é só HTML, CSS e JavaScript — não precisa instalar nada.

### Publicar no GitHub Pages (recomendado)

1. No GitHub, abra o repositório → **Settings** → **Pages**.
2. Em **Build and deployment**, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)** e clique em **Save**.
3. Em 1 ou 2 minutos o site fica em `https://kauabreno88-spec.github.io/Enzo-irmao-estudo/`.

### Rodar no computador

```powershell
python -m http.server 8000
```

Depois abra `http://localhost:8000` no navegador.

### Ativar a IA

1. Crie uma chave em [console.anthropic.com](https://console.anthropic.com/settings/keys) (a API é paga por uso).
2. No site, vá em **⚙️ Configurações**, cole a chave e clique em **Testar chave**.

A chave fica salva **só no navegador daquele aparelho** (localStorage). Ela nunca vai para o GitHub. Use o site num aparelho de confiança.

Modelos disponíveis em Configurações: **Claude Opus 5.5** (padrão, melhor qualidade), **Sonnet 5.5** e **Haiku 5.5** (mais baratos).

## Sobre os livros

Os livros da coleção SFB são materiais com direitos autorais da Santillana/Farias Brito, por isso **não estão incluídos neste repositório**. A Estante mostra a coleção e o aluno adiciona o PDF do livro digital (da plataforma da escola) ou fotos das páginas do próprio livro. Esses arquivos ficam salvos **somente no aparelho** (IndexedDB do navegador), nunca são enviados para o GitHub. Também é possível colar o link da plataforma digital da escola em cada livro.

## Estrutura

```
index.html               telas do sistema
css/style.css            visual (cores da coleção SFB)
js/app.js                navegação, estudo, simulado, tutor, estante, histórico
js/ai.js                 chamadas ao Claude (SDK oficial da Anthropic)
js/curriculo.js          matérias e assuntos por ano (BNCC)
js/conteudo-offline.js   material pronto que funciona sem IA
js/livros.js             estante e armazenamento dos livros no aparelho
js/leitor.js             leitor de PDF/fotos (PDF.js)
```
