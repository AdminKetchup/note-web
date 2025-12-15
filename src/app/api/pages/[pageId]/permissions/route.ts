import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function GET(
    req: Request,
    context: { params: Promise<{ pageId: string }> }
) {
    try {
        const { pageId } = await context.params;

        const pageRef = doc(db, 'pages', pageId);
        const pageSnap = await getDoc(pageRef);

        if (!pageSnap.exists()) {
            return NextResponse.json(
                { error: 'Page not found' },
                { status: 404 }
            );
        }

        const pageData = pageSnap.data();
        const permissions = pageData.permissions || {
            owner: pageData.ownerId || 'unknown',
            shared: {},
            generalAccess: 'private'
        };

        return NextResponse.json({ permissions });

    } catch (error: any) {
        console.error('Get Permissions Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    context: { params: Promise<{ pageId: string }> }
) {
    try {
        const { userId, role } = await req.json();
        const { pageId } = await context.params;

        const pageRef = doc(db, 'pages', pageId);
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

        // Update permissions
        if (role === null) {
            // Remove user
            delete permissions.shared[userId];
        } else {
            // Add or update user role
            permissions.shared[userId] = role;
        }

        await updateDoc(pageRef, { permissions });

        return NextResponse.json({
            success: true,
            permissions
        });

    } catch (error: any) {
        console.error('Update Permissions Error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
