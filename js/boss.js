/**
 * Boss管理器
 * 联合演习 - 回合制自走棋
 * 
 * 包含BossManager类
 * 负责Boss相关UI和流程控制
 */

class BossManager {
    constructor() {
        this.bossWarningElement = null;
        this.bossIntroOverlay = null;
        this.onBattleStartCallback = null;
    }

    init() {
        this.bossWarningElement = document.getElementById('boss-warning');
        this.bossIntroOverlay = document.getElementById('boss-intro-overlay');
        
        const closeBtn = document.getElementById('boss-intro-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeBossIntro());
        }
    }

    // 检查并显示Boss警告
    checkAndShowBossWarning(currentRound) {
        if (!this.bossWarningElement) return;
        
        const nextBossRound = Math.ceil(currentRound / 10) * 10;
        const roundsUntilBoss = nextBossRound - currentRound;
        
        if (roundsUntilBoss > 0 && roundsUntilBoss <= 5) {
            this.showBossWarning(roundsUntilBoss);
        } else {
            this.hideBossWarning();
        }
    }

    // 显示Boss警告
    showBossWarning(roundsLeft) {
        if (!this.bossWarningElement) return;
        
        const roundsElement = document.getElementById('boss-rounds-left');
        if (roundsElement) {
            roundsElement.textContent = roundsLeft;
        }
        
        this.bossWarningElement.classList.remove('hidden');
    }

    // 隐藏Boss警告
    hideBossWarning() {
        if (this.bossWarningElement) {
            this.bossWarningElement.classList.add('hidden');
        }
    }

    // 检查是否是Boss回合
    isBossRound(round) {
        return round % 10 === 0 && round > 0;
    }

    // 显示Boss介绍弹窗
    showBossIntro(bossInfo, onBattleStart) {
        if (!this.bossIntroOverlay) return;
        
        this.onBattleStartCallback = onBattleStart;
        
        // 更新弹窗内容
        const nameElement = document.getElementById('boss-name');
        const descElement = document.getElementById('boss-description');
        
        if (nameElement) nameElement.textContent = bossInfo.name;
        if (descElement) descElement.textContent = bossInfo.description;
        
        // 显示弹窗
        this.bossIntroOverlay.classList.remove('hidden');
    }

    // 关闭Boss介绍弹窗并开始战斗
    closeBossIntro() {
        if (this.bossIntroOverlay) {
            this.bossIntroOverlay.classList.add('hidden');
        }
        
        if (this.onBattleStartCallback) {
            const callback = this.onBattleStartCallback;
            this.onBattleStartCallback = null;
            callback();
        }
    }
}

// 创建Boss管理器实例
const bossManager = new BossManager();
