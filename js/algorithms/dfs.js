/**
 * Depth-First Search (DFS) Implementation for 8-Puzzle
 * 
 * Properties:
 * - Strategy: Expands deepest unexpanded node (LIFO Stack).
 * - Completeness: Incomplete in infinite state spaces; complete in finite state spaces with cycle checking.
 * - Optimality: Non-optimal (frequently finds long paths before short paths).
 * - Time Complexity: O(b^m) where m is maximum tree depth.
 * - Space Complexity: O(b*m) linear space requirement.
 */

import { Puzzle } from '../puzzle.js';

export class DFS {
    static solve(initialState, goalState, options = {}) {
        const startTime = performance.now();
        const maxDepth = options.maxDepth || 30; // Bound DFS to prevent stack explosion in cyclic 8-puzzle
        const maxNodes = options.maxNodes || 40000;
        const recordTrace = options.recordTrace || false;
        const maxTraceSteps = options.maxTraceSteps || 500;

        const rootNode = {
            id: 0,
            state: initialState,
            parent: null,
            action: 'Initial',
            depth: 0,
            cost: 0,
            f: 0,
            g: 0,
            h: 0
        };

        if (Puzzle.areStatesEqual(initialState, goalState)) {
            return {
                algorithm: 'DFS',
                success: true,
                path: [rootNode],
                totalMoves: 0,
                nodesGenerated: 1,
                nodesExpanded: 0,
                maxSearchDepth: 0,
                executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
                pathCost: 0,
                approxMemoryKb: 0.1,
                trace: []
            };
        }

        // LIFO Stack for DFS
        const stack = [rootNode];
        // Path visited map to avoid cycles along the current branch
        const explored = new Map(); // stateStr -> minimum depth seen
        explored.set(Puzzle.stateToString(initialState), 0);

        let nodesGenerated = 1;
        let nodesExpanded = 0;
        let maxSearchDepth = 0;
        let goalNode = null;
        const trace = [];

        while (stack.length > 0) {
            const currentNode = stack.pop();
            nodesExpanded++;

            if (currentNode.depth > maxSearchDepth) {
                maxSearchDepth = currentNode.depth;
            }

            if (Puzzle.areStatesEqual(currentNode.state, goalState)) {
                goalNode = currentNode;
                break;
            }

            if (currentNode.depth >= maxDepth) {
                continue;
            }

            const successors = Puzzle.getSuccessors(currentNode.state);
            const generatedSuccessors = [];

            for (const succ of successors) {
                const succStr = Puzzle.stateToString(succ.state);
                const nextDepth = currentNode.depth + 1;

                // Prune if state was reached before at shallower or equal depth
                if (!explored.has(succStr) || explored.get(succStr) > nextDepth) {
                    explored.set(succStr, nextDepth);
                    nodesGenerated++;

                    const childNode = {
                        id: nodesGenerated,
                        state: succ.state,
                        parent: currentNode,
                        action: succ.action,
                        movedTile: succ.movedTile,
                        depth: nextDepth,
                        cost: currentNode.cost + 1,
                        f: nextDepth,
                        g: currentNode.cost + 1,
                        h: 0
                    };

                    generatedSuccessors.push(childNode);
                    stack.push(childNode);
                }
            }

            if (recordTrace && trace.length < maxTraceSteps) {
                trace.push({
                    step: trace.length + 1,
                    type: 'EXPAND',
                    currentNode: currentNode,
                    frontierSize: stack.length,
                    exploredSize: explored.size,
                    depth: currentNode.depth,
                    successors: generatedSuccessors
                });
            }

            if (nodesExpanded >= maxNodes) break;
        }

        const endTime = performance.now();
        const executionTimeMs = Number((endTime - startTime).toFixed(2));

        let path = [];
        if (goalNode) {
            let curr = goalNode;
            while (curr !== null) {
                path.unshift(curr);
                curr = curr.parent;
            }
        }

        return {
            algorithm: 'DFS',
            success: goalNode !== null,
            path: path,
            totalMoves: path.length > 0 ? path.length - 1 : 0,
            nodesGenerated: nodesGenerated,
            nodesExpanded: nodesExpanded,
            maxSearchDepth: maxSearchDepth,
            executionTimeMs: executionTimeMs,
            pathCost: path.length > 0 ? path.length - 1 : 0,
            approxMemoryKb: Number(((nodesGenerated * 64) / 1024).toFixed(2)),
            trace: trace
        };
    }
}
