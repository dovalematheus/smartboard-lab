const fs = require('fs');

// 1. Módulos Premium e de Alto Volume (30 Placas)
const modulos = [
    // Câmbios Premium 
    "Módulo Câmbio DSG DQ200", "Módulo Câmbio DSG DQ250", "Módulo Câmbio Powershift TCM", 
    "Módulo Câmbio AL4", "Módulo Câmbio I-Motion", "Módulo Câmbio Dualogic",
    
    // Injeção Premium e Importados
    "ECU Bosch MED17", "ECU Bosch MEV17", "ECU Continental SIMOS", 
    "ECU Siemens EMS3134", "ECU Siemens EMS3120", "ECU Keihin",
    
    // Injeção Crônica (Giro Rápido VW/Fiat/GM/Ford)
    "ECU Magneti Marelli 4GF", "ECU Magneti Marelli 4GV", "ECU Magneti Marelli 4SF", 
    "ECU Magneti Marelli 7GF", "ECU Magneti Marelli 9GF", "ECU Magneti Marelli 10GF", 
    "ECU Bosch ME7.5.20", "ECU Bosch ME7.5.30", "ECU Bosch M17.5.24", 
    "ECU ACDelco E83", "ECU ACDelco E78", "ECU ACDelco E39", "ECU Multec VHC",
    "ECU Delphi MT27E", "ECU Delphi MT20U", "ECU Delphi MT22U", 
    "ECU FoMoCo FOM", "ECU Visteon"
];

// 2. Cidades com Alto Poder de Compra + Pólos Logísticos (99 Cidades)
const cidades = [
    "Curitiba", "Londrina", "Maringá", "Cascavel", "Ponta Grossa", "Foz do Iguaçu", "Guarapuava", "Toledo", "Apucarana", "Pinhais", "Arapongas", "Umuarama",
    "São Paulo", "Campinas", "Ribeirão Preto", "São José do Rio Preto", "Sorocaba", "Santos", "Jundiaí", "Piracicaba", "Bauru", "Franca", "Limeira", "Taubaté", "São José dos Campos", "Presidente Prudente", "Marília", "Araçatuba", "Araraquara", "São Carlos",
    "Florianópolis", "Joinville", "Blumenau", "Balneário Camboriú", "Chapecó", "Itajaí", "Criciúma", "São José", "Lages", "Jaraguá do Sul", "Palhoça",
    "Porto Alegre", "Caxias do Sul", "Passo Fundo", "Pelotas", "Canoas", "Santa Maria", "Gravataí", "Novo Hamburgo", "São Leopoldo", "Rio Grande",
    "Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim", "Montes Claros", "Ribeirão das Neves", "Uberaba", "Governador Valadares", "Ipatinga",
    "Goiânia", "Aparecida de Goiânia", "Anápolis", "Rio Verde", "Luziânia",
    "Brasília", "Cuiabá", "Várzea Grande", "Rondonópolis", "Sinop", "Sorriso", "Lucas do Rio Verde",
    "Campo Grande", "Dourados", "Três Lagoas",
    "Rio de Janeiro", "São Gonçalo", "Duque de Caxias", "Nova Iguaçu", "Niterói", "Campos dos Goytacazes", "Belford Roxo", "São João de Meriti", "Petrópolis", "Volta Redonda",
    "Vitória", "Vila Velha", "Serra", "Cariacica", "Cachoeiro de Itapemirim",
    "Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari",
    "Recife", "Campina Grande", "Caruaru", "Mossoró"
];

// 3. Regra de Gramática para Cidades
function getPreposicao(cidade) {
    const no = ["Rio de Janeiro", "Rio Grande"];
    const na = ["Serra", "Cariacica", "Campina Grande", "Várzea Grande", "Luziânia"];
    if (no.includes(cidade)) return "no";
    if (na.includes(cidade)) return "na";
    return "em";
}

