// Matérias da coleção SFB (Sistema Farias Brito · Santillana Educação) — Anos Finais.
// Cada matéria tem 4 volumes por ano (um por bimestre).
export const MATERIAS = [
  { id: "portugues", nome: "Língua Portuguesa", cor: "#e8552b", icone: "✍️" },
  { id: "matematica", nome: "Matemática", cor: "#1f4fbf", icone: "📐" },
  { id: "ciencias", nome: "Ciências da Natureza", cor: "#2e9e3e", icone: "🔬" },
  { id: "humanas", nome: "Ciências Humanas", sub: "História e Geografia", cor: "#f0a020", icone: "🌎" },
  { id: "ingles", nome: "Língua Inglesa", cor: "#7a3fbf", icone: "🇬🇧" }
];

export const materiaPorId = (id) => MATERIAS.find(m => m.id === id);

// Assuntos de referência por ano, seguindo a BNCC (que a coleção SFB acompanha).
// A ordem exata e a divisão por volume variam; aqui é um guia para o aluno escolher.
export const CURRICULO = {
  6: {
    humanas: ["O que é História e fontes históricas", "Origem da humanidade e Pré-História", "Mesopotâmia e Egito Antigo", "Grécia Antiga", "Roma Antiga", "Orientação e coordenadas geográficas", "Paisagem, lugar e espaço geográfico", "Estrutura da Terra e relevo", "Hidrografia", "Clima e vegetação"],
    matematica: ["Sistemas de numeração", "Operações com números naturais", "Múltiplos e divisores", "Frações", "Números decimais", "Porcentagem", "Ângulos", "Polígonos", "Perímetro e área"],
    ciencias: ["Célula", "Níveis de organização dos seres vivos", "Sistema nervoso e sentidos", "Misturas e separação de misturas", "Transformações químicas", "Planeta Terra: camadas e forma"],
    portugues: ["Substantivo e adjetivo", "Verbos: tempos e modos", "Pontuação", "Gêneros: conto e fábula", "Notícia", "Acentuação"],
    ingles: ["Verb to be", "Simple present", "Possessive adjectives", "There is / There are"]
  },
  7: {
    humanas: ["Mundo moderno e Renascimento", "Reformas religiosas", "Grandes navegações", "Povos indígenas e a conquista da América", "Colonização portuguesa e açúcar", "Escravidão e resistência africana", "Mineração no Brasil Colônia", "Território brasileiro e regionalização", "População brasileira", "Domínios morfoclimáticos do Brasil"],
    matematica: ["Números inteiros", "Números racionais", "Equações do 1º grau", "Razão e proporção", "Grandezas proporcionais e regra de três", "Ângulos e triângulos", "Circunferência", "Estatística e gráficos"],
    ciencias: ["Máquinas simples", "Calor e temperatura", "Ecossistemas brasileiros", "Atmosfera e efeito estufa", "Vacinas e saúde", "Placas tectônicas"],
    portugues: ["Sujeito e predicado", "Advérbio", "Gêneros: crônica e reportagem", "Pronomes", "Concordância nominal"],
    ingles: ["Simple past", "Can / Could", "Comparatives", "Prepositions of place"]
  },
  8: {
    humanas: ["Iluminismo", "Revolução Inglesa", "Revolução Industrial", "Independência dos Estados Unidos", "Revolução Francesa", "Era Napoleônica", "Independências na América Espanhola e no Haiti", "Período Joanino (família real no Brasil)", "Independência do Brasil", "Primeiro Reinado", "Período Regencial e revoltas", "Segundo Reinado", "Abolição da escravidão no Brasil", "Guerra do Paraguai", "Imperialismo e neocolonialismo no século XIX", "Estados Unidos no século XIX", "Regionalização do mundo", "América: aspectos naturais", "América Latina: população e urbanização", "Estados Unidos e Canadá", "África: aspectos naturais", "África: população, economia e conflitos", "Globalização e blocos econômicos", "Fluxos migratórios"],
    matematica: ["Potências e raízes", "Notação científica", "Dízimas periódicas", "Expressões algébricas", "Produtos notáveis", "Fatoração", "Sistemas de equações do 1º grau", "Ângulos e retas paralelas", "Congruência de triângulos", "Área do círculo", "Volume", "Probabilidade", "Média, moda e mediana"],
    ciencias: ["Sistema reprodutor e puberdade", "Métodos contraceptivos e ISTs", "Energia e suas transformações", "Circuitos elétricos", "Consumo de energia elétrica", "Sistema Sol, Terra e Lua", "Estações do ano", "Clima e tempo"],
    portugues: ["Termos essenciais da oração", "Termos integrantes: objeto direto e indireto", "Vozes verbais", "Período composto por coordenação", "Artigo de opinião", "Crônica", "Concordância verbal"],
    ingles: ["Past continuous", "Future: will e going to", "Comparatives e superlatives", "Present perfect (introdução)"]
  },
  9: {
    humanas: ["Primeira República no Brasil", "Primeira Guerra Mundial", "Revolução Russa", "Crise de 1929", "Totalitarismos: nazismo e fascismo", "Era Vargas", "Segunda Guerra Mundial", "Guerra Fria", "Ditadura civil-militar no Brasil", "Redemocratização", "Globalização", "Europa", "Ásia", "Oceania"],
    matematica: ["Números reais", "Radicais", "Equações do 2º grau", "Funções", "Semelhança de triângulos", "Teorema de Pitágoras", "Relações métricas no triângulo retângulo", "Porcentagem e juros"],
    ciencias: ["Átomo e tabela periódica", "Ligações químicas", "Hereditariedade e genética", "Evolução", "Ondas: som e luz", "Universo e astronomia"],
    portugues: ["Período composto por subordinação", "Orações subordinadas", "Regência", "Crase", "Dissertação argumentativa"],
    ingles: ["Present perfect", "Modal verbs", "Passive voice", "Conditionals"]
  }
};
