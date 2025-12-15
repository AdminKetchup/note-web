"use client";

import { ArrowUp, Globe, Paperclip, X, FileText } from 'lucide-react';
import { useRef } from 'react';
import { Page } from '@/lib/workspace';

interface ChatInputProps {
    input: string;
    setInput: (value: string) => void; // Allow functional update? No, just keep it simple for now
    onSend: () => void;
    loading: boolean;
    isWebMode: boolean;
    toggleWebMode: () => void;
    selectedContext: Page[];
    onRemoveContext: (pageId: string) => void;
    onAddContextClick: () => void;
}

export default function ChatInput({
    input,
    setInput,
    onSend,
    loading,
    isWebMode,
    toggleWebMode,
    selectedContext,
    onRemoveContext,
    onAddContextClick
}: ChatInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const text = ev.target?.result as string;
                // Append to current input
                setInput(input + `\n[Attached File: ${file.name}]\n${text} \n`);
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1C1C1C]">
            {selectedContext.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto">
                    {selectedContext.map(page => (
                        <span key={page.id} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded flex items-center gap-1">
                            <FileText size={10} />
                            {page.title}
                            <button onClick={() => onRemoveContext(page.id)} className="hover:text-blue-800"><X size={10} /></button>
                        </span>
                    ))}
                </div>
            )}

            <div className="relative bg-gray-50 dark:bg-[#2C2C2C] rounded-xl border border-gray-200 dark:border-gray-700 p-2 focus-within:ring-2 focus-within:ring-black/5 dark:focus-within:ring-white/10 transition-all">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                    placeholder={loading ? "Thinking..." : "Message AI..."}
                    className="w-full bg-transparent border-none focus:outline-none text-sm p-1 text-gray-900 dark:text-white"
                    autoFocus
                    disabled={loading}
                />
                <div className="flex justify-between items-center mt-2 px-1">
                    <div className="flex gap-1">
                        <div className="relative">
                            <button
                                onClick={onAddContextClick}
                                className="flex items-center gap-1 text-xs text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded transition"
                            >
                                <span className="font-bold">@</span> Add context
                            </button>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-400 hover:text-black dark:hover:text-white p-1 rounded relative"
                            title="Attach file (Text/MD)"
                        >
                            <Paperclip size={14} />
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".txt,.md,.json,.csv"
                                onChange={handleFileChange}
                            />
                        </button>
                        <button
                            onClick={toggleWebMode}
                            className={`p-1 rounded transition ${isWebMode ? "text-blue-500 bg-blue-50 dark:bg-blue-900/30" : "text-gray-400 hover:text-black dark:hover:text-white"}`}
                            title="Toggle Web Knowledge"
                        >
                            <Globe size={14} />
                        </button>
                    </div>
                    <button
                        onClick={onSend}
                        disabled={loading || (!input.trim() && selectedContext.length === 0)}
                        className={`w-7 h-7 rounded-sm flex items-center justify-center transition-all ${input.trim() ? "bg-black text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                        <ArrowUp size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
