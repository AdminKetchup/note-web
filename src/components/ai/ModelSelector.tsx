"use client";

import { ChevronDown, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface ModelSelectorProps {
    model: string;
    onModelChange: (model: string) => void;
}

export default function ModelSelector({ model, onModelChange }: ModelSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (newModel: string) => {
        onModelChange(newModel);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded transition"
            >
                <Sparkles size={16} className="text-purple-500" />
                <div className="flex flex-col items-start leading-none">
                    <span>New AI chat</span>
                    <span className="text-[10px] text-gray-400 font-normal">{model.split('/').pop()}</span>
                </div>
                <ChevronDown size={14} className={`opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Model Selector Dropdown */}
            {isOpen && (
                <div className="absolute top-12 left-0 w-64 bg-white dark:bg-[#252525] rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[300px] overflow-y-auto p-1 animate-in z-50 fade-in zoom-in-95 duration-100">
                    <div className="text-[10px] font-semibold text-gray-400 px-2 py-1 uppercase">2025 / Advanced</div>
                    {[
                        "anthropic/claude-4.5-sonnet",
                        "anthropic/claude-4.5-opus",
                        "google/gemini-2.5-flash",
                        "google/gemini-3.0-pro",
                        "openai/gpt-5.2"
                    ].map((m) => (
                        <button
                            key={m}
                            onClick={() => handleSelect(m)}
                            className="w-full text-left px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-200 flex justify-between items-center"
                        >
                            {m === "anthropic/claude-4.5-sonnet" ? "Claude 4.5 Sonnet" :
                                m === "anthropic/claude-4.5-opus" ? "Claude 4.5 Opus" :
                                    m === "google/gemini-2.5-flash" ? "Gemini 2.5 Flash" :
                                        m === "google/gemini-3.0-pro" ? "Gemini 3.0 Pro" :
                                            "GPT-5.2"}
                            {model === m && "✓"}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
