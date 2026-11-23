import { MATERIAS, CURRICULO, materiaPorId } from "./curriculo.js";
import { buscarOffline, temOffline } from "./conteudo-offline.js";
import { livrosDoAno, adicionarLivroExtra, getMeta, setMeta, salvarArquivo, lerArquivo, removerArquivo, idsComArquivo, apagarTudo } from "./livros.js";
import { Leitor, blobParaImagem } from "./leitor.js";

// O módulo de IA é carregado sob demanda: assim o site abre e o material pronto funciona mesmo sem internet.
let aiMod;
const ai = async () => (aiMod ??= await import("./ai.js"));

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const LS = {
  get: (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch { return padrao; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v))
};

const estado = {
  ano: LS.get("estuda.ano", 8),
  nome: LS.get("estuda.nome", "Enzo"),
  paginasEstudo: [],   // imagens anexadas ao próximo estudo
  tutorImagens: [],    // imagens anexadas à próxima pergunta do tutor
  tutorHistorico: [],  // mensagens no formato da API
  tutorContexto: "",
  estudoAtual: null,
  livroAberto: null
};

// ================= Utilidades =================
function escapar(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function inline(s) {
  return escapar(s)
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, "$1<i>$2</i>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

// Markdown simples (negrito, itálico, listas, títulos) para as respostas do tutor.
function markdown(texto = "") {
  const linhas = texto.split("\n");
  let html = "", lista = null;
  const fecharLista = () => { if (lista) { html += `</${lista}>`; lista = null; } };
  for (const bruta of linhas) {
    const l = bruta.trimEnd();
    let m;
    if ((m = l.match(/^\s*[-*•]\s+(.*)/))) {
      if (lista !== "ul") { fecharLista(); html += "<ul>"; lista = "ul"; }
      html += `<li>${inline(m[1])}</li>`;
    } else if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) {
      if (lista !== "ol") { fecharLista(); html += "<ol>"; lista = "ol"; }
      html += `<li>${inline(m[1])}</li>`;
    } else if ((m = l.match(/^#{1,4}\s+(.*)/))) {
      fecharLista(); html += `<h4>${inline(m[1])}</h4>`;
    } else if (l.trim() === "") {
      fecharLista();
    } else {
      fecharLista(); html += `<p>${inline(l)}</p>`;
    }
  }
  fecharLista();
  return html;
}

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.hidden = true), 3200);
}

