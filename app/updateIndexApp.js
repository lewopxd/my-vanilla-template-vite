import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

import { fileURLToPath } from "url";
import html from "@rollup/plugin-html";


// Obtener __dirname usando ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const supportedLanguages = ["en", "es", "fr", "de"]; // Vector de idiomas soportados

const indexAppPath = path.join(__dirname, "index.html");


 
await manageAppIndex(indexAppPath, supportedLanguages);
 

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





async function insertLanguageButtons(filePath, supportedLanguages) {
  try {
    // Verificar si el archivo existe


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




async function createHtmlFile(filePath, content) {
  console.log("triying");
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



function build_HtmlContent_AppIndex(supportedLanguages) {

  let elementButton = "";

  supportedLanguages.forEach((lang) => {
    elementButton += `<a href="pre-build/${lang}" class="button lang">${(lang.toUpperCase())}</a>\n`;

  });

  const htmlT = `
  <!DOCTYPE html><html lang="es"><head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanilla App</title>
  <style>
    /* Estilos para el tema oscuro */
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
      gap: 15px; /* Espacio entre los botones */
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

    #pre-builder-container{
       gap: 5px;
    }

    #lang-container{
      display:   flex; /* Activa Flexbox */
      flex-wrap: wrap;
       gap: 5px;
    }

    .button.lang{
      flex: 1;
      flex: 1 1 calc(25% - 20px);
      background-color: #480479; /* Morado Oscuro */
      margin-top: 0;
      margin-bottom: 5px;
      box-sizing: border-box;
      
    
    }

    .button.lang:hover {
      background-color: #3f006e; /* Morado Oscuro (Hover) */
    }
    /* Colores de los botones */
    .button.dev {
      background-color: #6a0dad; /* Morado Oscuro */
    }

    .button.dev:hover {
      background-color: #570b92; /* Morado Oscuro (Hover) */
    }

    .button.pre-build {
      background-color:  #6a0dad;; /* Violeta Brillante */
    }

    .button.pre-build:hover {
      background-color: #570b92; /* Violeta Brillante (Hover) */
    }

    .button.dist {
      background-color:  #6a0dad;; /* Violeta Claro */
    }

    .button.dist:hover {
      background-color: #570b92; /* Violeta Claro (Hover) */
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Selecciona una Carpeta</h1>
    <p>Elige una opción para redirigir:</p>
    <div class="button-container">
      <a href="dev/pages/" class="button dev">Ir a /dev</a>
      <div class="button-container" id="pre-builder-container">
        <a href="pre-build/" class="button pre-build">Ir a /pre-build</a>
        <div id="lang-container">
         ${elementButton}
        </div>
      </div>
      <a href="http://192.168.1.3:5173/" class="button dist">Ir a /dist</a>
    </div>
  </div>
 

</body></html>
  
  `

  return htmlT;
}