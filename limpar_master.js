const fs = require('fs');

// 1. Lê a matriz nova que você acabou de gerar (11.025 rotas)
let masterData = JSON.parse(fs.readFileSync('placas_master.json', 'utf8'));

// 2. Lê as rotas que já estão ativas no servidor
let oficialData = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// 3. Cria um mapa (Set) com os slugs que já estão no ar para busca ultrarrápida
const slugsNoAr = new Set(oficialData.map(rota => rota.slug));

console.log(`Rotas na matriz nova: ${masterData.length}`);
console.log(`Rotas já injetadas no servidor: ${slugsNoAr.size}`);

// 4. Filtra a matriz master: mantém apenas o que AINDA NÃO está no ar
const masterLimpo = masterData.filter(rota => !slugsNoAr.has(rota.slug));

// 5. Salva a matriz master pronta para as injeções dos próximos dias
fs.writeFileSync('placas_master.json', JSON.stringify(masterLimpo, null, 2));

console.log(`--- LIMPEZA CONCLUÍDA ---`);
console.log(`Foram removidas ${masterData.length - masterLimpo.length} rotas duplicadas.`);
console.log(`O placas_master.json agora tem ${masterLimpo.length} rotas virgens aguardando injeção.`);