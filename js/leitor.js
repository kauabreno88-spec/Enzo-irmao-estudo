// Leitor de livros: PDF (via PDF.js) ou fotos das páginas.
const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs";
const PDFJS_WORKER = "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs";

let pdfjs;
async function carregarPdfjs() {
  if (!pdfjs) {
    pdfjs = await import(PDFJS);
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
  }
  return pdfjs;
}

export class Leitor {
  constructor(canvas) {
    this.canvas = canvas;
    this.zoom = 1;
    this.pagina = 1;
    this.total = 0;
    this.doc = null;     // documento PDF
    this.imagens = null; // lista de Blobs de imagem
  }

  async abrir(arquivo) {
    this.fechar();
    if (arquivo.tipo === "pdf") {
      const lib = await carregarPdfjs();
      const dados = await arquivo.blobs[0].arrayBuffer();
      this.doc = await lib.getDocument({ data: dados }).promise;
      this.total = this.doc.numPages;
    } else {
      this.imagens = arquivo.blobs;
      this.total = this.imagens.length;
    }
    this.pagina = Math.min(arquivo.ultimaPagina || 1, this.total);
    await this.desenhar();
  }

  fechar() {
    this.doc?.destroy?.();
    this.doc = null;
    this.imagens = null;
  }

  async irPara(n) {
    n = Math.max(1, Math.min(this.total, n | 0));
    if (n === this.pagina) return;
    this.pagina = n;
    await this.desenhar();
  }

  async mudarZoom(delta) {
    this.zoom = Math.max(0.5, Math.min(3, this.zoom + delta));
    await this.desenhar();
  }

  larguraAlvo() {
    const disponivel = Math.min(this.canvas.parentElement.clientWidth - 40, 1000);
    return Math.max(280, disponivel) * this.zoom;
  }

  async desenhar() {
    const ctx = this.canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const largura = this.larguraAlvo();

    if (this.doc) {
      this._render?.cancel();
      const pag = await this.doc.getPage(this.pagina);
      const base = pag.getViewport({ scale: 1 });
      const vp = pag.getViewport({ scale: (largura / base.width) * dpr });
      this.canvas.width = vp.width;
      this.canvas.height = vp.height;
      this.canvas.style.width = `${vp.width / dpr}px`;
      this.canvas.style.height = `${vp.height / dpr}px`;
      this._render = pag.render({ canvasContext: ctx, viewport: vp });
      try { await this._render.promise; } catch { /* renderização cancelada ao trocar de página */ }
    } else if (this.imagens) {
      const bmp = await createImageBitmap(this.imagens[this.pagina - 1]);
      const escala = (largura / bmp.width) * dpr;
      this.canvas.width = bmp.width * escala;
      this.canvas.height = bmp.height * escala;
      this.canvas.style.width = `${this.canvas.width / dpr}px`;
      this.canvas.style.height = `${this.canvas.height / dpr}px`;
      ctx.drawImage(bmp, 0, 0, this.canvas.width, this.canvas.height);
      bmp.close();
    }
  }

  // Foto da página atual, para mandar ao Claude (lado maior com até 1568 px).
  async paginaComoImagem() {
    let fonte;
    if (this.doc) {
      const pag = await this.doc.getPage(this.pagina);
      const base = pag.getViewport({ scale: 1 });
      const vp = pag.getViewport({ scale: 1568 / Math.max(base.width, base.height) });
      fonte = document.createElement("canvas");
      fonte.width = vp.width;
      fonte.height = vp.height;
      await pag.render({ canvasContext: fonte.getContext("2d"), viewport: vp }).promise;
      return canvasParaImagem(fonte, `Página ${this.pagina}`);
    }
    return blobParaImagem(this.imagens[this.pagina - 1], `Página ${this.pagina}`);
  }
}

// ---------- Utilidades de imagem ----------
function canvasParaImagem(canvas, rotulo) {
  const url = canvas.toDataURL("image/jpeg", 0.85);
  return { tipo: "image/jpeg", base64: url.split(",")[1], url, rotulo };
}

// Reduz fotos grandes antes de enviar (economiza e deixa mais rápido).
export async function blobParaImagem(blob, rotulo = "Foto") {
  const bmp = await createImageBitmap(blob);
  const escala = Math.min(1, 1568 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * escala);
  c.height = Math.round(bmp.height * escala);
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  bmp.close();
  return canvasParaImagem(c, rotulo);
}
