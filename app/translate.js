import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline";
import { JSDOM } from "jsdom";


// Obtener __dirname usando ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(`Dirname___________>  ${__dirname}`);

// Inicio del tiempo de ejecución
const startTime = Date.now();

// Rutas principales
const jsonPath = path.join(__dirname, "./dev/locales/universal.json");
const devDir = path.join(__dirname, "./dev/pages");  //directorio de HTMLs para traducir
const preBuildDir = path.join(__dirname, "./pre-build");

const indexAppPath = path.join(__dirname, "index.html");


// Configuración inicial para copia
const sourceDir = path.join(__dirname, "./dev");; // Ruta de origen
const targetDir = preBuildDir; // Ruta de destino
const formatsToIgnore = ['.html', '.log', '.tmp']; // Extensiones de archivo a omitir
const foldersToIgnore = ['locales', 'pages']; // Carpetas a omitir
const overwrite = true; //  true, sobreescribe siempre
const redirectStrict = true; //crea redireccion en cada archivo * !unset
//> 

console.log(`\x1b[36m-------------------------------------------------------------------------------------------------\x1b[0m`);
console.log(`\x1b[36m------[dev → pre-build]--------------------------------------------------------------------------\x1b[0m`);
console.log(`\x1b[36m-------------------------------------------------------------------------------------------------\x1b[0m`);


// Función para copiar todo los archivos de /dev a /pre-build, 
async function copyDirectoryStructure() {
  try {
    console.log(`\x1b[34mInfo:\x1b[0m Starting directory copy...`);
    console.log(`\x1b[34mInfo:\x1b[0m Overwrite: \x1b[36m ${overwrite} \x1b[0m`);
    console.log(`      \x1b[30mFrom:\x1b[0m ${sourceDir}`);
    console.log(`      \x1b[30mTo:\x1b[0m ${targetDir}`);
    await copyDir(sourceDir, targetDir);
    console.log("\x1b[32m✓\x1b[0m Directory copy completed successfully");
  } catch (error) {
    console.error('Error during directory copy:', error.message);
  }
}

// Función recursiva para copiar directorios y archivos
async function copyDir(src, dest) {

  // Leer el contenido del directorio de origen
  // console.log(`      \x1b[30mFrom:\x1b[0m ${src}`);
  // console.log(`      \x1b[30mTo:\x1b[0m ${dest}`);
  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    // Ignorar carpetas específicas
    if (foldersToIgnore.includes(item)) {

      console.log(`      \x1b[30mSkipping folder:\x1b[0m	${item}`);
      continue;
    }

    // Obtener estadísticas del elemento
    const stats = fs.statSync(srcPath);

    if (stats.isDirectory()) {
      // Si es un directorio, crearlo en el destino y copiar recursivamente
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
        // console.log(`\x1b[34mInfo:\x1b[0m \x1b[30mCreated directory:\x1b[0m	${destPath}`);
      }
      await copyDir(srcPath, destPath); // Copiar contenido del directorio
    } else if (stats.isFile()) {
      // Si es un archivo, verificar si debe ser ignorado o sobrescrito
      const fileExtension = path.extname(item).toLowerCase();

      if (formatsToIgnore.includes(fileExtension)) {
        console.log(`      \x1b[30mSkipping file (ignored format):\x1b[0m ${item}`);
        continue;
      }

      if (fs.existsSync(destPath) && !overwrite) {
        //console.log(`      \x1b[30mSkipping file (already exists):\x1b[0m ${item}`);
        continue;
      }

      // Copiar el archivo
      fs.copyFileSync(srcPath, destPath);
      console.log(`\x1b[30mCopied file:\x1b[0m ${item}`);
      // console.log(`\x1b[32m ✓ \x1b[0m \x1b[30m	Copied file:\x1b[0m ${item}`);
    }
  }
}



