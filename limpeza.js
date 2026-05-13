const fs = require('fs');

const arquivoOriginal = 'data.json';
const arquivoBackup = 'data_backup.json';

try {
    // 1. Criação do backup de segurança térmico
    fs.copyFileSync(arquivoOriginal, arquivoBackup);
    console.log(`[+] Backup gerado com sucesso: ${arquivoBackup}`);

    // 2. Leitura do barramento de dados
    const data = JSON.parse(fs.readFileSync(arquivoOriginal, 'utf8'));
    const totalOriginal = data.length;

    // 3. Filtragem de duplicatas usando o slug como chave primária
    const unicos = [];
    const slugsVistos = new Set();

    for (const item of data) {
        if (!slugsVistos.has(item.slug)) {
            unicos.push(item);
            slugsVistos.add(item.slug);
        }
    }

    const totalLimpo = unicos.length;
    const duplicatasRemovidas = totalOriginal - totalLimpo;

    // 4. Gravação do novo array limpo no arquivo original
    fs.writeFileSync(arquivoOriginal, JSON.stringify(unicos, null, 2), 'utf8');

    // 5. Telemetria final
    console.log(`\n✅ CIRCUITO LIMPO COM SUCESSO!`);
    console.log(`=> Registros totais antes da varredura: ${totalOriginal}`);
    console.log(`=> Duplicatas obliteradas: ${duplicatasRemovidas}`);
    console.log(`=> Matriz final gravada no data.json: ${totalLimpo} rotas únicas.`);

} catch (error) {
    console.error(`[!] Falha crítica no barramento:`, error.message);
}