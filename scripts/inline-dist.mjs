import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(projectRoot, "dist");
const distDevPath = join(distDir, "dev.html");
const distIndexPath = join(distDir, "index.html");
const sourceHtmlPath = existsSync(distDevPath) ? distDevPath : distIndexPath;
let html = readFileSync(sourceHtmlPath, "utf8");
let appScript = "";

html = html.replace(/<link rel="stylesheet"[^>]*href="\.\/(assets\/[^\"]+\.css)"[^>]*>/g, (_, href) => {
  const css = readFileSync(join(distDir, href), "utf8");
  return `<style>\n${css}\n</style>`;
});

html = html.replace(/\s*<script type="module" crossorigin src="\.\/(assets\/[^\"]+\.js)"><\/script>\n?/g, (_, src) => {
  appScript = readFileSync(join(distDir, src), "utf8").replaceAll("</script", "<\\/script");
  return "\n";
});

if (!appScript) {
  throw new Error("Could not find bundled app script to inline");
}

html = html.replace("</body>", `  <script>\n${appScript}\n  </script>\n  </body>`);

writeFileSync(distIndexPath, html);
writeFileSync(join(projectRoot, "index.html"), html);
mkdirSync(join(projectRoot, "Hackvibing-web"), { recursive: true });
writeFileSync(join(projectRoot, "Hackvibing-web", "index.html"), html);
console.log("Created standalone index.html files for file:// use");
