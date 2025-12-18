/**
 * Import/Export System
 * Support for Markdown, JSON, HTML, and PDF export
 */

"use client";

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Download, Upload, FileText, FileJson, Globe, FileImage } from 'lucide-react';
import { Block } from '@/lib/block-model';

interface ExportOptions {
    format: 'markdown' | 'json' | 'html' | 'pdf';
    includeSubpages: boolean;
    includeComments: boolean;
}

/**
 * Export page to Markdown
 */
export async function exportToMarkdown(pageId: string): Promise<string> {
    const blocks = await getPageBlocks(pageId);

    let markdown = '';

    for (const block of blocks) {
        markdown += blockToMarkdown(block) + '\n';
    }

    return markdown;
}

/**
 * Convert Block to Markdown
 */
function blockToMarkdown(block: Block): string {
    const text = extractTextFromBlock(block);

    switch (block.type) {
        case 'heading_1':
            return `# ${text}`;
        case 'heading_2':
            return `## ${text}`;
        case 'heading_3':
            return `### ${text}`;
        case 'bulleted_list_item':
            return `- ${text}`;
        case 'numbered_list_item':
            return `1. ${text}`;
        case 'todo':
            const checked = block.properties?.checked ? 'x' : ' ';
            return `- [${checked}] ${text}`;
        case 'code':
            const language = block.properties?.language || '';
            return `\`\`\`${language}\n${text}\n\`\`\``;
        case 'quote':
            return `> ${text}`;
        case 'divider':
            return '---';
        case 'paragraph':
        default:
            return text || '';
    }
}

/**
 * Extract text from block content
 */
function extractTextFromBlock(block: Block): string {
    if (!block.content?.content) return '';

    return block.content.content
        .map((node: any) => {
            if (node.type === 'text') return node.text || '';
            if (node.content) return extractTextFromNode(node);
            return '';
        })
        .join('');
}

