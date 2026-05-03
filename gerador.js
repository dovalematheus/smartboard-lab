const fs = require('fs');
const path = require('path');

// 1. Lê os dados
const rawData = fs.readFileSync('data.json');
const paginas = JSON.parse(rawData);
const template = fs.readFileSync('template.html', 'utf8');

// 2. Prepara a pasta de saída
const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir);
}

// 3. Lê o banco de imagens
const assetsDir = path.join(__dirname, 'assets');
let imagensDisponiveis = [];
if (fs.existsSync(assetsDir)) {
    imagensDisponiveis = fs.readdirSync(assetsDir).filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));
}
if (imagensDisponiveis.length === 0) {
    imagensDisponiveis = ['placeholder.jpg'];
}

console.log(`R2-D2: Gerando páginas em subpastas e compilando Sitemap Matemático...\n`);

// 4. INICIA A CONSTRUÇÃO DO SITEMAP XML
let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapXML += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// 4.1 Prioridade Máxima (Home)
sitemapXML += `  <url>\n    <loc>https://smartboardlab.com.br/</loc>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

// 4.2 Hubs de Serviço (O Meio do Silo)
const hubs = ['reparo-placa-iphone', 'reparo-face-id', 'reparo-macbook', 'troca-vidro-traseiro', 'troca-vidro-iphone', 'recuperacao-dados'];
hubs.forEach(hub => {
    sitemapXML += `  <url>\n    <loc>https://smartboardlab.com.br/${hub}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
});

// 5. Gera as Páginas e insere no Sitemap
paginas.forEach(pagina => {
    let htmlFinal = template;
    const imagemSorteada = imagensDisponiveis[Math.floor(Math.random() * imagensDisponiveis.length)];

    htmlFinal = htmlFinal.replace(/{{SLUG}}/g, pagina.slug);
    htmlFinal = htmlFinal.replace(/{{TITULO_SEO}}/g, pagina.titulo_seo);
    htmlFinal = htmlFinal.replace(/{{META_DESC}}/g, pagina.meta_desc);
    htmlFinal = htmlFinal.replace(/{{H1}}/g, pagina.h1);
    htmlFinal = htmlFinal.replace(/{{BAIRRO}}/g, pagina.bairro);
    htmlFinal = htmlFinal.replace(/{{MODELO}}/g, pagina.modelo);
    htmlFinal = htmlFinal.replace(/{{SINTOMA}}/g, pagina.sintoma);
    htmlFinal = htmlFinal.replace(/{{TEXTO_DIAGNOSTICO}}/g, pagina.texto_diagnostico);
    
    // Ajuste fino: como a página agora fica dentro de uma pasta, a imagem precisa voltar um nível (../assets/)
    htmlFinal = htmlFinal.replace(/assets\/{{IMAGEM_AUTOMATICA}}/g, `../assets/${imagemSorteada}`);

    // 5.1 Cria a pasta da Categoria se não existir
    const categoriaDir = path.join(outputDir, pagina.categoria);
    if (!fs.existsSync(categoriaDir)){
        fs.mkdirSync(categoriaDir);
    }

    // 5.2 Salva o arquivo DENTRO da subpasta
    const fileName = `${pagina.slug}.html`;
    const filePath = path.join(categoriaDir, fileName);
    fs.writeFileSync(filePath, htmlFinal, 'utf8');
    
    // 5.3 Adiciona no Sitemap com o caminho absoluto das pastas
    sitemapXML += `  <url>\n    <loc>https://smartboardlab.com.br/${pagina.categoria}/${pagina.slug}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
});

// 6. Fecha e Salva o Sitemap
sitemapXML += `</urlset>`;
fs.writeFileSync(path.join(outputDir, 'sitemap.xml'), sitemapXML, 'utf8');

console.log(`[+] Páginas organizadas fisicamente nas pastas de categorias.`);
console.log(`[+] Arquivo sitemap.xml gerado.`);