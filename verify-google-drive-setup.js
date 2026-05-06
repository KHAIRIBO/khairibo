#!/usr/bin/env node

/**
 * Google Drive Setup Verification Script
 * Run with: node verify-google-drive-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n' + '='.repeat(60));
console.log('🔍 Google Drive API Configuration Verification');
console.log('='.repeat(60) + '\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ ERROR: .env file not found at', envPath);
  console.log('\n✅ Solution: Create .env file with Google Drive credentials');
  process.exit(1);
}

// Load .env file
require('dotenv').config();

const checks = [
  {
    name: 'GOOGLE_CLIENT_EMAIL',
    value: process.env.GOOGLE_CLIENT_EMAIL,
    required: true,
    format: email => email.includes('@') && email.includes('iam.gserviceaccount.com')
  },
  {
    name: 'GOOGLE_PRIVATE_KEY',
    value: process.env.GOOGLE_PRIVATE_KEY,
    required: true,
    format: key => key && key.includes('BEGIN PRIVATE KEY') && key.includes('END PRIVATE KEY')
  },
  {
    name: 'GOOGLE_PROJECT_ID',
    value: process.env.GOOGLE_PROJECT_ID,
    required: true,
    format: id => id && id.length > 0
  },
  {
    name: 'GOOGLE_DRIVE_FOLDER_ID',
    value: process.env.GOOGLE_DRIVE_FOLDER_ID,
    required: true,
    format: id => id && id.length > 20 // Google Drive IDs are long
  },
];

let allPassed = true;

checks.forEach(check => {
  console.log(`\n📋 ${check.name}`);
  
  if (!check.value && check.required) {
    console.log('  ❌ MISSING - Environment variable not set in .env');
    allPassed = false;
    return;
  }
  
  if (check.value && !check.format(check.value)) {
    console.log(`  ❌ INVALID FORMAT`);
    if (check.name === 'GOOGLE_CLIENT_EMAIL') {
      console.log('     Expected: portfolio-uploader@YOUR-PROJECT.iam.gserviceaccount.com');
    } else if (check.name === 'GOOGLE_PRIVATE_KEY') {
      console.log('     Expected: Full private key starting with BEGIN PRIVATE KEY');
    } else if (check.name === 'GOOGLE_DRIVE_FOLDER_ID') {
      console.log('     Expected: Google Drive folder ID (long alphanumeric string)');
    }
    allPassed = false;
    return;
  }
  
  if (check.value) {
    console.log('  ✅ SET - Looks good!');
    if (check.name === 'GOOGLE_CLIENT_EMAIL') {
      console.log(`     Value: ${check.value}`);
    } else if (check.name === 'GOOGLE_DRIVE_FOLDER_ID') {
      console.log(`     Value: ${check.value}`);
    }
  }
});

console.log('\n' + '='.repeat(60));

if (allPassed) {
  console.log('✅ All checks passed! Your Google Drive configuration looks good.\n');
  console.log('Next steps:');
  console.log('1. Start the server: node api/server.js');
  console.log('2. Look for: "✅ Google Drive API initialized successfully"');
  console.log('3. Test file upload from the web app\n');
} else {
  console.log('❌ Some checks failed. Please:');
  console.log('\n1. Read GOOGLE_DRIVE_COMPLETE_GUIDE.md carefully');
  console.log('2. Get credentials from Google Cloud Console');
  console.log('3. Add them to .env file');
  console.log('4. Run this script again\n');
  process.exit(1);
}

console.log('='.repeat(60) + '\n');
