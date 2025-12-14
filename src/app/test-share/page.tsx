"use client";

import React, { useState } from 'react';
import { ShareDialog } from '@/components/ShareDialog';

export default function TestSharePage() {
    const [isOpen, setIsOpen] = useState(false);
    // Using the ID from our seed script
    const pageId = '11111111-1111-1111-1111-111111111111';

    return (
        <div className="p-10 flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Share Dialog Test</h1>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-black text-white rounded"
            >
                Open Share
            </button>

            <ShareDialog
                pageId={pageId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </div>
    );
}
