/**
 * 游戏主模块
 * 联合演习 - 回合制自走棋
 * 
 * 包含游戏主逻辑
 */

class Game {
    constructor() {
        console.log('[Game] 开始实例化 Game 类...');
        console.log('[Game] 构造函数执行中...');
        
        this.state = {
            gold: 10,
            round: 1,
            campLevel: 1,
            heroHp: 30,
            battlefield: [],
            bench: [],
            shopChess: [],
            isBattleMode: false,
            enemyBattlefield: [],
            enemyHero: null,
            winStreak: 0,
            loseStreak: 0,
            hero: null,
            currency: 0,
            baseCurrencyPerRound: 1
        };

        console.log('[Game] 初始化 chessManager...');
        this.chessManager = new ChessManager();
        
        console.log('[Game] 初始化 battleLogic...');
        this.battleLogic = new BattleLogic(this);
        
        // 初始化阵营系统
        console.log('[Game] 初始化 factionSystem...');
        this.factionSystem = new FactionSystem(this);
        
        // 初始化Boss管理器
        this.state.currentBossInfo = null;
        if (typeof bossManager !== 'undefined') {
            bossManager.init();
        }

        this.draggedChess = null;
        this.draggedSource = null;

        this.slotCoordinateSystem = {
            enemyHero: { x: 2, y: 0 },
            enemyRow1: { 1: { x: 1, y: 1 }, 2: { x: 2, y: 1 }, 3: { x: 3, y: 1 } },
            enemyRow2: { 1: { x: 1, y: 2 }, 2: { x: 2, y: 2 }, 3: { x: 3, y: 2 } },
            playerRow1: { 1: { x: 1, y: 3 }, 2: { x: 2, y: 3 }, 3: { x: 3, y: 3 } },
            playerRow2: { 1: { x: 1, y: 4 }, 2: { x: 2, y: 4 }, 3: { x: 3, y: 4 } },
            playerHero: { x: 2, y: 5 }
        };

        console.log('[Game] 获取随机英雄...');
        this.state.hero = this.chessManager.getRandomHero();
        console.log('[Game] 调用 init() 方法...');
        this.init();
        
        console.log('[Game] Game 实例创建完成');
    }

    initializeSlotCoordinates() {
        console.log('[Coordinate] 初始化卡槽坐标系统...');

        const cardWidth = 90;
        const cardHeight = 110;
        const gapX = 8;
        const gapY = 6;

        const containerRect = document.querySelector('.scene-battlefield')?.getBoundingClientRect();
        if (!containerRect) {
            console.warn('[Coordinate] 无法获取战场容器尺寸');
            return;
        }

        const centerX = containerRect.width / 2;
        const rowSpacing = cardHeight + gapY;
        const startY = containerRect.height * 0.25;

        const battlefieldLayout = {
            enemyRow1: {
                1: { gridX: 1, gridY: 1, totalSlots: 4 },
                2: { gridX: 2, gridY: 1, totalSlots: 4 },
                3: { gridX: 3, gridY: 1, totalSlots: 4 },
                4: { gridX: 4, gridY: 1, totalSlots: 4 }
            },
            enemyRow2: {
                1: { gridX: 1, gridY: 2, totalSlots: 3 },
                2: { gridX: 2, gridY: 2, totalSlots: 3 },
                3: { gridX: 3, gridY: 2, totalSlots: 3 }
            },
            playerRow1: {
                1: { gridX: 1, gridY: 3, totalSlots: 3 },
                2: { gridX: 2, gridY: 3, totalSlots: 3 },
                3: { gridX: 3, gridY: 3, totalSlots: 3 }
            },
            playerRow2: {
                1: { gridX: 1, gridY: 4, totalSlots: 4 },
                2: { gridX: 2, gridY: 4, totalSlots: 4 },
                3: { gridX: 3, gridY: 4, totalSlots: 4 },
                4: { gridX: 4, gridY: 4, totalSlots: 4 }
            }
        };

        const slotPositions = {};

        Object.entries(battlefieldLayout).forEach(([rowKey, slots]) => {
            Object.entries(slots).forEach(([slotNum, grid]) => {
                const totalSlots = grid.totalSlots || 3;
                const centerOffset = (totalSlots - 1) / 2;
                const offsetX = (grid.gridX - 1 - centerOffset) * (cardWidth + gapX);
                const offsetY = (grid.gridY - 2.5) * rowSpacing;

                const screenX = centerX + offsetX;
                const screenY = startY + offsetY;

                const slotElement = document.querySelector(
                    `.scene-card-slot[data-side="${rowKey.includes('enemy') ? 'enemy' : 'player'}"]` +
                    `[data-row="${grid.gridY}"]` +
                    `[data-slot="${slotNum}"]`
                );

                if (slotElement) {
                    slotElement.dataset.coordX = screenX;
                    slotElement.dataset.coordY = screenY;
                }

                const coordKey = `${rowKey}_${slotNum}`;
                slotPositions[coordKey] = { x: screenX, y: screenY, gridX: grid.gridX, gridY: grid.gridY };
            });
        });

        this.slotPositions = slotPositions;
        console.log('[Coordinate] 坐标系统初始化完成', Object.keys(slotPositions).length, '个卡槽');
    }

    getSlotCoordinate(side, row, slot) {
        const rowKey = side === 'enemy'
            ? (row <= 2 ? `enemyRow${row}` : `enemyRow2`)
            : (row >= 3 ? `playerRow${row - 2}` : `playerRow1`);

        const coordKey = `${rowKey}_${slot}`;
        return this.slotPositions?.[coordKey] || { x: 0, y: 0 };
    }

    init() {
        console.log('[Game] ===== init() 开始 =====');
        console.log('[Game] 当前状态:', JSON.stringify({
            gold: this.state.gold,
            round: this.state.round,
            campLevel: this.state.campLevel,
            heroHp: this.state.heroHp
        }));

        console.log('[Game] 获取商店棋子...');
        this.state.shopChess = this.chessManager.getShopChess(this.state.campLevel);
        console.log(`[Game] 商店棋子数量: ${this.state.shopChess.length}`);
        
        console.log('[Game] 渲染商店...');
        this.renderShop();
        
        console.log('[Game] 渲染替补席...');
        this.renderBench();
        
        console.log('[Game] 渲染战场...');
        this.renderBattlefield();
        
        console.log('[Game] 更新UI...');
        this.updateUI();
        
        console.log('[Game] 绑定事件...');
        this.bindEvents();

        console.log('[Game] 初始化阵营系统...');
        this.factionSystem.init();

        console.log('[Game] ===== init() 完成 =====');
    }

