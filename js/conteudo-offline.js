// Material pronto (funciona sem chave da API e sem internet), no mesmo formato que a IA gera.
// Assuntos de Ciências Humanas do 8º ano.

const yt = (titulo, busca, canal = "") => ({ titulo, busca, canal });

export const OFFLINE = {
  "revolucao industrial": {
    titulo: "Revolução Industrial",
    materia: "Ciências Humanas (História)",
    introducao: "A Revolução Industrial começou na Inglaterra, por volta de 1760, e trocou o trabalho feito à mão pelo trabalho com máquinas nas fábricas. Ela mudou o jeito de produzir, de trabalhar e de viver nas cidades — e é a base do mundo em que vivemos hoje.",
    secoes: [
      { titulo: "Antes das fábricas", pontos: [
        "No **artesanato**, o artesão fazia o produto inteiro e era dono das ferramentas.",
        "Na **manufatura**, vários trabalhadores reunidos dividiam as tarefas, mas ainda usando as mãos.",
        "Na **maquinofatura** (Revolução Industrial), as **máquinas** passam a fazer a maior parte do trabalho."
      ]},
      { titulo: "Por que começou na Inglaterra?", pontos: [
        "Tinha muito **carvão mineral** e **ferro**, matérias-primas da indústria.",
        "A burguesia inglesa acumulou **capital** com o comércio e as colônias.",
        "Os **cercamentos** (enclosures) expulsaram camponeses do campo, que viraram **mão de obra** barata nas cidades.",
        "Depois da Revolução Gloriosa (1688), a burguesia tinha força política para apoiar a indústria."
      ]},
      { titulo: "Máquinas e energia", pontos: [
        "A **máquina a vapor**, aperfeiçoada por **James Watt**, movia fábricas, trens e navios.",
        "A indústria **têxtil** (tecidos de algodão) foi a primeira a se mecanizar.",
        "Surgem a **locomotiva** e o **barco a vapor**, que encurtam distâncias e baratearam o transporte."
      ]},
      { titulo: "A vida dos operários", pontos: [
        "Jornadas de **14 a 16 horas**, salários baixos e fábricas sujas e perigosas.",
        "**Mulheres e crianças** trabalhavam e recebiam ainda menos.",
        "As cidades cresceram rápido demais (**êxodo rural**), com cortiços, doenças e poluição."
      ]},
      { titulo: "A reação dos trabalhadores", pontos: [
        "**Ludismo**: operários quebravam máquinas, que culpavam pelo desemprego.",
        "**Cartismo**: pedia direitos políticos, como o voto para os trabalhadores (Carta do Povo).",
        "Surgem os **sindicatos** (trade unions), que lutavam por salários e jornadas melhores.",
        "Aparecem ideias críticas ao capitalismo, como o **socialismo**."
      ]},
      { titulo: "Segunda Revolução Industrial (a partir de 1850-1870)", pontos: [
        "Novas fontes de energia: **eletricidade** e **petróleo**.",
        "Novos produtos: **aço**, motor a combustão, telefone, lâmpada.",
        "A indústria se espalha para **Estados Unidos, Alemanha, França** e Japão."
      ]}
    ],
    palavras_chave: [
      { termo: "Maquinofatura", significado: "Produção feita principalmente por máquinas, nas fábricas." },
      { termo: "Cercamentos", significado: "Cercamento das terras comuns na Inglaterra, que expulsou camponeses para as cidades." },
      { termo: "Burguesia industrial", significado: "Donos das fábricas, das máquinas e do capital." },
      { termo: "Proletariado", significado: "Operários que só tinham a própria força de trabalho para vender." },
      { termo: "Ludismo", significado: "Movimento de operários que destruíam as máquinas." },
      { termo: "Cartismo", significado: "Movimento que reivindicava direitos políticos para os trabalhadores." },
      { termo: "Êxodo rural", significado: "Saída em massa de pessoas do campo para a cidade." }
    ],
    questoes: [
      { enunciado: "Em qual país a Revolução Industrial começou, no século XVIII?",
        alternativas: ["França", "Inglaterra", "Estados Unidos", "Alemanha"], correta: 1,
        explicacao: "Ela começou na Inglaterra, por volta de 1760. França, EUA e Alemanha se industrializaram depois, principalmente na Segunda Revolução Industrial." },
      { enunciado: "Qual destes fatores ajudou a Inglaterra a ser pioneira na industrialização?",
        alternativas: ["Falta de matérias-primas", "Proibição do comércio com outras regiões", "Grandes reservas de carvão e ferro", "Ausência de mão de obra nas cidades"], correta: 2,
        explicacao: "Carvão e ferro eram essenciais para as máquinas. As outras alternativas dizem o contrário do que aconteceu: havia comércio forte e muita mão de obra vinda do campo." },
      { enunciado: "Os cercamentos (enclosures) contribuíram para a Revolução Industrial porque:",
        alternativas: ["deram terras para os camponeses produzirem mais", "expulsaram camponeses, que viraram mão de obra nas cidades", "proibiram a criação de ovelhas", "acabaram com o trabalho assalariado"], correta: 1,
        explicacao: "Sem as terras comuns, muitos camponeses migraram para as cidades e foram trabalhar nas fábricas por salários baixos." },
      { enunciado: "O movimento em que operários destruíam máquinas, por acharem que elas causavam desemprego, ficou conhecido como:",
        alternativas: ["Cartismo", "Iluminismo", "Ludismo", "Mercantilismo"], correta: 2,
        explicacao: "Ludismo é a quebra de máquinas. O Cartismo pedia direitos políticos; Iluminismo e Mercantilismo são outros assuntos." },
      { enunciado: "Uma diferença entre a Primeira e a Segunda Revolução Industrial é que, na Segunda:",
        alternativas: ["o carvão e o vapor deixaram de existir", "a indústria ficou só na Inglaterra", "surgiram a eletricidade e o petróleo como novas fontes de energia", "o trabalho voltou a ser artesanal"], correta: 2,
        explicacao: "A Segunda Revolução trouxe eletricidade, petróleo e aço, e a indústria se espalhou por outros países. O vapor continuou sendo usado por muito tempo." }
    ],
    dicas_prova: [
      "Decore a sequência: **artesanato → manufatura → maquinofatura**.",
      "Pergunta de 'por que na Inglaterra?' quase sempre cai: lembre de **carvão/ferro, capital, mão de obra (cercamentos) e burguesia no poder**.",
      "Não confunda **Ludismo** (quebrar máquinas) com **Cartismo** (direitos políticos, Carta do Povo).",
      "Em questões sobre consequências, cite: crescimento das cidades, poluição, exploração dos operários e surgimento dos sindicatos.",
      "Se a questão falar de eletricidade, petróleo ou aço, é a **Segunda** Revolução Industrial."
    ],
    videos: [
      yt("Revolução Industrial resumida", "Revolução Industrial resumo 8º ano", "Se Liga Nessa História"),
      yt("Condições de trabalho dos operários", "Revolução Industrial operários ludismo cartismo"),
      yt("Primeira x Segunda Revolução Industrial", "Primeira e Segunda Revolução Industrial diferenças"),
      yt("Mapa mental para revisar", "Revolução Industrial mapa mental")
    ],
    curiosidade: "Macete: o nome “ludismo” vem de Ned Ludd, um personagem (talvez lendário) que teria quebrado teares. Pense: “Ludd quebrava” = ludismo quebra máquinas!"
  },

  "segundo reinado": {
    titulo: "Segundo Reinado (1840–1889)",
    materia: "Ciências Humanas (História)",
    introducao: "O Segundo Reinado foi o governo de Dom Pedro II, de 1840 até a Proclamação da República, em 1889. Foi um período de estabilidade política, de crescimento do café e de grandes debates sobre o fim da escravidão.",
    secoes: [
      { titulo: "Como começou: o Golpe da Maioridade", pontos: [
        "Em **1840**, os liberais anteciparam a maioridade de **Dom Pedro II**, que tinha só **14 anos**.",
        "A ideia era acabar com a instabilidade e as revoltas do **Período Regencial**."
      ]},
      { titulo: "A política do Império", pontos: [
        "Dois partidos se revezavam no poder: **Liberal** e **Conservador** — com ideias bem parecidas.",
        "Em **1847** foi criado o cargo de presidente do Conselho de Ministros: o **parlamentarismo às avessas**.",
        "É “às avessas” porque o **imperador**, com o **Poder Moderador**, escolhia o ministério e podia dissolver a Câmara."
      ]},
      { titulo: "A economia do café", pontos: [
        "O **café** virou o principal produto de exportação, primeiro no **Vale do Paraíba** e depois no **Oeste Paulista**.",
        "O dinheiro do café ajudou a construir **ferrovias** e a modernizar as cidades.",
        "Com a **Era Mauá**, o Barão de Mauá investiu em indústrias, bancos e ferrovias."
      ]},
      { titulo: "Imigração", pontos: [
        "Com o fim do tráfico de escravizados, os fazendeiros buscaram **imigrantes europeus**, principalmente **italianos**.",
        "No **sistema de parceria**, muitos imigrantes ficavam endividados; depois veio o **trabalho assalariado** (colonato)."
      ]},
      { titulo: "Guerra do Paraguai (1864–1870)", pontos: [
        "Maior conflito armado da América do Sul.",
        "**Tríplice Aliança** (Brasil, Argentina e Uruguai) contra o **Paraguai** de Solano López.",
        "O Brasil venceu, mas ficou endividado, e o **Exército** saiu fortalecido e passou a criticar o Império."
      ]},
      { titulo: "A crise e o fim do Império", pontos: [
        "**Questão abolicionista**: a Lei Áurea (1888) desagradou fazendeiros, que esperavam indenização.",
        "**Questão religiosa**: conflito entre o imperador e bispos da Igreja.",
        "**Questão militar**: o Exército se sentia desvalorizado.",
        "Em **15 de novembro de 1889**, o marechal **Deodoro da Fonseca** proclamou a **República**."
      ]}
    ],
    palavras_chave: [
      { termo: "Golpe da Maioridade", significado: "Antecipação da maioridade de D. Pedro II, em 1840." },
      { termo: "Poder Moderador", significado: "Poder exclusivo do imperador, acima dos outros três poderes." },
      { termo: "Parlamentarismo às avessas", significado: "Parlamentarismo em que o imperador, e não o Parlamento, controlava o ministério." },
      { termo: "Café", significado: "Principal produto de exportação do Brasil no Segundo Reinado." },
      { termo: "Tríplice Aliança", significado: "Aliança de Brasil, Argentina e Uruguai na Guerra do Paraguai." },
      { termo: "Lei Áurea", significado: "Lei de 13 de maio de 1888 que aboliu a escravidão no Brasil." }
    ],
    questoes: [
      { enunciado: "O Segundo Reinado começou em 1840 com um acontecimento chamado:",
        alternativas: ["Proclamação da República", "Golpe da Maioridade", "Dia do Fico", "Independência do Brasil"], correta: 1,
        explicacao: "O Golpe da Maioridade antecipou a maioridade de D. Pedro II. O Dia do Fico e a Independência são de 1822; a República é de 1889, o fim do período." },
      { enunciado: "Qual era o principal produto de exportação do Brasil durante o Segundo Reinado?",
        alternativas: ["Açúcar", "Ouro", "Café", "Borracha"], correta: 2,
        explicacao: "O café dominou a economia. O açúcar marcou a Colônia, o ouro o século XVIII, e a borracha teve seu auge mais tarde, no fim do século XIX e começo do XX." },
      { enunciado: "Por que o parlamentarismo do Segundo Reinado é chamado de “às avessas”?",
        alternativas: ["Porque não existia Parlamento", "Porque o povo escolhia diretamente o imperador", "Porque o imperador controlava o ministério usando o Poder Moderador", "Porque o Brasil era uma república"], correta: 2,
        explicacao: "No parlamentarismo inglês, o Parlamento manda no governo. No Brasil era o contrário: o imperador escolhia o presidente do Conselho e podia dissolver a Câmara." },
      { enunciado: "Na Guerra do Paraguai (1864–1870), o Brasil lutou ao lado de:",
        alternativas: ["Argentina e Uruguai", "Chile e Peru", "Paraguai e Bolívia", "Estados Unidos e Inglaterra"], correta: 0,
        explicacao: "Brasil, Argentina e Uruguai formaram a Tríplice Aliança contra o Paraguai de Solano López." },
      { enunciado: "Qual destes fatores contribuiu para o fim da monarquia em 1889?",
        alternativas: ["O apoio total do Exército ao imperador", "A insatisfação de fazendeiros com a abolição sem indenização", "A vitória do Paraguai na guerra", "A volta do tráfico de escravizados"], correta: 1,
        explicacao: "Os fazendeiros perderam os escravizados sem receber indenização e deixaram de apoiar o Império. O Exército, ao contrário, estava insatisfeito com a monarquia." }
    ],
    dicas_prova: [
      "Faça uma linha do tempo: **1840** (maioridade) → **1850** (fim do tráfico) → **1864–70** (Guerra do Paraguai) → **1888** (Lei Áurea) → **1889** (República).",
      "Para o fim do Império, lembre das **três questões**: abolicionista, religiosa e militar.",
      "“Às avessas” = **ao contrário** do modelo inglês: quem mandava era o imperador.",
      "Se a questão citar Vale do Paraíba, Oeste Paulista ou ferrovias, a resposta provavelmente envolve o **café**.",
      "Cuidado: quem proclamou a República foi **Deodoro da Fonseca**, não D. Pedro II."
    ],
    videos: [
      yt("Segundo Reinado completo", "Segundo Reinado resumo Dom Pedro II", "Se Liga Nessa História"),
      yt("Parlamentarismo às avessas explicado", "parlamentarismo às avessas segundo reinado"),
      yt("Guerra do Paraguai", "Guerra do Paraguai resumo 8º ano"),
      yt("Crise do Império e Proclamação da República", "crise do império proclamação da república resumo")
    ],
    curiosidade: "Dom Pedro II adorava ciência: fez a primeira viagem de um chefe de Estado brasileiro aos EUA, conheceu o telefone de Graham Bell e era fã de fotografia."
  },

  "imperialismo e neocolonialismo no seculo xix": {
    titulo: "Imperialismo e neocolonialismo no século XIX",
    materia: "Ciências Humanas (História)",
    introducao: "No século XIX, países industrializados da Europa (e depois os EUA e o Japão) passaram a dominar territórios na África e na Ásia. Esse domínio, chamado de imperialismo ou neocolonialismo, buscava matérias-primas, mercados e poder — e deixou marcas que existem até hoje.",
    secoes: [
      { titulo: "Por que aconteceu?", pontos: [
        "A **Segunda Revolução Industrial** aumentou a necessidade de **matérias-primas** (borracha, petróleo, minérios).",
        "As indústrias precisavam de **mercados consumidores** para vender seus produtos.",
        "Havia excesso de **capitais** para investir e de **população** na Europa.",
        "Disputa por **prestígio e poder** entre as potências."
      ]},
      { titulo: "As justificativas", pontos: [
        "O **darwinismo social** dizia, de forma errada e racista, que alguns povos eram “superiores”.",
        "Falava-se em “**missão civilizadora**” — a ideia de levar a “civilização” europeia a outros povos.",
        "Na prática, eram desculpas para **explorar** as populações e os recursos locais."
      ]},
      { titulo: "A partilha da África", pontos: [
        "Na **Conferência de Berlim (1884–1885)**, as potências europeias definiram regras para dividir a África.",
        "As fronteiras foram traçadas **sem respeitar** os povos, línguas e culturas africanas.",
        "Em 1914, só **Etiópia** e **Libéria** não estavam sob domínio europeu.",
        "Houve muita **resistência** africana, como a vitória da Etiópia sobre a Itália em **Adwa (1896)**."
      ]},
      { titulo: "O imperialismo na Ásia", pontos: [
        "A **Índia** virou colônia britânica; houve a Revolta dos Cipaios (1857).",
        "Na **China**, as **Guerras do Ópio** abriram o país à força para o comércio britânico.",
        "O **Japão**, com a Era Meiji, se industrializou e também virou potência imperialista."
      ]},
      { titulo: "Consequências", pontos: [
        "Exploração do trabalho e dos recursos naturais dos povos dominados.",
        "Fronteiras artificiais que causaram **conflitos étnicos** até hoje.",
        "Rivalidade entre as potências, uma das causas da **Primeira Guerra Mundial**."
      ]}
    ],
    palavras_chave: [
      { termo: "Imperialismo", significado: "Domínio político e econômico de uma potência sobre outros territórios." },
      { termo: "Neocolonialismo", significado: "Nova colonização, no século XIX, sobretudo na África e na Ásia." },
      { termo: "Conferência de Berlim", significado: "Encontro de 1884–1885 que definiu as regras da partilha da África." },
      { termo: "Darwinismo social", significado: "Teoria racista que usava ideias da biologia para justificar a dominação." },
      { termo: "Missão civilizadora", significado: "Justificativa de que os europeus levariam a 'civilização' aos outros povos." },
      { termo: "Guerras do Ópio", significado: "Guerras em que a Inglaterra forçou a China a abrir seus portos." }
    ],
    questoes: [
      { enunciado: "Um dos principais motivos econômicos do imperialismo do século XIX foi:",
        alternativas: ["a busca por matérias-primas e mercados consumidores", "a vontade de acabar com a indústria", "a falta de produtos nas fábricas europeias", "o desejo de proteger as culturas africanas"], correta: 0,
        explicacao: "As indústrias da Segunda Revolução Industrial precisavam de matérias-primas e de lugares para vender. As outras alternativas não fazem sentido com o contexto." },
      { enunciado: "Qual evento definiu as regras para a divisão da África entre as potências europeias?",
        alternativas: ["Congresso de Viena", "Conferência de Berlim", "Tratado de Tordesilhas", "Revolução Francesa"], correta: 1,
        explicacao: "A Conferência de Berlim (1884–1885) organizou a partilha. Tordesilhas é de 1494 e dividiu terras entre Portugal e Espanha." },
      { enunciado: "O darwinismo social foi usado no século XIX para:",
        alternativas: ["explicar a evolução das plantas", "defender a igualdade entre os povos", "justificar a dominação de povos considerados “inferiores”", "criticar o imperialismo"], correta: 2,
        explicacao: "Era uma teoria racista, sem base científica, usada como desculpa para a dominação." },
      { enunciado: "Uma consequência do imperialismo na África que existe até hoje é:",
        alternativas: ["a ausência de qualquer conflito", "fronteiras artificiais que separaram ou juntaram povos rivais", "o fim de todas as línguas africanas", "a união de todos os países em um só"], correta: 1,
        explicacao: "As fronteiras foram desenhadas pelos europeus sem respeitar os povos locais, o que alimenta conflitos até hoje." },
      { enunciado: "As Guerras do Ópio estão relacionadas ao imperialismo:",
        alternativas: ["da Inglaterra na China", "do Brasil no Paraguai", "da Espanha na América", "dos Estados Unidos na Índia"], correta: 0,
        explicacao: "A Inglaterra fez guerra à China para manter a venda de ópio e forçar a abertura dos portos chineses." }
    ],
    dicas_prova: [
      "Lembre dos **motivos** em 3 palavras: **matéria-prima, mercado e capital**.",
      "Justificativas = **darwinismo social** e **missão civilizadora** (e saiba dizer que eram racistas).",
      "**Conferência de Berlim** = partilha da África (1884–1885). É data que cai muito.",
      "Não confunda o **colonialismo** dos séculos XV–XVIII (América) com o **neocolonialismo** do século XIX (África e Ásia).",
      "Se pedirem relação com outro assunto: imperialismo é uma das causas da **Primeira Guerra Mundial**."
    ],
    videos: [
      yt("Imperialismo e neocolonialismo", "imperialismo neocolonialismo século XIX resumo", "Se Liga Nessa História"),
      yt("Partilha da África e Conferência de Berlim", "partilha da África Conferência de Berlim"),
      yt("Imperialismo na Ásia: Índia e China", "imperialismo na Ásia guerras do ópio"),
      yt("Resistência africana", "resistência africana ao imperialismo Adwa")
    ],
    curiosidade: "A Etiópia derrotou a Itália na Batalha de Adwa, em 1896 — por isso as cores verde, amarelo e vermelho da sua bandeira inspiraram as bandeiras de vários países africanos."
  }
};

const normalizar = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s*\(.*\)\s*/g, "").trim();

export function buscarOffline(assunto) {
  const n = normalizar(assunto);
  if (OFFLINE[n]) return OFFLINE[n];
  // Busca aproximada: "imperialismo", "revolução industrial", etc.
  for (const [chave, dados] of Object.entries(OFFLINE)) {
    const principal = chave.split(" ").slice(0, 2).join(" ");
    if (n.includes(principal) || chave.includes(n) && n.length > 5) return dados;
  }
  return null;
}

export const temOffline = (assunto) => !!buscarOffline(assunto);
