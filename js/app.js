/**
 * Main Application Orchestrator for 8-Puzzle Visualizer
 * Academic Implementation for Registration Number: 24BDS0004 (BFS Assigned)
 */

import { Puzzle, DEFAULT_GOAL, ASSIGNMENT_GOAL } from './puzzle.js';
import { BFS } from './algorithms/bfs.js';
import { Visualizer } from './visualizer.js';
import { ComparisonEngine } from './comparison.js';

// Default initial and standard row-major goal state (1 2 3 4 5 6 7 8 _)
const DEFAULT_INITIAL = [1, 2, 3, 5, 0, 6, 4, 7, 8];

class App {
    constructor() {
        // App State: Standard Goal (1 2 3 4 5 6 7 8 _)
        this.initialState = [...DEFAULT_INITIAL];
        this.goalState = [...DEFAULT_GOAL];
        this.currentAlgorithm = 'BFS'; // Assigned to 24BDS0004

        this.lastSearchResult = null;
        this.viewMode = 'SOLUTION'; // 'SOLUTION' or 'SEARCH_TRACE'

        // Visualizer instance
        this.visualizer = new Visualizer({
            onStepChange: (info) => this.handleVisualizerStep(info),
            onStateChange: (state) => this.handleVisualizerState(state)
        });

        this.initDOM();
        this.initEvents();
        this.initScrollSpy();
        this.initTheoryAccordion();
        this.renderInitialBoard();
        this.renderGoalBoard();
        this.updateSolvabilityBadge();
        // Auto-solve initial state so Search Tree is immediately populated on load
        this.solveActivePuzzle({ autoRun: false });
    }

    initDOM() {
        this.dom = {
            // Boards & Visualizer Containers
            currentBoard: document.getElementById('current-board'),
            initialBoard: document.getElementById('initial-board'),
            goalBoard: document.getElementById('goal-board'),
            viewBoardContainer: document.getElementById('view-board-container'),
            viewTreeContainer: document.getElementById('view-tree-container'),
            searchTreeCanvas: document.getElementById('search-tree-canvas'),

            // Successors & Frontier Queue
            successorsContainer: document.getElementById('successors-container'),
            frontierPreview: document.getElementById('frontier-preview'),
            statFrontierBadge: document.getElementById('stat-frontier-badge'),

            // Badges & Labels
            solvabilityBadge: document.getElementById('solvability-badge'),
            playbackStatus: document.getElementById('playback-status'),
            stepCounter: document.getElementById('step-counter'),

            // Telemetry values
            summaryStatus: document.getElementById('summary-status'),
            summaryMoves: document.getElementById('summary-moves'),
            summaryGenerated: document.getElementById('summary-generated'),
            summaryExpanded: document.getElementById('summary-expanded'),
            summaryDepth: document.getElementById('summary-depth'),
            summaryTime: document.getElementById('summary-time'),
            summaryMemory: document.getElementById('summary-memory'),

            // Primary Command Buttons
            btnSolve: document.getElementById('btn-solve'),
            btnRandomPuzzle: document.getElementById('btn-random-puzzle'),
            btnPresetAssignment: document.getElementById('btn-preset-assignment'),
            btnCustomModalOpen: document.getElementById('btn-custom-modal-open'),

            // Modal elements
            customModal: document.getElementById('custom-input-modal'),
            customModalClose: document.getElementById('custom-modal-close'),
            customInitialInput: document.getElementById('custom-initial-input'),
            customGoalInput: document.getElementById('custom-goal-input'),
            btnApplyCustom: document.getElementById('btn-apply-custom'),

            // View Mode Switches
            btnModeSolution: document.getElementById('btn-mode-solution'),
            btnModeTrace: document.getElementById('btn-mode-trace'),

            // Playback controls (Board view)
            btnRun: document.getElementById('btn-run'),
            btnPause: document.getElementById('btn-pause'),
            btnResume: document.getElementById('btn-resume'),
            btnNext: document.getElementById('btn-next'),
            btnPrev: document.getElementById('btn-prev'),
            btnReset: document.getElementById('btn-reset'),
            speedSlider: document.getElementById('speed-slider'),
            speedValue: document.getElementById('speed-value'),

            // Playback controls (Tree view)
            btnTreeRun: document.getElementById('btn-tree-run'),
            btnTreePause: document.getElementById('btn-tree-pause'),
            btnTreeResume: document.getElementById('btn-tree-resume'),
            btnTreeNext: document.getElementById('btn-tree-next'),
            btnTreePrev: document.getElementById('btn-tree-prev'),

            // Comparison
            btnRunComparison: document.getElementById('btn-run-comparison'),
            comparisonTableBody: document.getElementById('comparison-table-body'),
            comparisonProgress: document.getElementById('comparison-progress'),

            // Navigation links
            navLinks: document.querySelectorAll('.nav-link')
        };
    }

