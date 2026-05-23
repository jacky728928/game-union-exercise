/**
 * 棋子与棋子管理器
 * 联合演习 - 回合制自走棋
 * 
 * 包含ChessUnit类和ChessManager类
 * 负责棋子创建、管理、合成等功能
 */

class ChessUnit {
    constructor(data) {
        // 如果提供了data.id，直接使用，否则生成新ID
        if (data.id) {
            this.id = data.id;
        } else {
            this.id = (data.name || 'unknown') + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        this.baseId = data.baseId || (data.name ? data.name.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]/g, '') : 'unknown');
        this.name = data.name;
        this.star = data.star;
        this.hp = data.hp;
        this.maxHp = data.maxHp || data.hp;
        this.atk = data.atk;
        this.skillKey = data.skillKey || data.skill;
        this.skill = this.getSkillInfo();
        this.camp = data.camp;
        this.isMerged = data.isMerged || false;
        // 标记是否是Boss
        this.isBoss = data.isBoss || false;
        // Boss 的二级技能
        this.secondarySkillKey = data.secondarySkillKey || null;
        this.secondarySkill = this.getSecondarySkillInfo();
        // Boss 回光返照技能是否已使用
        this.revivalUsed = data.revivalUsed !== undefined ? data.revivalUsed : false;
        // 记录Boss 已损失的10%血量段数
        this.hpLossSegments = data.hpLossSegments !== undefined ? data.hpLossSegments : 0;
        // 如果提供了battlePosition，直接设置
        this.battlePosition = data.battlePosition || null;
        this.status = {
            shield: 0,
            buffAtk: 0,
            debuffDef: 0,
            canAttack: true,
            isDead: false,
            dodgeSuccess: false,
            nextCrit: false
        };

