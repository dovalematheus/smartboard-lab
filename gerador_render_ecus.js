const fs = require('fs');
const path = require('path');

// 1. Lê os dados EXCLUSIVOS do lote automotivo
const rawData = fs.readFileSync('matriz_automotiva_lote1.json');
const paginas = JSON.parse(rawData);

// LÊ O NOVO TEMPLATE EXCLUSIVO PARA ECUs
const template = fs.readFileSync('template_ecu.html', 'utf8');

// 2. Diretório raiz
const outputDir = __dirname; 

// 3. Lê o banco de imagens (FILTRO EXCLUSIVO AUTOMOTIVO)
const assetsDir = path.join(__dirname, 'assets');
let imagensDisponiveis = [];
if (fs.existsSync(assetsDir)) {
    // Puxa APENAS imagens JPG que comecem com "ecu-"
    imagensDisponiveis = fs.readdirSync(assetsDir).filter(file => 
        (file.endsWith('.jpg') || file.endsWith('.jpeg')) && file.startsWith('ecu-')
    );
}

// Fallback de segurança
if (imagensDisponiveis.length === 0) {
    imagensDisponiveis = ['placeholder-automotivo.jpg'];
}

console.log(`R2-D2: Compilando malha automotiva e gerando Sitemap isolado...\n`);

// 4. Regra de Gramática para o Template
function getPreposicao(cidade) {
    const no = ["Rio de Janeiro", "Rio Grande"];
    const na = ["Serra", "Cariacica", "Campina Grande", "Várzea Grande", "Luziânia"];
    if (no.includes(cidade)) return "no";
    if (na.includes(cidade)) return "na";
    return "em";
}

// 5. INICIA A CONSTRUÇÃO DO SITEMAP XML (Isolado)
let sitemapXML = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemapXML += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// 5.1 Hubs de Serviço Automotivo
const hubs = ['reparo-modulo-injecao', 'reparo-modulo-cambio'];
hubs.forEach(hub => {
    sitemapXML += `  <url>\n    <loc>https://smartboardlab.com.br/${hub}/</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
});

// 6. Gera as Páginas e insere no Sitemap Automotivo
paginas.forEach(pagina => {
    let htmlFinal = template;
    const imagemSorteada = imagensDisponiveis[Math.floor(Math.random() * imagensDisponiveis.length)];
    const prep = getPreposicao(pagina.cidade);

    // Substituições do Template ECU
    htmlFinal = htmlFinal.replace(/{{SLUG}}/g, pagina.slug);
    htmlFinal = htmlFinal.replace(/{{TITULO_SEO}}/g, pagina.titulo_seo);
    htmlFinal = htmlFinal.replace(/{{META_DESC}}/g, pagina.meta_desc);
    htmlFinal = htmlFinal.replace(/{{H1}}/g, pagina.h1);
    htmlFinal = htmlFinal.replace(/{{BAIRRO}}/g, pagina.cidade); 
    htmlFinal = htmlFinal.replace(/{{PREP}}/g, prep); 
    htmlFinal = htmlFinal.replace(/{{MODELO}}/g, pagina.modelo);
    htmlFinal = htmlFinal.replace(/{{SINTOMA}}/g, pagina.sintoma);
    htmlFinal = htmlFinal.replace(/{{TEXTO_DIAGNOSTICO}}/g, pagina.texto_diagnostico);
    
    // Ajuste da imagem
    htmlFinal = htmlFinal.replace(/assets\/{{IMAGEM_AUTOMATICA}}/g, `../assets/${imagemSorteada}`);

    // 6.1 Cria a pasta da Categoria na raiz
    const categoriaDir = path.join(outputDir, pagina.categoria);
    if (!fs.existsSync(categoriaDir)){
        fs.mkdirSync(categoriaDir);
    }

    // 6.2 Salva o arquivo HTML fisicamente
    const fileName = `${pagina.slug}.html`;
    const filePath = path.join(categoriaDir, fileName);
    fs.writeFileSync(filePath, htmlFinal, 'utf8');
    
    // 6.3 Injeção no Sitemap Automotivo
    sitemapXML += `  <url>\n    <loc>https://smartboardlab.com.br/${pagina.categoria}/${pagina.slug}.html</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
});

// 7. Fecha e Salva o Sitemap Exclusivo
sitemapXML += `</urlset>`;
fs.writeFileSync(path.join(outputDir, 'sitemap_ecus_lote1.xml'), sitemapXML, 'utf8');

console.log(`[+] Renderização do lote automotivo concluída com sucesso.`);
console.log(`[+] Isolamento garantido: O arquivo 'sitemap_ecus_lote1.xml' foi gerado utilizando 'template_ecu.html'.`);