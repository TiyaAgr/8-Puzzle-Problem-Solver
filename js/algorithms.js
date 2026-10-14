/**
 * ============================================================================
 * Interactive 8-Puzzle Problem Solver - AI Search Algorithms Engine
 * Author: Tiya Agrawal (Reg No: 24BDS0004)
 * Course: Artificial Intelligence
 * Assigned Algorithm: Algorithm #1: Breadth First Search (BFS)
 * Supported: BFS, DFS, DLS, IDDLS, UCS, GBFS, A*
 * ============================================================================
 */

class SearchNode {
  static idCounter = 0;

  constructor(state, parent = null, action = null, depth = 0, pathCost = 0, h = 0) {
    this.id = ++SearchNode.idCounter;
    this.state = state;
    this.parent = parent;
    this.action = action; // 'UP', 'DOWN', 'LEFT', 'RIGHT'
    this.depth = depth;
    this.pathCost = pathCost; // g(n)
    this.h = h;               // h(n)
    this.f = pathCost + h;     // f(n)
    this.key = PuzzleEngine.stateToKey(state);
  }
}

class SearchAlgorithmsEngine {
  /**
   * Reconstructs the sequence of moves and states from initial to goal node.
   * @param {SearchNode} goalNode 
   * @returns {Array<{state: number[], action: string, depth: number}>}
   */
  static extractSolutionPath(goalNode) {
    const path = [];
    let current = goalNode;
    while (current !== null) {
      path.unshift({
        state: current.state,
        action: current.action,
        depth: current.depth,
        cost: current.pathCost,
        h: current.h,
        f: current.f,
        nodeId: current.id,
        parentState: current.parent ? current.parent.state : null
      });
      current = current.parent;
    }
    return path;
  }

