#!/usr/bin/env node
/**
 * Clean Slate Migration - For Fresh Databases Only
 * 
 * ⚠️  WARNING: This will DROP ALL TABLES and recreate from scratch!
 * Only use this if you have NO REAL USER DATA yet.
 * 
 * Usage:
 *   node scripts/clean-migration.js
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    return false;
  }
}

console.log('='.repeat(60));
console.log('CLEAN SLATE MIGRATION');
console.log('='.repeat(60));
console.log('\n⚠️  WARNING: This will:');
console.log('  1. Drop ALL existing tables');
console.log('  2. Apply the new schema');
console.log('  3. Generate fresh Prisma client');
console.log('  4. (Optional) Seed initial data');
console.log('\n❌ ALL EXISTING DATA WILL BE LOST!\n');

rl.question('Are you ABSOLUTELY SURE you want to proceed? (type "yes" to continue): ', (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Migration cancelled. Good choice if you have real data!');
    rl.close();
    process.exit(0);
  }

  console.log('\n🚀 Starting clean migration...\n');

  // Step 1: Reset database
  if (!runCommand('npx prisma migrate reset --force --skip-seed', 'Reset database')) {
    console.log('\n⚠️  If you got an error, try these steps manually:');
    console.log('1. npx prisma migrate reset --force --skip-seed');
    console.log('2. npx prisma generate');
    console.log('3. npx prisma db push');
    rl.close();
    process.exit(1);
  }

  // Step 2: Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generate Prisma client')) {
    rl.close();
    process.exit(1);
  }

  // Step 3: Push new schema
  console.log('\n📦 Applying new schema...');
  if (!runCommand('npx prisma db push', 'Apply schema to database')) {
    rl.close();
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ MIGRATION COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📝 Next steps:');
  console.log('  1. Check your database - all tables should be clean');
  console.log('  2. Run seed script if you have one: npx prisma db seed');
  console.log('  3. Start your application');
  console.log('\n💡 Your new schema is now active!');

  rl.close();
});
