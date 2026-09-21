# Vanilla HTML + Vite Multilingual Template

A lightweight frontend starter for multilingual static websites using **Vanilla JavaScript, HTML/CSS and Vite**.

The project combines a conventional Vite development workflow with a build-time localization pipeline that generates language-specific HTML before the production build.

## Features

- Vanilla HTML, CSS and JavaScript.
- Vite development server and production build.
- JSON-based translations.
- Custom HTML localization attributes.
- Pre-build translation generation.
- Asset optimization.
- Automated browser-based testing with Puppeteer.

## Architecture

    Development source
           │
           ▼
    Translation generation
           │
           ▼
    Localized HTML
           │
           ▼
       Vite build
           │
           ▼
     Production output

The separation between source, localization and production output keeps development files independent from generated language versions.

## Localization

The template uses JSON translation data together with custom HTML keys, for example:

    <lk k="title">Fallback title</lk>

    <h1 lk-text-content-k="hello">Fallback text</h1>

    <img src="default.png" label-lk-alt-k="imageAlt" alt="Fallback">

## Development

    yarn install
    yarn pre-build
    yarn dev

Production build:

    yarn build

Preview:

    yarn preview

## Technology

- JavaScript
- HTML5 / CSS3
- Vite
- JSON
- Node.js tooling
- Puppeteer

## Status

Experimental frontend tooling project.

## Project

Developed by Leonardo Merchán as part of his software development and creative-technology practice.

[GitHub](https://github.com/lewopxd) · [0zdev](https://github.com/0zdev)