    refreshShop() {
        console.log('[Game] refreshShop() 被调用');
        this.state.shopChess = this.chessManager.getShopChess(this.state.campLevel);
        console.log(`[Game] 刷新后商店棋子数量: ${this.state.shopChess.length}`);
        this.renderShop();
        this.setupDragAndDrop();
    }

    refreshShopWithCost() {
        console.log('[Game] refreshShopWithCost() 被调用');
        console.log(`[Game] 当前金币: ${this.state.gold}`);
        
        if (this.state.gold >= 3) {
            this.state.gold -= 3;
            console.log(`[Game] 花费3金币刷新商店，剩余金币: ${this.state.gold}`);
            this.refreshShop();
            this.updateUI();
        } else {
            console.warn('[Game] 金币不足，无法刷新商店');
            alert('金币不足！');
        }
    }

    renderShop() {
        const shopGrid = document.getElementById('shop-items');
        if (!shopGrid) {
            console.error('[Game] 错误: 找不到 #shop-items 元素');
            return;
        }
        
        console.log('[Game] 渲染商店格子...');
        shopGrid.innerHTML = '';

        this.state.shopChess.forEach((chess, index) => {
            const card = this.createChessCard(chess, 'shop');
            card.dataset.index = index;
            card.addEventListener('click', () => this.buyChess(index));
            shopGrid.appendChild(card);
        });
        
        console.log(`[Game] 商店渲染完成，共 ${this.state.shopChess.length} 个棋子`);
    }

    createChessCard(chess, type) {
        const container = document.createElement('div');
        container.className = 'card-container';

        const card = document.createElement('div');
        card.className = `unit-card ${type}-card`;
        if (chess.isMerged) {
            card.classList.add('gold-border');
        }
        card.draggable = true;

        const starSymbols = '★'.repeat(chess.star);
        const mergedIndicator = chess.isMerged ? ' <span style="color:#f6e05e;font-size:7px;">[已合成]</span>' : '';

        card.innerHTML = `
            <div class="star">${starSymbols}${mergedIndicator}</div>
            <img class="avatar" draggable="false" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='73' height='50'%3E%3Crect fill='%23${this.getStarColor(chess.star)}' width='73' height='50'/%3E%3Ctext x='36' y='30' text-anchor='middle' fill='white' font-size='10'%3E${chess.star}★%3C/text%3E%3C/svg%3E" alt="${chess.name}">
            <div class="name">${chess.name}</div>
            <div class="stats">
                <span class="hp">❤${chess.hp}</span>
                <span class="atk">⚔${chess.atk}</span>
            </div>
            <div class="skill">${chess.skill || ''}</div>
        `;

        container.appendChild(card);

        card.dataset.chessId = chess.id;
        card.dataset.name = chess.name;
        card.dataset.star = chess.star;

        this.setupCardHoverEvents(container, card, chess);

        return container;
    }

