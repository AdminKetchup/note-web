/**
 * Workspace Layout with Global Components
 * Preserves original Sidebar + adds CommandPalette, NotificationCenter, Keyboard Shortcuts
 */

"use client";

import { useState } from 'react';
import Sidebar from "@/components/Sidebar";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { getWorkspace } from "@/lib/workspace";
import CommandPalette from '@/components/CommandPalette';
import NotificationCenter from '@/components/NotificationCenter';
import { NotificationBadge } from '@/components/NotificationCenter';
import ShortcutsModal from '@/components/ShortcutsModal';
import { useKeyboardShortcuts, Shortcut, getModifierKey } from '@/hooks/useKeyboardShortcuts';

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const workspaceId = params.workspaceId as string;
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checking, setChecking] = useState(true);

    // Global UI State
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

    useEffect(() => {
        if (authLoading) return; // Wait for Auth to init

        if (!user) {
            router.push('/');
            return;
        }

        checkAccess();
    }, [user, authLoading, workspaceId]);

    const checkAccess = async () => {
        if (!user) return;
        setChecking(true);
        try {
            const workspace = await getWorkspace(workspaceId);
            if (!workspace) {
                // Workspace doesn't exist
                router.push('/');
                return;
            }

            if (workspace.members.includes(user.uid)) {
                setIsAuthorized(true);
            } else {
                // Not a member
                alert("You do not have permission to access this workspace.");
                router.push('/');
            }
        } catch (error) {
            console.error(error);
            router.push('/');
        }
        setChecking(false);
    };

    // Global Keyboard Shortcuts
    const shortcuts: Shortcut[] = [
        {
            id: 'command-palette',
            name: 'Command Palette',
            description: 'Open quick search',
            keys: [getModifierKey(), 'K'],
            category: 'navigation',
            handler: () => setIsCommandPaletteOpen(true),
            enabled: true,
        },
        {
            id: 'notifications',
            name: 'Notifications',
            description: 'Toggle notifications',
            keys: [getModifierKey(), 'Shift', 'N'],
            category: 'navigation',
            handler: () => setIsNotificationsOpen(prev => !prev),
            enabled: true,
        },
        {
            id: 'shortcuts-help',
            name: 'Keyboard Shortcuts',
            description: 'Show keyboard shortcuts',
            keys: [getModifierKey(), '/'],
            category: 'general',
            handler: () => setIsShortcutsOpen(true),
            enabled: true,
        },
    ];

    // Register global shortcuts
    useKeyboardShortcuts(shortcuts);

    if (authLoading || checking) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-400 text-sm">
                Verifying access...
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="flex h-screen w-full bg-white text-gray-900 font-sans">
            <Sidebar workspaceId={workspaceId} />
            <main className="flex-1 overflow-y-auto h-full relative">
                {children}
            </main>

            {/* Global Modals/Sidebars */}
            {user && (
                <>
                    <CommandPalette
                        isOpen={isCommandPaletteOpen}
                        onClose={() => setIsCommandPaletteOpen(false)}
                        workspaceId={workspaceId}
                    />

                    <NotificationCenter
                        userId={user.uid}
                        isOpen={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                    />

                    <ShortcutsModal
                        isOpen={isShortcutsOpen}
                        onClose={() => setIsShortcutsOpen(false)}
                    />
                </>
            )}
        </div>
    );
}
