import fs from "fs";
import puppeteer from 'puppeteer';
import { fileURLToPath } from "url";
import path from "path";
 

const localhost = " http://10.0.0.156:5173/";
const url = `${localhost}`;
// Obtener __dirname usando ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "./pre-build/index.html");
const jsonPath = path.join(__dirname, "./dev/locales/universal.json");

//const supportedLanguages = ["en", "es"];  // Idiomas soportados

console.log("wait...");


// Validar si el archivo JSON existe - si no, terminar
if (!fs.existsSync(jsonPath)) {
  console.error("\x1b[31mError:\x1b[0m The JSON file does not exist at:", jsonPath);
  process.exit(1);
} else {
  console.log(`\x1b[34mInfo:\x1b[0m Language JSON file: ${jsonPath}: ` + "\x1b[32mOK\x1b[0m");
}


// Leer el archivo JSON
const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
const { metadata, ...translations } = rawData;

// Obtener el idioma predeterminado y los idiomas disponibles
const fallbackLanguage = metadata.file.fallbackLanguage || "en";
const supportedLanguages = Object.keys(translations);
console.log(`\x1b[34mInfo:\x1b[0m Default language is: ${fallbackLanguage}`);
console.log(`\x1b[34mInfo:\x1b[0m Supported languages in .json: [${supportedLanguages.join(", ")}]`);


validateHtmlRedirectsWithPuppeteer(supportedLanguages);

async function validateHtmlRedirectsWithPuppeteer(supportedLanguages) {
let allHrefTags = false;
let count = 0;
let countAll = 0;
let langsCount = supportedLanguages.length;
  try {
    // Leer el contenido del archivo HTML
    const htmlContent = fs.readFileSync(filePath, 'utf-8');

    // Validar etiquetas <link rel="alternate" hreflang="...">
    const hreflangRegex = /<link\s+rel="alternate"\s+href="([^"]+)"\s+hreflang="([^"]+)"\s*\/?>/gi;
    const foundLanguages = new Set();
    let hasDefault = false;

    let match;
    while ((match = hreflangRegex.exec(htmlContent)) !== null) {
      const hreflang = match[2];
      if (supportedLanguages.includes(hreflang)) {
        foundLanguages.add(hreflang);
      }
      if (hreflang === 'x-default') {
        hasDefault = true;
      }
    }

    // Verificar si faltan etiquetas hreflang
    const missingLanguages = supportedLanguages.filter(lang => !foundLanguages.has(lang));
    if (missingLanguages.length > 0) {
      console.log(`\x1b[33mWarning:\x1b[0m Missing hreflang tags for the following languages: ${missingLanguages.join(', ')}`);
    } else {
      console.log("\x1b[32mOk: \x1b[0m" + `Hreflang tags for all languages found.`);
      allHrefTags = true;
    }

    if (!hasDefault) {
      console.log(`\x1b[33mWarning:\x1b[0m Missing hreflang tag with x-default.`);
    } else {
      console.log("\x1b[32mOk: \x1b[0m" + `Hreflang tag with x-default found.`);
    }

  } catch (error) {
    console.log(`\x1b[31mError:\x1b[0m Failed to test redirections: ${error.message}`);
  }

  // Probar redirecciones dinámicamente
  console.log("----------------------------------------------------------------------------");
  console.log('Testing dynamic redirections...');
  console.log('Wait...');
  for (const lang of supportedLanguages) {
     
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--lang=${lang}`] // Configura el idioma del navegador
    });



    try {

      const page = await browser.newPage();
       // Desactivar la caché del navegador
      await page.setCacheEnabled(false);

      await page.setExtraHTTPHeaders({
        'Accept-Language': lang  
      });

      await page.evaluateOnNewDocument((lang) => {
        Object.defineProperty(navigator, 'language', { get: () => lang });
        Object.defineProperty(navigator, 'languages', { get: () => [lang] });
      }, lang);

      
      // Cargar la URL inicial
      const fileUrl = url;

      // Configurar el idioma del navegador
      const detectedLanguage = await page.evaluate(() => {
        return navigator.language || navigator.userLanguage;
      });
      console.log(`[${(countAll+1)}/${(langsCount)}] Setting browser language to: ${detectedLanguage}`);

      // Esperar a que ocurra la navegación/redirección
      await Promise.all([
        page.goto(fileUrl, { waitUntil: 'networkidle0' }),
        page.waitForNavigation({ waitUntil: 'networkidle0' }) // Espera explícita a la redirección
      ]);

      // Obtener la URL final después de la redirección
      const finalUrl = page.url();

      // Verificar si la redirección fue exitosa
      if (finalUrl.includes(`${lang}/`)) {
        console.log("\x1b[32m✓ Redirection successful for language:\x1b[0m" + ` ${lang}`);

        // Verificar el código de estado HTTP
        const response = await page.goto(finalUrl, { waitUntil: 'networkidle0' });
        const statusCode = response.status();

        if (statusCode >= 200 && statusCode < 300) {
          console.log(`\x1b[32m✓ Page exists and is valid for language:\x1b[0m ${lang}`);
          count++;
        } else {
          console.log(`\x1b[31m✗ Page not found or invalid for language:\x1b[0m ${lang} (Status Code: ${statusCode})`);
        }
      } else {
        console.log(`\x1b[31m✗ Redirection failed for language:\x1b[0m  ${lang}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      await browser.close();
      countAll++;
    }
  }

  console.log("----------------------------------------------------------------------------");
  if(allHrefTags && langsCount ===  count){
    console.log(`\x1b[32m✓\x1b[0m Everything is Ok`);
  }else if (langsCount === count){
    console.log(`\x1b[32m✓\x1b[0m All suported languages has valid redirections pages`);
    console.log(`\x1b[33m⚠\x1b[0m \x1b[30mCheck Hreflang tags for all languages in /pre-build/index.html\x1b[0m`);
  }


}