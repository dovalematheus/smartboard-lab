const fs = require('fs');

const ARQUIVO_OFICIAL = 'data.json';

// Matriz exaustiva Apple 2012 - Atual
const modelos = [
  // Linha 2012-2017 (Legado e Retina)
  "MacBook Air 11 A1465", "MacBook Air 13 A1466",
  "MacBook Pro 13 A1278", "MacBook Pro 15 A1286",
  "MacBook Pro Retina 13 A1425", "MacBook Pro Retina 13 A1502", "MacBook Pro Retina 15 A1398",
  "MacBook 12 Retina A1534",
  
  // Linha Touch Bar / Intel Moderno (2016-2020)
  "MacBook Pro 13 A1708", "MacBook Pro Touch Bar 13 A1706", "MacBook Pro Touch Bar 15 A1707",
  "MacBook Pro Touch Bar 13 A1989", "MacBook Pro Touch Bar 15 A1990", "MacBook Pro Touch Bar 13 A2159",
  "MacBook Pro 16 Intel A2141",
  "MacBook Air Retina 13 A1932", "MacBook Air Retina 13 A2179",
  "MacBook Pro 13 Intel A2289", "MacBook Pro 13 Intel A2251",
  
  // Linha Apple Silicon M1 (2020-2021)
  "MacBook Air M1 A2337", "MacBook Pro M1 A2338",
  "MacBook Pro M1 Pro 14 A2442", "MacBook Pro M1 Max 16 A2485",
  
  // Linha Apple Silicon M2 (2022-2023)
  "MacBook Air M2 A2681", "MacBook Air M2 15 A2941",
  "MacBook Pro M2 Pro 14 A2779", "MacBook Pro M2 Max 16 A2780",
  
  // Linha Apple Silicon M3 (2023-2024)
  "MacBook Air M3 13 A3113", "MacBook Air M3 15 A3114",
  "MacBook Pro M3 14 A2918", "MacBook Pro M3 Pro 14 A2992", "MacBook Pro M3 Max 16 A2991"
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

const defeitos = [
    { id: "mac-morta", slug_prefix: "reparo-placa-mae-macbook", cat: "reparo-placa-macbook", titulo: "Conserto de Placa Mãe {MODELO} {PREP} {BAIRRO}", meta: "{MODELO} não liga? Reparo avançado de placa lógica {PREP} {BAIRRO}. Diagnóstico de curto na malha primária PPBUS_G3H e recuperação de trilhas.", h1: "Conserto de Placa Mãe {MODELO} {PREP} {BAIRRO}", sintoma: "MacBook apagado, não acende LED no MagSafe ou não negocia 20V no USB-C. Consumo zerado na fonte.", diag: "Isolamos falhas na malha de potência principal (PPBUS_G3H). Usando termografia, detectamos capacitores SMD em curto ou falha estrutural nos MOSFETs de alta, substituindo-os via microssoldagem para evitar a troca completa da placa." },
    { id: "mac-carga", slug_prefix: "reparo-ci-carga-cd3215", cat: "reparo-placa-macbook", titulo: "Reparo Conector de Carga {MODELO} {PREP} {BAIRRO}", meta: "Seu {MODELO} não carrega ou trava em 5V? Troca de CI controlador (CD3215/CD3217) e reparo de porta Thunderbolt {PREP} {BAIRRO}.", h1: "Reparo de CI de Carga e USB-C {MODELO} {PREP} {BAIRRO}", sintoma: "Aparelho só carrega de um lado da porta, não reconhece periféricos ou trava a tensão na porta Type-C em 5V.", diag: "Avaliamos o barramento CC no osciloscópio. Substituímos o circuito integrado responsável pelo handshake de energia (CD3215/CD3217 ou variantes M-Series), restaurando a linha de carregamento rápido." },
    { id: "mac-backlight", slug_prefix: "conserto-tela-backlight", cat: "tela-macbook", titulo: "Reparo de Backlight e Flexgate {MODELO} {PREP} {BAIRRO}", meta: "Imagem apagada ou falha ao abrir a tela do {MODELO}? Conserto de backlight e Flexgate {PREP} {BAIRRO} sem precisar comprar tela nova.", h1: "Conserto de Backlight / Flexgate {MODELO} {PREP} {BAIRRO}", sintoma: "Imagem muito escura (somente visível contra a luz), som de inicialização normal, ou tela que apaga ao passar de 45 graus de abertura.", diag: "Mapeamos o conversor DC-DC do backlight. Realizamos a troca de fusíveis estourados, driver de LED ou aplicamos a micro-reconstrução de vias do cabo flexível rompidas pelo defeito crônico de projeto (Flexgate)." },
    { id: "mac-liquido", slug_prefix: "desoxidacao-placa-macbook", cat: "reparo-placa-macbook", titulo: "Desoxidação de MacBook {MODELO} {PREP} {BAIRRO}", meta: "Derrubou líquido no {MODELO}? Banho químico ultrassônico e reparo de placa pós-oxidação {PREP} {BAIRRO}. Especialistas Apple.", h1: "Desoxidação e Reparo Pós-Líquido {MODELO} {PREP} {BAIRRO}", sintoma: "Dano por derramamento de água ou café. Teclado falhando, oxidação esverdeada visível na placa ou recusa em ligar.", diag: "Desmontamos o aparelho e aplicamos um banho químico em cuba ultrassônica para remover sais minerais. Em seguida, refazemos as esferas BGA ou trilhas consumidas por corrosão galvânica na placa lógica." },
    { id: "mac-loop", slug_prefix: "conserto-kernel-panic-loop", cat: "reparo-placa-macbook", titulo: "Conserto de Kernel Panic {MODELO} {PREP} {BAIRRO}", meta: "{MODELO} reiniciando em loop ou travado? Reparo de Kernel Panic, firmware T2 e falhas de memória {PREP} {BAIRRO}.", h1: "Conserto de Kernel Panic e Loop {MODELO} {PREP} {BAIRRO}", sintoma: "Aparelho exibe logs de erro na tela, reinicia do nada durante o uso, ou congela na barra da Apple no boot.", diag: "Rastreamos curtos nas linhas I2C e SPI. O reparo soluciona falhas em sensores de temperatura isolados, instabilidade nos módulos de NAND flash ou corrupção no chip de segurança (SMC/T2/Secure Enclave)." },
    { id: "mac-dados", slug_prefix: "recuperacao-dados-macbook-morto", cat: "recuperacao-dados-macbook", titulo: "Recuperação de Dados MacBook {MODELO} {PREP} {BAIRRO}", meta: "Placa queimada e precisa dos arquivos no {MODELO}? Extração de dados via transplante de NAND {PREP} {BAIRRO}.", h1: "Recuperação de Dados Placa Morta {MODELO} {PREP} {BAIRRO}", sintoma: "Placa lógica carbonizada ou irrecuperável onde os arquivos importantes ficaram presos nos chips de memória soldados.", diag: "Realizamos o procedimento de SWAP. Removemos fisicamente as memórias NAND e o chip controlador/criptográfico da placa original danificada, transplantando-os para uma placa doadora para liberar o acesso root aos seus dados." }
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
        
        if (s.includes('cd3215') || s.includes('usb-c') || s.includes('carga')) defId = 'mac-carga';
        else if (s.includes('backlight') || s.includes('flexgate') || s.includes('tela')) defId = 'mac-backlight';
        else if (s.includes('desoxidacao') || s.includes('liquido')) defId = 'mac-liquido';
        else if (s.includes('kernel') || s.includes('loop')) defId = 'mac-loop';
        else if (s.includes('dados') || s.includes('nand')) defId = 'mac-dados';
        else if (s.includes('placa-mae') || s.includes('placa-morta') || s.includes('macbook')) defId = 'mac-morta';

        assinaturasOnline.add(`${p.modelo}|${p.bairro}|${defId}`);
    });

    const novasPaginas = [];
    let totalGeradoTeorico = 0;

    modelos.forEach(modelo => {
        bairros.forEach(bairro => {
            const prep = getPreposicao(bairro);
            const modLimpo = limparNome(modelo);
            const bairroLimpo = limparNome(bairro);

            defeitos.forEach(def => {
                totalGeradoTeorico++;
                const assinaturaAtual = `${modelo}|${bairro}|${def.id}`;

                if (!assinaturasOnline.has(assinaturaAtual)) {
                    novasPaginas.push({
                        slug: `${def.slug_prefix}-${modLimpo}-${bairroLimpo}`,
                        categoria: def.cat,
                        titulo_seo: def.titulo.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro) + " | Smartboard Lab",
                        meta_desc: def.meta.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro),
                        h1: def.h1.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro),
                        bairro: bairro,
                        modelo: modelo,
                        sintoma: def.sintoma,
                        texto_diagnostico: def.diag
                    });
                }
            });
        });
    });

    if (novasPaginas.length === 0) {
        console.log("\nSTATUS: Barramento ocioso. A malha de MacBooks já está completamente gravada no data.json.");
        process.exit(0);
    }

    const dataFinal = [...oficialData, ...novasPaginas];
    fs.writeFileSync(ARQUIVO_OFICIAL, JSON.stringify(dataFinal, null, 2));

    console.log('\n--- INJEÇÃO FORÇA BRUTA: MACBOOKS 2012-ATUAL CONCLUÍDA ---');
    console.log(`Base operante anterior: ${oficialData.length} rotas.`);
    console.log(`Capacidade teórica da matriz processada: ${totalGeradoTeorico}`);
    console.log(`Novas páginas de MacBook injetadas agora: ${novasPaginas.length}`);
    console.log(`Total geral selado no ${ARQUIVO_OFICIAL}: ${dataFinal.length} rotas.`);
    console.log('------------------------------------------------------------\n');
    console.log('Motor desligado. Dispare o comando Git para subir o lote ao servidor.');

} catch (err) {
    console.error('Falha estrutural detectada:', err);
}