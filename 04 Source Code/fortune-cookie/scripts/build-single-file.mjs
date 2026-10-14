// Folds dist/ into one self-contained HTML file that opens with a double-click,
// no server needed. Run after `vite build` (or use `npm run build:single`).
//
//   node scripts/build-single-file.mjs [out.html] [--fragment]
//
// --fragment drops the <html>/<head>/<body> wrapper, for hosts that add their own.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const args = process.argv.slice(2);
const fragment = args.includes("--fragment");
const out = resolve(args.find((a) => !a.startsWith("--")) ?? join(root, "dist", "fortune-cookie.html"));

let html = readFileSync(join(dist, "index.html"), "utf8");
const assets = readdirSync(join(dist, "assets"));

html = html.replace(/<link rel="stylesheet"[^>]*href="\.?\/?assets\/([^"]+\.css)"[^>]*>/g, (_, file) => {
  const css = readFileSync(join(dist, "assets", file), "utf8");
  return `<style>\n${css}\n</style>`;
});

html = html.replace(/<script type="module"[^>]*src="\.?\/?assets\/([^"]+\.js)"[^>]*><\/script>/g, (_, file) => {
  const js = readFileSync(join(dist, "assets", file), "utf8").replace(/<\/script/gi, "<\\/script");
  return `<script type="module">\n${js}\n</script>`;
});

// The favicon becomes a data URI so the file has no neighbours.
html = html.replace(/href="\.?\/?favicon\.svg"/, () => {
  const svg = readFileSync(join(dist, "favicon.svg"), "utf8");
  return `href="data:image/svg+xml,${encodeURIComponent(svg)}"`;
});

// The one-file build has no neighbours to install from, so it skips the home-screen manifest.
html = html.replace(/\s*<link rel="(manifest|apple-touch-icon)"[^>]*>/g, "");

// Module scripts in <head> run after parsing, but move it to the end of <body> to be safe.
const scripts = [];
html = html.replace(/<script type="module">[\s\S]*?<\/script>/g, (m) => {
  scripts.push(m);
  return "";
});
// A function replacement, because the bundle contains "$`"-style patterns.
html = html.replace("</body>", () => `${scripts.join("\n")}\n</body>`);

if (fragment) {
  // Slice by position: the bundled script itself contains the text "</body>".
  const head = html.slice(html.indexOf("<head>") + 6, html.indexOf("</head>"));
  const body = html.slice(html.indexOf("<body>") + 6, html.lastIndexOf("</body>"));
  const keep = head
    .split("\n")
    .filter((l) => !/<meta charset|<meta name="viewport"|rel="icon"/.test(l))
    .join("\n");
  html = `${keep.trim()}\n${body.trim()}\n`;
}

writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`wrote ${out} (${kb} KB) from ${assets.length} assets${fragment ? ", fragment" : ""}`);