function irPara(tela) {
  $$(".tela").forEach(s => s.classList.toggle("ativa", s.id === `tela-${tela}`));
  $$("#abas button").forEach(b => b.classList.toggle("ativa", b.dataset.tela === tela));
  if (tela === "estante") renderEstante();
  if (tela === "historico") renderHistorico();
  if (tela === "config") carregarConfig();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const nomeMateria = (id) => materiaPorId(id)?.nome || id;

// ================= Início =================
function renderInicio() {
  $("#nome-aluno").textContent = estado.nome || "Enzo";
  $("#sel-ano").value = String(estado.ano);
  const cur = CURRICULO[estado.ano] || {};
  $("#lista-curriculo").innerHTML = MATERIAS.map(m => `
    <div class="cartao bloco-materia" style="--cor:${m.cor}">
      <h3>${m.icone} ${m.nome}${m.sub ? ` <small>${m.sub}</small>` : ""}</h3>
      <div class="chips">
        ${(cur[m.id] || []).map(a => `<button class="chip" data-materia="${m.id}" data-assunto="${escapar(a)}">${temOffline(a) ? "✅ " : ""}${escapar(a)}</button>`).join("")}
      </div>
    </div>`).join("");
}

function adivinharMateria(assunto) {
  const n = assunto.toLowerCase();
  const cur = CURRICULO[estado.ano] || {};
  for (const [mat, lista] of Object.entries(cur)) {
    if (lista.some(a => a.toLowerCase().includes(n) || n.includes(a.toLowerCase()))) return mat;
  }
  return null;
}

// ================= Estudar =================
function preencherMaterias() {
  $("#est-materia").innerHTML = MATERIAS.map(m => `<option value="${m.id}">${m.icone} ${m.nome}</option>`).join("");
  $("#est-materia").value = "humanas";
}

function renderMiniaturas(alvo, lista, aoRemover) {
  alvo.innerHTML = lista.map((img, i) => `
    <figure class="mini"><img src="${img.url}" alt="${escapar(img.rotulo)}"><figcaption>${escapar(img.rotulo)}</figcaption>
    <button type="button" data-i="${i}" title="Remover">✕</button></figure>`).join("");
  alvo.querySelectorAll("button").forEach(b => b.onclick = () => { lista.splice(+b.dataset.i, 1); aoRemover(); });
}
const renderMiniEstudo = () => renderMiniaturas($("#est-miniaturas"), estado.paginasEstudo, renderMiniEstudo);
const renderMiniTutor = () => renderMiniaturas($("#tutor-miniaturas"), estado.tutorImagens, renderMiniTutor);

async function adicionarFotos(arquivos, lista, render) {
  for (const f of arquivos) {
    if (lista.length >= 6) { toast("Máximo de 6 fotos por vez."); break; }
    lista.push(await blobParaImagem(f, f.name.replace(/\.[^.]+$/, "").slice(0, 18)));
  }
  render();
}

const MSGS_CARREGANDO = ["Lendo o assunto…", "Organizando o resumo…", "Criando as questões do simulado…", "Separando as dicas para a prova…", "Procurando boas videoaulas…"];

async function estudar({ usarIA = false } = {}) {
  const materia = $("#est-materia").value;
  const assunto = $("#est-assunto").value.trim();
  const volume = $("#est-volume").value;
  const detalhes = $("#est-detalhes").value.trim();
  if (!assunto) { $("#est-assunto").focus(); return; }

  const offline = buscarOffline(assunto);
  const temImagens = estado.paginasEstudo.length > 0;
  const chave = !!localStorage.getItem("estuda.chave"); // sem importar a IA: o material pronto abre na hora

  if (offline && !usarIA && (!chave || (!temImagens && !detalhes))) {
    mostrarEstudo({ ...offline }, { materia, assunto, volume, origem: "pronto" });
    return;
  }
  if (!chave) {
    $("#resultado").innerHTML = `<div class="cartao aviso">
      <h3>🔑 Falta a chave da IA</h3>
      <p>Para gerar material de <b>qualquer assunto</b> (e usar o tutor), coloque a chave da API do Claude nas configurações.
      Sem a chave, funcionam os assuntos marcados com ✅ na tela inicial.</p>
      <button class="btn" data-ir="config">Abrir configurações</button></div>`;
    return;
  }

  const btn = $("#btn-gerar");
  btn.disabled = true;
  let i = 0;
  $("#resultado").innerHTML = `<div class="cartao carregando"><div class="spinner"></div><p id="msg-carregando">${MSGS_CARREGANDO[0]}</p><small>Isso leva uns 20 a 60 segundos.</small></div>`;
  const timer = setInterval(() => { const el = $("#msg-carregando"); if (el) el.textContent = MSGS_CARREGANDO[++i % MSGS_CARREGANDO.length]; }, 4000);
  $("#resultado").scrollIntoView({ behavior: "smooth" });

  try {
    const { gerarEstudo } = await ai();
    const dados = await gerarEstudo({
      ano: estado.ano, materia: nomeMateria(materia), volume, assunto, detalhes,
      imagens: estado.paginasEstudo
    });
    mostrarEstudo(dados, { materia, assunto, volume, origem: "ia", usouPaginas: temImagens });
    estado.paginasEstudo = [];
    renderMiniEstudo();
  } catch (e) {
    $("#resultado").innerHTML = `<div class="cartao aviso"><h3>😕 Não deu certo</h3><p>${escapar(e.message)}</p></div>`;
  } finally {
    clearInterval(timer);
    btn.disabled = false;
  }
}

function salvarNoHistorico(registro) {
  const h = LS.get("estuda.historico", []);
  const i = h.findIndex(x => x.id === registro.id);
  if (i >= 0) h[i] = registro; else h.unshift(registro);
  LS.set("estuda.historico", h.slice(0, 100));
}

function mostrarEstudo(dados, info, registroExistente) {
  const registro = registroExistente || {
    id: `e${Date.now()}`, data: new Date().toISOString(), ano: estado.ano,
    materia: info.materia, assunto: info.assunto, volume: info.volume, origem: info.origem, dados, tentativas: []
  };
  if (!registroExistente) salvarNoHistorico(registro);
  estado.estudoAtual = registro;
  const d = registro.dados;
  const m = materiaPorId(registro.materia) || { cor: "#3b4a6b", icone: "📘", nome: registro.materia };

  $("#resultado").innerHTML = `
    <article class="estudo" style="--cor:${m.cor}">
      <header class="cartao estudo-topo">
        <div class="selo">${m.icone} ${escapar(m.nome)} · ${registro.ano}º ano${registro.volume ? ` · Vol. ${registro.volume}` : ""}</div>
        <h2>${escapar(d.titulo)}</h2>
        <p>${inline(d.introducao)}</p>
        <div class="linha-botoes">
          <button class="btn secundario pequeno" data-acao="tutor">💬 Não entendi uma parte</button>
          ${registro.origem === "pronto" ? `<button class="btn secundario pequeno" data-acao="ia">✨ Gerar outra versão com IA</button>` : ""}
          <button class="btn secundario pequeno" data-acao="imprimir">🖨️ Imprimir</button>
        </div>
        ${registro.origem === "pronto" ? `<small class="sub">Material pronto do app (funciona sem internet).</small>` : ""}
      </header>

      <nav class="sumario">
        <a href="#s-resumo">📝 Resumo</a><a href="#s-simulado">✅ Simulado</a><a href="#s-dicas">🎯 Dicas</a><a href="#s-videos">🎬 Vídeos</a>
      </nav>

      <section class="cartao" id="s-resumo">
        <h3>📝 Resumo</h3>
        ${d.secoes.map((s, i) => `
          <div class="secao">
            <div class="secao-topo"><h4>${i + 1}. ${escapar(s.titulo)}</h4>
              <button class="link" data-explicar="${escapar(s.titulo)}">Explicar melhor</button></div>
            <ul>${s.pontos.map(p => `<li>${inline(p)}</li>`).join("")}</ul>
          </div>`).join("")}
        <h4>🔑 Palavras-chave</h4>
        <dl class="palavras">${d.palavras_chave.map(p => `<div><dt>${escapar(p.termo)}</dt><dd>${inline(p.significado)}</dd></div>`).join("")}</dl>
      </section>

      <section class="cartao" id="s-simulado">
        <h3>✅ Simulado — 5 questões</h3>
        <p class="sub">Marque uma alternativa em cada questão e depois clique em <b>Corrigir</b>.</p>
        <form id="form-simulado">
          ${d.questoes.map((q, i) => `
            <fieldset class="questao" data-q="${i}">
              <legend><span class="num">${i + 1}</span> ${inline(q.enunciado)}</legend>
              ${q.alternativas.map((a, j) => `
                <label class="alt"><input type="radio" name="q${i}" value="${j}">
                <span class="letra">${"ABCD"[j] || j + 1}</span><span>${inline(a)}</span></label>`).join("")}
              <div class="explicacao" hidden></div>
            </fieldset>`).join("")}
          <div class="linha-botoes">
            <button class="btn grande" id="btn-corrigir">Corrigir</button>
            <button type="button" class="btn secundario" id="btn-refazer" hidden>Refazer</button>
          </div>
          <div id="nota" class="nota" hidden></div>
        </form>
      </section>

      <section class="cartao" id="s-dicas">
        <h3>🎯 Dicas para a hora da prova</h3>
        <ul class="dicas">${d.dicas_prova.map(x => `<li>${inline(x)}</li>`).join("")}</ul>
        ${d.curiosidade ? `<div class="curiosidade">💡 <b>Curiosidade:</b> ${inline(d.curiosidade)}</div>` : ""}
      </section>

      <section class="cartao" id="s-videos">
        <h3>🎬 Videoaulas recomendadas</h3>
        <p class="sub">Os links abrem a busca no YouTube com o assunto certinho.</p>
        <div class="videos">
          ${d.videos.map(v => {
            const busca = v.canal ? `${v.busca} ${v.canal}` : v.busca;
            return `<a class="video" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${encodeURIComponent(busca)}">
              <span class="play">▶</span><span><b>${escapar(v.titulo)}</b>${v.canal ? `<small>Canal sugerido: ${escapar(v.canal)}</small>` : ""}<small>Buscar: “${escapar(v.busca)}”</small></span></a>`;
          }).join("")}
        </div>
      </section>
    </article>`;

  $("#form-simulado").onsubmit = (e) => { e.preventDefault(); corrigir(); };
  $("#btn-refazer").onclick = () => mostrarEstudo(null, null, registro);
  irPara("estudar");
  $("#est-assunto").value = registro.assunto;
  $("#est-materia").value = materiaPorId(registro.materia) ? registro.materia : "humanas";
  requestAnimationFrame(() => $("#resultado").scrollIntoView({ behavior: "smooth" }));
}

function corrigir() {
  const reg = estado.estudoAtual;
  const qs = reg.dados.questoes;
  const respostas = qs.map((_, i) => { const r = document.querySelector(`input[name="q${i}"]:checked`); return r ? +r.value : null; });
  if (respostas.some(r => r === null) && !confirm("Ainda tem questão sem resposta. Corrigir mesmo assim?")) return;
  let acertos = 0;
  qs.forEach((q, i) => {
    const fs = document.querySelector(`.questao[data-q="${i}"]`);
    const certa = respostas[i] === q.correta;
    if (certa) acertos++;
    fs.classList.add(certa ? "certa" : "errada");
    fs.querySelectorAll("input").forEach(inp => { inp.disabled = true; });
    fs.querySelectorAll(".alt").forEach((l, j) => { if (j === q.correta) l.classList.add("correta"); });
    const ex = fs.querySelector(".explicacao");
    ex.hidden = false;
    ex.innerHTML = `${certa ? "✅ Acertou!" : `❌ A resposta certa é <b>${"ABCD"[q.correta]}</b>.`} ${inline(q.explicacao)}
      ${certa ? "" : `<button type="button" class="link" data-duvida="${i}">Ainda não entendi</button>`}`;
  });
  const nota = $("#nota");
  const frase = acertos === 5 ? "Gabaritou! 🏆" : acertos >= 4 ? "Mandou muito bem! 🎉" : acertos >= 3 ? "Bom! Revise as que errou. 💪" : "Bora revisar o resumo e tentar de novo. 📚";
  nota.hidden = false;
  nota.innerHTML = `<strong>${acertos}/5</strong> <span>${frase}</span>`;
  $("#btn-corrigir").hidden = true;
  $("#btn-refazer").hidden = false;
  reg.tentativas = [...(reg.tentativas || []), { data: new Date().toISOString(), acertos }];
  salvarNoHistorico(reg);
  nota.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ================= Tutor =================
function contextoDoEstudo(reg) {
  return reg ? `${nomeMateria(reg.materia)}, ${reg.ano}º ano${reg.volume ? `, volume ${reg.volume}` : ""} — assunto: ${reg.assunto}` : "";
}

function abrirTutor(perguntaInicial, contexto) {
  if (contexto !== undefined && contexto !== estado.tutorContexto) {
    estado.tutorContexto = contexto;
    estado.tutorHistorico = [];
    renderChat();
  }
  $("#tutor-contexto").textContent = estado.tutorContexto ? `Estudando: ${estado.tutorContexto}` : "Pergunte qualquer coisa das suas matérias.";
  irPara("tutor");
  if (perguntaInicial) enviarTutor(perguntaInicial);
  else $("#tutor-pergunta").focus();
}

function renderChat(pensando = false) {
  const chat = $("#chat");
  if (!estado.tutorHistorico.length && !pensando) {
    chat.innerHTML = `<div class="vazio">👋 Oi! Eu sou seu tutor. Pode perguntar sem vergonha — não existe pergunta boba.<br>
      Você também pode mandar 📷 a foto de uma página ou de um exercício.</div>`;
    return;
  }
  chat.innerHTML = estado.tutorHistorico.map(msg => {
    if (msg.role === "user") {
      const imgs = msg._imagens || [];
      return `<div class="bolha eu">${imgs.map(u => `<img src="${u}" alt="">`).join("")}${escapar(msg._texto)}</div>`;
    }
    return `<div class="bolha tutor">${markdown(msg.content)}</div>`;
  }).join("") + (pensando ? `<div class="bolha tutor pensando"><span></span><span></span><span></span></div>` : "");
  chat.scrollTop = chat.scrollHeight;
}

async function enviarTutor(texto) {
  texto = (texto || "").trim();
  if (!texto && !estado.tutorImagens.length) return;
  if (!texto) texto = "Me explica o conteúdo desta imagem.";
  const mod = await ai().catch(() => null);
  if (!mod?.temChave()) {
    toast("Coloque a chave da API em ⚙️ Configurações para usar o tutor.");
    return;
  }
  const imagens = estado.tutorImagens.splice(0);
  renderMiniTutor();
  estado.tutorHistorico.push({
    role: "user",
    content: [...imagens.map(img => ({ type: "image", source: { type: "base64", media_type: img.tipo, data: img.base64 } })), { type: "text", text: texto }],
    _texto: texto, _imagens: imagens.map(i => i.url)
  });
  renderChat(true);
  $("#tutor-pergunta").value = "";
  try {
    const historico = estado.tutorHistorico.map(({ role, content }) => ({ role, content }));
    const resposta = await mod.perguntarTutor({ ano: estado.ano, contexto: estado.tutorContexto, historico });
    estado.tutorHistorico.push({ role: "assistant", content: resposta });
  } catch (e) {
    estado.tutorHistorico.pop();
    toast(e.message);
    $("#tutor-pergunta").value = texto;
  }
  renderChat();
}

// ================= Estante =================
async function renderEstante() {
  $("#estante-ano").textContent = `${estado.ano}º ano`;
  const comArquivo = new Set(await idsComArquivo().catch(() => []));
  const livros = livrosDoAno(estado.ano);
  const grupos = {};
  for (const l of livros) (grupos[l.nome] ??= []).push(l);
  $("#estante").innerHTML = Object.entries(grupos).map(([nome, lista]) => `
    <div class="prateleira">
      <h3>${lista[0].icone} ${escapar(nome)}${lista[0].sub ? ` <small>${lista[0].sub}</small>` : ""}</h3>
      <div class="livros">
        ${lista.map(l => capaHTML(l, comArquivo.has(l.id))).join("")}
      </div>
    </div>`).join("");
  $$("#estante .livro").forEach(el => el.onclick = () => abrirModalLivro(livros.find(l => l.id === el.dataset.id)));
}

function capaHTML(l, temArquivo) {
  const link = getMeta(l.id).link;
  return `<button class="livro" data-id="${l.id}" style="--cor:${l.cor}" title="${escapar(l.nome)} — Volume ${l.volume}">
    <span class="capa-topo">SFB</span>
    <span class="capa-materia">${escapar(l.nome)}</span>
    <span class="capa-icone">${l.icone}</span>
    <span class="capa-ano"><b>${l.ano}º</b> ano</span>
    <span class="capa-vol">VOLUME ${l.volume}</span>
    <span class="capa-editora">Santillana Educação</span>
    ${temArquivo ? `<span class="selo-arquivo">📄 Ler</span>` : link ? `<span class="selo-arquivo">🔗 Link</span>` : ""}
  </button>`;
}

async function abrirModalLivro(livro) {
  estado.livroAberto = livro;
  const modal = $("#modal-livro");
  const novo = !livro;
  $("#campo-novo-materia").hidden = !novo;
  $("#campo-novo-volume").hidden = !novo;
  $("#modal-livro-titulo").textContent = novo ? "Adicionar livro" : `${livro.nome} · Volume ${livro.volume}`;
  $("#modal-livro-capa").innerHTML = novo ? "" : capaHTML(livro, false);
  $("#livro-link").value = novo ? "" : (getMeta(livro.id).link || "");
  $("#livro-arquivo").value = "";
  await atualizarStatusModal();
  modal.showModal();
}

async function atualizarStatusModal() {
  const l = estado.livroAberto;
  const arq = l ? await lerArquivo(l.id).catch(() => null) : null;
  $("#modal-livro-status").innerHTML = arq
    ? `✅ Arquivo salvo neste aparelho: <b>${escapar(arq.nome)}</b> (${arq.tipo === "pdf" ? "PDF" : `${arq.blobs.length} foto(s)`}).`
    : "Nenhum arquivo ainda. Escolha o PDF do livro digital ou tire fotos das páginas — fica salvo só neste aparelho.";
  $("#modal-ler").disabled = !arq && !getMeta(l?.id || "").link;
  $("#modal-remover").hidden = !arq;
  $("#modal-estudar").hidden = !l;
}

async function lidarArquivosLivro(arquivos) {
  if (!arquivos.length) return;
  let l = estado.livroAberto;
  if (!l) {
    const nome = $("#novo-materia").value.trim() || "Meu livro";
    l = estado.livroAberto = adicionarLivroExtra(estado.ano, nome, +$("#novo-volume").value || 1);
    $("#campo-novo-materia").hidden = $("#campo-novo-volume").hidden = true;
    $("#modal-livro-titulo").textContent = `${l.nome} · Volume ${l.volume}`;
  }
  const pdf = arquivos.find(f => f.type === "application/pdf");
  const arquivo = pdf
    ? { tipo: "pdf", blobs: [pdf], nome: pdf.name }
    : { tipo: "imagens", blobs: arquivos.filter(f => f.type.startsWith("image/")).sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })), nome: `${arquivos.length} foto(s)` };
  if (!arquivo.blobs.length) { toast("Escolha um PDF ou imagens."); return; }
  try {
    await salvarArquivo(l.id, arquivo);
    toast("Livro salvo na estante! 📚");
  } catch {
    toast("Não consegui salvar (o arquivo pode ser grande demais para este navegador).");
  }
  await atualizarStatusModal();
  renderEstante();
}