        console.log(`[ChessUnit] 创建棋子: ${this.name} (${this.star}星), isMerged: ${this.isMerged}, skill: ${this.skill?.name || '无'}, id: ${this.id}`);
    }

    getSkillInfo() {
        if (this.skillKey && SKILL_DEFINITIONS[this.skillKey]) {
            return {
                ...SKILL_DEFINITIONS[this.skillKey],
                key: this.skillKey
            };
        }
        return null;
    }

    getSecondarySkillInfo() {
        if (this.secondarySkillKey && SKILL_DEFINITIONS[this.secondarySkillKey]) {
            return {
                ...SKILL_DEFINITIONS[this.secondarySkillKey],
                key: this.secondarySkillKey
            };
        }
        return null;
    }

    takeDamage(damage, attacker = null, playerUnits = null) {
        if (this.status.shield > 0) {
            this.status.shield--;
            console.log(`[Skill] ${this.name} 的护盾抵挡了攻击！剩余护盾: ${this.status.shield}`);
            return { actualDamage: 0, blocked: true, dodged: false, bossEffects: null };
        }

        if (this.skill && this.skill.trigger === 'on_receive_attack' && this.skill.key === 'dodge') {
            if (this.skill.effect()) {
                this.status.dodgeSuccess = true;
                console.log(`[Skill] ${this.name} 闪避了攻击！`);
                return { actualDamage: 0, blocked: false, dodged: true, bossEffects: null };
            }
        }

        const actualDamage = Math.max(1, damage - this.status.debuffDef);
        const oldHp = this.hp;
        this.hp = Math.max(0, this.hp - actualDamage);

        let bossEffects = null;
        // Boss 特殊技能处理
        if (this.isBoss) {
            bossEffects = this.handleBossSkillEffects(oldHp, playerUnits);
        }

        if (this.hp <= 0) {
            this.status.isDead = true;
        }

        if (attacker && this.skill && this.skill.key === 'retaliation') {
            const retaliationDamage = this.skill.effect(actualDamage);
            console.log(`[Skill] ${this.name} 发动反击，造成 ${retaliationDamage} 点伤害`);
            attacker.hp = Math.max(0, attacker.hp - retaliationDamage);
            if (attacker.hp <= 0) {
                attacker.status.isDead = true;
            }
        }

        return { actualDamage, blocked: false, dodged: false, bossEffects };
    }

    handleBossSkillEffects(oldHp, playerUnits) {
        const effects = {
            bleeding: null,
            revival: null
        };

        console.log(`[Boss] ${this.name} 受到伤害，从 ${oldHp} 降至 ${this.hp}，当前血量 ${this.hp}/${this.maxHp}`);

        // 技能一：血之诅咒 - 每损失10%血量触发
        if (this.skill && this.skill.key === 'boss_bleeding') {
            const oldLoss = 1 - (oldHp / this.maxHp);
            const newLoss = 1 - (this.hp / this.maxHp);
            const oldSegments = Math.floor(oldLoss * 10);
            const newSegments = Math.floor(newLoss * 10);
            
            console.log(`[Boss] 血之诅咒检测 - 旧损失段: ${this.hpLossSegments}, 新损失段: ${newSegments}, 旧损失率: ${(oldLoss * 100).toFixed(1)}%, 新损失率: ${(newLoss * 100).toFixed(1)}%`);
            
            if (newSegments > this.hpLossSegments) {
                const newLossCount = newSegments - this.hpLossSegments;
                this.hpLossSegments = newSegments;
                
                // 对敌方全体造成伤害，伤害为Boss剩余血量的1%
                const damage = Math.max(1, Math.floor(this.hp * 0.01));
                console.log(`[Boss] 血之诅咒触发！损失了 ${newLossCount} 个10%血量段，对敌方全体造成 ${damage} 点伤害（Boss当前血量 ${this.hp} 的 1%）`);
                
                if (playerUnits) {
                    playerUnits.forEach(unit => {
                        if (unit && unit.hp > 0) {
                            unit.hp = Math.max(0, unit.hp - damage);
                            console.log(`[Boss]   -> ${unit.name} 受到 ${damage} 点伤害，当前血量: ${unit.hp}`);
                            if (unit.hp <= 0) {
                                unit.status.isDead = true;
                                console.log(`[Boss]   -> ${unit.name} 死亡！`);
                            }
                        }
                    });
                    effects.bleeding = { damage, count: newLossCount };
                    console.log(`[Boss] ${this.name} 血之诅咒触发，对敌方全体造成 ${damage} 点伤害！`);
                }
            } else {
                console.log(`[Boss] 血之诅咒未触发，未达到新的10%血量损失段`);
            }
        }

        // 技能二：回光返照 - 血量低于50%且未使用过
        console.log(`[Boss] 回光返照检测 - 是否使用过: ${this.revivalUsed}, 当前血量: ${this.hp}, 50%血量线: ${(this.maxHp * 0.5).toFixed(0)}`);
        if (this.secondarySkill && this.secondarySkill.key === 'boss_revival' && 
            !this.revivalUsed && this.hp <= this.maxHp * 0.5 && this.hp > 0) {
            this.revivalUsed = true;
            const oldMaxHp = this.maxHp;
            this.maxHp = Math.floor(this.maxHp * 0.75);
            this.hp = this.maxHp;
            // 重置血之诅咒的段数
            this.hpLossSegments = 0;
            effects.revival = { newMaxHp: this.maxHp, oldMaxHp: oldMaxHp };
            console.log(`[Boss] ${this.name} 回光返照触发！生命上限从 ${oldMaxHp} 降低至 ${this.maxHp}（降低25%），血量已满！血之诅咒段数已重置`);
        }

        return effects;
    }

    heal(amount) {
        const actualHeal = Math.min(this.maxHp - this.hp, amount);
        this.hp += actualHeal;
        return actualHeal;
    }

    calculateDamage(target) {
        let finalAtk = this.atk + this.status.buffAtk;

        if (this.skill && this.skill.key === 'blood_rage') {
            const bonus = this.skill.effect(this);
            finalAtk += bonus;
            if (bonus > 0) {
                console.log(`[Skill] ${this.name} 血怒加成: +${bonus} 攻击力`);
            }
        }

        let critMultiplier = 1;
        if (this.skill && this.skill.key === 'critical') {
            critMultiplier = this.skill.effect(this);
            if (critMultiplier === 2) {
                console.log(`[Skill] ${this.name} 发动暴击！`);
            }
        }

        if (this.status.nextCrit) {
            critMultiplier = 2;
            this.status.nextCrit = false;
            console.log(`[Skill] ${this.name} 必定暴击！`);
        }

        return Math.floor(finalAtk * critMultiplier);
    }

    getAttackCount() {
        if (this.skill && this.skill.key === 'double_strike') {
            const count = this.skill.effect();
            if (count === 2) {
                console.log(`[Skill] ${this.name} 发动连击！`);
            }
            return count;
        }
        return 1;
    }

    getHealingOnAttack(damage) {
        if (this.skill && this.skill.key === 'life_steal') {
            return this.skill.effect(this, null, damage);
        }
        return 0;
    }

    onRoundStart(currentRound) {
        if (this.skill && this.skill.key === 'shield') {
            this.skill.effect(this, currentRound);
        }
    }

    onRoundEnd() {
        if (this.skill && this.skill.key === 'healing_aura') {
            const healAmount = this.skill.effect(this);
            if (healAmount > 0) {
                const actualHeal = this.heal(healAmount);
                console.log(`[Skill] ${this.name} 治愈光环恢复 ${actualHeal} 血量`);
            }
        }
    }

    clone() {
        return new ChessUnit({
            id: this.id.split('_')[0] + '_' + Math.random().toString(36).substr(2, 9),
            baseId: this.baseId,
            name: this.name,
            star: this.star,
            hp: this.maxHp,
            atk: this.atk,
            skillKey: this.skillKey,
            camp: this.camp,
            isMerged: this.isMerged
        });
    }

    showSkillEffect(effectType, params = {}) {
        const container = document.getElementById('skill-effect-container') || this.createEffectContainer();
        
        const effect = document.createElement('div');
        effect.className = `skill-effect ${effectType}`;
        
        if (params.x !== undefined && params.y !== undefined) {
            effect.style.left = `${params.x}px`;
            effect.style.top = `${params.y}px`;
        } else {
            effect.style.left = '50%';
            effect.style.top = '50%';
            effect.style.transform = 'translate(-50%, -50%)';
        }
        
        if (effectType === 'stat-boost') {
            effect.textContent = `+${params.atk || 1}/+${params.hp || 1}`;
        }
        
        container.appendChild(effect);
        
        setTimeout(() => {
            if (effect.parentNode === container) {
                container.removeChild(effect);
            }
        }, 1500);
        
        return effect;
    }

    createEffectContainer() {
        const container = document.createElement('div');
        container.id = 'skill-effect-container';
        container.className = 'skill-effect-container';
        document.body.appendChild(container);
        return container;
    }

    triggerSkillEffect(triggerType, params = {}) {
        if (!this.skill) return null;
        
        const triggers = Array.isArray(this.skill.trigger) ? this.skill.trigger : [this.skill.trigger];
        if (!triggers.includes(triggerType)) return null;
        
        const result = this.skill.effect(this, triggerType, params);
        
        if (result) {
            this.showSkillVisualEffect(result, triggerType);
        }
        
        return result;
    }

    showSkillVisualEffect(result, triggerType) {
        const colors = {
            self_damage: '#fc8181',
            permanent_buff: '#48bb78',
            aoe_damage: '#fc8181',
            buff_all_and_self_damage: '#4299e1',
            gain_gold: '#f6e05e',
            heal_all: '#48bb78',
            buff_ally: '#9f7aea',
            camp_upgrade_discount: '#ed8936',
            side_damage_and_buff: '#48bb78',
            gain_chess: '#9f7aea',
            retry_skill: '#4299e1',
            buff_all_allies: '#48bb78',
            multi_buff: '#f6e05e',
            prob_boost: '#ed8936',
            random_ally_buff: '#48bb78',
            all_allies_prob_buff: '#48bb78',
            copy_left_stats: '#4299e1',
            left_buff: '#48bb78',
            left_right_buff: '#48bb78',
            prob_damage: '#fc8181',
            aoe_all_damage: '#fc8181'
        };
        
        const icons = {
            self_damage: this.skill?.icon || '💪',
            permanent_buff: '💪',
            aoe_damage: this.skill?.icon || '🩸',
            buff_all_and_self_damage: this.skill?.icon || '⚡',
            gain_gold: this.skill?.icon || '💰',
            heal_all: this.skill?.icon || '💚',
            buff_ally: this.skill?.icon || '✨',
            camp_upgrade_discount: this.skill?.icon || '🏕️',
            side_damage_and_buff: this.skill?.icon || '🤝',
            gain_chess: this.skill?.icon || '🎴',
            retry_skill: this.skill?.icon || '🔄',
            buff_all_allies: this.skill?.icon || '💪',
            multi_buff: this.skill?.icon || '✨',
            prob_boost: this.skill?.icon || '🍀',
            random_ally_buff: this.skill?.icon || '🤲',
            all_allies_prob_buff: this.skill?.icon || '🔥',
            copy_left_stats: this.skill?.icon || '📈',
            left_buff: this.skill?.icon || '👈',
            left_right_buff: this.skill?.icon || '👈',
            prob_damage: this.skill?.icon || '💥',
            aoe_all_damage: this.skill?.icon || '⚡'
        };

        let message = '';
        const color = colors[result.type] || '#f6e05e';
        const icon = icons[result.type] || '⚡';

        switch(result.type) {
            case 'self_damage':
                message = `${this.name} 自损 ${result.value}`;
                break;
            case 'permanent_buff':
                message = `+${result.atk}/${result.hp}`;
                break;
            case 'aoe_damage':
                message = `反噬 ${result.value}`;
                break;
            case 'buff_all_and_self_damage':
                message = `全队+${result.buffHp}血`;
                break;
            case 'gain_gold':
                if (!result.success) return;
                message = `+${result.amount}金币`;
                break;
            case 'heal_all':
                message = `全队+${result.amount}血`;
                break;
            case 'buff_ally':
                message = `友方+${result.atk}/${result.hp}`;
                break;
            case 'camp_upgrade_discount':
                if (!result.success) return;
                message = `营帐-$${result.discount}`;
                break;
            case 'side_damage_and_buff':
                message = `战友+${result.atk}/${result.hp}`;
                break;
            case 'gain_chess':
                message = `+${result.count}张学生`;
                break;
            case 'retry_skill':
                message = `再试一次!`;
                break;
            case 'buff_all_allies':
                message = `全队+${result.atk}/${result.hp}`;
                break;
            case 'multi_buff':
                message = `+${result.atk}/${result.hp}`;
                break;
            case 'prob_boost':
                message = `概率+${Math.round(result.boost * 100)}%`;
                break;
            case 'random_ally_buff':
                message = `${result.count}人+${result.atk}/${result.hp}`;
                break;
            case 'all_allies_prob_buff':
                if (!result.success) return;
                message = `全队+${result.atk}/${result.hp}`;
                break;
            case 'copy_left_stats':
                message = `+${result.atk}/${result.hp}`;
                break;
            case 'left_buff':
                if (!result.success) return;
                message = `左友+${result.atk}/${result.hp}`;
                break;
            case 'left_right_buff':
                if (!result.success) return;
                message = `${result.count}人+${result.atk}/${result.hp}`;
                break;
            case 'prob_damage':
                message = `${result.target} -${result.damage}`;
                break;
            case 'aoe_all_damage':
                message = `全体-1`;
                break;
            case 'prob_miss':
                return;
            default:
                message = this.skill?.name || '技能';
        }

        let targetElement = null;
        
        console.log(`[DebugSkillHint] 开始查找元素 - 棋子: ${this.name}, ID: ${this.id}, battlePosition: ${JSON.stringify(this.battlePosition)}`);
        
        // 方法1: 优先通过 battlePosition 查找（最可靠）
        if (this.battlePosition) {
            console.log(`[DebugSkillHint] 使用 battlePosition: ${JSON.stringify(this.battlePosition)}`);
            targetElement = document.querySelector(
                `.scene-card-slot[data-side="${this.battlePosition.side}"][data-row="${this.battlePosition.row}"][data-slot="${this.battlePosition.slot}"]`
            );
            console.log(`[DebugSkillHint] 方法1 (battlePosition查找): ${targetElement ? '找到' : '未找到'}`);
        }
        
        // 方法2: 通过ID查找
        if (!targetElement) {
            targetElement = document.querySelector(`[data-chess-unit-id="${this.id}"]`);
            console.log(`[DebugSkillHint] 方法2 (ID查找): ${targetElement ? '找到' : '未找到'}`);
        }
        
        // 方法3: 遍历所有卡槽查找（兜底）
        if (!targetElement) {
            const allSlots = document.querySelectorAll('.scene-card-slot:not(.empty)');
            console.log(`[DebugSkillHint] 方法3 - 遍历 ${allSlots.length} 个非空卡槽`);
            
            for (const slot of allSlots) {
                const slotId = slot.getAttribute('data-chess-unit-id');
                const dataSide = slot.getAttribute('data-side');
                const dataRow = slot.getAttribute('data-row');
                const dataSlot = slot.getAttribute('data-slot');
                
                console.log(`[DebugSkillHint]   卡槽: id=${slotId}, side=${dataSide}, row=${dataRow}, slot=${dataSlot}`);
                
                // 如果有 battlePosition，尝试匹配
                if (this.battlePosition && dataSide && dataRow && dataSlot) {
                    if (dataSide === this.battlePosition.side && 
                        dataRow === String(this.battlePosition.row) && 
                        dataSlot === String(this.battlePosition.slot)) {
                        targetElement = slot;
                        console.log(`[DebugSkillHint]   ✅ 通过position匹配找到!`);
                        break;
                    }
                }
                
                if (slotId === this.id) {
                    targetElement = slot;
                    console.log(`[DebugSkillHint]   ✅ 通过ID匹配找到!`);
                    break;
                }
            }
        }
        
        let centerX, centerY;
        
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            centerX = rect.left + rect.width / 2;
            centerY = rect.top + rect.height / 2;
            console.log(`[DebugSkillHint] ✅ 元素位置: rect.top=${rect.top}, rect.left=${rect.left}, centerX=${centerX}, centerY=${centerY}`);
        } else {
            centerX = window.innerWidth / 2;
            centerY = window.innerHeight / 2;
            console.log(`[DebugSkillHint] ❌ 未找到元素，使用屏幕中心: centerX=${centerX}, centerY=${centerY}`);
        }

        const hint = document.createElement('div');
        hint.className = 'card-skill-hint';
        hint.style.cssText = `
            position: fixed;
            top: ${centerY}px;
            left: ${centerX}px;
            transform: translate(-50%, -50%);
            padding: 6px 12px;
            background: linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(30, 40, 55, 0.95));
            border: 2px solid ${color};
            border-radius: 20px;
            color: ${color};
            font-size: 14px;
            font-weight: bold;
            z-index: 10002;
            box-shadow: 0 0 15px ${color}60, 0 4px 15px rgba(0,0,0,0.4);
            text-align: center;
            white-space: nowrap;
            pointer-events: none;
            animation: cardSkillAppear 1.5s ease-out forwards;
        `;
        hint.innerHTML = `<span style="margin-right: 4px;">${icon}</span>${message}`;
        document.body.appendChild(hint);

        setTimeout(() => {
            hint.style.animation = 'cardSkillFade 0.5s ease-out forwards';
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 500);
        }, 1000);
    }

    showSkillTriggerHint(message, options = {}) {
        const {
            isCenter = false,
            duration = 3000,
            color = '#f6e05e',
            fontSize = 16,
            isBold = true,
            showGlow = true,
            unitPosition = false,
            unitElement = null
        } = options;

        const existingHint = document.querySelector('.skill-trigger-hint');
        if (existingHint) {
            existingHint.remove();
        }

        const hint = document.createElement('div');
        hint.className = 'skill-trigger-hint' + (isCenter ? ' skill-trigger-hint-center' : '');

        let top, left, transformX, transformY;

        if (unitPosition && unitElement) {
            const rect = unitElement.getBoundingClientRect();
            top = rect.top + rect.height / 2;
            left = rect.left + rect.width / 2;
            transformX = -50;
            transformY = -100;
            fontSize = Math.max(12, fontSize - 2);
        } else if (unitPosition) {
            const chessElement = document.querySelector(`.scene-card-slot[data-chess-id="${this.id}"]`);
            if (chessElement) {
                const rect = chessElement.getBoundingClientRect();
                top = rect.top + rect.height / 2;
                left = rect.left + rect.width / 2;
                transformX = -50;
                transformY = -100;
                fontSize = Math.max(12, fontSize - 2);
            } else {
                top = window.innerHeight * 0.4;
                left = window.innerWidth / 2;
                transformX = -50;
                transformY = -50;
            }
        } else {
            top = isCenter ? window.innerHeight * 0.5 : window.innerHeight * 0.85;
            left = window.innerWidth / 2;
            transformX = -50;
            transformY = isCenter ? -50 : 0;
        }

        hint.style.cssText = `
            position: fixed;
            top: ${top}px;
            left: ${left}px;
            transform: translate(${transformX}%, ${transformY}%);
            padding: ${isCenter ? '20px 40px' : '8px 16px'};
            background: rgba(45, 55, 72, ${isCenter ? '0.9' : '0.95'});
            border: ${isCenter ? '3px solid' : '2px solid'} ${color};
            border-radius: ${isCenter ? '15px' : '25px'};
            color: ${color};
            font-size: ${fontSize}px;
            font-weight: ${isBold ? 'bold' : 'normal'};
            z-index: 10001;
            ${showGlow ? `box-shadow: 0 0 20px ${color}40, 0 4px 20px rgba(0,0,0,0.3);` : ''}
            text-align: center;
            max-width: 200px;
            white-space: nowrap;
            pointer-events: none;
            animation: skillHintFloat 2s ease-out forwards;
        `;
        hint.textContent = message;

        document.body.appendChild(hint);

        setTimeout(() => {
            hint.classList.add('fade-out');
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 500);
        }, duration);

        return hint;
    }

    showSkillHintOnCard(side, row, slot, message, color = '#f6e05e', icon = '✨') {
        const slotSelector = `.scene-card-slot[data-side="${side}"][data-row="${row}"][data-slot="${slot}"]`;
        const slotElement = document.querySelector(slotSelector);
        
        if (!slotElement) return;

        const slotRect = slotElement.getBoundingClientRect();
        
        const hint = document.createElement('div');
        hint.className = 'card-skill-hint';
        hint.style.cssText = `
            position: fixed;
            top: ${slotRect.top + slotRect.height / 2}px;
            left: ${slotRect.left + slotRect.width / 2}px;
            transform: translate(-50%, -50%);
            padding: 6px 12px;
            background: linear-gradient(135deg, rgba(45, 55, 72, 0.95), rgba(30, 40, 55, 0.95));
            border: 2px solid ${color};
            border-radius: 20px;
            color: ${color};
            font-size: 14px;
            font-weight: bold;
            z-index: 10002;
            box-shadow: 0 0 15px ${color}60, 0 4px 15px rgba(0,0,0,0.4);
            text-align: center;
            white-space: nowrap;
            pointer-events: none;
            animation: cardSkillAppear 1.5s ease-out forwards;
        `;
        hint.innerHTML = `<span style="margin-right: 4px;">${icon}</span>${message}`;

        document.body.appendChild(hint);

        setTimeout(() => {
            hint.style.animation = 'cardSkillFade 0.5s ease-out forwards';
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.parentNode.removeChild(hint);
                }
            }, 500);
        }, 1000);

        return hint;
    }
}

