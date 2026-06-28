# Full Stack Development Skills & Technologies

This document outlines the specific technical skills, concepts, and tools utilized during the development of this full-stack application (FastAPI + React).

## 1. Frontend Development (React & Vite)
- **React Fundamentals:** Building Single Page Applications (SPAs) using functional components.
- **React Hooks:** Extensive use of `useState` for state management, `useEffect` for data fetching and side effects, and `useRef` for DOM manipulation.
- **Custom Hooks Engineering:** Creating highly complex custom hooks (like `useSmoothMarquee.js` and `useDraggableScroll.js`) that interface directly with the Browser DOM for physics-based scrolling and infinite carousels.
- **Vite Build Tool:** Configuring and running modern, lightning-fast frontend dev servers using Vite.
- **React Router DOM:** Implementing client-side routing for seamless navigation between pages without reloading the browser.
- **Fetch API:** Consuming RESTful APIs using the native JavaScript Fetch API to perform GET requests and handle JSON data asynchronously.
- **Component Architecture:** Structuring a frontend with over 30 modular, reusable components (modals, cards, forms, headers).

## 2. Advanced UI / UX & CSS Styling
- **Modern CSS Frameworks:** Writing pure, vanilla CSS without relying on heavy libraries like Tailwind or Bootstrap.
- **Responsive Design:** Using CSS media queries (`@media`) to ensure the application scales perfectly across mobile, tablet, and desktop screens.
- **CSS Variables & Theming:** Utilizing CSS custom properties (`--theme-color`) to dynamically inject colors from the database into the UI for data-driven styling.
- **Micro-Animations & Transitions:** Implementing hover effects, glowing shadows, and cubic-bezier transitions for a premium, tactile user experience.
- **Advanced Scrolling & Overflow:** Managing hidden scrollbars (`-webkit-scrollbar: none`), momentum scrolling on touch devices (`-webkit-overflow-scrolling: touch`), and CSS transforms for GPU-accelerated smooth animations (`translate3d`).

## 3. Backend Development (FastAPI & Python) 
- **Python Programming:** Writing modern, typed Python to power the backend server and data processing.
- **FastAPI Framework:** Architecting a scalable and incredibly fast backend using FastAPI's modular routing and dependency injection.
- **RESTful APIs:** Designing robust API endpoints with automatic interactive documentation (Swagger UI/ReDoc) using Pydantic for data validation and serialization.
- **Database Modeling:** Creating relational database models using SQLAlchemy ORM (Object-Relational Mapping).
- **Data Seeding & Scripting:** Writing standalone Python automation scripts to programmatically populate the database with dummy data for testing.
- **Authentication:** Implementing secure JWT (JSON Web Token) authentication flows.

## 4. Database Management
- **SQLite:** Configuring and utilizing lightweight file-based relational databases for local development.
- **Database Administration (DBeaver):** Connecting GUI database management tools to local databases. Querying, viewing, and modifying raw relational data directly in the database environment.
- **Data Migration Concept:** Understanding the separation between local development databases (`db.sqlite3` in `.gitignore`) and production databases (like PostgreSQL).

## 5. Software Engineering Concepts
- **Client-Server Architecture:** Successfully bridging two entirely separate codebases (FastAPI port 8000 and React port 5173) using Cross-Origin Resource Sharing (CORS) configurations.
- **Version Control (Git):** Managing ignored files (`.gitignore`), maintaining `.env` configurations, and adhering to Git best practices.
- **AI-Assisted Pair Programming:** Effectively delegating boilerplate generation, UI scaffolding, and complex logic design to an Agentic AI, significantly accelerating development speed from weeks to days.
- **Debugging & Triage:** Identifying and fixing complex physics and animation bugs (e.g., scroll threshold boundary limits) by analyzing DOM width and scroll behavior.

## 6. ignore node modules folder while scanning
