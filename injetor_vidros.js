const fs = require('fs');

const ARQUIVO_OFICIAL = 'data.json';

// Matriz de iPhones onde a troca de vidro (frontal ou traseiro) é altamente rentável
const modelos = [
  "iPhone X", "iPhone XR", "iPhone XS", "iPhone XS Max",
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max",
  "iPhone 12 Mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max",
  "iPhone 13 Mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max",
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max",
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max"
];

const bairros = [
  "Abranches", "Água Verde", "Ahú", "Alto Boqueirão", "Alto da Glória", "Alto da XV",
  "Atuba", "Augusta", "Bacacheri", "Bairro Alto", "Barreirinha", "Batel", "Bigorrilho",
  "Boa Vista", "Bom Retiro", "Boqueirão", "Butiatuvinha", "Cabral", "Cachoeira", "Cajuru",
  "Campina do Siqueira", "Campo Comprido", "Campo de Santana", "Capão da Imbuia", "Capão Raso",
  "Cascatinha", "Caximba", "Centro", "Centro Cívico", "CIC", "Cristo Rei", "Fanny", "Fazendinha",
  "Ganchinho", "Guabirotuba", "Guaíra", "Hauer", "Hugo Lange", "Jardim Botânico", "Jardim das Américas",
  "Jardim Social", "Juvevê", "Lamenha Pequena", "Lindóia", "Mercês", "Mossunguê", "Novo Mundo",
  "Orleans", "Parolin", "Pilarzinho", "Pinheirinho", "Portão", "Prado Velho", "Rebouças", "Riviera",
  "Santa Cândida", "Santa Felicidade", "Santa Quitéria", "Santo Inácio", "São Braz", "São Francisco",
  "São João", "São Lourenço", "São Miguel", "Seminário", "Sítio Cercado", "Taboão", "Tarumã", "Tatuquara",
  "Tingui", "Uberaba", "Umbará", "Vila Izabel", "Vista Alegre", "Xaxim"
];

function getPreposicao(bairro) {
    const femininos = ["Augusta", "Barreirinha", "Cachoeira", "Cascatinha", "Caximba", "CIC", "Fazendinha", "Lamenha Pequena", "Riviera", "Santa Cândida", "Santa Quitéria", "Vila Izabel", "Vista Alegre"];
    if (bairro === "Santa Felicidade") return "em";
    if (bairro === "Mercês") return "nas";
    if (femininos.includes(bairro)) return "na";
    return "no";
}

function limparNome(str) {
    return str.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '')
        .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u').replace(/[ç]/g, 'c');
}

const templates = [
    {
        id: "vidro-frontal",
        slug_prefix: "troca-vidro-tela",
        cat: "troca-vidro-iphone",
        titulo: "Troca de Vidro da Tela {MODELO} {PREP} {BAIRRO}",
        meta: "Quebrou só o vidro do {MODELO}? Mantenha o display original! Troca de vidro com laminação OCA {PREP} {BAIRRO}. Sem mensagem de peça desconhecida.",
        h1: "Troca de Vidro Frontal {MODELO} {PREP} {BAIRRO}",
        sintoma: "Vidro trincado ou estilhaçado, mas a tela continua dando imagem perfeita e o touch screen responde normalmente em todas as áreas.",
        diag: "Realizamos a separação criogênica ou térmica do vidro quebrado preservando o seu display OLED/LCD original de fábrica. Aplicamos um novo vidro utilizando filme OCA e máquina de laminação a vácuo, garantindo o acabamento perfeito e evitando os avisos de 'Peça Desconhecida' no sistema iOS."
    },
    {
        id: "vidro-traseiro",
        slug_prefix: "troca-vidro-traseiro",
        cat: "troca-vidro-iphone",
        titulo: "Troca de Vidro Traseiro {MODELO} {PREP} {BAIRRO}",
        meta: "Vidro traseiro do {MODELO} quebrado? Troca a laser sem abrir o aparelho {PREP} {BAIRRO}. Preserva a vedação e o carregamento MagSafe.",
        h1: "Troca de Vidro Traseiro a Laser {MODELO} {PREP} {BAIRRO}",
        sintoma: "Tampa traseira de vidro trincada ou estilhaçada, risco de corte nas mãos e perda da eficiência do carregamento por indução (MagSafe).",
        diag: "Utilizamos maquinário de separação a laser para mapear e queimar a cola epóxi original de fábrica sem necessidade de desmontar todo o aparelho. O procedimento preserva os flex do MagSafe, microfones e isolamento interno, finalizando com a fixação de um novo vidro com prensa de precisão."
    }
];

try {
    let oficialData = [];
    if (fs.existsSync(ARQUIVO_OFICIAL)) {
        oficialData = JSON.parse(fs.readFileSync(ARQUIVO_OFICIAL, 'utf8'));
    }

    const assinaturasOnline = new Set();
    oficialData.forEach(p => {
        let defId = 'desconhecido';
        const s = p.slug || "";
        
        if (s.includes('vidro-tela') || s.includes('frontal')) defId = 'vidro-frontal';
        else if (s.includes('vidro-traseiro')) defId = 'vidro-traseiro';

        assinaturasOnline.add(`${p.modelo}|${p.bairro}|${defId}`);
    });

    const novasPaginas = [];
    let totalGerado = 0;

    modelos.forEach(modelo => {
        bairros.forEach(bairro => {
            const prep = getPreposicao(bairro);
            const modLimpo = limparNome(modelo);
            const bairroLimpo = limparNome(bairro);

            templates.forEach(tpl => {
                totalGerado++;
                const assinaturaAtual = `${modelo}|${bairro}|${tpl.id}`;

                if (!assinaturasOnline.has(assinaturaAtual)) {
                    novasPaginas.push({
                        slug: `${tpl.slug_prefix}-${modLimpo}-${bairroLimpo}`,
                        categoria: tpl.cat,
                        titulo_seo: tpl.titulo.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro) + " | Smartboard Lab",
                        meta_desc: tpl.meta.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro),
                        h1: tpl.h1.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro),
                        bairro: bairro,
                        modelo: modelo,
                        sintoma: tpl.sintoma,
                        texto_diagnostico: tpl.diag
                    });
                }
            });
        });
    });

    if (novasPaginas.length === 0) {
        console.log("\nSTATUS: Matriz de vidros já consolidada no data.json.");
        process.exit(0);
    }

    const dataFinal = [...oficialData, ...novasPaginas];
    fs.writeFileSync(ARQUIVO_OFICIAL, JSON.stringify(dataFinal, null, 2));

    console.log('\n--- INJEÇÃO DE MATRIZ DE VIDROS CONCLUÍDA NO ARQUIVO LOCAL ---');
    console.log(`Novas páginas estruturadas: ${novasPaginas.length}`);
    console.log(`Total geral selado no ${ARQUIVO_OFICIAL}: ${dataFinal.length} rotas.`);
    console.log('--------------------------------------------------------------\n');
    console.log('ATENÇÃO: Não execute o git push. Deixe o arquivo local decantar.');

} catch (err) {
    console.error('Falha na compilação do injetor:', err);
}