// ================= Leitor =================
const leitor = new Leitor($("#leitor-canvas"));

async function abrirLeitor(livro) {
  const arq = await lerArquivo(livro.id);
  if (!arq) {
    const link = getMeta(livro.id).link;
    if (link) window.open(link, "_blank", "noopener");
    return;
  }
  $("#leitor").hidden = false;
  document.body.classList.add("lendo");
  $("#leitor-titulo").textContent = `${livro.nome} · Vol. ${livro.volume}`;
  try {
    await leitor.abrir({ ...arq, ultimaPagina: getMeta(livro.id).pagina });
  } catch (e) {
    toast("Não consegui abrir o arquivo. Verifique a internet (o leitor de PDF é carregado online).");
    fecharLeitor();
    return;
  }
  atualizarNavLeitor();
}

function atualizarNavLeitor() {
  $("#leitor-pag").value = leitor.pagina;
  $("#leitor-total").textContent = leitor.total;
  $("#leitor-ant").disabled = leitor.pagina <= 1;
  $("#leitor-prox").disabled = leitor.pagina >= leitor.total;
  if (estado.livroAberto) setMeta(estado.livroAberto.id, { pagina: leitor.pagina });
}

function fecharLeitor() {
  leitor.fechar();
  $("#leitor").hidden = true;
  document.body.classList.remove("lendo");
}

