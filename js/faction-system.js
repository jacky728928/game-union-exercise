/**
 * 阵营系统核心模块
 * 联合演习 - 回合制自走棋
 * 
 * 负责阵营的检测、计算、渲染等功能
 */

class FactionSystem {
    constructor(game) {
        this.game = game;
        this.activeFactions = new Map(); // 活跃的阵营
        this.factionContainer = null;
        this.detailPanel = null;
    }

    init() {
        this.createFactionContainer();
        this.createDetailPanel();
        this.updateFactions();
        console.log('[FactionSystem] 阵营系统初始化完成');
    }

    createFactionContainer() {
        const container = document.createElement('div');
        container.id = 'faction-container';
        container.className = 'faction-container';

        const mainCampSection = this.createFactionSection('主阵营', FACTION_DATA.mainCamps);
        const specialAffixSection = this.createFactionSection('特殊羁绊', FACTION_DATA.specialAffixes);

        container.appendChild(mainCampSection);
        container.appendChild(specialAffixSection);

        // 添加各个主阵营的子阵营
        Object.keys(FACTION_DATA.subCamps).forEach(campId => {
            const subCamps = FACTION_DATA.subCamps[campId];
            if (subCamps && subCamps.length > 0) {
                const campName = campId === 'class10' ? '10班子阵营' : 
                               campId === 'class9' ? '9班子阵营' : '14班子阵营';
                const subCampSection = this.createFactionSection(campName, subCamps);
                container.appendChild(subCampSection);
            }
        });

        document.getElementById('game-container').appendChild(container);
        this.factionContainer = container;
    }

    createFactionSection(title, factions) {
        const section = document.createElement('div');
        section.className = 'faction-section';

        const titleEl = document.createElement('div');
        titleEl.className = 'faction-section-title';
        titleEl.textContent = title;
        section.appendChild(titleEl);

        const iconsContainer = document.createElement('div');
        iconsContainer.className = 'faction-icons';

        factions.forEach(faction => {
            const icon = this.createFactionIcon(faction);
            iconsContainer.appendChild(icon);
        });

        section.appendChild(iconsContainer);
        return section;
    }

