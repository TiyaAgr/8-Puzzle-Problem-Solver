/**
 * ============================================================================
 * Interactive 8-Puzzle Problem Solver - Comparison & Benchmark Module
 * Author: Tiya Agrawal (Reg No: 24BDS0004)
 * Course: Artificial Intelligence
 * Page 6: Comparison table showing performance of all 6 algorithms
 * ============================================================================
 */

class ComparisonEngine {
  constructor() {
    this.tableBody = document.getElementById('comparison-table-body');
    this.btnRunBenchmark = document.getElementById('btn-run-benchmark');
    this.benchmarkStatus = document.getElementById('benchmark-status-badge');
    
    if (this.btnRunBenchmark) {
      this.btnRunBenchmark.addEventListener('click', () => this.runAllBenchmarks());
    }
  }

  /**
   * Translates node count into qualitative memory rating matching assignment format
   * (Low, Medium, High).
   */
  static categorizeMemory(nodesGenerated) {
    if (nodesGenerated < 200) return { label: 'Low', approx: `${(nodesGenerated * 0.12).toFixed(1)} KB` };
    if (nodesGenerated < 2500) return { label: 'Medium', approx: `${(nodesGenerated * 0.12).toFixed(1)} KB` };
    return { label: 'High', approx: `${(nodesGenerated * 0.12 / 1024).toFixed(2)} MB` };
  }

  /**
   * Executes all 6 algorithms sequentially on the current puzzle instance.
   */
  async runAllBenchmarks() {
    const initial = window.appState.initialState;
    const goal = window.appState.goalState;

    if (!PuzzleEngine.isSolvable(initial, goal)) {
      alert("Cannot run comparison: The current initial state cannot reach the goal state (unsolvable parity).");
      return;
    }

    if (this.btnRunBenchmark) {
      this.btnRunBenchmark.disabled = true;
      this.btnRunBenchmark.textContent = 'Running Benchmark...';
    }
    if (this.benchmarkStatus) {
      this.benchmarkStatus.textContent = 'Benchmarking in progress...';
      this.benchmarkStatus.style.display = 'inline-block';
    }

    if (this.tableBody) {
      this.tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--text-muted);">Executing algorithms on current puzzle instance...</td></tr>`;
    }

    const algorithmsConfig = [
      { id: 'bfs', name: 'BFS (Breadth First Search)', isAssigned: true },
      { id: 'dfs', name: 'DFS (Depth First Search)', isAssigned: false, params: { depthLimit: 20 } },
      { id: 'dls', name: 'DLS (Depth Limited Search, L=7)', isAssigned: false, params: { depthLimit: 7 } },
      { id: 'iddls', name: 'IDDLS (Iterative Deepening)', isAssigned: false, params: { depthLimit: 16 } },
      { id: 'gbfs', name: 'GBFS (Manhattan Distance)', isAssigned: false, params: { heuristic: 'manhattan' } },
      { id: 'astar', name: 'A* Search (Manhattan Distance)', isAssigned: false, params: { heuristic: 'manhattan' } }
    ];

    const results = [];

    // Allow UI to breathe between runs
    for (const algo of algorithmsConfig) {
      await new Promise(resolve => setTimeout(resolve, 30));
      const res = SearchAlgorithmsEngine.runAlgorithm(algo.id, initial, goal, algo.params || {});
      results.push({
        name: algo.name,
        isAssigned: algo.isAssigned,
        res
      });
    }

    this.renderComparisonTable(results);

    if (this.btnRunBenchmark) {
      this.btnRunBenchmark.disabled = false;
      this.btnRunBenchmark.textContent = 'Re-Run All Algorithms';
    }
    if (this.benchmarkStatus) {
      this.benchmarkStatus.textContent = 'Benchmark Complete';
    }
  }

  renderComparisonTable(results) {
    if (!this.tableBody) return;
    this.tableBody.innerHTML = '';

    results.forEach(item => {
      const { name, isAssigned, res } = item;
      const memInfo = ComparisonEngine.categorizeMemory(res.nodesGenerated);

      const row = document.createElement('tr');
      if (isAssigned) {
        row.className = 'assigned-row';
      }

      const assignedTag = isAssigned 
        ? ` <span class="badge-assigned" title="Assigned Algorithm for 24BDS0004">★ ASSIGNED (24BDS0004)</span>` 
        : '';

      const solutionFoundCell = res.solutionFound
        ? `<span style="color: var(--accent-green); font-weight: 700;">Yes</span>`
        : `<span style="color: var(--accent-red); font-weight: 700;">No</span>`;

      const movesCell = res.solutionFound ? res.moves : '-';

      row.innerHTML = `
        <td><strong>${name}</strong>${assignedTag}</td>
        <td>${solutionFoundCell}</td>
        <td class="num-col">${res.nodesExpanded.toLocaleString()}</td>
        <td class="num-col">${movesCell}</td>
        <td class="num-col">${res.executionTime} ms</td>
        <td><strong>${memInfo.label}</strong> <span style="font-size: 11px; color: var(--text-muted);">(${memInfo.approx})</span></td>
      `;

      this.tableBody.appendChild(row);
    });
  }
}
