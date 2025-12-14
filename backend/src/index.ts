import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticate, AuthRequest } from './middleware/auth';
import { checkPermission } from './logic/permissions';
import { query } from './db';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(authenticate);

// API Routes

// Get Page Content (Protected)
app.get('/api/pages/:id', async (req: AuthRequest, res) => {
    const pageId = req.params.id;
    const userId = req.user?.uid || null;

    try {
        const canRead = await checkPermission(userId, pageId, 'READ');
        if (!canRead) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const result = await query('SELECT * FROM pages WHERE id = $1', [pageId]);
        res.json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal User Error' });
    }
});

// Update Page (Protected)
app.patch('/api/pages/:id', async (req: AuthRequest, res) => {
    const pageId = req.params.id;
    const userId = req.user?.uid || null;

    try {
        const canWrite = await checkPermission(userId, pageId, 'WRITE');
        if (!canWrite) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        const { content, title } = req.body;
        await query('UPDATE pages SET content = COALESCE($1, content), title = COALESCE($2, title) WHERE id = $3', [content, title, pageId]);
        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Internal User Error' });
    }
});

// Invite User
app.post('/api/pages/:id/invite', async (req: AuthRequest, res) => {
    const pageId = req.params.id;
    const userId = req.user?.uid;
    const { email, role } = req.body;

    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    try {
        const canShare = await checkPermission(userId, pageId, 'SHARE');
        if (!canShare) {
            res.status(403).json({ error: 'No permission to share' });
            return;
        }

        const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
        // In real app, crypto.randomBytes(32).toString('hex')

        // Create Invitation
        await query(
            `INSERT INTO invitations (page_id, inviter_id, email, role, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, NOW() + INTERVAL '7 days')`,
            [pageId, userId, email, role, token]
        );

        // Mock Email Send
        console.log(`[EMAIL] Invite sent to ${email} with token ${token}`);

        res.json({ success: true, token }); // Return token for demo purposes
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