class ChessManager {
    constructor() {
        this.availableChess = [...CHESS_DATA.pool];
        this.availableHeroes = [...HERO_DATA.pool];
    }

    getRandomChess(starLevel = null, camp = null, maxStar = null, onlyCamp = null) {
        let candidates = this.availableChess;

        if (onlyCamp !== null) {
            candidates = candidates.filter(c => c.camp === onlyCamp);
            if (starLevel !== null) {
                candidates = candidates.filter(c => c.star === starLevel);
            }
            if (maxStar !== null) {
                candidates = candidates.filter(c => c.star <= maxStar);
            }
        } else {
            if (starLevel !== null) {
                candidates = candidates.filter(c => c.star === starLevel);
            }

            if (maxStar !== null) {
                candidates = candidates.filter(c => c.star <= maxStar);
            }

            if (camp !== null) {
                candidates = candidates.filter(c => c.camp === camp);
            }
        }

        if (candidates.length === 0) {
            candidates = this.availableChess;
            if (onlyCamp !== null) {
                candidates = candidates.filter(c => c.camp === onlyCamp);
                if (maxStar !== null) {
                    candidates = candidates.filter(c => c.star <= maxStar);
                }
            } else if (maxStar !== null) {
                candidates = candidates.filter(c => c.star <= maxStar);
            }
        }

        const randomIndex = Math.floor(Math.random() * candidates.length);
        return { ...candidates[randomIndex] };
    }

