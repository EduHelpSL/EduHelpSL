#!/usr/bin/env node

/**
 * Migration Testing Script
 * Tests the migrated Netlify Functions to ensure they work correctly
 */

const https = require("https");
const http = require("http");
const { URL } = require("url");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === "https:";
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: {
        "User-Agent": "Migration-Test-Script/1.0",
        ...options.headers,
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testEndpoint(url, expectedStatus = 200, description = "") {
  try {
    log(`\n🧪 Testing: ${description || url}`, "blue");
    const response = await makeRequest(url);

    if (response.statusCode === expectedStatus) {
      log(`✅ Success: ${response.statusCode}`, "green");

      // Try to parse JSON response
      try {
        const jsonData = JSON.parse(response.body);
        log(`📄 Response: ${JSON.stringify(jsonData, null, 2)}`, "cyan");
      } catch (e) {
        log(`📄 Response: ${response.body.substring(0, 200)}...`, "cyan");
      }

      return true;
    } else {
      log(
        `❌ Failed: Expected ${expectedStatus}, got ${response.statusCode}`,
        "red"
      );
      log(`📄 Response: ${response.body}`, "yellow");
      return false;
    }
  } catch (error) {
    log(`💥 Error: ${error.message}`, "red");
    return false;
  }
}

async function testCORS(baseUrl) {
  try {
    log("\n🔒 Testing CORS headers...", "blue");
    const response = await makeRequest(`${baseUrl}/api/health`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://your-firebase-project.web.app",
        "Access-Control-Request-Method": "GET",
      },
    });

    const corsHeaders = {
      "access-control-allow-origin":
        response.headers["access-control-allow-origin"],
      "access-control-allow-methods":
        response.headers["access-control-allow-methods"],
      "access-control-allow-headers":
        response.headers["access-control-allow-headers"],
    };

    log(`✅ CORS Headers:`, "green");
    Object.entries(corsHeaders).forEach(([key, value]) => {
      if (value) {
        log(`   ${key}: ${value}`, "cyan");
      }
    });

    return true;
  } catch (error) {
    log(`❌ CORS test failed: ${error.message}`, "red");
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  let baseUrl = args[0];

  if (!baseUrl) {
    log("🔍 No URL provided. Testing local development server...", "yellow");
    baseUrl = "http://localhost:8888";
  }

  log(`🚀 Starting migration tests for: ${baseUrl}`, "cyan");

  const tests = [
    {
      url: `${baseUrl}/api/health`,
      description: "Health check endpoint",
      expectedStatus: 200,
    },
    {
      url: `${baseUrl}/api/keys`,
      description: "API keys endpoint",
      expectedStatus: 200,
    },
  ];

  let passedTests = 0;
  let totalTests = tests.length;

  // Run endpoint tests
  for (const test of tests) {
    const success = await testEndpoint(
      test.url,
      test.expectedStatus,
      test.description
    );
    if (success) passedTests++;
  }

  // Test CORS
  const corsSuccess = await testCORS(baseUrl);
  if (corsSuccess) passedTests++;
  totalTests++;

  // Summary
  log("\n📊 Test Summary:", "cyan");
  log(
    `✅ Passed: ${passedTests}/${totalTests}`,
    passedTests === totalTests ? "green" : "yellow"
  );

  if (passedTests === totalTests) {
    log("\n🎉 All tests passed! Your migration is working correctly.", "green");
    log("\n📋 Next steps:", "cyan");
    log("1. Update your frontend to use the new Netlify URL", "white");
    log("2. Configure environment variables in Netlify", "white");
    log("3. Test with your actual Firebase frontend", "white");
  } else {
    log("\n⚠️  Some tests failed. Please check the configuration.", "yellow");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    log(`💥 Test script failed: ${error.message}`, "red");
    process.exit(1);
  });
}

module.exports = { main, testEndpoint, testCORS };
