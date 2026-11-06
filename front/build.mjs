import { build } from "esbuild";
import { fileURLToPath } from "node:url";

const entrada = fileURLToPath(new URL("./src/main.ts", import.meta.url));
const salida = fileURLToPath(new URL("../static/js/app.js", import.meta.url));

await build({
  entryPoints: [entrada],
  bundle: true,
  format: "iife",
  target: "es2020",
  minify: false,
  sourcemap: false,
  outfile: salida,
  legalComments: "none",
  banner: {
    js: "/* GENERADO por front/build.mjs desde front/src. No editar a mano: edita front/src y corre `npm run build` en front/. */",
  },
});
