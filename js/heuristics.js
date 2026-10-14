/**
 * ============================================================================
 * Interactive 8-Puzzle Problem Solver - Heuristic Functions
 * Author: Tiya Agrawal (Reg No: 24BDS0004)
 * Course: Artificial Intelligence
 * Heuristics: Misplaced Tiles & Manhattan Distance (Admissible & Consistent)
 * ============================================================================
 */

class HeuristicsEngine {
  /**
   * Misplaced Tiles Heuristic (h1)
   * Counts the number of tiles that are not in their correct goal positions.
   * Blank tile (0) is explicitly excluded according to standard AI definitions.
   * Admissible: Yes (each misplaced tile must move at least once).
   * 
   * @param {number[]} state - Current state (9 elements)
   * @param {number[]} goal - Goal state (9 elements)
   * @returns {number}
   */
  static misplacedTiles(state, goal) {
    let count = 0;
    for (let i = 0; i < 9; i++) {
      const tile = state[i];
      if (tile !== 0 && tile !== goal[i]) {
        count++;
      }
    }
    return count;
  }

  /**
   * Manhattan Distance Heuristic (h2)
   * Sum of horizontal and vertical grid distances for each non-blank tile 
   * from its current position to its target position in the goal state.
   * Admissible: Yes (grid geometry without obstacles).
   * Consistent / Monotonic: Yes (|h(n) - h(n')| <= c(n, a, n') = 1).
   * 
   * @param {number[]} state - Current state (9 elements)
   * @param {number[]} goal - Goal state (9 elements)
   * @returns {number}
   */
  static manhattanDistance(state, goal) {
    // Pre-map goal tile coordinates: tile -> {row, col}
    const goalPos = {};
    for (let i = 0; i < 9; i++) {
      const tile = goal[i];
      if (tile !== 0) {
        goalPos[tile] = {
          row: Math.floor(i / 3),
          col: i % 3
        };
      }
    }

    let totalDist = 0;
    for (let i = 0; i < 9; i++) {
      const tile = state[i];
      if (tile !== 0) {
        const curRow = Math.floor(i / 3);
        const curCol = i % 3;
        const target = goalPos[tile];
        if (target) {
          totalDist += Math.abs(curRow - target.row) + Math.abs(curCol - target.col);
        }
      }
    }

    return totalDist;
  }

  /**
   * Evaluator dispatcher
   * @param {string} heuristicType - 'manhattan' | 'misplaced'
   * @param {number[]} state 
   * @param {number[]} goal 
   * @returns {number}
   */
  static evaluate(heuristicType, state, goal) {
    if (heuristicType === 'misplaced') {
      return this.misplacedTiles(state, goal);
    }
    return this.manhattanDistance(state, goal);
  }
}
