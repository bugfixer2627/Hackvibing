#!/usr/bin/env node
// Post-build script: inlines all CSS and JS into dist/index.html
// producing a true single-file app that opens directly from the filesystem.
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, "../dist");

let html = readFileSync(join(distDir, "index.html"), "utf8");

// Inline each <link rel="stylesheet" href="..."> tag
html = html.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g, (_, href) => {
  const filePath = join(distDir, href.replace(/^\.\//, ""));
  try {
    const css = readFileSync(filePath, "utf8");
    return `<style>${css}</style>`;
  } catch {
    console.warn(`Could not inline CSS: ${filePath}`);
    return _;
  }
});

// Inline each <script type="module" src="..."> tag
html = html.replace(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g, (_, src) => {
  const filePath = join(distDir, src.replace(/^\.\//, ""));
  try {
    const js = readFileSync(filePath, "utf8");
    return `<script type="module">${js}</script>`;
  } catch {
    console.warn(`Could not inline JS: ${filePath}`);
    return _;
  }
});

writeFileSync(join(distDir, "index.html"), html, "utf8");
console.log(`✓ Inlined all assets into dist/index.html`);
console.log(`  Size: ${(Buffer.byteLength(html, "utf8") / 1024).toFixed(1)} kB`);
