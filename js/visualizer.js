/**
 * ============================================================================
 * Interactive 8-Puzzle Problem Solver - Visualizer & Animation Controller
 * Author: Tiya Agrawal (Reg No: 24BDS0004)
 * Course: Artificial Intelligence
 * ============================================================================
 */

class VisualizerController {
  constructor() {
    this.solution = null;
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 1; // 1x
    this.baseDelay = 600; // ms per step

    // DOM Elements cache
    this.boardEl = document.getElementById('current-puzzle-board');
    this.goalBoardEl = document.getElementById('goal-puzzle-board');
    this.initialBoardEl = document.getElementById('initial-puzzle-board');
    this.successorsContainer = document.getElementById('successors-container');
    
    // Status and Step Banners
    this.stepBanner = document.getElementById('step-counter-banner');
    this.actionBanner = document.getElementById('step-action-badge');

    // Controls
    this.btnRun = document.getElementById('btn-run');
    this.btnPause = document.getElementById('btn-pause');
    this.btnResume = document.getElementById('btn-resume');
    this.btnNext = document.getElementById('btn-next');
    this.btnPrev = document.getElementById('btn-prev');
    this.btnReset = document.getElementById('btn-reset');
    this.speedSlider = document.getElementById('speed-slider');
    this.speedLabel = document.getElementById('speed-label');

    this.initControls();
  }

  initControls() {
    if (this.btnRun) this.btnRun.addEventListener('click', () => this.startSolving());
    if (this.btnPause) this.btnPause.addEventListener('click', () => this.pause());
    if (this.btnResume) this.btnResume.addEventListener('click', () => this.resume());
    if (this.btnNext) this.btnNext.addEventListener('click', () => this.stepForward());
    if (this.btnPrev) this.btnPrev.addEventListener('click', () => this.stepBackward());
    if (this.btnReset) this.btnReset.addEventListener('click', () => this.reset());

    if (this.speedSlider) {
      this.speedSlider.addEventListener('input', (e) => {
        this.speed = parseFloat(e.target.value);
        if (this.speedLabel) {
          this.speedLabel.textContent = `${this.speed.toFixed(1)}x`;
        }
        if (this.isPlaying) {
          this.pause();
          this.resume();
        }
      });
    }
  }

