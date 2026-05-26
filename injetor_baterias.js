const fs = require('fs');

const ARQUIVO_OFICIAL = 'data.json';
const QUANTIDADE_DIARIA = 300;

const modelos = [
  "iPhone 11", "iPhone 11 Pro", "iPhone 11 Pro Max", 
  "iPhone 12 Mini", "iPhone 12", "iPhone 12 Pro", "iPhone 12 Pro Max", 
  "iPhone 13 Mini", "iPhone 13", "iPhone 13 Pro", "iPhone 13 Pro Max", 
  "iPhone 14", "iPhone 14 Plus", "iPhone 14 Pro", "iPhone 14 Pro Max", 
  "iPhone 15", "iPhone 15 Plus", "iPhone 15 Pro", "iPhone 15 Pro Max", 
  "iPhone SE (2020)", "iPhone SE (2022)"
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

// Estrutura de alta conversão focada em transplante de BMS (Bateria)
const templateBateria = {
    slug_prefix: "troca-bateria",
    cat: "troca-bateria-iphone",
    titulo: "Troca de Bateria {MODELO} {PREP} {BAIRRO}",
    meta: "Bateria do {MODELO} viciada ou estufada? Troca de bateria original {PREP} {BAIRRO}. Reparo de BMS com solda ponto para manter a saúde a 100%.",
    h1: "Troca de Bateria {MODELO} {PREP} {BAIRRO}",
    sintoma: "Bateria descarregando rápido, aviso de manutenção, aparelho desligando sozinho em 20%, bateria estufada.",
    diag: "Realizamos a substituição da célula de energia utilizando equipamento de solda ponto (Spot Welding) para transplantar o circuito BMS original. Isso garante que o sistema do iOS reconheça a bateria como genuína, mantendo a leitura de 'Saúde da Bateria' em 100% e bloqueando mensagens de peça desconhecida."
};

try {
    // 1. Leitura da Matriz Oficial (data.json)
    let oficialData = [];
    if (fs.existsSync(ARQUIVO_OFICIAL)) {
        oficialData = JSON.parse(fs.readFileSync(ARQUIVO_OFICIAL, 'utf8'));
    } else {
        console.error(`ERRO: ${ARQUIVO_OFICIAL} não encontrado na bancada.`);
        process.exit(1);
    }

    const slugsOnline = new Set(oficialData.map(rota => rota.slug));
    const rotasFaltantes = [];

    // 2. Cálculo da Engenharia de Combinações
    modelos.forEach(modelo => {
        bairros.forEach(bairro => {
            const prep = getPreposicao(bairro);
            const modLimpo = limparNome(modelo);
            const bairroLimpo = limparNome(bairro);
            
            const slugGerado = `${templateBateria.slug_prefix}-${modLimpo}-${bairroLimpo}`;

            // 3. Bloqueio de Duplicatas (Só entra o que não estiver no data.json)
            if (!slugsOnline.has(slugGerado)) {
                rotasFaltantes.push({
                    slug: slugGerado,
                    categoria: templateBateria.cat,
                    titulo_seo: templateBateria.titulo.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro) + " | Smartboard Lab",
                    meta_desc: templateBateria.meta.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro),
                    h1: templateBateria.h1.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro),
                    bairro: bairro,
                    modelo: modelo,
                    sintoma: templateBateria.sintoma,
                    texto_diagnostico: templateBateria.diag
                });
            }
        });
    });

    // 4. Trava térmica do reator
    if (rotasFaltantes.length === 0) {
        console.log("\nSTATUS: Operação finalizada. Todas as 1.575 rotas de bateria já estão injetadas no data.json.");
        process.exit(0);
    }

    // 5. Recorte da injeção cravada em 300
    const loteDeHoje = rotasFaltantes.splice(0, QUANTIDADE_DIARIA);
    const dataFinal = [...oficialData, ...loteDeHoje];

    // 6. Selagem do arquivo oficial
    fs.writeFileSync(ARQUIVO_OFICIAL, JSON.stringify(dataFinal, null, 2));

    const diasRestantes = Math.ceil(rotasFaltantes.length / QUANTIDADE_DIARIA);

    // 7. Telemetria
    console.log('\n--- INJEÇÃO DA MALHA DE BATERIAS CONCLUÍDA ---');
    console.log(`Lote injetado na esteira agora: ${loteDeHoje.length} rotas de bateria.`);
    console.log(`Total geral selado no ${ARQUIVO_OFICIAL}: ${dataFinal.length} páginas.`);
    console.log(`Rotas de bateria restantes aguardando injeção: ${rotasFaltantes.length}`);
    console.log(`Projeção térmica de finalização (Baterias): ${diasRestantes} dias úteis.`);
    console.log('----------------------------------------------\n');

} catch (err) {
    console.error('Falha de hardware/sintaxe na compilação:', err);
}