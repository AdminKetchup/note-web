import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: Request) {
    try {
        const { apiKey, userId } = await req.json();

        if (!apiKey || !userId) {
            return NextResponse.json(
                { error: 'API key and user ID are required' },
                { status: 400 }
            );
        }

        // Validate API key format (basic check)
        if (typeof apiKey !== 'string' || apiKey.length < 10) {
            return NextResponse.json(
                { error: 'Invalid API key format' },
                { status: 400 }
            );
        }

        // Encrypt the API key
        const encryptedKey = encrypt(apiKey);

        // Store in Firestore under user's private settings
        const settingsRef = doc(db, 'users', userId, 'private', 'settings');
        await setDoc(settingsRef, {
            openrouterKey: encryptedKey,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        return NextResponse.json({
            success: true,
            message: 'API key saved securely'
        });

    } catch (error: any) {
        console.error('Error saving API key:', error);
        return NextResponse.json(
            { error: 'Failed to save API key' },
            { status: 500 }
        );
    }
}

// GET endpoint to check if user has API key configured
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        const settingsRef = doc(db, 'users', userId, 'private', 'settings');
        const { getDoc } = await import('firebase/firestore');
        const settingsDoc = await getDoc(settingsRef);

        const hasKey = settingsDoc.exists() && !!settingsDoc.data()?.openrouterKey;

        return NextResponse.json({
            hasApiKey: hasKey
        });

    } catch (error: any) {
        console.error('Error checking API key:', error);
        return NextResponse.json(
            { error: 'Failed to check API key status' },
            { status: 500 }
        );
    }
}
