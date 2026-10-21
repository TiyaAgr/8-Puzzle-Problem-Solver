/**
 * 8-Puzzle Comparison Benchmarking Module
 * Runs BFS, DFS, DLS, IDDLS, GBFS, and A* on the identical puzzle instance.
 * Compares: Solution Found, Nodes Expanded, Moves, Execution Time (ms), Memory Usage.
 */

import { BFS } from './algorithms/bfs.js';
import { DFS } from './algorithms/dfs.js';
import { DLS } from './algorithms/dls.js';
import { IDDLS } from './algorithms/iddls.js';
import { GBFS } from './algorithms/gbfs.js';
import { AStar } from './algorithms/astar.js';

export class ComparisonEngine {
    /**
     * Runs all algorithms and calls onProgress for each completed test.
     */
    static async runComparison(initialState, goalState, config = {}, onProgress = null) {
        const dlsLimit = config.dlsLimit || 12;
        const gbfsHeuristic = config.gbfsHeuristic || 'manhattan';
        const astarHeuristic = config.astarHeuristic || 'manhattan';

        const algorithms = [
            {
                name: 'BFS',
                fullName: 'Breadth First Search (Assigned: 24BDS0004)',
                isAssigned: true,
                run: () => BFS.solve(initialState, goalState, { maxNodes: 80000, recordTrace: false }),
                memoryLevel: 'High'
            },
            {
                name: 'DFS',
                fullName: 'Depth First Search',
                isAssigned: false,
                run: () => DFS.solve(initialState, goalState, { maxDepth: 25, maxNodes: 40000, recordTrace: false }),
                memoryLevel: 'Low'
            },
            {
                name: 'DLS',
                fullName: `Depth Limited Search (Limit = ${dlsLimit})`,
                isAssigned: false,
                run: () => DLS.solve(initialState, goalState, { depthLimit: dlsLimit, maxNodes: 40000, recordTrace: false }),
                memoryLevel: 'Low'
            },
            {
                name: 'IDDLS',
                fullName: 'Iterative Deepening DLS',
                isAssigned: false,
                run: () => IDDLS.solve(initialState, goalState, { maxDepthLimit: 20, recordTrace: false }),
                memoryLevel: 'Medium'
            },
            {
                name: 'GBFS',
                fullName: `Greedy Best First Search (${gbfsHeuristic})`,
                isAssigned: false,
                run: () => GBFS.solve(initialState, goalState, { heuristic: gbfsHeuristic, recordTrace: false }),
                memoryLevel: 'Low'
            },
            {
                name: 'A*',
                fullName: `A* Search (${astarHeuristic})`,
                isAssigned: false,
                run: () => AStar.solve(initialState, goalState, { heuristic: astarHeuristic, recordTrace: false }),
                memoryLevel: 'Medium'
            }
        ];

        const results = [];

        for (let i = 0; i < algorithms.length; i++) {
            const algo = algorithms[i];

            // Allow UI to breathe between runs
            await new Promise(resolve => setTimeout(resolve, 30));

            try {
                const res = algo.run();
                const record = {
                    name: algo.name,
                    fullName: algo.fullName,
                    isAssigned: algo.isAssigned,
                    solutionFound: res.success ? 'Yes' : 'No',
                    nodesExpanded: res.nodesExpanded,
                    nodesGenerated: res.nodesGenerated,
                    moves: res.success ? res.totalMoves : '-',
                    timeMs: res.executionTimeMs,
                    memory: algo.memoryLevel,
                    memoryKb: res.approxMemoryKb,
                    pathCost: res.success ? res.pathCost : '-',
                    maxDepth: res.maxSearchDepth
                };
                results.push(record);

                if (onProgress) {
                    onProgress(record, i + 1, algorithms.length);
                }
            } catch (err) {
                console.error(`Error running ${algo.name}:`, err);
                const record = {
                    name: algo.name,
                    fullName: algo.fullName,
                    isAssigned: algo.isAssigned,
                    solutionFound: 'Error',
                    nodesExpanded: '-',
                    nodesGenerated: '-',
                    moves: '-',
                    timeMs: '-',
                    memory: algo.memoryLevel,
                    memoryKb: 0,
                    pathCost: '-',
                    maxDepth: '-'
                };
                results.push(record);
                if (onProgress) {
                    onProgress(record, i + 1, algorithms.length);
                }
            }
        }

        return results;
    }
}
