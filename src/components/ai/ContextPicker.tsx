"use client";

import { FileText, Layout, Search } from 'lucide-react';
import { Page } from '@/lib/workspace';
import { useEffect, useRef, useMemo } from 'react';

interface ContextPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (page: Page) => void;
    availablePages: Page[];
    selectedContext: Page[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export default function ContextPicker({
    isOpen,
    onClose,
    onSelect,
    availablePages,
    selectedContext,
    searchQuery,
    setSearchQuery
}: ContextPickerProps) {
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Focus search when opening
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Optimize filtering with useMemo
    const filteredPages = useMemo(() =>
        availablePages
            .filter(p => !p.inTrash)
            .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())),
        [availablePages, searchQuery]
    );

    return (
        <div className="absolute bottom-8 left-0 w-64 bg-[#1E1E1E] text-white rounded-lg shadow-2xl border border-gray-700 max-h-64 overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-100">
            {/* Search Bar */}
            <div className="p-2 border-b border-gray-700">
                <div className="flex items-center gap-2 bg-[#2C2C2C] rounded px-2 py-1.5 border border-transparent focus-within:border-blue-500 transition-colors">
                    <Search size={14} className="text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search pages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-transparent border-none text-xs text-white placeholder:text-gray-500 w-full focus:outline-none"
                    />
                </div>
            </div>

            <div className="overflow-y-auto flex-1 py-1">
                <div className="px-3 py-1.5 text-[10px] font-bold text-gray-500 uppercase">Pages</div>

                {filteredPages.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-500 italic text-center">No pages found</div>
                ) : (
                    filteredPages.map(page => (
                        <button
                            key={page.id}
                            onClick={() => onSelect(page)}
                            className="w-full text-left px-3 py-2 hover:bg-[#2C2C2C] text-sm flex items-center gap-2.5 transition-colors group"
                        >
                            <div className="w-5 h-5 flex items-center justify-center text-base bg-[#2C2C2C] group-hover:bg-[#333] rounded-sm transition-colors">
                                {page.icon ? page.icon : (page.type === 'database' ? <Layout size={12} className="text-gray-400" /> : <FileText size={12} className="text-gray-400" />)}
                            </div>
                            <div className="flex-1 truncate">
                                <div className="text-gray-200 text-sm truncate">{page.title || "Untitled"}</div>
                                <div className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                    {page.section === 'private' ? 'Private' : 'Teamspace'}
                                    <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                    {/* Ideally pass user name or check current user */}
                                    Page
                                </div>
                            </div>
                            {selectedContext.find(p => p.id === page.id) && <span className="text-blue-500 text-xs">Added</span>}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
