export interface Template {
    id: string;
    name: string;
    description: string;
    category: 'work' | 'personal' | 'productivity';
    icon: string;
    content: string;
    tags: string[];
}

export const TEMPLATES: Template[] = [
    {
        id: 'daily-note',
        name: 'Daily Note',
        description: 'Track your day with goals and reflections',
        category: 'personal',
        icon: '📅',
        content: `# Daily Note - {{date}}

## 🎯 Goals Today
- [ ] 

## 📝 Notes


## ✅ Completed


## 💭 Reflections

`,
        tags: ['daily', 'journal', 'personal']
    },
    {
        id: 'meeting-notes',
        name: 'Meeting Notes',
        description: 'Structured format for productive meetings',
        category: 'work',
        icon: '🤝',
        content: `# Meeting: {{title}}

**Date**: {{date}}
**Time**: {{time}}
**Attendees**: 

## 📋 Agenda
1. 

## 💬 Discussion Notes


## ✅ Action Items
- [ ] 

## 📅 Next Steps

`,
        tags: ['meeting', 'work', 'collaboration']
    },
    {
        id: 'todo-list',
        name: 'Todo List',
        description: 'Organize tasks by priority',
        category: 'productivity',
        icon: '✅',
        content: `# Todo List - {{date}}

## 🔴 High Priority
- [ ] 

## 🟡 Medium Priority
- [ ] 

## 🟢 Low Priority
- [ ] 

## ✅ Completed
- [x] 

`,
        tags: ['todo', 'tasks', 'productivity']
    },
    {
        id: 'weekly-review',
        name: 'Weekly Review',
        description: 'Reflect on your week and plan ahead',
        category: 'personal',
        icon: '📊',
        content: `# Weekly Review - Week of {{date}}

## 🎯 Goals This Week
- 

## ✅ Achievements


## 📚 Lessons Learned


## 🚀 Next Week's Focus


## 💭 Personal Reflections

`,
        tags: ['review', 'reflection', 'planning']
    },
    {
        id: 'project-plan',
        name: 'Project Plan',
        description: 'Comprehensive project planning template',
        category: 'work',
        icon: '🎯',
        content: `# Project: {{title}}

## 📝 Overview

**Goal**: 
**Timeline**: 
**Owner**: 

## 🎯 Objectives
- 

## 📋 Tasks
- [ ] 

## 🚧 Risks & Mitigation


## 📊 Success Metrics


## 🔗 Resources

`,
        tags: ['project', 'planning', 'work']
    },
    {
        id: 'brainstorm',
        name: 'Brainstorm',
        description: 'Free-flowing idea generation',
        category: 'productivity',
        icon: '💡',
        content: `# Brainstorm: {{title}}

## 🎯 Goal


## 💡 Ideas
- 

## ⭐ Top Picks


## 🚀 Next Actions

`,
        tags: ['brainstorm', 'ideas', 'creativity']
    },
    {
        id: 'book-notes',
        name: 'Book Notes',
        description: 'Capture insights from your reading',
        category: 'personal',
        icon: '📚',
        content: `# 📖 {{title}}

**Author**: 
**Started**: {{date}}
**Status**: Reading

## 📝 Key Takeaways
- 

## 💡 Insights


## 📌 Favorite Quotes
> 

## ✅ Action Items
- [ ] 

`,
        tags: ['book', 'reading', 'learning']
    },
    {
        id: 'learning-plan',
        name: 'Learning Plan',
        description: 'Structured approach to learning new skills',
        category: 'personal',
        icon: '🎓',
        content: `# Learning: {{title}}

## 🎯 Goal


## 📚 Resources
- 

## 📅 Timeline
- Week 1: 
- Week 2: 
- Week 3: 
- Week 4: 

## ✅ Progress
- [ ] 

## 💭 Reflections

`,
        tags: ['learning', 'education', 'growth']
    },
    {
        id: 'one-on-one',
        name: '1-on-1',
        description: 'Effective one-on-one meeting template',
        category: 'work',
        icon: '👥',
        content: `# 1-on-1: {{title}}

**Date**: {{date}}
**Participant**: 

## 💬 Topics
- 

## ✅ Progress Updates


## 🎯 Goals & Development


## 💭 Feedback


## 📅 Action Items
- [ ] 

`,
        tags: ['1-on-1', 'meeting', 'management']
    },
    {
        id: 'decision-doc',
        name: 'Decision Document',
        description: 'Document important decisions with context',
        category: 'work',
        icon: '⚖️',
        content: `# Decision: {{title}}

**Date**: {{date}}
**Decision Maker**: 
**Status**: Proposed

## 📝 Context


## 🔍 Options Considered
1. 
2. 
3. 

## ✅ Decision


## 🎯 Rationale


## 📊 Impact


## 📅 Next Steps
- [ ] 

`,
        tags: ['decision', 'documentation', 'strategy']
    },
    {
        id: 'retrospective',
        name: 'Retrospective',
        description: 'Team retrospective format',
        category: 'work',
        icon: '🔄',
        content: `# Retrospective - {{date}}

## ✅ What Went Well


## 🚧 What Could Improve


## 💡 Action Items
- [ ] 

## 🎯 Focus for Next Sprint

`,
        tags: ['retrospective', 'agile', 'team']
    },
    {
        id: 'quick-note',
        name: 'Quick Note',
        description: 'Simple note-taking template',
        category: 'productivity',
        icon: '📝',
        content: `# {{title}}

{{date}}

## Notes


## Links

`,
        tags: ['note', 'quick', 'simple']
    }
];

// Helper function to render template with variables
export function renderTemplate(
    template: Template,
    variables: Record<string, string> = {}
): string {
    let content = template.content;

    // Default variables
    const defaults = {
        date: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }),
        time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        }),
        title: 'Untitled'
    };

    const allVars = { ...defaults, ...variables };

    // Replace all {{variable}}
    Object.entries(allVars).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        content = content.replace(regex, value);
    });

    return content;
}

// Get templates by category
export function getTemplatesByCategory(category: Template['category']): Template[] {
    return TEMPLATES.filter(t => t.category === category);
}

// Search templates
export function searchTemplates(query: string): Template[] {
    const lowerQuery = query.toLowerCase();
    return TEMPLATES.filter(t =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description.toLowerCase().includes(lowerQuery) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
}
