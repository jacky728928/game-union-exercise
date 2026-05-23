/**
 * 战斗系统
 * 联合演习 - 回合制自走棋
 * 
 * 包含Battle类
 * 负责战斗流程、战斗动画、战斗结算等功能
 */

class Battle {
    constructor(playerUnits, enemyUnits) {
        this.originalPlayerUnits = playerUnits;
        this.originalEnemyUnits = enemyUnits;
        this.playerUnits = playerUnits.map(u => this.cloneChessUnit(u));
        this.enemyUnits = enemyUnits.map(u => this.cloneChessUnit(u));
        this.battleLog = [];
        this.isRunning = false;
        this.currentTurn = 0;
        this.animationSpeed = 400;
        this.actionDelay = 1200;
        this.speedMultiplier = 1;
        this.attackingCards = new Map();
        this.baseAnimationTime = 400;
        this.setupSpeedControls();
    }

    setupSpeedControls() {
        const speedBtns = document.querySelectorAll('.battle-speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseFloat(e.target.dataset.speed);
                this.setBattleSpeed(speed);
            });
        });
    }

    setBattleSpeed(speed) {
        this.speedMultiplier = speed;
        document.querySelectorAll('.battle-speed-btn').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
        });
        const speedIndicator = document.getElementById('current-battle-speed');
        if (speedIndicator) {
            speedIndicator.textContent = `${speed}x`;
        }
    }

    getScaledDelay(ms) {
        return ms / this.speedMultiplier;
    }

    cloneChessUnit(unit) {
        console.log(`[Battle] cloneChessUnit() - 复制棋子: ${unit.name} (${unit.star}星)`);
        const cloned = new ChessUnit({
            id: unit.id,
            baseId: unit.baseId,
            name: unit.name,
            star: unit.star,
            hp: unit.hp,
            atk: unit.atk,
            skillKey: unit.skillKey,
            camp: unit.camp,
            isBoss: unit.isBoss || false,
            secondarySkillKey: unit.secondarySkillKey || null,
            revivalUsed: unit.revivalUsed || false,
            hpLossSegments: unit.hpLossSegments || 0
        });
        
        return cloned;
    }

    async start() {
        try {
            this.isRunning = true;
            this.battleLog = [];

            this.showBattleOverlay();
            this.updateBattleDisplay();

            // 处理开战技能
            await this.processBattleStartSkills();

            const firstAttacker = Math.random() < 0.5 ? 'player' : 'enemy';
            this.battleLog.push(`<span style="color:${firstAttacker === 'player' ? '#48bb78' : '#fc8181'}">◆</span> ${firstAttacker === 'player' ? '我方' : '敌方'}先手！`);
            this.updateBattleLog();

            await this.executeBattle();

            if (!this.isRunning) return;

            this.isRunning = false;
            this.determineWinner();
        } catch (error) {
            console.error('Battle error:', error);
            this.isRunning = false;
            this.closeBattle();
        }
    }

    async processBattleStartSkills() {
        console.log('[Battle] 处理开战技能...');
        
        // 处理我方单位的开战技能
        for (const unit of this.playerUnits) {
            if (unit && unit.hp > 0 && unit.skill) {
                const triggers = Array.isArray(unit.skill.trigger) ? unit.skill.trigger : [unit.skill.trigger];
                if (triggers.includes('on_battle_start')) {
                    console.log(`[Battle] ${unit.name} 开战技能触发: ${unit.skill.name}`);
                    const result = unit.skill.effect(unit, 'on_battle_start', { isGold: unit.isMerged });
                    if (result) {
                        // 添加到战斗日志
                        this.battleLog.push(`<span style="color:#48bb78">★</span> <strong>${unit.name}</strong> 发动 <strong>${unit.skill.icon} ${unit.skill.name}</strong>`);
                        this.updateBattleLog();
                        
                        // 显示技能效果
                        if (unit.showSkillVisualEffect) {
                            unit.showSkillVisualEffect(result, 'on_battle_start');
                        }
                    }
                }
            }
        }

        // 处理敌方单位的开战技能
        for (const unit of this.enemyUnits) {
            if (unit && unit.hp > 0 && unit.skill) {
                const triggers = Array.isArray(unit.skill.trigger) ? unit.skill.trigger : [unit.skill.trigger];
                if (triggers.includes('on_battle_start')) {
                    console.log(`[Battle] 敌方 ${unit.name} 开战技能触发: ${unit.skill.name}`);
                    const result = unit.skill.effect(unit, 'on_battle_start', { isGold: false });
                    if (result) {
                        // 添加到战斗日志
                        this.battleLog.push(`<span style="color:#fc8181">★</span> 敌方 <strong>${unit.name}</strong> 发动 <strong>${unit.skill.icon} ${unit.skill.name}</strong>`);
                        this.updateBattleLog();
                    }
                }
            }
        }

        this.updateBattleDisplay();
        await this.delay(this.getScaledDelay(500));
    }

    showBattleOverlay() {
        const overlay = document.getElementById('battle-overlay');
        overlay.classList.remove('hidden');
        document.getElementById('battle-content').innerHTML = '';
    }

    closeBattle() {
        const overlay = document.getElementById('battle-overlay');
        if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    updateBattleDisplay() {
        const playerUnitsEl = document.getElementById('player-units');
        const enemyUnitsEl = document.getElementById('enemy-units');

        if (!playerUnitsEl || !enemyUnitsEl) return;

        playerUnitsEl.innerHTML = '';
        enemyUnitsEl.innerHTML = '';

        this.playerUnits.forEach((unit, index) => {
            const card = this.createBattleCard(unit, 'player', index);
            if (card) playerUnitsEl.appendChild(card);
        });

        this.enemyUnits.forEach((unit, index) => {
            const card = this.createBattleCard(unit, 'enemy', index);
            if (card) enemyUnitsEl.appendChild(card);
        });
    }

    createBattleCard(unit, side, index) {
        if (!unit || unit.hp === undefined) return null;

        const card = document.createElement('div');
        card.className = `unit-card battlefield-card`;
        card.id = `${side}-unit-${index}`;
        
        // 如果是Boss单位，添加特殊样式
        if (unit.isBoss) {
            card.classList.add('boss-unit');
        }

        const starSymbols = '★'.repeat(unit.star || 1);
        const hpPercent = Math.max(0, (unit.hp / unit.maxHp) * 100);

        card.innerHTML = `
            <div class="star">${starSymbols}</div>
            <img class="avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='73' height='50'%3E%3Crect fill='%23${this.getStarColor(unit.star)}' width='73' height='50'/%3E%3Ctext x='36' y='30' text-anchor='middle' fill='white' font-size='10'%3E${unit.star || 1}★%3C/text%3E%3C/svg%3E" alt="${unit.name || '未知'}">
            <div class="name">${unit.name || '未知'}</div>
            <div class="stats">
                <span class="hp">❤${Math.max(0, unit.hp)}/${unit.maxHp}</span>
                <span class="atk">⚔${unit.atk || 0}</span>
            </div>
            <div class="hp-bar" style="width: 100%; height: 3px; background: #4a5568; border-radius: 2px; margin-top: 3px;">
                <div style="width: ${hpPercent}%; height: 100%; background: ${hpPercent > 50 ? '#48bb78' : hpPercent > 25 ? '#f6e05e' : '#fc8181'}; border-radius: 2px;"></div>
            </div>
        `;

        if (unit.hp <= 0) {
            card.classList.add('dead-unit');
        }

        return card;
    }

    getStarColor(star) {
        const colors = { 1: '4299e1', 2: '9f7aea', 3: 'f6e05e' };
        return colors[star] || '718096';
    }

    async executeBattle() {
        const maxTurns = 50;
        let turn = 0;

        while (turn < maxTurns) {
            if (!this.isRunning) return;

            turn++;

            const playerAlive = this.getAliveUnits(this.playerUnits);
            const enemyAlive = this.getAliveUnits(this.enemyUnits);

            console.log(`第${turn}回合: 我方存活${playerAlive.length}, 敌方存活${enemyAlive.length}`);

            if (playerAlive.length === 0 || enemyAlive.length === 0) {
                break;
            }

            this.battleLog.push(`═══ 第 ${turn} 回合 ═══`);
            this.updateBattleLog();
            this.updateBattleStatus();

            await this.executeTurn(playerAlive, enemyAlive);

            if (!this.isRunning) return;

            this.processPassiveSkills();

            this.updateBattleDisplay();
            this.updateBattleStatus();

            await this.delay(this.getScaledDelay(150));

            const pAlive = this.getAliveUnits(this.playerUnits);
            const eAlive = this.getAliveUnits(this.enemyUnits);

            if (pAlive.length === 0 || eAlive.length === 0) {
                break;
            }
        }
    }

    updateBattleStatus() {
        const playerAlive = this.getAliveUnits(this.playerUnits);
        const enemyAlive = this.getAliveUnits(this.enemyUnits);

        const statusEl = document.getElementById('battle-status');
        if (statusEl) {
            statusEl.innerHTML = `
                <span style="color:#48bb78">我方存活: ${playerAlive.length}</span> |
                <span style="color:#fc8181">敌方存活: ${enemyAlive.length}</span>
            `;
        }
    }

    async executeTurn(playerAlive, enemyAlive) {
        const maxUnits = Math.max(playerAlive.length, enemyAlive.length);

        for (let i = 0; i < maxUnits; i++) {
            if (!this.isRunning) return;

            const currentPlayerAlive = this.getAliveUnits(this.playerUnits);
            const currentEnemyAlive = this.getAliveUnits(this.enemyUnits);

            if (i < currentPlayerAlive.length && currentPlayerAlive[i].hp > 0) {
                await this.performAttack(currentPlayerAlive[i], currentEnemyAlive, 'player');
            }

            if (!this.isRunning) return;

            const afterPlayerAlive = this.getAliveUnits(this.enemyUnits);
            if (afterPlayerAlive.length === 0) break;

            if (i < currentEnemyAlive.length && currentEnemyAlive[i].hp > 0) {
                await this.performAttack(currentEnemyAlive[i], currentPlayerAlive, 'enemy');
            }

            if (this.getAliveUnits(this.playerUnits).length === 0) break;
        }
    }

    async performAttack(attacker, targets, attackerSide) {
        if (!attacker || attacker.hp <= 0) return;
        if (!this.isRunning) return;

        const validTargets = targets.filter(t => t && t.hp > 0);
        if (validTargets.length === 0) return;

        // 随机选择目标前，先验证目标是否仍然存活
        let target = validTargets[Math.floor(Math.random() * validTargets.length)];
        
        // 再次检查目标是否仍然存活，防止在选择和攻击之间被杀死
        if (!target || target.hp <= 0) {
            // 重新获取存活目标
            const stillAliveTargets = targets.filter(t => t && t.hp > 0);
            if (stillAliveTargets.length === 0) return;
            target = stillAliveTargets[Math.floor(Math.random() * stillAliveTargets.length)];
        }

        this.battleLog.push(`<span style="color:${attackerSide === 'player' ? '#48bb78' : '#fc8181'}">◆</span> <strong>${attacker.name}</strong> 攻击 <strong>${target.name}</strong>`);
        this.updateBattleLog();

        const attackerUnits = attackerSide === 'player' ? this.playerUnits : this.enemyUnits;
        const attackerIndex = attackerUnits.findIndex(u => u && u.id === attacker.id);
        const targetUnits = attackerSide === 'player' ? this.enemyUnits : this.playerUnits;
        const targetIndex = targetUnits.findIndex(u => u && u.id === target.id);

        const attackerElement = document.getElementById(`${attackerSide}-unit-${attackerIndex}`);
        const targetElement = document.getElementById(`${attackerSide === 'player' ? 'enemy' : 'player'}-unit-${targetIndex}`);

        this.highlightUnit(attackerSide, attacker, true);
        await this.delay(this.getScaledDelay(this.animationSpeed));

        if (!this.isRunning) return;

        if (attackerElement && targetElement) {
            await this.performPhysicalImpact(attackerElement, targetElement, attackerSide);
        }

        if (!this.isRunning) return;

        const damage = attacker.atk || 0;
        
        // Boss技能调试日志
        if (attacker.isBoss) {
            console.log(`[Battle] 攻击方是Boss - ${attacker.name}`);
            console.log(`[Battle] Boss是否具有主技能: ${attacker.skill ? '是' : '否'}`);
            console.log(`[Battle] Boss主技能key: ${attacker.skillKey}`);
            console.log(`[Battle] 目标: ${target.name}`);
            console.log(`[Battle] 将传递玩家单位给Boss技能处理`);
        }
        
        // 传递玩家单位给Boss，以支持Boss技能 - 如果攻击方是Boss，传递玩家单位
        const playerUnitsToPass = attacker.isBoss ? this.playerUnits : null;
        const result = target.takeDamage(damage, attacker, playerUnitsToPass);

        if (result.blocked) {
            this.battleLog.push(`  <span style="color:#4299e1">◈</span> ${target.name} 免疫伤害！`);
            this.showBlockEffect(target);
        } else {
            this.battleLog.push(`  <span class="damage-number">▷</span> ${target.name} <span class="damage-number">-${result.actualDamage}</span>`);
            this.showDamageEffect(target);
        }
        
        // 处理Boss技能效果
        if (result.bossEffects) {
            if (result.bossEffects.bleeding) {
                const dmg = result.bossEffects.bleeding.damage;
                this.battleLog.push(`  <span style="color:#9b59b6">☠</span> <strong>${target.name}</strong> 的血之诅咒触发！对我方全体造成 <span class="damage-number">-${dmg}</span> 点伤害！`);
                // 显示血之诅咒效果
                this.showBossSkillEffect(target, 'bleeding');
            }
            if (result.bossEffects.revival) {
                const newMaxHp = result.bossEffects.revival.newMaxHp;
                this.battleLog.push(`  <span style="color:#f1c40f">✨</span> <strong>${target.name}</strong> 的回光返照触发！生命上限降低至 ${newMaxHp}，血量已满！`);
                // 显示回光返照效果
                this.showBossSkillEffect(target, 'revival');
            }
        }

        this.showDamageNumber(target, result.actualDamage);
        this.updateBattleDisplay();
        this.updateBattleLog();

        await this.delay(this.getScaledDelay(this.actionDelay));

        this.clearHighlights();
        this.resetCardPositions();
    }

    async performPhysicalImpact(attackerElement, targetElement, attackerSide) {
        const isPlayerAttack = attackerSide === 'player';
        const color = isPlayerAttack ? '#48bb78' : '#fc8181';

        const attackerRect = attackerElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        const containerRect = attackerElement.parentElement.getBoundingClientRect();

        const startX = attackerRect.left - containerRect.left;
        const startY = attackerRect.top - containerRect.top;
        const endX = targetRect.left - containerRect.left + (targetRect.width / 2) - (attackerRect.width / 2);
        const endY = targetRect.top - containerRect.top + (targetRect.height / 2) - (attackerRect.height / 2);
        
        const dx = endX - startX;
        const dy = endY - startY;

        const totalDuration = this.getScaledDelay(this.animationSpeed);

        // 1. 后撤蓄力阶段
        const backOffX = -20 * (isPlayerAttack ? 1 : -1);
        const chargeDuration = totalDuration * 0.3;
        attackerElement.style.transition = `transform ${chargeDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        attackerElement.style.transform = `translate(${backOffX}px, 0) scale(0.95)`;
        attackerElement.style.zIndex = '100';
        attackerElement.style.boxShadow = `0 0 15px ${color}`;

        await this.delay(chargeDuration);

        // 2. 加速前冲阶段
        const rushDuration = totalDuration * 0.25;
        attackerElement.style.transition = `transform ${rushDuration}ms cubic-bezier(0.0, 0.0, 0.2, 1)`;
        attackerElement.style.transform = `translate(${dx + 5}px, ${dy}px) scale(1.2)`;
        attackerElement.style.boxShadow = `0 0 30px ${color}, 0 0 50px ${color}`;

        this.createImpactTrail(attackerElement, startX + backOffX, startY, endX, endY);

        await this.delay(rushDuration);

        // 3. 命中阶段
        const impactDuration = totalDuration * 0.2;
        this.createImpactEffect(targetElement, isPlayerAttack);

        targetElement.classList.add('damage-shake');
        targetElement.style.transition = `transform ${impactDuration}ms ease-out`;
        targetElement.style.transform = `translate(${dx * 0.1}px, ${dy * 0.08}px) scale(1.06)`;

        attackerElement.style.transition = `transform ${impactDuration * 0.5}ms ease-out`;
        attackerElement.style.transform = `translate(${dx * 0.3}px, ${dy * 0.25}px) scale(1.15)`;

        await this.delay(impactDuration);

        // 4. 回弹阶段
        const recoilDuration = totalDuration * 0.4;
        targetElement.style.transition = `transform ${recoilDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        targetElement.style.transform = 'translate(0, 0) scale(1)';

        attackerElement.style.transition = `transform ${recoilDuration * 0.8}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        attackerElement.style.transform = 'translate(0, 0) scale(1)';
        attackerElement.style.boxShadow = '';

        await this.delay(recoilDuration * 0.8);

        // 5. 清理状态
        attackerElement.style.zIndex = '';
        targetElement.classList.remove('damage-shake');
        targetElement.style.transform = '';
        attackerElement.style.transform = '';
        attackerElement.style.boxShadow = '';
    }

    createImpactTrail(attackerElement, startX, startY, endX, endY) {
        const trail = document.createElement('div');
        trail.className = 'impact-trail';
        trail.style.cssText = `
            position: absolute;
            left: ${startX + attackerElement.offsetWidth / 2}px;
            top: ${startY + attackerElement.offsetHeight / 2}px;
            width: 4px;
            height: 4px;
            background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 200, 100, 0.6) 50%, transparent 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 50;
            box-shadow: 0 0 10px rgba(255, 200, 100, 0.8), 0 0 20px rgba(255, 150, 50, 0.5);
        `;

        attackerElement.parentElement.appendChild(trail);

        const dx = endX - startX;
        const dy = endY - startY;
        const steps = 8;

        for (let i = 0; i < steps; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.style.cssText = `
                    position: absolute;
                    left: ${startX + (dx * (i / steps))}px;
                    top: ${startY + (dy * (i / steps))}px;
                    width: ${3 + Math.random() * 3}px;
                    height: ${3 + Math.random() * 3}px;
                    background: rgba(255, 200, 100, ${0.8 - (i / steps) * 0.6});
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 49;
                `;
                attackerElement.parentElement.appendChild(particle);
                setTimeout(() => particle.remove(), 300);
            }, i * 20);
        }

        setTimeout(() => trail.remove(), 500);
    }

    createImpactEffect(targetElement, isPlayerAttack) {
        const colors = isPlayerAttack ? 
            ['#48bb78', '#68d391', '#9ae6b4'] : 
            ['#fc8181', '#f56565', '#feb2b2'];

        const impactBurst = document.createElement('div');
        impactBurst.className = 'impact-burst';
        impactBurst.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 60px;
            height: 60px;
            pointer-events: none;
            z-index: 200;
        `;

        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const particle = document.createElement('div');
            const distance = 30 + Math.random() * 20;
            const size = 4 + Math.random() * 4;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const duration = 200 + Math.random() * 150;

            particle.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border-radius: 50%;
                box-shadow: 0 0 ${size * 2}px ${color};
                animation: burstParticle ${duration}ms ease-out forwards;
                --dx: ${Math.cos(angle) * distance}px;
                --dy: ${Math.sin(angle) * distance}px;
            `;
            impactBurst.appendChild(particle);
        }

        targetElement.appendChild(impactBurst);
        setTimeout(() => impactBurst.remove(), 400);

        const screenFlash = document.createElement('div');
        screenFlash.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle, ${colors[0]}44 0%, transparent 70%);
            pointer-events: none;
            z-index: 150;
            animation: flashPulse 150ms ease-out forwards;
        `;
        targetElement.appendChild(screenFlash);
        setTimeout(() => screenFlash.remove(), 150);
    }

    resetCardPositions() {
        document.querySelectorAll('.battlefield-card').forEach(card => {
            card.style.transition = 'transform 300ms ease-out, box-shadow 300ms ease-out';
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.zIndex = '';
        });
    }

    highlightUnit(side, unit, isAttacking) {
        const units = side === 'player' ? this.playerUnits : this.enemyUnits;
        const index = units.findIndex(u => u && u.id === unit.id);
        const element = document.getElementById(`${side}-unit-${index}`);

        if (element) {
            if (isAttacking) {
                element.style.transform = 'scale(1.15)';
                element.style.boxShadow = `0 0 20px ${side === 'player' ? '#48bb78' : '#fc8181'}`;
                element.style.border = `2px solid ${side === 'player' ? '#48bb78' : '#fc8181'}`;
            } else {
                element.style.transform = 'scale(1.1)';
                element.style.boxShadow = '0 0 15px #f6e05e';
                setTimeout(() => {
                    element.style.transform = '';
                    element.style.boxShadow = '';
                }, this.animationSpeed);
            }
        }
    }

    clearHighlights() {
        document.querySelectorAll('.battlefield-card').forEach(card => {
            card.style.transform = '';
            card.style.boxShadow = '';
            card.style.border = '';
        });
    }

    showAttackEffect(side, unit) {
        const units = side === 'player' ? this.playerUnits : this.enemyUnits;
        const index = units.findIndex(u => u && u.id === unit.id);
        const element = document.getElementById(`${side}-unit-${index}`);

        if (element) {
            const attackEffect = document.createElement('div');
            attackEffect.className = 'attack-effect';
            attackEffect.style.cssText = `
                position: absolute;
                top: 50%;
                left: ${side === 'player' ? '100%' : '-20px'};
                transform: translateY(-50%);
                width: 30px;
                height: 4px;
                background: linear-gradient(to ${side === 'player' ? 'right' : 'left'}, ${side === 'player' ? '#48bb78' : '#fc8181'}, transparent);
                animation: attackSlash 0.3s ease-out forwards;
                border-radius: 2px;
            `;
            element.appendChild(attackEffect);

            setTimeout(() => {
                if (attackEffect.parentNode) {
                    attackEffect.remove();
                }
            }, 300);
        }
    }

    showDamageEffect(unit) {
        const side = this.enemyUnits.find(u => u && u.id === unit.id) ? 'enemy' : 'player';
        const units = side === 'player' ? this.playerUnits : this.enemyUnits;
        const index = units.findIndex(u => u && u.id === unit.id);
        const element = document.getElementById(`${side}-unit-${index}`);

        if (element) {
            element.style.animation = 'shake 0.3s ease-in-out';
            element.style.border = '2px solid #fc8181';
            setTimeout(() => {
                element.style.animation = '';
            }, 300);
        }
    }

    showBlockEffect(unit) {
        const side = this.enemyUnits.find(u => u && u.id === unit.id) ? 'enemy' : 'player';
        const units = side === 'player' ? this.playerUnits : this.enemyUnits;
        const index = units.findIndex(u => u && u.id === unit.id);
        const element = document.getElementById(`${side}-unit-${index}`);

        if (element) {
            const shieldEffect = document.createElement('div');
            shieldEffect.className = 'shield-effect';
            shieldEffect.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 6px;
                background: rgba(66, 153, 225, 0.6);
                animation: shieldFlash 0.5s ease-out forwards;
                pointer-events: none;
            `;
            element.appendChild(shieldEffect);

            setTimeout(() => {
                if (shieldEffect.parentNode) {
                    shieldEffect.remove();
                }
            }, 500);
        }
    }
    
    showBossSkillEffect(unit, skillType) {
        const side = this.enemyUnits.find(u => u && u.id === unit.id) ? 'enemy' : 'player';
        const units = side === 'player' ? this.playerUnits : this.enemyUnits;
        const index = units.findIndex(u => u && u.id === unit.id);
        const element = document.getElementById(`${side}-unit-${index}`);

        if (element) {
            if (skillType === 'bleeding') {
                // 血之诅咒效果
                const bleedingEffect = document.createElement('div');
                bleedingEffect.className = 'boss-skill-effect';
                bleedingEffect.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 6px;
                    background: radial-gradient(circle, rgba(139, 0, 0, 0.7) 0%, transparent 70%);
                    animation: flashPulse 0.5s ease-out forwards;
                    pointer-events: none;
                `;
                element.appendChild(bleedingEffect);
                setTimeout(() => { if (bleedingEffect.parentNode) bleedingEffect.remove(); }, 500);
                
                // 同时对所有玩家单位造成伤害效果
                this.playerUnits.forEach((u, i) => {
                    if (u && u.hp >= 0) {
                        const playerElement = document.getElementById(`player-unit-${i}`);
                        if (playerElement) {
                            playerElement.style.animation = 'shake 0.3s ease-in-out';
                            setTimeout(() => { playerElement.style.animation = ''; }, 300);
                        }
                    }
                });
            } else if (skillType === 'revival') {
                // 回光返照效果
                const revivalEffect = document.createElement('div');
                revivalEffect.className = 'boss-skill-effect';
                revivalEffect.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-radius: 6px;
                    background: radial-gradient(circle, rgba(241, 196, 15, 0.8) 0%, transparent 70%);
                    animation: flashPulse 0.8s ease-out forwards;
                    pointer-events: none;
                `;
                element.appendChild(revivalEffect);
                setTimeout(() => { if (revivalEffect.parentNode) revivalEffect.remove(); }, 800);
            }
        }
    }

    showDamageNumber(target, damage) {
        const units = this.enemyUnits.find(u => u && u.id === target.id) ? this.enemyUnits : this.playerUnits;
        const side = this.enemyUnits.find(u => u && u.id === target.id) ? 'enemy' : 'player';
        const index = units.findIndex(u => u && u.id === target.id);
        const element = document.getElementById(`${side}-unit-${index}`);

        if (element) {
            if (target.hp <= 0) {
                element.classList.add('dead-unit');
            }

            const damageEl = document.createElement('div');
            damageEl.style.cssText = `
                position: absolute;
                top: 5px;
                left: 50%;
                transform: translateX(-50%);
                color: ${damage > 0 ? '#fc8181' : '#48bb78'};
                font-size: 16px;
                font-weight: bold;
                animation: floatUp 0.8s forwards;
                pointer-events: none;
            `;
            damageEl.textContent = damage > 0 ? `-${damage}` : `+${Math.abs(damage)}`;
            element.appendChild(damageEl);

            setTimeout(() => {
                if (damageEl.parentNode) {
                    damageEl.remove();
                }
            }, 800);
        }
    }

    processPassiveSkills() {
        this.playerUnits.forEach(unit => {
            if (unit && unit.hp > 0 && unit.skill) {
                this.processSkill(unit, this.playerUnits, 'player');
            }
        });

        this.enemyUnits.forEach(unit => {
            if (unit && unit.hp > 0 && unit.skill) {
                this.processSkill(unit, this.enemyUnits, 'enemy');
            }
        });
    }

    processSkill(unit, allies, side) {
        const skillName = unit.skill;
        let skillActivated = false;

        switch (skillName) {
            case '生命恢复':
                allies.forEach(ally => {
                    if (ally && ally.hp > 0 && ally.hp < ally.maxHp) {
                        const heal = Math.floor(ally.maxHp * 0.1);
                        ally.hp = Math.min(ally.maxHp, ally.hp + heal);
                        this.battleLog.push(`  <span style="color:#f6e05e">★</span> ${unit.name}: ${ally.name} +${heal}`);
                        skillActivated = true;
                    }
                });
                break;

            case '护盾':
                unit.status.shield = 1;
                this.battleLog.push(`  <span style="color:#4299e1">★</span> ${unit.name} 获得护盾`);
                skillActivated = true;
                break;

            case '全体攻击':
                const enemies = side === 'player' ? this.enemyUnits : this.playerUnits;
                enemies.forEach(enemy => {
                    if (enemy && enemy.hp > 0) {
                        const damage = Math.floor(unit.atk * 0.5);
                        enemy.takeDamage(damage);
                        this.battleLog.push(`  <span style="color:#fc8181">★</span> ${unit.name} 溅射 ${enemy.name} -${damage}`);
                        skillActivated = true;
                    }
                });
                break;

            case '治疗结界':
                allies.forEach(ally => {
                    if (ally && ally.hp > 0) {
                        const heal = Math.floor(ally.maxHp * 0.05);
                        ally.hp = Math.min(ally.maxHp, ally.hp + heal);
                    }
                });
                this.battleLog.push(`  <span style="color:#48bb78">★</span> ${unit.name} 结界生效`);
                skillActivated = true;
                break;

            case '攻击提升':
                unit.atk += 5;
                this.battleLog.push(`  <span style="color:#f6e05e">★</span> ${unit.name} 攻击力+5`);
                skillActivated = true;
                break;

            case '暴击':
            case '连击':
            case '反击':
                skillActivated = true;
                break;
        }

        if (skillActivated) {
            this.updateBattleLog();
        }
    }

    getAliveUnits(units) {
        return units.filter(u => u && u.hp > 0);
    }

    determineWinner() {
        const playerAlive = this.getAliveUnits(this.playerUnits);
        const enemyAlive = this.getAliveUnits(this.enemyUnits);

        let resultText;
        let damageToEnemy = 0;

        if (playerAlive.length > 0 && enemyAlive.length === 0) {
            resultText = '胜利！';
            const starSum = playerAlive.reduce((sum, u) => sum + (u.star || 1), 0);
            damageToEnemy = starSum;
        } else if (enemyAlive.length > 0 && playerAlive.length === 0) {
            resultText = '失败';
        } else {
            resultText = '平局';
        }

        this.battleLog.push('');
        this.battleLog.push(`========== ${resultText} ==========`);
        if (damageToEnemy > 0) {
            this.battleLog.push(`对敌方英雄造成 ${damageToEnemy} 点伤害`);
        }
        this.updateBattleLog();

        this.closeBattle();

        if (window.game && typeof window.game.endRound === 'function') {
            window.game.endRound(
                resultText === '胜利！' ? 'win' : resultText === '失败' ? 'lose' : 'draw',
                damageToEnemy
            );
        }
    }

    updateBattleLog() {
        const content = document.getElementById('battle-content');
        if (content) {
            content.innerHTML = this.battleLog.map(entry =>
                `<div class="battle-entry">${entry}</div>`
            ).join('');
            content.scrollTop = content.scrollHeight;
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

window.Battle = Battle;
