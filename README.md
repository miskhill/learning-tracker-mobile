# Learning Tracker Mobile

Learning Tracker is a mobile-first companion for engineers and lifelong learners who want a structured way to build, review, and retain technical knowledge. The app combines spaced practice tools, contextual reminders, and offline resilience so study sessions fit around a busy schedule.

## Why It Matters

- Showcase of a modern Expo + React Native codebase that balances DX with production-ready concerns (offline-first data, background sync, notifications).
- Demonstrates integration with GraphQL backends, state synchronization across network boundaries, and clean UI patterns suitable for rapid iteration.

## Product Highlights

- **Personalized study hub** – Home screen surfaces recency of practice, quick actions for flashcards, quizzes, and topic exploration.
- **Topic management** – Create, browse, and drill into topics with per-topic flashcard counts and empty-state education.
- **Offline-first creation** – Topics and flashcards persist locally when the device is offline, then reconcile with the server when connectivity returns.
- **Smart reminders** – Daily study nudges are scheduled via the native notification APIs to reinforce consistent habits.
- **Responsive design system** – Centralized color and spacing tokens ensure visual consistency and simplify theming.

## Architecture & Stack

- **Framework**: Expo SDK 54 with Expo Router for file-based navigation and deep-linking.
- **Data layer**: Apollo Client + GraphQL with normalized, persistent cache stored in `AsyncStorage` (via `apollo3-cache-persist`).
- **State management**: Zustand stores orchestrate flashcards/topics, separated from network concerns and hydrated on boot.
- **Offline sync pipeline**: Local mutations are queued with UUID temp IDs, saved to device storage, and replayed once NetInfo signals connectivity.
- **UI**: TypeScript-first React Native components, gesture-enabled layouts, and safe-area handling for iOS/Android parity.
- **Tooling**: ESLint (React Native rules), TypeScript strictness, Expo notifications and device APIs, and reusable GraphQL documents.

## Notable Implementation Details

- **Bootstrapping flow** – Splash screen stays visible until the Apollo client, caches, notifications, and offline hydration finish, ensuring a flicker-free landing experience.
- **Selective cache merges** – Custom type policies avoid stale flashcards by replacing server results while preserving local-only entries.
- **Network awareness** – Sync routines subscribe to NetInfo changes to opportunistically push offline work and refresh remote queries.
- **Reminder scheduling** – Daily notifications cancel and reschedule to prevent duplicate alerts and keep messaging relevant.

## Roadmap Ideas

- Streak tracking and leaderboard widgets to gamify consistency.
- Adaptive quiz mode that prioritizes cards answered incorrectly.
- Server-driven content recommendations based on learning history.
- E2E automation covering offline workflows and sync edge cases.

## Connect

I’m always open to discussing developmentopportunities or collaboration. Reach out on [LinkedIn](https://www.linkedin.com/in/gary-smith-dev/).
