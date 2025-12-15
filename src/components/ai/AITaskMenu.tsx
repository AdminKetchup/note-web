"use client";

import { useState } from 'react';
import {
    Sparkles,
    Languages,
    FileText,
    Wand2,
    CheckCircle2,
    MessageCircle,
    List,
    ChevronRight
} from 'lucide-react';

export enum AITask {
    SUMMARIZE = 'summarize',
    TRANSLATE = 'translate',
    EXPAND = 'expand',
    SIMPLIFY = 'simplify',
    FIX_GRAMMAR = 'fix_grammar',
    CHANGE_TONE = 'change_tone',
    EXTRACT_ACTIONS = 'extract_actions',
    CONTINUE_WRITING = 'continue_writing',
}

const TASK_CONFIG = {
    [AITask.SUMMARIZE]: {
        icon: FileText,
        label: 'Summarize',
        prompt: `You are a professional summarization expert. Your task is to create a concise, accurate summary.

REQUIREMENTS:
- Provide EXACTLY 3-5 bullet points
- Each bullet point should be a complete sentence
- Capture only the most important information
- Use clear, simple language
- Start each bullet with a dash (-)
- Do NOT include any introduction like "Here's a summary:" or "The text discusses:"
- Do NOT include any conclusion or closing remarks
- Output ONLY the bullet points, nothing else

FORMAT:
- First key point here
- Second key point here
- Third key point here

TEXT TO SUMMARIZE:`,
        color: 'text-blue-600'
    },
    [AITask.TRANSLATE]: {
        icon: Languages,
        label: 'Translate to Korean',
        prompt: `You are a professional translator specializing in Korean translation.

REQUIREMENTS:
- Translate the entire text to natural, fluent Korean
- Maintain the original meaning and tone exactly
- Use appropriate formality level (formal/casual based on source)
- Preserve any formatting (line breaks, emphasis, etc.)
- Do NOT add any introduction like "Here's the translation:" or "번역 결과:"
- Do NOT add any explanations or notes
- Output ONLY the translated Korean text, nothing else

TEXT TO TRANSLATE:`,
        color: 'text-green-600'
    },
    [AITask.EXPAND]: {
        icon: Wand2,
        label: 'Expand',
        prompt: `You are a professional content writer. Your task is to expand the given text with more detail.

REQUIREMENTS:
- Expand the text to 2-3x the original length
- Add relevant details, examples, and context
- Maintain the original tone and style
- Keep the same perspective (1st person, 3rd person, etc.)
- Add depth while staying on topic
- Use natural, flowing language
- Do NOT add any introduction like "Here's an expanded version:"
- Do NOT add any meta-commentary about the expansion
- Output ONLY the expanded text, nothing else

TEXT TO EXPAND:`,
        color: 'text-purple-600'
    },
    [AITask.SIMPLIFY]: {
        icon: MessageCircle,
        label: 'Simplify',
        prompt: `You are an expert at explaining complex topics in simple terms.

REQUIREMENTS:
- Rewrite the text using simple, everyday language
- Break down complex concepts into easy-to-understand ideas
- Use short sentences and common words
- Explain any technical terms if they must be used
- Maintain the core message and meaning
- Make it readable for a general audience
- Do NOT add any introduction like "Here's a simpler version:"
- Do NOT add explanations about what you did
- Output ONLY the simplified text, nothing else

TEXT TO SIMPLIFY:`,
        color: 'text-orange-600'
    },
    [AITask.FIX_GRAMMAR]: {
        icon: CheckCircle2,
        label: 'Fix Grammar',
        prompt: `You are a professional editor and proofreader.

REQUIREMENTS:
- Fix ALL grammar mistakes
- Fix ALL spelling errors
- Fix ALL punctuation errors
- Improve sentence structure where needed
- Maintain the original meaning and tone
- Keep the same style and voice
- Do NOT change the meaning or add new content
- Do NOT add any notes about what you fixed
- Output ONLY the corrected text, nothing else

TEXT TO CORRECT:`,
        color: 'text-red-600'
    },
    [AITask.CHANGE_TONE]: {
        icon: MessageCircle,
        label: 'Make Professional',
        prompt: `You are a professional business communication expert.

REQUIREMENTS:
- Rewrite in a formal, professional business tone
- Use professional vocabulary and phrasing
- Remove casual language, slang, or informal expressions
- Maintain politeness and respect
- Keep the core message intact
- Use complete sentences and proper structure
- Avoid contractions (use "do not" instead of "don't")
- Do NOT add any introduction like "Here's a professional version:"
- Do NOT add explanations
- Output ONLY the professionally rewritten text, nothing else

TEXT TO REWRITE:`,
        color: 'text-indigo-600'
    },
    [AITask.EXTRACT_ACTIONS]: {
        icon: List,
        label: 'Extract Action Items',
        prompt: `You are a project manager expert at identifying action items.

REQUIREMENTS:
- Extract ALL action items, tasks, and to-dos from the text
- Format each as a clear, actionable bullet point
- Start each with an action verb (Review, Create, Send, etc.)
- Be specific about what needs to be done
- Include relevant details (deadlines, people, etc.) if mentioned
- Order by priority or chronological order if applicable
- Use dash (-) for bullet points
- Do NOT add any introduction like "Here are the action items:"
- Do NOT add section headers or explanations
- Output ONLY the bullet point list, nothing else

FORMAT:
- Action verb + specific task + details
- Action verb + specific task + details

TEXT TO ANALYZE:`,
        color: 'text-yellow-600'
    },
    [AITask.CONTINUE_WRITING]: {
        icon: Sparkles,
        label: 'Continue Writing',
        prompt: `You are a creative writing assistant.

REQUIREMENTS:
- Continue writing naturally from where the text ends
- Match the EXACT tone, style, and voice of the original
- Maintain consistency with the existing content
- Keep the same perspective and tense
- Add 2-3 paragraphs of continuation
- Make it flow seamlessly from the original
- Stay on topic and maintain logical progression
- Do NOT add any introduction like "Here's a continuation:"
- Do NOT break the fourth wall or mention you're continuing
- Output ONLY the continuation text, nothing else

TEXT TO CONTINUE:`,
        color: 'text-pink-600'
    },
};