    getShopChess(campLevel) {
        const shopChess = [];
        const maxStar = campLevel;

        for (let i = 0; i < 5; i++) {
            const probabilities = this.getStarProbabilities(campLevel);
            const star = this.getRandomStarByProbability(probabilities);
            const chess = this.getRandomChess(star, null, maxStar, '十班');
            shopChess.push(chess);
        }

        return shopChess;
    }

    getStarProbabilities(campLevel) {
        const probabilities = {
            1: { 1: 1.0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
            2: { 1: 0.7, 2: 0.3, 3: 0, 4: 0, 5: 0, 6: 0 },
            3: { 1: 0.5, 2: 0.35, 3: 0.15, 4: 0, 5: 0, 6: 0 },
            4: { 1: 0.3, 2: 0.35, 3: 0.25, 4: 0.1, 5: 0, 6: 0 },
            5: { 1: 0.2, 2: 0.25, 3: 0.3, 4: 0.15, 5: 0.1, 6: 0 },
            6: { 1: 0.1, 2: 0.15, 3: 0.25, 4: 0.25, 5: 0.15, 6: 0.1 }
        };

        return probabilities[campLevel] || probabilities[1];
    }

    getRandomStarByProbability(probabilities) {
        const random = Math.random();
        let cumulative = 0;

        for (const [star, prob] of Object.entries(probabilities)) {
            cumulative += prob;
            if (random < cumulative) {
                return parseInt(star);
            }
        }

        return 1;
    }

    getStarColor(star) {
        const colors = { 
            1: '4299e1', 
            2: '9f7aea', 
            3: 'f6e05e',
            4: 'ed8936',
            5: 'fc8181',
            6: '48bb78'
        };
        return colors[star] || '718096';
    }

    canMerge(chessList) {
        const mergeable = {};
        
        if (!chessList || chessList.length === 0) {
            return [];
        }
        
        chessList.forEach(chess => {
            if (chess.isMerged) {
                return;
            }
            const key = `${chess.name}_${chess.star}`;
            if (!mergeable[key]) {
                mergeable[key] = [];
            }
            mergeable[key].push(chess);
        });
        
        const results = [];
        for (const [key, chessGroup] of Object.entries(mergeable)) {
            if (chessGroup.length >= 3) {
                results.push({
                    name: chessGroup[0].name,
                    star: chessGroup[0].star,
                    count: Math.floor(chessGroup.length / 3)
                });
            }
        }
        
        return results;
    }

    canMergeAcrossAreas(battlefield, bench) {
        const allChess = [...(battlefield || []), ...(bench || [])];
        return this.canMerge(allChess);
    }

    getRandomHero() {
        const randomIndex = Math.floor(Math.random() * this.availableHeroes.length);
        return { ...this.availableHeroes[randomIndex] };
    }

    getEnemyPreset(level) {
        const preset = ENEMY_PRESETS[level];
        if (preset) {
            return {
                hero: { ...preset.hero },
                team: preset.team.map((chess, index) => {
                    return new ChessUnit({
                        id: `enemy_${level}_${index}`,
                        name: chess.name,
                        star: chess.star,
                        hp: chess.hp,
                        atk: chess.atk,
                        skill: chess.skill,
                        camp: chess.camp
                    });
                })
            };
        }
        return this.getRandomEnemy();
    }

    getRandomEnemy() {
        const hero = this.getRandomHero();
        const team = [];
        const count = Math.floor(Math.random() * 4) + 3;

        for (let i = 0; i < count; i++) {
            const chess = this.getRandomChess();
            team.push(new ChessUnit({
                id: `enemy_random_${i}`,
                name: chess.name,
                star: chess.star,
                hp: chess.hp,
                atk: chess.atk,
                skill: chess.skill,
                camp: chess.camp
            }));
        }

        return { hero, team };
    }

    getEnemyByRound(round) {
        // 检查是否是boss回合（10的倍数）
        if (round % 10 === 0) {
            return this.getBossPreset(round);
        }
        const level = Math.min(10, round);
        return this.getEnemyPreset(level);
    }

    getBossPreset(round) {
        // 目前只有一个boss
        const bossId = 1;
        const bossData = BOSS_DATA[bossId];
        if (bossData) {
            const bossUnit = new ChessUnit({
                id: `boss_${round}`,
                baseId: 'shadow_lord',
                name: bossData.boss.name,
                star: bossData.boss.star,
                hp: bossData.boss.hp,
                atk: bossData.boss.atk,
                skillKey: bossData.boss.skillKey,
                secondarySkillKey: bossData.boss.secondarySkillKey,
                camp: bossData.boss.camp,
                isBoss: true
            });
            
            console.log(`[ChessManager] 生成Boss - 名称: ${bossUnit.name}, HP: ${bossUnit.hp}/${bossUnit.maxHp}, ATK: ${bossUnit.atk}`);
            console.log(`[ChessManager] Boss主技能: ${bossUnit.skill ? bossUnit.skill.name : '无'} (${bossUnit.skillKey})`);
            console.log(`[ChessManager] Boss副技能: ${bossUnit.secondarySkill ? bossUnit.secondarySkill.name : '无'} (${bossUnit.secondarySkillKey})`);
            
            return {
                hero: { ...bossData.hero },
                team: [bossUnit],
                isBoss: true,
                bossInfo: {
                    name: bossData.name,
                    description: bossData.description
                }
            };
        }
        console.warn(`[ChessManager] 未找到Boss数据 (bossId: ${bossId})`);
        return this.getRandomEnemy();
    }

    performMerge(chessList, name, star, campLevel = 1) {
        console.log(`[ChessManager] performMerge() 被调用 - 名称: ${name}, 星级: ${star}`);
        console.log(`[ChessManager] 当前棋盘棋子数量: ${chessList.length}`);
        
        const toMerge = [];
        let index = 0;

        while (toMerge.length < 3 && index < chessList.length) {
            if (chessList[index].name === name && chessList[index].star === star && !chessList[index].isMerged) {
                const removed = chessList.splice(index, 1)[0];
                toMerge.push(removed);
                console.log(`[ChessManager] 移除棋子: ${removed.name} (${removed.star}星)`);
            } else {
                index++;
            }
        }

        console.log(`[ChessManager] 找到 ${toMerge.length} 个可合成的棋子`);

        if (toMerge.length === 3) {
            console.log(`[ChessManager] 开始合成流程（金边标记，血量+1，攻击力+1）`);
            
            const avgHp = toMerge.reduce((sum, c) => sum + c.hp, 0) / 3;
            const avgAtk = toMerge.reduce((sum, c) => sum + c.atk, 0) / 3;
            const baseSkill = toMerge[0].skill;
            const baseCamp = toMerge[0].camp;
            const baseId = toMerge[0].baseId;

            const merged = new ChessUnit({
                id: 'merged_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                baseId: baseId,
                name: name,
                star: star,
                hp: Math.floor(avgHp) + 1,
                maxHp: Math.floor(avgHp) + 1,
                atk: Math.floor(avgAtk) + 1,
                skillKey: toMerge[0].skillKey,
                camp: baseCamp,
                isMerged: true
            });

            console.log(`[ChessManager] 合成成功! 获得金边卡牌: ${merged.name} (${merged.star}星, HP: ${merged.hp}, ATK: ${merged.atk})`);
            return merged;
        } else {
            console.warn(`[ChessManager] 合成失败: 只找到 ${toMerge.length} 个棋子，需要3个`);
            for (let i = toMerge.length - 1; i >= 0; i--) {
                chessList.push(toMerge[i]);
            }
        }

        return null;
    }

    performMergeAcrossAreas(battlefield, bench, name, star, campLevel = 1) {
        console.log(`[ChessManager] performMergeAcrossAreas() 被调用 - 名称: ${name}, 星级: ${star}`);
        
        const allChess = [...battlefield, ...bench];
        const toMerge = [];
        const battlefieldIndices = [];
        const benchIndices = [];
        
        for (let i = 0; i < allChess.length; i++) {
            const chess = allChess[i];
            const isFromBattlefield = i < battlefield.length;
            
            if (chess.name === name && chess.star === star && !chess.isMerged) {
                toMerge.push(chess);
                if (isFromBattlefield) {
                    battlefieldIndices.push(i);
                } else {
                    benchIndices.push(i - battlefield.length);
                }
            }
            
            if (toMerge.length >= 3) break;
        }
        
        console.log(`[ChessManager] 跨区域合并 - 找到 ${toMerge.length} 个棋子`);
        console.log(`[ChessManager] 战场棋子索引: ${battlefieldIndices.join(', ')}`);
        console.log(`[ChessManager] 替补席棋子索引: ${benchIndices.join(', ')}`);
        
        if (toMerge.length === 3) {
            battlefieldIndices.sort((a, b) => b - a).forEach(idx => {
                battlefield.splice(idx, 1);
            });
            benchIndices.sort((a, b) => b - a).forEach(idx => {
                bench.splice(idx, 1);
            });
            
            const avgHp = toMerge.reduce((sum, c) => sum + c.hp, 0) / 3;
            const avgAtk = toMerge.reduce((sum, c) => sum + c.atk, 0) / 3;
            
            const merged = new ChessUnit({
                id: 'merged_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                baseId: toMerge[0].baseId,
                name: name,
                star: star,
                hp: Math.floor(avgHp) + 1,
                maxHp: Math.floor(avgHp) + 1,
                atk: Math.floor(avgAtk) + 1,
                skillKey: toMerge[0].skillKey,
                camp: toMerge[0].camp,
                isMerged: true
            });
            
            if (battlefield.length <= bench.length) {
                battlefield.push(merged);
                console.log(`[ChessManager] 合成结果放回战场`);
            } else {
                bench.push(merged);
                console.log(`[ChessManager] 合成结果放回替补席`);
            }
            
            return merged;
        }
        
        return null;
    }
}

window.ChessManager = ChessManager;
window.ChessUnit = ChessUnit;
window.CHESS_DATA = CHESS_DATA;
window.HERO_DATA = HERO_DATA;
window.ENEMY_PRESETS = ENEMY_PRESETS;