  /**
   * Estimates approximate memory footprint based on stored nodes.
   * Standard JS object overhead is ~128 bytes per search node.
   * @param {number} totalNodes 
   * @returns {string} E.g., "12.4 KB"
   */
  static estimateMemory(totalNodes) {
    const bytes = totalNodes * 128;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // ==========================================================================
  // ALGORITHM 1: BREADTH FIRST SEARCH (BFS) - [Assigned to 24BDS0004]
  // ==========================================================================
  /**
   * Breadth First Search (BFS)
   * Strategy: Explores shallowest nodes first using a FIFO Queue.
   * Complete: Yes (if branching factor b is finite).
   * Optimal: Yes (for unit path costs).
   * Time Complexity: O(b^d)
   * Space Complexity: O(b^d)
   * 
   * @param {number[]} initial 
   * @param {number[]} goal 
   * @param {number} maxSteps - Safety cap to prevent browser freezes on very deep puzzles
   * @returns {object} Search result with trace snapshots
   */
  static solveBFS(initial, goal, maxSteps = 25000) {
    const startTime = performance.now();
    SearchNode.idCounter = 0;

    const root = new SearchNode(initial, null, null, 0, 0, 0);
    const goalKey = PuzzleEngine.stateToKey(goal);

    if (root.key === goalKey) {
      const endTime = performance.now();
      return {
        algorithm: "Breadth First Search (BFS)",
        solutionFound: true,
        path: this.extractSolutionPath(root),
        moves: 0,
        nodesGenerated: 1,
        nodesExpanded: 0,
        maxDepth: 0,
        executionTime: +(endTime - startTime).toFixed(2),
        memory: this.estimateMemory(1),
        trace: []
      };
    }

    const frontier = [root]; // FIFO Queue
    const explored = new Set();
    const frontierKeys = new Set([root.key]);

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;
    const trace = [];

    while (frontier.length > 0) {
      if (nodesExpanded >= maxSteps) {
        break; // Guard against browser lock
      }

      const current = frontier.shift(); // Dequeue
      frontierKeys.delete(current.key);
      explored.add(current.key);
      nodesExpanded++;

      if (current.depth > maxDepth) {
        maxDepth = current.depth;
      }

      // Record visualization snapshot for first 250 steps to keep UI snappy
      if (trace.length < 250) {
        trace.push({
          step: nodesExpanded,
          currentNode: {
            state: current.state,
            action: current.action,
            depth: current.depth,
            parentState: current.parent ? current.parent.state : null,
            g: current.pathCost,
            h: 0,
            f: current.pathCost
          },
          frontierSize: frontier.length,
          exploredSize: explored.size,
          frontierPreview: frontier.slice(0, 5).map(n => ({ state: n.state, depth: n.depth })),
          depth: current.depth
        });
      }

      // Generate successors
      const successors = PuzzleEngine.getSuccessors(current.state);
      for (const succ of successors) {
        const succKey = PuzzleEngine.stateToKey(succ.state);

        if (!explored.has(succKey) && !frontierKeys.has(succKey)) {
          nodesGenerated++;
          const childNode = new SearchNode(
            succ.state,
            current,
            succ.action,
            current.depth + 1,
            current.pathCost + 1,
            0
          );

          // Goal test at generation
          if (succKey === goalKey) {
            const endTime = performance.now();
            return {
              algorithm: "Breadth First Search (BFS)",
              solutionFound: true,
              path: this.extractSolutionPath(childNode),
              moves: childNode.depth,
              nodesGenerated,
              nodesExpanded,
              maxDepth: Math.max(maxDepth, childNode.depth),
              executionTime: +(endTime - startTime).toFixed(2),
              memory: this.estimateMemory(nodesGenerated),
              trace
            };
          }

          frontier.push(childNode);
          frontierKeys.add(succKey);
        }
      }
    }

    const endTime = performance.now();
    return {
      algorithm: "Breadth First Search (BFS)",
      solutionFound: false,
      path: [],
      moves: 0,
      nodesGenerated,
      nodesExpanded,
      maxDepth,
      executionTime: +(endTime - startTime).toFixed(2),
      memory: this.estimateMemory(nodesGenerated),
      trace
    };
  }

  // ==========================================================================
  // ALGORITHM 2: DEPTH FIRST SEARCH (DFS)
  // ==========================================================================
  /**
   * Depth First Search (DFS)
   * Explores the deepest node first using a LIFO Stack.
   * Note: In 8-puzzle graph, an unbounded DFS can run into extreme depths.
   * We apply a maximum depth safety boundary (default: 25).
   */
  static solveDFS(initial, goal, depthLimit = 25, maxNodes = 40000) {
    const startTime = performance.now();
    SearchNode.idCounter = 0;

    const root = new SearchNode(initial, null, null, 0, 0, 0);
    const goalKey = PuzzleEngine.stateToKey(goal);

    if (root.key === goalKey) {
      return {
        algorithm: "Depth First Search (DFS)",
        solutionFound: true,
        path: this.extractSolutionPath(root),
        moves: 0,
        nodesGenerated: 1,
        nodesExpanded: 0,
        maxDepth: 0,
        executionTime: +(performance.now() - startTime).toFixed(2),
        memory: this.estimateMemory(1)
      };
    }

    const stack = [root]; // LIFO Stack
    const visitedInCurrentBranch = new Set();
    const closed = new Map(); // key -> shallowest depth found

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (stack.length > 0 && nodesExpanded < maxNodes) {
      const current = stack.pop();
      nodesExpanded++;

      if (current.depth > maxDepth) {
        maxDepth = current.depth;
      }

      if (current.key === goalKey) {
        const endTime = performance.now();
        return {
          algorithm: "Depth First Search (DFS)",
          solutionFound: true,
          path: this.extractSolutionPath(current),
          moves: current.depth,
          nodesGenerated,
          nodesExpanded,
          maxDepth,
          executionTime: +(endTime - startTime).toFixed(2),
          memory: this.estimateMemory(nodesGenerated)
        };
      }

      if (current.depth < depthLimit) {
        const successors = PuzzleEngine.getSuccessors(current.state);
        // Reverse successors for canonical left-to-right order on stack pop
        for (let i = successors.length - 1; i >= 0; i--) {
          const succ = successors[i];
          const succKey = PuzzleEngine.stateToKey(succ.state);
          const nextDepth = current.depth + 1;

          // Prune if visited at shallower or equal depth
          if (!closed.has(succKey) || closed.get(succKey) > nextDepth) {
            closed.set(succKey, nextDepth);
            nodesGenerated++;
            const childNode = new SearchNode(
              succ.state,
              current,
              succ.action,
              nextDepth,
              current.pathCost + 1,
              0
            );
            stack.push(childNode);
          }
        }
      }
    }

    return {
      algorithm: "Depth First Search (DFS)",
      solutionFound: false,
      path: [],
      moves: 0,
      nodesGenerated,
      nodesExpanded,
      maxDepth,
      executionTime: +(performance.now() - startTime).toFixed(2),
      memory: this.estimateMemory(nodesGenerated)
    };
  }

  // ==========================================================================
  // ALGORITHM 3: DEPTH LIMITED SEARCH (DLS)
  // ==========================================================================
  static solveDLS(initial, goal, limit = 10, maxNodes = 30000) {
    const startTime = performance.now();
    SearchNode.idCounter = 0;

    const root = new SearchNode(initial, null, null, 0, 0, 0);
    const goalKey = PuzzleEngine.stateToKey(goal);

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;
    let cutoffOccurred = false;

    const closed = new Map();

    function recursiveDLS(node) {
      if (node.key === goalKey) {
        return { status: 'SUCCESS', node };
      }
      if (node.depth >= limit) {
        cutoffOccurred = true;
        return { status: 'CUTOFF' };
      }

      nodesExpanded++;
      if (node.depth > maxDepth) maxDepth = node.depth;

      const successors = PuzzleEngine.getSuccessors(node.state);
      for (const succ of successors) {
        const succKey = PuzzleEngine.stateToKey(succ.state);
        const nextDepth = node.depth + 1;

        if (!closed.has(succKey) || closed.get(succKey) > nextDepth) {
          closed.set(succKey, nextDepth);
          nodesGenerated++;
          const childNode = new SearchNode(
            succ.state,
            node,
            succ.action,
            nextDepth,
            node.pathCost + 1,
            0
          );

          if (nodesExpanded >= maxNodes) return { status: 'CUTOFF' };

          const result = recursiveDLS(childNode);
          if (result.status === 'SUCCESS') return result;
        }
      }
      return { status: cutoffOccurred ? 'CUTOFF' : 'FAILURE' };
    }

    closed.set(root.key, 0);
    const result = recursiveDLS(root);
    const endTime = performance.now();

    if (result.status === 'SUCCESS') {
      return {
        algorithm: `Depth Limited Search (Limit: ${limit})`,
        solutionFound: true,
        path: SearchAlgorithmsEngine.extractSolutionPath(result.node),
        moves: result.node.depth,
        nodesGenerated,
        nodesExpanded,
        maxDepth,
        executionTime: +(endTime - startTime).toFixed(2),
        memory: SearchAlgorithmsEngine.estimateMemory(nodesGenerated)
      };
    }

    return {
      algorithm: `Depth Limited Search (Limit: ${limit})`,
      solutionFound: false,
      path: [],
      moves: 0,
      nodesGenerated,
      nodesExpanded,
      maxDepth,
      executionTime: +(endTime - startTime).toFixed(2),
      memory: SearchAlgorithmsEngine.estimateMemory(nodesGenerated)
    };
  }

  // ==========================================================================
  // ALGORITHM 4: ITERATIVE DEEPENING DEPTH LIMITED SEARCH (IDDLS)
  // ==========================================================================
  static solveIDDLS(initial, goal, maxDepthLimit = 20) {
    const startTime = performance.now();
    let totalGenerated = 0;
    let totalExpanded = 0;
    let overallMaxDepth = 0;

    for (let depth = 0; depth <= maxDepthLimit; depth++) {
      const dlsRes = this.solveDLS(initial, goal, depth);
      totalGenerated += dlsRes.nodesGenerated;
      totalExpanded += dlsRes.nodesExpanded;
      if (dlsRes.maxDepth > overallMaxDepth) overallMaxDepth = dlsRes.maxDepth;

      if (dlsRes.solutionFound) {
        const endTime = performance.now();
        return {
          algorithm: "Iterative Deepening Search (IDDLS)",
          solutionFound: true,
          path: dlsRes.path,
          moves: dlsRes.moves,
          nodesGenerated: totalGenerated,
          nodesExpanded: totalExpanded,
          maxDepth: overallMaxDepth,
          executionTime: +(endTime - startTime).toFixed(2),
          memory: this.estimateMemory(dlsRes.nodesGenerated)
        };
      }
    }

    const endTime = performance.now();
    return {
      algorithm: "Iterative Deepening Search (IDDLS)",
      solutionFound: false,
      path: [],
      moves: 0,
      nodesGenerated: totalGenerated,
      nodesExpanded: totalExpanded,
      maxDepth: overallMaxDepth,
      executionTime: +(endTime - startTime).toFixed(2),
      memory: this.estimateMemory(totalGenerated)
    };
  }

  // ==========================================================================
  // ALGORITHM 5: UNIFORM COST SEARCH (UCS)
  // ==========================================================================
  static solveUCS(initial, goal, maxNodes = 25000) {
    // In 8-Puzzle where each transition cost = 1, UCS is cost-driven BFS
    const startTime = performance.now();
    SearchNode.idCounter = 0;

    const root = new SearchNode(initial, null, null, 0, 0, 0);
    const goalKey = PuzzleEngine.stateToKey(goal);

    // Min-Priority queue ordered by pathCost g(n)
    const frontier = [root];
    const explored = new Map(); // key -> best cost

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (frontier.length > 0 && nodesExpanded < maxNodes) {
      // Find node with lowest g(n)
      let minIdx = 0;
      for (let i = 1; i < frontier.length; i++) {
        if (frontier[i].pathCost < frontier[minIdx].pathCost) {
          minIdx = i;
        }
      }
      const current = frontier.splice(minIdx, 1)[0];

      if (current.key === goalKey) {
        const endTime = performance.now();
        return {
          algorithm: "Uniform Cost Search (UCS)",
          solutionFound: true,
          path: this.extractSolutionPath(current),
          moves: current.depth,
          nodesGenerated,
          nodesExpanded,
          maxDepth,
          executionTime: +(endTime - startTime).toFixed(2),
          memory: this.estimateMemory(nodesGenerated)
        };
      }

      explored.set(current.key, current.pathCost);
      nodesExpanded++;
      if (current.depth > maxDepth) maxDepth = current.depth;

      const successors = PuzzleEngine.getSuccessors(current.state);
      for (const succ of successors) {
        const succKey = PuzzleEngine.stateToKey(succ.state);
        const newCost = current.pathCost + 1;

        if (!explored.has(succKey) || explored.get(succKey) > newCost) {
          const existingFrontierIdx = frontier.findIndex(n => n.key === succKey);
          if (existingFrontierIdx !== -1) {
            if (frontier[existingFrontierIdx].pathCost > newCost) {
              frontier.splice(existingFrontierIdx, 1);
            } else {
              continue;
            }
          }

          nodesGenerated++;
          const childNode = new SearchNode(
            succ.state,
            current,
            succ.action,
            current.depth + 1,
            newCost,
            0
          );
          frontier.push(childNode);
        }
      }
    }

    return {
      algorithm: "Uniform Cost Search (UCS)",
      solutionFound: false,
      path: [],
      moves: 0,
      nodesGenerated,
      nodesExpanded,
      maxDepth,
      executionTime: +(performance.now() - startTime).toFixed(2),
      memory: this.estimateMemory(nodesGenerated)
    };
  }

  // ==========================================================================
  // ALGORITHM 6: GREEDY BEST FIRST SEARCH (GBFS)
  // ==========================================================================
  static solveGBFS(initial, goal, heuristicType = 'manhattan', maxNodes = 25000) {
    const startTime = performance.now();
    SearchNode.idCounter = 0;

    const initialH = HeuristicsEngine.evaluate(heuristicType, initial, goal);
    const root = new SearchNode(initial, null, null, 0, 0, initialH);
    const goalKey = PuzzleEngine.stateToKey(goal);

    const frontier = [root];
    const explored = new Set();
    const frontierKeys = new Set([root.key]);

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (frontier.length > 0 && nodesExpanded < maxNodes) {
      // Pick lowest h(n)
      let minIdx = 0;
      for (let i = 1; i < frontier.length; i++) {
        if (frontier[i].h < frontier[minIdx].h) {
          minIdx = i;
        }
      }
      const current = frontier.splice(minIdx, 1)[0];
      frontierKeys.delete(current.key);
      explored.add(current.key);
      nodesExpanded++;

      if (current.depth > maxDepth) maxDepth = current.depth;

      if (current.key === goalKey) {
        const endTime = performance.now();
        return {
          algorithm: `Greedy Best First Search (${heuristicType})`,
          solutionFound: true,
          path: this.extractSolutionPath(current),
          moves: current.depth,
          nodesGenerated,
          nodesExpanded,
          maxDepth,
          executionTime: +(endTime - startTime).toFixed(2),
          memory: this.estimateMemory(nodesGenerated)
        };
      }

      const successors = PuzzleEngine.getSuccessors(current.state);
      for (const succ of successors) {
        const succKey = PuzzleEngine.stateToKey(succ.state);

        if (!explored.has(succKey) && !frontierKeys.has(succKey)) {
          nodesGenerated++;
          const hVal = HeuristicsEngine.evaluate(heuristicType, succ.state, goal);
          const childNode = new SearchNode(
            succ.state,
            current,
            succ.action,
            current.depth + 1,
            current.pathCost + 1,
            hVal
          );
          frontier.push(childNode);
          frontierKeys.add(succKey);
        }
      }
    }

    return {
      algorithm: `Greedy Best First Search (${heuristicType})`,
      solutionFound: false,
      path: [],
      moves: 0,
      nodesGenerated,
      nodesExpanded,
      maxDepth,
      executionTime: +(performance.now() - startTime).toFixed(2),
      memory: this.estimateMemory(nodesGenerated)
    };
  }

  // ==========================================================================
  // ALGORITHM 7: A* SEARCH
  // ==========================================================================
  static solveAStar(initial, goal, heuristicType = 'manhattan', maxNodes = 30000) {
    const startTime = performance.now();
    SearchNode.idCounter = 0;

    const initialH = HeuristicsEngine.evaluate(heuristicType, initial, goal);
    const root = new SearchNode(initial, null, null, 0, 0, initialH);
    const goalKey = PuzzleEngine.stateToKey(goal);

    const frontier = [root];
    const closedCosts = new Map(); // key -> best g(n)

    let nodesGenerated = 1;
    let nodesExpanded = 0;
    let maxDepth = 0;

    while (frontier.length > 0 && nodesExpanded < maxNodes) {
      // Pick lowest f(n), tie-break with lower h(n)
      let minIdx = 0;
      for (let i = 1; i < frontier.length; i++) {
        if (frontier[i].f < frontier[minIdx].f) {
          minIdx = i;
        } else if (frontier[i].f === frontier[minIdx].f && frontier[i].h < frontier[minIdx].h) {
          minIdx = i;
        }
      }
      const current = frontier.splice(minIdx, 1)[0];

      if (current.key === goalKey) {
        const endTime = performance.now();
        return {
          algorithm: `A* Search (${heuristicType})`,
          solutionFound: true,
          path: this.extractSolutionPath(current),
          moves: current.depth,
          nodesGenerated,
          nodesExpanded,
          maxDepth,
          executionTime: +(endTime - startTime).toFixed(2),
          memory: this.estimateMemory(nodesGenerated)
        };
      }

      closedCosts.set(current.key, current.pathCost);
      nodesExpanded++;
      if (current.depth > maxDepth) maxDepth = current.depth;

      const successors = PuzzleEngine.getSuccessors(current.state);
      for (const succ of successors) {
        const succKey = PuzzleEngine.stateToKey(succ.state);
        const newG = current.pathCost + 1;

        if (closedCosts.has(succKey) && closedCosts.get(succKey) <= newG) {
          continue;
        }

        const existingFrontierIdx = frontier.findIndex(n => n.key === succKey);
        if (existingFrontierIdx !== -1) {
          if (frontier[existingFrontierIdx].pathCost <= newG) {
            continue;
          } else {
            frontier.splice(existingFrontierIdx, 1);
          }
        }

        nodesGenerated++;
        const hVal = HeuristicsEngine.evaluate(heuristicType, succ.state, goal);
        const childNode = new SearchNode(
          succ.state,
          current,
          succ.action,
          current.depth + 1,
          newG,
          hVal
        );
        frontier.push(childNode);
      }
    }

    return {
      algorithm: `A* Search (${heuristicType})`,
      solutionFound: false,
      path: [],
      moves: 0,
      nodesGenerated,
      nodesExpanded,
      maxDepth,
      executionTime: +(performance.now() - startTime).toFixed(2),
      memory: this.estimateMemory(nodesGenerated)
    };
  }

  /**
   * Universal runner for any supported algorithm
   */
  static runAlgorithm(algoId, initial, goal, params = {}) {
    switch (algoId) {
      case 'bfs':
        return this.solveBFS(initial, goal);
      case 'dfs':
        return this.solveDFS(initial, goal, params.depthLimit || 22);
      case 'dls':
        return this.solveDLS(initial, goal, params.depthLimit || 8);
      case 'iddls':
        return this.solveIDDLS(initial, goal, params.depthLimit || 16);
      case 'ucs':
        return this.solveUCS(initial, goal);
      case 'gbfs':
        return this.solveGBFS(initial, goal, params.heuristic || 'manhattan');
      case 'astar':
        return this.solveAStar(initial, goal, params.heuristic || 'manhattan');
      default:
        return this.solveBFS(initial, goal);
    }
  }
}