interface AITaskMenuProps {
    selectedText: string;
    onTaskSelect: (task: AITask, prompt: string) => void;
    onClose: () => void;
    position: { x: number; y: number };
}

export default function AITaskMenu({
    selectedText,
    onTaskSelect,
    onClose,
    position
}: AITaskMenuProps) {
    const [hoveredTask, setHoveredTask] = useState<AITask | null>(null);

    const handleTaskClick = (task: AITask) => {
        const config = TASK_CONFIG[task];
        const fullPrompt = `${config.prompt}\n\n${selectedText}`;
        onTaskSelect(task, fullPrompt);
        onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Menu */}
            <div
                className="fixed z-50 bg-white dark:bg-[#1C1C1C] rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 p-1 min-w-[240px] animate-in fade-in zoom-in-95 duration-200"
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                }}
            >
                {/* Header */}
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-600" />
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        AI Tasks
                    </span>
                </div>

                {/* Task List */}
                <div className="py-1">
                    {Object.entries(TASK_CONFIG).map(([task, config]) => {
                        const Icon = config.icon;
                        const isHovered = hoveredTask === task;

                        return (
                            <button
                                key={task}
                                onClick={() => handleTaskClick(task as AITask)}
                                onMouseEnter={() => setHoveredTask(task as AITask)}
                                onMouseLeave={() => setHoveredTask(null)}
                                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-[#252525] rounded transition-colors group text-left"
                            >
                                <Icon
                                    size={16}
                                    className={`${config.color} opacity-70 group-hover:opacity-100 transition-opacity`}
                                />
                                <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                    {config.label}
                                </span>
                                <ChevronRight
                                    size={14}
                                    className={`text-gray-400 transition-transform ${isHovered ? 'translate-x-0.5' : ''
                                        }`}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800 text-[10px] text-gray-400">
                    {selectedText.length > 100
                        ? `${selectedText.substring(0, 100)}...`
                        : selectedText}
                </div>
            </div>
        </>
    );
}
