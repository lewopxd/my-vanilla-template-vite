import { defineConfig } from "vite";
import path, { resolve } from "path";
import fs from "fs";

// Función para obtener las entradas dinámicas (un archivo HTML por idioma)
function getEntries() {
  const entries = {};
  const preBuildDir = resolve(__dirname, "./app/pre-build");
  const languages = ["es", "en"]; // Ajusta según tus idiomas soportados

  languages.forEach((lang) => {
    const htmlPath = resolve(preBuildDir, lang, "index.html");
    if (fs.existsSync(htmlPath)) {
      // Usar rutas relativas al directorio `root`
      entries[`${lang}/index`] = htmlPath;
    } else {
      console.error(`Error: Missing file: ${htmlPath}`);
    }
  });
  return entries;
}

// Plugin personalizado para copiar index.html después de la construcción
function copyIndexHtmlPlugin() {
  return {
    name: "copy-index-html",
    closeBundle: () => {

       console.log(`\n\x1b[34mInfo:\x1b[0m Copy-Index-html`);

      const indexFileName = "index.html";

      const preBuilDir = resolve(__dirname, `./app/pre-build`);
      const preBuildIndexPath = resolve(preBuilDir, indexFileName);

      const distDir = path.join(__dirname, "./app/dist");
      const distIndexPath = path.join(distDir, indexFileName);

      // Crear la carpeta /dist si no existe
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
        console.log("../dist created");
      }

      // Copiar el archivo index.html de /pre-build a /dist
      if (fs.existsSync(preBuildIndexPath)) {
        fs.copyFileSync(preBuildIndexPath, distIndexPath);
        console.log(`\x1b[32m✓\x1b[0m Copied: ../pre-build/${indexFileName} -> ../dist/${indexFileName}`);
       
      } else {
        console.error(`Error: Source file does not exist: ${preBuildIndexPath}`);
      }
      console.log("");
    },
  };
}

export default defineConfig({
  root: resolve(__dirname, "app/pre-build"), // Carpeta base para la construcción
  build: {
    outDir: resolve(__dirname, "app/dist"), // Carpeta de salida
    rollupOptions: {
      input: getEntries(), // Entradas dinámicas (un archivo HTML por idioma)
      output: {
        entryFileNames: "assets/[name]-[hash].js", // Nombre de los archivos JS
        chunkFileNames: "assets/[name]-[hash].js", // Nombre de los chunks
        assetFileNames: "assets/[name]-[hash].[ext]", // Nombre de los assets
      },
    },
    emptyOutDir: true, // Limpiar la carpeta /dist antes de construir
  },
  plugins: [copyIndexHtmlPlugin()], // Agregar el plugin personalizado
});