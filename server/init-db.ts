#!/usr/bin/env node

// Script to manually initialize the database
import { initializeDatabase, testConnection } from './src/database/database';

async function main() {
    try {
        console.log('Testing database connection...');
        await testConnection();

        console.log('Initializing database tables...');
        await initializeDatabase();

        console.log('Database initialization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

main();
