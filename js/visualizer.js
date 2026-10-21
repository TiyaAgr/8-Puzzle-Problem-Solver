/**
 * Visualizer & Playback Engine for 8-Puzzle
 * Controls: Run, Pause, Resume, Next Step, Previous Step, Reset, Speed
 * Renders live board tiles with CSS sliding animations, search metrics, frontier cards, and successors.
 */

import { Puzzle } from './puzzle.js';

export class Visualizer {
    constructor(callbacks = {}) {
        this.callbacks = callbacks;
        this.state = 'IDLE'; // 'IDLE', 'RUNNING', 'PAUSED', 'FINISHED'
        this.mode = 'SEARCH'; // 'SEARCH' (trace expansion) or 'SOLUTION' (solution path traversal)
        this.currentStepIndex = 0;
        this.steps = []; // array of trace or solution frames
        this.playbackSpeedMs = 400; // ms per step
        this.timer = null;
        this.onStepChange = callbacks.onStepChange || null;
        this.onStateChange = callbacks.onStateChange || null;
    }

    setPlaybackData(steps, mode = 'SOLUTION') {
        this.stopTimer();
        this.steps = steps || [];
        this.mode = mode;
        this.currentStepIndex = 0;
        this.state = 'IDLE';
        this.triggerStateChange();
        if (this.steps.length > 0) {
            this.renderCurrentStep();
        }
    }

    getCurrentStep() {
        if (!this.steps || this.steps.length === 0) return null;
        return this.steps[this.currentStepIndex];
    }

    setSpeed(speedMultiplier) {
        // Multiplier from 0.5x to 5x. Base is 500ms
        const clamped = Math.max(0.2, Math.min(speedMultiplier, 10));
        this.playbackSpeedMs = Math.round(500 / clamped);
        if (this.state === 'RUNNING') {
            this.pause();
            this.run();
        }
    }

    run() {
        if (this.steps.length === 0) return;
        if (this.currentStepIndex >= this.steps.length - 1) {
            this.currentStepIndex = 0; // restart from beginning
        }
        this.state = 'RUNNING';
        this.triggerStateChange();
        this.scheduleNextTick();
    }

    pause() {
        this.stopTimer();
        this.state = 'PAUSED';
        this.triggerStateChange();
    }

    resume() {
        if (this.state === 'PAUSED' || this.state === 'IDLE') {
            this.run();
        }
    }

    nextStep() {
        this.pause();
        if (this.currentStepIndex < this.steps.length - 1) {
            this.currentStepIndex++;
            this.renderCurrentStep();
        }
    }

    previousStep() {
        this.pause();
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.renderCurrentStep();
        }
    }

    reset() {
        this.stopTimer();
        this.currentStepIndex = 0;
        this.state = 'IDLE';
        this.triggerStateChange();
        if (this.steps.length > 0) {
            this.renderCurrentStep();
        }
    }

    scheduleNextTick() {
        this.stopTimer();
        this.timer = setTimeout(() => {
            if (this.state !== 'RUNNING') return;

            if (this.currentStepIndex < this.steps.length - 1) {
                this.currentStepIndex++;
                this.renderCurrentStep();
                this.scheduleNextTick();
            } else {
                this.state = 'FINISHED';
                this.triggerStateChange();
            }
        }, this.playbackSpeedMs);
    }

    stopTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    renderCurrentStep() {
        const step = this.getCurrentStep();
        if (!step) return;

        if (this.onStepChange) {
            this.onStepChange({
                mode: this.mode,
                stepIndex: this.currentStepIndex,
                totalSteps: this.steps.length,
                data: step
            });
        }
    }

    triggerStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.state);
        }
    }

    /**
     * Helper to render a 3x3 board HTML into an element container
     */
    static renderBoardToElement(container, state, options = {}) {
        if (!container || !state) return;
        const sizeClass = options.sizeClass || 'normal-board';
        const isInteractive = options.interactive || false;
        const highlightTile = options.highlightTile !== undefined ? options.highlightTile : null;

        container.innerHTML = '';
        container.className = `puzzle-grid ${sizeClass}`;

        state.forEach((tileVal, idx) => {
            const tileEl = document.createElement('div');
            tileEl.className = 'puzzle-tile';
            tileEl.dataset.index = idx;
            tileEl.dataset.value = tileVal;

            if (tileVal === 0) {
                tileEl.classList.add('blank-tile');
                tileEl.textContent = '';
            } else {
                tileEl.textContent = tileVal;
                if (highlightTile === tileVal) {
                    tileEl.classList.add('highlighted-tile');
                }
            }

            if (isInteractive && options.onTileClick) {
                tileEl.addEventListener('click', () => options.onTileClick(idx, tileVal));
            }

            container.appendChild(tileEl);
        });
    }
}
