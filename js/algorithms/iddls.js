/**
 * Iterative Deepening Depth-Limited Search (IDDLS) Implementation for 8-Puzzle
 * 
 * Properties:
 * - Strategy: Iteratively executes DLS with increasing depth limits (0, 1, 2, ...).
 * - Completeness: Complete (same as BFS).
 * - Optimality: Optimal for uniform path costs.
 * - Time Complexity: O(b^d).
 * - Space Complexity: O(b*d) - significantly lower memory footprint than BFS!
 */

import { Puzzle } from '../puzzle.js';

export class IDDLS {
    static solve(initialState, goalState, options = {}) {
        const startTime = performance.now();
        const maxDepthLimit = options.maxDepthLimit || 25;
        const recordTrace = options.recordTrace || false;
        const maxTraceSteps = options.maxTraceSteps || 500;

        let totalNodesGenerated = 0;
        let totalNodesExpanded = 0;
        let maxSearchDepthReached = 0;
        let solutionNode = null;
        const trace = [];

        for (let limit = 0; limit <= maxDepthLimit; limit++) {
            // Run depth-limited search for this iteration
            const result = this.depthLimitedIteration(initialState, goalState, limit, {
                recordTrace,
                trace,
                maxTraceSteps,
                startGeneratedCount: totalNodesGenerated,
                startExpandedCount: totalNodesExpanded
            });

            totalNodesGenerated = result.nodesGenerated;
            totalNodesExpanded = result.nodesExpanded;
            if (result.maxDepth > maxSearchDepthReached) {
                maxSearchDepthReached = result.maxDepth;
            }

            if (result.goalNode) {
                solutionNode = result.goalNode;
                break;
            }

            // If no cutoff occurred and goal wasn't found, then search space exhausted
            if (!result.cutoff) {
                break;
            }
        }

        const endTime = performance.now();
        const executionTimeMs = Number((endTime - startTime).toFixed(2));

        let path = [];
        if (solutionNode) {
            let curr = solutionNode;
            while (curr !== null) {
                path.unshift(curr);
                curr = curr.parent;
            }
        }

        return {
            algorithm: 'IDDLS',
            success: solutionNode !== null,
            path: path,
            totalMoves: path.length > 0 ? path.length - 1 : 0,
            nodesGenerated: totalNodesGenerated,
            nodesExpanded: totalNodesExpanded,
            maxSearchDepth: maxSearchDepthReached,
            executionTimeMs: executionTimeMs,
            pathCost: path.length > 0 ? path.length - 1 : 0,
            approxMemoryKb: Number(((maxSearchDepthReached * 4 * 64) / 1024).toFixed(2)),
            trace: trace
        };
    }

    static depthLimitedIteration(initialState, goalState, limit, ctx) {
        const root = {
            id: ++ctx.startGeneratedCount,
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
                goalNode: root,
                cutoff: false,
                nodesGenerated: ctx.startGeneratedCount,
                nodesExpanded: ctx.startExpandedCount,
                maxDepth: 0
            };
        }

        const stack = [root];
        const explored = new Map();
        explored.set(Puzzle.stateToString(initialState), 0);

        let maxDepth = 0;
        let cutoff = false;
        let goalNode = null;

        while (stack.length > 0) {
            const currentNode = stack.pop();
            ctx.startExpandedCount++;

            if (currentNode.depth > maxDepth) {
                maxDepth = currentNode.depth;
            }

            if (Puzzle.areStatesEqual(currentNode.state, goalState)) {
                goalNode = currentNode;
                break;
            }

            if (currentNode.depth >= limit) {
                cutoff = true;
                continue;
            }

            const successors = Puzzle.getSuccessors(currentNode.state);
            const succNodes = [];

            for (const succ of successors) {
                const succStr = Puzzle.stateToString(succ.state);
                const nextDepth = currentNode.depth + 1;

                if (!explored.has(succStr) || explored.get(succStr) > nextDepth) {
                    explored.set(succStr, nextDepth);
                    ctx.startGeneratedCount++;

                    const child = {
                        id: ctx.startGeneratedCount,
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

                    succNodes.push(child);
                    stack.push(child);
                }
            }

            if (ctx.recordTrace && ctx.trace.length < ctx.maxTraceSteps) {
                ctx.trace.push({
                    step: ctx.trace.length + 1,
                    type: 'EXPAND',
                    currentLimit: limit,
                    currentNode: currentNode,
                    frontierSize: stack.length,
                    depth: currentNode.depth,
                    successors: succNodes
                });
            }
        }

        return {
            goalNode,
            cutoff,
            nodesGenerated: ctx.startGeneratedCount,
            nodesExpanded: ctx.startExpandedCount,
            maxDepth
        };
    }
}