    initEvents() {
        // Equal-importance action: Generate Random Solvable Puzzle
        this.dom.btnRandomPuzzle.addEventListener('click', () => this.generateRandomPuzzle());

        // Standard Solvable Configuration / Preset
        this.dom.btnPresetAssignment.addEventListener('click', () => {
            this.initialState = [...DEFAULT_INITIAL];
            this.goalState = [...DEFAULT_GOAL];
            this.renderInitialBoard();
            this.renderGoalBoard();
            this.renderCurrentBoard(this.initialState);
            this.updateSolvabilityBadge();
            this.solveActivePuzzle({ autoRun: false });
        });

        // Method 1: Custom State Modal
        this.dom.btnCustomModalOpen.addEventListener('click', () => {
            this.dom.customInitialInput.value = this.initialState.join(' ');
            this.dom.customGoalInput.value = this.goalState.join(' ');
            this.dom.customModal.classList.add('open');
        });
        this.dom.customModalClose.addEventListener('click', () => {
            this.dom.customModal.classList.remove('open');
        });
        this.dom.btnApplyCustom.addEventListener('click', () => this.applyCustomState());

        this.dom.customModal.addEventListener('click', (e) => {
            if (e.target === this.dom.customModal) {
                this.dom.customModal.classList.remove('open');
            }
        });

        // Primary action: Solve with BFS
        this.dom.btnSolve.addEventListener('click', () => this.solveActivePuzzle());

        // View Mode Toggles
        this.dom.btnModeSolution.addEventListener('click', () => this.switchViewMode('SOLUTION'));
        this.dom.btnModeTrace.addEventListener('click', () => this.switchViewMode('SEARCH_TRACE'));

        // Playback controls for Board view
        this.dom.btnRun.addEventListener('click', () => this.visualizer.run());
        this.dom.btnPause.addEventListener('click', () => this.visualizer.pause());
        this.dom.btnResume.addEventListener('click', () => this.visualizer.resume());
        this.dom.btnNext.addEventListener('click', () => this.visualizer.nextStep());
        this.dom.btnPrev.addEventListener('click', () => this.visualizer.previousStep());
        this.dom.btnReset.addEventListener('click', () => {
            this.visualizer.reset();
            this.renderCurrentBoard(this.initialState);
        });

        // Playback controls for Tree view
        if (this.dom.btnTreeRun) {
            this.dom.btnTreeRun.addEventListener('click', () => this.visualizer.run());
            this.dom.btnTreePause.addEventListener('click', () => this.visualizer.pause());
            this.dom.btnTreeResume.addEventListener('click', () => this.visualizer.resume());
            this.dom.btnTreeNext.addEventListener('click', () => this.visualizer.nextStep());
            this.dom.btnTreePrev.addEventListener('click', () => this.visualizer.previousStep());
        }

        // Speed Slider
        this.dom.speedSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            this.dom.speedValue.textContent = `${val.toFixed(1)}x`;
            this.visualizer.setSpeed(val);
        });

        // Comparison runner
        this.dom.btnRunComparison.addEventListener('click', () => this.runFullComparison());

        // Interactive tile clicking to slide blank
        this.dom.currentBoard.addEventListener('click', (e) => {
            const tile = e.target.closest('.puzzle-tile');
            if (!tile || this.visualizer.state === 'RUNNING') return;
            const clickedIdx = parseInt(tile.dataset.index, 10);
            this.handleTileClick(clickedIdx);
        });
    }

    initScrollSpy() {
        const sections = document.querySelectorAll('section.page-section');
        const navLinks = this.dom.navLinks;

        window.addEventListener('scroll', () => {
            let currentSectionId = '';
            const scrollPos = window.scrollY + 120;

            sections.forEach(sec => {
                const top = sec.offsetTop;
                const height = sec.offsetHeight;
                if (scrollPos >= top && scrollPos < top + height) {
                    currentSectionId = sec.getAttribute('id');
                }
            });

            if (currentSectionId) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    initTheoryAccordion() {
        const cards = document.querySelectorAll('.theory-algorithm-card');
        const toggleAllBtn = document.getElementById('btn-toggle-all-theory');
        const toggleAllText = document.getElementById('toggle-all-theory-text');
        const filterBtns = document.querySelectorAll('.theory-filter-btn');

        const updateToggleAllLabel = () => {
            if (!toggleAllText) return;
            const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none');
            const openCount = visibleCards.filter(c => c.classList.contains('is-open')).length;
            if (openCount === visibleCards.length && visibleCards.length > 0) {
                toggleAllText.textContent = 'Collapse All';
            } else {
                toggleAllText.textContent = 'Expand All';
            }
        };

        // Header click to toggle individual card
        cards.forEach(card => {
            const header = card.querySelector('.algo-card-header');
            if (!header) return;

            header.addEventListener('click', (e) => {
                if (e.target.closest('a') || e.target.closest('input')) return;
                const isOpen = card.classList.contains('is-open');
                if (isOpen) {
                    card.classList.remove('is-open');
                    header.setAttribute('aria-expanded', 'false');
                } else {
                    card.classList.add('is-open');
                    header.setAttribute('aria-expanded', 'true');
                }
                updateToggleAllLabel();
            });

            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    header.click();
                }
            });
        });

        // Expand / Collapse All
        if (toggleAllBtn) {
            toggleAllBtn.addEventListener('click', () => {
                const visibleCards = Array.from(cards).filter(c => c.style.display !== 'none');
                const anyClosed = visibleCards.some(c => !c.classList.contains('is-open'));
                visibleCards.forEach(card => {
                    const header = card.querySelector('.algo-card-header');
                    if (anyClosed) {
                        card.classList.add('is-open');
                        if (header) header.setAttribute('aria-expanded', 'true');
                    } else {
                        card.classList.remove('is-open');
                        if (header) header.setAttribute('aria-expanded', 'false');
                    }
                });
                updateToggleAllLabel();
            });
        }

        // Category Filter Pills
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const category = btn.dataset.filter;

                cards.forEach(card => {
                    const cardCat = card.dataset.category || '';
                    if (category === 'all' || cardCat.includes(category)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
                updateToggleAllLabel();
            });
        });

        updateToggleAllLabel();
    }

    renderInitialBoard() {
        Visualizer.renderBoardToElement(this.dom.initialBoard, this.initialState, { sizeClass: 'mini-board' });
    }

    renderGoalBoard() {
        Visualizer.renderBoardToElement(this.dom.goalBoard, this.goalState, { sizeClass: 'mini-board' });
    }

    renderCurrentBoard(state, highlightTile = null) {
        Visualizer.renderBoardToElement(this.dom.currentBoard, state, {
            sizeClass: 'hero-board',
            interactive: true,
            highlightTile: highlightTile
        });
    }

    handleTileClick(clickedIdx) {
        const blankIdx = Puzzle.getBlankIndex(this.initialState);
        const p1 = Puzzle.indexToPos(clickedIdx);
        const p2 = Puzzle.indexToPos(blankIdx);
        const dist = Math.abs(p1.row - p2.row) + Math.abs(p1.col - p2.col);

        if (dist === 1) {
            const newState = [...this.initialState];
            newState[blankIdx] = newState[clickedIdx];
            newState[clickedIdx] = 0;
            this.initialState = newState;
            this.renderInitialBoard();
            this.renderCurrentBoard(this.initialState);
            this.updateSolvabilityBadge();
            this.resetSearchTelemetry();
        }
    }

    generateRandomPuzzle(steps = null) {
        // Randomly choose 5, 6, or 7 shuffle steps for fast, responsive BFS solving and clear visualization
        const shuffleSteps = steps || (Math.floor(Math.random() * 3) + 5);
        this.initialState = Puzzle.generateSolvableState(this.goalState, shuffleSteps);
        this.renderInitialBoard();
        this.renderCurrentBoard(this.initialState);
        this.updateSolvabilityBadge();
        // Automatically solve and build Search Tree for the new random puzzle
        this.solveActivePuzzle({ autoRun: false });
    }

    applyCustomState() {
        const parseArr = (str) => str.trim().split(/[\s,]+/).map(x => (x === '_' ? 0 : parseInt(x, 10)));
        try {
            const initial = parseArr(this.dom.customInitialInput.value);
            const goal = parseArr(this.dom.customGoalInput.value);

            if (!Puzzle.isValidState(initial)) {
                alert('Invalid Initial State: Please provide unique digits from 0 to 8.');
                return;
            }
            if (!Puzzle.isValidState(goal)) {
                alert('Invalid Goal State: Please provide unique digits from 0 to 8.');
                return;
            }

            this.initialState = initial;
            this.goalState = goal;
            this.renderInitialBoard();
            this.renderGoalBoard();
            this.renderCurrentBoard(this.initialState);
            this.updateSolvabilityBadge();
            if (Puzzle.isSolvable(this.initialState, this.goalState)) {
                this.solveActivePuzzle({ autoRun: false });
            } else {
                this.resetSearchTelemetry();
            }
            this.dom.customModal.classList.remove('open');
        } catch (err) {
            alert('Error parsing custom state: ' + err.message);
        }
    }

    updateSolvabilityBadge() {
        const solvable = Puzzle.isSolvable(this.initialState, this.goalState);
        const invInit = Puzzle.countInversions(this.initialState);
        const invGoal = Puzzle.countInversions(this.goalState);

        if (solvable) {
            this.dom.solvabilityBadge.className = 'status-badge badge-solvable';
            this.dom.solvabilityBadge.textContent = `Solvable: Inversion Parity Verified (Init=${invInit}, Goal=${invGoal})`;
            this.dom.btnSolve.disabled = false;
        } else {
            this.dom.solvabilityBadge.className = 'status-badge badge-unsolvable';
            this.dom.solvabilityBadge.textContent = `Unsolvable: Inversion Parity Mismatch (Init=${invInit}, Goal=${invGoal})`;
            this.dom.btnSolve.disabled = true;
        }
    }

    resetSearchTelemetry() {
        this.visualizer.reset();
        this.lastSearchResult = null;
        this.dom.summaryStatus.textContent = 'Ready';
        this.dom.summaryMoves.textContent = '0';
        this.dom.summaryGenerated.textContent = '0';
        this.dom.summaryExpanded.textContent = '0';
        this.dom.summaryDepth.textContent = '0';
        this.dom.summaryTime.textContent = '0 ms';
        this.dom.summaryMemory.textContent = '0 KB';
        this.dom.stepCounter.textContent = 'Step 0 / 0';
        this.dom.playbackStatus.textContent = 'Ready to Solve • Press "Solve with BFS"';

        // Pre-populate FIFO Queue with the initial root state so the queue is never blank!
        const initialRootNode = {
            id: 0,
            state: [...this.initialState],
            depth: 0,
            action: 'Initial',
            movedTile: null
        };
        this.renderFrontierPeek([initialRootNode]);
        this.dom.statFrontierBadge.textContent = '1 in Queue (Initial Root)';

        // Pre-populate Successors with valid moves from the initial state
        const initialSuccessors = Puzzle.getSuccessors(this.initialState).map(succ => ({
            ...succ,
            isChosen: false,
            isGoal: Puzzle.areStatesEqual(succ.state, this.goalState)
        }));
        this.renderSuccessors(initialSuccessors);

        this.dom.searchTreeCanvas.innerHTML = '<div class="empty-placeholder">Run the BFS solver to generate and inspect the search tree hierarchy.</div>';
    }

    solveActivePuzzle(options = {}) {
        const autoRun = options.autoRun !== undefined ? options.autoRun : true;

        if (!Puzzle.isSolvable(this.initialState, this.goalState)) {
            alert('Cannot solve: Current puzzle configuration is mathematically unsolvable.');
            return;
        }

        this.dom.playbackStatus.textContent = 'Searching...';
        this.dom.btnSolve.disabled = true;

        setTimeout(() => {
            const searchOptions = {
                recordTrace: true,
                maxTraceSteps: 1500,
                maxNodes: 80000
            };

            // Execute Assigned BFS Algorithm
            const result = BFS.solve(this.initialState, this.goalState, searchOptions);
            this.lastSearchResult = result;
            this.dom.btnSolve.disabled = false;

            this.displaySolutionSummary(result);

            if (!result.success || result.path.length === 0) {
                this.dom.playbackStatus.textContent = 'No solution found within search cutoff.';
                return;
            }

            // Populate Search Tree visualization immediately
            this.renderSearchTree(result.allTreeNodes, result.path);

            // Set playback dataset based on active view mode
            this.switchViewMode(this.viewMode);

            if (autoRun) {
                this.visualizer.run();
            } else {
                this.visualizer.reset();
                this.dom.playbackStatus.textContent = result.totalMoves === 0 
                    ? 'Goal State Reached' 
                    : `Solved in ${result.totalMoves} moves (Optimal BFS) • Ready`;
            }
        }, 30);
    }

    displaySolutionSummary(result) {
        this.dom.summaryStatus.textContent = result.success ? `Solution Found in ${result.totalMoves} Moves (Optimal)` : 'No Solution Found (Cutoff)';
        this.dom.summaryStatus.style.color = result.success ? 'var(--status-success)' : 'var(--status-danger)';
        this.dom.summaryMoves.textContent = result.totalMoves;
        this.dom.summaryGenerated.textContent = result.nodesGenerated.toLocaleString();
        this.dom.summaryExpanded.textContent = result.nodesExpanded.toLocaleString();
        this.dom.summaryDepth.textContent = result.maxSearchDepth;
        this.dom.summaryTime.textContent = `${result.executionTimeMs} ms`;
        this.dom.summaryMemory.textContent = `${result.approxMemoryKb} KB`;
    }

    switchViewMode(mode) {
        this.viewMode = mode;

        if (mode === 'SOLUTION') {
            this.dom.btnModeSolution.classList.add('active');
            this.dom.btnModeTrace.classList.remove('active');
            this.dom.viewBoardContainer.style.display = 'flex';
            this.dom.viewTreeContainer.style.display = 'none';

            if (this.lastSearchResult && this.lastSearchResult.path.length > 0) {
                const solutionFrames = this.lastSearchResult.path.map((node, idx) => ({
                    stepType: 'SOLUTION_PATH',
                    moveNumber: idx,
                    node: node,
                    state: node.state,
                    action: node.action,
                    movedTile: node.movedTile,
                    depth: node.depth,
                    cost: node.cost
                }));
                this.visualizer.setPlaybackData(solutionFrames, 'SOLUTION');
            }
        } else {
            this.dom.btnModeTrace.classList.add('active');
            this.dom.btnModeSolution.classList.remove('active');
            this.dom.viewBoardContainer.style.display = 'none';
            this.dom.viewTreeContainer.style.display = 'block';

            if (this.lastSearchResult && this.lastSearchResult.trace.length > 0) {
                // Measure against visible container width and construct tree
                if (this.lastSearchResult.allTreeNodes) {
                    this.renderSearchTree(this.lastSearchResult.allTreeNodes, this.lastSearchResult.path);
                }
                this.visualizer.setPlaybackData(this.lastSearchResult.trace, 'SEARCH_TRACE');
            }
        }
    }

    handleVisualizerStep(info) {
        const { mode, stepIndex, totalSteps, data } = info;
        this.dom.stepCounter.textContent = `Step ${stepIndex + 1} / ${totalSteps}`;

        if (mode === 'SOLUTION') {
            const frame = data;
            this.renderCurrentBoard(frame.state, frame.movedTile);

            const isGoal = Puzzle.areStatesEqual(frame.state, this.goalState);
            if (isGoal) {
                this.dom.playbackStatus.textContent = `Goal State Reached! Solved in ${stepIndex} moves (Optimal BFS)`;
            } else if (frame.moveNumber === 0) {
                this.dom.playbackStatus.textContent = `Initial State (Depth 0)`;
            } else {
                this.dom.playbackStatus.textContent = `Move ${frame.moveNumber}: Slide ${frame.action} (Tile ${frame.movedTile || 'None'})`;
            }

            // 1. Live Successors for the current board state
            const rawSuccessors = Puzzle.getSuccessors(frame.state);
            const nextFrame = (stepIndex < totalSteps - 1) ? this.visualizer.steps[stepIndex + 1] : null;

            const formattedSuccessors = rawSuccessors.map(succ => {
                const isChosen = nextFrame && Puzzle.areStatesEqual(succ.state, nextFrame.state);
                const isGoalSucc = Puzzle.areStatesEqual(succ.state, this.goalState);
                return {
                    ...succ,
                    isChosen: isChosen,
                    isGoal: isGoalSucc
                };
            });
            this.renderSuccessors(formattedSuccessors);

            // 2. FIFO Frontier Queue: Show queue state corresponding to this search node
            let frontierItems = [];
            let frontierCount = 0;

            if (frame.node && Array.isArray(frame.node.frontierSnapshot) && frame.node.frontierSnapshot.length > 0) {
                frontierItems = frame.node.frontierSnapshot;
                frontierCount = frame.node.frontierSize || frontierItems.length;
            } else if (this.lastSearchResult && this.lastSearchResult.trace && this.lastSearchResult.trace[stepIndex]) {
                const traceStep = this.lastSearchResult.trace[stepIndex];
                frontierItems = traceStep.frontierPeek || [];
                frontierCount = traceStep.frontierSize || frontierItems.length;
            } else if (stepIndex === 0) {
                frontierItems = [{
                    id: 0,
                    state: frame.state,
                    depth: 0,
                    action: 'Initial',
                    movedTile: null
                }];
                frontierCount = 1;
            }

            this.renderFrontierPeek(frontierItems);
            this.dom.statFrontierBadge.textContent = `${frontierCount} in Queue`;

        } else {
            // SEARCH_TRACE mode
            const traceStep = data;
            const node = traceStep.currentNode;

            if (node) {
                this.renderCurrentBoard(node.state, node.movedTile);
                if (traceStep.type === 'GOAL_FOUND') {
                    this.dom.playbackStatus.textContent = `Goal Found! Node #${node.id} at Depth ${node.depth}`;
                } else {
                    this.dom.playbackStatus.textContent = `Expanding Node #${node.id} at Depth ${node.depth} (FIFO Dequeued)`;
                }
            }

            // Update Live Queue & Successors
            this.renderSuccessors(traceStep.successors || []);
            this.renderFrontierPeek(traceStep.frontierPeek || []);
            this.dom.statFrontierBadge.textContent = `${traceStep.frontierSize || 0} in Queue`;

            // Highlight active node in tree
            this.highlightActiveTreeNode(node ? node.id : null);
        }
    }

    handleVisualizerState(state) {
        const isRunning = state === 'RUNNING';
        const isPaused = state === 'PAUSED';

        // Update Board controls
        this.dom.btnRun.style.display = isRunning || isPaused ? 'none' : 'inline-flex';
        this.dom.btnPause.style.display = isRunning ? 'inline-flex' : 'none';
        this.dom.btnResume.style.display = isPaused ? 'inline-flex' : 'none';

        // Update Tree controls
        if (this.dom.btnTreeRun) {
            this.dom.btnTreeRun.style.display = isRunning || isPaused ? 'none' : 'inline-flex';
            this.dom.btnTreePause.style.display = isRunning ? 'inline-flex' : 'none';
            this.dom.btnTreeResume.style.display = isPaused ? 'inline-flex' : 'none';
        }

        if (state === 'PAUSED') {
            this.dom.playbackStatus.textContent = 'Paused';
        } else if (state === 'FINISHED') {
            this.dom.playbackStatus.textContent = 'Finished';
        }
    }

    renderSuccessors(successors) {
        if (!successors || successors.length === 0) {
            this.dom.successorsContainer.innerHTML = '<div class="empty-placeholder">No children generated at this step</div>';
            return;
        }

        this.dom.successorsContainer.innerHTML = '';
        successors.forEach(succ => {
            const card = document.createElement('div');
            card.className = `successor-card ${succ.isChosen ? 'chosen-move' : ''} ${succ.isGoal ? 'goal-succ' : ''}`;

            const label = document.createElement('div');
            label.className = 'succ-label';
            if (succ.isChosen) {
                label.innerHTML = `<span>${succ.action} (Tile ${succ.movedTile})</span> <span class="chosen-badge">Next</span>`;
            } else if (succ.isGoal) {
                label.innerHTML = `<span>${succ.action} (Tile ${succ.movedTile})</span> <span class="goal-badge">Goal</span>`;
            } else {
                label.textContent = `${succ.action} (Tile ${succ.movedTile})`;
            }

            const boardEl = document.createElement('div');
            Visualizer.renderBoardToElement(boardEl, succ.state, { sizeClass: 'micro-board' });

            card.appendChild(label);
            card.appendChild(boardEl);
            this.dom.successorsContainer.appendChild(card);
        });
    }

    renderFrontierPeek(frontierPeek) {
        if (!frontierPeek || frontierPeek.length === 0) {
            this.dom.frontierPreview.innerHTML = '<div class="empty-placeholder">Frontier queue is currently empty</div>';
            return;
        }

        this.dom.frontierPreview.innerHTML = '';
        frontierPeek.forEach((item, idx) => {
            const card = document.createElement('div');
            card.className = `conveyor-item-card ${idx === 0 ? 'front-item' : ''}`;

            const label = document.createElement('div');
            label.className = 'frontier-label';
            label.textContent = idx === 0 ? `Front: #${item.id} (d=${item.depth})` : `#${item.id} (d=${item.depth})`;

            const boardEl = document.createElement('div');
            Visualizer.renderBoardToElement(boardEl, item.state, { sizeClass: 'micro-board' });

            card.appendChild(label);
            card.appendChild(boardEl);
            this.dom.frontierPreview.appendChild(card);
        });
    }

    renderSearchTree(allTreeNodes, solutionPath = []) {
        if (!allTreeNodes || allTreeNodes.length === 0) {
            this.dom.searchTreeCanvas.innerHTML = '<div class="empty-placeholder">No search tree data available.</div>';
            return;
        }

        const solutionSet = new Set(solutionPath.map(n => n.id));

        // For large BFS runs, limit total rendered nodes to avoid browser DOM sluggishness
        // Always prioritize root, all nodes on the solution path, and the first 65 nodes
        let nodesToRender = allTreeNodes;
        if (allTreeNodes.length > 70) {
            const preservedIds = new Set(solutionSet);
            allTreeNodes.forEach(n => {
                if (solutionSet.has(n.id) && n.parentId !== null) {
                    preservedIds.add(n.parentId);
                }
            });
            nodesToRender = allTreeNodes.filter((n, idx) => preservedIds.has(n.id) || idx < 60);
        }

        // Build tree adjacency map
        const nodeMap = new Map();
        nodesToRender.forEach(n => {
            nodeMap.set(n.id, {
                ...n,
                children: [],
                x: 0,
                y: 0
            });
        });

        let root = null;
        nodesToRender.forEach(n => {
            const node = nodeMap.get(n.id);
            if (n.parentId !== null && n.parentId !== undefined && nodeMap.has(n.parentId)) {
                nodeMap.get(n.parentId).children.push(node);
            } else if (n.id === 0 || !root) {
                root = node;
            }
        });

        if (!root) {
            this.dom.searchTreeCanvas.innerHTML = '<div class="empty-placeholder">Search tree root node not found.</div>';
            return;
        }

        const NODE_WIDTH = 86;
        const NODE_HEIGHT = 106;
        const LEVEL_HEIGHT = 150;
        const NODE_GAP = 22;
        const PADDING_X = 40;
        const PADDING_Y = 30;

        // Step 1: Assign depths and vertical y coordinates
        function assignDepths(node, depth = 0) {
            node.depth = depth;
            node.y = PADDING_Y + depth * LEVEL_HEIGHT;
            node.children.forEach(child => assignDepths(child, depth + 1));
        }
        assignDepths(root, 0);

        // Step 2: Post-order leaf traversal to assign preliminary x coordinates
        let currentLeafX = PADDING_X;
        function computeInitialX(node) {
            if (!node.children || node.children.length === 0) {
                node.x = currentLeafX;
                currentLeafX += NODE_WIDTH + NODE_GAP;
            } else {
                node.children.forEach(child => computeInitialX(child));
                const firstChildX = node.children[0].x;
                const lastChildX = node.children[node.children.length - 1].x;
                node.x = (firstChildX + lastChildX) / 2;
            }
        }
        computeInitialX(root);

        // Step 3: Collision resolution per depth level
        const depthGroups = new Map();
        function collectDepths(node) {
            if (!depthGroups.has(node.depth)) depthGroups.set(node.depth, []);
            depthGroups.get(node.depth).push(node);
            node.children.forEach(collectDepths);
        }
        collectDepths(root);

        function shiftSubtree(node, shift) {
            node.x += shift;
            node.children.forEach(child => shiftSubtree(child, shift));
        }

        depthGroups.forEach((nodesAtDepth) => {
            nodesAtDepth.sort((a, b) => a.x - b.x);
            for (let i = 1; i < nodesAtDepth.length; i++) {
                const prev = nodesAtDepth[i - 1];
                const curr = nodesAtDepth[i];
                const minX = prev.x + NODE_WIDTH + NODE_GAP;
                if (curr.x < minX) {
                    const shift = minX - curr.x;
                    shiftSubtree(curr, shift);
                }
            }
        });

        // Step 4: Recenter parent nodes over their children
        function recenterParents(node) {
            if (node.children && node.children.length > 0) {
                node.children.forEach(recenterParents);
                const firstChildX = node.children[0].x;
                const lastChildX = node.children[node.children.length - 1].x;
                node.x = (firstChildX + lastChildX) / 2;
            }
        }
        recenterParents(root);

        // Step 5: Calculate total bounding box dimensions and center tree if canvas is wider
        let maxX = 0;
        let maxY = 0;
        function findExtents(node) {
            if (node.x > maxX) maxX = node.x;
            if (node.y > maxY) maxY = node.y;
            node.children.forEach(findExtents);
        }
        findExtents(root);

        const measuredWidth = this.dom.searchTreeCanvas ? (this.dom.searchTreeCanvas.clientWidth || 1160) : 1160;
        const totalTreeWidth = maxX + NODE_WIDTH + PADDING_X;

        // Center tree horizontally in the full-width canvas if it fits comfortably
        if (totalTreeWidth < measuredWidth) {
            const centerShift = Math.floor((measuredWidth - totalTreeWidth) / 2);
            function applyShift(node) {
                node.x += centerShift;
                node.children.forEach(applyShift);
            }
            applyShift(root);
            maxX += centerShift;
        }

        const canvasWidth = Math.max(measuredWidth, Math.ceil(maxX + NODE_WIDTH + PADDING_X));
        const canvasHeight = Math.max(520, Math.ceil(maxY + NODE_HEIGHT + PADDING_Y));

        // Step 6: Build SVG Layer with lines and action badges
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'tree-svg-layer');
        svg.setAttribute('width', canvasWidth.toString());
        svg.setAttribute('height', canvasHeight.toString());

        function drawEdges(node) {
            node.children.forEach(child => {
                const px = node.x + NODE_WIDTH / 2;
                const py = node.y + NODE_HEIGHT;
                const cx = child.x + NODE_WIDTH / 2;
                const cy = child.y;
                const midY = (py + cy) / 2;

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', `M ${px} ${py} C ${px} ${midY}, ${cx} ${midY}, ${cx} ${cy}`);
                path.setAttribute('class', 'tree-edge-line');
                path.id = `tree-edge-${child.id}`;

                if (solutionSet.has(node.id) && solutionSet.has(child.id)) {
                    path.classList.add('edge-solution');
                }
                svg.appendChild(path);

                // Action badge on edge
                if (child.action) {
                    const badgeX = (px + cx) / 2;
                    const badgeY = midY;

                    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                    bgRect.setAttribute('x', (badgeX - 18).toString());
                    bgRect.setAttribute('y', (badgeY - 9).toString());
                    bgRect.setAttribute('width', '36');
                    bgRect.setAttribute('height', '18');
                    bgRect.setAttribute('class', 'tree-edge-badge-bg');
                    svg.appendChild(bgRect);

                    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    text.setAttribute('x', badgeX.toString());
                    text.setAttribute('y', badgeY.toString());
                    text.setAttribute('class', 'tree-edge-badge');
                    text.textContent = child.action;
                    svg.appendChild(text);
                }

                drawEdges(child);
            });
        }
        drawEdges(root);

        // Step 7: Build Node Elements Layer
        const nodesLayer = document.createElement('div');
        nodesLayer.className = 'tree-nodes-layer';

        const renderNodeCard = (node) => {
            const card = document.createElement('div');
            card.className = 'tree-node-card';
            card.id = `tree-node-${node.id}`;
            card.style.left = `${node.x}px`;
            card.style.top = `${node.y}px`;

            if (node.isGoal) {
                card.classList.add('node-goal');
            } else if (solutionSet.has(node.id)) {
                card.classList.add('node-solution');
            }

            // Header: ID & Action
            const header = document.createElement('div');
            header.className = 'tree-node-header';
            const actionText = node.depth === 0 ? 'Root' : (node.action || `d=${node.depth}`);
            header.innerHTML = `<span>#${node.id}</span><span class="tree-node-action">${actionText}</span>`;

            // Micro 3x3 Board
            const boardEl = document.createElement('div');
            Visualizer.renderBoardToElement(boardEl, node.state, { sizeClass: 'micro-board' });

            // Depth footer
            const footer = document.createElement('div');
            footer.style.cssText = 'font-size: 0.65rem; color: var(--text-dim); font-family: var(--font-mono); margin-top: 1px;';
            footer.textContent = `Depth ${node.depth}`;

            card.appendChild(header);
            card.appendChild(boardEl);
            card.appendChild(footer);

            // Clicking any node previews it on the main board
            card.addEventListener('click', () => {
                this.renderCurrentBoard(node.state, node.movedTile);
                this.dom.playbackStatus.textContent = `Inspecting Node #${node.id} at Depth ${node.depth} (${node.action || 'Initial'})`;
            });

            nodesLayer.appendChild(card);
            node.children.forEach(renderNodeCard);
        };
        renderNodeCard(root);

        // Step 8: Mount into canvas
        const canvasInner = document.createElement('div');
        canvasInner.className = 'tree-canvas-inner';
        canvasInner.style.width = `${canvasWidth}px`;
        canvasInner.style.height = `${canvasHeight}px`;

        canvasInner.appendChild(svg);
        canvasInner.appendChild(nodesLayer);

        this.dom.searchTreeCanvas.innerHTML = '';
        this.dom.searchTreeCanvas.appendChild(canvasInner);
    }

    highlightActiveTreeNode(nodeId) {
        if (nodeId === null || nodeId === undefined) return;
        document.querySelectorAll('.tree-node-card.node-current').forEach(el => el.classList.remove('node-current'));
        document.querySelectorAll('.tree-edge-line.edge-active').forEach(el => el.classList.remove('edge-active'));

        const target = document.getElementById(`tree-node-${nodeId}`);
        if (target) {
            target.classList.add('node-current');
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        const targetEdge = document.getElementById(`tree-edge-${nodeId}`);
        if (targetEdge) {
            targetEdge.classList.add('edge-active');
        }
    }

    async runFullComparison() {
        if (!Puzzle.isSolvable(this.initialState, this.goalState)) {
            alert('Cannot benchmark: Current puzzle is unsolvable. Generate a solvable one first.');
            return;
        }

        this.dom.btnRunComparison.disabled = true;
        this.dom.comparisonProgress.style.display = 'block';
        this.dom.comparisonProgress.textContent = 'Executing benchmark across all 6 search algorithms on active puzzle configuration...';
        this.dom.comparisonTableBody.innerHTML = '';

        const results = await ComparisonEngine.runComparison(
            this.initialState,
            this.goalState,
            {
                dlsLimit: 12,
                gbfsHeuristic: 'manhattan',
                astarHeuristic: 'manhattan'
            },
            (record, currentIdx, total) => {
                this.dom.comparisonProgress.textContent = `Completed ${currentIdx} of ${total}: ${record.name}...`;

                const tr = document.createElement('tr');
                if (record.isAssigned) {
                    tr.className = 'assigned-row';
                }

                tr.innerHTML = `
                    <td>
                        <strong>${record.name}</strong>
                        ${record.isAssigned ? '<span class="status-badge badge-assigned" style="margin-left: 8px;">Assigned (24BDS0004)</span>' : ''}
                        <div style="font-size: 0.78rem; color: var(--text-dim); margin-top: 2px;">${record.fullName}</div>
                    </td>
                    <td class="align-center">
                        <span class="status-badge ${record.solutionFound === 'Yes' ? 'badge-solvable' : 'badge-unsolvable'}">
                            ${record.solutionFound === 'Yes' ? 'Yes' : 'No'}
                        </span>
                    </td>
                    <td class="align-right">
                        ${typeof record.nodesExpanded === 'number' ? record.nodesExpanded.toLocaleString() : record.nodesExpanded}
                    </td>
                    <td class="align-right">
                        ${record.moves}
                    </td>
                    <td class="align-right">
                        ${typeof record.timeMs === 'number' ? `${record.timeMs} ms` : record.timeMs}
                    </td>
                    <td class="align-center">
                        <span class="status-badge badge-neutral">
                            ${record.memory} (${record.memoryKb} KB)
                        </span>
                    </td>
                `;
                this.dom.comparisonTableBody.appendChild(tr);
            }
        );

        this.dom.comparisonProgress.textContent = `Benchmark completed. Evaluated ${results.length} search strategies.`;
        this.dom.btnRunComparison.disabled = false;
    }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