    createFactionIcon(faction) {
        const icon = document.createElement('div');
        icon.className = 'faction-icon hidden';
        icon.dataset.factionId = faction.id;

        const img = document.createElement('img');
        img.src = faction.image;
        img.alt = faction.name;
        img.className = 'faction-image';
        icon.appendChild(img);

        const nameEl = document.createElement('div');
        nameEl.className = 'faction-name';
        nameEl.textContent = faction.name;
        icon.appendChild(nameEl);

        const infoEl = document.createElement('div');
        infoEl.className = 'faction-info';
        icon.appendChild(infoEl);

        icon.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showDetailPanel(faction, e);
        });

        return icon;
    }

    createDetailPanel() {
        const panel = document.createElement('div');
        panel.id = 'faction-detail-panel';
        panel.className = 'faction-detail-panel hidden';

        panel.innerHTML = `
            <div class="detail-panel-header">
                <div class="detail-panel-title">
                    <img id="detail-panel-image" src="" alt="" class="detail-panel-image">
                    <span id="detail-panel-name"></span>
                </div>
                <button id="detail-panel-close" class="detail-panel-close">×</button>
            </div>
            <div id="detail-panel-desc" class="detail-panel-desc"></div>
            <div class="detail-panel-stats">
                <div class="detail-stat">
                    <span class="stat-label">上阵人数:</span>
                    <span id="detail-panel-count" class="stat-value">0</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-label">当前层数:</span>
                    <span id="detail-panel-level" class="stat-value">0</span>
                </div>
                <div class="detail-stat">
                    <span class="stat-label">需要人数:</span>
                    <span id="detail-panel-min" class="stat-value">0</span>
                </div>
            </div>
            <div class="detail-panel-effects">
                <div class="effects-title">当前效果:</div>
                <div id="detail-panel-effects" class="effects-list"></div>
            </div>
        `;

        const closeBtn = panel.querySelector('#detail-panel-close');
        closeBtn.addEventListener('click', () => {
            this.hideDetailPanel();
        });

        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                this.hideDetailPanel();
            }
        });

        document.body.appendChild(panel);
        this.detailPanel = panel;
    }

    showDetailPanel(faction, event) {
        const state = this.activeFactions.get(faction.id) || { count: 0, level: 0, active: false };

        this.detailPanel.querySelector('#detail-panel-image').src = faction.image;
        this.detailPanel.querySelector('#detail-panel-name').textContent = faction.name;
        this.detailPanel.querySelector('#detail-panel-desc').textContent = faction.description;
        this.detailPanel.querySelector('#detail-panel-count').textContent = state.count;
        this.detailPanel.querySelector('#detail-panel-level').textContent = state.level;
        this.detailPanel.querySelector('#detail-panel-min').textContent = faction.minCount;

        const effectsContainer = this.detailPanel.querySelector('#detail-panel-effects');
        effectsContainer.innerHTML = '';

        faction.effects.forEach(effect => {
            const effectItem = document.createElement('div');
            effectItem.className = 'effect-item';

            // 只有当阵营激活时才计算效果值，否则显示未激活
            const isFactionActive = state.active;
            const value = isFactionActive ? effect.formula(state.level) : 0;
            const isActive = isFactionActive && (!effect.threshold || state.level >= effect.threshold);

            if (isActive) {
                effectItem.classList.add('active');
            }

            const attrName = document.createElement('span');
            attrName.className = 'effect-attribute';
            attrName.textContent = effect.attribute;

            const effectValue = document.createElement('span');
            effectValue.className = 'effect-value';
            if (!isFactionActive) {
                effectValue.textContent = '未激活';
            } else if (effect.isBoolean) {
                effectValue.textContent = value || '未生效';
            } else {
                effectValue.textContent = `+${value}`;
            }

            const effectDesc = document.createElement('div');
            effectDesc.className = 'effect-desc';
            effectDesc.textContent = effect.description;

            effectItem.appendChild(attrName);
            effectItem.appendChild(effectValue);
            effectItem.appendChild(effectDesc);
            effectsContainer.appendChild(effectItem);
        });

        this.detailPanel.style.left = `${event.pageX + 10}px`;
        this.detailPanel.style.top = `${event.pageY + 10}px`;

        this.detailPanel.classList.remove('hidden');

        const panelRect = this.detailPanel.getBoundingClientRect();
        if (panelRect.right > window.innerWidth) {
            this.detailPanel.style.left = `${event.pageX - panelRect.width - 10}px`;
        }
        if (panelRect.bottom > window.innerHeight) {
            this.detailPanel.style.top = `${event.pageY - panelRect.height - 10}px`;
        }
    }

    hideDetailPanel() {
        this.detailPanel.classList.add('hidden');
    }

    updateFactions() {
        const battlefield = this.game.state.battlefield;
        const chessUnits = battlefield.map(chess => {
            const chessData = CHESS_DATA.pool.find(c => c.id === chess.id || c.baseId === chess.id?.replace?.(/^reward_/, ''));
            return chessData || chess;
        });

        this.activeFactions.clear();

        FACTION_DATA.mainCamps.forEach(camp => {
            this.processCamp(camp, chessUnits);
        });

        FACTION_DATA.specialAffixes.forEach(affix => {
            this.processCamp(affix, chessUnits);
        });

        // 处理所有子阵营
        Object.values(FACTION_DATA.subCamps).forEach(subCamps => {
            subCamps.forEach(camp => {
                this.processCamp(camp, chessUnits);
            });
        });

        this.updateIcons();
    }

    processCamp(camp, chessUnits) {
        const count = chessUnits.filter(chess => {
            const matches = [];
            
            if (camp.id === 'class10' && chess.camp === '十班') matches.push(true);
            if (camp.id === 'class9' && (chess.camp === '一班' || chess.camp === '二班' || chess.camp === '三班')) matches.push(true);
            if (camp.id === 'class14' && (chess.camp === '四班' || chess.camp === '五班' || chess.camp === '六班')) matches.push(true);
            
            if (chess.factions && chess.factions.includes(camp.name)) {
                matches.push(true);
            }

            return matches.length > 0;
        }).length;

        const level = Math.max(0, count - camp.minCount + 1);
        const active = count >= camp.minCount;

        this.activeFactions.set(camp.id, {
            count,
            level,
            active,
            faction: camp
        });
    }

    updateIcons() {
        const icons = this.factionContainer.querySelectorAll('.faction-icon');
        
        icons.forEach(icon => {
            const factionId = icon.dataset.factionId;
            const state = this.activeFactions.get(factionId);
            const faction = FACTION_DATA.getFactionById(factionId);

            if (!state || state.count === 0) {
                icon.classList.add('hidden');
                icon.classList.remove('active', 'inactive');
            } else {
                icon.classList.remove('hidden');
                
                if (state.active) {
                    icon.classList.add('active');
                    icon.classList.remove('inactive');
                } else {
                    icon.classList.add('inactive');
                    icon.classList.remove('active');
                }

                const infoEl = icon.querySelector('.faction-info');
                if (infoEl) {
                    infoEl.innerHTML = `
                        <span class="faction-count">${state.count}</span>
                        <span class="faction-level">Lv.${state.level}</span>
                    `;
                }
            }
        });
    }

    getFactionBonuses() {
        const bonuses = {
            attack: 0,
            hp: 0,
            critRate: 0,
            critDamage: 0,
            skillSuccessRate: 0,
            shield: 0
        };

        this.activeFactions.forEach((state, factionId) => {
            if (!state.active) return;
            
            const faction = state.faction;
            faction.effects.forEach(effect => {
                if (effect.threshold && state.level < effect.threshold) return;
                
                const value = effect.formula(state.level);
                if (typeof value === 'number') {
                    if (effect.attribute.includes('攻击')) {
                        bonuses.attack += value;
                    } else if (effect.attribute.includes('血')) {
                        bonuses.hp += value;
                    } else if (effect.attribute.includes('暴击率')) {
                        bonuses.critRate += value;
                    } else if (effect.attribute.includes('暴击伤害')) {
                        bonuses.critDamage += value;
                    } else if (effect.attribute.includes('技能成功率')) {
                        bonuses.skillSuccessRate += value;
                    } else if (effect.attribute.includes('护盾')) {
                        bonuses.shield += value;
                    }
                }
            });
        });

        return bonuses;
    }

    applyBonusesToChess(chess) {
        const bonuses = this.getFactionBonuses();
        const newChess = { ...chess };
        
        if (bonuses.attack > 0) {
            newChess.atk = (newChess.atk || 0) + bonuses.attack;
        }
        if (bonuses.hp > 0) {
            newChess.hp = (newChess.hp || 0) + bonuses.hp;
            newChess.maxHp = (newChess.maxHp || newChess.hp) + bonuses.hp;
        }
        
        return newChess;
    }

    refresh() {
        this.updateFactions();
    }
}
