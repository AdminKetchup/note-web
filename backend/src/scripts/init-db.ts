import fs from 'fs';
import path from 'path';
import { query } from '../db';
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
    console.log('Initializing Database...');

    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    try {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        await pool.query(schemaSql);
        console.log('Database initialized successfully.');
        await pool.end();
    } catch (e) {
        console.error('Failed to init DB:', e);
    }
}

main();
