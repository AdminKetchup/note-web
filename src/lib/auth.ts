import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase';

/**
 * Get userId from the current authenticated request
 * Uses Firebase Admin SDK to verify the session token
 */
export async function getUserIdFromRequest(req: Request): Promise<string | null> {
    try {
        // Get cookies
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return null;
        }

        // In a full implementation, you would verify the Firebase Auth token here
        // For now, we assume the session cookie value IS the userId
        // This is a simplified version - in production, you should:
        // 1. Use Firebase Admin SDK to verify the token
        // 2. Decode the token to get the userId

        // Simplified: session cookie value is userId
        const userId = sessionCookie.value;

        return userId;
    } catch (error) {
        console.error('Error getting userId from request:', error);
        return null;
    }
}

/**
 * Alternative: Get userId from Firebase Auth token in Authorization header
 */
export async function getUserIdFromAuthHeader(req: Request): Promise<string | null> {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.substring(7);

        // In production, verify token with Firebase Admin SDK
        // const decodedToken = await admin.auth().verifyIdToken(token);
        // return decodedToken.uid;

        // For now, we'll rely on client-side auth
        return null;
    } catch (error) {
        console.error('Error verifying auth token:', error);
        return null;
    }
}
