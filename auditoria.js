const fs = require('fs');

// Carrega o banco de dados
const data = JSON.parse(fs.readFileSync('data.json', 'utf8'));

// Extrai apenas as URLs (slugs)
const slugs = data.map(page => page.slug);

// Filtra quem aparece mais de uma vez
const duplicates = slugs.filter((item, index) => slugs.indexOf(item) !== index);
const uniqueDuplicates = [...new Set(duplicates)];

if (uniqueDuplicates.length > 0) {
    console.log(`⚠️ ALERTA: Foram encontradas ${uniqueDuplicates.length} páginas repetidas:`);
    console.log(uniqueDuplicates);
} else {
    console.log(`✅ CIRCUITO LIMPO: O data.json contém ${slugs.length} páginas únicas. Nenhuma duplicidade encontrada.`);
}