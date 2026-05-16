const fs = require('fs');

// Todos os 75 bairros oficiais de Curitiba
const todosBairros = [
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

// Gramática correta para SEO
function getPreposicao(bairro) {
    const femininos = ["Augusta", "Barreirinha", "Cachoeira", "Cascatinha", "Caximba", "CIC", "Fazendinha", "Lamenha Pequena", "Riviera", "Santa Cândida", "Santa Quitéria", "Vila Izabel", "Vista Alegre"];
    if (bairro === "Santa Felicidade") return "em Santa Felicidade";
    if (bairro === "Mercês") return "nas Mercês";
    if (femininos.includes(bairro)) return "na " + bairro;
    return "no " + bairro; // Padrão Curitiba (ex: no Água Verde, no Portão)
}

// Gerador padronizado de slugs para evitar colisões
function gerarSlug(modelo, bairro) {
    let m = modelo.toLowerCase().replace(/ /g, '-').replace(/\(|\)/g, '');
    let b = bairro.toLowerCase().replace(/ /g, '-')
            .replace(/[áàãâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[íìîï]/g, 'i')
            .replace(/[óòõôö]/g, 'o')
            .replace(/[úùûü]/g, 'u')
            .replace(/[ç]/g, 'c');
    return `troca-tela-${m}-${b}`;
}

try {
    const rawData = fs.readFileSync('data.json', 'utf8');
    const data = JSON.parse(rawData);
    
    // Mapeia o que você já tem para NUNCA repetir
    const slugsExistentes = new Set(
        data.filter(item => item.categoria === 'troca-tela-iphone').map(item => item.slug)
    );

    // Identifica todos os modelos que você trabalhou no JSON dinamicamente
    const modelosTrabalhados = Array.from(new Set(
        data.filter(item => item.categoria === 'troca-tela-iphone').map(item => item.modelo)
    ));

    console.log(`Leitura concluída: ${modelosTrabalhados.length} modelos identificados e ${slugsExistentes.size} páginas de tela já armadas.`);

    const novasPaginas = [];

    // Cruzamento matriz de dados (Modelos x Bairros)
    modelosTrabalhados.forEach(modelo => {
        todosBairros.forEach(bairro => {
            const slug = gerarSlug(modelo, bairro);
            const prepBairro = getPreposicao(bairro);
            
            if (!slugsExistentes.has(slug)) {
                novasPaginas.push({
                    slug: slug,
                    categoria: "troca-tela-iphone",
                    titulo_seo: `Troca de Tela ${modelo} ${prepBairro} | Smartboard Lab`,
                    meta_desc: `Tela do ${modelo} quebrada? Reparo técnico ${prepBairro} com regravação de True Tone e vedação IP68. Peças premium.`,
                    h1: `Troca de Tela ${modelo} ${prepBairro}`,
                    bairro: bairro,
                    modelo: modelo,
                    sintoma: "Touch paralisado, vidro estilhaçado, listras no LCD ou OLED.",
                    texto_diagnostico: "Realizamos o transplante do CI original para a nova tela, eliminando a mensagem de peça desconhecida e preservando a calibração óptica nativa do iOS."
                });
                slugsExistentes.add(slug); // Trava de segurança
            }
        });
    });

    if (novasPaginas.length > 0) {
        console.log(`\n--- INJEÇÃO ATIVADA ---`);
        console.log(`Gerando as ${novasPaginas.length} páginas exatamente faltantes...`);
        
        const dataFinal = [...data, ...novasPaginas];
        fs.writeFileSync('data.json', JSON.stringify(dataFinal, null, 2));
        
        console.log(`SUCESSO! data.json atualizado. Total da sua malha geral agora é de ${dataFinal.length} páginas.`);
    } else {
        console.log("O silo de telas já está 100% completo! Nenhuma página faltante na malha.");
    }

} catch (err) {
    console.error('Erro crítico no processamento:', err);
}