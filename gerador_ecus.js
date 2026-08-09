const fs = require('fs');

// 1. Módulos Premium e de Alto Volume (Alto Ticket)
const modulos = [
    // Linha Leve Premium & Câmbios (Ticket Altíssimo)
    "Módulo Câmbio DSG DQ200 (Audi/VW)", "Módulo Câmbio DSG DQ250", 
    "Módulo Câmbio Powershift TCM", "ECU Bosch MED17 (BMW/Audi)", 
    "ECU Continental SIMOS (Land Rover/VW)", "ECU Bosch MEV17 (Mini/Peugeot)",
    
    // Linha Leve Crônica (Volume e Giro Rápido)
    "ECU Magneti Marelli 9GF (Fiat/Jeep)", "ECU Magneti Marelli 10GF", 
    "ECU Bosch ME7.5.30 (VW)", "ECU ACDelco E83 (GM)", 
    "ECU Delphi MT27E"
];

// 2. Cidades com Alto Poder de Compra + Pólos Logísticos + Curitiba
const cidades = [
    // Base Operacional
    "Curitiba",
    // Paraná (Eixo Logístico)
    "Londrina", "Maringá", "Cascavel", "Ponta Grossa", "Foz do Iguaçu",
    // São Paulo (Maior Frota Premium)
    "São Paulo", "Campinas", "Ribeirão Preto", "São José do Rio Preto", "Sorocaba", "Santos", "Jundiaí", "Piracicaba", "Bauru",
    // Santa Catarina e Rio Grande do Sul
    "Florianópolis", "Joinville", "Blumenau", "Balneário Camboriú", "Chapecó",
    "Porto Alegre", "Caxias do Sul", "Passo Fundo", "Pelotas",
    // Centro-Oeste e Sudeste Extendido (Forte em Pickups e SUVs)
    "Belo Horizonte", "Uberlândia", "Goiânia", "Brasília", "Cuiabá", "Rondonópolis", "Sorriso", "Sinop"
];

