const fs = require('fs');

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

const defeitos = [
    { id: "placa-morta", slug_prefix: "reparo-placa-vddmain", cat: "reparo-placa-iphone", titulo: "Reparo de Placa (Não Liga) {MODELO} {PREP} {BAIRRO}", meta: "{MODELO} apagou {PREP} {BAIRRO}? Diagnóstico termográfico e reparo de curto na malha VDD_MAIN. Especialistas em microssoldagem Apple.", h1: "Conserto de Placa {MODELO} {PREP} {BAIRRO}", sintoma: "Aparelho morto, não liga, não carrega, alto consumo na fonte.", diag: "Isolamos o curto-circuito na malha primária (VDD_MAIN/BATT) via termografia. Substituímos apenas o capacitor ou CI danificado, salvando a placa original." },
    { id: "face-id", slug_prefix: "reparo-face-id", cat: "reparo-face-id-iphone", titulo: "Reparo de Face ID {MODELO} {PREP} {BAIRRO}", meta: "Face ID parou de funcionar no {MODELO}? Reparo do projetor de pontos e sensor infravermelho {PREP} {BAIRRO} com garantia técnica.", h1: "Conserto de Face ID {MODELO} {PREP} {BAIRRO}", sintoma: "Mensagem 'Face ID não está disponível', modo retrato falhando.", diag: "Realizamos o alinhamento de prisma e o transplante do IC criptográfico do Dot Projector flex, restaurando a biometria facial original." },
    { id: "ci-carga", slug_prefix: "reparo-ci-carga-tristar", cat: "reparo-placa-iphone", titulo: "Reparo CI de Carga Tristar {MODELO} {PREP} {BAIRRO}", meta: "O {MODELO} não carrega ou descarrega rápido? Troca do CI de carga (Tristar/Hydra) {PREP} {BAIRRO}. Diagnóstico no osciloscópio.", h1: "Reparo de CI de Carga {MODELO} {PREP} {BAIRRO}", sintoma: "Não reconhece cabo, 'acessório não suportado', bateria drena rápido.", diag: "Avaliamos a malha de comunicação USB no osciloscópio. O reparo consiste na substituição do CI controlador de carga (Tristar/Hydra) via microssoldagem." },
    { id: "audio-ic", slug_prefix: "reparo-audio-ic", cat: "reparo-placa-iphone", titulo: "Reparo de Audio IC {MODELO} {PREP} {BAIRRO}", meta: "Sem som nas ligações do {MODELO}? Conserto crônico do Codec de Áudio (Audio IC) {PREP} {BAIRRO}. Recuperamos viva-voz e microfone.", h1: "Conserto Audio IC {MODELO} {PREP} {BAIRRO}", sintoma: "Ícone de viva-voz apagado nas ligações, gravador de voz não funciona, boot demorado.", diag: "Esta é uma falha estrutural. Removemos o Codec de Áudio, refazemos as trilhas rompidas na placa lógica (jumpers) e ressoldamos o componente." },
    { id: "baseband", slug_prefix: "reparo-sinal-baseband", cat: "reparo-placa-iphone", titulo: "Reparo Baseband Buscando Sinal {MODELO} {PREP} {BAIRRO}", meta: "{MODELO} travado em 'Buscando' ou 'Sem Serviço'? Reparo de Baseband e RF {PREP} {BAIRRO}. Diagnóstico de modem de rede.", h1: "Reparo de Sinal (Baseband) {MODELO} {PREP} {BAIRRO}", sintoma: "Aparelho diz 'Buscando' mesmo sem chip, falha na atualização de rede celular.", diag: "Realizamos a varredura nas linhas de alimentação do Modem (Baseband PMIC). O reparo foca na recuperação da tensão de rádio frequência (RF)." },
    { id: "camera-ldo", slug_prefix: "reparo-camera-ldo", cat: "reparo-placa-iphone", titulo: "Conserto Placa Câmera Preta {MODELO} {PREP} {BAIRRO}", meta: "Câmera do {MODELO} preta mesmo após trocar a peça? Reparo na linha LDO da placa mãe {PREP} {BAIRRO}. Especialistas em hardware Apple.", h1: "Reparo LDO de Câmera {MODELO} {PREP} {BAIRRO}", sintoma: "Câmera preta, lanterna não funciona, app de câmera trava.", diag: "Quando a substituição do módulo da câmera não resolve, a falha está na alimentação (LDO) da placa lógica. Refazemos as linhas de tensão do circuito." },
    { id: "recuperacao-dados", slug_prefix: "recuperacao-dados-placa", cat: "recuperacao-dados-iphone", titulo: "Recuperação de Dados Placa Morta {MODELO} {PREP} {BAIRRO}", meta: "Seu {MODELO} quebrou e tem arquivos importantes? Recuperação de dados em placa morta {PREP} {BAIRRO}. Extração de fotos e senhas.", h1: "Recuperação de Dados {MODELO} {PREP} {BAIRRO}", sintoma: "Placa partida ao meio, oxidação severa por água, CPU comprometida.", diag: "Mesmo em perda total, realizamos o SWAP (transplante) da CPU, EEPROM e NAND original para uma placa doadora, recuperando acesso integral aos seus dados." }
];

const loteMaster = [];

modelos.forEach(modelo => {
    bairros.forEach(bairro => {
        const prep = getPreposicao(bairro);
        const modLimpo = limparNome(modelo);
        const bairroLimpo = limparNome(bairro);

        defeitos.forEach(def => {
            let atualDef = { ...def };
            
            if (modelo === "iPhone 13 Pro" && atualDef.id === "baseband") {
                atualDef.slug_prefix = "reparo-bpic-cs39l10";
                atualDef.cat = "reparo-placa-iphone";
                atualDef.titulo = "Reparo Boost Power IC (BPIC) {MODELO} {PREP} {BAIRRO}";
                atualDef.meta = "{MODELO} reiniciando ou sem som? Reparo cirúrgico no Boost Power IC (CS39L10-B1) {PREP} {BAIRRO}.";
                atualDef.h1 = "Reparo Boost Power IC (BPIC) {MODELO} {PREP} {BAIRRO}";
                atualDef.sintoma = "Falhas de amplificação de áudio, reinicialização em loop e perda de força no sistema.";
                atualDef.diag = "Isolamos a falha diretamente no componente CS39L10-B1. Realizamos a remoção térmica e a substituição do Boost Power IC (BPIC), estabilizando o circuito e restaurando as tensões primárias da placa.";
            }

            loteMaster.push({
                slug: `${atualDef.slug_prefix}-${modLimpo}-${bairroLimpo}`,
                categoria: atualDef.cat,
                titulo_seo: atualDef.titulo.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro) + " | Smartboard Lab",
                meta_desc: atualDef.meta.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro),
                h1: atualDef.h1.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{BAIRRO}', bairro),
                bairro: bairro,
                modelo: modelo,
                sintoma: atualDef.sintoma,
                texto_diagnostico: atualDef.diag
            });
        });
    });
});

fs.writeFileSync('placas_master.json', JSON.stringify(loteMaster, null, 2));

console.log('--- COMPILAÇÃO MESTRE CONCLUÍDA ---');
console.log(`Sucesso: ${loteMaster.length} páginas de Reparo de Placa geradas e salvas em 'placas_master.json'.`);
console.log(`Atenção: Rode o script 'limpar_master.js' imediatamente após este passo para evitar duplicação das páginas já enviadas ao servidor.`);