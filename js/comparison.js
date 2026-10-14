/**
 * ============================================================================
 * Interactive 8-Puzzle Problem Solver - Comparison & Benchmark Module
 * Author: Tiya Agrawal (Reg No: 24BDS0004)
 * Course: Artificial Intelligence
 * Page 6: Comparison table showing performance of all 6 algorithms
 * Includes: Comparative Table + Visual Performance Bar Meters
 * ============================================================================
 */

class ComparisonEngine {
  constructor() {
    this.tableBody = document.getElementById('comparison-table-body');
    this.btnRunBenchmark = document.getElementById('btn-run-benchmark');
    this.benchmarkStatus = document.getElementById('benchmark-status-badge');
    this.chartsContainer = document.getElementById('benchmark-charts-container');
    
    if (this.btnRunBenchmark) {
      this.btnRunBenchmark.addEventListener('click', () => this.runAllBenchmarks());
    }
  }

  static categorizeMemory(nodesGenerated) {
    if (nodesGenerated < 200) return { label: 'Low', approx: `${(nodesGenerated * 0.12).toFixed(1)} KB` };
    if (nodesGenerated < 2500) return { label: 'Medium', approx: `${(nodesGenerated * 0.12).toFixed(1)} KB` };
    return { label: 'High', approx: `${(nodesGenerated * 0.12 / 1024).toFixed(2)} MB` };
  }

  async runAllBenchmarks() {
    const initial = window.appState.initialState;
    const goal = window.appState.goalState;

    if (!PuzzleEngine.isSolvable(initial, goal)) {
      alert("Cannot run comparison: The current initial state cannot reach the goal state (unsolvable parity).");
      return;
    }

    if (this.btnRunBenchmark) {
      this.btnRunBenchmark.disabled = true;
      this.btnRunBenchmark.innerHTML = `
        <svg class="spin-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10"></path>
        </svg>
        Benchmarking Algorithms...
      `;
    }
    if (this.benchmarkStatus) {
      this.benchmarkStatus.textContent = 'Benchmarking in progress...';
      this.benchmarkStatus.style.display = 'inline-flex';
    }

    if (this.tableBody) {
      this.tableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 28px; color: var(--text-muted);">
            <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
              <span class="pulse-dot"></span>
              <span>Executing search algorithms on active state space...</span>
            </div>
          </td>
        </tr>`;
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

    for (const algo of algorithmsConfig) {
      await new Promise(resolve => setTimeout(resolve, 35));
      const res = SearchAlgorithmsEngine.runAlgorithm(algo.id, initial, goal, algo.params || {});
      results.push({
        name: algo.name,
        isAssigned: algo.isAssigned,
        res
      });
    }

    this.renderComparisonTable(results);
    this.renderComparativeCharts(results);

    if (this.btnRunBenchmark) {
      this.btnRunBenchmark.disabled = false;
      this.btnRunBenchmark.innerHTML = `&circlearrowright; Re-Run Benchmark Suite`;
    }
    if (this.benchmarkStatus) {
      this.benchmarkStatus.textContent = 'Benchmark Finished';
    }
    if (window.soundEngine) window.soundEngine.playSuccess();
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
        ? ` <span class="badge-assigned" title="Assigned Algorithm for 24BDS0004">&starf; ASSIGNED (24BDS0004)</span>` 
        : '';

      const solutionFoundCell = res.solutionFound
        ? `<span class="status-chip success">&check; Yes</span>`
        : `<span class="status-chip error">&cross; No</span>`;

      const movesCell = res.solutionFound ? `<span class="num-bold">${res.moves}</span>` : '<span style="color:var(--text-muted);">-</span>';

      const memClass = memInfo.label.toLowerCase();

      row.innerHTML = `
        <td><strong>${name}</strong>${assignedTag}</td>
        <td>${solutionFoundCell}</td>
        <td class="num-col">${res.nodesExpanded.toLocaleString()}</td>
        <td class="num-col">${movesCell}</td>
        <td class="num-col"><span class="time-tag">${res.executionTime} ms</span></td>
        <td>
          <span class="memory-pill ${memClass}">
            ${memInfo.label}
          </span>
          <span class="memory-size">${memInfo.approx}</span>
        </td>
      `;

      this.tableBody.appendChild(row);
    });
  }

  renderComparativeCharts(results) {
    if (!this.chartsContainer) return;
    this.chartsContainer.style.display = 'grid';
    this.chartsContainer.innerHTML = '';

    const maxExpanded = Math.max(...results.map(r => r.res.nodesExpanded), 1);
    const maxTime = Math.max(...results.map(r => r.res.executionTime), 0.1);

    // Chart 1: Nodes Expanded
    const chartNodes = document.createElement('div');
    chartNodes.className = 'benchmark-chart-card';
    chartNodes.innerHTML = `
      <div class="chart-header">
        <h4>Search Space Efficiency (Nodes Expanded - Lower is Better)</h4>
      </div>
      <div class="chart-bars-list">
        ${results.map(r => {
          const pct = Math.max(4, (r.res.nodesExpanded / maxExpanded) * 100);
          const colorClass = r.isAssigned ? 'assigned' : (r.name.includes('A*') ? 'best' : 'standard');
          return `
            <div class="chart-bar-row">
              <span class="chart-bar-label">${r.name.split(' ')[0]}</span>
              <div class="chart-bar-track">
                <div class="chart-bar-fill ${colorClass}" style="width: ${pct}%"></div>
              </div>
              <span class="chart-bar-val">${r.res.nodesExpanded}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    // Chart 2: Execution Time
    const chartTime = document.createElement('div');
    chartTime.className = 'benchmark-chart-card';
    chartTime.innerHTML = `
      <div class="chart-header">
        <h4>Computational Speed (Execution Time ms - Lower is Better)</h4>
      </div>
      <div class="chart-bars-list">
        ${results.map(r => {
          const pct = Math.max(4, (r.res.executionTime / maxTime) * 100);
          const colorClass = r.isAssigned ? 'assigned' : (r.name.includes('A*') ? 'best' : 'standard');
          return `
            <div class="chart-bar-row">
              <span class="chart-bar-label">${r.name.split(' ')[0]}</span>
              <div class="chart-bar-track">
                <div class="chart-bar-fill ${colorClass}" style="width: ${pct}%"></div>
              </div>
              <span class="chart-bar-val">${r.res.executionTime} ms</span>
            </div>
          `;
        }).join('')}
      </div>
    `;

    this.chartsContainer.appendChild(chartNodes);
    this.chartsContainer.appendChild(chartTime);
  }
}