// 3. Regra de Gramática para Cidades
function getPreposicao(cidade) {
    const no = ["Rio de Janeiro"];
    const em = ["Curitiba", "São Paulo", "Campinas", "Ribeirão Preto", "São José do Rio Preto", "Sorocaba", "Santos", "Jundiaí", "Piracicaba", "Bauru", "Florianópolis", "Joinville", "Blumenau", "Balneário Camboriú", "Chapecó", "Porto Alegre", "Caxias do Sul", "Passo Fundo", "Pelotas", "Belo Horizonte", "Uberlândia", "Goiânia", "Brasília", "Cuiabá", "Rondonópolis", "Sorriso", "Sinop", "Londrina", "Maringá", "Cascavel", "Ponta Grossa", "Foz do Iguaçu"];
    if (no.includes(cidade)) return "no";
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
    { 
        id: "falha-can", 
        slug_prefix: "reparo-falha-comunicacao-can", 
        cat: "reparo-modulo-injecao", 
        titulo: "Conserto Falha Comunicação Rede CAN {MODELO} {PREP} {CIDADE}", 
        meta: "Scanner acusa erro U0100 ou falha na rede CAN no {MODELO}? Laboratório especialista repara o barramento de dados e transceivers com envio para {CIDADE}.", 
        h1: "Reparo de Comunicação Rede CAN {MODELO} {PREP} {CIDADE}", 
        sintoma: "Erro U0100, painel com luzes acesas, scanner não entra no módulo, perda de comunicação com ABS/Câmbio.", 
        diag: "Utilizamos osciloscópio digital para rastrear o sinal diferencial CAN-H e CAN-L direto nos pinos. A falha costuma isolar o processador. Realizamos a troca do CI Transceiver da rede, restabelecendo a conversa do módulo com o restante do veículo." 
    },
    { 
        id: "immo-off", 
        slug_prefix: "reparo-imobilizador-bloqueado", 
        cat: "reparo-modulo-injecao", 
        titulo: "Desbloqueio e Reparo Imobilizador {MODELO} {PREP} {CIDADE}", 
        meta: "Carro não dá partida e luz do code piscando? Reparo de software, clonagem e Immo-Off para {MODELO} atendendo oficinas {PREP} {CIDADE}.", 
        h1: "Reparo de Imobilizador e Clonagem {MODELO} {PREP} {CIDADE}", 
        sintoma: "Motor vira mas não pega, luz de cadeado acesa no painel, Erro P160A ou P0513 de chave não reconhecida.", 
        diag: "Arquivos corrompidos na EEPROM bloqueiam a ignição. Lemos a memória do processador em bancada usando programadores via protocolo BDM/JTAG. Reparamos o arquivo hexadecimal ou efetuamos a clonagem completa para uma placa doadora." 
    },
    { 
        id: "sem-pulso", 
        slug_prefix: "conserto-falha-ignicao-injetor", 
        cat: "reparo-modulo-injecao", 
        titulo: "Reparo Sem Pulso Bico e Bobina {MODELO} {PREP} {CIDADE}", 
        meta: "Falta de pulso na bobina de ignição ou bico injetor no {MODELO}? Troca de drivers de potência IGBT da centralina com logística para {CIDADE}.", 
        h1: "Conserto de Pulso de Ignição e Injeção {MODELO} {PREP} {CIDADE}", 
        sintoma: "Motor falhando cilindro (Misfire P0300), ausência de pulso negativo no bico (P0201) ou bobina derretendo.", 
        diag: "Queima dos transistores de potência (IGBT/Mosfet) responsáveis por chavear o terra das bobinas e injetores. Substituímos os drivers de potência queimados utilizando estação de solda de alta capacidade, garantindo o chaveamento perfeito dos atuadores sob carga." 
    },
    { 
        id: "cambio-dsg", 
        slug_prefix: "reparo-placa-mecatronica-cambio", 
        cat: "reparo-modulo-cambio", 
        titulo: "Conserto Placa Mecatrônica Câmbio {MODELO} {PREP} {CIDADE}", 
        meta: "Câmbio travando marcha ou sem engatar no {MODELO}? Reparo da placa mecatrônica (TCM) em nível de componente atendendo frotas {PREP} {CIDADE}.", 
        h1: "Reparo da Placa Mecatrônica TCM {MODELO} {PREP} {CIDADE}", 
        sintoma: "Erro P189C (Pressão insuficiente), perda de marchas ímpares ou pares, falha de comunicação com o módulo da transmissão.", 
        diag: "Vazamento de fluido ou superaquecimento destroem o circuito lógico do câmbio. Refazemos as trilhas rompidas nos sensores de pressão e trocamos os atuadores queimados na PCB, realizando a clonagem de software se o hardware estiver irrecuperável." 
    },
    { 
        id: "acelerador", 
        slug_prefix: "reparo-corpo-borboleta-ecu", 
        cat: "reparo-modulo-injecao", 
        titulo: "Reparo Acelerador Eletrônico ECU {MODELO} {PREP} {CIDADE}", 
        meta: "Carro não acelera e acende luz EPC? Conserto do circuito do corpo de borboleta (TBI) na {MODELO} com atendimento rápido {PREP} {CIDADE}.", 
        h1: "Conserto do Circuito Acelerador Eletrônico {MODELO} {PREP} {CIDADE}", 
        sintoma: "Pedal sem resposta, motor em modo de emergência, Erro P2101 ou P2118 no atuador do acelerador eletrônico.", 
        diag: "O driver Ponte H (motor driver) na placa, responsável por abrir a borboleta de admissão, entra em curto. Realizamos a substituição microscópica do CI conversor e aferimos a integridade do circuito de 5V dos potenciômetros." 
    }
];

const loteMaster = [];
let totalPaginas = 0;

modulos.forEach(modelo => {
    cidades.forEach(cidade => {
        const prep = getPreposicao(cidade);
        const modLimpo = limparNome(modelo);
        const cidadeLimpa = limparNome(cidade);

        defeitos.forEach(def => {
            // Regra de exclusão: Não gerar reparo de bico/ignição para módulos de Câmbio DSG/Powershift
            if (modelo.includes("Câmbio") && (def.id === "sem-pulso" || def.id === "immo-off" || def.id === "acelerador")) {
                return; // Pula a iteração
            }
            // Regra de exclusão: Não gerar defeito de câmbio para módulos ECU de motor
            if (!modelo.includes("Câmbio") && def.id === "cambio-dsg") {
                return; // Pula a iteração
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

// Fração de Lote: Gerar apenas os primeiros 10.000 para o deploy semanal
const primeiroLote = loteMaster.slice(0, 10000);

fs.writeFileSync('matriz_automotiva_lote1.json', JSON.stringify(primeiroLote, null, 2));

console.log('--- COMPILAÇÃO AUTOMOTIVA CONCLUÍDA ---');
console.log(`Malha Teórica Total de Combinações: ${totalPaginas}`);
console.log(`Lote exportado para o arquivo (Corte de Segurança Google): ${primeiroLote.length} URLs.`);
console.log(`Arquivo salvo como: matriz_automotiva_lote1.json`);