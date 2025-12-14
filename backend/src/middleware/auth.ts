import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin (Need service account later)
// For now, we'll try to use default credentials or env vars
try {
    if (!admin.apps.length) {
        admin.initializeApp();
    }
} catch (e) {
    console.warn("Firebase Admin init failed. Auth may not work until configured.", e);
}

export interface AuthRequest extends Request {
    user?: {
        uid: string;
        email?: string;
    };
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        (req as AuthRequest).user = undefined; // Anonymous
        return next();
    }

    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        (req as AuthRequest).user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    } catch (error) {
        console.error('Auth Verify Error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
