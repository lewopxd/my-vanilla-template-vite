# Vanilla HTML + Vite Multilingual Template

A lightweight frontend starter for building multilingual static websites with **Vanilla JavaScript, HTML/CSS and Vite**.

The project combines a conventional Vite development workflow with a custom localization/build pipeline that generates language-specific HTML before the production build.

## Highlights

- Vanilla HTML, CSS and JavaScript.
- Vite development server and production build.
- JSON-based translations.
- Custom HTML localization attributes.
- Pre-build translation generation.
- Asset optimization for production.
- Optional automated translation-flow testing with Puppeteer.

## Architecture

```
dev/
  pages/
  locales/
  assets/
  src/

        ↓ translation

pre-build/
  es/
  en/
  ...

        ↓ Vite build

dist/
  es/
  en/
  ...
```

The separation between development, localization and production output keeps the source files easy to work with while allowing the generated site to be optimized for deployment.

## Quick start

```bash
git clone https://github.com/lewopxd/my-vanilla-template-vite.git
cd my-vanilla-template-vite
yarn install
yarn pre-build
yarn dev
```

Production build:

```bash
yarn build
```

Preview:

```bash
yarn preview
```

## Localization

The template uses a JSON translation structure and custom attributes such as:

```html
<lk k="title">Fallback title</lk>

<h1 lk-text-content-k="hello">
  Fallback text
</h1>

<img
  src="default.png"
  label-lk-src-k="image"
  label-lk-alt-k="imageAlt"
  alt="Fallback"
/>
```

This makes localization part of the build process rather than requiring a runtime translation framework.

## Technology

- JavaScript
- HTML5
- CSS3
- Vite
- JSON
- Node.js tooling
- Puppeteer

## Status

Personal / experimental frontend tooling project.

## Author

**Leonardo Merchán — lewopxd**

[GitHub](https://github.com/lewopxd) · [0zdev](https://github.com/0zdev)
