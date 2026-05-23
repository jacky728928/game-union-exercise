/**
 * 教程系统
 * 联合演习 - 回合制自走棋
 * 
 * 包含TutorialSystem类
 * 负责新手教程、游戏指引等功能
 */

class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.difficulty = 'easy';
        this.steps = this.getTutorialSteps();
    }

    getTutorialSteps() {
        return [
            {
                icon: '🎯',
                title: '欢迎来到联合演习！',
                description: '这是一款回合制自走棋游戏，您需要通过招募棋子、升级营帐、排兵布阵来战胜敌人。'
            },
            {
                icon: '💰',
                title: '经济系统',
                description: '每回合您会获得金币，可以用来购买棋子。金币越多，升级营帐的选项就越多！'
            },
            {
                icon: '🏪',
                title: '商店系统',
                description: '点击商店中的棋子即可购买。棋子会自动放到战场上，最多同时上阵7个棋子。'
            },
            {
                icon: '⭐',
                title: '合成系统',
                description: '3个相同星级的棋子可以合成更高1星的棋子！合成后的棋子属性更强，技能更厉害。'
            },
            {
                icon: '⚔️',
                title: '战斗系统',
                description: '点击"开始战斗"后，双方会自动轮流攻击。棋子会按照从左到右的顺序行动。'
            },
            {
                icon: '🏆',
                title: '胜利条件',
                description: '将对方所有棋子消灭即为胜利！胜利后会对敌方英雄造成伤害，英雄血量耗尽则游戏结束。'
            },
            {
                icon: '🎮',
                title: '准备开战！',
                description: '您已经掌握了基本玩法！现在去挑战敌人吧，祝您取得好成绩！'
            }
        ];
    }

    start() {
        this.currentStep = 0;
        document.getElementById('tutorial-overlay').classList.remove('hidden');
        this.bindEvents();
        this.renderStep();
    }

    bindEvents() {
        document.getElementById('tutorial-prev')?.addEventListener('click', () => this.prevStep());
        document.getElementById('tutorial-next')?.addEventListener('click', () => this.nextStep());
        document.getElementById('tutorial-skip')?.addEventListener('click', () => this.skip());
    }

    renderStep() {
        const step = this.steps[this.currentStep];
        
        document.getElementById('tutorial-icon').textContent = step.icon;
        document.getElementById('step-title').textContent = step.title;
        document.getElementById('step-description').textContent = step.description;
        document.getElementById('step-indicator').textContent = `步骤 ${this.currentStep + 1}/${this.steps.length}`;
        
        // 更新按钮状态
        document.getElementById('tutorial-prev').disabled = this.currentStep === 0;
        document.getElementById('tutorial-next').textContent = 
            this.currentStep === this.steps.length - 1 ? '完成' : '下一步';
        
        // 添加动画效果
        const stepEl = document.getElementById('tutorial-step');
        stepEl.style.animation = 'none';
        stepEl.offsetHeight; // 强制重绘
        stepEl.style.animation = 'menuFadeIn 0.3s ease-out';
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.renderStep();
        } else {
            this.complete();
        }
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.renderStep();
        }
    }

    skip() {
        this.complete();
    }

    complete() {
        document.getElementById('tutorial-overlay').classList.add('hidden');
    }
}
