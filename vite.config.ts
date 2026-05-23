// oxlint-disable unicorn/prefer-module
// oxlint-disable import/no-nodejs-modules

import fs from "node:fs";
import path from "node:path";
import type { Plugin, UserConfig } from "vite";
import { defineConfig } from "vite";

// oxlint-disable-next-line import/no-default-export
export default defineConfig(({ mode }): UserConfig => {
    const bundle = process.argv.includes("--bundle")
        ? process.argv[process.argv.indexOf("--bundle") + 1]
        : null;

    console.debug("----------------------------");
    console.debug(" ", bundle, " | ", mode);
    console.debug("----------------------------\n");

    if (bundle === "dist") {
        return {
            plugins: [emitSpinCss()],
            build: {
                outDir: path.join(__dirname, "dist"),
                target: "es2024",
                sourcemap: true,
                emptyOutDir: true,

                lib: {
                    entry: path.join(__dirname, "src/index.ts"),
                    formats: ["es"],
                    fileName: "index",
                },
            },
        };
    }

    if (bundle === "docs") {
        return {
            base: "./",
            root: path.join(__dirname, "demo"),
            build: {
                outDir: path.join(__dirname, "docs"),
                emptyOutDir: true,
                rollupOptions: {
                    output: {
                        entryFileNames: "[name]-[hash].js",
                        assetFileNames: "[name]-[hash][extname]",
                    },
                },
            },
        };
    }

    throw new Error(`Unknown bundle: ${bundle}`);
});

function emitSpinCss(): Plugin {
    const css = fs.readFileSync(
        path.join(__dirname, "node_modules", "spin.js", "spin.css"),
        "utf8",
    );

    return {
        name: "emit-spin-css",
        generateBundle(): void {
            this.emitFile({
                type: "asset",
                fileName: "index.css",
                source: css,
            });
        },
    };
}
