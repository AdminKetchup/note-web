import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { cookies } from 'next/headers';

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Get user from session
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session');

        if (!sessionCookie) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        const userId = sessionCookie.value; // TODO: Parse actual auth token

        // Get invitation
        const invitationRef = doc(db, 'invitations', id);
        const invitationSnap = await getDoc(invitationRef);

        if (!invitationSnap.exists()) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        const invitation = invitationSnap.data();

        // Verify email matches
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        const userEmail = userDoc.data()?.email?.toLowerCase();
        if (userEmail !== invitation.email.toLowerCase()) {
            return NextResponse.json(
                { error: 'This invitation is not for your email' },
                { status: 403 }
            );
        }

        // Delete invitation
        await deleteDoc(invitationRef);

        return NextResponse.json({
            success: true,
            message: 'Invitation rejected successfully'
        });

    } catch (error: any) {
        console.error('Reject invitation error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
