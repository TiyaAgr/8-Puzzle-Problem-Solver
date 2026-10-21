# Case Study: 8-Puzzle Problem Solving with AI Search Algorithms

## Student Details
- **Student Registration Number:** 24BDS0004
- **Assigned Algorithm:** Breadth-First Search (BFS) [Algorithm #1]
- **Course:** Artificial Intelligence
- **Evaluation Component:** Digital Assignment (Case Study)

---

## 1. Problem Formulation
The **8-Puzzle** is a sliding block puzzle consisting of a $3 \times 3$ grid with 8 numbered tiles and one empty space (denoted as 0 or blank).

- **States:** A tile configuration represented as an array of 9 integers, e.g., `[2, 8, 3, 1, 6, 4, 7, 0, 5]`.
- **Initial State:** An arbitrary solvable configuration.
- **Goal State:** The target configuration, e.g., standard sequential or assignment-specified:
  ```
  1 2 3
  8 _ 4
  7 6 5
  ```
- **Actions / Operators:** Movement of the blank space: `{ Up, Down, Left, Right }`.
- **Path Cost:** Uniform cost $c(s, a, s') = 1$ per move. Total cost is equivalent to the number of moves.

---

## 2. Inversion Parity & Solvability
An inversion occurs when a tile with a greater number appears before a tile with a smaller number in the linearized board order (excluding the blank tile):
$$\text{Inversions} = \sum_{i < j} [A[i] > A[j] \land A[i], A[j] \neq 0]$$

In a $3 \times 3$ puzzle with odd width $N = 3$:
- A state can reach another state **if and only if** both states share identical inversion parity:
  $$\text{Inversions}(\text{Initial}) \equiv \text{Inversions}(\text{Goal}) \pmod 2$$

---

## 3. Assigned Algorithm Analysis: Breadth-First Search (BFS)
- **Frontier Data Structure:** First-In-First-Out (FIFO) Queue.
- **Explored Set:** Closed hash set to prevent repeated states and infinite cycles.
- **Completeness:** Complete (always finds a goal if one exists in a finite branching state space).
- **Optimality:** Optimal for unit step costs ($c = 1$). Finds the shortest sequence of tile movements.
- **Time Complexity:** $O(b^d)$ where $b$ is the average branching factor ($\approx 3$) and $d$ is the shallowest solution depth.
- **Space Complexity:** $O(b^d)$ as all frontier and explored nodes are retained in memory.

---

## 4. Comparison with Other Search Paradigms
1. **Depth-First Search (DFS):** Memory efficient ($O(bm)$), but neither complete nor optimal in cyclic graphs.
2. **Depth-Limited Search (DLS):** Avoids infinite loops by cutting off at depth $l$, but incomplete if $d > l$.
3. **Iterative Deepening Search (IDDLS):** Combines BFS optimality and completeness with DFS space complexity ($O(bd)$).
4. **Greedy Best-First Search (GBFS):** Uses heuristic $f(n) = h(n)$; fast but non-optimal.
5. **A\* Search:** Uses evaluation function $f(n) = g(n) + h(n)$; optimal and complete when heuristic is admissible.
