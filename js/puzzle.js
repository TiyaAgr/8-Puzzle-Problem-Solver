/**
 * 8-Puzzle Problem Core Logic
 * Handles state representation, moves, inversion counting, and solvability checks.
 */

// Default standard goal state: 1 2 3 / 8 0 4 / 7 6 5 (as in assignment) or 1 2 3 / 4 5 6 / 7 8 0
// We provide standard 1-8 sequential goal, or VIT assignment example goal (1 2 3 / 8 0 4 / 7 6 5)
// We'll support both, with assignment's example as a prominent toggle!
export const DEFAULT_GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];
export const ASSIGNMENT_GOAL = [1, 2, 3, 8, 0, 4, 7, 6, 5];

export class Puzzle {
    /**
     * Checks if two states are identical
     */
    static areStatesEqual(s1, s2) {
        if (!s1 || !s2 || s1.length !== s2.length) return false;
        for (let i = 0; i < s1.length; i++) {
            if (s1[i] !== s2[i]) return false;
        }
        return true;
    }

    /**
     * Serializes board state into a hashable string
     */
    static stateToString(state) {
        return state.join(',');
    }

    /**
     * Parse string back into array
     */
    static stringToState(str) {
        return str.split(',').map(Number);
    }

    /**
     * Returns the 0-based index of the empty tile (0)
     */
    static getBlankIndex(state) {
        return state.indexOf(0);
    }

    /**
     * Get 2D (row, col) from 1D index (0..8)
     */
    static indexToPos(idx) {
        return { row: Math.floor(idx / 3), col: idx % 3 };
    }

    /**
     * Get 1D index from 2D (row, col)
     */
    static posToIndex(row, col) {
        return row * 3 + col;
    }

    /**
     * Generate valid successors of a given state
     * Returns array of { state, action, moveCost: 1 }
     */
    static getSuccessors(state) {
        const blankIdx = this.getBlankIndex(state);
        const { row, col } = this.indexToPos(blankIdx);
        const successors = [];

        // Movements of the blank tile: Up, Down, Left, Right
        const moves = [
            { name: 'Up', dr: -1, dc: 0 },
            { name: 'Down', dr: 1, dc: 0 },
            { name: 'Left', dr: 0, dc: -1 },
            { name: 'Right', dr: 0, dc: 1 }
        ];

        for (const move of moves) {
            const newRow = row + move.dr;
            const newCol = col + move.dc;

            if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
                const targetIdx = this.posToIndex(newRow, newCol);
                const newState = [...state];
                // Swap blank with target tile
                newState[blankIdx] = newState[targetIdx];
                newState[targetIdx] = 0;

                successors.push({
                    state: newState,
                    action: move.name,
                    movedTile: state[targetIdx],
                    cost: 1
                });
            }
        }

        return successors;
    }

    /**
     * Count inversions in a state (ignoring the empty tile 0)
     */
    static countInversions(state) {
        let inversions = 0;
        const arr = state.filter(x => x !== 0);
        for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) {
                    inversions++;
                }
            }
        }
        return inversions;
    }

    /**
     * Determine if initial state can reach goal state.
     * In an odd-dimension puzzle (3x3), initial and goal states are mutually reachable
     * if and only if their inversion counts have the same parity (both even or both odd).
     */
    static isSolvable(initialState, goalState = DEFAULT_GOAL) {
        const invInitial = this.countInversions(initialState);
        const invGoal = this.countInversions(goalState);
        return (invInitial % 2) === (invGoal % 2);
    }

    /**
     * Validate an arbitrary 9-element array to ensure it's a valid permutation of 0..8
     */
    static isValidState(state) {
        if (!Array.isArray(state) || state.length !== 9) return false;
        const seen = new Set();
        for (const val of state) {
            if (typeof val !== 'number' || val < 0 || val > 8 || seen.has(val)) {
                return false;
            }
            seen.add(val);
        }
        return true;
    }

    /**
     * Generate a random solvable puzzle by taking random walks from the goal state.
     * This guarantees solvability and limits depth for testing!
     */
    static generateSolvableState(goalState = DEFAULT_GOAL, depth = 6) {
        let current = [...goalState];
        let previousStateStr = null;

        for (let i = 0; i < depth; i++) {
            const succs = this.getSuccessors(current);
            // Avoid immediately stepping back to previous state if possible
            const filtered = succs.filter(s => this.stateToString(s.state) !== previousStateStr);
            const candidates = filtered.length > 0 ? filtered : succs;
            const chosen = candidates[Math.floor(Math.random() * candidates.length)];
            previousStateStr = this.stateToString(current);
            current = chosen.state;
        }

        // If by chance we reached back to goal, do one more move
        if (this.areStatesEqual(current, goalState)) {
            const succs = this.getSuccessors(current);
            current = succs[0].state;
        }

        return current;
    }
}
