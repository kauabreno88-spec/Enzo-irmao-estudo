// Conversa com o Claude direto do navegador, usando o SDK oficial da Anthropic.
// A chave da API fica salva só no localStorage deste aparelho (nunca vai para o GitHub).
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0";

const CHAVE = "estuda.chave";
const MODELO = "estuda.modelo";
export const MODELO_PADRAO = "claude-opus-5-5";

export function getChave() { return localStorage.getItem(CHAVE) || ""; }
export function setChave(v) { v ? localStorage.setItem(CHAVE, v.trim()) : localStorage.removeItem(CHAVE); }
export function getModelo() { return localStorage.getItem(MODELO) || MODELO_PADRAO; }
export function setModelo(v) { localStorage.setItem(MODELO, v); }
export function temChave() { return !!getChave(); }

function cliente() {
  const apiKey = getChave();
  if (!apiKey) throw new ErroEstudo("Coloque a chave da API do Claude em ⚙️ Configurações para usar esta função.");
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

export class ErroEstudo extends Error {}

// Fallback do lado do servidor: se um modelo recusar por engano, a API tenta outro modelo.
// O Haiku 5.5 não tem fallback do lado do servidor.
function extrasDoModelo(modelo) {
  if (modelo.startsWith("claude-haiku")) return {};
  return { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" };
}

function traduzErro(e) {
  if (e instanceof ErroEstudo) return e;
  if (e instanceof Anthropic.AuthenticationError) return new ErroEstudo("A chave da API está errada ou foi desativada. Confira em ⚙️ Configurações.");
  if (e instanceof Anthropic.PermissionDeniedError) return new ErroEstudo("Essa chave não tem permissão para usar este modelo. Tente outro modelo em ⚙️ Configurações.");
  if (e instanceof Anthropic.RateLimitError) return new ErroEstudo("Muitos pedidos seguidos. Espere um minutinho e tente de novo.");
  if (e instanceof Anthropic.BadRequestError) return new ErroEstudo("O pedido não foi aceito: " + e.message);
  if (e instanceof Anthropic.APIConnectionError) return new ErroEstudo("Sem conexão com a internet (ou o servidor não respondeu). Tente de novo.");
  if (e instanceof Anthropic.APIError) return new ErroEstudo(`Erro do servidor (${e.status}). Tente de novo daqui a pouco.`);
  return new ErroEstudo("Algo deu errado: " + (e?.message || e));
}

function textoDe(resp) {
  if (resp.stop_reason === "refusal") {
    throw new ErroEstudo("O modelo não quis responder esse pedido. Tente escrever o assunto de outro jeito.");
  }
  return resp.content.filter(b => b.type === "text").map(b => b.text).join("\n").trim();
}

const PERSONA = (ano) => `Você é um professor particular paciente e animado de um aluno do ${ano}º ano do Ensino Fundamental (Anos Finais), no Brasil.
O aluno estuda pela coleção SFB — Sistema Farias Brito, publicada pela Santillana Educação, que segue a BNCC. Os livros são divididos em 4 volumes por ano (um por bimestre), e o livro de "Ciências Humanas" reúne História e Geografia.
Siga o recorte, a ordem e o vocabulário que uma coleção didática brasileira alinhada à BNCC usa para esse ano. Quando o aluno enviar fotos de páginas do livro, baseie-se primeiro no que está nelas e use os mesmos termos, datas e exemplos do livro.
Escreva em português do Brasil, com frases curtas e claras, adequadas para um aluno de 13 a 14 anos. Seja preciso: não invente datas, nomes ou números; se não tiver certeza, diga isso.`;

// ---------- Material de estudo (resumo + simulado + dicas + vídeos) ----------
const ESQUEMA_ESTUDO = {
  type: "object",
  additionalProperties: false,
  required: ["titulo", "materia", "introducao", "secoes", "palavras_chave", "questoes", "dicas_prova", "videos", "curiosidade"],
  properties: {
    titulo: { type: "string" },
    materia: { type: "string" },
    introducao: { type: "string", description: "2 a 3 frases dizendo do que trata o assunto e por que importa." },
    secoes: {
      type: "array",
      description: "Resumo em 3 a 6 seções, na ordem em que o livro costuma apresentar.",
      items: {
        type: "object", additionalProperties: false, required: ["titulo", "pontos"],
        properties: {
          titulo: { type: "string" },
          pontos: { type: "array", items: { type: "string" }, description: "3 a 6 tópicos curtos. Use **negrito** nos termos importantes." }
        }
      }
    },
    palavras_chave: {
      type: "array", description: "5 a 8 termos que caem na prova.",
      items: { type: "object", additionalProperties: false, required: ["termo", "significado"],
        properties: { termo: { type: "string" }, significado: { type: "string" } } }
    },
    questoes: {
      type: "array", description: "Exatamente 5 questões de múltipla escolha no estilo de prova escolar, da mais fácil para a mais difícil.",
      items: {
        type: "object", additionalProperties: false, required: ["enunciado", "alternativas", "correta", "explicacao"],
        properties: {
          enunciado: { type: "string" },
          alternativas: { type: "array", items: { type: "string" }, description: "Exatamente 4 alternativas, sem letra na frente." },
          correta: { type: "integer", description: "Índice (0 a 3) da alternativa correta." },
          explicacao: { type: "string", description: "Por que a correta está certa e o erro das outras, em 2 a 3 frases." }
        }
      }
    },
    dicas_prova: { type: "array", items: { type: "string" }, description: "4 a 6 dicas práticas para a hora da prova sobre ESTE assunto (o que costuma cair, pegadinhas, como lembrar)." },
    videos: {
      type: "array", description: "3 a 4 sugestões de videoaula no YouTube.",
      items: {
        type: "object", additionalProperties: false, required: ["titulo", "busca", "canal"],
        properties: {
          titulo: { type: "string", description: "O que o vídeo deve explicar." },
          busca: { type: "string", description: "Termo de busca para o YouTube, curto e específico." },
          canal: { type: "string", description: "Canal educativo brasileiro conhecido que trata do tema, ou string vazia se não tiver certeza." }
        }
      }
    },
    curiosidade: { type: "string", description: "Uma curiosidade ou macete de memória divertido sobre o assunto." }
  }
};

export async function gerarEstudo({ ano, materia, volume, assunto, detalhes, imagens = [] }) {
  const modelo = getModelo();
  const pedido = [
    `Monte um material de estudo sobre: **${assunto}**.`,
    `Matéria: ${materia}. Ano: ${ano}º ano.${volume ? ` Livro: volume ${volume} da coleção SFB.` : ""}`,
    detalhes ? `Detalhes do aluno: ${detalhes}` : "",
    imagens.length ? `Seguem ${imagens.length} foto(s) de páginas do livro do aluno. Baseie o resumo e as questões nelas.` : "",
    "Inclua: resumo em seções, palavras-chave, 5 questões de simulado (4 alternativas cada), dicas para a prova, sugestões de videoaula e uma curiosidade."
  ].filter(Boolean).join("\n");

  const content = [
    ...imagens.map(img => ({ type: "image", source: { type: "base64", media_type: img.tipo, data: img.base64 } })),
    { type: "text", text: pedido }
  ];

  try {
    const resp = await cliente().beta.messages.create({
      model: modelo,
      max_tokens: 16000,
      ...extrasDoModelo(modelo),
      output_config: { effort: "medium", format: { type: "json_schema", schema: ESQUEMA_ESTUDO } },
      system: PERSONA(ano),
      messages: [{ role: "user", content }]
    });
    if (resp.stop_reason === "max_tokens") throw new ErroEstudo("A resposta ficou grande demais. Tente um assunto mais específico.");
    const dados = JSON.parse(textoDe(resp));
    dados.questoes = (dados.questoes || []).slice(0, 5);
    return dados;
  } catch (e) {
    throw traduzErro(e);
  }
}

// ---------- Tutor (conversa) ----------
export async function perguntarTutor({ ano, contexto, historico }) {
  const modelo = getModelo();
  const system = PERSONA(ano) + `

Agora você está no modo TUTOR: o aluno vai tirar dúvidas.
- Explique como se estivesse conversando: comece pela ideia principal em 1 ou 2 frases, depois dê um exemplo do dia a dia ou uma comparação.
- Use listas curtas e **negrito** só quando ajudar. Respostas de no máximo uns 3 parágrafos, a não ser que o aluno peça mais.
- Se for exercício, não entregue só a resposta: mostre o raciocínio passo a passo e, no fim, faça uma pergunta rápida para ver se ele entendeu.
- Se a foto de uma página for enviada, explique o conteúdo daquela página.${contexto ? `\n\nContexto do que o aluno está estudando agora: ${contexto}` : ""}`;

  try {
    const resp = await cliente().beta.messages.create({
      model: modelo,
      max_tokens: 8000,
      ...extrasDoModelo(modelo),
      output_config: { effort: "low" },
      system,
      messages: historico
    });
    return textoDe(resp);
  } catch (e) {
    throw traduzErro(e);
  }
}

export async function testarChave() {
  const modelo = getModelo();
  try {
    const resp = await cliente().messages.create({
      model: modelo, max_tokens: 200, output_config: { effort: "low" },
      messages: [{ role: "user", content: "Responda só: ok" }]
    });
    return `Funcionando! Modelo: ${resp.model}`;
  } catch (e) {
    throw traduzErro(e);
  }
}
