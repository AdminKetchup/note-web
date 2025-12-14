import { query } from '..//db';

async function main() {
    console.log('Seeding...');

    // Create a dummy user (for owner) if not exists
    // In real life, this ID should match your Firebase Auth UID
    // For this test, we might just create a page with NULL owner or a specific UUID

    const pageId = '11111111-1111-1111-1111-111111111111';

    try {
        await query(`
      INSERT INTO pages (id, workspace_id, title, content)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO NOTHING
    `, [pageId, '00000000-0000-0000-0000-000000000000', 'Test Page', 'Content']);

        console.log(`Seeded Page ID: ${pageId}`);
    } catch (e) {
        console.error(e);
    }
}

main();
