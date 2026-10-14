# Interactive 8-Puzzle Problem Solver using AI Search Algorithms

> **Artificial Intelligence Digital Assignment (Case Study)**  
> **Course:** Artificial Intelligence  
> **Student Name:** Tiya Agrawal  
> **Registration Number:** `24BDS0004`  
> **Allotted Algorithm:** **Algorithm #1 — Breadth First Search (BFS)**  
> **Live GitHub Pages URL:** `https://tiya-agrawal.github.io/AI-8Puzzle-Visualizer/` *(Replace with your deployed repository URL)*  
> **GitHub Repository:** `https://github.com/tiya-agrawal/AI-8Puzzle-Visualizer`  

---

## 1. Project Description

This project is an interactive, browser-based artificial intelligence tool designed to solve and visualize the classical **8-Puzzle Problem** using state-space search algorithms. The web application models the puzzle as a formal graph search problem, providing:

1. **State-Space Search Engine:** Manual and randomized puzzle input generation with mathematical parity verification (inversion counting).
2. **Flagship Algorithm Visualization:** Dedicated focus on **Breadth First Search (BFS)**, the assigned algorithm for student registration number `24BDS0004`.
3. **Step-by-Step Animated Playback:** Smooth animated movement of the blank space and tiles with playback controls (`Run`, `Pause`, `Resume`, `Next Step`, `Previous Step`, `Reset`, and speed adjustment).
4. **Real-Time Search Inspection:** Real-time metrics dashboard revealing the current node expanded, parent pointer, frontier (open list) size, explored (closed list) size, search depth, and evaluation costs ($g(n)$, $h(n)$, $f(n)$).
5. **Multi-Algorithm Benchmark Suite:** Empirical performance comparison table comparing all six algorithms (BFS, DFS, DLS, IDDLS, GBFS, A*) on the identical puzzle instance.
6. **Theoretical Documentation:** Comprehensive analysis of time/space complexity, completeness, and optimality proofs for all implemented techniques.

---

## 2. Technologies Used

- **HTML5:** Semantic document structure with high-contrast accessibility tags and unique IDs.
- **CSS3:** Custom academic styling (Oxford navy palette, paper-white cards, tabular alignment, responsive layout, CSS sliding transitions).
- **JavaScript (ES6+):** Pure vanilla JavaScript without heavy external frameworks to ensure lightweight, zero-latency execution directly in any browser.
- **Deployment Platform:** GitHub Pages (static site hosting directly from the repository root).

---

## 3. Search Algorithms Implemented

| Algorithm | Category | Data Structure | Completeness | Optimality | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BFS (Assigned)** | Uninformed | FIFO Queue | Yes | Yes (unit cost) | $\mathcal{O}(b^d)$ | $\mathcal{O}(b^d)$ |
| **DFS** | Uninformed | LIFO Stack | No (in graphs) | No | $\mathcal{O}(b^m)$ | $\mathcal{O}(b \cdot m)$ |
| **DLS** | Uninformed | Stack / Recursion | No ($L < d$) | No | $\mathcal{O}(b^L)$ | $\mathcal{O}(b \cdot L)$ |
| **IDDLS** | Uninformed | Iterative Stack | Yes | Yes (unit cost) | $\mathcal{O}(b^d)$ | $\mathcal{O}(b \cdot d)$ |
| **GBFS** | Informed | Priority Queue | No (in cycles) | No | $\mathcal{O}(b^m)$ | $\mathcal{O}(b^m)$ |
| **A\*** | Informed | Min-Priority Queue | Yes | Yes (admissible) | $\mathcal{O}(b^d)$ | $\mathcal{O}(b^d)$ |

---

## 4. Heuristics Used (Informed Search)

### 1. Misplaced Tiles Count ($h_1$)
Counts the number of numbered tiles ($1$ through $8$) that do not occupy their goal state position:
$$h_1(s) = \sum_{i=1}^8 \mathbb{I}(s[i] \neq goal[i] \text{ and } s[i] \neq 0)$$
- **Admissibility:** Yes. Each misplaced tile must move at least once to reach its destination.
- **Dominance:** Dominated by Manhattan Distance ($h_1(s) \le h_2(s)$ for all $s$).

### 2. Manhattan Distance ($h_2$)
Calculates the sum of the horizontal and vertical distances of each non-blank tile from its required goal coordinates:
$$h_2(s) = \sum_{tile=1}^8 \Big( |x_{\text{current}}(tile) - x_{\text{goal}}(tile)| + |y_{\text{current}}(tile) - y_{\text{goal}}(tile)| \Big)$$
- **Admissibility:** Yes. Disregarding obstacle tiles, the grid distance is the theoretical lower bound of movements required.
- **Consistency / Monotonicity:** Yes. Moving a tile changes its Manhattan distance by at most $\pm 1$, satisfying the triangle inequality: $h(n) \le c(n, a, n') + h(n')$.