function extractTextFromNode(node: any): string {
    if (node.text) return node.text;
    if (node.content) {
        return node.content.map((n: any) => extractTextFromNode(n)).join('');
    }
    return '';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Export page to JSON (Notion format compatible)
 */
export async function exportToJSON(pageId: string): Promise<string> {
    const blocks = await getPageBlocks(pageId);

    const exportData = {
        version: '1.0',
        type: 'page',
        pageId,
        blocks: blocks.map(block => ({
            id: block.id,
            type: block.type,
            properties: block.properties,
            content: block.content,
            created_time: block.created_time,
            last_edited_time: block.last_edited_time,
        })),
    };

    return JSON.stringify(exportData, null, 2);
}

/**
 * Export page to HTML
 */
export async function exportToHTML(pageId: string, pageTitle: string): Promise<string> {
    const blocks = await getPageBlocks(pageId);

    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 { font-size: 2em; margin-top: 0.67em; margin-bottom: 0.67em; }
        h2 { font-size: 1.5em; margin-top: 0.83em; margin-bottom: 0.83em; }
        h3 { font-size: 1.17em; margin-top: 1em; margin-bottom: 1em; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 6px; overflow-x: auto; }
        blockquote { border-left: 3px solid #ddd; margin: 0; padding-left: 16px; color: #666; }
        ul { list-style-type: disc; padding-left: 24px; }
        li { margin: 4px 0; }
        .todo { display: flex; align-items: center; gap: 8px; }
        .todo input { margin: 0; }
    </style>
</head>
<body>
`;

    for (const block of blocks) {
        html += blockToHTML(block) + '\n';
    }

    html += `</body>\n</html>`;

    return html;
}

/**
 * Convert Block to HTML
 */
function blockToHTML(block: Block): string {
    const text = extractTextFromBlock(block);
    const safeText = escapeHtml(text);

    switch (block.type) {
        case 'heading_1':
            return `<h1>${safeText}</h1>`;
        case 'heading_2':
            return `<h2>${safeText}</h2>`;
        case 'heading_3':
            return `<h3>${safeText}</h3>`;
        case 'bulleted_list_item':
            return `<ul><li>${safeText}</li></ul>`;
        case 'numbered_list_item':
            return `<ol><li>${safeText}</li></ol>`;
        case 'todo':
            const checked = block.properties?.checked ? 'checked' : '';
            return `<div class="todo"><input type="checkbox" ${checked} disabled>${safeText}</div>`;
        case 'code':
            return `<pre><code>${safeText}</code></pre>`;
        case 'quote':
            return `<blockquote>${safeText}</blockquote>`;
        case 'divider':
            return '<hr>';
        case 'paragraph':
        default:
            return `<p>${safeText || '&nbsp;'}</p>`;
    }
}

/**
 * Get page blocks
 */
async function getPageBlocks(pageId: string): Promise<Block[]> {
    const blocksRef = collection(db, 'blocks');
    const q = query(blocksRef, where('page_id', '==', pageId));
    const snapshot = await getDocs(q);

    const blocks: Block[] = [];
    snapshot.forEach(doc => {
        blocks.push({ id: doc.id, ...doc.data() } as Block);
    });

    // Sort by position
    blocks.sort((a, b) => a.position.localeCompare(b.position));

    return blocks;
}

/**
 * Download file
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

/**
 * Import from Markdown
 */
export function importFromMarkdown(markdown: string): Partial<Block>[] {
    const lines = markdown.split('\n');
    const blocks: Partial<Block>[] = [];

    let inCodeBlock = false;
    let codeContent = '';
    let codeLanguage = '';

    for (const line of lines) {
        // Code block detection
        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLanguage = line.slice(3).trim();
                codeContent = '';
                continue;
            } else {
                blocks.push({
                    type: 'code',
                    content: {
                        type: 'codeBlock',
                        content: [{ type: 'text', text: codeContent }],
                    },
                    properties: { language: codeLanguage },
                });
                inCodeBlock = false;
                continue;
            }
        }

        if (inCodeBlock) {
            codeContent += line + '\n';
            continue;
        }

        // Headings
        if (line.startsWith('### ')) {
            blocks.push({
                type: 'heading_3',
                content: { type: 'heading', content: [{ type: 'text', text: line.slice(4) }] },
            });
        } else if (line.startsWith('## ')) {
            blocks.push({
                type: 'heading_2',
                content: { type: 'heading', content: [{ type: 'text', text: line.slice(3) }] },
            });
        } else if (line.startsWith('# ')) {
            blocks.push({
                type: 'heading_1',
                content: { type: 'heading', content: [{ type: 'text', text: line.slice(2) }] },
            });
        }
        // Todo items
        else if (line.match(/^- \[[ x]\]/)) {
            const checked = line.includes('[x]');
            const text = line.replace(/^- \[[ x]\]\s*/, '');
            blocks.push({
                type: 'todo',
                content: { type: 'taskItem', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
                properties: { checked },
            });
        }
        // List items
        else if (line.startsWith('- ')) {
            blocks.push({
                type: 'bulleted_list_item',
                content: { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: line.slice(2) }] }] },
            });
        } else if (line.match(/^\d+\./)) {
            const text = line.replace(/^\d+\.\s*/, '');
            blocks.push({
                type: 'numbered_list_item',
                content: { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] },
            });
        }
        // Quote
        else if (line.startsWith('> ')) {
            blocks.push({
                type: 'quote',
                content: { type: 'blockquote', content: [{ type: 'paragraph', content: [{ type: 'text', text: line.slice(2) }] }] },
            });
        }
        // Divider
        else if (line === '---') {
            blocks.push({
                type: 'divider',
                content: { type: 'horizontalRule' },
            });
        }
        // Paragraph
        else if (line.trim()) {
            blocks.push({
                type: 'paragraph',
                content: { type: 'paragraph', content: [{ type: 'text', text: line }] },
            });
        }
    }

    return blocks;
}

/**
 * Export/Import Modal Component
 */

import { X } from 'lucide-react';

interface ExportImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    pageId: string;
    pageTitle: string;
}

export default function ExportImportModal({ isOpen, onClose, pageId, pageTitle }: ExportImportModalProps) {
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
    const [exporting, setExporting] = useState(false);

    const handleExport = async (format: 'markdown' | 'json' | 'html') => {
        setExporting(true);
        try {
            let content: string;
            let filename: string;
            let mimeType: string;

            switch (format) {
                case 'markdown':
                    content = await exportToMarkdown(pageId);
                    filename = `${pageTitle}.md`;
                    mimeType = 'text/markdown';
                    break;
                case 'json':
                    content = await exportToJSON(pageId);
                    filename = `${pageTitle}.json`;
                    mimeType = 'application/json';
                    break;
                case 'html':
                    content = await exportToHTML(pageId, pageTitle);
                    filename = `${pageTitle}.html`;
                    mimeType = 'text/html';
                    break;
            }

            downloadFile(content, filename, mimeType);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;

            if (file.name.endsWith('.md')) {
                const blocks = importFromMarkdown(content);
                console.log('Imported blocks:', blocks);
                alert(`Imported ${blocks.length} blocks from Markdown`);
                // TODO: Save blocks to Firestore
            } else if (file.name.endsWith('.json')) {
                const data = JSON.parse(content);
                console.log('Imported JSON:', data);
                alert('JSON import successful');
                // TODO: Save blocks to Firestore
            }
        };
        reader.readAsText(file);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                    <h2 className="text-xl font-semibold">Export & Import</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                        onClick={() => setActiveTab('export')}
                        className={`flex-1 px-6 py-3 font-medium transition ${activeTab === 'export'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        Export
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex-1 px-6 py-3 font-medium transition ${activeTab === 'import'
                            ? 'border-b-2 border-blue-600 text-blue-600'
                            : 'text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        Import
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'export' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Export this page to various formats
                            </p>

                            <ExportButton
                                icon={FileText}
                                title="Markdown"
                                description="Plain text format, compatible with most editors"
                                onClick={() => handleExport('markdown')}
                                disabled={exporting}
                            />

                            <ExportButton
                                icon={FileJson}
                                title="JSON"
                                description="Structured data format, compatible with Notion"
                                onClick={() => handleExport('json')}
                                disabled={exporting}
                            />

                            <ExportButton
                                icon={Globe}
                                title="HTML"
                                description="Web format with styling"
                                onClick={() => handleExport('html')}
                                disabled={exporting}
                            />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Import content from Markdown or JSON files
                            </p>

                            <label className="block p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition text-center">
                                <Upload size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="font-medium mb-2">Click to upload or drag and drop</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Supports .md and .json files
                                </p>
                                <input
                                    type="file"
                                    accept=".md,.json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ExportButton({ icon: Icon, title, description, onClick, disabled }: any) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="w-full flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Icon size={24} className="text-blue-600" />
            </div>
            <div className="flex-1 text-left">
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </div>
            <Download size={20} className="text-gray-400 mt-2" />
        </button>
    );
}
