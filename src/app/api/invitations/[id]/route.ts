
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 });
        }

        const invitationRef = doc(db, 'invitations', id);
        const invitationSnap = await getDoc(invitationRef);

        if (!invitationSnap.exists()) {
            return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: invitationSnap.id,
            ...invitationSnap.data()
        });

    } catch (error: any) {
        console.error('Get Invitation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Invitation ID required' }, { status: 400 });
        }

        await deleteDoc(doc(db, 'invitations', id));

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Delete Invitation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
