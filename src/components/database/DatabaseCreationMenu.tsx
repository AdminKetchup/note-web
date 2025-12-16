"use client";

import { useState } from 'react';
import { X, Plus, Sparkles, FileUp, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { DATABASE_TEMPLATES, DatabaseTemplate } from '@/lib/database-templates';
import TemplateCard from '@/components/database/TemplateCard';

interface DatabaseCreationMenuProps {
    isOpen: boolean;
    onCreateEmpty: () => void;
    onSelectTemplate: (template: DatabaseTemplate) => void;
    onShowAllTemplates: () => void;
    onClose: () => void;
}

export default function DatabaseCreationMenu({
    isOpen,
    onCreateEmpty,
    onSelectTemplate,
    onShowAllTemplates,
    onClose
}: DatabaseCreationMenuProps) {
    const [pasteInput, setPasteInput] = useState('');

    if (!isOpen) return null;

    // Show top 3 suggested templates (excluding empty)
    const suggestedTemplates = DATABASE_TEMPLATES.filter(t => t.id !== 'empty').slice(0, 3);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white dark:bg-[#1C1C1C] rounded-lg shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        New database
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Paste or Link Input */}
                    <div className="relative">
                        <input
                            type="text"
                            value={pasteInput}
                            onChange={(e) => setPasteInput(e.target.value)}
                            placeholder="Paste or link data source..."
                            className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-[#2C2C2C] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100 placeholder:text-gray-400"
                        />
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 dark:bg-gray-800" />

                    {/* Quick Actions */}
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                onCreateEmpty();
                                onClose();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2C] rounded-lg transition group"
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                <Plus size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                            </div>
                            <span className="flex-1 text-left">New empty data source</span>
                        </button>

                        <button
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2C] rounded-lg transition group"
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                <Sparkles size={16} className="text-purple-500" />
                            </div>
                            <span className="flex-1 text-left">Build with AI</span>
                            <span className="text-xs text-gray-400">Coming soon</span>
                        </button>

                        <button
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2C] rounded-lg transition group"
                        >
                            <div className="w-5 h-5 flex items-center justify-center">
                                <FileUp size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                            </div>
                            <span className="flex-1 text-left">Import CSV</span>
                            <span className="text-xs text-gray-400">Coming soon</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 dark:bg-gray-800" />

                    {/* Suggested Templates */}
                    <div>
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 px-1">
                            Suggested
                        </div>
                        <div className="space-y-1.5">
                            {suggestedTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => {
                                        onSelectTemplate(template);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-[#2C2C2C] rounded-lg transition group"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-xl">
                                        {template.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="font-medium text-gray-900 dark:text-gray-100">
                                            {template.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {template.description}
                                        </div>
                                    </div>
                                    <ArrowRight size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                                </button>
                            ))}
                        </div>

                        {/* More Templates Button */}
                        <button
                            onClick={() => {
                                onShowAllTemplates();
                                onClose();
                            }}
                            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2C2C2C] rounded-lg transition"
                        >
                            <span>More templates</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gray-200 dark:bg-gray-800" />

                    {/* Link to Existing */}
                    <button
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2C2C2C] rounded-lg transition group"
                    >
                        <div className="w-5 h-5 flex items-center justify-center">
                            <LinkIcon size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
                        </div>
                        <span className="flex-1 text-left">Link to existing data source</span>
                        <span className="text-xs text-gray-400">Coming soon</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