async function paginaVirar(delta) {
  await leitor.irPara(leitor.pagina + delta);
  atualizarNavLeitor();
  $("#leitor-pagina").scrollTop = 0;
}

// ================= Histórico =================
function renderHistorico() {
  const h = LS.get("estuda.historico", []);
  const tentativas = h.flatMap(r => r.tentativas || []);
  const media = tentativas.length ? (tentativas.reduce((s, t) => s + t.acertos, 0) / tentativas.length) : 0;
  $("#stats").innerHTML = `
    <div class="stat"><b>${h.length}</b><span>assuntos estudados</span></div>
    <div class="stat"><b>${tentativas.length}</b><span>simulados feitos</span></div>
    <div class="stat"><b>${tentativas.length ? media.toFixed(1) : "–"}</b><span>média de acertos (de 5)</span></div>`;
  $("#lista-historico").innerHTML = h.length ? h.map(r => {
    const m = materiaPorId(r.materia) || { cor: "#3b4a6b", icone: "📘", nome: r.materia };
    const ult = (r.tentativas || []).at(-1);
    return `<div class="cartao item-hist" style="--cor:${m.cor}">
      <div><span class="selo">${m.icone} ${escapar(m.nome)} · ${r.ano}º ano</span>
        <h4>${escapar(r.dados.titulo)}</h4>
        <small>${new Date(r.data).toLocaleDateString("pt-BR")} · ${ult ? `última nota: <b>${ult.acertos}/5</b>` : "simulado ainda não feito"}</small></div>
      <div class="linha-botoes"><button class="btn pequeno" data-abrir="${r.id}">Abrir</button>
      <button class="btn secundario pequeno" data-apagar="${r.id}" title="Apagar">🗑️</button></div>
    </div>`;
  }).join("") : `<div class="cartao vazio">Nada por aqui ainda. Vá em 🧠 Estudar e escolha um assunto!</div>`;
}

