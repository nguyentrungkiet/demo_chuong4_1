#!/usr/bin/env node

/**
 * IoT Dashboard Setup Test Script
 * Tests all components are properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 IoT Dashboard Setup Test\n');

// Test 1: Check environment files
console.log('1️⃣ Checking environment files...');
const envFiles = [
  'app/.env.example',
  'server/.env.example'
];

envFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

// Test 2: Check package.json scripts
console.log('\n2️⃣ Checking package.json scripts...');
const rootPkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredScripts = ['dev', 'build', 'start', 'ws-mock', 'install-all', 'test'];

requiredScripts.forEach(script => {
  if (rootPkg.scripts[script]) {
    console.log(`   ✅ npm run ${script} available`);
  } else {
    console.log(`   ❌ npm run ${script} missing`);
  }
});

// Test 3: Check dependencies installation
console.log('\n3️⃣ Checking dependencies...');
const checkDeps = ['app/node_modules', 'server/node_modules', 'node_modules'];

checkDeps.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`   ✅ ${dir} installed`);
  } else {
    console.log(`   ❌ ${dir} missing - run npm install`);
  }
});

// Test 4: Check firmware files
console.log('\n4️⃣ Checking firmware files...');
const firmwareFiles = ['firmware/main.ino', 'firmware/config.h', 'firmware/secrets.h.template'];

firmwareFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ❌ ${file} missing`);
  }
});

// Test 5: Verify tests can run
console.log('\n5️⃣ Testing frontend tests...');
try {
  process.chdir('app');
  execSync('npm run test -- --run', { stdio: 'pipe' });
  console.log('   ✅ Frontend tests pass');
  process.chdir('..');
} catch (error) {
  console.log('   ❌ Frontend tests failed');
  process.chdir('..');
}

console.log('\n🎉 Setup test complete!');
console.log('\n🚀 To start development:');
console.log('   npm run dev');
console.log('\n🔧 To start WebSocket mock:');
console.log('   npm run ws-mock');
console.log('\n📱 Frontend will be available at: http://localhost:5173');
console.log('🔌 Backend API at: http://localhost:3000/api');