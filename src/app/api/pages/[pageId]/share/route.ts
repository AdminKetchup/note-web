import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(
    req: Request,
    context: { params: Promise<{ pageId: string }> }
) {
    try {
        const { email, role } = await req.json();
        const { pageId } = await context.params;

        if (!email || !role) {
            return NextResponse.json(
                { error: 'Email and role are required' },
                { status: 400 }
            );
        }

        // Verify page exists and get current user's permissions
        const pageRef = doc(db, 'pages', pageId);
        const pageSnap = await getDoc(pageRef);

        if (!pageSnap.exists()) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            );
        }

        // Create invitation
        const invitationRef = await addDoc(collection(db, 'invitations'), {
            pageId,
            email,
            role, // 'editor' or 'viewer'
            invitedBy: 'current-user-id', // TODO: Get from auth
            status: 'pending',
            createdAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });

        // TODO: Send email notification

        return NextResponse.json({
            success: true,
            invitationId: invitationRef.id,
            message: 'Invitation sent successfully'
        });

    } catch (error: any) {
        console.error('Share API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
