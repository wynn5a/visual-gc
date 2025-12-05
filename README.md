<div align="center">
  <h1>🗑️ G1 & ZGC Garbage Collector Visualizer</h1>

  <p>
    <strong>An interactive visualization tool for understanding Java's G1 and ZGC garbage collectors</strong>
  </p>

  <p>
    <a href="#-features">Features</a> •
    <a href="#-demo">Demo</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-understanding-the-visualization">Guide</a> •
    <a href="#-tech-stack">Tech Stack</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite" alt="Vite" />
    <img src="https://img.shields.io/badge/Framer_Motion-12.x-FF0055?style=flat-square&logo=framer" alt="Framer Motion" />
  </p>
</div>

---

## 📖 Overview

This interactive web application provides a **real-time visualization** of how Java's modern garbage collectors manage memory. Perfect for:

- 🎓 **Students** learning about JVM internals and memory management
- 👨‍💻 **Developers** wanting to understand GC behavior for performance tuning
- 👩‍🏫 **Educators** teaching garbage collection concepts visually
- 🔬 **Engineers** comparing G1 vs ZGC characteristics

## ✨ Features

### 🏗️ G1 Garbage Collector Simulation
- **Region-based heap visualization** with Eden, Survivor, Old, and Humongous regions
- **Young GC (Minor Collection)** with object evacuation and age tracking
- **Concurrent Marking** phase visualization
- **Mixed GC (Major Collection)** with collection set selection
- **Generational hypothesis** demonstration with object promotion

### ⚡ ZGC Simulation
- **Ultra-low latency** visualization (< 1ms pause times)
- **Concurrent phases** showing work happening while the app runs
- **Page-based memory** management
- **Concurrent relocation** without stopping the application
- **Colored pointer** concept demonstration

### 🎨 Visualization Features
- **Real-time heap grid** showing region states
- **Interactive tooltips** with region details (usage, liveness, age)
- **Event log** tracking all GC activities
- **Statistics panel** with allocations, GC counts, and pause times
- **Speed control** (1x, 2x, 3x) for simulation pacing
- **Built-in tutorials** explaining each GC type

## 🎬 Demo

| G1 GC Visualization | ZGC Visualization |
|:---:|:---:|
| Watch regions fill and get collected | See concurrent GC in action |
| 🟢 Eden → 🔵 Survivor → 🟠 Old | 🔵 Z Pages with concurrent relocation |

### Region Types

| Color | Type | Description |
|-------|------|-------------|
| 🟩 Green | **Eden** | New allocations start here |
| 🔵 Cyan | **Survivor** | Objects that survived Young GC |
| 🟧 Amber | **Old** | Long-lived (tenured) objects |
| 🟪 Purple | **Humongous** | Large objects (>50% of region) |
| 🔷 Indigo | **Z Page** | ZGC allocated pages |
| ⬜ Gray | **Free** | Available for allocation |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/gc-visual.git
   cd g1-visual
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Build for Production

```bash
npm run build
npm run preview
```

## 📚 Understanding the Visualization

### G1 GC Phases

```
┌─────────────────────────────────────────────────────────────┐
│                    G1 GC Lifecycle                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Allocating] ──▶ [Young GC] ──▶ [Allocating] ──▶ ...      │
│       │              │                │                     │
│       │              │                │                     │
│       ▼              ▼                ▼                     │
│  Eden fills    STW Pause        Heap threshold              │
│                Copy survivors   triggers marking            │
│                Promote aged                                 │
│                                                             │
│  ... ──▶ [Concurrent Mark] ──▶ [Mixed GC] ──▶ ...          │
│               │                     │                       │
│               ▼                     ▼                       │
│         Background work       STW Pause                     │
│         App continues         Collect Young + Old regions   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ZGC Phases

```
┌─────────────────────────────────────────────────────────────┐
│                    ZGC Cycle                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Mark Start] ──▶ [Concurrent Mark] ──▶ [Mark End]         │
│    (STW <1ms)        (Background)         (STW <1ms)        │
│                                                             │
│       │                                                     │
│       ▼                                                     │
│  [Concurrent Relocate] ──▶ [Complete]                      │
│     (Background)           Memory freed                     │
│     App keeps running!                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Project Structure

```
gc-visual/
├── App.tsx                 # Main application component
├── index.tsx               # Entry point
├── types.ts                # TypeScript type definitions
├── constants.ts            # Configuration constants
├── components/
│   ├── HeapGrid.tsx        # Region grid visualization
│   ├── ControlBar.tsx      # Playback controls
│   ├── StatsPanel.tsx      # Statistics display
│   ├── EventLog.tsx        # GC event log
│   ├── Legend.tsx          # Region type legend
│   ├── Header.tsx          # App header with mode toggle
│   └── IntroModal.tsx      # Interactive tutorials
├── hooks/
│   ├── useGCSimulation.ts  # Main simulation orchestrator
│   ├── useG1GC.ts          # G1 GC logic
│   └── useZGC.ts           # ZGC logic
├── utils/
│   ├── regionUtils.ts      # Region helper functions
│   └── logUtils.ts         # Logging utilities
└── vite.config.ts          # Vite configuration
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI framework with hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Fast build tooling |
| **Framer Motion** | Smooth animations |
| **Lucide React** | Beautiful icons |
| **Tailwind-style CSS** | Utility-first styling |

## 🎮 Controls

| Control | Action |
|---------|--------|
| ▶️ **Play/Pause** | Start or pause the simulation |
| 🔄 **Reset** | Reset the heap to initial state |
| ⏩ **Speed** | Toggle between 1x, 2x, 3x speed |
| 🔀 **G1/ZGC Toggle** | Switch between GC modes |
| ❓ **Info Button** | Show/hide the tutorial modal |

## 📊 Statistics Explained

- **Allocations**: Total number of allocation events
- **Young GCs**: Number of Young GC (minor) collections
- **Mixed GCs**: Number of Mixed GC or ZGC cycles
- **Heap Usage**: Current percentage of heap in use
- **Avg Pause**: Average simulated pause time

## 🤝 Contributing

Contributions are welcome! Here are some ways you can help:

1. 🐛 Report bugs or issues
2. 💡 Suggest new features or improvements
3. 📝 Improve documentation
4. 🔧 Submit pull requests

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the JVM's G1 and ZGC garbage collectors
- Built with modern React patterns and best practices
- Designed for educational purposes

---

<div align="center">
  <p>
    <strong>Made with ❤️ for the Java community</strong>
  </p>
  <p>
    <a href="https://github.com/yourusername/g1-visual/issues">Report Bug</a> •
    <a href="https://github.com/yourusername/g1-visual/issues">Request Feature</a>
  </p>
</div>
