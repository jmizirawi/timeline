# Biblical Timeline

An interactive timeline application designed to explore and visualize Biblical history alongside secular and modern theocratic events.

## Features

- **Interactive Timeline**: Smooth scrolling and zooming capabilities to navigate from 4026 B.C.E. to the present day.
- **Categorized Data**: Distinct visual styles for different event types:
  - **Biblical**: People and events recorded in the Bible.
  - **Secular**: Historical context and world powers.
  - **Theocratic**: Modern history of Jehovah's Witnesses.
- **Rich Detail Views**: Click on any entity to open a side panel containing:
  - Detailed descriptions and historical context.
  - Life events and sub-events with dates.
  - Verified references and citations.
  - Images with vintage visual effects.
- **Visual Indicators**:
  - **Faded Bars**: Indicate uncertain or approximate dates.
  - **Color Coding**: Instant visual recognition of categories.
  - **Smart Layout**: Automatic collision detection and vertical stacking for readability.
- **Search**: Quickly find people and events by name.

## Tech Stack

- **Framework**: [Vue 3](https://vuejs.org/) (Script Setup, Composition API)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: SCSS / SASS
- **Icons**: [Lucide Vue](https://lucide.dev/)
- **Utility**: [VueUse](https://vueuse.org/)

## Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/jmizirawi/timeline.git
    cd timeline
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

Start the development server with hot-reload:

```bash
npm run dev
```

### Build

Build the project for production:

```bash
npm run build
```

## Project Structure

- `src/components`: Vue components (Timeline, SidePanel, SearchBox, etc.)
- `src/stores`: Pinia stores for state management (timeline data, selection state).
- `src/data`: Static data files for Biblical, Secular, and Theocratic events.
- `src/utils`: Helper functions for time calculation, collision detection, and formatting.
- `src/styles`: Global SCSS variables and base styles.

## Conventions

- **Year Zero**: The timeline accounts for the lack of a year 0.
- **Date Certainty**: Entities with `circa` or `guess` certainty are rendered with specific visual cues (faded bars, tilde prefixes).