// Validar si el archivo JSON existe - si no, terminar
if (!fs.existsSync(jsonPath)) {
  console.error("\x1b[31mError:\x1b[0m The JSON file does not exist at:", jsonPath);
  process.exit(1);
} else {
  console.log(`\x1b[34mInfo:\x1b[0m Language JSON file: ${jsonPath}: ` + "\x1b[32mOK\x1b[0m");
}


// Validar Carpeta DEV - si no terminar
if (!fs.existsSync(devDir)) {
  console.error("\x1b[31mError:\x1b[0m Dev folder does not exist at:", devDir);
  process.exit(1);
} else {
  console.log(`\x1b[34mInfo:\x1b[0m Dev Folder: /dev: ` + "\x1b[32mOK\x1b[0m");
}

// Crear la carpeta `pre-build` si no existe
if (!fs.existsSync(preBuildDir)) {
  fs.mkdirSync(preBuildDir);
  console.log("\x1b[32mCreated:\x1b[0m Folder: /pre-build");
} else {
  console.log(`\x1b[34mInfo:\x1b[0m Pre-Build Folder: /pre-build: ` + "\x1b[32mOK\x1b[0m");
}


// Leer el archivo JSON
const rawData = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
const { metadata, ...translations } = rawData;

// Obtener el idioma predeterminado y los idiomas disponibles
const fallbackLanguage = metadata.file.fallbackLanguage || "en";
const supportedLanguages = Object.keys(translations);
console.log(`\x1b[34mInfo:\x1b[0m Default language set to: ${fallbackLanguage}`);
console.log(`\x1b[34mInfo:\x1b[0m Supported languages in .json: [${supportedLanguages.join(", ")}]`);



// generar archivo de entrada pre-build/index.html
function generateRedirectHtml(supportedLanguages, defaultLang, titlePage) {
  // Generar las etiquetas <link rel="alternate" hreflang="...">
  const hreflangTags = supportedLanguages
    .map(
      (lang) =>
        `<link rel="alternate" href="${lang}/" hreflang="${lang}" />`
    )
    .join("\n");

  // Agregar una etiqueta adicional para la versión por defecto
  const defaultHreflang = `<link rel="alternate" href="${defaultLang}/" hreflang="x-default" />`;

  return `<!DOCTYPE html>
<html lang="${defaultLang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titlePage}</title>
  ${hreflangTags}
  ${defaultHreflang}
  <script>
    (() => {
      const userLang = navigator.language || navigator.userLanguage;
      const supported = ${JSON.stringify(supportedLanguages)};
      const defaultLang = '${defaultLang}';     
      const redirectLang = supported.find(lang => userLang.startsWith(lang)) || defaultLang;
      window.location.href = \`\${redirectLang}/\`;
    })();
  </script>
</head>
<body>
  <noscript>
    <p>JavaScript is required to automatically redirect you. Please choose your language:</p>
    <ul>
      ${supportedLanguages.map(lang => `<li><a href="${lang}/">${lang.toUpperCase()}</a></li>`).join('\n')}
    </ul>
  </noscript>
</body>
</html>`;
}









// Función para encontrar todos los archivos HTML en el árbol de directorios
function findHtmlFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);

  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(findHtmlFiles(filePath));
    } else if (path.extname(file) === ".html") {
      results.push(filePath);
    }
  });

  return results;
}


