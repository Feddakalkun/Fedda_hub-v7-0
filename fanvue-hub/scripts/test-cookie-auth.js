/**
 * Test script for cookie-based Fanvue authentication
 * Usage: node scripts/test-cookie-auth.js
 */

const { FanvueClient } = require('../lib/fanvue-client');

async function testCookieAuth() {
    console.log('='.repeat(60));
    console.log('Testing Cookie-Based Fanvue Authentication');
    console.log('='.repeat(60));
    console.log('');

    // Test Emily
    console.log('1️⃣  Testing Emily cookie authentication...');
    try {
        const emilyClient = FanvueClient.forPersona('emily');
        const emilyUser = await emilyClient.getCurrentUser();
        console.log('✅ Emily authenticated successfully!');
        console.log('   User:', emilyUser.username || emilyUser.id);
        console.log('');
    } catch (error) {
        console.error('❌ Emily authentication failed:', error.message);
        console.log('');
    }

    // Test Thale
    console.log('2️⃣  Testing Thale cookie authentication...');
    try {
        const thaleClient = FanvueClient.forPersona('thale');
        const thaleUser = await thaleClient.getCurrentUser();
        console.log('✅ Thale authenticated successfully!');
        console.log('   User:', thaleUser.username || thaleUser.id);
        console.log('');
    } catch (error) {
        console.error('❌ Thale authentication failed:', error.message);
        console.log('');
    }

    console.log('='.repeat(60));
    console.log('Test Complete');
    console.log('='.repeat(60));
}

testCookieAuth().catch(console.error);