    setupCardHoverEvents(container, card, chess) {
        let panel = null;

        card.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            console.log(`[RightClick] 右键点击卡片: ${chess.name}`);
            this.logCardSkillStatus(chess);

            if (!panel) {
                panel = this.createCardDetailPanel(chess);
                document.body.appendChild(panel);

                panel.addEventListener('mouseleave', () => {
                    if (panel) {
                        panel.classList.remove('active');
                    }
                });
            }

            const rect = card.getBoundingClientRect();
            panel.style.left = `${rect.right + 15}px`;
            panel.style.top = `${rect.top}px`;

            if (rect.right + 370 > window.innerWidth) {
                panel.style.left = `${rect.left - 365}px`;
            }

            if (rect.bottom + 400 > window.innerHeight) {
                panel.style.top = `${window.innerHeight - 420}px`;
            }

            panel.classList.add('active');
        });

        document.addEventListener('click', (e) => {
            if (panel && !panel.contains(e.target) && !card.contains(e.target)) {
                panel.classList.remove('active');
            }
        });
    }

    closeAllDetailPanels() {
        const allPanels = document.querySelectorAll('.card-detail-panel');
        allPanels.forEach(panel => {
            panel.classList.remove('active');
        });
    }

    createCardDetailPanel(chess) {
        const panel = document.createElement('div');
        panel.className = 'card-detail-panel';

        const skill = chess.skill || (chess.skillKey && SKILL_DEFINITIONS[chess.skillKey]);
        const skillInfo = skill ? skill.name : '无';
        const skillDesc = skill ? skill.description : '该角色没有技能';
        const skillIcon = skill ? skill.icon : '❓';
        const isGold = chess.isMerged ? '✨ 是' : '否';
        const camp = chess.camp || '未知';
        const factions = chess.factions || [];
        
        // 获取主阵营名称
        const getMainCamp = (campName) => {
            if (campName === '十班') return '10班';
            if (campName === '一班' || campName === '二班' || campName === '三班') return '9班';
            if (campName === '四班' || campName === '五班' || campName === '六班') return '14班';
            return campName;
        };
        const mainCampName = getMainCamp(camp);
        
        // 生成阵营HTML
        let factionsHtml = '';
        if (factions.length > 0 || mainCampName) {
            factionsHtml = '<div class="panel-factions">';
            factionsHtml += '<div class="factions-header"><span class="factions-icon">🏷️</span><span class="factions-title">所属阵营</span></div>';
            factionsHtml += '<div class="factions-list">';
            
            // 主阵营
            if (mainCampName) {
                factionsHtml += `<div class="faction-item main-faction"><span class="faction-badge">主</span>${mainCampName}</div>`;
            }
            
            // 子阵营
            factions.forEach(faction => {
                factionsHtml += `<div class="faction-item">${faction}</div>`;
            });
            
            factionsHtml += '<div class="faction-requirement">需要3人触发</div>';
            factionsHtml += '</div>';
            factionsHtml += '</div>';
        }

        panel.innerHTML = `
            <div class="panel-header">
                <div class="panel-title">${chess.name}</div>
                <button class="panel-close">×</button>
            </div>

            <div class="panel-section">
                <div class="panel-section-title">基础属性</div>
                <div class="panel-stats">
                    <div class="stat-item hp">
                        <div class="stat-icon">❤️</div>
                        <div class="stat-value">${chess.hp}</div>
                        <div class="stat-label">生命值</div>
                    </div>
                    <div class="stat-item atk">
                        <div class="stat-icon">⚔️</div>
                        <div class="stat-value">${chess.atk}</div>
                        <div class="stat-label">攻击力</div>
                    </div>
                </div>
            </div>

            <div class="panel-section">
                <div class="panel-section-title">技能信息</div>
                <div class="panel-skill">
                    <div class="skill-header">
                        <div class="skill-icon">${skillIcon}</div>
                        <div class="skill-name">${skillInfo}</div>
                    </div>
                    <div class="skill-description">${skillDesc}</div>
                </div>
            </div>

            ${factionsHtml}

            <div class="panel-footer">
                <div class="panel-info">
                    星级: <span>${'★'.repeat(chess.star)}</span> |
                    阵营: <span>${camp}</span> |
                    金边: <span>${isGold}</span>
                </div>
            </div>
        `;

        const closeBtn = panel.querySelector('.panel-close');
        closeBtn.addEventListener('click', () => {
            panel.classList.remove('active');
        });

        return panel;
    }

    logCardSkillStatus(chess) {
        console.log(`[SkillCheck] ========== 角色技能状态检测 ==========`);
        console.log(`[SkillCheck] 角色: ${chess.name} (${chess.star}星, ${chess.camp})`);
        console.log(`[SkillCheck] 基础属性: HP=${chess.hp}, ATK=${chess.atk}`);

        const skill = chess.skill || (chess.skillKey && SKILL_DEFINITIONS[chess.skillKey]);

        if (skill) {
            console.log(`[SkillCheck] ✓ 技能已加载`);
            console.log(`[SkillCheck]   技能名称: ${skill.name}`);
            console.log(`[SkillCheck]   技能描述: ${skill.description}`);
            console.log(`[SkillCheck]   技能图标: ${skill.icon}`);
            console.log(`[SkillCheck]   触发类型: ${Array.isArray(skill.trigger) ? skill.trigger.join(', ') : skill.trigger}`);

            if (typeof skill.effect === 'function') {
                console.log(`[SkillCheck] ✓ 技能效果函数已定义`);

                const testUnit = {
                    id: 'test_unit',
                    hp: 10,
                    maxHp: 10,
                    atk: 5,
                    status: {
                        shield: 0,
                        buffAtk: 0,
                        debuffDef: 0,
                        canAttack: true,
                        isDead: false,
                        dodgeSuccess: false,
                        nextCrit: false
                    }
                };

                // 创建测试用的友方单位数组
                const testAllies = [
                    { id: 'ally_1', hp: 8, maxHp: 8, name: '测试友方1' },
                    { id: 'ally_2', hp: 10, maxHp: 10, name: '测试友方2' },
                    { id: 'test_unit', hp: 10, maxHp: 10, name: '测试单位自身' }
                ];

                try {
                    const testTrigger = Array.isArray(skill.trigger) ? skill.trigger[0] : skill.trigger;
                    const result = skill.effect(testUnit, testTrigger, { isGold: false }, testAllies);

                    console.log(`[SkillCheck] ✓ 技能效果测试成功`);
                    console.log(`[SkillCheck]   测试结果: ${JSON.stringify(result)}`);
                } catch (error) {
                    console.error(`[SkillCheck] ✗ 技能效果测试失败:`, error.message);
                }
            } else {
                console.error(`[SkillCheck] ✗ 技能效果函数未定义`);
            }
        } else {
            console.warn(`[SkillCheck] ⚠ 该角色没有技能`);
            console.log(`[SkillCheck]   skillKey: ${chess.skillKey || '无'}`);
        }

        console.log(`[SkillCheck]   是否金边: ${chess.isMerged ? '是' : '否'}`);
        console.log(`[SkillCheck] =========================================`);
    }

    showMergeCelebration(mergeResults) {
        console.log('[Game] showMergeCelebration() 显示合成庆祝界面');

        const overlay = document.createElement('div');
        overlay.className = 'merge-overlay';
        overlay.id = 'merge-celebration-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'merge-dialog merge-celebration';
        dialog.innerHTML = `
            <h3>🎉 合成成功！</h3>
            <p class="subtitle">选择以下一个随机角色免费获得</p>
            <div class="merge-reward-cards" id="merge-reward-container"></div>
            <p class="merge-hint">星级上限: ${this.state.campLevel + 1}⭐</p>
        `;

        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        this.generateMergeRewards(3, this.state.campLevel);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                console.log('[Game] 用户点击背景关闭合成界面');
                this.closeMergeDialog();
            }
        });
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

    bindEvents() {
        console.log('[Game] bindEvents() 开始绑定事件...');

        const startBattleBtn = document.getElementById('start-battle');
        if (startBattleBtn) {
            console.log('[Game] 绑定开始战斗按钮');
            startBattleBtn.addEventListener('click', () => {
                console.log('[Game] 开始战斗按钮被点击');
                this.startBattle();
            });
        }

        const upgradeCampBtn = document.getElementById('upgrade-camp');
        if (upgradeCampBtn) {
            console.log('[Game] 绑定升级营帐按钮');
            upgradeCampBtn.addEventListener('click', () => this.upgradeCamp());
        }

        const refreshShopBtn = document.getElementById('refresh-shop');
        if (refreshShopBtn) {
            console.log('[Game] 绑定刷新商店按钮');
            refreshShopBtn.addEventListener('click', () => this.refreshShopWithCost());
        }

        const autoMergeBtn = document.getElementById('auto-merge');
        if (autoMergeBtn) {
            console.log('[Game] 绑定自动合成按钮');
            autoMergeBtn.addEventListener('click', () => this.autoMerge());
        }

        const closeBattleBtn = document.getElementById('close-battle');
        if (closeBattleBtn) {
            console.log('[Game] 绑定关闭战斗按钮');
            closeBattleBtn.addEventListener('click', () => this.closeBattle());
        }

        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            console.log('[Game] 绑定重新开始按钮');
            restartBtn.addEventListener('click', () => location.reload());
        }

        document.querySelectorAll('.battle-speed-btn').forEach(btn => {
            console.log(`[Game] 绑定速度按钮: ${btn.dataset.speed}x`);
            btn.addEventListener('click', (e) => {
                const speed = parseFloat(e.target.dataset.speed);
                console.log(`[Game] 速度按钮被点击: ${speed}x`);
                this.setBattleSpeed(speed);
            });
        });

        console.log('[Game] 设置拖放功能...');
        this.setupDragAndDrop();

        console.log('[Game] 设置售卖区域...');
        this.setupSellZone();

        console.log('[Game] 事件绑定完成');
    }

    setupDragAndDrop() {
        console.log('[Game] setupDragAndDrop() 被调用');
        
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            console.error('[Game] 错误: 找不到游戏容器');
            return;
        }

        gameContainer.removeEventListener('dragstart', this.dragStartHandler);
        gameContainer.removeEventListener('dragend', this.dragEndHandler);

        this.dragStartHandler = (e) => {
            const card = e.target.closest('.unit-card');
            if (!card) return;

            const img = card.querySelector('img');
            if (e.target === img) {
                e.preventDefault();
                return;
            }

            const sourceEl = card.closest('#battlefield, #bench, #enemy-battlefield, #shop-items');
            const sourceId = sourceEl ? sourceEl.id : '';

            const cardData = {
                id: card.dataset.chessId,
                name: card.dataset.name,
                star: parseInt(card.dataset.star),
                source: sourceId
            };

            try {
                e.dataTransfer.setData('application/json', JSON.stringify(cardData));
                e.dataTransfer.setData('text/plain', JSON.stringify(cardData));
                e.dataTransfer.effectAllowed = 'move';

                card.classList.add('dragging');
                this.draggedChess = cardData;
                this.draggedSource = sourceId;

                console.log(`[Drag] 开始拖拽: ${cardData.name} (来源: ${cardData.source})`);
            } catch (error) {
                console.error('[Drag] 设置拖拽数据失败:', error);
            }
        };

        this.dragEndHandler = (e) => {
            const card = e.target.closest('.unit-card');
            if (card) {
                card.classList.remove('dragging');
            }
            console.log('[Drag] 拖拽结束');
        };

        gameContainer.addEventListener('dragstart', this.dragStartHandler);
        gameContainer.addEventListener('dragend', this.dragEndHandler);

        const setupDropZone = (zoneId) => {
            const zone = document.querySelector(zoneId);
            if (!zone) return;

            zone.removeEventListener('dragover', zone.dragOverHandler);
            zone.removeEventListener('dragleave', zone.dragLeaveHandler);
            zone.removeEventListener('drop', zone.dropHandler);

            zone.dragOverHandler = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                zone.classList.add('drop-target');
            };

            zone.dragLeaveHandler = () => {
                zone.classList.remove('drop-target');
            };

            zone.dropHandler = (e) => {
                e.preventDefault();
                zone.classList.remove('drop-target');

                let data = null;

                try {
                    const jsonStr = e.dataTransfer.getData('application/json');
                    if (jsonStr) {
                        data = JSON.parse(jsonStr);
                    }
                } catch (error) {
                    console.error('[Drop] 解析拖拽数据(application/json)失败:', error);
                }

                if (!data) {
                    try {
                        const textStr = e.dataTransfer.getData('text/plain');
                        if (textStr && textStr.startsWith('{')) {
                            data = JSON.parse(textStr);
                        }
                    } catch (error) {
                        console.error('[Drop] 解析拖拽数据(text/plain)失败:', error);
                    }
                }

                if (data && data.id) {
                    this.handleDropToZone(data, zoneId.replace('#', ''));
                } else {
                    console.error('[Drop] 无法解析拖拽数据');
                }
            };

            zone.addEventListener('dragover', zone.dragOverHandler);
            zone.addEventListener('dragleave', zone.dragLeaveHandler);
            zone.addEventListener('drop', zone.dropHandler);
        };

        ['#battlefield', '#bench', '#enemy-battlefield'].forEach(setupDropZone);
    }

    handleDropToZone(data, zoneId) {
        if (!data || !data.id) {
            console.error('[Drop] 无效的拖拽数据');
            return;
        }

        console.log(`[Drop] 放置到 ${zoneId}, 角色: ${data.name}`);

        if (zoneId === 'battlefield' && this.draggedSource === 'bench') {
            this.moveFromBenchToBattlefield(data.id);
        } else if (zoneId === 'bench' && this.draggedSource === 'battlefield') {
            this.moveFromBattlefieldToBench(data.id);
        }
    }

    moveFromBenchToBattlefield(chessId) {
        console.log(`[Move] moveFromBenchToBattlefield() 被调用, chessId: ${chessId}`);
        
        const index = this.state.bench.findIndex(c => c.id === chessId);
        if (index === -1) {
            console.warn('[Move] 未找到对应的棋子');
            return;
        }

        if (this.state.battlefield.length >= 7) {
            console.warn('[Move] 战场已满');
            alert('战场已满（最多7个棋子）！');
            return;
        }

        const chess = this.state.bench.splice(index, 1)[0];
        this.state.battlefield.push(chess);

        console.log(`[Move] ${chess.name} 从替补席移动到战场 (战场: ${this.state.battlefield.length}个)`);
        
        this.renderBench();
        this.renderBattlefield();
        this.updateMergeHint();
        this.factionSystem.refresh();
    }

    moveFromBattlefieldToBench(chessId) {
        console.log(`[Move] moveFromBattlefieldToBench() 被调用, chessId: ${chessId}`);
        
        const index = this.state.battlefield.findIndex(c => c.id === chessId);
        if (index === -1) {
            console.warn('[Move] 未找到对应的棋子');
            return;
        }

        const chess = this.state.battlefield.splice(index, 1)[0];
        this.state.bench.push(chess);

        console.log(`[Move] ${chess.name} 从战场移动到替补席 (战场: ${this.state.battlefield.length}个)`);
        
        this.renderBattlefield();
        this.renderBench();
        this.updateMergeHint();
        this.factionSystem.refresh();
    }

    setupSellZone() {
        const sellZone = document.getElementById('sell-zone');
        if (!sellZone) {
            console.error('[Sell] 找不到售卖区域 #sell-zone');
            return;
        }

        sellZone.removeEventListener('dragover', sellZone.sellDragOverHandler);
        sellZone.removeEventListener('dragleave', sellZone.sellDragLeaveHandler);
        sellZone.removeEventListener('drop', sellZone.sellDropHandler);

        sellZone.sellDragOverHandler = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            sellZone.classList.add('drag-over');
        };

        sellZone.sellDragLeaveHandler = () => {
            sellZone.classList.remove('drag-over');
        };

        sellZone.sellDropHandler = (e) => {
            e.preventDefault();
            sellZone.classList.remove('drag-over');

            let data = null;

            try {
                const jsonStr = e.dataTransfer.getData('application/json');
                if (jsonStr) {
                    data = JSON.parse(jsonStr);
                }
            } catch (error) {
                console.error('[Sell] 解析拖拽数据(application/json)失败:', error);
            }

            if (!data) {
                try {
                    const textStr = e.dataTransfer.getData('text/plain');
                    if (textStr && textStr.startsWith('{')) {
                        data = JSON.parse(textStr);
                    }
                } catch (error) {
                    console.error('[Sell] 解析拖拽数据(text/plain)失败:', error);
                }
            }

            if (data && data.id) {
                this.handleSellDrop(data);
            } else {
                console.error('[Sell] 无法解析拖拽数据');
                this.showInvalidDropEffect(sellZone);
            }
        };

        sellZone.addEventListener('dragover', sellZone.sellDragOverHandler);
        sellZone.addEventListener('dragleave', sellZone.sellDragLeaveHandler);
        sellZone.addEventListener('drop', sellZone.sellDropHandler);
    }

    showInvalidDropEffect(element) {
        element.classList.add('invalid-drop');
        setTimeout(() => {
            element.classList.remove('invalid-drop');
        }, 300);
    }

    handleSellDrop(data) {
        if (!data || !data.id || !data.source) {
            console.error('[Sell] 无效的售卖数据');
            return;
        }

        const validSources = ['battlefield', 'bench'];
        if (!validSources.includes(data.source)) {
            console.error(`[Sell] 无效的来源: ${data.source}`);
            const sellZone = document.getElementById('sell-zone');
            this.showInvalidDropEffect(sellZone);
            return;
        }

        this.showSellConfirm(data);
    }

    showSellConfirm(data) {
        const overlay = document.createElement('div');
        overlay.className = 'sell-confirm-overlay';
        overlay.innerHTML = `
            <div class="sell-confirm-dialog">
                <h4>🗑️ 确认售卖</h4>
                <p>确定要售卖 <strong>${data.name}</strong> 吗？</p>
                <p style="color: #f6e05e;">售价: 1 金币</p>
                <div class="confirm-buttons">
                    <button class="confirm-btn cancel">取消</button>
                    <button class="confirm-btn confirm">确认售卖</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const cancelBtn = overlay.querySelector('.cancel');
        const confirmBtn = overlay.querySelector('.confirm');

        const cleanup = () => {
            document.body.removeChild(overlay);
        };

        cancelBtn.addEventListener('click', cleanup);
        confirmBtn.addEventListener('click', () => {
            this.executeSell(data);
            cleanup();
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                cleanup();
            }
        });
    }

    executeSell(data) {
        console.log(`[Sell] executeSell() 被调用, data: ${JSON.stringify(data)}`);
        
        let removedChess = null;
        let sourceArray = null;

        if (data.source === 'battlefield') {
            sourceArray = this.state.battlefield;
        } else if (data.source === 'bench') {
            sourceArray = this.state.bench;
        }

        if (sourceArray) {
            const index = sourceArray.findIndex(c => c.id === data.id);
            if (index !== -1) {
                removedChess = sourceArray.splice(index, 1)[0];
            }
        }

        if (removedChess) {
            this.state.gold += 1;

            console.log(`[Sell] 成功售卖 ${removedChess.name}, 获得 1 金币，当前金币: ${this.state.gold}`);
            this.logCurrencyChange('sell', removedChess.name, 1);

            this.animateCurrencyIncrease('gold');

            this.renderBattlefield();
            this.renderBench();
            this.updateUI();
            this.updateMergeHint();
            this.factionSystem.refresh();
        } else {
            console.error('[Sell] 未能找到要售卖的角色');
            alert('无法找到该角色，请重试');
        }
    }

    animateCurrencyIncrease(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.classList.add('increase');
            setTimeout(() => {
                el.classList.remove('increase');
            }, 500);
        }
    }

    logCurrencyChange(type, detail, amount) {
        console.log(`[Currency] ${type} - ${detail}: ${amount > 0 ? '+' : ''}${amount}`);
    }

    buyChess(index) {
        console.log(`[Buy] buyChess() 被调用, index: ${index}`);
        console.log(`[Buy] 当前金币: ${this.state.gold}, 战场棋子数: ${this.state.battlefield.length}, 替补席棋子数: ${this.state.bench.length}`);
        
        if (this.state.gold < 3) {
            console.warn('[Buy] 金币不足');
            alert('金币不足！');
            return;
        }

        if (this.state.battlefield.length >= 7) {
            if (this.state.bench.length >= 9) {
                console.warn('[Buy] 战场和替补席都已满');
                alert('上阵区域和替补席都已满（战场最多7个，替补席最多9个）！');
                return;
            }
            console.log('[Buy] 战场已满，自动放入替补席');
        }

        const chessData = this.state.shopChess[index];
        console.log(`[Buy] 购买棋子: ${chessData.name} (星级: ${chessData.star})`);
        
        const newChess = new ChessUnit(chessData);

        if (this.state.battlefield.length < 7) {
            this.state.battlefield.push(newChess);
            console.log(`[Buy] 棋子放入战场`);
        } else {
            this.state.bench.push(newChess);
            console.log(`[Buy] 棋子放入替补席`);
        }
        
        this.state.gold -= 3;
        this.state.shopChess.splice(index, 1);
        
        console.log(`[Buy] 购买成功，剩余金币: ${this.state.gold}, 战场棋子数: ${this.state.battlefield.length}, 替补席棋子数: ${this.state.bench.length}`);
        
        this.renderShop();
        this.renderBench();
        this.renderBattlefield();
        this.updateUI();
        this.updateMergeHint();
        this.factionSystem.refresh();

        this.checkAndAutoMerge();
    }

    checkAndAutoMerge() {
        console.log('[Game] checkAndAutoMerge() 自动检查是否可合成');

        const crossAreaMergeable = this.chessManager.canMergeAcrossAreas(
            this.state.battlefield,
            this.state.bench
        );

        if (crossAreaMergeable.length > 0) {
            console.log('[Game] 发现可合成的棋子，自动触发合成！');
            
            setTimeout(() => {
                const hasMergeable = this.chessManager.canMergeAcrossAreas(
                    this.state.battlefield,
                    this.state.bench
                ).length > 0;
                if (hasMergeable) {
                    this.autoMerge();
                }
            }, 300);
        }
    }

    renderBench() {
        const bench = document.getElementById('bench');
        if (!bench) {
            console.error('[Game] 找不到 #bench 元素');
            return;
        }
        bench.innerHTML = '';

        this.state.bench.forEach((chess, index) => {
            const card = this.createChessCard(chess, 'bench');
            bench.appendChild(card);
        });
    }

    renderBattlefield() {
        const battlefield = document.getElementById('battlefield');
        if (!battlefield) {
            console.error('[Game] 找不到 #battlefield 元素');
            return;
        }
        battlefield.innerHTML = '';

        this.state.battlefield.forEach((chess, index) => {
            const card = this.createChessCard(chess, 'battlefield');
            battlefield.appendChild(card);
        });

        const enemyBattlefield = document.getElementById('enemy-battlefield');
        if (enemyBattlefield) {
            enemyBattlefield.innerHTML = '';
            this.state.enemyBattlefield.forEach((chess) => {
                const card = this.createChessCard(chess, 'enemy');
                enemyBattlefield.appendChild(card);
            });
        }
    }

    removeFromBattlefield(index) {
        const removed = this.state.battlefield.splice(index, 1)[0];
        this.state.gold += 1;
        this.renderBattlefield();
        this.updateUI();
    }

    sellChess(index) {
        this.state.bench.splice(index, 1);
        this.state.gold += 1;
        this.renderBench();
        this.updateUI();
    }

    updateUI() {
        const goldEl = document.getElementById('gold');
        const roundEl = document.getElementById('round');
        const campLevelEl = document.getElementById('camp-level');
        const heroHpEl = document.getElementById('hero-hp');
        const heroNameEl = document.getElementById('hero-name');
        const heroSkillEl = document.getElementById('hero-skill');
        const currencyEl = document.getElementById('currency');
        const currencyBadgeEl = document.querySelector('.currency-badge');

        if (goldEl) goldEl.textContent = this.state.gold;
        if (roundEl) roundEl.textContent = this.state.round;
        if (campLevelEl) campLevelEl.textContent = this.state.campLevel;
        if (heroHpEl) heroHpEl.textContent = this.state.heroHp;
        if (heroNameEl && this.state.hero) heroNameEl.textContent = this.state.hero.name;
        if (heroSkillEl && this.state.hero) heroSkillEl.textContent = this.state.hero.skill;
        if (currencyEl) currencyEl.textContent = this.state.currency;
        if (currencyBadgeEl) {
            currencyBadgeEl.textContent = `回合收益: +${this.state.baseCurrencyPerRound}`;
        }

        const upgradeBtn = document.getElementById('upgrade-camp');
        if (upgradeBtn) {
            const cost = this.getUpgradeCost();
            upgradeBtn.textContent = `升级营帐 (${cost}金)`;
            upgradeBtn.disabled = this.state.gold < cost || this.state.campLevel >= 6;
        }
        
        // 检查并显示Boss警告
        if (typeof bossManager !== 'undefined') {
            bossManager.checkAndShowBossWarning(this.state.round);
        }
    }

    getUpgradeCost() {
        return Math.max(5, 10 - this.state.round + 1);
    }

    upgradeCamp() {
        console.log('[Game] upgradeCamp() 被调用');
        
        const cost = this.getUpgradeCost();
        console.log(`[Game] 升级费用: ${cost} 金币，当前金币: ${this.state.gold}`);

        if (this.state.gold < cost) {
            console.warn('[Game] 金币不足，无法升级');
            alert('金币不足！');
            return;
        }

        if (this.state.campLevel >= 6) {
            console.warn('[Game] 营帐已达最高等级');
            alert('营帐已达最高等级！');
            return;
        }

        this.state.gold -= cost;
        this.state.campLevel++;
        
        console.log(`[Game] 升级成功! 营帐等级: ${this.state.campLevel}, 剩余金币: ${this.state.gold}`);
        
        this.refreshShop();
        this.updateUI();
    }

    startBattle() {
        this.battleLogic.startBattle();
    }

    generateEnemy() {
        this.battleLogic.generateEnemy();
    }

    startNewBattleScene() {
        this.battleLogic.startNewBattleScene();
    }

    async executeBattleWithNewScene() {
        await this.battleLogic.executeBattleWithNewScene();
    }

    showBattleSkillSubtitle(unit, skillResult, side, unitIndex) {
        if (!skillResult) return;

        let message = '';
        let color = '#f6e05e';
        let icon = '⚡';

        switch(skillResult.type) {
            case 'self_damage':
                message = `${unit.name} 自损 ${skillResult.value}`;
                color = '#fc8181';
                icon = unit.skill?.icon || '💪';
                break;
            case 'permanent_buff':
                message = `+${skillResult.atk}/${skillResult.hp}`;
                color = '#48bb78';
                icon = '💪';
                break;
            case 'aoe_damage':
                message = `反噬 ${skillResult.value}`;
                color = '#fc8181';
                icon = unit.skill?.icon || '🩸';
                break;
            case 'buff_all_and_self_damage':
                message = `全队+${skillResult.buffHp}血`;
                color = '#4299e1';
                icon = unit.skill?.icon || '⚡';
                break;
            case 'gain_gold':
                if (!skillResult.success) return;
                message = `+${skillResult.amount}金币`;
                color = '#f6e05e';
                icon = unit.skill?.icon || '💰';
                break;
            case 'heal_all':
                message = `全队+${skillResult.amount}血`;
                color = '#48bb78';
                icon = unit.skill?.icon || '💚';
                break;
            case 'buff_ally':
                message = `友方+${skillResult.atk}/${skillResult.hp}`;
                color = '#9f7aea';
                icon = unit.skill?.icon || '✨';
                break;
            case 'camp_upgrade_discount':
                if (!skillResult.success) return;
                message = `营帐-$${skillResult.discount}`;
                color = '#ed8936';
                icon = unit.skill?.icon || '🏕️';
                break;
            case 'side_damage_and_buff':
                message = `战友+${skillResult.atk}/${skillResult.hp}`;
                color = '#48bb78';
                icon = unit.skill?.icon || '🤝';
                break;
            case 'prob_miss':
                return;
            default:
                if (unit.skill) {
                    message = unit.skill.name || '技能';
                    icon = unit.skill.icon || '⚡';
                }
        }

        // 使用正确的放置顺序计算位置
        const placementOrder = [
            {row: 1, slot: 1},
            {row: 1, slot: 2},
            {row: 1, slot: 3},
            {row: 2, slot: 1},
            {row: 2, slot: 2},
            {row: 2, slot: 3},
            {row: 2, slot: 4}
        ];
        const pos = placementOrder[unitIndex] || {row: 1, slot: 1};

        unit.showSkillHintOnCard(side, pos.row, pos.slot, message, color, icon);
    }

    showSkillSubtitleNearUnit(side, pos, message, subtitleClass = 'battle-skill-subtitle', duration = 1500) {
        if (!window.battleSceneSystem) {
            this.showSkillSubtitleInBattle(message, subtitleClass, duration);
            return;
        }

        const slot = document.querySelector(
            `.scene-card-slot[data-side="${side}"][data-row="${pos.row}"][data-slot="${pos.slot}"]`
        );

        if (!slot) {
            console.log(`[SkillSubtitle] 未找到位置: side=${side}, row=${pos.row}, slot=${pos.slot}`);
            this.showSkillSubtitleInBattle(message, subtitleClass, duration);
            return;
        }

        const existingSubtitle = slot.querySelector('.battle-skill-subtitle');
        if (existingSubtitle) {
            existingSubtitle.remove();
        }

        const subtitle = document.createElement('div');
        subtitle.className = subtitleClass;
        subtitle.textContent = message;

        slot.appendChild(subtitle);

        setTimeout(() => {
            subtitle.classList.add('subtitle-fade');
            setTimeout(() => {
                if (subtitle.parentNode) {
                    subtitle.parentNode.removeChild(subtitle);
                }
            }, 500);
        }, duration);
    }

    showSkillSubtitleInBattle(message, subtitleClass = 'battle-skill-subtitle', duration = 2000) {
        const existingSubtitle = document.querySelector('.battle-skill-subtitle');
        if (existingSubtitle) {
            existingSubtitle.remove();
        }

        const subtitle = document.createElement('div');
        subtitle.className = subtitleClass;
        subtitle.textContent = message;

        document.body.appendChild(subtitle);

        setTimeout(() => {
            subtitle.classList.add('subtitle-fade');
            setTimeout(() => {
                if (subtitle.parentNode) {
                    subtitle.parentNode.removeChild(subtitle);
                }
            }, 500);
        }, duration);
    }

    setBattleSpeed(speed) {
        this.battleLogic.setBattleSpeed(speed);
    }

    cloneChessUnit(unit) {
        console.log(`[Game] cloneChessUnit() - 复制棋子: ${unit.name} (${unit.star}星), isBoss: ${unit.isBoss}`);
        console.log(`[Game] cloneChessUnit() - 原始技能: ${unit.skillKey || unit.skill?.name || '无'}, secondarySkill: ${unit.secondarySkillKey || unit.secondarySkill?.name || '无'}`);
        const cloned = new ChessUnit({
            id: unit.id,
            baseId: unit.baseId,
            name: unit.name,
            star: unit.star,
            hp: unit.hp,
            maxHp: unit.maxHp,
            atk: unit.atk,
            skillKey: unit.skillKey,
            secondarySkillKey: unit.secondarySkillKey,
            camp: unit.camp,
            isMerged: unit.isMerged,
            isBoss: unit.isBoss
        });
        // 复制Boss特有的属性
        if (unit.isBoss) {
            cloned.revivalUsed = unit.revivalUsed;
            cloned.hpLossSegments = unit.hpLossSegments;
            console.log(`[Game] cloneChessUnit() - 复制Boss属性: revivalUsed=${cloned.revivalUsed}, hpLossSegments=${cloned.hpLossSegments}`);
        }
        return cloned;
    }

    initializePlayerDeck() {
        console.log('[Game] initializePlayerDeck() - 初始化玩家初始牌库');
        
        const presetChess = [
            { id: 'initial_wang', baseId: 'wang_haoxuan', name: '王昊轩', star: 1, hp: 2, atk: 2, skillKey: 'self_harm_buff', camp: '十班' },
            { id: 'initial_ni', baseId: 'ni_jiayang', name: '倪嘉阳', star: 1, hp: 3, atk: 2, skillKey: 'damage_on_hurt', camp: '十班' }
        ];

        presetChess.forEach(chessData => {
            const newChess = new ChessUnit(chessData);
            this.state.battlefield.push(newChess);
            console.log(`[Game] 添加初始棋子: ${newChess.name} (${newChess.star}星, ${newChess.camp})`);
        });
    }

    closeBattle() {
        this.battleLogic.closeBattle();
    }

    updateMergeHint() {
        const crossAreaMergeable = this.chessManager.canMergeAcrossAreas(
            this.state.battlefield, 
            this.state.bench
        );
        const mergeCount = crossAreaMergeable.reduce((sum, m) => sum + m.count, 0);
        document.getElementById('merge-count').textContent = mergeCount;
    }

    autoMerge() {
        console.log('[Game] autoMerge() 被调用');

        const crossAreaMergeable = this.chessManager.canMergeAcrossAreas(
            this.state.battlefield,
            this.state.bench
        );

        if (crossAreaMergeable.length === 0) {
            console.log('[Game] 没有可合成的棋子');
            alert('没有可合成的棋子！');
            return;
        }

        const mergeResults = [];

        crossAreaMergeable.forEach(m => {
            for (let i = 0; i < m.count; i++) {
                const newChess = this.chessManager.performMergeAcrossAreas(
                    this.state.battlefield,
                    this.state.bench,
                    m.name,
                    m.star,
                    this.state.campLevel
                );
                if (newChess) {
                    mergeResults.push({ chess: newChess, source: 'cross-area' });
                    console.log(`[Game] 跨区域合成: ${m.name} (${m.star}星) -> ${newChess.name} (${newChess.star}星, isMerged: ${newChess.isMerged})`);
                }
            }
        });

        this.renderBattlefield();
        this.renderBench();
        this.updateMergeHint();

        if (mergeResults.length > 0) {
            console.log('[Game] showMergeCelebration() 显示合成庆祝界面');

            const overlay = document.createElement('div');
            overlay.className = 'merge-overlay';
            overlay.id = 'merge-celebration-overlay';

            const dialog = document.createElement('div');
            dialog.className = 'merge-dialog merge-celebration';
            dialog.innerHTML = `
                <h3>🎉 合成成功！</h3>
                <p class="subtitle">选择以下一个随机角色免费获得</p>
                <div class="merge-reward-cards" id="merge-reward-container"></div>
                <p class="merge-hint">星级上限: ${this.state.campLevel + 1}⭐</p>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            this.generateMergeRewards(3, this.state.campLevel);

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    console.log('[Game] 用户点击背景关闭合成界面');
                    this.closeMergeDialog();
                }
            });
        }
    }

    generateMergeRewards(count, campLevel) {
        const container = document.getElementById('merge-reward-container');
        if (!container) {
            console.error('[Game] 找不到奖励容器');
            return;
        }

        container.innerHTML = '';
        const rewards = [];
        const maxStar = Math.min(campLevel + 1, 3);

        for (let i = 0; i < count; i++) {
            const randomStar = Math.floor(Math.random() * maxStar) + 1;
            const chessData = this.chessManager.getRandomChess(null, null, randomStar, '十班');
            rewards.push(chessData);

            const starColor = this.chessManager.getStarColor(randomStar);

            const card = document.createElement('div');
            card.className = 'merge-reward-card';
            card.innerHTML = `
                <div class="card-avatar" style="background: linear-gradient(135deg, #${starColor} 0%, #${starColor} 100%);"></div>
                <div class="card-name">${chessData.name}</div>
                <div class="card-stars">${'⭐'.repeat(randomStar)}</div>
                <div class="card-stats">
                    <span style="color: #fc8181;">❤${chessData.hp}</span>
                    <span style="color: #68d391;">⚔${chessData.atk}</span>
                </div>
            `;

            card.addEventListener('click', () => {
                console.log(`[Game] 玩家选择奖励: ${chessData.name} (${randomStar}星)`);
                this.selectMergeReward(chessData);
            });

            container.appendChild(card);
        }

        console.log(`[Game] 生成 ${rewards.length} 个奖励选项，最大星级: ${maxStar}，阵营: 十班`);
    }

    selectMergeReward(chessData) {
        console.log('[Game] selectMergeReward() 处理选择的奖励');

        const newChess = new ChessUnit(chessData);
        newChess.id = 'reward_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        this.state.battlefield.push(newChess);
        console.log(`[Game] 获得奖励角色: ${newChess.name} (${newChess.star}星)`);

        this.closeMergeDialog();

        this.renderBattlefield();
        this.renderBench();
        this.updateMergeHint();
        this.refreshShop();
        this.factionSystem.refresh();

        setTimeout(() => {
            alert(`恭喜获得 ${newChess.name} (${newChess.star}星)！\n❤${newChess.hp} ⚔${newChess.atk}`);
        }, 300);
    }

    closeMergeDialog() {
        const overlay = document.getElementById('merge-celebration-overlay');
        if (overlay) {
            overlay.remove();
            console.log('[Game] 关闭合成对话框');
        }
    }

    endRound(result, damageToEnemy) {
        console.log('========================================');
        console.log(`[RoundEnd] endRound() 被调用, 结果: ${result}, 伤害: ${damageToEnemy}`);
        
        this.state.round++;
        console.log(`[RoundEnd] 进入回合 ${this.state.round}`);

        this.state.currency = 0;

        this.state.baseCurrencyPerRound = Math.min(10, 1 + this.state.round - 1);

        this.state.currency += this.state.baseCurrencyPerRound;
        this.logCurrencyChange('round_income', `回合${this.state.round}基础收益`, this.state.baseCurrencyPerRound);

        if (result === 'win') {
            this.state.winStreak = (this.state.winStreak || 0) + 1;
            this.state.loseStreak = 0;

            const winBonus = Math.floor(this.state.winStreak / 3);
            if (winBonus > 0) {
                this.state.currency += winBonus;
                this.logCurrencyChange('win_bonus', `连胜奖励 x${this.state.winStreak}`, winBonus);
            }
            console.log(`[RoundEnd] 胜利! 当前连胜: ${this.state.winStreak}`);
        } else if (result === 'lose') {
            this.state.loseStreak = (this.state.loseStreak || 0) + 1;
            this.state.winStreak = 0;
            this.state.heroHp -= damageToEnemy;
            console.log(`[RoundEnd] 失败! 英雄血量: ${this.state.heroHp}`);
        }

        const goldFromCurrency = this.state.currency;
        this.state.gold += goldFromCurrency;
        this.logCurrencyChange('currency_convert', '货币转金币', goldFromCurrency);

        const baseIncome = Math.min(5, 5 + Math.floor((this.state.round - 1) * 0.5));
        const interest = Math.min(5, Math.floor(this.state.gold / 10));

        this.state.gold += baseIncome + interest;
        if (baseIncome > 0) this.logCurrencyChange('base_income', `回合基础收入`, baseIncome);
        if (interest > 0) this.logCurrencyChange('interest', `利息收入`, interest);

        console.log(`[RoundEnd] 回合结束 - 货币: ${this.state.currency}, 金币: ${this.state.gold}`);

        if (this.state.heroHp <= 0) {
            console.log('[RoundEnd] 英雄血量为0，游戏结束');
            this.state.heroHp = 0;
            this.gameOver(false);
            return;
        }

        if (this.state.round > 20) {
            console.log('[RoundEnd] 达到最大回合数，游戏结束');
            this.gameOver(true);
            return;
        }

        console.log('[RoundEnd] 刷新商店和UI...');
        this.refreshShop();
        this.renderBench();
        this.renderBattlefield();
        this.updateUI();
        
        console.log('========================================');
    }

    gameOver(isVictory) {
        console.log(`[GameOver] gameOver() 被调用, 胜利: ${isVictory}`);
        
        const gameOverEl = document.getElementById('game-over');
        const resultEl = document.getElementById('game-result');
        const statsEl = document.getElementById('final-stats');

        resultEl.textContent = isVictory ? '🎉 胜利！' : '💀 失败';
        statsEl.innerHTML = `
            最终回合: ${this.state.round}<br>
            营帐等级: ${this.state.campLevel}<br>
            存活棋子: ${this.state.battlefield.length}
        `;

        gameOverEl.classList.remove('hidden');
        
        console.log('[GameOver] 游戏结束界面已显示');
    }
}

window.Game = Game;