// Función para evaluar y almacenar las etiquetas personalizadas
function evaluateAndStoreLabels(html, filePath) {
  const labelsMap = {
    lk: [],
    labelLk: [],
    lkTextContent: [],
  };

  // Dividir el HTML en líneas
  const lines = html.split('\n');

  // Iterar sobre cada línea del HTML
  lines.forEach((line, lineNumber) => {
    const lineNum = lineNumber + 1; // Número de línea (1-based)

    //----------------- [ Evaluar etiquetas <lk> ]------------------------------- 
    const allLkTags = line.matchAll(/<lk\b[^>]*>(.*?)<\/lk>/g);
    const allBadClosedLkTags = line.matchAll(/<lk\b[^>]*>(?![^<]*<\/lk>)/g);



    // Procesar etiquetas <lk> correctamente cerradas
    for (const match of allLkTags) {
      const fullTag = match[0]; // Etiqueta completa <lk ...>...</lk>
      const attributes = match[1]; // Contenido dentro de la etiqueta

      // Validar que la etiqueta tenga un atributo 'k' con un valor no vacío
      const keyMatch = fullTag.match(/k="([^"]*)"/);
      const key = keyMatch ? keyMatch[1].trim() : null;

      if (!key) {
        console.error(
          `\x1b[31mError:\x1b[0m Missing or empty 'k' attribute in <lk> tag in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
        );
        process.exit(1);
      }

      // Validar que el contenido no contenga otras etiquetas HTML
      const content = match[1].trim();
      if (/<[^>]+>/.test(content)) {
        console.error(
          `\x1b[31mError:\x1b[0m Invalid content inside "<lk> ? </lk>" tag. Must be text, another  tags are not allowed. File: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
        );
        process.exit(1);
      }

      // Almacenar la coincidencia válida
      //  console.log(`Line: ${lineNum}, key: [${key}]; content: [${content}]`);
      labelsMap.lk.push({ key, content });
    }

    // Validar etiquetas mal cerradas
    for (const badTag of allBadClosedLkTags) {
      const fullTag = badTag[0]; // Etiqueta completa <lk ...>
      console.error(
        `\x1b[31mError:\x1b[0m Unclosed <lk> tag in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
      );
      process.exit(1);
    }







    //------------ [ Evaluar atributos label-lk-* ] -------------------------
    const labelLkTags = line.matchAll(/<([^>]*?)\s+label-lk-\w+-k="[^"]+"[^>]*>/g);

    for (const tagMatch of labelLkTags) {
      const fullTag = tagMatch[0]; // La etiqueta completa desde < hasta >

      // Buscar todos los atributos label-lk-* dentro de la etiqueta
      const labelLkMatchesInside = fullTag.matchAll(/\s+label-lk-(\w+)-k="([^"]+)"/g);

      for (const match of labelLkMatchesInside) {
        const attrName = match[1]; // Ejemplo: 'src' en label-lk-src-k
        const key = match[2]; // Ejemplo: 'image-portrait' en label-lk-src-k="image-portrait"

        // Validar que los atributos necesarios estén presentes
        if (!attrName || !key) {
          console.error(
            `\x1b[31mError:\x1b[0m Malformed label-lk-* attribute in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
          );
          process.exit(1);
        }

        // Almacenar la coincidencia válida
        // console.log(`Line: ${lineNum}, tag: [${fullTag}]; attrName: [${attrName}]; key: [${key}]`);
        labelsMap.labelLk.push({ tag: fullTag, attrName, key });
      }
    }










    //--------[ Evaluar atributos lk-text-content-k ]-------------------------------------------------
    const lkTextContentMatches = line.matchAll(/<([^>]*?)\s+lk-text-content-k="([^"]+)"[^>]*>/g);

    for (const match of lkTextContentMatches) {
      const fullTag = match[0]; // Etiqueta completa
      const key = match[2]; // Valor del atributo lk-text-content-k

      // Verificar que la etiqueta esté bien formada (comienza con < y termina con >)
      if (!/^<[^>]+>$/.test(fullTag)) {
        console.error(
          `\n\x1b[31mError:\x1b[0m Malformed HTML tag in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
        );
        process.exit(1);
      }

      // Verificar que el atributo lk-text-content-k="..." esté presente
      if (!key) {
        console.error(
          `\n\x1b[31mError:\x1b[0m Missing 'lk-text-content-k' attribute in file: ${filePath}. Line: ${lineNum}, Tag: ${fullTag}`
        );
        process.exit(1);
      }

      // Almacenar la coincidencia válida
      //console.log(`Line: ${lineNum}, tag: [${fullTag}]; key: [${key}]`);
      labelsMap.lkTextContent.push({ tag: fullTag, key });
    }

    //-------------------> end 




  });
  return labelsMap;
}






// Función para traducir y guardar archivos HTML
function translateAndSaveHtml(devPath, outputPath, lang, texts, fallbackLanguage, labelsMap) {
  let html = fs.readFileSync(devPath, "utf-8");


  //reemplazar el idioma del html
  html = html.replace(/<html\s+lang="[^"]*"/, `<html lang="${lang}"`);

  // Contar etiquetas personalizadas
  const totalLabels =
    labelsMap.lk.length + labelsMap.labelLk.length + labelsMap.lkTextContent.length;
  let processedLabels = 0;





  // ----------------- [Reemplazar etiquetas <lk> ] ----------------------------------------------

  labelsMap.lk.forEach(({ key, content }) => {


    // Obtener el valor traducido del JSON o usar el idioma predeterminado (fallback)
    const value = texts[`lk:${key}`] || translations[fallbackLanguage][`lk:${key}`];

    if (!value) {
      console.error(
        `\x1b[31mError:\x1b[0m Translation missing for key 'lk:${key}' in file: ${filePath}.`
      );
      process.exit(1);
    }

    // Construir una expresión regular para encontrar la etiqueta completa
    const regex = new RegExp(`<lk\\s+k="${key}"[^>]*>.*?</lk>`, "g");

    // Reemplazar la etiqueta completa con la versión modificada
    html = html.replaceAll(regex, `${value}`);

    processedLabels++;
    updateProgress(processedLabels, totalLabels, key);
  });



  // ----------------[ Reemplazar atributos label-lk-*]------------------------------
  labelsMap.labelLk.forEach(({ attrName, key }) => {
    // Obtener el valor traducido del JSON
    const value = texts[`label-lk-${attrName}:${key}`]; // Valor en el idioma actual
    const fallbackValue = translations[fallbackLanguage][`label-lk-${attrName}:${key}`]; // Valor en el idioma predeterminado

    // Verificar si la clave existe en el idioma actual
    if (!value) {
      if (fallbackValue) {
        console.warn(
          `\n\x1b[33mWarning:\x1b[0m Key 'label-lk-${attrName}:${key}' not found in language '${lang}'. Using fallback language '${fallbackLanguage}'.`
        );
      } else {
        console.error(
          `\n\x1b[31mError:\x1b[0m Key 'label-lk-${attrName}:${key}' not found in language '${lang}' or fallback language '${fallbackLanguage}'. Stopping execution.`
        );
        process.exit(1);
      }
    }

    // Usar el valor del idioma actual o el predeterminado
    const finalValue = value || fallbackValue;

    // Construir la expresión regular para encontrar la etiqueta que contiene el atributo específico
    const tagRegex = new RegExp(`<([^>]*?)\\s+label-lk-${attrName}-k="${key}"[^>]*>`, "g");

    // Bandera para verificar si se realizó algún reemplazo
    let replaced = false;

    // Reemplazar la etiqueta que contiene el atributo específico
    html = html.replace(tagRegex, (match) => {
      replaced = true; // Marcamos que se realizó un reemplazo

      let updatedTag = match;

      // Verificar si el atributo ya existe en la etiqueta
      const existingAttrRegex = new RegExp(`${attrName}="[^"]+"`);
      if (existingAttrRegex.test(updatedTag)) {
        // Si el atributo ya existe, reemplazar su valor
        updatedTag = updatedTag.replace(existingAttrRegex, `${attrName}="${finalValue}"`);
      } else {
        // Si el atributo no existe, agregarlo antes del cierre de la etiqueta
        updatedTag = updatedTag.replace(/>$/, ` ${attrName}="${finalValue}">`);
      }

      // Eliminar el atributo específico `label-lk-${attrName}-k="${key}"`
      updatedTag = updatedTag.replace(new RegExp(`\\s+label-lk-${attrName}-k="${key}"`), "");

      return updatedTag;
    });

    // Logs para verificar si se realizó el reemplazo
    if (!replaced) {
      console.warn(
        `\n\x1b[33mWarning:\x1b[0m No match found for attribute 'label-lk-${attrName}-k="${key}"'. Skipping replacement.`
      );
    } else {
      //console.log(`\n\x1b[32mSuccess:\x1b[0m Successfully replaced 'label-lk-${attrName}-k="${key}"' with '${attrName}="${finalValue}"'.`);
    }

    processedLabels++;
    updateProgress(processedLabels, totalLabels, key);
  });




  //------------------[ Reemplazar contenido lk-text-content-k ]--------------------
  labelsMap.lkTextContent.forEach(({ tag, key }) => {
    // Obtener el valor traducido del JSON
    const value = texts[`lk-text-content:${key}`]; // Valor en el idioma actual
    const fallbackValue = translations[fallbackLanguage][`lk-text-content:${key}`]; // Valor en el idioma predeterminado

    // Verificar si la clave existe en el idioma actual
    if (!value) {
      if (fallbackValue) {
        console.warn(
          `\n\x1b[33mWarning:\x1b[0m Key 'lk-text-content:${key}' not found in language '${lang}'. Using fallback language '${fallbackLanguage}'.`
        );
      } else {
        console.error(
          `\n\x1b[31mError:\x1b[0m Key 'lk-text-content:${key}' not found in language '${lang}' or fallback language '${fallbackLanguage}'. Stopping execution.`
        );
        process.exit(1);
      }
    }

    // Usar el valor del idioma actual o el predeterminado
    const finalValue = value || fallbackValue;

    // Guardar el HTML antes del reemplazo
    const originalHtml = html;

    // Construir la expresión regular para encontrar la etiqueta completa
    const regex = new RegExp(`${tag}([^]*?)</${tag.match(/^<([^\s>]+)/)[1]}>`, "g");

    // Reemplazar la etiqueta original con la versión modificada
    html = html.replace(regex, (match, innerContent) => {
      // Eliminar el atributo `lk-text-content-k="..."`
      let updatedTag = match.replace(/\s+lk-text-content-k="[^"]+"/, "");

      // Reemplazar el contenido interno con el valor traducido
      updatedTag = updatedTag.replace(/>([^]*?)<\/([^\s>]+)>/, `>${finalValue}</$2>`);

      return updatedTag;
    });

    // Verificar si hubo algún cambio
    if (html === originalHtml) {
      console.error(
        `\n\x1b[31mError:\x1b[0m No changes were made for tag with key 'lk-text-content:${key}' in file: ${filePath}. Tag: ${tag}`
      );
    } else {
      processedLabels++;
      updateProgress(processedLabels, totalLabels, key);
    }
  });


  //--->

  // Guardar el HTML traducido
  fs.writeFileSync(outputPath, html);


  console.log(`\n\x1b[36mTranslated:\x1b[0m File: ${outputPath}`);
}

// Función para actualizar el progreso dinámicamente
function updateProgress(current, total, label) {
  const percentage = ((current / total) * 100).toFixed(2);
  process.stdout.clearLine(); // Limpiar la línea actual
  process.stdout.cursorTo(0); // Mover el cursor al inicio de la línea
  process.stdout.write(`      Label: [${current}/${total}] ${percentage}% : ${label}`);
  if (current === total) {
    console.log(); // Salto de línea al finalizar
  }
}



// Encontrar todos los archivos HTML
const htmlFiles = findHtmlFiles(devDir);

// Evaluar y almacenar etiquetas personalizadas para cada archivo
const allLabelsMap = {};
let totalLk = 0,
  totalLabelLk = 0,
  totalLkTextContent = 0;

htmlFiles.forEach((htmlFile) => {
  const html = fs.readFileSync(htmlFile, "utf-8");
  const labelsMap = evaluateAndStoreLabels(html, htmlFile);
  allLabelsMap[htmlFile] = labelsMap;

  totalLk += labelsMap.lk.length;
  totalLabelLk += labelsMap.labelLk.length;
  totalLkTextContent += labelsMap.lkTextContent.length;
});

// Mostrar conteo total de etiquetas
console.log(
  `\x1b[34mInfo:\x1b[0m Total HTML files: ${htmlFiles.length}\n      Total Labels: ${totalLk + totalLabelLk + totalLkTextContent} ->  [ lk: ${totalLk}; label-lk: ${totalLabelLk}; lk-text-content: ${totalLkTextContent} ]`
);

// Procesar todos los idiomas
for (const [lang, texts] of Object.entries(translations)) {
  console.log(`\x1b[36m---------------------------------------------------------------------------------\x1b[0m`);

  console.log(`\x1b[36mTranslating:\x1b[0m "${lang.toUpperCase()}" from ${jsonPath}`);

  const langDir = path.join(preBuildDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir);
  }

  // Traducir cada archivo HTML
  htmlFiles.forEach((htmlFile) => {
    const relativePath = path.relative(devDir, htmlFile); // Obtener ruta relativa desde /dev
    const outputPath = path.join(langDir, relativePath); // Construir ruta de salida

    // Crear la carpeta necesaria para el archivo
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Obtener el mapa de etiquetas para este archivo
    const labelsMap = allLabelsMap[htmlFile];

    // Mostrar conteo de etiquetas para este archivo
    console.log(
      `\x1b[34mInfo:\x1b[0m File: ${relativePath}\n      Labels: ${labelsMap.lk.length + labelsMap.labelLk.length + labelsMap.lkTextContent.length
      } ->  [ lk: ${labelsMap.lk.length}; label-lk: ${labelsMap.labelLk.length}; lk-text-content: ${labelsMap.lkTextContent.length} ]`
    );

    // Traducir y guardar el archivo
    translateAndSaveHtml(htmlFile, outputPath, lang, texts, fallbackLanguage, labelsMap);
   
  });
} //--<


///-------------------  Managa app/index.html and buttons ----------------


async function manageAppIndex(filePath, supportedLanguages) {

  try {
    if (fs.existsSync(filePath)) {
      await insertLanguageButtons(filePath, supportedLanguages);

    } else {

      await createHtmlFile(filePath, build_HtmlContent_AppIndex(supportedLanguages));
    }
  } catch (error) {
    console.error(`\x1b[31mError:\x1b[0m Failed to process file: app/index.html`);
  }

}




//funcion para insertar botones de idiomas si el archivo existe
async function insertLanguageButtons(filePath, supportedLanguages) {
  try {

    // Leer el contenido del archivo HTML
    const htmlContent = fs.readFileSync(filePath, "utf-8");

    // Crear un DOM virtual usando jsdom
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Buscar el contenedor <div id="lang-container">
    const langContainer = document.getElementById("lang-container");
    if (!langContainer) {
      console.error(`\x1b[31mError:\x1b[0m Element with id 'lang-container' not found in file: ${filePath}`);
      return;
    }

    // Limpiar el contenido existente del contenedor (opcional)
    langContainer.innerHTML = "";

    // Insertar un botón para cada idioma
    supportedLanguages.forEach((lang) => {
      const button = document.createElement("a");
      button.href = `pre-build/${lang}`;
      button.className = "button lang";
      button.textContent = lang.toUpperCase(); // Texto del botón (puedes ajustarlo según tus necesidades)
      langContainer.appendChild(button);
    });

    // Guardar el archivo HTML modificado
    const updatedHtml = dom.serialize();
    fs.writeFileSync(filePath, updatedHtml, "utf-8");

    console.log(`\x1b[32m✓\x1b[0m Language buttons updated into: ${filePath}`);
  } catch (error) {
    console.error(`\x1b[31mError:\x1b[0m Failed to process file: ${filePath}`, error.message);
  }
}



//funcion para crear el archivo index.html de la app
async function createHtmlFile(filePath, content) {

  try {
    // Verificar si el directorio padre existe 
    const dir = path.dirname(filePath);
    if (fs.existsSync(dir)) {
      // Escribir el contenido en el archivo
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`\x1b[32mCreated:\x1b[0m File: ${filePath}`);
      console.log(`\x1b[32m✓\x1b[0m Language buttons updated into: ${filePath}`);
    }


  } catch (error) {
    console.error(`\x1b[31mError:\x1b[0m Failed to create file: ${filePath}`, error.message);
  }
}


//funcion para crear el contenido del html app/index.html
function build_HtmlContent_AppIndex(supportedLanguages) {

  let elementButton = "";

  supportedLanguages.forEach((lang) => {
    elementButton += `<a href="pre-build/${lang}/" class="button lang">${(lang.toUpperCase())}</a>\n`;

  });

  const htmlT = `
  <!DOCTYPE html>
<html lang="es">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanilla App</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #121212;
      color: #ffffff;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }

    .card {
      background-color: #1e1e1e;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      padding: 20px;
      text-align: center;
      width: 300px;
    }

    h1 {
      font-size: 24px;
      margin-bottom: 20px;
    }

    .button-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .button {
      display: inline-block;
      width: auto;
      padding: 12px;
      font-size: 16px;
      color: #ffffff;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      text-decoration: none;
      transition: background-color 0.3s ease;
      text-align: center;
    }

    #pre-builder-container {
      gap: 5px;
    }

    #lang-container {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .button.lang {
      flex: 1;
      flex: 1 1 calc(25% - 20px);
      background-color: #480479;
      margin-top: 0;
      margin-bottom: 5px;
      box-sizing: border-box;


    }

    .button.lang:hover {
      background-color: #3f006e;
    }

    .button.dev {
      background-color: #6a0dad;
    }

    .button.dev:hover {
      background-color: #570b92;
    }

    .button.pre-build {
      background-color: #6a0dad;
      ;
    }

    .button.pre-build:hover {
      background-color: #570b92;
    }

    .dist {
      background-color: #6a0dad;
      ;
    }

    .button.dist:hover {
      background-color: #570b92;
    }

    .button.disable {
      background-color: #303030;
      color: #888888;

      margin-bottom: 0px;
      gap: 0px;
    }

    #button-dist-info {
      color: #a530ff;
      text-align: left;
      margin-top: -10px;
      font-weight: 100;
      font-size: 15px;
      visibility: hidden;

    }
  </style>
</head>

<body>
  <div class="card">
    <h1>Vanilla js - app/</h1>
    <p>Select a dir:</p>
    <div class="button-container">
      <a href="dev/pages/" class="button dev">Go to /dev</a>
      <div class="button-container" id="pre-builder-container">
        <a href="pre-build/" class="button pre-build">Go to /pre-build</a>
        <div id="lang-container">
         ${elementButton}
        </div>
      </div>
      <a href="http://localhost:5000/" target="_blank" class="button dist" id="button-dist">Go to /dist</a>
      <span id="button-dist-info">First run 'yarn preview' or start a server at localhost:5000</span>
    </div>
  </div>


  <script>

    const submitButton = document.getElementById('button-dist');
    const submitButtonInfo = document.getElementById('button-dist-info');
    submitButton.classList.add("disable");
    submitButton.classList.remove("dist");

    let validate = false;

    const url = submitButton.href;

    async function validateLink(url) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;  // true HTTP  200-299  
      } catch (error) {
        return false;
      }
    }


    validateLink(url).then((isValid) => {
      if (isValid) {
        submitButton.disabled = false; 
        submitButton.classList.remove("disable");
        submitButton.classList.add("dist");
        validate = true;
      } else {
        submitButton.disabled = true;
        submitButton.classList.remove("dist");
        validate = false;
      }
    });

    const hoverBox = document.getElementById("button-dist");

    hoverBox.addEventListener("mouseenter", () => {
      if (!validate) {
        submitButtonInfo.style.visibility = "visible";
      }

    });

    hoverBox.addEventListener("mouseleave", () => {
      if (!validate) {
        submitButtonInfo.style.visibility = "hidden";
      }
    });

     
    hoverBox.addEventListener("click", function (event) {
      if (!validate) {
        event.preventDefault(); 
      }

    });
  </script>

</body>

</html>
  
  `

  return htmlT;
}




///-----------------------------------------------------------------------> end 





// Llamar a la función para manejar el archivo index.html
handleIndexHtml_V2(preBuildDir, supportedLanguages, fallbackLanguage);


// Función para manejar el archivo index.html en /pre-build
function handleIndexHtml_V2(preBuildDir, supportedLanguages, fallbackLanguage) {
  const indexPath = path.join(preBuildDir, "index.html");
  console.log(`\x1b[36m---------------------------------------------------------------------------------\x1b[0m`);

  // Crear un archivo index.html con redirecciones para cada idioma
  const redirectHtml = generateRedirectHtml(supportedLanguages, fallbackLanguage, "Redirect");
  fs.writeFileSync(indexPath, redirectHtml);
  console.log(`\n\x1b[32mCreated:\x1b[0m File: ${indexPath}`);

  end();




}



// Función para manejar el archivo index.html en /pre-build  V1
function handleIndexHtml(preBuildDir, supportedLanguages, fallbackLanguage) {
  const indexPath = path.join(preBuildDir, "index.html");
  // Verificar si el archivo index.html existe
  if (!fs.existsSync(indexPath)) {
    // Crear una interfaz readline para preguntar al usuario
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log(`\x1b[36m---------------------------------------------------------------------------------\x1b[0m`);

    // Preguntar al usuario si desea crear el archivo index.html
    rl.question(
      `\n\x1b[33mWarning:\x1b[0m The file 'index.html' does not exist in the /pre-build folder. \nDo you want to create it? (y/n): `,
      (answer) => {
        if (answer.toLowerCase() === "y" || answer.toLowerCase() === "yes") {
          // Crear un archivo index.html con redirecciones para cada idioma
          const redirectHtml = generateRedirectHtml(supportedLanguages, fallbackLanguage, "Redirect");
          fs.writeFileSync(indexPath, redirectHtml);
          console.log(`\n\x1b[32mCreated:\x1b[0m File: ${indexPath}`);
        } else {
          console.log(`\n\x1b[31mSkipped:\x1b[0m File 'index.html' was not created.`);
        }
        rl.close(); // Cerrar la interfaz readline
        end();
      }
    );
  } else {

    end();

  }
}



function end() {



  (async () => {
    console.log(`\x1b[36m---------------------------------------------------------------------------------\x1b[0m`);

    // copiar directorios 
    await copyDirectoryStructure();
    console.log(`\x1b[36m---------------------------------------------------------------------------------\x1b[0m`);


    try {
      // crear app/index.html
      await manageAppIndex(indexAppPath, supportedLanguages);

    } catch {
      console.log(`\x1b[33m⚠\x1b[0m  \x1b[30mCouldn't create app/index.html\x1b[0m `);
    }

    // Fin del tiempo de ejecución
    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\x1b[36m---------------------------------------------------------------------------------\x1b[0m`);
    console.log(`\x1b[34mSummary:\x1b[0m Processed ${htmlFiles.length} files and ${totalLk + totalLabelLk + totalLkTextContent} labels in ${totalTime} seconds.`);
    console.log("\x1b[32mALL OK\x1b[0m");
  })();





}