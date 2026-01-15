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
  writeFileSync,
} from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the package root directory (where package.json is)
// When installed via npm, setup.js will be in node_modules/node-starter-app/
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

// Get the target directory where files should be copied
// If we're in node_modules, copy to the project root (parent of node_modules)
// Otherwise, copy to current working directory
let targetDir = process.cwd();

// Check if we're running from within node_modules
if (__dirname.includes("node_modules")) {
  // Go up directories until we're out of node_modules
  // This gives us the project root where npm install was run
  let checkDir = __dirname;
  while (checkDir.includes("node_modules")) {
    const parentDir = dirname(checkDir);
    // Stop if we've reached the filesystem root
    if (parentDir === checkDir) {
      break;
    }
    checkDir = parentDir;
  }
  targetDir = checkDir;
}

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

    if (!existsSync(srcPath)) {
      console.log(`⚠️  Warning: ${item} not found in package`);
      continue;
    }

    // Handle package.json specially - create a clean version without setup scripts
    if (item === "package.json") {
      try {
        const packageJson = JSON.parse(readFileSync(srcPath, "utf-8"));
        // Create a clean version without bin and postinstall
        const cleanPackageJson = { ...packageJson };
        delete cleanPackageJson.bin;
        delete cleanPackageJson.postinstall;
        // Update name to be more generic or let user customize
        // Keep the original name for now, user can change it

        // Only copy if destination doesn't exist
        if (!existsSync(destPath)) {
          const cleanJsonString =
            JSON.stringify(cleanPackageJson, null, 2) + "\n";
          writeFileSync(destPath, cleanJsonString, "utf-8");
          console.log(`✓ Copied: ${item} (cleaned)`);
        } else {
          console.log(`⊘ Skipped (exists): ${item}`);
        }
      } catch (e) {
        // If we can't parse package.json, fall back to regular copy
        if (!existsSync(destPath)) {
          copyFileSync(srcPath, destPath);
          console.log(`✓ Copied: ${item}`);
        } else {
          console.log(`⊘ Skipped (exists): ${item}`);
        }
      }
    } else {
      // Regular file/directory copy
      copyRecursive(srcPath, destPath);
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
