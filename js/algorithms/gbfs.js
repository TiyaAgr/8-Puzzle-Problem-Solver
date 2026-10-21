/**
 * Greedy Best-First Search (GBFS) Implementation for 8-Puzzle
 * 
 * Properties:
 * - Strategy: Expands node that appears closest to goal, using heuristic evaluation f(n) = h(n).
 * - Completeness: Complete in finite spaces with repeated state checking.
 * - Optimality: Not optimal (can be led astray by heuristic).
 * - Heuristics: Misplaced Tiles or Manhattan Distance.
 */

import { Puzzle } from '../puzzle.js';
import { Heuristics } from './heuristics.js';

export class GBFS {
    static solve(initialState, goalState, options = {}) {
        const startTime = performance.now();
        const heuristicName = options.heuristic || 'manhattan';
        const maxNodes = options.maxNodes || 50000;
        const recordTrace = options.recordTrace || false;
        const maxTraceSteps = options.maxTraceSteps || 500;

        const initialH = Heuristics.calculate(heuristicName, initialState, goalState);
        const rootNode = {
            id: 0,
            state: initialState,
            parent: null,
            action: 'Initial',
            depth: 0,
            cost: 0,
            g: 0,
            h: initialH,
            f: initialH // In GBFS, f(n) = h(n)
        };

        if (Puzzle.areStatesEqual(initialState, goalState)) {
            return {
                algorithm: 'GBFS',
                heuristic: heuristicName,
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

        // Priority queue sorted by f(n) ascending (min-priority)
        const openList = [rootNode];
        const explored = new Set();
        const openSet = new Set([Puzzle.stateToString(initialState)]);

        let nodesGenerated = 1;
        let nodesExpanded = 0;
        let maxSearchDepth = 0;
        let goalNode = null;
        const trace = [];

        while (openList.length > 0) {
            // Pick lowest f(n) = h(n)
            openList.sort((a, b) => a.f - b.f || a.h - b.h);
            const currentNode = openList.shift();
            const stateStr = Puzzle.stateToString(currentNode.state);
            openSet.delete(stateStr);
            explored.add(stateStr);

            nodesExpanded++;
            if (currentNode.depth > maxSearchDepth) {
                maxSearchDepth = currentNode.depth;
            }

            if (Puzzle.areStatesEqual(currentNode.state, goalState)) {
                goalNode = currentNode;
                break;
            }

            const successors = Puzzle.getSuccessors(currentNode.state);
            const generatedSuccessors = [];

            for (const succ of successors) {
                const succStr = Puzzle.stateToString(succ.state);

                if (!explored.has(succStr) && !openSet.has(succStr)) {
                    nodesGenerated++;
                    const h = Heuristics.calculate(heuristicName, succ.state, goalState);
                    const g = currentNode.cost + 1;
                    const f = h; // GBFS objective

                    const childNode = {
                        id: nodesGenerated,
                        state: succ.state,
                        parent: currentNode,
                        action: succ.action,
                        movedTile: succ.movedTile,
                        depth: currentNode.depth + 1,
                        cost: g,
                        g: g,
                        h: h,
                        f: f
                    };

                    generatedSuccessors.push(childNode);
                    openList.push(childNode);
                    openSet.add(succStr);
                }
            }

            if (recordTrace && trace.length < maxTraceSteps) {
                trace.push({
                    step: trace.length + 1,
                    type: 'EXPAND',
                    currentNode: currentNode,
                    frontierSize: openList.length,
                    exploredSize: explored.size,
                    depth: currentNode.depth,
                    successors: generatedSuccessors,
                    frontierPeek: openList.slice(0, 5).map(n => ({
                        state: n.state,
                        h: n.h,
                        g: n.g,
                        f: n.f
                    }))
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
            algorithm: 'GBFS',
            heuristic: heuristicName,
            success: goalNode !== null,
            path: path,
            totalMoves: path.length > 0 ? path.length - 1 : 0,
            nodesGenerated: nodesGenerated,
            nodesExpanded: nodesExpanded,
            maxSearchDepth: maxSearchDepth,
            executionTimeMs: executionTimeMs,
            pathCost: path.length > 0 ? path.length - 1 : 0,
            approxMemoryKb: Number(((nodesGenerated * 90) / 1024).toFixed(2)),
            trace: trace
        };
    }
}
