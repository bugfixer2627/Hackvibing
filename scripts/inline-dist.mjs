import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(projectRoot, "dist");
const indexPath = join(distDir, "index.html");
let html = readFileSync(indexPath, "utf8");
let appScript = "";

html = html.replace(/\s*<link rel="manifest"[^>]*>\n?/g, "\n");

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

writeFileSync(indexPath, html);
console.log("Created standalone dist/index.html for file:// use");
