# Vanilla HTML Multilingual Template with Vite 🌍

A lightweight, multilingual-ready **Vanilla HTML** template powered by [Vite](https://vitejs.dev/). This template simplifies the creation of static websites with built-in support for multiple languages and production-ready optimizations.

---

## Features ✨

- **Fast Development**: Powered by Vite for rapid development and hot module replacement (HMR).
- **Multilingual Support**: Built-in translation system for seamless multilingual websites.
- **Production Optimization**: Pre-configured build process to optimize assets for deployment.
- **Easy Setup**: Simple commands to develop, translate, and deploy your project.

---

## Folder Structure 📂

```
/app
├── /dev                              # Development folder
│     ├── /pages                      # Main HTML files
│     │       ├── index.html          # Main app file
│     │       └── /other-page         # Additional pages
│     ├── /locales                    # Translation files
│     │       └── universal.json      # JSON file with translations
│     ├── /assets                     # Shared resources (optimized during build)
│     │       ├── /images             # Images
│     │       └── /fonts              # Fonts
│     ├── /src                        # Source files (CSS, JS)
│     │       ├── /css                # CSS files
│     │       └── /js                 # JavaScript files
│     └── /public                     # Global resources (copied directly to /dist)
│
├── /pre-build                        # Intermediate folder with translated HTML files
│     ├── /es                         # Spanish version
│     ├── /en                         # English version
│     └── ...                         # Other languages
│
├── /dist                             # Final optimized folder for production
│     ├── /assets                     # Optimized shared resources
│     ├── /es                         # Optimized Spanish version
│     ├── /en                         # Optimized English version
│     └── ...                         # Other optimized languages
│
├── translate.js                      # Script to generate translations in `/pre-build`
└── build.js                          # Script to optimize files in `/dist`
```

---

## How It Works 🛠️

1. **Development (`/dev`)**:
   - Create and modify HTML, JSON, and shared resources in `/dev`.
   - Use custom tags like `<lk k="key">` or attributes like `label-lk-src-k="key"` for translations.

2. **Translation (`/pre-build`)**:
   - Run `yarn pre-build` to generate translated versions of your site in `/pre-build`.
   - Each language gets its own folder (e.g., `/es`, `/en`).

3. **Optimization (`/dist`)**:
   - Run `yarn build` to optimize files for production:
     - Minify HTML, CSS, and JavaScript.
     - Compress images.
     - Copy shared resources to `/dist/assets`.

4. **Deployment**:
   - Files in `/dist` are ready for deployment to a web server or CDN.

---

## JSON Structure 📑

The `universal.json` file contains translations for each language. Example:

```json
{
  "metadata": {
    "file": {
      "fallbackLanguage": "en"
    }
  },
  "es": {
    "lk:title": "Mi sitio",
    "lk-text-content:hello": "Hola",
    "label-lk-src:image-flag": "../assets/images/es-flag.gif"
  },
  "en": {
    "lk:title": "My site",
    "lk-text-content:hello": "Hi",
    "label-lk-src:image-flag": "../assets/images/en-flag.gif"
  }
}
```

- **`lk:key`**: For wrapping text blocks (e.g., `<lk k="title">`).
- **`lk-text-content:key`**: For changing text content (e.g., `<h1 lk-text-content-k="hello">`).
- **`label-lk-*:key`**: For modifying attributes (e.g., `<img label-lk-src-k="image-flag">`).

---

## Workflow 🚀

1. **Develop**:
   - Work in `/dev` using live preview tools.

2. **Translate**:
   - Run `yarn pre-build` to generate translations in `/pre-build`.

3. **Test** (Optional):
   - Run `node testTranslate.js` to verify language redirection.

4. **Build**:
   - Run `yarn build` to optimize files for production in `/dist`.

5. **Deploy**:
   - Upload `/dist` to your hosting provider or CDN.

---

## Scripts 🧰

| Command               | Description                                      |
|-----------------------|--------------------------------------------------|
| `yarn dev`            | Start the development server.                   |
| `yarn pre-build`      | Generate translated files in `/pre-build`.      |
| `yarn build`          | Optimize files for production in `/dist`.       |
| `node testTranslate.js` | Test language redirection (optional).         |

---

## Resources 📚

- **Shared Resources**:
  - Images, fonts, CSS, and JS in `/dev/assets` are optimized and copied to `/dist/assets`.

- **Global Resources**:
  - Files in `/dev/public` are copied directly to `/dist` without optimization.

---

## Notes 📝

- **Fallback Language**: If a translation is missing, the fallback language (`en`) is used.
- **Custom Attributes**: Use `label-lk-*` for dynamic attributes and `lk-text-content-k` for text content.
- **Testing**: Use Puppeteer in `testTranslate.js` to ensure proper language redirection.

---

just for academical purppouses
