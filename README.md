# Interactive 8-Puzzle Problem Solver using AI Search Algorithms

[![GitHub Pages](https://img.shields.io/badge/Deployment-GitHub%20Pages-brightgreen)](https://tiyaagr.github.io/8-Puzzle-Problem-Solver/)
[![Algorithm](https://img.shields.io/badge/Assigned%20Algorithm-BFS-blueviolet)](https://github.com/TiyaAgr/8-Puzzle-Problem-Solver)
[![Course](https://img.shields.io/badge/Course-Artificial%20Intelligence-orange)](https://github.com/TiyaAgr/8-Puzzle-Problem-Solver)

An interactive, responsive state-space search web application designed to solve and visualize the classic **8-Puzzle Problem** using uninformed and informed Artificial Intelligence search algorithms.

---

## Student Details
- **Registration Number:** `24BDS0004`
- **Assigned Algorithm:** **Algorithm 1 — Breadth-First Search (BFS)**
- **Course Name:** Artificial Intelligence
- **Assignment Title:** Interactive 8-Puzzle Problem Solver using AI Search Algorithms

---

## Live Demo & Repository
- **GitHub Pages Live URL:** `https://tiyaagr.github.io/8-Puzzle-Problem-Solver/`
- **GitHub Repository URL:** `https://github.com/TiyaAgr/8-Puzzle-Problem-Solver`

---

## Project Overview
The **8-Puzzle** is a classic state-space search benchmark in AI consisting of a $3 \times 3$ grid with 8 numbered tiles and one blank space (`0`). The agent must move the blank space to transition the board from an initial configuration to a target goal state.

This application provides:
1. **Interactive Visualization:** Real-time visual tracking of nodes expanded, current depth, frontier queue, closed list, and child successors.
2. **Animation Engine:** Smooth sliding transitions of the blank tile with interactive playback controls (Run, Pause, Resume, Next Step, Prev Step, Reset, and Speed Slider).
3. **Solvability Validation:** Automatic mathematical inversion count check to guarantee whether the puzzle is solvable before initiating search.
4. **Assigned Algorithm Highlight (BFS):** Deeply instrumented FIFO queue search demonstrating optimality and complete level-by-level traversal.
5. **Algorithm Comparison Engine:** 1-click benchmarking across all 7 algorithms on the identical board instance.

---

## Technologies Used
- **Markup & Semantics:** HTML5
- **Styling & Layout:** CSS3 (Vanilla CSS with custom design system, Glassmorphism, CSS Grid & Flexbox)
- **Programming Language:** JavaScript (ES6+ Modules, Object-Oriented design)
- **Deployment:** GitHub Pages

---

## Search Algorithms Implemented

| # | Algorithm | Type | Strategy | Time Complexity | Space Complexity | Complete? | Optimal? |
|---|-----------|------|----------|-----------------|------------------|-----------|----------|
| **1** | **BFS (Assigned: 24BDS0004)** | Uninformed | FIFO Queue (shallowest node) | $O(b^d)$ | $O(b^d)$ | **Yes** | **Yes** ($c=1$) |
| **2** | **UCS** | Uninformed | Min-Priority Queue ($g(n)$) | $O(b^{1 + \lfloor C^*/\epsilon \rfloor})$ | $O(b^{1 + \lfloor C^*/\epsilon \rfloor})$ | **Yes** | **Yes** |
| **3** | **DFS** | Uninformed | LIFO Stack (deepest node) | $O(b^m)$ | $O(bm)$ | Finite Only | No |
| **4** | **DLS** | Uninformed | DFS with cutoff depth limit $l$ | $O(b^l)$ | $O(bl)$ | If $d \le l$ | No |
| **5** | **IDDLS** | Uninformed | Iterative DFS with depth $0, 1, 2...$ | $O(b^d)$ | $O(bd)$ | **Yes** | **Yes** ($c=1$) |
| **6** | **GBFS** | Informed | Priority Queue with $f(n) = h(n)$ | $O(b^m)$ | $O(b^m)$ | Yes (Graph) | No |
| **7** | **A\*** | Informed | Priority Queue with $f(n) = g(n) + h(n)$ | $O(b^d)$ | $O(b^d)$ | **Yes** | **Yes** |

---

## Heuristics Implemented (for GBFS & A*)

1. **Misplaced Tiles ($h_1$):**
   - Counts the number of tiles that are not in their target goal position (ignoring blank tile 0).
   - Admissible: $h_1(n) \le h^*(n)$.
   
2. **Manhattan Distance ($h_2$):**
   - Computes the sum of horizontal and vertical city-block distances for every tile from its target position:
     $$h_2(n) = \sum_{i=1}^{8} \left( |r_{\text{current}}(i) - r_{\text{goal}}(i)| + |c_{\text{current}}(i) - c_{\text{goal}}(i)| \right)$$
   - Admissible and Consistent; strictly dominates misplaced tiles ($h_2(n) \ge h_1(n)$).

---

## Solvability Theorem & Inversion Count
In a $3 \times 3$ grid, an inversion is defined as any pair of tiles $(A, B)$ such that $A > B$ and $A$ appears before $B$ (disregarding 0).

An initial state can reach a goal state **if and only if** both states share identical parity:
```
(Inversions(Initial State) % 2) === (Inversions(Goal State) % 2)
```
If one has an even number of inversions and the other has an odd number, the puzzle is mathematically impossible to solve. The app alerts the user immediately!

---

## Interactive Controls
- **Run:** Starts automated playback of the solution or search trace.
- **Pause:** Pauses execution at current step.
- **Resume:** Continues playback from current paused state.
- **Next Step / Previous Step:** Step forward or backward one move at a time.
- **Reset:** Reverts board to the initial starting state.
- **Speed Slider:** Adjust playback speed continuously from $0.5\times$ to $5.0\times$.
- **Interactive Manual Play:** Click any tile adjacent to the blank space to slide it manually.

---

## Repository Structure
```
AI-8Puzzle-Visualizer/
│── index.html              # Main application web page
│── css/
│   ├── style.css           # Core styling, glassmorphism, animations
│   └── responsive.css      # Tablet and mobile responsive design
│── js/
│   ├── puzzle.js           # Board state, inversion parity, move generation
│   ├── visualizer.js       # Playback animation and DOM rendering engine
│   ├── comparison.js       # Multi-algorithm benchmarking runner
│   ├── app.js              # Application controller and UI event binding
│   └── algorithms/
│       ├── bfs.js          # Breadth-First Search (Assigned: 24BDS0004)
│       ├── ucs.js          # Uniform Cost Search (Lowest-cost first)
│       ├── dfs.js          # Depth-First Search
│       ├── dls.js          # Depth-Limited Search
│       ├── iddls.js        # Iterative Deepening Search
│       ├── heuristics.js   # Manhattan & Misplaced heuristics
│       ├── gbfs.js         # Greedy Best-First Search
│       └── astar.js        # A* Search
│── assets/                 # Icons and media
│── images/                 # App screenshots and diagrams
│── docs/
│   └── case_study.md       # Detailed Case Study report
└── README.md               # Project documentation
```

---

## References
1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach (4th Edition)*. Pearson. Chapter 3: Solving Problems by Searching.
2. Korf, R. E. (1985). *Depth-first iterative-deepening: An optimal admissible tree search*. Artificial Intelligence, 27(1), 97-109.
3. Reinefeld, A. (1993). *Complete Solution of the Eight-Puzzle and the Benefit of Node Ordering in IDA\**. IJCAI.
