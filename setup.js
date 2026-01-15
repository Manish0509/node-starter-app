#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  statSync,
} from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the package root directory (where package.json is)
const packageRoot = __dirname;
// Get the current working directory where the package is being installed
const targetDir = process.cwd();

// Files and directories to copy
const filesToCopy = ["src", "package.json", "README.md"];

// Files to skip (don't copy these)
const filesToSkip = new Set([
  "node_modules",
  ".git",
  ".npmignore",
  "package-lock.json",
  "setup.js",
]);

function copyRecursive(src, dest) {
  const exists = existsSync(src);
  const stats = exists && statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    // Create destination directory if it doesn't exist
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }

    // Read directory contents
    const entries = readdirSync(src);

    for (const entry of entries) {
      const srcPath = join(src, entry);
      const destPath = join(dest, entry);

      // Skip files in the skip list
      if (filesToSkip.has(entry)) {
        continue;
      }

      const entryStats = statSync(srcPath);
      if (entryStats.isDirectory()) {
        copyRecursive(srcPath, destPath);
        continue;
      }

      // Only copy if destination doesn't exist
      if (existsSync(destPath)) {
        console.log(`⊘ Skipped (exists): ${entry}`);
        continue;
      }

      copyFileSync(srcPath, destPath);
      console.log(`✓ Copied: ${entry}`);
    }
  } else {
    // It's a file
    if (existsSync(dest)) {
      console.log(`⊘ Skipped (exists): ${src}`);
      return;
    }

    copyFileSync(src, dest);
    console.log(`✓ Copied: ${src}`);
  }
}

function setup() {
  console.log("\n🚀 Setting up booking-app-nodejs...\n");
  console.log(`Package root: ${packageRoot}`);
  console.log(`Target directory: ${targetDir}\n`);

  // Don't copy if we're in the package's own directory
  if (packageRoot === targetDir) {
    console.log("⚠️  Skipping setup: Running in package directory itself.\n");
    return;
  }

  for (const item of filesToCopy) {
    const srcPath = join(packageRoot, item);
    const destPath = join(targetDir, item);

    if (existsSync(srcPath)) {
      copyRecursive(srcPath, destPath);
    } else {
      console.log(`⚠️  Warning: ${item} not found in package`);
    }
  }

  console.log("\n✅ Setup complete!");
  console.log("\n📝 Next steps:");
  console.log("   1. Run: npm install");
  console.log("   2. Create a .env file with your configuration");
  console.log("   3. Run: npm start\n");
}

setup();
