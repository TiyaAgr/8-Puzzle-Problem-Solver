/**
 * ============================================================================
 * Interactive 8-Puzzle Problem Solver - Main Application Entrypoint
 * Author: Tiya Agrawal (Reg No: 24BDS0004)
 * Course: Artificial Intelligence
 * ============================================================================
 */

// Global Application State
window.appState = {
  initialState: [2, 8, 3, 1, 6, 4, 7, 0, 5], // Assignment Sample Initial State
  goalState: [1, 2, 3, 8, 0, 4, 7, 6, 5],    // Assignment Sample Goal State
  selectedAlgorithm: 'bfs',                  // BFS (Assigned to 24BDS0004)
  selectedHeuristic: 'manhattan',
  depthLimit: 8,
  activeTab: 'solver'
};

document.addEventListener('DOMContentLoaded', () => {
  // Instantiate controllers
  const visualizer = new VisualizerController();
  const comparison = new ComparisonEngine();

  // Expose to window for interactions
  window.visualizer = visualizer;
  window.comparison = comparison;

  // Sound toggle button
  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn && window.soundEngine) {
    soundBtn.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      soundBtn.style.opacity = isMuted ? '0.4' : '1';
      soundBtn.title = isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects';
    });
  }

  // Initialize UI components
  setupNavigationTabs();
  setupPuzzleInputs();
  setupAlgorithmSelector();
  setupPresetSelector();

  window.appState.updateSolvabilityDisplay = updateSolvabilityDisplay;

  // Initial state check and render
  updateSolvabilityDisplay();
  renderInitialAndGoalBoards();

  // Bind Solve / Run
  visualizer.startSolving = () => {
    executeCurrentSearch();
  };

  function executeCurrentSearch() {
    const { initialState, goalState, selectedAlgorithm, selectedHeuristic, depthLimit } = window.appState;

    if (!PuzzleEngine.isSolvable(initialState, goalState)) {
      alert("Error: The current Initial State cannot reach the Goal State due to odd parity discrepancy. Please generate a solvable puzzle or adjust tile positions.");
      return;
    }

    const runBtn = document.getElementById('btn-run');
    if (runBtn) {
      runBtn.textContent = 'Solving...';
      runBtn.disabled = true;
    }

    // Run search
    setTimeout(() => {
      const result = SearchAlgorithmsEngine.runAlgorithm(
        selectedAlgorithm,
        initialState,
        goalState,
        {
          heuristic: selectedHeuristic,
          depthLimit: depthLimit
        }
      );

      if (runBtn) {
        runBtn.textContent = 'Solve / Run';
        runBtn.disabled = false;
      }

      // Render solution summary card
      renderSolutionSummaryCard(result);

      // Load solution into visualizer
      visualizer.loadSolution(result, goalState);

      // Auto-play the solution movement animation
      if (result.solutionFound) {
        visualizer.play();
      }
    }, 40);
  }

  function renderInitialAndGoalBoards() {
    const initBoardEl = document.getElementById('initial-puzzle-board');
    const goalBoardEl = document.getElementById('goal-puzzle-board');
    const currentBoardEl = document.getElementById('current-puzzle-board');

    if (initBoardEl) visualizer.renderBoard(initBoardEl, window.appState.initialState);
    if (goalBoardEl) visualizer.renderBoard(goalBoardEl, window.appState.goalState);
    if (currentBoardEl) visualizer.renderBoard(currentBoardEl, window.appState.initialState, window.appState.goalState, true);

    visualizer.renderSuccessors(window.appState.initialState);
  }

  function updateSolvabilityDisplay() {
    const banner = document.getElementById('solvability-banner');
    if (!banner) return;

    const isSolv = PuzzleEngine.isSolvable(window.appState.initialState, window.appState.goalState);
    const invInit = PuzzleEngine.countInversions(window.appState.initialState);
    const invGoal = PuzzleEngine.countInversions(window.appState.goalState);

    if (isSolv) {
      banner.className = 'solvability-banner solvable';
      banner.innerHTML = `<span><strong>Solvable Configuration:</strong> Inversion parities match (Initial: ${invInit}, Goal: ${invGoal}).</span> <span style="font-size: 11px; font-weight:700;">OK</span>`;
    } else {
      banner.className = 'solvability-banner unsolvable';
      banner.innerHTML = `<span><strong>Unsolvable Configuration:</strong> Inversion parities mismatch (Initial: ${invInit}, Goal: ${invGoal}).</span> <span style="font-size: 11px; font-weight:700;">PARITY ERROR</span>`;
    }
  }

  function renderSolutionSummaryCard(result) {
    const card = document.getElementById('solution-summary-card');
    if (!card) return;

    card.style.display = 'block';
    card.className = `solution-summary-card ${result.solutionFound ? 'success' : 'failure'}`;

    const statusBadge = result.solutionFound 
      ? '<span style="color: var(--accent-green); font-weight: 700;">Solution Reached (Goal State Verified)</span>'
      : '<span style="color: var(--accent-red); font-weight: 700;">Solution Not Found (Depth Cutoff / Exhausted)</span>';

    card.innerHTML = `
      <div style="font-size: 13.5px; font-weight: 700; margin-bottom: 6px;">
        Search Outcome: ${statusBadge}
      </div>
      <table class="summary-details-table">
        <tbody>
          <tr>
            <td>Algorithm Used:</td>
            <td>${result.algorithm}</td>
          </tr>
          <tr>
            <td>Total Number of Moves:</td>
            <td>${result.solutionFound ? result.moves : '-'}</td>
          </tr>
          <tr>
            <td>Total Nodes Generated:</td>
            <td>${result.nodesGenerated.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Total Nodes Expanded:</td>
            <td>${result.nodesExpanded.toLocaleString()}</td>
          </tr>
          <tr>
            <td>Maximum Search Depth:</td>
            <td>${result.maxDepth}</td>
          </tr>
          <tr>
            <td>Execution Time:</td>
            <td>${result.executionTime} ms</td>
          </tr>
          <tr>
            <td>Path Cost g(n):</td>
            <td>${result.solutionFound ? result.moves : '-'}</td>
          </tr>
          <tr>
            <td>Memory Footprint (Approximate):</td>
            <td>${result.memory}</td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function setupNavigationTabs() {
    const navLinks = document.querySelectorAll('[data-nav]');
    const pages = document.querySelectorAll('.app-page');

    function navigateToPage(pageKey) {
      const targetPage = document.getElementById(`page-${pageKey}`);
      if (!targetPage) return;

      pages.forEach(p => p.classList.remove('active'));
      targetPage.classList.add('active');

      navLinks.forEach(link => {
        if (link.getAttribute('data-nav') === pageKey) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });

      history.replaceState(null, '', `#${pageKey}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // If switching to comparison page, auto-run benchmark if empty
      if (pageKey === 'benchmark-comparison' && comparison && (!comparison.tableBody.hasChildNodes() || comparison.tableBody.children.length === 0)) {
        comparison.runAllBenchmarks();
      }
    }

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageKey = link.getAttribute('data-nav');
        if (window.soundEngine) window.soundEngine.playClick();
        navigateToPage(pageKey);
      });
    });

    // Check initial hash on load or default to home
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash && document.getElementById(`page-${initialHash}`)) {
      navigateToPage(initialHash);
    } else {
      navigateToPage('home');
    }

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && document.getElementById(`page-${hash}`)) {
        navigateToPage(hash);
      }
    });
  }

  function setupPuzzleInputs() {
    const btnMethod1 = document.getElementById('btn-method-manual');
    const btnMethod2 = document.getElementById('btn-method-random');
    const manualContainer = document.getElementById('manual-input-fields');
    const btnGenRandom = document.getElementById('btn-generate-random');

    if (btnMethod1 && btnMethod2 && manualContainer) {
      btnMethod1.addEventListener('click', () => {
        btnMethod1.classList.add('active');
        btnMethod2.classList.remove('active');
        manualContainer.style.display = 'block';
      });

      btnMethod2.addEventListener('click', () => {
        btnMethod2.classList.add('active');
        btnMethod1.classList.remove('active');
        manualContainer.style.display = 'none';
        generateRandomSolvablePuzzle();
      });
    }

    if (btnGenRandom) {
      btnGenRandom.addEventListener('click', () => {
        generateRandomSolvablePuzzle();
      });
    }

    // Grid Cell Inputs
    const initialInputs = document.querySelectorAll('.init-cell-input');
    const goalInputs = document.querySelectorAll('.goal-cell-input');

    function syncManualInputsToState() {
      const newInit = [];
      initialInputs.forEach(input => {
        const val = input.value.trim();
        newInit.push(val === '' || val === '_' ? 0 : parseInt(val, 10));
      });

      const newGoal = [];
      goalInputs.forEach(input => {
        const val = input.value.trim();
        newGoal.push(val === '' || val === '_' ? 0 : parseInt(val, 10));
      });

      if (PuzzleEngine.isValidState(newInit) && PuzzleEngine.isValidState(newGoal)) {
        window.appState.initialState = newInit;
        window.appState.goalState = newGoal;
        updateSolvabilityDisplay();
        renderInitialAndGoalBoards();
      }
    }

    [...initialInputs, ...goalInputs].forEach(inp => {
      inp.addEventListener('input', () => {
        syncManualInputsToState();
      });
    });
  }

  function generateRandomSolvablePuzzle() {
    const randomized = PuzzleEngine.generateRandomSolvable(window.appState.goalState, 12);
    window.appState.initialState = randomized;

    // Update manual input fields to reflect random state
    const initialInputs = document.querySelectorAll('.init-cell-input');
    initialInputs.forEach((inp, idx) => {
      inp.value = randomized[idx] === 0 ? '_' : randomized[idx];
    });

    updateSolvabilityDisplay();
    renderInitialAndGoalBoards();
  }

  function setupPresetSelector() {
    const presetSelect = document.getElementById('preset-puzzles-select');
    if (!presetSelect) return;

    presetSelect.addEventListener('change', (e) => {
      const presetKey = e.target.value;
      if (PRESET_PUZZLES[presetKey]) {
        const preset = PRESET_PUZZLES[presetKey];
        window.appState.initialState = [...preset.initial];
        window.appState.goalState = [...preset.goal];

        // Sync inputs
        const initialInputs = document.querySelectorAll('.init-cell-input');
        const goalInputs = document.querySelectorAll('.goal-cell-input');
        initialInputs.forEach((inp, idx) => {
          inp.value = preset.initial[idx] === 0 ? '_' : preset.initial[idx];
        });
        goalInputs.forEach((inp, idx) => {
          inp.value = preset.goal[idx] === 0 ? '_' : preset.goal[idx];
        });

        updateSolvabilityDisplay();
        renderInitialAndGoalBoards();
      }
    });
  }

  function setupAlgorithmSelector() {
    const algoRadios = document.querySelectorAll('input[name="search-algo"]');
    const dlsConfigBox = document.getElementById('dls-config-box');
    const heuristicConfigBox = document.getElementById('heuristic-config-box');
    const dlsInput = document.getElementById('dls-depth-input');
    const heuristicSelect = document.getElementById('heuristic-select');

    algoRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const val = e.target.value;
        window.appState.selectedAlgorithm = val;

        // Toggle radio card styling
        document.querySelectorAll('.algo-radio-card').forEach(card => card.classList.remove('active'));
        e.target.closest('.algo-radio-card').classList.add('active');

        // Toggle condition boxes
        if (dlsConfigBox) {
          dlsConfigBox.style.display = (val === 'dls') ? 'block' : 'none';
        }
        if (heuristicConfigBox) {
          heuristicConfigBox.style.display = (val === 'gbfs' || val === 'astar') ? 'block' : 'none';
        }
      });
    });

    if (dlsInput) {
      dlsInput.addEventListener('input', (e) => {
        window.appState.depthLimit = parseInt(e.target.value, 10) || 8;
      });
    }

    if (heuristicSelect) {
      heuristicSelect.addEventListener('change', (e) => {
        window.appState.selectedHeuristic = e.target.value;
      });
    }
  }
});
