/**
 * Uniform Cost Search (UCS) Implementation for 8-Puzzle
 * 
 * Properties:
 * - Strategy: Expands the unvisited node with the lowest cumulative path cost g(n).
 * - Priority Queue: Min-priority queue ordered by g(n) (cost from root to node n).
 * - Completeness: Complete if every step cost c >= ε > 0.
 * - Optimality: Optimal for any non-negative step costs (including unit costs c = 1).
 * - Goal Test: Performed when a node is selected for EXPANSION (dequeued),
 *   never when generated (unlike standard BFS optimization).
 * - Time Complexity: O(b^(1 + floor(C* / ε))) where C* is optimal cost; O(b^d) for unit costs.
 * - Space Complexity: O(b^(1 + floor(C* / ε))); O(b^d) for unit costs.
 */

import { Puzzle } from '../puzzle.js';

export class UCS {
    /**
     * Executes Uniform Cost Search on the 8-puzzle.
     * @param {Array<number>} initialState 
     * @param {Array<number>} goalState 
     * @param {Object} options 
     * @returns {Object} Search statistics, solution path, and telemetry
     */
    static solve(initialState, goalState, options = {}) {
        const startTime = performance.now();
        const maxNodes = options.maxNodes || 80000;
        const recordTrace = options.recordTrace || false;
        const maxTraceSteps = options.maxTraceSteps || 500;
        const stepCost = options.stepCost || 1; // Standard 8-puzzle unit step cost

        const rootNode = {
            id: 0,
            state: [...initialState],
            parent: null,
            parentId: null,
            action: 'Initial',
            movedTile: null,
            depth: 0,
            cost: 0,
            g: 0,
            f: 0,
            h: 0
        };

        // Note on UCS: Even if root is goal, UCS formally checks on expansion
        if (Puzzle.areStatesEqual(initialState, goalState)) {
            const endTime = performance.now();
            return {
                algorithm: 'UCS',
                fullName: 'Uniform Cost Search',
                success: true,
                path: [rootNode],
                totalMoves: 0,
                nodesGenerated: 1,
                nodesExpanded: 0,
                maxSearchDepth: 0,
                executionTimeMs: Number((endTime - startTime).toFixed(2)),
                pathCost: 0,
                approxMemoryKb: 0.1,
                trace: []
            };
        }

        // Min-Priority Queue for UCS (ordered by g-score, breaking ties by insertion/FIFO order)
        const priorityQueue = [rootNode];

        // Map: state string -> lowest g(n) cost seen
        const bestCost = new Map();
        bestCost.set(Puzzle.stateToString(initialState), 0);

        // Explored / Closed set (marked when node is expanded)
        const explored = new Set();

        let nodesGenerated = 1;
        let nodesExpanded = 0;
        let maxSearchDepth = 0;
        let goalNode = null;
        const trace = [];

        while (priorityQueue.length > 0) {
            // Find and extract node with minimum cumulative cost g(n)
            let bestIdx = 0;
            for (let i = 1; i < priorityQueue.length; i++) {
                if (priorityQueue[i].g < priorityQueue[bestIdx].g ||
                    (priorityQueue[i].g === priorityQueue[bestIdx].g && priorityQueue[i].id < priorityQueue[bestIdx].id)) {
                    bestIdx = i;
                }
            }
            const currentNode = priorityQueue.splice(bestIdx, 1)[0];
            const stateStr = Puzzle.stateToString(currentNode.state);

            // In graph-search UCS, if node has already been expanded, discard it
            if (explored.has(stateStr)) {
                continue;
            }
            explored.add(stateStr);

            nodesExpanded++;
            if (currentNode.depth > maxSearchDepth) {
                maxSearchDepth = currentNode.depth;
            }

            // CRITICAL UCS RULE: Goal test is executed upon DEQUEUE (expansion), NOT generation
            if (Puzzle.areStatesEqual(currentNode.state, goalState)) {
                goalNode = currentNode;
                break;
            }

            // Generate valid successor actions
            const successors = Puzzle.getSuccessors(currentNode.state);
            const generatedSuccessors = [];

            for (const succ of successors) {
                const succStr = Puzzle.stateToString(succ.state);
                const tentativeG = currentNode.g + stepCost;

                // If already explored with a smaller or equal cost, skip
                if (explored.has(succStr)) {
                    continue;
                }

                // If not in frontier or discovered with a strictly lower path cost
                if (!bestCost.has(succStr) || tentativeG < bestCost.get(succStr)) {
                    bestCost.set(succStr, tentativeG);
                    nodesGenerated++;

                    const childNode = {
                        id: nodesGenerated,
                        state: succ.state,
                        parent: currentNode,
                        parentId: currentNode.id,
                        action: succ.action,
                        movedTile: succ.movedTile,
                        depth: currentNode.depth + 1,
                        cost: tentativeG,
                        g: tentativeG,
                        f: tentativeG,
                        h: 0
                    };

                    generatedSuccessors.push(childNode);
                    priorityQueue.push(childNode);
                }
            }

            if (recordTrace && trace.length < maxTraceSteps) {
                trace.push({
                    step: trace.length + 1,
                    type: 'EXPAND',
                    currentNode: currentNode,
                    frontierSize: priorityQueue.length,
                    exploredSize: explored.size,
                    depth: currentNode.depth,
                    cost: currentNode.g,
                    successors: generatedSuccessors
                });
            }

            if (nodesExpanded >= maxNodes) {
                break;
            }
        }

        const endTime = performance.now();
        const executionTimeMs = Number((endTime - startTime).toFixed(2));

        // Reconstruct solution path
        let path = [];
        if (goalNode) {
            let curr = goalNode;
            while (curr !== null) {
                path.unshift(curr);
                curr = curr.parent;
            }
        }

        const approxMemoryKb = Number(((priorityQueue.length + explored.size) * 0.25).toFixed(1));

        return {
            algorithm: 'UCS',
            fullName: 'Uniform Cost Search',
            success: goalNode !== null,
            path: path,
            totalMoves: path.length > 0 ? path.length - 1 : 0,
            nodesGenerated: nodesGenerated,
            nodesExpanded: nodesExpanded,
            maxSearchDepth: maxSearchDepth,
            executionTimeMs: executionTimeMs,
            pathCost: goalNode ? goalNode.g : 0,
            approxMemoryKb: approxMemoryKb,
            trace: trace
        };
    }
}
