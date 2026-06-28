import React from 'react';

// Array containing core technical expertise data (compliant with arr prefix naming convention).
export const arrSkillsData = [
  {
    strId: 'frontend',
    strTitle: 'Frontend Architecture & React',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="2" fill="currentColor"/>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(30 12 12)"/>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(90 12 12)"/>
        <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(150 12 12)"/>
      </svg>
    ),
    strThemeColor: '#2563eb', // Vibrant Royal Blue
    strThemeLight: '#eff6ff', // Light Blue tint
    strShortDesc: 'Building scalable, modular web applications with modern state management.',
    arrMicroSkills: [
      'React modular component design & custom hooks',
      'Advanced state management (Redux Toolkit, Context API)',
      'Performance optimization (Code splitting, Memoization)'
    ],
    objDetails: {
      strAnimations: 'Framer Motion for layout transitions, GSAP for complex timeline orchestrations.',
      strThreeD: 'Three.js integrated via React Three Fiber for interactive canvas backgrounds.',
      arrBooksCerts: [
        'Egghead.io - Advanced React Component Patterns',
        'Book: "Eloquent JavaScript" by Marijn Haverbeke',
        'Meta Front-End Developer Professional Certificate'
      ],
      strDebugStory: 'CSS Problem Solving: Deep mastery of Chrome DevTools. Inspecting elements, debugging box-models, and testing flexbox layers.'
    }
  },
  {
    strId: 'css',
    strTitle: 'UI Engineering & Styling',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.5 0h21l-1.91 21.563L12 24l-8.59-2.438L1.5 0zm17.072 6.25H5.06l.444 5h10.816l-.444 5-5.904 1.63-5.903-1.63-.382-4.3H3.21l.666 7.5 8.124 2.25 8.124-2.25 1.07-12.062-.572-1.188z"/>
      </svg>
    ),
    strThemeColor: '#7c3aed', // Purple
    strThemeLight: '#f5f3ff', // Light Purple tint
    strShortDesc: 'Crafting responsive, pixel-perfect user interfaces with a focus on maintainability.',
    arrMicroSkills: [
      'Tailwind CSS configuration & design tokens',
      'CSS Modules & BEM methodology for scoping',
      'Responsive layouts using CSS Grid & Flexbox layouts'
    ],
    objDetails: {
      strAnimations: 'Keyframe UI micro-interactions, CSS-only hardware-accelerated transitions.',
      strThreeD: 'CSS 3D transforms (perspective, rotate3d) for lightweight UI card flips.',
      arrBooksCerts: [
        'CSS for JS Developers - Josh W. Comeau',
        'Book: "Designing User Interfaces" by Michal Malewicz'
      ],
      strDebugStory: 'Structural Integrity: Using strict naming conventions and component-driven styles to eliminate global CSS pollution.'
    }
  },
  {
    strId: 'backend',
    strTitle: 'Backend Development & FastAPI',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.923 1.586H11.23v20.828h1.693V1.586zm5.82 5.093c-.947-.638-2.234-.959-3.864-.959v2.545c.895 0 1.564.168 2.006.505.44.336.662.884.662 1.644v1.89h-2.668c-1.442 0-2.527.323-3.255.972-.729.648-1.093 1.554-1.093 2.716 0 1.093.336 1.947 1.008 2.563.673.616 1.576.924 2.708.924 1.258 0 2.366-.505 3.325-1.515v1.272h1.693V10.42c0-1.637-.47-2.886-1.522-3.741zm-.522 7.828c-.378.503-.923.755-1.638.755-.472 0-.853-.134-1.144-.403-.29-.268-.436-.638-.436-1.109 0-.528.187-.927.563-1.197.375-.27.97-.406 1.785-.406h.87v2.36zM5.385 7.643c-.887 0-1.567.332-2.038.995v-.838H1.654v14.028h1.692V14.15c.47.663 1.15 1.002 2.039 1.002 1.25 0 2.277-.52 3.08-1.563.805-1.042 1.206-2.457 1.206-4.246 0-1.8-.401-3.218-1.206-4.253-.803-1.035-1.83-1.553-3.08-1.553zm-.212 6.079c-.503 0-.917-.184-1.242-.553-.325-.37-.488-.91-.488-1.623 0-.72.163-1.264.488-1.633.325-.37.739-.555 1.242-.555.51 0 .927.185 1.253.555.326.37.49.913.49 1.633 0 .713-.164 1.253-.49 1.623-.326.37-.743.553-1.253.553z"/>
      </svg>
    ),
    strThemeColor: '#059669', // Green
    strThemeLight: '#ecfdf5', // Light Green tint
    strShortDesc: 'Developing robust API services and managing database schemas.',
    arrMicroSkills: [
      'FastAPI REST Framework implementation',
      'JWT Authentication & token handling',
      'SQLite & PostgreSQL database management'
    ],
    objDetails: {
      strAnimations: 'N/A (API responses only)',
      strThreeD: 'N/A',
      arrBooksCerts: [
        'FastAPI for Professionals - William S. Vincent',
        'DRF Documentation and Best Practices'
      ],
      strDebugStory: 'Debugging Database Queries: Resolving N+1 query problems in DRF using select_related and prefetch_related optimizations.'
    }
  },
  {
    strId: 'lxd',
    strTitle: 'Learning Experience Design',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M1.5 0h21l-1.91 21.563L12 24l-8.59-2.438L1.5 0zm17.072 6.25H7.31l.222 2.5h10.816l-.444 5-5.904 1.63-5.903-1.63-.382-4.3H3.21l.666 7.5 8.124 2.25 8.124-2.25 1.07-12.062-.572-1.188z"/>
      </svg>
    ),
    strThemeColor: '#e11d48', // Rose
    strThemeLight: '#fff1f2', // Light Rose tint
    strShortDesc: 'Applying instructional design methods to build effective educational software.',
    arrMicroSkills: [
      'Cognitive load theory application',
      'Scaffolding & feedback loops',
      'User educational testing'
    ],
    objDetails: {
      strAnimations: 'Animated feedback alerts for user responses.',
      strThreeD: 'Spatial mental models visual representation.',
      arrBooksCerts: [
        'Design for How People Learn - Julie Dirksen',
        'Cognitive Load Theory - John Sweller'
      ],
      strDebugStory: 'Reducing Friction: Analyzing user drop-off during onboarding steps to simplify and chunk the cognitive requirements.'
    }
  },
  {
    strId: 'state',
    strTitle: 'State Management',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M3 3h18v18H3V3zm11.39 12.03c.53.5 1.13.78 1.96.78 1.1 0 1.77-.57 1.77-1.39 0-1-.87-1.28-1.99-1.74l-.56-.22c-1.61-.64-2.43-1.63-2.43-2.99 0-1.61 1.3-2.83 3.32-2.83 1.34 0 2.37.39 3.07 1.12l-1.32 1.54c-.45-.44-1.02-.74-1.7-.74-1 0-1.56.5-1.56 1.18 0 .89.8 1.14 1.84 1.54l.58.22c1.78.68 2.58 1.63 2.58 3.12 0 1.81-1.37 2.99-3.5 2.99-1.84 0-3.08-.68-3.95-1.56l1.39-1.62zm-6.02 1.48c-.5.48-1.12.78-1.88.78-.96 0-1.65-.48-1.92-1.3l-1.78.64c.54 1.58 1.94 2.56 3.8 2.56 1.92 0 3.65-1.08 3.65-3.32V7.12H8.35v7.26c0 .64-.17 1.36-.63 1.83z"/>
      </svg>
    ),
    strThemeColor: '#d97706', // Amber
    strThemeLight: '#fffbeb', // Light Yellow tint
    strShortDesc: 'Managing global app states cleanly and predictably across render layers.',
    arrMicroSkills: [
      'Redux Toolkit slices & thunks',
      'Zustand lightweight stores',
      'Context API for scoping'
    ],
    objDetails: {
      strAnimations: 'Render triggers and store event notifications.',
      strThreeD: 'Syncing state data parameters with canvas rendering loops.',
      arrBooksCerts: [
        'Redux Best Practices and Architecture Guides',
        'React Hooks in Action - John Larsen'
      ],
      strDebugStory: 'Tracking State Updates: Identifying performance bottlenecks caused by excessive component re-renders from un-memoized selectors.'
    }
  },
  {
    strId: 'integration',
    strTitle: 'APIs & Data Syncing',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.914 0C5.352 0 5.618 2.84 5.618 2.84l.006 2.946h6.398v.9h-8.9s-3.056.326-3.056 5.8c0 5.47 2.65 5.666 2.65 5.666h1.584v-2.235s-.08-2.678 2.604-2.678h6.242s2.834-.052 2.834-2.825V4.686s.316-4.686-5.834-4.686zm4.336 8.784v2.24s.08 2.68-2.604 2.68H7.404s-2.834.05-2.834 2.824v5.786s-.316 4.686 5.834 4.686c6.562 0 6.296-2.84 6.296-2.84l-.006-2.946H10.3v-.9h8.9s3.056-.326 3.056-5.8c0-5.47-2.65-5.666-2.65-5.666h-1.584v2.235s.032.062.032.062z"/>
      </svg>
    ),
    strThemeColor: '#0891b2', // Cyan
    strThemeLight: '#ecfeff', // Light Cyan tint
    strShortDesc: 'Establishing clean, real-time channels between React clients and server backend APIs.',
    arrMicroSkills: [
      'Fetch API and error handling modules',
      'WebSocket integrations for live feeds',
      'API query serialization policies'
    ],
    objDetails: {
      strAnimations: 'Real-time loading transitions and skeleton structures.',
      strThreeD: 'N/A',
      arrBooksCerts: [
        'RESTful API Design Rules - Mark Masse',
        'Designing Data-Intensive Applications - Martin Kleppmann'
      ],
      strDebugStory: 'Resolving Sync Issues: Building network reconnection strategies using exponential backoff to handle dynamic disconnection states.'
    }
  }
];



// Duplicate skills array to support continuous infinite marquee scroll.
export const arrMarqueeSkills = [...arrSkillsData, ...arrSkillsData];



