// Estante: catálogo dos livros da coleção SFB por ano + arquivos guardados no IndexedDB deste aparelho.
import { MATERIAS } from "./curriculo.js";

const EXTRA = "estuda.livrosExtra";
const META = "estuda.livrosMeta";

export function livrosDoAno(ano) {
  const lista = [];
  for (const m of MATERIAS) {
    for (let v = 1; v <= 4; v++) {
      lista.push({ id: `${ano}-${m.id}-${v}`, ano, materia: m.id, nome: m.nome, sub: m.sub || "", volume: v, cor: m.cor, icone: m.icone });
    }
  }
  const extras = JSON.parse(localStorage.getItem(EXTRA) || "[]").filter(l => l.ano == ano);
  return lista.concat(extras);
}

export function adicionarLivroExtra(ano, nome, volume) {
  const extras = JSON.parse(localStorage.getItem(EXTRA) || "[]");
  const livro = { id: `${ano}-extra-${Date.now()}`, ano, materia: "outro", nome, sub: "", volume, cor: "#3b4a6b", icone: "📘", extra: true };
  extras.push(livro);
  localStorage.setItem(EXTRA, JSON.stringify(extras));
  return livro;
}

export function getMeta(id) { return JSON.parse(localStorage.getItem(META) || "{}")[id] || {}; }
export function setMeta(id, dados) {
  const todos = JSON.parse(localStorage.getItem(META) || "{}");
  todos[id] = { ...todos[id], ...dados };
  localStorage.setItem(META, JSON.stringify(todos));
}

// ---------- IndexedDB ----------
let dbPromessa;
function db() {
  dbPromessa ??= new Promise((ok, erro) => {
    const req = indexedDB.open("estuda-enzo", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("arquivos");
    req.onsuccess = () => ok(req.result);
    req.onerror = () => erro(req.error);
  });
  return dbPromessa;
}

async function tx(modo, fn) {
  const banco = await db();
  return new Promise((ok, erro) => {
    const t = banco.transaction("arquivos", modo);
    const req = fn(t.objectStore("arquivos"));
    t.oncomplete = () => ok(req?.result);
    t.onerror = () => erro(t.error);
  });
}

// arquivo = { tipo: "pdf" | "imagens", blobs: Blob[], nome }
export const salvarArquivo = (id, arquivo) => tx("readwrite", s => s.put(arquivo, id));
export const lerArquivo = (id) => tx("readonly", s => s.get(id));
export const removerArquivo = (id) => tx("readwrite", s => s.delete(id));
export const idsComArquivo = () => tx("readonly", s => s.getAllKeys());
export const apagarTudo = () => tx("readwrite", s => s.clear());
