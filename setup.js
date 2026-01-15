#!/usr/bin/env node

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  readdirSync,
  statSync,
  readFileSync,
} from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the package root directory (where package.json is)
// When installed via npm, setup.js will be in the package root directory
// Check if package.json exists in the same directory as setup.js
let packageRoot = __dirname;
const packageJsonPath = join(__dirname, "package.json");

if (existsSync(packageJsonPath)) {
  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
    // Verify this is our package
    if (packageJson.name === "node-starter-app") {
      packageRoot = __dirname;
    }
  } catch (e) {
    // If we can't read package.json, use __dirname as fallback
    packageRoot = __dirname;
  }
}
// Get the current working directory where the user wants to create the app
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
  console.log("\n🚀 Creating Node.js Starter App...\n");
  console.log(`📦 Source: ${packageRoot}`);
  console.log(`📁 Destination: ${targetDir}\n`);

  // Don't copy if we're in the package's own directory
  if (packageRoot === targetDir) {
    console.log(
      "⚠️  Skipping: Cannot setup in the package directory itself.\n"
    );
    console.log("💡 Tip: Run this command in a new empty directory.\n");
    return;
  }

  // Check if directory is empty (optional warning)
  try {
    const existingFiles = readdirSync(targetDir).filter(
      (file) => !file.startsWith(".")
    );
    if (existingFiles.length > 0) {
      console.log("⚠️  Warning: Target directory is not empty.");
      console.log("   Existing files will be preserved.\n");
    }
  } catch (e) {
    // Directory might not exist or be inaccessible, continue anyway
  }

  console.log("📋 Copying files...\n");

  for (const item of filesToCopy) {
    const srcPath = join(packageRoot, item);
    const destPath = join(targetDir, item);

    if (existsSync(srcPath)) {
      copyRecursive(srcPath, destPath);
    } else {
      console.log(`⚠️  Warning: ${item} not found in package`);
    }
  }

  console.log("\n✅ Node.js Starter App created successfully!");
  console.log("\n📝 Next steps:");
  console.log("   1. Install dependencies: npm install");
  console.log("   2. Create a .env file with your configuration");
  console.log("   3. Start the app: npm start");
  console.log("   4. Or run in dev mode: npm run dev\n");
}

setup();
