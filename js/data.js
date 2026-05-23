const SKILL_DEFINITIONS = {
    boss_bleeding: {
        name: '血之诅咒',
        description: '每损失10%血量对敌方全体造成自身剩余血量1%的伤害',
        icon: '💀',
        type: 'passive',
        trigger: 'on_hp_loss'
    },
    boss_revival: {
        name: '回光返照',
        description: '当血量低于50%时仅一次回满血但生命上限降低25%',
        icon: '💫',
        type: 'passive',
        trigger: 'on_hp_below_50'
    },
    // ===== 新技能 =====
    ni_jiayang_new: {
        name: '强攻先锋',
        description: '登场时，使所属羁绊层数+2；友方攻击时，使其永久+1/+1',
        icon: '⚔️',
        effect: (unit, triggerType, params, allies) => {
            if (triggerType === 'on_battle_start') {
                return { type: 'faction_buff', faction: '强攻', value: params.isGold ? 4 : 2 };
            } else if (triggerType === 'on_ally_attack') {
                const buffAtk = params.isGold ? 2 : 1;
                const buffHp = params.isGold ? 2 : 1;
                allies.forEach(ally => {
                    if (ally && ally.hp > 0 && ally.id !== unit.id) {
                        ally.atk += buffAtk;
                        ally.maxHp += buffHp;
                        ally.hp += buffHp;
                    }
                });
                return { type: 'permanent_buff_all', atk: buffAtk, hp: buffHp };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_battle_start', 'on_ally_attack']
    },
    zhang_zhimiao_new: {
        name: '概率商人',
        description: '招募结束时，50%概率使所属羁绊层数+1并获得2金币',
        icon: '💰',
        effect: (unit, triggerType, params, allies, battlefield, gameState) => {
            if (triggerType === 'on_recruit_end') {
                if (Math.random() < 0.5) {
                    const factionValue = params.isGold ? 2 : 1;
                    const goldAmount = params.isGold ? 4 : 2;
                    if (gameState) {
                        gameState.gold += goldAmount;
                    }
                    return { type: 'faction_buff_and_gold', faction: '概率', value: factionValue, gold: goldAmount, success: true };
                }
                return { type: 'prob_miss', success: false };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_recruit_end']
    },
    zhou_yichen_new: {
        name: '护盾大师',
        description: '护盾；友方每失去2次护盾，获得1金币',
        icon: '🛡️',
        effect: (unit, triggerType, params, allies, battlefield, gameState) => {
            if (triggerType === 'on_battle_start') {
                unit.shield = (unit.shield || 0) + 1;
                return { type: 'shield_add', value: 1 };
            } else if (triggerType === 'on_shield_lost') {
                if (!unit.shieldLostCount) unit.shieldLostCount = 0;
                unit.shieldLostCount++;
                if (unit.shieldLostCount % 2 === 0) {
                    const goldAmount = params.isGold ? 2 : 1;
                    if (gameState) {
                        gameState.gold += goldAmount;
                    }
                    return { type: 'gain_gold', value: goldAmount };
                }
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_battle_start', 'on_shield_lost']
    },
    yang_dongxing_new: {
        name: '虚弱之怒',
        description: '连攻；无视计算机羁绊的无法攻击效果；攻击时永久+5/+5并获得5层虚弱',
        icon: '💥',
        effect: (unit, triggerType, params, allies, enemies) => {
            if (triggerType === 'on_attack') {
                const buffAtk = params.isGold ? 10 : 5;
                const buffHp = params.isGold ? 10 : 5;
                const weakStacks = params.isGold ? 10 : 5;
                unit.atk += buffAtk;
                unit.maxHp += buffHp;
                unit.hp += buffHp;
                unit.weakness = (unit.weakness || 0) + weakStacks;
                unit.hasContinuousAttack = true;
                unit.ignoreComputerCantAttack = true;
                
                if (unit.hp <= 0 && unit.weakness > 0) {
                    const aliveAllies = allies.filter(a => a && a.hp > 0 && a.id !== unit.id);
                    if (aliveAllies.length > 0) {
                        const randomAlly = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
                        randomAlly.atk += unit.atk;
                        randomAlly.maxHp += unit.maxHp;
                        randomAlly.hp += unit.hp;
                        return { type: 'transfer_stats', to: randomAlly.name, atk: unit.atk, hp: unit.maxHp };
                    }
                }
                
                return { type: 'buff_and_weakness', atk: buffAtk, hp: buffHp, weakness: weakStacks };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_attack']
    },
    self_harm_buff: {
        name: '自损强化',
        description: '开战时对自己造成1点伤害；受伤时永久+1/+1',
        icon: '💪',
        effect: (unit, triggerType, params) => {
            if (triggerType === 'on_battle_start') {
                unit.hp = Math.max(1, unit.hp - 1);
                return { type: 'self_damage', value: 1 };
            } else if (triggerType === 'on_damage_taken') {
                unit.atk += params.isGold ? 2 : 1;
                unit.maxHp += params.isGold ? 2 : 1;
                unit.hp += params.isGold ? 2 : 1;
                return { type: 'permanent_buff', atk: params.isGold ? 2 : 1, hp: params.isGold ? 2 : 1 };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_battle_start', 'on_damage_taken']
    },
    damage_on_hurt: {
        name: '痛苦反噬',
        description: '受伤时对随机敌方造成2点伤害',
        icon: '🩸',
        effect: (unit, triggerType, params) => {
            if (triggerType === 'on_damage_taken') {
                const damage = params.isGold ? 4 : 2;
                return { type: 'aoe_damage', value: damage, target: 'random_enemy' };
            }
            return null;
        },
        type: 'passive',
        trigger: 'on_damage_taken'
    },
    attack_boost: {
        name: '攻击提升',
        description: '每次攻击额外造成10%伤害',
        icon: '⚔️',
        effect: (attacker, target) => {
            return Math.floor(attacker.atk * 0.1);
        },
        type: 'passive',
        trigger: 'on_attack'
    },
    life_steal: {
        name: '生命汲取',
        description: '攻击时恢复15%伤害值的血量',
        icon: '💉',
        effect: (attacker, target, damage) => {
            return Math.floor(damage * 0.15);
        },
        type: 'passive',
        trigger: 'on_attack'
    },
    dodge: {
        name: '闪避',
        description: '30%几率闪避敌方攻击',
        icon: '💨',
        effect: () => {
            return Math.random() < 0.3;
        },
        type: 'passive',
        trigger: 'on_receive_attack'
    },
    critical: {
        name: '暴击',
        description: '20%几率造成双倍伤害',
        icon: '💥',
        effect: (attacker) => {
            return Math.random() < 0.2 ? 2 : 1;
        },
        type: 'passive',
        trigger: 'on_attack'
    },
    double_strike: {
        name: '连击',
        description: '30%几率发动第二次攻击',
        icon: '🎯',
        effect: () => {
            return Math.random() < 0.3 ? 2 : 1;
        },
        type: 'passive',
        trigger: 'attack_count'
    },
    shield: {
        name: '护盾',
        description: '每3回合获得一层护盾，抵挡一次攻击',
        icon: '🛡️',
        effect: (unit, currentRound) => {
            if (currentRound % 3 === 0) {
                unit.status.shield += 1;
                return true;
            }
            return false;
        },
        type: 'passive',
        trigger: 'on_round_start'
    },
    retaliation: {
        name: '反击',
        description: '受到攻击时反弹20%伤害',
        icon: '🔄',
        effect: (damage) => {
            return Math.floor(damage * 0.2);
        },
        type: 'passive',
        trigger: 'on_receive_attack'
    },
    healing_aura: {
        name: '治愈光环',
        description: '回合结束时恢复10%最大生命值',
        icon: '✨',
        effect: (unit) => {
            return Math.floor(unit.maxHp * 0.1);
        },
        type: 'passive',
        trigger: 'on_round_end'
    },
    group_attack: {
        name: '全体攻击',
        description: '攻击对所有敌人造成50%伤害',
        icon: '💫',
        effect: () => {
            return 0.5;
        },
        type: 'passive',
        trigger: 'damage_multiplier_all'
    },
    stealth: {
        name: '隐匿',
        description: '闪避成功后下一次攻击必定暴击',
        icon: '👻',
        effect: (unit) => {
            if (unit.status.dodgeSuccess) {
                unit.status.nextCrit = true;
                unit.status.dodgeSuccess = false;
                return true;
            }
            return false;
        },
        type: 'passive',
        trigger: 'on_dodge'
    },
    blood_rage: {
        name: '血怒',
        description: '每损失10%血量，攻击力提升5%',
        icon: '🩸',
        effect: (unit) => {
            const hpPercent = unit.hp / unit.maxHp;
            const lossPercent = 1 - hpPercent;
            const bonus = Math.floor(unit.atk * (lossPercent * 0.5));
            return bonus;
        },
        type: 'passive',
        trigger: 'atk_bonus'
    },
    iron_will: {
        name: '铁意志',
        description: '血量低于30%时，防御力提升50%',
        icon: '🗿',
        effect: (unit) => {
            if (unit.hp / unit.maxHp <= 0.3) {
                return 0.5;
            }
            return 0;
        },
        type: 'passive',
        trigger: 'defense_bonus'
    },
    attack_buff_all: {
        name: '激励之击',
        description: '攻击时使全体友方血量+1，然后对自己造成1点伤害',
        icon: '⚡',
        effect: (unit, triggerType, params, allies) => {
            if (triggerType === 'on_attack') {
                const buffHp = params.isGold ? 1 : 1;
                const buffTimes = params.isGold ? 2 : 1;
                
                for (let t = 0; t < buffTimes; t++) {
                    allies.forEach(ally => {
                        if (ally && ally.hp > 0 && ally.id !== unit.id) {
                            ally.maxHp += buffHp;
                            ally.hp += buffHp;
                        }
                    });
                }
                
                unit.hp = Math.max(1, unit.hp - 1);
                return { type: 'buff_all_and_self_damage', buffHp: buffHp, selfDamage: 1 };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_attack']
    },
    gold_on_recruit: {
        name: '财运亨通',
        description: '招募结束时50%概率获得2金币',
        icon: '💰',
        effect: (unit, triggerType, params, gameState) => {
            if (triggerType === 'on_recruit_end') {
                const goldAmount = 2;
                const times = params.isGold ? 2 : 1;
                
                let totalGold = 0;
                for (let t = 0; t < times; t++) {
                    if (Math.random() < 0.5) {
                        totalGold += goldAmount;
                    }
                }
                
                if (totalGold > 0 && gameState) {
                    gameState.gold += totalGold;
                }
                
                return { type: 'gain_gold', amount: totalGold, success: totalGold > 0 };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_recruit_end']
    },
    heal_all_on_recruit: {
        name: '全员治愈',
        description: '招募结束时使全体友方血量永久+1',
        icon: '💚',
        effect: (unit, triggerType, params, allies) => {
            if (triggerType === 'on_recruit_end') {
                const healAmount = params.isGold ? 2 : 1;
                allies.forEach(ally => {
                    if (ally && ally.hp > 0) {
                        ally.maxHp += healAmount;
                        ally.hp += healAmount;
                    }
                });
                return { type: 'heal_all', amount: healAmount };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_recruit_end']
    },
    hurt_prob_buff: {
        name: '浴血奋战',
        description: '受伤时50%概率永久+1/+2',
        icon: '🔥',
        effect: (unit, triggerType, params) => {
            if (triggerType === 'on_damage_taken') {
                if (Math.random() < 0.5) {
                    const atkBuff = params.isGold ? 2 : 1;
                    const hpBuff = params.isGold ? 4 : 2;
                    unit.atk += atkBuff;
                    unit.maxHp += hpBuff;
                    unit.hp += hpBuff;
                    return { type: 'permanent_buff', atk: atkBuff, hp: hpBuff, success: true };
                }
                return { type: 'prob_miss', success: false };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_damage_taken']
    },
    boost_prob_skill: {
        name: '概率增幅',
        description: '友方概率类技能成功触发时，使其永久+2/+2',
        icon: '✨',
        effect: (unit, triggerType, params) => {
            if (triggerType === 'on_prob_skill_success') {
                const buffAtk = params.isGold ? 4 : 2;
                const buffHp = params.isGold ? 4 : 2;
                return { type: 'buff_ally', atk: buffAtk, hp: buffHp, targetUnit: params.targetUnit };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_prob_skill_success']
    },
    hurt_prob_camp_upgrade: {
        name: '精打细算',
        description: '受伤时50%概率使营帐升级价格-1',
        icon: '🏕️',
        effect: (unit, triggerType, params, gameState) => {
            if (triggerType === 'on_damage_taken') {
                const times = params.isGold ? 2 : 1;
                let totalDiscount = 0;
                
                for (let t = 0; t < times; t++) {
                    if (Math.random() < 0.5) {
                        totalDiscount += 1;
                    }
                }
                
                if (totalDiscount > 0 && gameState) {
                    gameState.campUpgradeDiscount = (gameState.campUpgradeDiscount || 0) + totalDiscount;
                }
                
                return { type: 'camp_upgrade_discount', discount: totalDiscount, success: totalDiscount > 0 };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_damage_taken']
    },
    battle_start_side_buff: {
        name: '战友情深',
        description: '开战时对两侧友方造成1点伤害，使其永久+1/+1',
        icon: '🤝',
        effect: (unit, triggerType, params, allies, battlefield) => {
            if (triggerType === 'on_battle_start') {
                const times = params.isGold ? 2 : 1;
                const buffAtk = params.isGold ? 2 : 1;
                const buffHp = params.isGold ? 2 : 1;
                const damage = 1;
                
                // 使用更安全的查找方法，通过 ID 匹配
                const unitIndex = allies.findIndex(u => u.id === unit.id);
                if (unitIndex === -1) return null;
                
                const leftIndex = unitIndex - 1;
                const rightIndex = unitIndex + 1;
                
                for (let t = 0; t < times; t++) {
                    if (leftIndex >= 0 && allies[leftIndex] && allies[leftIndex].hp > 0) {
                        allies[leftIndex].hp = Math.max(1, allies[leftIndex].hp - damage);
                        allies[leftIndex].atk += buffAtk;
                        allies[leftIndex].maxHp += buffHp;
                        allies[leftIndex].hp += buffHp;
                    }
                    
                    if (rightIndex < allies.length && allies[rightIndex] && allies[rightIndex].hp > 0) {
                        allies[rightIndex].hp = Math.max(1, allies[rightIndex].hp - damage);
                        allies[rightIndex].atk += buffAtk;
                        allies[rightIndex].maxHp += buffHp;
                        allies[rightIndex].hp += buffHp;
                    }
                }
                
                return { type: 'side_damage_and_buff', damage: damage, atk: buffAtk, hp: buffHp };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_battle_start']
    },
    hurt_gain_chess: {
        name: '愈战愈勇',
        description: '自身每受两次伤，随机获得1张学生',
        icon: '🎴',
        effect: (unit, triggerType, params) => {
            if (triggerType === 'on_damage_taken') {
                if (!unit.damageCount) unit.damageCount = 0;
                unit.damageCount++;
                
                const gainCount = params.isGold ? 2 : 1;
                if (unit.damageCount % 2 === 0) {
                    return { type: 'gain_chess', count: gainCount };
                }
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_damage_taken']
    },
    retry_prob_skill: {
        name: '永不言弃',
        description: '友方概率类技能首次失败时，使其再判定一次；成功时，使其永久+2/+2',
        icon: '🔄',
        effect: (unit, triggerType, params) => {
            if (triggerType === 'on_prob_skill_retry') {
                return { type: 'retry_skill' };
            }
            if (triggerType === 'on_prob_skill_success') {
                const buffAtk = params.isGold ? 4 : 2;
                const buffHp = params.isGold ? 4 : 2;
                return { type: 'buff_ally', atk: buffAtk, hp: buffHp, targetUnit: params.targetUnit };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_prob_skill_retry', 'on_prob_skill_success']
    },
    hurt_buff_all: {
        name: '同甘共苦',
        description: '受伤时，使全体友方永久+1/+1',
        icon: '💪',
        effect: (unit, triggerType, params, allies) => {
            if (triggerType === 'on_damage_taken') {
                const buffAtk = params.isGold ? 2 : 1;
                const buffHp = params.isGold ? 2 : 1;
                
                if (allies) {
                    allies.forEach(ally => {
                        if (ally && ally.hp > 0 && ally.id !== unit.id) {
                            ally.atk += buffAtk;
                            ally.maxHp += buffHp;
                            ally.hp += buffHp;
                        }
                    });
                }
                
                return { type: 'buff_all_allies', atk: buffAtk, hp: buffHp };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_damage_taken']
    },
    battle_start_multi_buff: {
        name: '连环增益',
        description: '开战时，50%概率永久+4/+4并再次判定，最多触发4次',
        icon: '✨',
        effect: (unit, triggerType, params) => {
            if (triggerType === 'on_battle_start') {
                let totalBuffAtk = 0;
                let totalBuffHp = 0;
                const maxAttempts = 4;
                const buffAtk = params.isGold ? 8 : 4;
                const buffHp = params.isGold ? 8 : 4;
                
                for (let i = 0; i < maxAttempts; i++) {
                    if (Math.random() < 0.5) {
                        totalBuffAtk += buffAtk;
                        totalBuffHp += buffHp;
                        unit.atk += buffAtk;
                        unit.maxHp += buffHp;
                        unit.hp += buffHp;
                    } else {
                        break;
                    }
                }
                
                if (totalBuffAtk > 0) {
                    return { type: 'multi_buff', atk: totalBuffAtk, hp: totalBuffHp };
                }
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_battle_start']
    },
    prob_boost_passive: {
        name: '幸运加持',
        description: '友方概率类技能的概率提高25%',
        icon: '🍀',
        effect: (unit, triggerType, params) => {
            if (triggerType === 'prob_boost') {
                return { type: 'prob_boost', boost: params.isGold ? 0.5 : 0.25 };
            }
            return null;
        },
        type: 'passive',
        trigger: ['prob_boost']
    },
    ally_hurt_buff: {
        name: '同舟共济',
        description: '友方受伤时，使随机3个友方永久+1/+2',
        icon: '🤲',
        effect: (unit, triggerType, params, allies) => {
            if (triggerType === 'on_ally_hurt') {
                const buffAtk = params.isGold ? 2 : 1;
                const buffHp = params.isGold ? 4 : 2;
                const count = 3;
                
                if (allies) {
                    const aliveAllies = allies.filter(a => a && a.hp > 0 && a.id !== unit.id);
                    const shuffled = [...aliveAllies].sort(() => Math.random() - 0.5);
                    const targets = shuffled.slice(0, count);
                    
                    targets.forEach(ally => {
                        ally.atk += buffAtk;
                        ally.maxHp += buffHp;
                        ally.hp += buffHp;
                    });
                    
                    return { type: 'random_ally_buff', atk: buffAtk, hp: buffHp, count: targets.length };
                }
                
                return { type: 'random_ally_buff', atk: buffAtk, hp: buffHp, count: 0 };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_ally_hurt']
    },
    hurt_prob_all_buff: {
        name: '凤凰涅槃',
        description: '受伤时，50%概率使全体友方永久+2/+3',
        icon: '🔥',
        effect: (unit, triggerType, params, allies) => {
            if (triggerType === 'on_damage_taken') {
                if (Math.random() < 0.5) {
                    const buffAtk = params.isGold ? 4 : 2;
                    const buffHp = params.isGold ? 6 : 3;
                    
                    if (allies) {
                        allies.forEach(ally => {
                            if (ally && ally.hp > 0 && ally.id !== unit.id) {
                                ally.atk += buffAtk;
                                ally.maxHp += buffHp;
                                ally.hp += buffHp;
                            }
                        });
                    }
                    
                    return { type: 'all_allies_prob_buff', atk: buffAtk, hp: buffHp, success: true };
                }
                return { type: 'prob_miss', success: false };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_damage_taken']
    },
    battle_start_copy_left: {
        name: '借势而为',
        description: '开战时，暂时获得左侧友方的属性值',
        icon: '📈',
        effect: (unit, triggerType, params, allies, battlefield) => {
            if (triggerType === 'on_battle_start' && battlefield && allies) {
                const times = params.isGold ? 2 : 1;
                const unitIndex = battlefield.indexOf(unit);
                const leftIndex = unitIndex - 1;
                
                if (leftIndex >= 0 && allies[leftIndex] && allies[leftIndex].hp > 0) {
                    const leftAlly = allies[leftIndex];
                    unit.tempAtk = (unit.tempAtk || 0) + leftAlly.atk * times;
                    unit.tempHp = (unit.tempHp || 0) + leftAlly.maxHp * times;
                    unit.status.buffAtk += leftAlly.atk * times;
                    unit.hp = Math.min(unit.maxHp + unit.tempHp, unit.hp + leftAlly.maxHp * times);
                    unit.maxHp += leftAlly.maxHp * times;
                    
                    return { type: 'copy_left_stats', atk: leftAlly.atk * times, hp: leftAlly.maxHp * times };
                }
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_battle_start']
    },
    hurt_prob_left_buff: {
        name: '左膀右臂',
        description: '受伤时，50%概率使左侧友方永久+3/+6',
        icon: '👈',
        effect: (unit, triggerType, params, allies, battlefield) => {
            if (triggerType === 'on_damage_taken' && battlefield && allies) {
                const unitIndex = battlefield.indexOf(unit);
                const leftIndex = unitIndex - 1;
                
                if (params.isGold) {
                    const rightIndex = unitIndex + 1;
                    let buffedCount = 0;
                    
                    if (Math.random() < 0.5) {
                        if (leftIndex >= 0 && allies[leftIndex] && allies[leftIndex].hp > 0) {
                            allies[leftIndex].atk += 3;
                            allies[leftIndex].maxHp += 6;
                            allies[leftIndex].hp += 6;
                            buffedCount++;
                        }
                        if (rightIndex < allies.length && allies[rightIndex] && allies[rightIndex].hp > 0) {
                            allies[rightIndex].atk += 3;
                            allies[rightIndex].maxHp += 6;
                            allies[rightIndex].hp += 6;
                            buffedCount++;
                        }
                        return { type: 'left_right_buff', atk: 3, hp: 6, count: buffedCount, success: true };
                    }
                    return { type: 'prob_miss', success: false };
                } else {
                    if (Math.random() < 0.5) {
                        if (leftIndex >= 0 && allies[leftIndex] && allies[leftIndex].hp > 0) {
                            allies[leftIndex].atk += 3;
                            allies[leftIndex].maxHp += 6;
                            allies[leftIndex].hp += 6;
                        }
                        return { type: 'left_buff', atk: 3, hp: 6, success: true };
                    }
                    return { type: 'prob_miss', success: false };
                }
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_damage_taken']
    },
    prob_success_damage: {
        name: '幸运一击',
        description: '友方概率类技能触发成功时，对随机敌方造成等同于自身攻击力1/4的伤害',
        icon: '💥',
        effect: (unit, triggerType, params, enemies) => {
            if (triggerType === 'on_prob_skill_success' && enemies) {
                const multiplier = params.isGold ? 0.5 : 0.25;
                const damage = Math.floor(unit.atk * multiplier);
                
                const aliveEnemies = enemies.filter(e => e && e.hp > 0);
                if (aliveEnemies.length > 0) {
                    const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                    target.hp = Math.max(0, target.hp - damage);
                    if (target.hp <= 0) {
                        target.status.isDead = true;
                    }
                    return { type: 'prob_damage', damage: damage, target: target.name };
                }
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_prob_skill_success']
    },
    ally_target_aoe: {
        name: '同仇敌忾',
        description: '友方成为攻击目标时，对全体角色（包括敌我）造成1点伤害',
        icon: '⚡',
        effect: (unit, triggerType, params, allies, enemies) => {
            if (triggerType === 'on_ally_targeted' && allies && enemies) {
                const times = params.isGold ? 2 : 1;
                
                for (let t = 0; t < times; t++) {
                    [...allies, ...enemies].forEach(target => {
                        if (target && target.hp > 0 && target.id !== unit.id) {
                            target.hp = Math.max(1, target.hp - 1);
                            if (target.hp <= 0) {
                                target.status.isDead = true;
                            }
                        }
                    });
                }
                
                return { type: 'aoe_all_damage', damage: 1, times: times };
            }
            return null;
        },
        type: 'passive',
        trigger: ['on_ally_targeted']
    }
};

const CHESS_DATA = {
    pool: [
        { id: 'chess_wang', baseId: 'wang_haoxuan', name: '王昊轩', star: 1, hp: 2, atk: 2, skillKey: 'self_harm_buff', camp: '十班' },
        // ===== 修改的角色 =====
        { id: 'chess_ni', baseId: 'ni_jiayang', name: '倪嘉阳', star: 1, hp: 2, atk: 2, skillKey: 'ni_jiayang_new', camp: '十班', factions: ['强攻'] },
        { id: 'chess_zhang', baseId: 'zhang_haojun', name: '张皓军', star: 2, hp: 4, atk: 2, skillKey: 'attack_buff_all', camp: '十班' },
        { id: 'chess_ma_ming', baseId: 'ma_mingze', name: '马铭泽', star: 2, hp: 3, atk: 3, skillKey: 'gold_on_recruit', camp: '十班' },
        { id: 'chess_liu_yi', baseId: 'liu_yichen', name: '刘奕辰', star: 2, hp: 3, atk: 2, skillKey: 'heal_all_on_recruit', camp: '十班' },
        { id: 'chess_huang', baseId: 'huang_yancheng', name: '黄彦程', star: 3, hp: 5, atk: 3, skillKey: 'hurt_prob_buff', camp: '十班' },
        { id: 'chess_li_si', baseId: 'li_sikun', name: '李嗣坤', star: 3, hp: 3, atk: 3, skillKey: 'boost_prob_skill', camp: '十班' },
        { id: 'chess_liu_yi_meng', baseId: 'liu_yimeng', name: '刘祎盟', star: 3, hp: 4, atk: 3, skillKey: 'hurt_prob_camp_upgrade', camp: '十班' },
        { id: 'chess_sun', baseId: 'sun_fanghao', name: '孙方浩', star: 3, hp: 3, atk: 3, skillKey: 'battle_start_side_buff', camp: '十班' },
        { id: 'chess_mou', baseId: 'mou_xinyu', name: '牟新雨', star: 4, hp: 5, atk: 4, skillKey: 'hurt_gain_chess', camp: '十班' },
        { id: 'chess_deng', baseId: 'deng_xingzhi', name: '邓行知', star: 4, hp: 3, atk: 3, skillKey: 'retry_prob_skill', camp: '十班' },
        // 张之缈 → 张知渺（星级4→2，属性2/6→3/3）
        { id: 'chess_zhang_zhi', baseId: 'zhang_zhimiao', name: '张知渺', star: 2, hp: 3, atk: 3, skillKey: 'zhang_zhimiao_new', camp: '十班', factions: ['概率'] },
        // 周奕辰（星级5→3，属性4/4→5/2）
        { id: 'chess_zhou', baseId: 'zhou_yichen', name: '周奕辰', star: 3, hp: 2, atk: 5, skillKey: 'zhou_yichen_new', camp: '十班', factions: ['护盾'] },
        // 董润羲（属性4/4→5/5）
        { id: 'chess_dong', baseId: 'dong_runxi', name: '董润羲', star: 4, hp: 5, atk: 5, skillKey: 'battle_start_multi_buff', camp: '十班', factions: ['概率'] },
        // 马皓轩（属性3/6→2/6）
        { id: 'chess_ma_hao', baseId: 'ma_haoxuan', name: '马皓轩', star: 5, hp: 6, atk: 2, skillKey: 'prob_boost_passive', camp: '十班', factions: ['概率', '数学'] },
        // 杨东兴（星级5→6，属性3/5→8/4）
        { id: 'chess_yang', baseId: 'yang_dongxing', name: '杨东兴', star: 6, hp: 4, atk: 8, skillKey: 'yang_dongxing_new', camp: '十班', factions: ['强攻', '计算机'] },
        { id: 'chess_liu_yue', baseId: 'liu_yue', name: '刘岳', star: 5, hp: 6, atk: 1, skillKey: 'hurt_prob_all_buff', camp: '十班' },
        { id: 'chess_dong_hao', baseId: 'dong_haoming', name: '董浩铭', star: 6, hp: 12, atk: 4, skillKey: 'hurt_prob_left_buff', camp: '十班' },
        { id: 'chess_li_jia', baseId: 'li_jiaxuan', name: '李佳轩', star: 6, hp: 6, atk: 8, skillKey: 'prob_success_damage', camp: '十班' },
        { id: 'chess_gong', baseId: 'gong_boyang', name: '宫伯洋', star: 6, hp: 8, atk: 4, skillKey: 'ally_target_aoe', camp: '十班' },
        { id: 'chess_1', baseId: 'student_a', name: '学生A', star: 1, hp: 100, atk: 20, skillKey: 'attack_boost', camp: '一班' },
        { id: 'chess_2', baseId: 'student_b', name: '学生B', star: 1, hp: 100, atk: 20, skillKey: 'life_steal', camp: '一班' },
        { id: 'chess_3', baseId: 'student_c', name: '学生C', star: 1, hp: 100, atk: 20, skillKey: 'dodge', camp: '二班' },
        { id: 'chess_4', baseId: 'student_d', name: '学生D', star: 1, hp: 100, atk: 20, skillKey: 'critical', camp: '二班' },
        { id: 'chess_5', baseId: 'student_e', name: '学生E', star: 1, hp: 100, atk: 20, skillKey: 'double_strike', camp: '三班' },
        { id: 'chess_6', baseId: 'student_f', name: '学生F', star: 1, hp: 100, atk: 20, skillKey: 'shield', camp: '三班' },
        { id: 'chess_7', baseId: 'student_a', name: '学生A', star: 2, hp: 150, atk: 30, skillKey: 'attack_boost', camp: '一班' },
        { id: 'chess_8', baseId: 'student_b', name: '学生B', star: 2, hp: 150, atk: 30, skillKey: 'life_steal', camp: '一班' },
        { id: 'chess_9', baseId: 'student_c', name: '学生C', star: 2, hp: 150, atk: 30, skillKey: 'dodge', camp: '二班' },
        { id: 'chess_10', baseId: 'student_d', name: '学生D', star: 2, hp: 150, atk: 30, skillKey: 'critical', camp: '二班' },
        { id: 'chess_11', baseId: 'student_e', name: '学生E', star: 2, hp: 150, atk: 30, skillKey: 'double_strike', camp: '三班' },
        { id: 'chess_12', baseId: 'student_f', name: '学生F', star: 2, hp: 150, atk: 30, skillKey: 'shield', camp: '三班' },
        { id: 'chess_13', baseId: 'student_a', name: '学生A', star: 3, hp: 200, atk: 40, skillKey: 'attack_boost', camp: '一班' },
        { id: 'chess_14', baseId: 'student_b', name: '学生B', star: 3, hp: 200, atk: 40, skillKey: 'life_steal', camp: '一班' },
        { id: 'chess_15', baseId: 'student_c', name: '学生C', star: 3, hp: 200, atk: 40, skillKey: 'dodge', camp: '二班' },
        { id: 'chess_16', baseId: 'student_d', name: '学生D', star: 3, hp: 200, atk: 40, skillKey: 'critical', camp: '二班' },
        { id: 'chess_17', baseId: 'student_e', name: '学生E', star: 3, hp: 200, atk: 40, skillKey: 'double_strike', camp: '三班' },
        { id: 'chess_18', baseId: 'student_f', name: '学生F', star: 3, hp: 200, atk: 40, skillKey: 'shield', camp: '三班' },
        { id: 'chess_19', baseId: 'student_a', name: '学生A', star: 4, hp: 280, atk: 55, skillKey: 'attack_boost', camp: '一班' },
        { id: 'chess_20', baseId: 'student_b', name: '学生B', star: 4, hp: 280, atk: 55, skillKey: 'life_steal', camp: '一班' },
        { id: 'chess_21', baseId: 'student_c', name: '学生C', star: 4, hp: 280, atk: 55, skillKey: 'dodge', camp: '二班' },
        { id: 'chess_22', baseId: 'student_d', name: '学生D', star: 4, hp: 280, atk: 55, skillKey: 'critical', camp: '二班' },
        { id: 'chess_23', baseId: 'student_e', name: '学生E', star: 4, hp: 280, atk: 55, skillKey: 'double_strike', camp: '三班' },
        { id: 'chess_24', baseId: 'student_f', name: '学生F', star: 4, hp: 280, atk: 55, skillKey: 'shield', camp: '三班' },
        { id: 'chess_25', baseId: 'student_a', name: '学生A', star: 5, hp: 380, atk: 75, skillKey: 'attack_boost', camp: '一班' },
        { id: 'chess_26', baseId: 'student_b', name: '学生B', star: 5, hp: 380, atk: 75, skillKey: 'life_steal', camp: '一班' },
        { id: 'chess_27', baseId: 'student_c', name: '学生C', star: 5, hp: 380, atk: 75, skillKey: 'dodge', camp: '二班' },
        { id: 'chess_28', baseId: 'student_d', name: '学生D', star: 5, hp: 380, atk: 75, skillKey: 'critical', camp: '二班' },
        { id: 'chess_29', baseId: 'student_e', name: '学生E', star: 5, hp: 380, atk: 75, skillKey: 'double_strike', camp: '三班' },
        { id: 'chess_30', baseId: 'student_f', name: '学生F', star: 5, hp: 380, atk: 75, skillKey: 'shield', camp: '三班' },
        { id: 'chess_31', baseId: 'student_a', name: '学生A', star: 6, hp: 500, atk: 100, skillKey: 'attack_boost', camp: '一班' },
        { id: 'chess_32', baseId: 'student_b', name: '学生B', star: 6, hp: 500, atk: 100, skillKey: 'life_steal', camp: '一班' },
        { id: 'chess_33', baseId: 'student_c', name: '学生C', star: 6, hp: 500, atk: 100, skillKey: 'dodge', camp: '二班' },
        { id: 'chess_34', baseId: 'student_d', name: '学生D', star: 6, hp: 500, atk: 100, skillKey: 'critical', camp: '二班' },
        { id: 'chess_35', baseId: 'student_e', name: '学生E', star: 6, hp: 500, atk: 100, skillKey: 'double_strike', camp: '三班' },
        { id: 'chess_36', baseId: 'student_f', name: '学生F', star: 6, hp: 500, atk: 100, skillKey: 'shield', camp: '三班' },
        { id: 'chess_37', baseId: 'student_g', name: '战士', star: 1, hp: 120, atk: 25, skillKey: 'retaliation', camp: '四班' },
        { id: 'chess_38', baseId: 'student_h', name: '医师', star: 1, hp: 90, atk: 18, skillKey: 'healing_aura', camp: '四班' },
        { id: 'chess_39', baseId: 'student_i', name: '刺客', star: 1, hp: 85, atk: 28, skillKey: 'stealth', camp: '五班' },
        { id: 'chess_40', baseId: 'student_j', name: '狂战士', star: 1, hp: 110, atk: 30, skillKey: 'blood_rage', camp: '五班' },
        { id: 'chess_41', baseId: 'student_k', name: '守护者', star: 1, hp: 140, atk: 15, skillKey: 'iron_will', camp: '六班' },
        { id: 'chess_42', baseId: 'student_l', name: '弓箭手', star: 1, hp: 95, atk: 22, skillKey: 'group_attack', camp: '六班' }
    ]
};

const HERO_DATA = {
    pool: [
        { id: 'hero_1', name: '张老师', skill: '全员鼓舞' },
        { id: 'hero_2', name: '李老师', skill: '防线加固' },
        { id: 'hero_3', name: '王老师', skill: '进攻号角' },
        { id: 'hero_4', name: '赵老师', skill: '治愈光环' }
    ]
};

const ENEMY_PRESETS = {
    1: {
        name: '新手训练',
        hero: { name: '教官A', skill: '基础训练' },
        team: [
            { name: '学员1', star: 1, hp: 2, atk: 2, camp: '十班' },
            { name: '学员2', star: 1, hp: 3, atk: 2, camp: '十班' },
            { name: '学员3', star: 1, hp: 2, atk: 2, camp: '十班' }
        ]
    },
    2: {
        name: '初级对抗',
        hero: { name: '教官B', skill: '战术指挥' },
        team: [
            { name: '士兵1', star: 1, hp: 3, atk: 2, camp: '十班' },
            { name: '士兵2', star: 1, hp: 3, atk: 3, camp: '十班' },
            { name: '士兵3', star: 2, hp: 4, atk: 2, camp: '十班' },
            { name: '士兵4', star: 2, hp: 3, atk: 3, camp: '十班' }
        ]
    },
    3: {
        name: '中级演习',
        hero: { name: '队长A', skill: '进攻号角' },
        team: [
            { name: '战士1', star: 2, hp: 4, atk: 3, camp: '十班' },
            { name: '战士2', star: 2, hp: 4, atk: 3, camp: '十班' },
            { name: '战士3', star: 2, hp: 5, atk: 2, camp: '十班' },
            { name: '战士4', star: 3, hp: 4, atk: 3, camp: '十班' },
            { name: '战士5', star: 2, hp: 4, atk: 3, camp: '十班' }
        ]
    },
    4: {
        name: '高级演练',
        hero: { name: '指挥官A', skill: '全线鼓舞' },
        team: [
            { name: '精英1', star: 3, hp: 5, atk: 3, camp: '十班' },
            { name: '精英2', star: 3, hp: 4, atk: 4, camp: '十班' },
            { name: '精英3', star: 3, hp: 5, atk: 3, camp: '十班' },
            { name: '精英4', star: 3, hp: 4, atk: 4, camp: '十班' },
            { name: '精英5', star: 3, hp: 5, atk: 3, camp: '十班' },
            { name: '精英6', star: 3, hp: 5, atk: 4, camp: '十班' }
        ]
    },
    5: {
        name: '大师挑战',
        hero: { name: '司令A', skill: '终极强化' },
        team: [
            { name: '大师1', star: 4, hp: 5, atk: 4, camp: '十班' },
            { name: '大师2', star: 4, hp: 6, atk: 3, camp: '十班' },
            { name: '大师3', star: 4, hp: 5, atk: 4, camp: '十班' },
            { name: '大师4', star: 4, hp: 4, atk: 4, camp: '十班' },
            { name: '大师5', star: 4, hp: 6, atk: 4, camp: '十班' },
            { name: '大师6', star: 4, hp: 5, atk: 4, camp: '十班' },
            { name: '大师7', star: 4, hp: 4, atk: 5, camp: '十班' }
        ]
    },
    6: {
        name: '宗师试炼',
        hero: { name: '宗师A', skill: '宗师之道' },
        team: [
            { name: '宗师1', star: 5, hp: 6, atk: 4, camp: '十班' },
            { name: '宗师2', star: 5, hp: 6, atk: 5, camp: '十班' },
            { name: '宗师3', star: 5, hp: 5, atk: 5, camp: '十班' },
            { name: '宗师4', star: 5, hp: 6, atk: 4, camp: '十班' },
            { name: '宗师5', star: 5, hp: 7, atk: 4, camp: '十班' },
            { name: '宗师6', star: 5, hp: 6, atk: 5, camp: '十班' },
            { name: '宗师7', star: 5, hp: 6, atk: 5, camp: '十班' }
        ]
    },
    7: {
        name: '传奇对决',
        hero: { name: '传奇A', skill: '传奇之力' },
        team: [
            { name: '传奇1', star: 5, hp: 7, atk: 5, camp: '十班' },
            { name: '传奇2', star: 6, hp: 8, atk: 5, camp: '十班' },
            { name: '传奇3', star: 5, hp: 7, atk: 5, camp: '十班' },
            { name: '传奇4', star: 6, hp: 8, atk: 6, camp: '十班' },
            { name: '传奇5', star: 5, hp: 7, atk: 6, camp: '十班' },
            { name: '传奇6', star: 6, hp: 8, atk: 5, camp: '十班' },
            { name: '传奇7', star: 5, hp: 7, atk: 6, camp: '十班' }
        ]
    },
    8: {
        name: '神话之战',
        hero: { name: '神话A', skill: '神话降临' },
        team: [
            { name: '神话1', star: 6, hp: 10, atk: 6, camp: '十班' },
            { name: '神话2', star: 6, hp: 10, atk: 7, camp: '十班' },
            { name: '神话3', star: 6, hp: 11, atk: 6, camp: '十班' },
            { name: '神话4', star: 6, hp: 10, atk: 7, camp: '十班' },
            { name: '神话5', star: 6, hp: 12, atk: 6, camp: '十班' },
            { name: '神话6', star: 6, hp: 10, atk: 7, camp: '十班' },
            { name: '神话7', star: 6, hp: 11, atk: 7, camp: '十班' }
        ]
    },
    9: {
        name: '深渊审判',
        hero: { name: '深渊领主', skill: '深渊之力' },
        team: [
            { name: '深渊1', star: 6, hp: 12, atk: 8, camp: '十班' },
            { name: '深渊2', star: 6, hp: 12, atk: 9, camp: '十班' },
            { name: '深渊3', star: 6, hp: 13, atk: 8, camp: '十班' },
            { name: '深渊4', star: 6, hp: 12, atk: 9, camp: '十班' },
            { name: '深渊5', star: 6, hp: 14, atk: 8, camp: '十班' },
            { name: '深渊6', star: 6, hp: 12, atk: 9, camp: '十班' },
            { name: '深渊7', star: 6, hp: 13, atk: 9, camp: '十班' }
        ]
    },
    10: {
        name: '终极决战',
        hero: { name: '终极BOSS', skill: '终极毁灭' },
        team: [
            { name: '终极1', star: 6, hp: 15, atk: 10, camp: '十班' },
            { name: '终极2', star: 6, hp: 16, atk: 10, camp: '十班' },
            { name: '终极3', star: 6, hp: 15, atk: 11, camp: '十班' },
            { name: '终极4', star: 6, hp: 16, atk: 10, camp: '十班' },
            { name: '终极5', star: 6, hp: 17, atk: 10, camp: '十班' },
            { name: '终极6', star: 6, hp: 15, atk: 11, camp: '十班' },
            { name: '终极7', star: 6, hp: 16, atk: 11, camp: '十班' }
        ]
    }
};

const BOSS_DATA = {
    1: {
        name: '暗影领主',
        description: '传说中的暗影领主，拥有强大的生命力和神秘的诅咒能力。',
        hero: { name: '暗影领主', skill: '暗影之力' },
        boss: {
            name: '暗影领主',
            star: 6,
            hp: 200,
            atk: 1,
            camp: '无',
            skillKey: 'boss_bleeding',
            secondarySkillKey: 'boss_revival'
        }
    }
};
