/**
 * Shared Modal Component
 * Reusable modal with consistent styling and behavior
 */

"use client";

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
    hideCloseButton?: boolean;
    closeOnBackdropClick?: boolean;
}

const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
};

export default function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    hideCloseButton = false,
    closeOnBackdropClick = true,
}: ModalProps) {
    // Close on ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = () => {
        if (closeOnBackdropClick) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                className={`bg-white dark:bg-[#1C1C1C] rounded-lg shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {(title || !hideCloseButton) && (
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        {title && (
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                {title}
                            </h2>
                        )}
                        {!hideCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                aria-label="Close modal"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                {children}
            </div>
        </div>
    );
}

/**
 * Modal Content - for scrollable content area
 */
interface ModalContentProps {
    children: ReactNode;
    className?: string;
}

export function ModalContent({ children, className = '' }: ModalContentProps) {
    return (
        <div className={`flex-1 overflow-y-auto p-6 ${className}`}>
            {children}
        </div>
    );
}

/**
 * Modal Footer - for action buttons
 */
interface ModalFooterProps {
    children: ReactNode;
    className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
    return (
        <div className={`px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between ${className}`}>
            {children}
        </div>
    );
}
