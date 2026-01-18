#!/usr/bin/env bun
/**
 * Bun Build Script
 * 
 * Builds the CLI and library using Bun's native bundler.
 * Generates ESM JavaScript output with TypeScript declarations.
 */

import { $ } from "bun";

console.log("🔨 Building openskill-ai with Bun...\n");

// Build CLI entry point
const cliBuild = await Bun.build({
    entrypoints: ["./src/cli.ts"],
    outdir: "./dist",
    target: "node", // Node.js compatible output for npm publishing
    format: "esm",
    minify: false,
    sourcemap: "external",
    naming: "[name].[ext]",
});

if (!cliBuild.success) {
    console.error("❌ CLI build failed:");
    for (const log of cliBuild.logs) {
        console.error(log);
    }
    process.exit(1);
}

console.log("✅ Built dist/cli.js");

// Build library entry point
const libBuild = await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./dist",
    target: "node",
    format: "esm",
    minify: false,
    sourcemap: "external",
    naming: "[name].[ext]",
});

if (!libBuild.success) {
    console.error("❌ Library build failed:");
    for (const log of libBuild.logs) {
        console.error(log);
    }
    process.exit(1);
}

console.log("✅ Built dist/index.js");

// Generate TypeScript declarations
console.log("\n📝 Generating TypeScript declarations...");

try {
    await $`bunx tsc --emitDeclarationOnly --declaration --outDir dist`.quiet();
    console.log("✅ Generated .d.ts files");
} catch (error) {
    console.warn("⚠️  TypeScript declaration generation had issues (non-critical)");
}

console.log("\n🎉 Build complete!");
console.log("\nTo test locally:");
console.log("  bun run dist/cli.js --help");
console.log("  node dist/cli.js --help");
console.log("\nTo build standalone binaries:");
console.log("  bun run build:standalone");
