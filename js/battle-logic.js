/**
 * 战斗逻辑模块
 * 联合演习 - 回合制自走棋
 * 
 * 包含所有战斗相关的功能
 */

class BattleLogic {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.battleSpeed = 1;
        this.baseAnimationTime = 400;
    }

    /**
     * 开始战斗
     */
    startBattle() {
        console.log('========================================');
        console.log('[Battle] startBattle() 被调用');
        console.log(`[Battle] 当前战场棋子数: ${this.game.state.battlefield.length}`);
        
        if (this.game.state.battlefield.length === 0) {
            console.warn('[Battle] 战场为空，无法开始战斗');
            alert('请至少上阵一个棋子！');
            return;
        }

        console.log('[Battle] 战场检查通过，开始战斗流程...');
        this.game.state.isBattleMode = true;
        
        console.log('[Battle] 生成敌方队伍...');
        this.generateEnemy();
        
        console.log(`[Battle] 敌方英雄: ${this.game.state.enemyHero?.name || '未知'}`);
        console.log(`[Battle] 敌方棋子数: ${this.game.state.enemyBattlefield.length}`);

        const enemyNameEl = document.getElementById('enemy-name');
        if (enemyNameEl) {
            enemyNameEl.textContent = `${this.game.state.enemyHero.name} (${ENEMY_PRESETS[Math.min(5, Math.ceil(this.game.state.round / 4))].name})`;
            console.log(`[Battle] 更新敌方名称: ${enemyNameEl.textContent}`);
        }
        
        if (this.game.state.isBossBattle && this.game.state.currentBossInfo && typeof bossManager !== 'undefined') {
            console.log('[Battle] 检测到Boss战，显示Boss介绍弹窗');
            bossManager.showBossIntro(this.game.state.currentBossInfo, () => {
                console.log('[Battle] Boss介绍弹窗关闭，开始战斗');
                console.log('[Battle] 调用 startNewBattleScene()...');
                this.startNewBattleScene();
            });
        } else {
            console.log('[Battle] 调用 startNewBattleScene()...');
            this.startNewBattleScene();
        }
        
        console.log('========================================');
    }

    /**
     * 生成敌方队伍
     */
    generateEnemy() {
        console.log('[GenerateEnemy] generateEnemy() 被调用');
        console.log(`[GenerateEnemy] 当前回合: ${this.game.state.round}`);
        
        const enemyData = this.game.chessManager.getEnemyByRound(this.game.state.round);
        
        console.log('[GenerateEnemy] 获取敌方数据:', JSON.stringify({
            heroName: enemyData.hero?.name,
            teamSize: enemyData.team?.length,
            isBoss: enemyData.isBoss || false
        }));
        
        this.game.state.enemyBattlefield = enemyData.team;
        this.game.state.enemyHero = enemyData.hero;
        this.game.state.currentBossInfo = enemyData.bossInfo || null;
        this.game.state.isBossBattle = enemyData.isBoss || false;
        
        console.log(`[GenerateEnemy] 敌方队伍生成完成，共 ${this.game.state.enemyBattlefield.length} 个棋子`);
        console.log(`[GenerateEnemy] 敌方英雄: ${this.game.state.enemyHero.name}`);
        if (this.game.state.isBossBattle) {
            console.log(`[GenerateEnemy] 这是Boss战！Boss: ${this.game.state.currentBossInfo?.name}`);
        }
    }

    /**
     * 启动新战斗场景
     */
    startNewBattleScene() {
        console.log('[BattleScene] startNewBattleScene() 被调用');
        
        if (window.battleSceneSystem) {
            console.log('[BattleScene] BattleSceneSystem 已初始化');
            
            console.log('[BattleScene] 清空所有卡槽...');
            window.battleSceneSystem.clearAllSlots();

            console.log('[BattleScene] 显示战斗场景...');
            window.battleSceneSystem.showBattleScene();
            window.battleSceneSystem.updateStatus('战斗准备中...');

            console.log('[BattleScene] 准备我方角色数据...');
            const playerCards = this.game.state.battlefield.map(chess => ({
                id: chess.id,
                name: chess.name,
                hp: chess.hp,
                atk: chess.atk,
                stars: chess.star || 1
            }));
            console.log(`[BattleScene] 我方棋子数量: ${playerCards.length}`);

            console.log('[BattleScene] 准备敌方角色数据...');
            const enemyCards = this.game.state.enemyBattlefield.map(chess => ({
                id: chess.id,
                name: chess.name,
                hp: chess.hp,
                atk: chess.atk,
                stars: chess.star || 1
            }));
            console.log(`[BattleScene] 敌方棋子数量: ${enemyCards.length}`);

            console.log('[BattleScene] 延迟500ms后放置角色...');
            setTimeout(() => {
                console.log('[BattleScene] 执行角色放置...');
                window.battleSceneSystem.placeCardsInOrder('player', playerCards);
                window.battleSceneSystem.placeCardsInOrder('enemy', enemyCards);

                console.log('[BattleScene] 延迟300ms后初始化卡槽坐标...');
                setTimeout(() => {
                    console.log('[BattleScene] 初始化卡槽坐标系统...');
                    this.game.initializeSlotCoordinates();
                }, 300);
            }, 500);

            console.log('[BattleScene] 延迟2000ms后开始战斗...');
            setTimeout(() => {
                console.log('[BattleScene] 战斗开始!');
                window.battleSceneSystem.updateStatus('⚔️ 战斗中...');

                setTimeout(() => {
                    console.log('[BattleScene] 调用 executeBattleWithNewScene()...');
                    this.executeBattleWithNewScene();
                }, 1000);
            }, 2000);
        } else {
            console.error('[BattleScene] 错误: BattleSceneSystem 未初始化!');
            console.warn('[BattleScene] 回退到旧系统...');
            const battle = new Battle(this.game.state.battlefield, this.game.state.enemyBattlefield);
            battle.start();
        }
    }

    /**
     * 在新战斗场景中执行战斗
     */
    async executeBattleWithNewScene() {
        console.log('[BattleLogic] executeBattleWithNewScene() 被调用');
        
        const placementOrder = [
            {row: 1, slot: 1},
            {row: 1, slot: 2},
            {row: 1, slot: 3},
            {row: 2, slot: 1},
            {row: 2, slot: 2},
            {row: 2, slot: 3},
            {row: 2, slot: 4}
        ];
        
        const getSlotPosition = (index) => {
            return placementOrder[index] || {row: 1, slot: 1};
        };
        
        const playerUnits = this.game.state.battlefield.map((u, index) => {
            const cloned = this.game.cloneChessUnit(u);
            const pos = getSlotPosition(index);
            cloned.battlePosition = { side: 'player', ...pos };
            console.log(`[BattleLogic] 我方棋子 ${cloned.name} 设置位置: player, row=${pos.row}, slot=${pos.slot}`);
            return cloned;
        });
        
        const enemyUnits = this.game.state.enemyBattlefield.map((u, index) => {
            const cloned = this.game.cloneChessUnit(u);
            const pos = getSlotPosition(index);
            cloned.battlePosition = { side: 'enemy', ...pos };
            console.log(`[BattleLogic] 敌方棋子 ${cloned.name} 设置位置: enemy, row=${pos.row}, slot=${pos.slot}`);
            return cloned;
        });
        
        console.log(`[BattleLogic] 我方单位数: ${playerUnits.length}, 敌方单位数: ${enemyUnits.length}`);

        const processBattleStartSkills = async () => {
            console.log('[BattleLogic] 处理开战技能...');
            
            for (let i = 0; i < playerUnits.length; i++) {
                const unit = playerUnits[i];
                if (unit && unit.hp > 0 && unit.skill) {
                    const triggers = Array.isArray(unit.skill.trigger) ? unit.skill.trigger : [unit.skill.trigger];
                    if (triggers.includes('on_battle_start')) {
                        console.log(`[BattleLogic] 我方 ${unit.name} 开战技能触发: ${unit.skill.name}`);
                        const result = unit.skill.effect(unit, 'on_battle_start', { isGold: unit.isMerged }, playerUnits, playerUnits);
                        if (result) {
                            const pos = getSlotPosition(i);
                            unit.showSkillHintOnCard('player', pos.row, pos.slot, unit.skill.name, '#48bb78', unit.skill.icon);
                            await new Promise(resolve => setTimeout(resolve, 300));
                        }
                    }
                }
            }
            
            for (let i = 0; i < enemyUnits.length; i++) {
                const unit = enemyUnits[i];
                if (unit && unit.hp > 0 && unit.skill) {
                    const triggers = Array.isArray(unit.skill.trigger) ? unit.skill.trigger : [unit.skill.trigger];
                    if (triggers.includes('on_battle_start')) {
                        console.log(`[BattleLogic] 敌方 ${unit.name} 开战技能触发: ${unit.skill.name}`);
                        const result = unit.skill.effect(unit, 'on_battle_start', { isGold: false }, enemyUnits, enemyUnits);
                        if (result) {
                            const pos = getSlotPosition(i);
                            unit.showSkillHintOnCard('enemy', pos.row, pos.slot, unit.skill.name, '#fc8181', unit.skill.icon);
                            await new Promise(resolve => setTimeout(resolve, 300));
                        }
                    }
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
        };

        const getAlive = (units) => units.filter(u => u && u.hp > 0);

        let turn = 0;
        const maxTurns = 50;
        
        this.battleSpeed = this.battleSpeed || 1;
        console.log(`[BattleLogic] 当前战斗速度: ${this.battleSpeed}x`);

        const animatePhysicalImpact = async (attackerSide, attackerIndex, targetSide, targetIndex) => {
            if (!window.battleSceneSystem) return;
            
            const attackerPos = getSlotPosition(attackerIndex);
            const targetPos = getSlotPosition(targetIndex);
            
            const attackerSlot = document.querySelector(
                `.scene-card-slot[data-side="${attackerSide}"][data-row="${attackerPos.row}"][data-slot="${attackerPos.slot}"]`
            );
            const targetSlot = document.querySelector(
                `.scene-card-slot[data-side="${targetSide}"][data-row="${targetPos.row}"][data-slot="${targetPos.slot}"]`
            );
            
            if (!attackerSlot || !targetSlot) return;
            
            const attackerRect = attackerSlot.getBoundingClientRect();
            const targetRect = targetSlot.getBoundingClientRect();
            
            const attackerCenterX = attackerRect.left + attackerRect.width / 2;
            const attackerCenterY = attackerRect.top + attackerRect.height / 2;
            const targetCenterX = targetRect.left + targetRect.width / 2;
            const targetCenterY = targetRect.top + targetRect.height / 2;
            
            const direction = attackerSide === 'player' ? 1 : -1;
            const color = attackerSide === 'player' ? '#48bb78' : '#fc8181';
            
            const baseDelay = this.baseAnimationTime / this.battleSpeed;
            
            const distanceX = targetCenterX - attackerCenterX;
            const distanceY = targetCenterY - attackerCenterY;
            const totalDistance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
            
            const backOffDistance = 35;
            const rushOvershoot = totalDistance * 0.12;
            
            const backOffRatio = backOffDistance / totalDistance;
            const rushEndRatio = 0.95;
            const impactRatio = 1 + (rushOvershoot / totalDistance);
            
            const backOffX = -distanceX * backOffRatio;
            const backOffY = -distanceY * backOffRatio;
            
            const rushEndX = distanceX * rushEndRatio;
            const rushEndY = distanceY * rushEndRatio;
            
            const impactX = distanceX * impactRatio;
            const impactY = distanceY * impactRatio;
            
            const targetRecoilX = distanceX * 0.08;
            const targetRecoilY = distanceY * 0.06;
            
            attackerSlot.style.transformOrigin = 'center center';
            attackerSlot.style.willChange = 'transform';
            attackerSlot.style.zIndex = '999';
            
            await new Promise(resolve => setTimeout(resolve, 10));
            
            attackerSlot.style.transition = `transform ${baseDelay * 0.35}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            attackerSlot.style.transform = `translate(${backOffX}px, ${backOffY}px) scale(0.92)`;
            attackerSlot.style.boxShadow = `0 0 20px ${color}`;
            
            await new Promise(resolve => setTimeout(resolve, baseDelay * 0.35));
            
            attackerSlot.style.transition = `transform ${baseDelay * 0.3}ms cubic-bezier(0.1, 0.8, 0.2, 1)`;
            attackerSlot.style.transform = `translate(${rushEndX}px, ${rushEndY}px) scale(1.2)`;
            attackerSlot.style.boxShadow = `0 0 40px ${color}, 0 0 60px ${color}`;
            
            await new Promise(resolve => setTimeout(resolve, baseDelay * 0.2));
            
            targetSlot.classList.add('damage-shake');
            targetSlot.style.transition = `transform ${baseDelay * 0.15}ms ease-out`;
            targetSlot.style.transform = `translate(${targetRecoilX}px, ${targetRecoilY}px) scale(1.08)`;
            
            attackerSlot.style.transition = `transform ${baseDelay * 0.1}ms ease-out`;
            attackerSlot.style.transform = `translate(${impactX}px, ${impactY}px) scale(1.15)`;
            
            await new Promise(resolve => setTimeout(resolve, baseDelay * 0.2));
            
            targetSlot.style.transition = `transform ${baseDelay * 0.4}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            targetSlot.style.transform = 'translate(0, 0) scale(1)';
            
            attackerSlot.style.transition = `transform ${baseDelay * 0.45}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            attackerSlot.style.transform = 'translate(0, 0) scale(1)';
            attackerSlot.style.boxShadow = '';
            
            await new Promise(resolve => setTimeout(resolve, baseDelay * 0.45));
            
            targetSlot.classList.remove('damage-shake');
            targetSlot.style.transform = '';
            attackerSlot.style.transform = '';
            attackerSlot.style.boxShadow = '';
            attackerSlot.style.willChange = 'auto';
            targetSlot.style.willChange = 'auto';
        };

        const showDamage = async (side, index, damage, attackerSide, attackerIndex) => {
            if (!window.battleSceneSystem) return;
            
            const pos = getSlotPosition(index);
            await animatePhysicalImpact(attackerSide, attackerIndex, side, index);
            await new Promise(resolve => setTimeout(resolve, 100 / this.battleSpeed));
            window.battleSceneSystem.showDamageNumber(side, pos.row, pos.slot, damage);
        };

        const executeTurnAsync = async () => {
            console.log(`[BattleLogic] 第 ${turn + 1} 回合开始`);

            if (turn >= maxTurns) {
                console.log('[BattleLogic] 达到最大回合数，结束战斗');
                finishBattleWithNewScene(playerUnits, enemyUnits);
                return;
            }

            turn++;
            const playerAlive = getAlive(playerUnits);
            const enemyAlive = getAlive(enemyUnits);

            console.log(`[BattleLogic] 存活 - 我方: ${playerAlive.length}, 敌方: ${enemyAlive.length}`);

            if (playerAlive.length === 0 || enemyAlive.length === 0) {
                console.log('[BattleLogic] 一方全部阵亡，结束战斗');
                finishBattleWithNewScene(playerUnits, enemyUnits);
                return;
            }

            for (let i = 0; i < Math.max(playerAlive.length, enemyAlive.length); i++) {
                if (i < playerAlive.length && playerAlive[i].hp > 0) {
                    const attacker = playerAlive[i];
                    const validTargets = enemyAlive.filter(t => t.hp > 0);
                    if (validTargets.length > 0) {
                        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                        const damage = attacker.atk || 0;
                        const originalTargetHp = target.hp;
                        const willDie = originalTargetHp <= damage;
                        
                        const playerUnitsForBoss = target.isBoss ? playerUnits : null;
                        const attackResult = target.takeDamage(damage, attacker, playerUnitsForBoss);
                        
                        const attackerIndex = playerUnits.indexOf(attacker);
                        const targetIndex = enemyUnits.indexOf(target);
                        if (attackerIndex !== -1 && targetIndex !== -1) {
                            await showDamage('enemy', targetIndex, attackResult.actualDamage, 'player', attackerIndex);
                        }
                        
                        if (attackResult.bossEffects) {
                            if (attackResult.bossEffects.bleeding) {
                                const pos = getSlotPosition(targetIndex);
                                target.showSkillHintOnCard('enemy', pos.row, pos.slot, '血之诅咒', '#9c27b0', '💢');
                                for (let j = 0; j < playerUnits.length; j++) {
                                    if (playerUnits[j].hp > 0) {
                                        const playerPos = getSlotPosition(j);
                                        setTimeout(() => {
                                            window.battleSceneSystem.showDamageNumber('player', playerPos.row, playerPos.slot, attackResult.bossEffects.bleeding.damage);
                                        }, 300 * j);
                                    }
                                }
                            }
                            if (attackResult.bossEffects.revival) {
                                const pos = getSlotPosition(targetIndex);
                                target.showSkillHintOnCard('enemy', pos.row, pos.slot, '回光返照', '#ff9800', '✨');
                            }
                        }

                        updateBattleSceneCards('player', playerUnits);
                        updateBattleSceneCards('enemy', enemyUnits);

                        if (!willDie && target.hp < originalTargetHp && target.skill) {
                            const triggers = Array.isArray(target.skill.trigger) ? target.skill.trigger : [target.skill.trigger];
                            if (triggers.includes('on_damage_taken')) {
                                const skillResult = target.triggerSkillEffect('on_damage_taken', { isGold: target.isMerged });
                                if (skillResult) {
                                    this.game.showBattleSkillSubtitle(target, skillResult, 'enemy', targetIndex);
                                    updateBattleSceneCards('enemy', enemyUnits);
                                }
                            }
                        }
                    }
                }

                if (i < enemyAlive.length && enemyAlive[i].hp > 0) {
                    const attacker = enemyAlive[i];
                    const validTargets = playerAlive.filter(t => t.hp > 0);
                    if (validTargets.length > 0) {
                        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
                        const damage = attacker.atk || 0;
                        const originalTargetHp = target.hp;
                        const willDie = originalTargetHp <= damage;
                        
                        const playerUnitsForBoss = attacker.isBoss ? playerUnits : null;
                        const attackResult = target.takeDamage(damage, attacker, playerUnitsForBoss);
                        
                        const attackerIndex = enemyUnits.indexOf(attacker);
                        const targetIndex = playerUnits.indexOf(target);
                        if (attackerIndex !== -1 && targetIndex !== -1) {
                            await showDamage('player', targetIndex, attackResult.actualDamage, 'enemy', attackerIndex);
                        }
                        
                        if (attacker.isBoss && attackResult.bossEffects) {
                            if (attackResult.bossEffects.bleeding) {
                                const bossPos = getSlotPosition(attackerIndex);
                                attacker.showSkillHintOnCard('enemy', bossPos.row, bossPos.slot, '血之诅咒', '#9c27b0', '💢');
                                for (let j = 0; j < playerUnits.length; j++) {
                                    if (playerUnits[j].hp > 0) {
                                        const playerPos = getSlotPosition(j);
                                        setTimeout(() => {
                                            window.battleSceneSystem.showDamageNumber('player', playerPos.row, playerPos.slot, attackResult.bossEffects.bleeding.damage);
                                        }, 300 * j);
                                    }
                                }
                            }
                            if (attackResult.bossEffects.revival) {
                                const bossPos = getSlotPosition(attackerIndex);
                                attacker.showSkillHintOnCard('enemy', bossPos.row, bossPos.slot, '回光返照', '#ff9800', '✨');
                            }
                        }

                        updateBattleSceneCards('player', playerUnits);
                        updateBattleSceneCards('enemy', enemyUnits);

                        if (!willDie && target.hp < originalTargetHp && target.skill) {
                            const triggers = Array.isArray(target.skill.trigger) ? target.skill.trigger : [target.skill.trigger];
                            if (triggers.includes('on_damage_taken')) {
                                const skillResult = target.triggerSkillEffect('on_damage_taken', { isGold: target.isMerged });
                                if (skillResult) {
                                    this.game.showBattleSkillSubtitle(target, skillResult, 'player', targetIndex);
                                    updateBattleSceneCards('player', playerUnits);
                                }
                            }
                        }
                    }
                }
            }

            updateBattleSceneCards('player', playerUnits);
            updateBattleSceneCards('enemy', enemyUnits);

            await new Promise(resolve => setTimeout(resolve, 1200 / this.battleSpeed));
            executeTurnAsync();
        };

        const updateBattleSceneCards = (side, units) => {
            if (!window.battleSceneSystem) return;

            units.forEach((unit, index) => {
                const pos = getSlotPosition(index);
                const slotElement = document.querySelector(
                    `.scene-card-slot[data-side="${side}"][data-row="${pos.row}"][data-slot="${pos.slot}"]`
                );
                if (slotElement && !slotElement.classList.contains('empty')) {
                    const hpEl = slotElement.querySelector('.card-hp');
                    const atkEl = slotElement.querySelector('.card-atk');
                    const hpBar = slotElement.querySelector('.hp-bar-fill');
                    const hpBarText = slotElement.querySelector('.hp-bar-text');

                    if (hpEl) hpEl.textContent = `${Math.max(0, unit.hp)}`;
                    if (atkEl) atkEl.textContent = `${unit.atk}`;

                    if (hpBar && hpBarText) {
                        const maxHp = unit.maxHp || unit.hp;
                        const hpPercent = Math.max(0, Math.min(100, (unit.hp / maxHp) * 100));
                        hpBar.style.width = `${hpPercent}%`;
                        hpBarText.textContent = `${Math.max(0, unit.hp)}/${maxHp}`;

                        if (hpPercent <= 25) {
                            hpBar.style.background = 'linear-gradient(90deg, #fc8181, #f56565)';
                        } else if (hpPercent <= 50) {
                            hpBar.style.background = 'linear-gradient(90deg, #f6e05e, #ecc94b)';
                        } else {
                            hpBar.style.background = 'linear-gradient(90deg, #68d391, #48bb78)';
                        }
                    }

                    if (unit.hp <= 0) {
                        slotElement.classList.add('dead-unit');
                        slotElement.style.opacity = '0.4';
                    }
                }
            });
        };

        const finishBattleWithNewScene = (playerUnits, enemyUnits) => {
            console.log('[BattleResult] finishBattleWithNewScene() 被调用');
            
            const playerAlive = playerUnits.filter(u => u && u.hp > 0);
            const enemyAlive = enemyUnits.filter(u => u && u.hp > 0);

            console.log(`[BattleResult] 战斗结束 - 我方存活: ${playerAlive.length}, 敌方存活: ${enemyAlive.length}`);

            let result, damageToEnemy;

            if (playerAlive.length > 0 && enemyAlive.length === 0) {
                result = 'win';
                const starSum = playerAlive.reduce((sum, u) => sum + (u.star || 1), 0);
                damageToEnemy = starSum;
                
                console.log(`[BattleResult] 胜利! 造成 ${damageToEnemy} 点伤害`);
                
                if (window.battleSceneSystem) {
                    window.battleSceneSystem.updateStatus('🏆 战斗胜利');
                }
            } else if (enemyAlive.length > 0 && playerAlive.length === 0) {
                result = 'lose';
                damageToEnemy = 0;
                
                console.log('[BattleResult] 失败');
                
                if (window.battleSceneSystem) {
                    window.battleSceneSystem.updateStatus('💀 战斗失败');
                }
            } else {
                result = 'draw';
                damageToEnemy = 0;
                
                console.log('[BattleResult] 平局');
                
                if (window.battleSceneSystem) {
                    window.battleSceneSystem.updateStatus('⚖️ 战斗平局');
                }
            }

            console.log('[BattleResult] 延迟3秒后关闭战斗场景...');
            setTimeout(() => {
                console.log('[BattleResult] 执行 exitBattleScene()...');
                if (window.battleSceneSystem) {
                    window.battleSceneSystem.exitBattleScene();
                }
                console.log('[BattleResult] 调用 endRound()...');
                this.game.endRound(result, damageToEnemy);
            }, 3000);
        };

        console.log('[BattleLogic] 开始执行战斗...');
        await processBattleStartSkills();
        executeTurnAsync();
    }

    /**
     * 设置战斗速度
     */
    setBattleSpeed(speed) {
        this.battleSpeed = speed;
        console.log(`[BattleLogic] 战斗速度已设置为: ${speed}x`);
        
        if (window.Battle && window.Battle.speedMultiplier !== undefined) {
            window.Battle.speedMultiplier = speed;
        }
        
        document.querySelectorAll('.battle-speed-btn').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
        });
    }

    /**
     * 关闭战斗
     */
    closeBattle() {
        console.log('[BattleLogic] closeBattle() 被调用');
        document.getElementById('battle-overlay').classList.add('hidden');
        this.game.state.isBattleMode = false;
        console.log('[BattleLogic] 战斗界面已关闭');
    }
}

window.BattleLogic = BattleLogic;