  /**
   * Renders a 3x3 board onto a target DOM container.
   * Highlights tiles that match their goal positions.
   */
  renderBoard(container, state, goal = null) {
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const tileVal = state[i];
      const tileDiv = document.createElement('div');
      tileDiv.className = 'tile-element';
      tileDiv.setAttribute('data-index', i);

      if (tileVal === 0) {
        tileDiv.classList.add('blank-tile');
        tileDiv.textContent = '';
      } else {
        tileDiv.textContent = tileVal;
        if (goal && tileVal === goal[i]) {
          tileDiv.classList.add('correct-position');
        }
      }

      container.appendChild(tileDiv);
    }
  }

  /**
   * Displays immediate successor states generated from current state.
   */
  renderSuccessors(state) {
    if (!this.successorsContainer) return;
    this.successorsContainer.innerHTML = '';

    const successors = PuzzleEngine.getSuccessors(state);
    for (const succ of successors) {
      const card = document.createElement('div');
      card.className = 'successor-mini-card';

      const label = document.createElement('div');
      label.className = 'successor-action-label';
      label.textContent = `Action: ${succ.action}`;
      card.appendChild(label);

      const grid = document.createElement('div');
      grid.className = 'mini-preview-grid';

      for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'mini-cell';
        if (succ.state[i] === 0) {
          cell.classList.add('blank');
        } else {
          cell.textContent = succ.state[i];
        }
        grid.appendChild(cell);
      }

      card.appendChild(grid);
      this.successorsContainer.appendChild(card);
    }
  }

  /**
   * Updates real-time search metrics and frontier/explored previews.
   */
  updateMetricsDisplay(stepData, solutionMeta) {
    // Basic stats
    const elNodesGen = document.getElementById('metric-nodes-gen');
    const elNodesExp = document.getElementById('metric-nodes-exp');
    const elDepth = document.getElementById('metric-depth');
    const elTime = document.getElementById('metric-time');
    const elCost = document.getElementById('metric-cost');
    const elH = document.getElementById('metric-h');
    const elF = document.getElementById('metric-f');

    if (elNodesGen) elNodesGen.textContent = solutionMeta.nodesGenerated.toLocaleString();
    if (elNodesExp) elNodesExp.textContent = solutionMeta.nodesExpanded.toLocaleString();
    if (elDepth) elDepth.textContent = stepData ? stepData.depth : 0;
    if (elTime) elTime.textContent = `${solutionMeta.executionTime} ms`;
    if (elCost) elCost.textContent = stepData ? stepData.cost : 0;
    if (elH) elH.textContent = stepData && stepData.h !== undefined ? stepData.h : '-';
    if (elF) elF.textContent = stepData && stepData.f !== undefined ? stepData.f : '-';

    // Current node expanded & parent state
    const curExpMatrix = document.getElementById('current-expanded-matrix');
    if (curExpMatrix && stepData) {
      curExpMatrix.textContent = PuzzleEngine.formatMatrix(stepData.state);
    }

    const parentMatrix = document.getElementById('parent-node-matrix');
    if (parentMatrix && stepData) {
      parentMatrix.textContent = stepData.parentState 
        ? PuzzleEngine.formatMatrix(stepData.parentState)
        : '(None - Root Node)';
    }

    // Step counter and action
    if (this.stepBanner) {
      const totalSteps = this.solution ? this.solution.path.length - 1 : 0;
      this.stepBanner.textContent = `Step ${this.currentStepIndex} of ${totalSteps}`;
    }

    if (this.actionBanner) {
      if (stepData && stepData.action) {
        this.actionBanner.textContent = `Move: ${stepData.action}`;
        this.actionBanner.style.display = 'inline-block';
      } else {
        this.actionBanner.textContent = 'Initial State';
        this.actionBanner.style.display = 'inline-block';
      }
    }
  }

  /**
   * Populate frontier & explored lists preview
   */
  updateInspectionLists(solutionMeta) {
    const frontierListEl = document.getElementById('frontier-list-body');
    const exploredListEl = document.getElementById('explored-list-body');
    const frontierCountEl = document.getElementById('frontier-count-badge');
    const exploredCountEl = document.getElementById('explored-count-badge');

    if (frontierListEl && solutionMeta.trace && solutionMeta.trace.length > 0) {
      const lastTrace = solutionMeta.trace[solutionMeta.trace.length - 1];
      if (frontierCountEl) frontierCountEl.textContent = `${lastTrace.frontierSize} nodes`;
      if (exploredCountEl) exploredCountEl.textContent = `${lastTrace.exploredSize} nodes`;

      frontierListEl.innerHTML = '';
      lastTrace.frontierPreview.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'inspection-item';
        row.innerHTML = `<span>#${idx + 1} [${item.state.slice(0, 3).join('')}...]</span> <span>d=${item.depth}</span>`;
        frontierListEl.appendChild(row);
      });

      exploredListEl.innerHTML = '';
      // Show sample of explored states
      solutionMeta.trace.slice(-5).forEach((t) => {
        const row = document.createElement('div');
        row.className = 'inspection-item';
        row.innerHTML = `<span>Node ${t.step} [d=${t.depth}]</span> <span>Cost: ${t.currentNode.g}</span>`;
        exploredListEl.appendChild(row);
      });
    }
  }

  loadSolution(solutionResult, goalState) {
    this.pause();
    this.solution = solutionResult;
    this.goalState = goalState;
    this.currentStepIndex = 0;

    if (!solutionResult.solutionFound || solutionResult.path.length === 0) {
      this.updateControlsState('empty');
      return;
    }

    this.showStep(0);
    this.updateInspectionLists(solutionResult);
    this.updateControlsState('ready');
  }

  showStep(index) {
    if (!this.solution || !this.solution.path || index < 0 || index >= this.solution.path.length) {
      return;
    }

    this.currentStepIndex = index;
    const stepData = this.solution.path[index];

    // Render board with tile positioning
    this.renderBoard(this.boardEl, stepData.state, this.goalState);
    this.renderSuccessors(stepData.state);
    this.updateMetricsDisplay(stepData, this.solution);

    // Disable prev/next if at bounds
    if (this.btnPrev) this.btnPrev.disabled = (index === 0);
    if (this.btnNext) this.btnNext.disabled = (index === this.solution.path.length - 1);
  }

  stepForward() {
    if (this.solution && this.currentStepIndex < this.solution.path.length - 1) {
      this.showStep(this.currentStepIndex + 1);
    }
  }

  stepBackward() {
    if (this.solution && this.currentStepIndex > 0) {
      this.showStep(this.currentStepIndex - 1);
    }
  }

  play() {
    if (!this.solution || !this.solution.solutionFound) return;
    if (this.currentStepIndex >= this.solution.path.length - 1) {
      this.currentStepIndex = 0;
    }

    this.isPlaying = true;
    this.updateControlsState('playing');

    const tick = () => {
      if (!this.isPlaying) return;
      if (this.currentStepIndex < this.solution.path.length - 1) {
        this.stepForward();
        const stepDelay = Math.max(80, this.baseDelay / this.speed);
        this.timer = setTimeout(tick, stepDelay);
      } else {
        this.pause();
      }
    };

    const initialDelay = Math.max(80, this.baseDelay / this.speed);
    this.timer = setTimeout(tick, initialDelay);
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.updateControlsState('paused');
  }

  resume() {
    if (!this.isPlaying && this.solution) {
      this.play();
    }
  }

  reset() {
    this.pause();
    if (this.solution && this.solution.path.length > 0) {
      this.showStep(0);
    }
  }

  updateControlsState(state) {
    if (state === 'empty') {
      if (this.btnRun) this.btnRun.disabled = false;
      if (this.btnPause) this.btnPause.disabled = true;
      if (this.btnResume) this.btnResume.disabled = true;
      if (this.btnNext) this.btnNext.disabled = true;
      if (this.btnPrev) this.btnPrev.disabled = true;
      if (this.btnReset) this.btnReset.disabled = true;
    } else if (state === 'ready' || state === 'paused') {
      if (this.btnRun) this.btnRun.disabled = false;
      if (this.btnPause) this.btnPause.disabled = true;
      if (this.btnResume) this.btnResume.disabled = false;
      if (this.btnNext) this.btnNext.disabled = (this.currentStepIndex >= (this.solution?.path.length - 1));
      if (this.btnPrev) this.btnPrev.disabled = (this.currentStepIndex === 0);
      if (this.btnReset) this.btnReset.disabled = false;
    } else if (state === 'playing') {
      if (this.btnRun) this.btnRun.disabled = true;
      if (this.btnPause) this.btnPause.disabled = false;
      if (this.btnResume) this.btnResume.disabled = true;
      if (this.btnNext) this.btnNext.disabled = true;
      if (this.btnPrev) this.btnPrev.disabled = true;
      if (this.btnReset) this.btnReset.disabled = false;
    }
  }
}
