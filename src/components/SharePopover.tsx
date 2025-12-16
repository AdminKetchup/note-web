"use client";

import { useState } from "react";
import { Copy, X } from "lucide-react";
import { toast } from "sonner";
import { ShareDialog } from "./ShareDialog";

interface SharePopoverProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    pageUrl: string;
}

export default function SharePopover({ isOpen, onClose, workspaceId, pageUrl }: SharePopoverProps) {
    const [showFullDialog, setShowFullDialog] = useState(false);

    if (!isOpen) return null;

    const handleCopyLink = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(pageUrl);
        toast.success("Link copied to clipboard!");
    };

    const handleOpenDialog = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowFullDialog(true);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-transparent z-40"
                onClick={onClose}
            />

            {/* Popover */}
            <div
                className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-[#1C1C1C] border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl z-50"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-800">
                    <h3 className="font-semibold text-sm">Share</h3>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                        }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                    {/* Copy Link Button */}
                    <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition text-sm"
                    >
                        <span>Copy link</span>
                        <Copy size={14} />
                    </button>

                    {/* Invite People Button */}
                    <button
                        onClick={handleOpenDialog}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-sm"
                    >
                        Invite people
                    </button>
                </div>
            </div>

            {/* Full Share Dialog */}
            {showFullDialog && (
                <ShareDialog
                    isOpen={showFullDialog}
                    onClose={() => {
                        setShowFullDialog(false);
                        onClose();
                    }}
                    pageId={pageUrl.split('/').pop() || ''}
                />
            )}
        </>
    );
}
