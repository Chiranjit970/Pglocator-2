/**
 * Test script to verify edge function endpoints are working
 * Run with: node test-edge-function.js
 */

const PROJECT_ID = 'odxrugzhcfeksxvnfmyn';
const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/server/make-server-2c39c550`;
// Use the same anon key the frontend uses for public calls
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keHJ1Z3poY2Zla3N4dm5mbXluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mjg3NDQsImV4cCI6MjA3ODAwNDc0NH0.yAjBHEQRN7yUBUVWoeL0h4V6Osg-N9YlQI1w_7syKvE";

// Test colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function testEndpoint(name, url, options = {}) {
  try {
    console.log(`${colors.blue}Testing: ${name}${colors.reset}`);
    console.log(`  URL: ${url}`);
    
    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${ANON_KEY}`,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    
    const status = response.status;
    const statusText = response.statusText;
    
    let data = null;
    try {
      const text = await response.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch (e) {
      data = { raw: 'Non-JSON response' };
    }
    
    if (status >= 200 && status < 300) {
      console.log(`${colors.green}✓ PASS${colors.reset} - Status: ${status} (${duration}ms)`);
      if (data && Object.keys(data).length > 0) {
        console.log(`  Response: ${JSON.stringify(data).substring(0, 100)}...`);
      }
      return { success: true, status, duration, data };
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - Status: ${status} ${statusText} (${duration}ms)`);
      if (data) {
        console.log(`  Error: ${JSON.stringify(data)}`);
      }
      return { success: false, status, duration, data };
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset} - ${error.name}: ${error.message}`);
    if (error.name === 'AbortError') {
      console.log(`  ${colors.yellow}Request timed out after 30 seconds${colors.reset}`);
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log(`${colors.blue}=== Edge Function Endpoint Tests ===${colors.reset}\n`);
  
  const results = [];
  
  // Test 0: Plain ping/health
  // Plain ping/health for the 'server' function are optional; focus on routed endpoints

  // Test 1: Health check (if exists)
  results.push(await testEndpoint(
    'Health Check',
    `${BASE_URL}/health`
  ));
  
  // Test 2: Initialize Demo Users
  results.push(await testEndpoint(
    'Initialize Demo Users',
    `${BASE_URL}/init-demo-users`,
    { method: 'POST' }
  ));
  
  // Test 3: Initialize Data
  results.push(await testEndpoint(
    'Initialize Data',
    `${BASE_URL}/init-data`,
    { method: 'POST' }
  ));
  
  // Test 4: Get User Profile (without auth - should fail with 401)
  results.push(await testEndpoint(
    'Get User Profile (No Auth)',
    `${BASE_URL}/user/profile`
  ));
  
  // Test 5: Get PGs (public endpoint)
  results.push(await testEndpoint(
    'Get PGs (Public)',
    `${BASE_URL}/pgs`
  ));
  
  // Summary
  console.log(`\n${colors.blue}=== Test Summary ===${colors.reset}`);
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;
  
  console.log(`Total: ${total} | ${colors.green}Passed: ${passed}${colors.reset} | ${colors.red}Failed: ${failed}${colors.reset}`);
  
  if (failed > 0) {
    console.log(`\n${colors.yellow}Note: Some failures are expected (e.g., 401 for protected endpoints without auth)${colors.reset}`);
  }
  
  // Check for timeout issues
  const timeouts = results.filter(r => r.error && r.error.includes('AbortError'));
  if (timeouts.length > 0) {
    console.log(`\n${colors.red}⚠ WARNING: ${timeouts.length} request(s) timed out!${colors.reset}`);
    console.log(`This indicates the edge function may be slow or unavailable.`);
  }
  
  return { passed, failed, total, results };
}

// Run tests
runTests().then((summary) => {
  process.exit(summary.failed > 0 ? 1 : 0);
}).catch((error) => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, error);
  process.exit(1);
});


