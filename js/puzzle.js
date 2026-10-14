/**
 * ============================================================================
 * Interactive 8-Puzzle Problem Solver - Puzzle Logic Engine
 * Author: Tiya Agrawal (Reg No: 24BDS0004)
 * Course: Artificial Intelligence
 * ============================================================================
 */

class PuzzleEngine {
  // Common Goal States
  static GOAL_SPIRAL = [1, 2, 3, 8, 0, 4, 7, 6, 5]; // As shown in assignment page 3
  static GOAL_STANDARD = [1, 2, 3, 4, 5, 6, 7, 8, 0];

  /**
   * Calculates the number of inversions in an 8-puzzle state.
   * Blank tile (0) is ignored in inversion count.
   * @param {number[]} state - Flat array of 9 integers
   * @returns {number} Inversion count
   */
  static countInversions(state) {
    let inversions = 0;
    const flat = state.filter(x => x !== 0);
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) {
          inversions++;
        }
      }
    }
    return inversions;
  }

  /**
   * Checks whether the initial state can reach the goal state.
   * In a 3x3 puzzle (odd width), parity of inversions of initial and goal must match.
   * @param {number[]} initial - 9 elements
   * @param {number[]} goal - 9 elements
   * @returns {boolean} True if solvable
   */
  static isSolvable(initial, goal) {
    const invInitial = this.countInversions(initial);
    const invGoal = this.countInversions(goal);
    return (invInitial % 2) === (invGoal % 2);
  }

  /**
   * Validates if a state is a valid permutation of [0..8].
   * @param {number[]} state 
   * @returns {boolean}
   */
  static isValidState(state) {
    if (!Array.isArray(state) || state.length !== 9) return false;
    const set = new Set(state);
    if (set.size !== 9) return false;
    for (let i = 0; i <= 8; i++) {
      if (!set.has(i)) return false;
    }
    return true;
  }

  /**
   * Serializes a state into a unique string key.
   * @param {number[]} state 
   * @returns {string}
   */
  static stateToKey(state) {
    return state.join(',');
  }

  /**
   * Deserializes a string key back into a state array.
   * @param {string} key 
   * @returns {number[]}
   */
  static keyToState(key) {
    return key.split(',').map(Number);
  }

  /**
   * Generates all valid successor states from a given state by moving the blank (0).
   * @param {number[]} state 
   * @returns {Array<{action: string, state: number[], blankIndex: number}>}
   */
  static getSuccessors(state) {
    const blankIdx = state.indexOf(0);
    const row = Math.floor(blankIdx / 3);
    const col = blankIdx % 3;
    const successors = [];

    // Direction vectors: [dRow, dCol, actionName]
    const moves = [
      [-1, 0, 'UP'],
      [1, 0, 'DOWN'],
      [0, -1, 'LEFT'],
      [0, 1, 'RIGHT']
    ];

    for (const [dRow, dCol, action] of moves) {
      const newRow = row + dRow;
      const newCol = col + dCol;

      if (newRow >= 0 && newRow < 3 && newCol >= 0 && newCol < 3) {
        const swapIdx = newRow * 3 + newCol;
        const nextState = [...state];
        // Swap blank with tile at new position
        nextState[blankIdx] = nextState[swapIdx];
        nextState[swapIdx] = 0;

        successors.push({
          action,
          state: nextState,
          blankIndex: swapIdx,
          movedTile: state[swapIdx]
        });
      }
    }

    return successors;
  }

  /**
   * Generates a guaranteed solvable puzzle by making N random legal moves from the goal.
   * This guarantees both solvability and controls solution distance.
   * @param {number[]} goal - Target goal state
   * @param {number} steps - Number of scramble moves (e.g. 10 for easy/medium)
   * @returns {number[]} Scrambled solvable state
   */
  static generateRandomSolvable(goal = this.GOAL_SPIRAL, steps = 15) {
    let current = [...goal];
    let prevBlank = -1;

    for (let i = 0; i < steps; i++) {
      const succs = this.getSuccessors(current);
      // Avoid immediately undoing the previous move
      const validSuccs = succs.filter(s => s.blankIndex !== prevBlank);
      const chosen = validSuccs.length > 0 
        ? validSuccs[Math.floor(Math.random() * validSuccs.length)]
        : succs[Math.floor(Math.random() * succs.length)];

      prevBlank = current.indexOf(0);
      current = chosen.state;
    }

    // Verify solvability
    if (!this.isSolvable(current, goal)) {
      // In unlikely event, swap two non-blank adjacent tiles
      let idx1 = current[0] !== 0 ? 0 : 1;
      let idx2 = current[idx1 + 1] !== 0 ? idx1 + 1 : idx1 + 2;
      [current[idx1], current[idx2]] = [current[idx2], current[idx1]];
    }

    return current;
  }

  /**
   * Returns a 2D matrix formatted string for logging or display.
   * @param {number[]} state 
   * @returns {string}
   */
  static formatMatrix(state) {
    return [
      state.slice(0, 3).map(x => (x === 0 ? '_' : x)).join(' '),
      state.slice(3, 6).map(x => (x === 0 ? '_' : x)).join(' '),
      state.slice(6, 9).map(x => (x === 0 ? '_' : x)).join(' ')
    ].join('\n');
  }
}

// Pre-defined academic test cases for presentation and quick testing
const PRESET_PUZZLES = {
  assignment_sample: {
    name: "Assignment Sample (Page 3)",
    initial: [2, 8, 3, 1, 6, 4, 7, 0, 5],
    goal: [1, 2, 3, 8, 0, 4, 7, 6, 5],
    description: "Classic 5-move sample from assignment sheet"
  },
  easy_3_moves: {
    name: "Easy (3 Moves)",
    initial: [1, 2, 3, 8, 4, 0, 7, 6, 5],
    goal: [1, 2, 3, 8, 0, 4, 7, 6, 5],
    description: "Quick 3-step demonstration"
  },
  medium_8_moves: {
    name: "Medium (8 Moves)",
    initial: [2, 8, 1, 0, 4, 3, 7, 6, 5],
    goal: [1, 2, 3, 8, 0, 4, 7, 6, 5],
    description: "Standard 8-step benchmark"
  },
  standard_goal_sample: {
    name: "Standard Goal (1-8 Sequence)",
    initial: [1, 2, 3, 4, 0, 5, 7, 8, 6],
    goal: [1, 2, 3, 4, 5, 6, 7, 8, 0],
    description: "Ordered 1 to 8 goal state"
  }
};