---

## 5. Mathematical Solvability & Inversion Parity

An 8-puzzle configuration on a $3 \times 3$ grid is solvable if and only if:
$$\text{Inversions}(\text{Initial State}) \equiv \text{Inversions}(\text{Goal State}) \pmod{2}$$

An **inversion** occurs when a tile with a greater number appears before a tile with a smaller number in the flat row-major array (ignoring the blank space $0$). The application automatically computes the parity of the input configuration and warns the user if an entered state is mathematically unsolvable, preventing infinite loops.

---

## 6. Project Structure

```
AI-8Puzzle-Visualizer/
│── index.html              # Main application single-page interface
│── css/
│   └── style.css           # Academic research-paper inspired stylesheet
│── js/
│   ├── puzzle.js           # Puzzle state representation, moves, and parity check
│   ├── heuristics.js       # Misplaced tiles and Manhattan distance functions
│   ├── algorithms.js       # Complete implementations of BFS, DFS, DLS, IDDLS, GBFS, A*
│   ├── visualizer.js       # Playback controller (step forward, backward, speed)
│   ├── comparison.js       # Multi-algorithm benchmark suite & comparative table
│   └── app.js              # Application bootstrapping and event handlers
│── assets/images/          # Diagrammatic assets and preview screenshots
│── docs/
│   └── case_study_report.md# Formal case study write-up and algorithmic derivations
└── README.md               # Project documentation and submission guide
```

---

## 7. How to Run the Project Locally

Since the application is constructed entirely with pure HTML5, CSS3, and ES6 JavaScript, **no build systems, package managers, or compilers are required**.

### Method 1: Direct Browser Launch
1. Clone or download the repository to your local computer:
   ```bash
   git clone https://github.com/tiya-agrawal/AI-8Puzzle-Visualizer.git
   ```
2. Navigate to the project directory and double-click `index.html` to open it in Google Chrome, Mozilla Firefox, or Microsoft Edge.

### Method 2: Local HTTP Server (Recommended)
Using Python's built-in server:
```bash
# In the project directory:
python -m http.server 8000
```
Then visit `http://localhost:8000` in your web browser.

---

## 8. Deployment on GitHub Pages

1. Create a public repository on GitHub named `AI-8Puzzle-Visualizer`.
2. Push the files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Interactive 8-Puzzle Solver"
   git branch -M main
   git remote add origin https://github.com/tiya-agrawal/AI-8Puzzle-Visualizer.git
   git push -u origin main
   ```
3. Navigate to **Repository Settings** &rarr; **Pages**.
4. Under **Branch**, select `main` and root `/` folder, then click **Save**.
5. Your live website URL will be:
   `https://<your-username>.github.io/AI-8Puzzle-Visualizer/`

---

## 9. 3–5 Minute Demonstration Video Script

When recording your presentation video for submission, follow this recommended outline:
1. **Introduction (0:00 - 0:45):** State your name (Tiya Agrawal), Registration Number (`24BDS0004`), course name, and assigned algorithm (**Algorithm #1: Breadth First Search**).
2. **Puzzle Setup & Solvability (0:45 - 1:30):** Show Method 1 (manual grid) and Method 2 (random solvable puzzle). Explain the inversion count parity check.
3. **Assigned Algorithm Demonstration (1:30 - 2:45):** Run BFS on the assignment sample puzzle (`2 8 3 / 1 6 4 / 7 _ 5`). Demonstrate the interactive controls (`Play`, `Pause`, `Next Step`, `Prev Step`, `Speed slider`). Show the real-time search metrics panel (frontier queue, explored set, depth, parent pointer).
4. **Algorithm Comparison & Heuristics (2:45 - 3:45):** Switch to the **Algorithm Benchmark Comparison** tab. Click *Run All 6 Algorithms Benchmark* and discuss the trade-offs between BFS (optimal moves, high memory) and A* with Manhattan distance (optimal moves, minimal nodes expanded).
5. **Conclusion & GitHub Pages URL (3:45 - 4:15):** Highlight the live GitHub Pages link and conclude.

---

## 10. References & Academic Integrity

1. Russell, S., & Norvig, P. (2020). *Artificial Intelligence: A Modern Approach* (4th ed.). Pearson. Chapter 3: "Solving Problems by Searching".
2. Korf, R. E. (1985). *Depth-first iterative-deepening: An optimal admissible tree search*. Artificial Intelligence, 27(1), 97-109.
3. Nilson, N. J. (2014). *Principles of Artificial Intelligence*. Morgan Kaufmann.
4. Reinefeld, A. (1993). *Complete Solution of the Eight-Puzzle and the Benefit of Node Ordering in IDA\**. IJCAI.
