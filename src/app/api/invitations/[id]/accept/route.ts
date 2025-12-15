import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

export async function POST(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

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

        // Check if expired
        if (invitation.expiresAt.toDate() < new Date()) {
            return NextResponse.json(
                { error: 'Invitation expired' },
                { status: 400 }
            );
        }

        // Add user to page permissions
        const pageRef = doc(db, 'pages', invitation.pageId);
        const pageSnap = await getDoc(pageRef);

        if (!pageSnap.exists()) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            );
        }

        const pageData = pageSnap.data();
        const permissions = pageData.permissions || {
            owner: pageData.ownerId,
            shared: {},
            generalAccess: 'private'
        };

        // Add user with invited role
        // TODO: Get actual userId from auth
        const userId = 'accepted-user-id';
        permissions.shared[userId] = invitation.role;

        await updateDoc(pageRef, { permissions });

        // Mark invitation as accepted
        await updateDoc(invitationRef, { status: 'accepted' });

        return NextResponse.json({
            success: true,
            pageId: invitation.pageId,
            role: invitation.role
        });

    } catch (error: any) {
        console.error('Accept Invitation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
