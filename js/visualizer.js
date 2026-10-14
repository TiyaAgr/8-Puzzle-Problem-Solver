/**
 * ============================================================================
 * Interactive 8-Puzzle Problem Solver - Visualizer & Animation Controller
 * Author: Tiya Agrawal (Reg No: 24BDS0004)
 * Course: Artificial Intelligence
 * Includes: Playback Stepper, Sound Effects, Confetti Trigger, Interactive Tile Clicking
 * ============================================================================
 */

class VisualizerController {
  constructor() {
    this.solution = null;
    this.currentStepIndex = 0;
    this.isPlaying = false;
    this.timer = null;
    this.speed = 1.0;
    this.baseDelay = 550; // ms

    // DOM Elements
    this.boardEl = document.getElementById('current-puzzle-board');
    this.goalBoardEl = document.getElementById('goal-puzzle-board');
    this.initialBoardEl = document.getElementById('initial-puzzle-board');
    this.successorsContainer = document.getElementById('successors-container');
    
    this.stepBanner = document.getElementById('step-counter-banner');
    this.actionBanner = document.getElementById('step-action-badge');
    this.stepProgressBar = document.getElementById('step-progress-fill');

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
    if (this.btnRun) this.btnRun.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      if (this.startSolving) this.startSolving();
    });
    if (this.btnPause) this.btnPause.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      this.pause();
    });
    if (this.btnResume) this.btnResume.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      this.resume();
    });
    if (this.btnNext) this.btnNext.addEventListener('click', () => {
      this.stepForward();
    });
    if (this.btnPrev) this.btnPrev.addEventListener('click', () => {
      this.stepBackward();
    });
    if (this.btnReset) this.btnReset.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      this.reset();
    });

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
   * If isInteractive is true, allows the user to click adjacent tiles to manually slide them!
   */
  renderBoard(container, state, goal = null, isInteractive = false) {
    if (!container) return;
    container.innerHTML = '';

    const blankIdx = state.indexOf(0);
    const blankRow = Math.floor(blankIdx / 3);
    const blankCol = blankIdx % 3;

    for (let i = 0; i < 9; i++) {
      const tileVal = state[i];
      const tileDiv = document.createElement('div');
      tileDiv.className = 'tile-element';
      tileDiv.setAttribute('data-index', i);
      tileDiv.setAttribute('data-val', tileVal);

      if (tileVal === 0) {
        tileDiv.classList.add('blank-tile');
        tileDiv.textContent = '';
      } else {
        tileDiv.textContent = tileVal;
        if (goal && tileVal === goal[i]) {
          tileDiv.classList.add('correct-position');
        }

        // Check if tile is movable by user
        if (isInteractive && !this.isPlaying) {
          const tileRow = Math.floor(i / 3);
          const tileCol = i % 3;
          const isAdjacent = (Math.abs(tileRow - blankRow) + Math.abs(tileCol - blankCol)) === 1;

          if (isAdjacent) {
            tileDiv.classList.add('interactive-movable');
            tileDiv.setAttribute('title', `Click to slide tile ${tileVal}`);
            tileDiv.addEventListener('click', () => {
              this.handleManualTileClick(i, blankIdx);
            });
          }
        }
      }

      container.appendChild(tileDiv);
    }
  }

  handleManualTileClick(tileIdx, blankIdx) {
    if (this.isPlaying) return;
    const currentState = [...window.appState.initialState];
    const tileVal = currentState[tileIdx];

    // Swap
    currentState[blankIdx] = tileVal;
    currentState[tileIdx] = 0;
    window.appState.initialState = currentState;

    if (window.soundEngine) window.soundEngine.playSlide();

    // Re-render
    this.renderBoard(this.boardEl, currentState, window.appState.goalState, true);
    this.renderSuccessors(currentState);
    if (window.appState.updateSolvabilityDisplay) {
      window.appState.updateSolvabilityDisplay();
    }

    // Check if goal reached manually
    if (PuzzleEngine.stateToKey(currentState) === PuzzleEngine.stateToKey(window.appState.goalState)) {
      if (window.confettiEngine) window.confettiEngine.fire();
      if (window.soundEngine) window.soundEngine.playSuccess();
    }
  }

  renderSuccessors(state) {
    if (!this.successorsContainer) return;
    this.successorsContainer.innerHTML = '';

    const successors = PuzzleEngine.getSuccessors(state);
    for (const succ of successors) {
      const card = document.createElement('div');
      card.className = 'successor-mini-card';

      const label = document.createElement('div');
      label.className = 'successor-action-label';
      label.textContent = succ.action;
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

  updateMetricsDisplay(stepData, solutionMeta) {
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

    const curExpMatrix = document.getElementById('current-expanded-matrix');
    if (curExpMatrix && stepData) {
      curExpMatrix.textContent = PuzzleEngine.formatMatrix(stepData.state);
    }

    const parentMatrix = document.getElementById('parent-node-matrix');
    if (parentMatrix && stepData) {
      parentMatrix.textContent = stepData.parentState 
        ? PuzzleEngine.formatMatrix(stepData.parentState)
        : '(Root Node - No Parent)';
    }

    if (this.stepBanner) {
      const totalSteps = this.solution ? this.solution.path.length - 1 : 0;
      this.stepBanner.textContent = `Step ${this.currentStepIndex} of ${totalSteps}`;
    }

    if (this.stepProgressBar && this.solution) {
      const totalSteps = Math.max(1, this.solution.path.length - 1);
      const pct = (this.currentStepIndex / totalSteps) * 100;
      this.stepProgressBar.style.width = `${pct}%`;
    }

    if (this.actionBanner) {
      if (stepData && stepData.action) {
        this.actionBanner.textContent = `Move: ${stepData.action}`;
        this.actionBanner.style.display = 'inline-flex';
      } else {
        this.actionBanner.textContent = 'Initial State';
        this.actionBanner.style.display = 'inline-flex';
      }
    }
  }

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

    if (index > 0 && window.soundEngine) {
      window.soundEngine.playSlide();
    }

    this.renderBoard(this.boardEl, stepData.state, this.goalState, false);
    this.renderSuccessors(stepData.state);
    this.updateMetricsDisplay(stepData, this.solution);

    if (this.btnPrev) this.btnPrev.disabled = (index === 0);
    if (this.btnNext) this.btnNext.disabled = (index === this.solution.path.length - 1);

    // Goal reached celebration
    if (index === this.solution.path.length - 1 && this.solution.solutionFound) {
      if (window.confettiEngine) window.confettiEngine.fire();
      if (window.soundEngine) window.soundEngine.playSuccess();
    }
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
        const stepDelay = Math.max(60, this.baseDelay / this.speed);
        this.timer = setTimeout(tick, stepDelay);
      } else {
        this.pause();
      }
    };

    const initialDelay = Math.max(60, this.baseDelay / this.speed);
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
    } else {
      this.renderBoard(this.boardEl, window.appState.initialState, window.appState.goalState, true);
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
