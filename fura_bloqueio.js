const { execSync } = require('child_process');

console.log("R2-D2: A iniciar protocolo de injeção blindada (Correção de pilha de commits)...");

try {
    // 1. Descobre a branch atual (normalmente 'main' ou 'master')
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    
    console.log(`[1/3] A sincronizar com o GitHub na branch '${branch}'...`);
    execSync('git fetch origin');
    
    // 2. A MAGIA: Apaga todos os commits locais que falharam no envio,
    // mas MANTÉM todos os ficheiros intactos no disco da sua máquina.
    execSync(`git reset origin/${branch}`);
} catch (e) {
    console.log("Aviso: Falha ao sincronizar o histórico. A continuar...");
}

console.log("[2/3] A mapear ficheiros pendentes...");
let status = execSync('git status --porcelain').toString();
let files = status.split('\n')
    .filter(line => line.trim().length > 0 && line.match(/^[AM?]/))
    .map(line => line.replace(/^.. /, '').replace(/^"|"$/g, '').trim());

if (files.length === 0) {
    console.log("Nenhum ficheiro pendente. O chassi já está sincronizado.");
    process.exit(0);
}

// Lotes microscópicos para garantir a passagem sem falhas HTTP
const LOTE = 100;
const TOTAL_LOTES = Math.ceil(files.length / LOTE);

console.log(`[3/3] Encontrados ${files.length} ficheiros. A iniciar envio em ${TOTAL_LOTES} lotes...\n`);

for (let i = 0; i < files.length; i += LOTE) {
    const chunk = files.slice(i, i + LOTE);
    const numeroLote = Math.floor(i / LOTE) + 1;
    
    console.log(`>>> A preparar Lote ${numeroLote} de ${TOTAL_LOTES} (${chunk.length} ficheiros)...`);
    
    try {
        // Adiciona de 50 em 50 para evitar erro de limite de memória no terminal
        for (let j = 0; j < chunk.length; j += 50) {
            const addChunk = chunk.slice(j, j + 50);
            const fileArgs = addChunk.map(f => `"${f}"`).join(' ');
            execSync(`git add ${fileArgs}`);
        }
        
        execSync(`git commit -m "SEO Lote ${numeroLote}"`);
        console.log(`    A enviar Lote ${numeroLote} para o servidor...`);
        execSync('git push origin HEAD');
        console.log(`    [OK] Lote ${numeroLote} recebido com sucesso!\n`);
        
    } catch (error) {
        console.error(`\n[ERRO CRÍTICO] A ligação ao GitHub caiu durante o Lote ${numeroLote}.`);
        console.error("A interromper o script para evitar acumulação de commits defeituosos.");
        console.error("-> Volte a executar 'node fura_bloqueio.js'. O motor irá limpar este commit incompleto e tentar apenas este lote novamente do zero.");
        process.exit(1);
    }
}

console.log("Transmissão 100% concluída. A malha programática está totalmente online.");