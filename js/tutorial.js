/**
 * 教程系统 - 互动式教学
 * 联合演习 - 回合制自走棋
 * 
 * 包含TutorialSystem类
 * 负责新手教程、互动指引、聚光灯高亮等功能
 */

class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.difficulty = 'easy';
        this.isActive = false;
        this.isHighlightActive = false;
        this.completedTasks = new Set();
        this.tutorialProgress = this.loadProgress();
        this.steps = this.getTutorialSteps();
        this.highlightOverlay = null;
        this.currentHighlight = null;
        this.isTyping = false;
        this.typingTimeout = null;
        this.canProceed = true;
    }

    getTutorialSteps() {
        return [
            {
                id: 'welcome',
                type: 'info',
                icon: '🎯',
                title: '欢迎来到联合演习！',
                description: '这是一款回合制自走棋游戏，您需要通过招募棋子、升级营帐、排兵布阵来战胜敌人。'
            },
            {
                id: 'gold',
                type: 'highlight',
                icon: '💰',
                title: '经济系统',
                description: '这是您的金币！每回合会自动获得金币，用来购买棋子和升级营帐。',
                highlightElement: '#gold'
            },
            {
                id: 'shop',
                type: 'highlight',
                icon: '🏪',
                title: '商店系统',
                description: '这是商店！点击棋子卡片即可购买。购买的棋子会自动上阵。',
                highlightElement: '#shop-items',
                task: 'buy_chess',
                taskDescription: '购买一个棋子'
            },
            {
                id: 'battlefield',
                type: 'highlight',
                icon: '⚔️',
                title: '战场布局',
                description: '这是您的战场！棋子会在这里战斗。最多可以上阵7个棋子。',
                highlightElement: '#battlefield'
            },
            {
                id: 'bench',
                type: 'highlight',
                icon: '🏠',
                title: '替补席',
                description: '这是替补席！放不下战场的棋子会放在这里。您可以拖拽棋子调整位置。',
                highlightElement: '#bench'
            },
            {
                id: 'merge',
                type: 'info',
                icon: '⭐',
                title: '合成系统',
                description: '3个相同的棋子可以合成更高星级！合成后属性翻倍，技能更强。'
            },
            {
                id: 'faction_intro',
                type: 'info',
                icon: '🏆',
                title: '阵营系统',
                description: '这是本游戏的核心特色！相同阵营的棋子一起上阵会触发强大的羁绊效果！'
            },
            {
                id: 'faction_panel',
                type: 'info',
                icon: '🎖️',
                title: '阵营面板',
                description: '在游戏界面可以查看当前阵营状态！达到3人即可触发羁绊效果。'
            },
            {
                id: 'refresh',
                type: 'highlight',
                icon: '🔄',
                title: '刷新商店',
                description: '不喜欢当前的棋子？花2金币刷新商店，试试手气！',
                highlightElement: '#refresh-shop'
            },
            {
                id: 'upgrade',
                type: 'highlight',
                icon: '🏰',
                title: '升级营帐',
                description: '升级营帐可以刷出更高星级的棋子！等级越高，能刷出的棋子越强。',
                highlightElement: '#upgrade-camp'
            },
            {
                id: 'battle',
                type: 'highlight',
                icon: '⚔️',
                title: '开始战斗',
                description: '准备好就点击这里！双方棋子会自动战斗，祝您旗开得胜！',
                highlightElement: '#start-battle',
                task: 'start_battle',
                taskDescription: '点击开始战斗'
            },
            {
                id: 'complete',
                type: 'complete',
                icon: '🎉',
                title: '恭喜完成教程！',
                description: '您已经掌握了游戏的基本玩法！现在开始您的战斗之旅吧！'
            }
        ];
    }

    loadProgress() {
        try {
            const saved = localStorage.getItem('tutorialProgress');
            return saved ? JSON.parse(saved) : { completed: false, currentStep: 0, completedTasks: [] };
        } catch (e) {
            return { completed: false, currentStep: 0, completedTasks: [] };
        }
    }

    saveProgress() {
        try {
            localStorage.setItem('tutorialProgress', JSON.stringify({
                completed: this.tutorialProgress.completed,
                currentStep: this.currentStep,
                completedTasks: Array.from(this.completedTasks)
            }));
        } catch (e) {
            console.warn('无法保存教程进度:', e);
        }
    }

    showSelectionPanel() {
        if (this.tutorialProgress.completed) {
            return;
        }
        this.createSelectionPanel();
    }

    createSelectionPanel() {
        const panel = document.createElement('div');
        panel.id = 'tutorial-selection-overlay';
        panel.className = 'tutorial-selection-overlay';
        panel.innerHTML = `
            <div class="tutorial-selection-panel">
                <div class="selection-header">
                    <h2>🎮 欢迎来到联合演习！</h2>
                    <p>您是第一次玩吗？</p>
                </div>
                <div class="selection-buttons">
                    <button class="selection-btn primary" id="start-tutorial-btn">
                        <span class="btn-icon">📖</span>
                        <span class="btn-text">观看新手教程</span>
                        <span class="btn-desc">互动式教学，5分钟上手</span>
                    </button>
                    <button class="selection-btn secondary" id="skip-tutorial-btn">
                        <span class="btn-icon">🎯</span>
                        <span class="btn-text">直接开始游戏</span>
                        <span class="btn-desc">跳过教程，直接体验</span>
                    </button>
                </div>
                <div class="selection-footer">
                    <label class="dont-show-again">
                        <input type="checkbox" id="dont-show-tutorial">
                        下次不再显示
                    </label>
                </div>
            </div>
        `;

        document.body.appendChild(panel);

        document.getElementById('start-tutorial-btn').addEventListener('click', () => {
            panel.remove();
            setTimeout(() => this.start(), 100);
        });

        document.getElementById('skip-tutorial-btn').addEventListener('click', () => {
            this.handleSkip(panel);
        });
    }

    handleSkip(panel) {
        const dontShow = document.getElementById('dont-show-tutorial').checked;
        if (dontShow) {
            this.tutorialProgress.completed = true;
            this.saveProgress();
        }
        panel.remove();
    }

    start() {
        this.isActive = true;
        this.currentStep = 0;
        this.completedTasks.clear();
        
        const overlay = document.getElementById('tutorial-overlay');
        overlay.classList.remove('hidden');
        
        this.bindEvents();
        this.renderStep();
    }

    bindEvents() {
        const container = document.getElementById('tutorial-container');
        container.addEventListener('click', (e) => this.handleClick(e));
    }

    handleClick(e) {
        // 阻止事件冒泡，防止影响游戏区域
        e.stopPropagation();
        
        if (this.isTyping) {
            this.skipTyping();
            return;
        }

        const step = this.steps[this.currentStep];
        
        if (step.task && !this.completedTasks.has(step.task)) {
            this.showTaskNotification('请先完成任务！');
            return;
        }

        if (!this.canProceed) return;

        this.nextStep();
    }

    skipTyping() {
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
            this.typingTimeout = null;
        }
        
        const step = this.steps[this.currentStep];
        const descEl = document.getElementById('step-description');
        descEl.innerHTML = step.description;
        this.isTyping = false;
        this.canProceed = true;
        
        this.updateHint();
    }

    renderStep() {
        const step = this.steps[this.currentStep];
        
        document.getElementById('tutorial-icon').textContent = step.icon;
        document.getElementById('step-title').textContent = step.title;
        
        this.canProceed = false;
        this.isTyping = true;
        this.typeText('step-description', step.description);
        
        if (step.type === 'highlight' && step.highlightElement) {
            this.showHighlight(step.highlightElement);
        } else {
            this.hideHighlight();
        }

        if (step.task) {
            this.showTaskIndicator(step.taskDescription);
            this.canProceed = this.completedTasks.has(step.task);
        } else {
            this.hideTaskIndicator();
        }

        this.saveProgress();
        this.updateHint();
    }

    typeText(elementId, text) {
        const element = document.getElementById(elementId);
        element.innerHTML = '<span class="typing-cursor"></span>';
        
        let index = 0;
        const speed = 30;

        const type = () => {
            if (index < text.length) {
                element.innerHTML = text.substring(0, index + 1) + '<span class="typing-cursor"></span>';
                index++;
                this.typingTimeout = setTimeout(type, speed);
            } else {
                element.innerHTML = text;
                this.isTyping = false;
                this.canProceed = true;
                this.updateHint();
            }
        };

        type();
    }

    updateHint() {
        const hint = document.querySelector('.tutorial-hint');
        const step = this.steps[this.currentStep];
        
        if (step.task && !this.completedTasks.has(step.task)) {
            hint.textContent = '完成任务后点击继续';
            hint.style.opacity = '0.5';
        } else if (this.isTyping) {
            hint.textContent = '点击跳过打字效果';
            hint.style.opacity = '0.7';
        } else {
            hint.textContent = '点击任意位置继续';
            hint.style.opacity = '';
        }
    }

    showHighlight(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn('找不到高亮元素:', selector);
            return;
        }

        this.hideHighlight();

        this.highlightOverlay = document.createElement('div');
        this.highlightOverlay.id = 'tutorial-highlight-overlay';
        this.highlightOverlay.className = 'tutorial-highlight-overlay';
        
        const highlightBox = document.createElement('div');
        highlightBox.id = 'tutorial-highlight-box';
        highlightBox.className = 'tutorial-highlight-box';
        
        const rect = element.getBoundingClientRect();
        const padding = 12;
        
        highlightBox.style.cssText = `
            top: ${rect.top - padding}px;
            left: ${rect.left - padding}px;
            width: ${rect.width + padding * 2}px;
            height: ${rect.height + padding * 2}px;
        `;
        
        this.highlightOverlay.appendChild(highlightBox);
        document.body.appendChild(this.highlightOverlay);
        
        this.isHighlightActive = true;
        this.currentHighlight = selector;
        
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    hideHighlight() {
        if (this.highlightOverlay) {
            this.highlightOverlay.remove();
            this.highlightOverlay = null;
        }
        this.isHighlightActive = false;
        this.currentHighlight = null;
    }

    showTaskIndicator(description) {
        const container = document.getElementById('tutorial-task-container');
        if (!container) return;

        const isCompleted = this.completedTasks.has(this.steps[this.currentStep].task);
        
        container.innerHTML = `
            <div class="tutorial-task-indicator ${isCompleted ? 'completed' : ''}" id="tutorial-task-indicator">
                <span class="task-icon">${isCompleted ? '✅' : '📋'}</span>
                <span class="task-text">任务：${description}</span>
                <span class="task-status" id="task-status">${isCompleted ? '✅' : '⏳'}</span>
            </div>
        `;
    }

    hideTaskIndicator() {
        const container = document.getElementById('tutorial-task-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    completeTask(taskId) {
        this.completedTasks.add(taskId);
        this.saveProgress();
        
        const indicator = document.getElementById('tutorial-task-indicator');
        if (indicator) {
            indicator.classList.add('completed');
            const status = document.getElementById('task-status');
            if (status) status.textContent = '✅';
            const icon = indicator.querySelector('.task-icon');
            if (icon) icon.textContent = '✅';
        }
        
        this.canProceed = true;
        this.updateHint();
        this.showTaskNotification('任务完成！');
    }

    showTaskNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'tutorial-notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
        } else {
            this.complete();
        }
    }

    complete() {
        this.isActive = false;
        this.hideHighlight();
        this.hideTaskIndicator();
        this.tutorialProgress.completed = true;
        this.saveProgress();
        document.getElementById('tutorial-overlay').classList.add('hidden');
        console.log('教程完成，开始游戏！');
    }

    resetProgress() {
        this.tutorialProgress = { completed: false, currentStep: 0, completedTasks: [] };
        this.completedTasks.clear();
        this.currentStep = 0;
        this.saveProgress();
    }
}
