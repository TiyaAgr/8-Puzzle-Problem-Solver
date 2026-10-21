/**
 * Heuristics for 8-Puzzle Informed Searches (GBFS and A*)
 * - Misplaced Tiles: count of tiles not in their target goal positions (excluding blank)
 * - Manhattan Distance: sum of horizontal and vertical distances of tiles from their goal positions
 */

import { Puzzle } from '../puzzle.js';

export class Heuristics {
    /**
     * Misplaced Tiles heuristic h1(n)
     * Number of tiles that are not in their goal position (blank 0 excluded).
     * Admissible and consistent.
     */
    static misplacedTiles(state, goalState) {
        let count = 0;
        for (let i = 0; i < state.length; i++) {
            if (state[i] !== 0 && state[i] !== goalState[i]) {
                count++;
            }
        }
        return count;
    }

    /**
     * Manhattan Distance heuristic h2(n)
     * Sum of absolute differences in row and col positions for all tiles (excluding blank 0).
     * Strictly dominates Misplaced Tiles: h2(n) >= h1(n).
     * Admissible and consistent.
     */
    static manhattanDistance(state, goalState) {
        let distance = 0;

        // Build target position lookup for goal state: tile -> { row, col }
        const goalPosMap = {};
        for (let i = 0; i < goalState.length; i++) {
            goalPosMap[goalState[i]] = Puzzle.indexToPos(i);
        }

        for (let i = 0; i < state.length; i++) {
            const tile = state[i];
            if (tile !== 0) {
                const currentPos = Puzzle.indexToPos(i);
                const targetPos = goalPosMap[tile];
                distance += Math.abs(currentPos.row - targetPos.row) + Math.abs(currentPos.col - targetPos.col);
            }
        }

        return distance;
    }

    /**
     * Evaluator helper: get heuristic value by name
     */
    static calculate(name, state, goalState) {
        if (name === 'misplaced' || name === 'Misplaced Tiles') {
            return this.misplacedTiles(state, goalState);
        }
        return this.manhattanDistance(state, goalState);
    }
}
