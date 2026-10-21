/**
 * A* Search Implementation for 8-Puzzle
 * 
 * Properties:
 * - Strategy: Evaluates nodes using f(n) = g(n) + h(n).
 * - Completeness: Complete (in finite spaces with positive step costs).
 * - Optimality: Optimal if heuristic h(n) is admissible (which both Misplaced Tiles and Manhattan Distance are).
 * - Heuristics: Misplaced Tiles, Manhattan Distance.
 */

import { Puzzle } from '../puzzle.js';
import { Heuristics } from './heuristics.js';

export class AStar {
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
            f: initialH
        };

        if (Puzzle.areStatesEqual(initialState, goalState)) {
            return {
                algorithm: 'A*',
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

        // Open list priority queue sorted by f(n) = g(n) + h(n)
        const openList = [rootNode];
        // Map: state string -> best g(n) recorded
        const gScores = new Map();
        gScores.set(Puzzle.stateToString(initialState), 0);

        const explored = new Set();
        let nodesGenerated = 1;
        let nodesExpanded = 0;
        let maxSearchDepth = 0;
        let goalNode = null;
        const trace = [];

        while (openList.length > 0) {
            // Find node with minimum f, breaking ties by lowest h
            let bestIdx = 0;
            for (let i = 1; i < openList.length; i++) {
                if (openList[i].f < openList[bestIdx].f ||
                    (openList[i].f === openList[bestIdx].f && openList[i].h < openList[bestIdx].h)) {
                    bestIdx = i;
                }
            }
            const currentNode = openList.splice(bestIdx, 1)[0];
            const stateStr = Puzzle.stateToString(currentNode.state);

            // If already expanded with a better or equal g-score, skip
            if (explored.has(stateStr)) continue;
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
                const tentativeG = currentNode.g + 1;

                if (explored.has(succStr)) continue;

                if (!gScores.has(succStr) || tentativeG < gScores.get(succStr)) {
                    gScores.set(succStr, tentativeG);
                    nodesGenerated++;

                    const h = Heuristics.calculate(heuristicName, succ.state, goalState);
                    const f = tentativeG + h;

                    const childNode = {
                        id: nodesGenerated,
                        state: succ.state,
                        parent: currentNode,
                        action: succ.action,
                        movedTile: succ.movedTile,
                        depth: currentNode.depth + 1,
                        cost: tentativeG,
                        g: tentativeG,
                        h: h,
                        f: f
                    };

                    generatedSuccessors.push(childNode);
                    openList.push(childNode);
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
                        g: n.g,
                        h: n.h,
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
            algorithm: 'A*',
            heuristic: heuristicName,
            success: goalNode !== null,
            path: path,
            totalMoves: path.length > 0 ? path.length - 1 : 0,
            nodesGenerated: nodesGenerated,
            nodesExpanded: nodesExpanded,
            maxSearchDepth: maxSearchDepth,
            executionTimeMs: executionTimeMs,
            pathCost: path.length > 0 ? path.length - 1 : 0,
            approxMemoryKb: Number(((nodesGenerated * 95) / 1024).toFixed(2)),
            trace: trace
        };
    }
}
