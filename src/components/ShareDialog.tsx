import React, { useState, useEffect } from 'react';
import { X, Globe, Lock, Copy, ChevronDown, UserPlus } from 'lucide-react';
import { fetchAPI } from '@/lib/api';

interface ShareDialogProps {
    pageId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareDialog({ pageId, isOpen, onClose }: ShareDialogProps) {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
    const [loading, setLoading] = useState(false);
    const [inviteToken, setInviteToken] = useState('');

    // Create a proper interface for Page data
    const [pageData, setPageData] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            loadPageData();
        }
    }, [isOpen]);

    const loadPageData = async () => {
        try {
            const data = await fetchAPI(`/api/pages/${pageId}`);
            setPageData(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleInvite = async () => {
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetchAPI(`/api/pages/${pageId}/invite`, 'POST', { email, role });
            if (res.success) {
                setInviteToken(res.token); // For demo
                setEmail('');
                alert('Invitation sent! (Token: ' + res.token + ')');
            }
        } catch (e) {
            alert('Failed to invite');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center zs-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h2 className="font-semibold text-lg">Share</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Invite Section */}
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="Add people, emails..."
                            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <select
                            className="border rounded px-2 text-sm bg-white"
                            value={role}
                            onChange={(e) => setRole(e.target.value as any)}
                        >
                            <option value="EDITOR">Can edit</option>
                            <option value="VIEWER">Can view</option>
                        </select>
                        <button
                            onClick={handleInvite}
                            disabled={loading || !email}
                            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            Invite
                        </button>
                    </div>

                    {/* General Access */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-700">General access</h3>
                        <div className="flex items-start gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                                {pageData?.general_access_level === 'PUBLIC' ? <Globe size={20} /> : <Lock size={20} />}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <select
                                        className="flex-1 text-sm font-medium bg-transparent hover:bg-gray-50 p-1 rounded cursor-pointer outline-none"
                                        value={pageData?.general_access_level || 'RESTRICTED'}
                                        disabled
                                    >
                                        <option value="RESTRICTED">Restricted</option>
                                        <option value="PUBLIC">Anyone with the link</option>
                                    </select>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Only people with access can open with the link
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4 flex justify-between items-center">
                        <button className="flex items-center gap-2 text-blue-600 text-sm font-medium px-2 py-1 hover:bg-blue-50 rounded">
                            <Copy size={16} />
                            Copy link
                        </button>
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