function limparNome(str) {
    return str.toLowerCase().replace(/ /g, '-').replace(/\(|\)|\//g, '')
        .replace(/[áàãâä]/g, 'a').replace(/[éèêë]/g, 'e')
        .replace(/[íìîï]/g, 'i').replace(/[óòõôö]/g, 'o')
        .replace(/[úùûü]/g, 'u').replace(/[ç]/g, 'c');
}

// 4. Matriz de Defeitos e Diagnósticos (Intenção B2B)
const defeitos = [
    { id: "falha-can", slug_prefix: "reparo-falha-comunicacao-can", cat: "reparo-modulo-injecao", titulo: "Conserto Falha Comunicação Rede CAN {MODELO} {PREP} {CIDADE}", meta: "Scanner acusa erro U0100 no {MODELO}? Laboratório especialista repara barramento de dados e transceivers com envio para {CIDADE}.", h1: "Reparo de Comunicação Rede CAN {MODELO} {PREP} {CIDADE}", sintoma: "Erro U0100, painel com luzes acesas, perda de comunicação ABS/Câmbio.", diag: "Rastreamos o sinal diferencial CAN direto nos pinos. Trocamos o CI Transceiver, restabelecendo a conversa do módulo com o veículo." },
    { id: "immo-off", slug_prefix: "reparo-imobilizador-bloqueado", cat: "reparo-modulo-injecao", titulo: "Desbloqueio e Immo-Off {MODELO} {PREP} {CIDADE}", meta: "Carro não dá partida e luz piscando? Clonagem e Immo-Off para {MODELO} atendendo {CIDADE}.", h1: "Reparo de Imobilizador e Clonagem {MODELO} {PREP} {CIDADE}", sintoma: "Motor vira mas não pega, Erro P160A ou chave não reconhecida.", diag: "Lemos a memória em bancada via BDM/JTAG. Reparamos o arquivo hex ou clonamos para placa doadora." },
    { id: "sem-pulso", slug_prefix: "conserto-falha-ignicao-injetor", cat: "reparo-modulo-injecao", titulo: "Reparo Sem Pulso Bico/Bobina {MODELO} {PREP} {CIDADE}", meta: "Falta de pulso na bobina ou bico no {MODELO}? Troca de drivers IGBT da centralina para {CIDADE}.", h1: "Conserto de Pulso de Ignição/Injeção {MODELO} {PREP} {CIDADE}", sintoma: "Motor falhando (P0300), ausência de pulso no bico (P0201).", diag: "Substituímos os drivers de potência IGBT/Mosfet queimados que chaveiam o terra, garantindo pulso sob carga." },
    { id: "acelerador", slug_prefix: "reparo-corpo-borboleta-ecu", cat: "reparo-modulo-injecao", titulo: "Reparo Acelerador Eletrônico ECU {MODELO} {PREP} {CIDADE}", meta: "Carro não acelera e acende luz EPC? Conserto do circuito TBI na {MODELO} atendendo {CIDADE}.", h1: "Conserto Circuito Acelerador {MODELO} {PREP} {CIDADE}", sintoma: "Pedal sem resposta, motor em emergência, Erro P2101 ou P2118.", diag: "O driver Ponte H responsável por abrir a borboleta entra em curto. Realizamos a substituição do CI conversor." },
    { id: "processador", slug_prefix: "reparo-erro-p0606-processador", cat: "reparo-modulo-injecao", titulo: "Conserto Erro P0606 Processador {MODELO} {PREP} {CIDADE}", meta: "Módulo condenado com erro interno P0606 no {MODELO}? Recuperação avançada via hardware para {CIDADE}.", h1: "Reparo Erro Interno (P0606) {MODELO} {PREP} {CIDADE}", sintoma: "Scanner acusa falha interna de módulo de controle (P0606).", diag: "Falha de solda fria BGA ou trilhas submersas no processador principal. Refazemos o barramento devolvendo a funcionalidade lógica." },
    { id: "cambio-dsg", slug_prefix: "reparo-placa-mecatronica", cat: "reparo-modulo-cambio", titulo: "Conserto Placa Mecatrônica {MODELO} {PREP} {CIDADE}", meta: "Câmbio travando ou sem engatar no {MODELO}? Reparo TCM em nível de componente atendendo {CIDADE}.", h1: "Reparo da Placa Mecatrônica TCM {MODELO} {PREP} {CIDADE}", sintoma: "Erro P189C, perda de marchas, falha de comunicação TCM.", diag: "Vazamento ou superaquecimento destroem o circuito lógico. Trocamos sensores de pressão e atuadores queimados na PCB." },
    { id: "cambio-atuador", slug_prefix: "reparo-atuador-cambio", cat: "reparo-modulo-cambio", titulo: "Reparo CI Atuador Embreagem {MODELO} {PREP} {CIDADE}", meta: "Tranco e falha de embreagem no {MODELO}? Conserto eletrônico dos drivers atuadores com envio para {CIDADE}.", h1: "Conserto Drivers Atuadores de Câmbio {MODELO} {PREP} {CIDADE}", sintoma: "Carro dá tranco, não reconhece posição da embreagem.", diag: "Queima dos CIs controladores de corrente dos motores da embreagem. Substituímos o encapsulamento de potência via microssolda." }
];

const loteMaster = [];
let totalPaginas = 0;

modulos.forEach(modelo => {
    cidades.forEach(cidade => {
        const prep = getPreposicao(cidade);
        const modLimpo = limparNome(modelo);
        const cidadeLimpa = limparNome(cidade);

        defeitos.forEach(def => {
            // Filtro Exclusivo: Módulos de Câmbio não cruzam com injeção
            if (modelo.includes("Câmbio") && ["sem-pulso", "immo-off", "acelerador", "processador"].includes(def.id)) {
                return; 
            }
            // Filtro Exclusivo: Módulos de Injeção não cruzam com câmbio
            if (!modelo.includes("Câmbio") && ["cambio-dsg", "cambio-atuador"].includes(def.id)) {
                return; 
            }

            totalPaginas++;
            
            loteMaster.push({
                slug: `${def.slug_prefix}-${modLimpo}-${cidadeLimpa}`,
                categoria: def.cat,
                titulo_seo: def.titulo.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{CIDADE}', cidade) + " | Smartboard Lab",
                meta_desc: def.meta.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{CIDADE}', cidade),
                h1: def.h1.replace('{MODELO}', modelo).replace('{PREP}', prep).replace('{CIDADE}', cidade),
                cidade: cidade,
                modelo: modelo,
                sintoma: def.sintoma,
                texto_diagnostico: def.diag
            });
        });
    });
});

const primeiroLote = loteMaster.slice(0, 10000);

fs.writeFileSync('matriz_automotiva_lote1.json', JSON.stringify(primeiroLote, null, 2));

console.log('--- COMPILAÇÃO AUTOMOTIVA CONCLUÍDA ---');
console.log(`Malha Teórica Total de Combinações: ${totalPaginas}`);
console.log(`Lote exportado para o arquivo (Corte Exato): ${primeiroLote.length} URLs.`);
console.log(`Arquivo salvo como: matriz_automotiva_lote1.json`);