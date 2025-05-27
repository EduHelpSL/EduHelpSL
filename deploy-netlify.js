#!/usr/bin/env node

/**
 * Deployment script for Netlify Functions migration
 * This script helps automate the deployment and testing process
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${description}...`, "blue");
  try {
    execSync(command, { stdio: "inherit" });
    log(`✅ ${description} completed successfully`, "green");
  } catch (error) {
    log(`❌ ${description} failed`, "red");
    throw error;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} exists`, "green");
    return true;
  } else {
    log(`❌ ${description} not found at ${filePath}`, "red");
    return false;
  }
}

function main() {
  log("🚀 Starting Netlify Functions Deployment Process", "cyan");

  try {
    // Check required files
    log("\n📋 Checking required files...", "yellow");
    const requiredFiles = [
      {
        path: "netlify/functions/api.js",
        desc: "Netlify Function entry point",
      },
      {
        path: "netlify/functions/package.json",
        desc: "Functions package.json",
      },
      { path: "netlify.toml", desc: "Netlify configuration" },
    ];

    let allFilesExist = true;
    requiredFiles.forEach((file) => {
      if (!checkFile(file.path, file.desc)) {
        allFilesExist = false;
      }
    });

    if (!allFilesExist) {
      throw new Error(
        "Required files are missing. Please run the migration setup first."
      );
    }

    // Install dependencies
    log("\n📦 Installing Netlify Functions dependencies...", "yellow");
    process.chdir("netlify/functions");
    runCommand("npm install", "Installing dependencies");
    process.chdir("../..");

    // Check if Netlify CLI is installed
    log("\n🔧 Checking Netlify CLI...", "yellow");
    try {
      execSync("netlify --version", { stdio: "pipe" });
      log("✅ Netlify CLI is installed", "green");
    } catch (error) {
      log("⚠️  Netlify CLI not found. Installing...", "yellow");
      runCommand("npm install -g netlify-cli", "Installing Netlify CLI");
    }

    // Test functions locally
    log("\n🧪 Testing functions locally...", "yellow");
    log("Starting local development server...", "blue");
    log(
      "You can test your functions at: http://localhost:8888/api/health",
      "cyan"
    );
    log(
      "Press Ctrl+C to stop the server and continue with deployment",
      "yellow"
    );

    try {
      execSync("netlify dev", { stdio: "inherit" });
    } catch (error) {
      // User pressed Ctrl+C, continue with deployment
      log("\n📤 Proceeding with deployment...", "yellow");
    }

    // Deploy to Netlify
    log("\n🌐 Deploying to Netlify...", "yellow");
    runCommand("netlify deploy --prod", "Deploying to production");

    // Success message
    log("\n🎉 Deployment completed successfully!", "green");
    log("\n📋 Next steps:", "cyan");
    log(
      "1. Update your frontend API_BASE_URL to point to your Netlify site",
      "white"
    );
    log("2. Configure environment variables in Netlify dashboard", "white");
    log("3. Test your API endpoints", "white");
    log("4. Deploy your frontend to Firebase", "white");
  } catch (error) {
    log(`\n💥 Deployment failed: ${error.message}`, "red");
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
