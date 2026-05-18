const fs = require('fs');

const ARQUIVO_MESTRE = 'placas_master.json';
const ARQUIVO_OFICIAL = 'data.json';
const QUANTIDADE_DIARIA = 300;

try {
    // Verifica se a matriz mestre existe
    if (!fs.existsSync(ARQUIVO_MESTRE)) {
        console.error(`ERRO: O arquivo ${ARQUIVO_MESTRE} não foi encontrado. Rode o gerador_placas.js primeiro.`);
        process.exit(1);
    }

    // Lê os dados
    let masterData = JSON.parse(fs.readFileSync(ARQUIVO_MESTRE, 'utf8'));
    let oficialData = JSON.parse(fs.readFileSync(ARQUIVO_OFICIAL, 'utf8'));

    // Verifica se ainda tem carga na matriz
    if (masterData.length === 0) {
        console.log("MISSÃO CUMPRIDA: O arquivo master está vazio. Todas as 11.025 páginas de placa já foram injetadas!");
        process.exit(0);
    }

    // Recorta a dosagem exata do dia (até 300)
    const loteDeHoje = masterData.splice(0, QUANTIDADE_DIARIA);

    // Injeta no final do arquivo oficial
    const dataFinal = [...oficialData, ...loteDeHoje];

    // Salva as alterações nos dois arquivos
    fs.writeFileSync(ARQUIVO_OFICIAL, JSON.stringify(dataFinal, null, 2));
    fs.writeFileSync(ARQUIVO_MESTRE, JSON.stringify(masterData, null, 2));

    console.log('--- INJEÇÃO DIÁRIA CONCLUÍDA COM SUCESSO ---');
    console.log(`Carga injetada: ${loteDeHoje.length} novas páginas de placa.`);
    console.log(`Total do barramento online agora: ${dataFinal.length} páginas.`);
    console.log(`Restam na reserva (${ARQUIVO_MESTRE}): ${masterData.length} páginas.`);
    console.log('\nPróximo passo: Rode seu script gerador de HTML e suba para o GitHub!');

} catch (err) {
    console.error('Erro crítico durante a injeção:', err);
}