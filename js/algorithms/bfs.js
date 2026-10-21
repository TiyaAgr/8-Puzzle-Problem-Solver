/**
 * Breadth-First Search (BFS) Implementation for 8-Puzzle
 * Assigned Algorithm for Reg No: 24BDS0004
 * 
 * Properties:
 * - Strategy: Expands the shallowest unexpanded node in the search tree (FIFO queue).
 * - Completeness: Complete (finite branching factor b ≈ 2.67).
 * - Optimality: Optimal for uniform path costs (step cost c = 1).
 * - Time Complexity: O(b^d).
 * - Space Complexity: O(b^d).
 */

import { Puzzle } from '../puzzle.js';

export class BFS {
    /**
     * Executes BFS search and produces solution, telemetry trace, and search tree data.
     */
    static solve(initialState, goalState, options = {}) {
        const startTime = performance.now();
        const maxNodes = options.maxNodes || 80000;
        const recordTrace = options.recordTrace !== undefined ? options.recordTrace : true;
        const maxTraceSteps = options.maxTraceSteps || 600;

        // Root Node
        const rootNode = {
            id: 0,
            state: [...initialState],
            parent: null,
            parentId: null,
            action: 'Initial',
            movedTile: null,
            depth: 0,
            cost: 0,
            f: 0,
            g: 0,
            h: 0,
            frontierSnapshot: [{
                id: 0,
                state: [...initialState],
                depth: 0,
                action: 'Initial',
                movedTile: null
            }],
            frontierSize: 1,
            successors: []
        };

        // All nodes indexed by id for search tree visualization
        const allTreeNodes = new Map();
        allTreeNodes.set(0, {
            id: 0,
            parentId: null,
            action: 'Initial',
            movedTile: null,
            depth: 0,
            state: [...initialState],
            isGoal: Puzzle.areStatesEqual(initialState, goalState)
        });

        // Check if root is already goal
        if (Puzzle.areStatesEqual(initialState, goalState)) {
            const endTime = performance.now();
            return {
                algorithm: 'BFS',
                assignedTo: '24BDS0004',
                success: true,
                path: [rootNode],
                totalMoves: 0,
                nodesGenerated: 1,
                nodesExpanded: 0,
                maxSearchDepth: 0,
                executionTimeMs: Number((endTime - startTime).toFixed(2)),
                pathCost: 0,
                approxMemoryKb: this.estimateMemory(1, 0),
                allTreeNodes: Array.from(allTreeNodes.values()),
                trace: [{
                    step: 1,
                    type: 'GOAL_FOUND',
                    currentNode: rootNode,
                    frontierSize: 1,
                    exploredSize: 0,
                    depth: 0,
                    successors: [],
                    frontierPeek: rootNode.frontierSnapshot
                }]
            };
        }

        // FIFO Queue for BFS frontier
        const queue = [rootNode];
        // Hash Set for explored (closed) states
        const explored = new Set();
        // Frontier set to avoid enqueuing duplicates
        const frontierSet = new Set([Puzzle.stateToString(initialState)]);

        let nodesGenerated = 1;
        let nodesExpanded = 0;
        let maxSearchDepth = 0;
        let goalNode = null;
        const trace = [];

        // Push initial trace step for root node expansion
        if (recordTrace) {
            trace.push({
                step: 1,
                type: 'INITIAL_QUEUE',
                currentNode: rootNode,
                frontierSize: 1,
                exploredSize: 0,
                depth: 0,
                successors: [],
                frontierPeek: [{
                    id: 0,
                    state: rootNode.state,
                    depth: 0,
                    action: 'Initial',
                    movedTile: null
                }]
            });
        }

        while (queue.length > 0) {
            // FIFO: dequeue from front
            const currentNode = queue.shift();
            const stateStr = Puzzle.stateToString(currentNode.state);
            frontierSet.delete(stateStr);
            explored.add(stateStr);

            nodesExpanded++;
            if (currentNode.depth > maxSearchDepth) {
                maxSearchDepth = currentNode.depth;
            }

            // Successor generation
            const successors = Puzzle.getSuccessors(currentNode.state);
            const generatedSuccessors = [];

            for (const succ of successors) {
                const succStr = Puzzle.stateToString(succ.state);

                // If not in frontier and not explored
                if (!explored.has(succStr) && !frontierSet.has(succStr)) {
                    nodesGenerated++;
                    const childNode = {
                        id: nodesGenerated,
                        state: succ.state,
                        parent: currentNode,
                        parentId: currentNode.id,
                        action: succ.action,
                        movedTile: succ.movedTile,
                        depth: currentNode.depth + 1,
                        cost: currentNode.cost + 1,
                        f: currentNode.depth + 1,
                        g: currentNode.cost + 1,
                        h: 0,
                        frontierSnapshot: [],
                        frontierSize: 0,
                        successors: []
                    };

                    const isGoal = Puzzle.areStatesEqual(succ.state, goalState);

                    allTreeNodes.set(childNode.id, {
                        id: childNode.id,
                        parentId: currentNode.id,
                        action: childNode.action,
                        movedTile: childNode.movedTile,
                        depth: childNode.depth,
                        state: childNode.state,
                        isGoal: isGoal
                    });

                    generatedSuccessors.push(childNode);

                    // Early goal test upon generation (standard BFS optimization)
                    if (isGoal) {
                        goalNode = childNode;
                        if (childNode.depth > maxSearchDepth) {
                            maxSearchDepth = childNode.depth;
                        }

                        // Attach frontier snapshot to goal node
                        const finalPeek = [...queue, childNode].slice(0, 12).map(n => ({
                            id: n.id,
                            state: n.state,
                            depth: n.depth,
                            action: n.action,
                            movedTile: n.movedTile
                        }));
                        childNode.frontierSnapshot = finalPeek;
                        childNode.frontierSize = queue.length + 1;
                        childNode.successors = [];

                        if (recordTrace && trace.length < maxTraceSteps) {
                            trace.push({
                                step: trace.length + 1,
                                type: 'EXPAND',
                                currentNode: currentNode,
                                frontierSize: queue.length + 1,
                                exploredSize: explored.size,
                                depth: currentNode.depth,
                                successors: generatedSuccessors,
                                frontierPeek: finalPeek
                            });
                            trace.push({
                                step: trace.length + 1,
                                type: 'GOAL_FOUND',
                                currentNode: goalNode,
                                frontierSize: queue.length + 1,
                                exploredSize: explored.size,
                                depth: goalNode.depth,
                                successors: [],
                                frontierPeek: finalPeek
                            });
                        }
                        break;
                    }

                    queue.push(childNode);
                    frontierSet.add(succStr);
                }
            }

            // Record frontier snapshot and generated successors directly on currentNode
            const activePeek = queue.slice(0, 12).map(n => ({
                id: n.id,
                state: n.state,
                depth: n.depth,
                action: n.action,
                movedTile: n.movedTile
            }));
            currentNode.frontierSnapshot = activePeek;
            currentNode.frontierSize = queue.length;
            currentNode.successors = generatedSuccessors;

            // Record telemetry trace step for visualization
            if (recordTrace && trace.length < maxTraceSteps && !goalNode) {
                trace.push({
                    step: trace.length + 1,
                    type: 'EXPAND',
                    currentNode: currentNode,
                    frontierSize: queue.length,
                    exploredSize: explored.size,
                    depth: currentNode.depth,
                    successors: generatedSuccessors,
                    frontierPeek: activePeek
                });
            }

            if (goalNode) break;

            if (nodesExpanded >= maxNodes) break;
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

        return {
            algorithm: 'BFS',
            assignedTo: '24BDS0004',
            success: goalNode !== null,
            path: path,
            totalMoves: path.length > 0 ? path.length - 1 : 0,
            nodesGenerated: nodesGenerated,
            nodesExpanded: nodesExpanded,
            maxSearchDepth: maxSearchDepth,
            executionTimeMs: executionTimeMs,
            pathCost: path.length > 0 ? path.length - 1 : 0,
            approxMemoryKb: this.estimateMemory(nodesGenerated, explored.size),
            allTreeNodes: Array.from(allTreeNodes.values()),
            trace: trace
        };
    }

    static estimateMemory(generated, explored) {
        const total = generated + explored;
        return Number(((total * 96) / 1024).toFixed(2));
    }
}