// ================= Configurações =================
async function carregarConfig() {
  $("#cfg-nome").value = estado.nome;
  const mod = await ai().catch(() => null);
  if (mod) {
    $("#cfg-chave").value = mod.getChave();
    $("#cfg-modelo").value = mod.getModelo();
    $("#cfg-status").textContent = mod.temChave() ? "🔑 Chave salva neste navegador." : "Sem chave: só os assuntos com ✅ funcionam.";
  } else {
    $("#cfg-status").textContent = "Sem internet agora: a IA não carregou. O material pronto continua funcionando.";
  }
}

async function salvarConfig() {
  estado.nome = $("#cfg-nome").value.trim() || "Enzo";
  LS.set("estuda.nome", estado.nome);
  const mod = await ai().catch(() => null);
  if (mod) {
    mod.setChave($("#cfg-chave").value);
    mod.setModelo($("#cfg-modelo").value);
  }
  renderInicio();
  toast("Configurações salvas!");
  carregarConfig();
}

// ================= Eventos =================
function ligarEventos() {
  $("#abas").onclick = (e) => { const b = e.target.closest("button"); if (b) irPara(b.dataset.tela); };

  $("#sel-ano").onchange = (e) => { estado.ano = +e.target.value; LS.set("estuda.ano", estado.ano); renderInicio(); };

  $("#form-rapido").onsubmit = (e) => {
    e.preventDefault();
    const assunto = $("#rapido-assunto").value.trim();
    if (!assunto) return;
    $("#est-assunto").value = assunto;
    const mat = adivinharMateria(assunto);
    if (mat) $("#est-materia").value = mat;
    irPara("estudar");
    estudar();
  };

  $("#lista-curriculo").onclick = (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $("#est-materia").value = chip.dataset.materia;
    $("#est-assunto").value = chip.dataset.assunto;
    $("#est-detalhes").value = "";
    irPara("estudar");
    estudar();
  };

  $("#form-estudar").onsubmit = (e) => { e.preventDefault(); estudar(); };
  $("#est-fotos").onchange = (e) => { adicionarFotos([...e.target.files], estado.paginasEstudo, renderMiniEstudo); e.target.value = ""; };

  // Ações dentro do material gerado (delegação)
  $("#resultado").onclick = (e) => {
    const alvo = e.target.closest("[data-acao],[data-explicar],[data-duvida],[data-ir]");
    if (!alvo) return;
    const reg = estado.estudoAtual;
    if (alvo.dataset.ir) return irPara(alvo.dataset.ir);
    if (alvo.dataset.acao === "tutor") return abrirTutor("", contextoDoEstudo(reg));
    if (alvo.dataset.acao === "ia") return estudar({ usarIA: true });
    if (alvo.dataset.acao === "imprimir") return window.print();
    if (alvo.dataset.explicar) return abrirTutor(`Me explica melhor esta parte: "${alvo.dataset.explicar}". Usa um exemplo fácil.`, contextoDoEstudo(reg));
    if (alvo.dataset.duvida) {
      const q = reg.dados.questoes[+alvo.dataset.duvida];
      return abrirTutor(`Errei esta questão e não entendi por quê:\n"${q.enunciado}"\nA resposta certa é: "${q.alternativas[q.correta]}". Me explica?`, contextoDoEstudo(reg));
    }
  };

  // Tutor
  $("#form-tutor").onsubmit = (e) => { e.preventDefault(); enviarTutor($("#tutor-pergunta").value); };
  $("#tutor-foto").onchange = (e) => { adicionarFotos([...e.target.files], estado.tutorImagens, renderMiniTutor); e.target.value = ""; };
  $("#tutor-limpar").onclick = () => { estado.tutorHistorico = []; estado.tutorContexto = ""; $("#tutor-contexto").textContent = "Pergunte qualquer coisa das suas matérias."; renderChat(); };

  // Estante
  $("#btn-novo-livro").onclick = () => abrirModalLivro(null);
  $("#livro-arquivo").onchange = (e) => lidarArquivosLivro([...e.target.files]);
  $("#livro-link").oninput = (e) => { if (e.target.value.trim()) $("#modal-ler").disabled = false; };
  $("#modal-livro").addEventListener("close", async () => {
    const acao = $("#modal-livro").returnValue;
    const l = estado.livroAberto;
    if (l && acao !== "cancelar") setMeta(l.id, { link: $("#livro-link").value.trim() });
    if (!l && acao === "salvar" && $("#novo-materia").value.trim()) {
      adicionarLivroExtra(estado.ano, $("#novo-materia").value.trim(), +$("#novo-volume").value || 1);
    }
    if (acao === "ler" && l) abrirLeitor(l);
    if (acao === "estudar" && l) {
      if (materiaPorId(l.materia)) $("#est-materia").value = l.materia;
      $("#est-volume").value = String(l.volume);
      irPara("estudar");
      $("#est-assunto").focus();
    }
    if (acao === "remover" && l) { await removerArquivo(l.id); toast("Arquivo removido."); }
    $("#modal-livro").returnValue = "";
    $("#novo-materia").value = "";
    renderEstante();
  });

  // Leitor
  $("#leitor-fechar").onclick = fecharLeitor;
  $("#leitor-ant").onclick = () => paginaVirar(-1);
  $("#leitor-prox").onclick = () => paginaVirar(1);
  $("#leitor-pag").onchange = async (e) => { await leitor.irPara(+e.target.value); atualizarNavLeitor(); };
  $("#leitor-mais").onclick = () => leitor.mudarZoom(0.25);
  $("#leitor-menos").onclick = () => leitor.mudarZoom(-0.25);
  document.addEventListener("keydown", (e) => {
    if ($("#leitor").hidden || e.target.tagName === "INPUT") return;
    if (e.key === "ArrowRight") paginaVirar(1);
    if (e.key === "ArrowLeft") paginaVirar(-1);
    if (e.key === "Escape") fecharLeitor();
  });
  $("#leitor-usar").onclick = async () => {
    if (estado.paginasEstudo.length >= 6) return toast("Já tem 6 páginas separadas. Vá em 🧠 Estudar.");
    const img = await leitor.paginaComoImagem();
    img.rotulo = `Vol.${estado.livroAberto.volume} p.${leitor.pagina}`;
    estado.paginasEstudo.push(img);
    renderMiniEstudo();
    const l = estado.livroAberto;
    if (materiaPorId(l.materia)) $("#est-materia").value = l.materia;
    $("#est-volume").value = String(l.volume);
    toast(`Página ${leitor.pagina} separada para o estudo (${estado.paginasEstudo.length}/6).`);
  };
  $("#leitor-explicar").onclick = async () => {
    const l = estado.livroAberto;
    const img = await leitor.paginaComoImagem();
    estado.tutorImagens = [img];
    renderMiniTutor();
    fecharLeitor();
    abrirTutor(`Me explica esta página (p. ${leitor.pagina}) do meu livro de ${l.nome}, volume ${l.volume}, de um jeito fácil.`,
      `${l.nome}, ${l.ano}º ano, volume ${l.volume} (lendo o livro)`);
  };
  window.addEventListener("resize", () => { if (!$("#leitor").hidden) leitor.desenhar(); });

  // Histórico
  $("#lista-historico").onclick = (e) => {
    const abrir = e.target.closest("[data-abrir]");
    const apagar = e.target.closest("[data-apagar]");
    const h = LS.get("estuda.historico", []);
    if (abrir) { const r = h.find(x => x.id === abrir.dataset.abrir); if (r) mostrarEstudo(null, null, r); }
    if (apagar && confirm("Apagar este estudo do histórico?")) {
      LS.set("estuda.historico", h.filter(x => x.id !== apagar.dataset.apagar));
      renderHistorico();
    }
  };

  // Configurações
  $("#cfg-salvar").onclick = salvarConfig;
  $("#cfg-testar").onclick = async () => {
    await salvarConfig();
    $("#cfg-status").textContent = "Testando…";
    try { $("#cfg-status").textContent = "✅ " + await (await ai()).testarChave(); }
    catch (e) { $("#cfg-status").textContent = "❌ " + e.message; }
  };
  $("#cfg-apagar").onclick = async () => {
    if (!confirm("Apagar histórico, chave e livros salvos neste aparelho? Não dá para desfazer.")) return;
    Object.keys(localStorage).filter(k => k.startsWith("estuda.")).forEach(k => localStorage.removeItem(k));
    await apagarTudo().catch(() => {});
    location.reload();
  };
}

// ================= Início do app =================
preencherMaterias();
renderInicio();
renderChat();
ligarEventos();
