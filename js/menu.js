/**
 * 菜单系统
 * 联合演习 - 回合制自走棋
 * 
 * 包含MenuSystem类
 * 负责游戏菜单、设置、公告、开发者模式等功能
 */

class MenuSystem {
    constructor() {
        this.currentMenu = 'start';
        this.isInitialized = false;
        this.isDevMode = false;
        this.devPassword = '123456';
        this.init();
    }

    init() {
        try {
            console.log('MenuSystem: 开始初始化...');
            console.log('MenuSystem: 检查 DOM 元素...');

            const menu = document.getElementById('start-menu');
            const gameContainer = document.getElementById('game-container');

            if (!menu) {
                console.error('MenuSystem: 找不到 #start-menu 元素');
                return;
            }

            if (!gameContainer) {
                console.error('MenuSystem: 找不到 #game-container 元素');
                return;
            }

            this.bindEvents();
            this.setKeyboardNav();
            this.bindDeveloperEvents();
            this.initAnnouncementSystem();
            this.isInitialized = true;

            console.log('MenuSystem: 初始化完成');
        } catch (error) {
            console.error('MenuSystem: 初始化错误', error);
            alert('菜单系统初始化失败: ' + error.message);
        }
    }

    bindEvents() {
        console.log('MenuSystem: 绑定按钮事件...');

        const menuButtons = document.querySelectorAll('.menu-btn');
        console.log(`MenuSystem: 找到 ${menuButtons.length} 个菜单按钮`);

        if (menuButtons.length === 0) {
            console.error('MenuSystem: 没有找到任何菜单按钮！');
            return;
        }

        menuButtons.forEach((btn, index) => {
            const action = btn.dataset.action;
            console.log(`MenuSystem: 绑定按钮 ${index}: action=${action}`);

            if (!action) {
                console.error(`MenuSystem: 按钮 ${index} 缺少 data-action 属性`);
                return;
            }

            // 直接添加点击事件
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`MenuSystem: 按钮点击事件触发 - ${action}`);
                this.handleMenuAction(action);
            });

            // 添加强制反馈
            btn.addEventListener('mousedown', (e) => {
                e.preventDefault();
                btn.style.transform = 'scale(0.95)';
                btn.style.background = 'rgba(72, 187, 120, 0.5)';
            });

            btn.addEventListener('mouseup', () => {
                btn.style.transform = '';
                btn.style.background = '';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.background = '';
            });

            btn.addEventListener('mouseenter', () => {
                document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentMenuIndex = index;
            });
        });

        // 绑定设置界面按钮
        this.bindSettingsEvents();

        console.log('MenuSystem: 按钮事件绑定完成');
    }

    bindSettingsEvents() {
        console.log('MenuSystem: 绑定设置界面事件...');

        // 关闭设置按钮
        const closeSettingsBtn = document.getElementById('close-settings');
        if (closeSettingsBtn) {
            closeSettingsBtn.addEventListener('click', () => {
                console.log('MenuSystem: 关闭设置界面');
                const settingsOverlay = document.getElementById('settings-overlay');
                if (settingsOverlay) {
                    settingsOverlay.classList.add('hidden');
                }
            });
        }

        // 文本大小滑块
        const textSizeSlider = document.getElementById('text-size');
        if (textSizeSlider) {
            textSizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                console.log(`MenuSystem: 调整文本大小 - ${size}px`);
                this.setTextSize(size);
            });
        }

        // 战斗速度按钮
        const speedBtns = document.querySelectorAll('.speed-btn');
        speedBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const speed = parseFloat(e.target.dataset.speed);
                console.log(`MenuSystem: 设置战斗速度 - ${speed}x`);

                // 更新按钮状态
                speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.setBattleSpeed(speed);
            });
        });

        // 颜色对比度按钮
        const contrastBtns = document.querySelectorAll('.contrast-btn');
        contrastBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contrast = e.target.dataset.contrast;
                console.log(`MenuSystem: 设置对比度 - ${contrast}`);

                // 更新按钮状态
                contrastBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.setContrast(contrast);
            });
        });

        // 教程难度按钮
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.target.dataset.difficulty;
                console.log(`MenuSystem: 设置教程难度 - ${difficulty}`);

                // 更新按钮状态
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.setTutorialDifficulty(difficulty);
            });
        });

        console.log('MenuSystem: 设置界面事件绑定完成');
    }

    setKeyboardNav() {
        let menuIndex = 0;
        const menuButtons = document.querySelectorAll('.menu-btn');

        document.addEventListener('keydown', (e) => {
            const startMenu = document.getElementById('start-menu');
            if (!startMenu || startMenu.classList.contains('hidden')) return;

            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    menuIndex = Math.max(0, menuIndex - 1);
                    this.updateActiveButton(menuIndex);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    menuIndex = Math.min(menuButtons.length - 1, menuIndex + 1);
                    this.updateActiveButton(menuIndex);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    const activeBtn = menuButtons[menuIndex];
                    if (activeBtn) {
                        console.log(`MenuSystem: 键盘确认 - ${activeBtn.dataset.action}`);
                        this.handleMenuAction(activeBtn.dataset.action);
                    }
                    break;
            }
        });
    }

    updateActiveButton(index) {
        const menuButtons = document.querySelectorAll('.menu-btn');
        menuButtons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    }

    handleMenuAction(action) {
        console.log(`MenuSystem: 处理动作 - ${action}`);

        if (action === 'log') {
            console.log('MenuSystem: 显示更新日志');
            this.showAnnouncement(true);
            return;
        }

        switch(action) {
            case 'start':
                this.startGame();
                break;
            case 'tutorial':
                this.showTutorial();
                break;
            case 'settings':
                this.showSettings();
                break;
            default:
                console.error(`MenuSystem: 未知动作 - ${action}`);
                alert('未知操作: ' + action);
        }
    }

    startGame() {
        console.log('MenuSystem: 开始游戏...');

        const startMenu = document.getElementById('start-menu');
        const gameContainer = document.getElementById('game-container');

        if (!startMenu) {
            console.error('MenuSystem: 找不到 #start-menu');
            alert('错误: 找不到菜单元素');
            return;
        }

        if (!gameContainer) {
            console.error('MenuSystem: 找不到 #game-container');
            alert('错误: 找不到游戏容器');
            return;
        }

        try {
            console.log('MenuSystem: 隐藏菜单, 显示游戏容器');

            // 立即隐藏菜单，防止重复点击
            startMenu.style.display = 'none';
            startMenu.classList.add('hidden');
            gameContainer.classList.remove('hidden');

            console.log('MenuSystem: 菜单已隐藏, 游戏容器已显示');

            // 初始化游戏
            if (!window.game) {
                console.log('MenuSystem: 正在创建 Game 实例...');
                try {
                    window.game = new Game();
                    console.log('MenuSystem: Game 实例已创建成功');
                } catch (gameError) {
                    console.error('MenuSystem: Game 实例创建失败', gameError);
                    alert('游戏初始化失败: ' + gameError.message);
                    startMenu.style.display = '';
                    startMenu.classList.remove('hidden');
                    gameContainer.classList.add('hidden');
                }
            }

            setTimeout(() => {
                this.checkAndShowAnnouncement();
            }, 500);
        } catch (error) {
            console.error('MenuSystem: 启动游戏时出错', error);
            alert('启动游戏时出错: ' + error.message);
        }
    }

    showTutorial() {
        console.log('MenuSystem: 显示教程...');

        if (window.tutorialSystem) {
            window.tutorialSystem.start();
        } else {
            console.error('MenuSystem: TutorialSystem 未加载');
            alert('教程系统未加载');
        }
    }

    showSettings() {
        console.log('MenuSystem: 显示设置...');

        const settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.classList.remove('hidden');
        } else {
            console.error('MenuSystem: 找不到设置界面');
        }
    }

    setTextSize(size) {
        document.body.style.fontSize = `${size}px`;
    }

    setBattleSpeed(speed) {
        if (window.game) {
            window.game.battleSpeed = speed;
        }
        if (window.Battle) {
            window.Battle.speedMultiplier = parseFloat(speed);
        }
    }

    setContrast(mode) {
        if (mode === 'high') {
            document.body.style.filter = 'contrast(1.3)';
        } else {
            document.body.style.filter = 'contrast(1)';
        }
    }

    setTutorialDifficulty(difficulty) {
        if (window.tutorialSystem) {
            window.tutorialSystem.difficulty = difficulty;
        }
    }

    bindDeveloperEvents() {
        console.log('MenuSystem: 绑定开发者模式事件...');

        const unlockBtn = document.getElementById('unlock-dev-mode');
        const passwordInput = document.getElementById('dev-password');

        if (unlockBtn && passwordInput) {
            unlockBtn.addEventListener('click', () => {
                const password = passwordInput.value;
                if (password === this.devPassword) {
                    this.isDevMode = true;
                    this.showDevModeSection();
                    alert('🎉 开发者模式已解锁！');
                    passwordInput.value = '';
                } else {
                    alert('❌ 密码错误！');
                    passwordInput.value = '';
                }
            });

            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    unlockBtn.click();
                }
            });
        }

        const openDevPanelBtn = document.getElementById('open-developer-panel');
        if (openDevPanelBtn) {
            openDevPanelBtn.addEventListener('click', () => {
                this.showDeveloperPanel();
            });
        }

        console.log('MenuSystem: 开发者模式事件绑定完成');
    }

    showDevModeSection() {
        const devSection = document.getElementById('developer-mode-section');
        if (devSection) {
            devSection.style.display = 'block';
            devSection.style.animation = 'fadeIn 0.3s ease';
        }

        const devPanelBtn = document.getElementById('dev-panel-btn');
        if (devPanelBtn) {
            devPanelBtn.style.display = 'inline-block';
            devPanelBtn.style.animation = 'fadeIn 0.3s ease';
        }
    }

    showDeveloperPanel() {
        if (!this.isDevMode) {
            alert('请先解锁开发者模式！');
            return;
        }

        const existingPanel = document.getElementById('developer-panel-overlay');
        if (existingPanel) {
            existingPanel.remove();
        }

        const overlay = document.createElement('div');
        overlay.className = 'developer-panel-overlay';
        overlay.id = 'developer-panel-overlay';

        overlay.innerHTML = `
            <div class="developer-panel">
                <h3>🔧 开发者面板</h3>
                
                <div class="dev-section">
                    <h4>💰 货币控制</h4>
                    <div class="dev-controls">
                        <button class="dev-btn" onclick="window.menuSystem.devAddGold(100)">+100 金币</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddGold(500)">+500 金币</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddGold(1000)">+1000 金币</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddCurrency(10)">+10 货币</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddCurrency(50)">+50 货币</button>
                    </div>
                </div>
                
                <div class="dev-section">
                    <h4>🏠 营帐控制</h4>
                    <div class="dev-controls">
                        <button class="dev-btn info" onclick="window.menuSystem.devSetCampLevel(1)">营帐 1级</button>
                        <button class="dev-btn info" onclick="window.menuSystem.devSetCampLevel(2)">营帐 2级</button>
                        <button class="dev-btn info" onclick="window.menuSystem.devSetCampLevel(3)">营帐 3级</button>
                        <button class="dev-btn info" onclick="window.menuSystem.devSetCampLevel(4)">营帐 4级</button>
                        <button class="dev-btn info" onclick="window.menuSystem.devSetCampLevel(5)">营帐 5级</button>
                        <button class="dev-btn info" onclick="window.menuSystem.devSetCampLevel(6)">营帐 6级</button>
                    </div>
                </div>
                
                <div class="dev-section">
                    <h4>❤️ 血量控制</h4>
                    <div class="dev-controls">
                        <button class="dev-btn warning" onclick="window.menuSystem.devRestoreHp()">恢复满血</button>
                        <button class="dev-btn warning" onclick="window.menuSystem.devAddHp(10)">+10 血量</button>
                        <button class="dev-btn warning" onclick="window.menuSystem.devAddHp(50)">+50 血量</button>
                        <button class="dev-btn danger" onclick="window.menuSystem.devDamageHero(10)">-10 血量</button>
                        <button class="dev-btn danger" onclick="window.menuSystem.devDamageHero(50)">-50 血量</button>
                    </div>
                </div>
                
                <div class="dev-section">
                    <h4>⚔️ 回合控制</h4>
                    <div class="dev-controls">
                        <button class="dev-btn" onclick="window.menuSystem.devAddRound(1)">+1 回合</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddRound(5)">+5 回合</button>
                        <button class="dev-btn" onclick="window.menuSystem.devSetRound(1)">重置回合</button>
                    </div>
                </div>
                
                <div class="dev-section">
                    <h4>🎁 角色控制</h4>
                    <div class="dev-controls">
                        <button class="dev-btn" onclick="window.menuSystem.devAddRandomChess(1)">获得随机1星</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddRandomChess(2)">获得随机2星</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddRandomChess(3)">获得随机3星</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddRandomChess(4)">获得随机4星</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddRandomChess(5)">获得随机5星</button>
                        <button class="dev-btn" onclick="window.menuSystem.devAddRandomChess(6)">获得随机6星</button>
                    </div>
                </div>
                
                <button class="dev-close-btn" onclick="window.menuSystem.closeDeveloperPanel()">关闭面板</button>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeDeveloperPanel();
            }
        });
    }

    closeDeveloperPanel() {
        const panel = document.getElementById('developer-panel-overlay');
        if (panel) {
            panel.remove();
        }
    }

    devAddGold(amount) {
        if (window.game) {
            window.game.state.gold += amount;
            window.game.updateUI();
            console.log(`[Dev] 增加金币: +${amount}, 当前: ${window.game.state.gold}`);
            this.showDevNotification(`金币 +${amount}`);
        }
    }

    devAddCurrency(amount) {
        if (window.game) {
            window.game.state.currency += amount;
            window.game.updateUI();
            console.log(`[Dev] 增加货币: +${amount}, 当前: ${window.game.state.currency}`);
            this.showDevNotification(`货币 +${amount}`);
        }
    }

    devSetCampLevel(level) {
        if (window.game) {
            window.game.state.campLevel = Math.min(6, Math.max(1, level));
            window.game.refreshShop();
            window.game.updateUI();
            console.log(`[Dev] 设置营帐等级: ${window.game.state.campLevel}`);
            this.showDevNotification(`营帐等级: ${window.game.state.campLevel}级`);
        }
    }

    devRestoreHp() {
        if (window.game) {
            window.game.state.heroHp = 30;
            window.game.updateUI();
            console.log(`[Dev] 恢复满血: ${window.game.state.heroHp}`);
            this.showDevNotification('英雄血量已恢复满！');
        }
    }

    devAddHp(amount) {
        if (window.game) {
            window.game.state.heroHp = Math.min(30, window.game.state.heroHp + amount);
            window.game.updateUI();
            console.log(`[Dev] 增加血量: +${amount}, 当前: ${window.game.state.heroHp}`);
            this.showDevNotification(`血量 +${amount}`);
        }
    }

    devDamageHero(amount) {
        if (window.game) {
            window.game.state.heroHp = Math.max(0, window.game.state.heroHp - amount);
            window.game.updateUI();
            console.log(`[Dev] 减少血量: -${amount}, 当前: ${window.game.state.heroHp}`);
            this.showDevNotification(`血量 -${amount}`);
        }
    }

    devAddRound(amount) {
        if (window.game) {
            window.game.state.round += amount;
            window.game.updateUI();
            console.log(`[Dev] 增加回合: +${amount}, 当前: ${window.game.state.round}`);
            this.showDevNotification(`回合 +${amount}`);
        }
    }

    devSetRound(round) {
        if (window.game) {
            window.game.state.round = Math.max(1, round);
            window.game.updateUI();
            console.log(`[Dev] 设置回合: ${window.game.state.round}`);
            this.showDevNotification(`回合数: ${window.game.state.round}`);
        }
    }

    devAddRandomChess(star) {
        if (window.game) {
            const campLevel = window.game.state.campLevel;
            const cappedStar = Math.min(star, campLevel);
            const chessData = window.game.chessManager.getRandomChess(cappedStar);
            const newChess = new ChessUnit(chessData);
            newChess.id = 'dev_' + Date.now();
            
            if (window.game.state.battlefield.length < 7) {
                window.game.state.battlefield.push(newChess);
            } else {
                window.game.state.bench.push(newChess);
            }
            
            window.game.renderBattlefield();
            window.game.renderBench();
            window.game.updateMergeHint();
            
            console.log(`[Dev] 获得角色: ${newChess.name} (${newChess.star}星)`);
            this.showDevNotification(`获得 ${newChess.name} (${newChess.star}⭐)`);
        }
    }

    showDevNotification(message) {
        const existing = document.querySelector('.dev-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'dev-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(72, 187, 120, 0.5);
            animation: slideDown 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    initAnnouncementSystem() {
        console.log('MenuSystem: 初始化公告系统...');

        this.announcements = [
            {
                id: 'v1.3.3.7',
                version: 'V1.3.3.7',
                title: '阵营系统重磅来袭！',
                date: '2026-05-22',
                body: `
                    <p>本次更新带来完整的阵营羁绊系统！</p>
                    <ul>
                        <li><strong>🏆 阵营系统</strong></li>
                        <ul>
                            <li>所有阵营需要3人触发效果</li>
                            <li>支持无限叠层，效果持续增强</li>
                            <li>左侧阵营显示区域，实时更新当前触发状态</li>
                            <li>右键阵营图标查看详细加成效果</li>
                        </ul>
                        <li><strong>✨ 特殊羁绊词缀</strong></li>
                        <ul>
                            <li><strong>强攻</strong>：提供攻击力、暴击率、暴击伤害加成</li>
                            <li><strong>数学</strong>：提升技能成功率，提供伤害取整</li>
                            <li><strong>计算机</strong>：允许同时触发多个相同主阵营</li>
                            <li><strong>护盾</strong>：提供护盾、反伤、破碎免疫</li>
                            <li><strong>燃尽</strong>：回合伤害、范围传递、传递增强</li>
                        </ul>
                        <li><strong>🎓 主阵营</strong></li>
                        <ul>
                            <li><strong>10班</strong>：综合辅助、概率触发</li>
                            <li><strong>9班</strong>：燃尽、受伤</li>
                            <li><strong>14班</strong>：护盾、强攻</li>
                        </ul>
                        <li><strong>🎯 子阵营</strong></li>
                        <ul>
                            <li>受伤系、开战系、招募系、辅助系、概率触发系</li>
                            <li>强攻系、燃尽系、护盾系</li>
                        </ul>
                        <li><strong>📊 公式化计算</strong></li>
                        <ul>
                            <li>所有效果使用数学公式动态计算</li>
                            <li>层数 = 上阵人数 - 最低触发人数 + 1</li>
                            <li>线性增长 + 阈值触发双模式</li>
                        </ul>
                        <li><strong>🎮 角色详情升级</strong></li>
                        <ul>
                            <li>图鉴详情面板显示阵营信息</li>
                            <li>游戏内卡牌详情显示阵营信息</li>
                            <li>图鉴卡片上显示阵营标签</li>
                            <li>所有棋子已配置完整阵营数据</li>
                        </ul>
                    </ul>
                `
            },
            {
                id: 'v1.3.3.6',
                version: 'V1.3.3.6',
                title: 'Boss系统正式登场！',
                date: '2026-05-15',
                body: `
                    <p>本次更新带来全新的Boss敌人系统！</p>
                    <ul>
                        <li><strong>🎮 Boss系统</strong></li>
                        <ul>
                            <li>Boss在第10、20、30…等10的倍数回合出现</li>
                            <li>首个Boss：暗影领主（200HP，1攻击，无所属阵营）</li>
                            <li>Boss出场警告提示（第5、15、25…等回合提前5回合预警）</li>
                            <li>Boss介绍弹窗，玩家确认后开始对战</li>
                        </ul>
                        <li><strong>⚡ Boss技能</strong></li>
                        <ul>
                            <li>血之诅咒：每损失10%血量对敌方全体造成当前血量1%的伤害</li>
                            <li>回光返照：血量低于50%时触发，恢复满血但生命上限降低25%</li>
                        </ul>
                        <li><strong>💎 合成系统优化</strong></li>
                        <ul>
                            <li>支持战场和替补席的棋子同时检测合成</li>
                            <li>合成后的棋子自动放入棋子较少的区域</li>
                        </ul>
                        <li><strong>🛒 购买系统升级</strong></li>
                        <ul>
                            <li>战场满7个棋子时，购买的自动放入替补席</li>
                            <li>替补席容量增加至9个棋子</li>
                        </ul>
                        <li><strong>📦 代码重构</strong></li>
                        <ul>
                            <li>拆分chess.js文件，新增data.js和boss.js</li>
                            <li>优化模块结构，解决上下文过长问题</li>
                        </ul>
                        <li><strong>🔧 修复与优化</strong></li>
                        <ul>
                            <li>修复战斗动画中的变量引用错误</li>
                            <li>修复Boss技能不生效问题</li>
                            <li>完善战斗日志记录系统</li>
                        </ul>
                    </ul>
                `
            },
            {
                id: 'v1.3.3.5',
                version: 'V1.3.3.5',
                title: '4-6星角色登场与战斗平衡大更新！',
                date: '2026-05-12',
                body: `
                    <p>本次更新带来全新的4-6星角色和战斗系统平衡调整！</p>
                    <ul>
                        <li>新增11个4-6星十班角色：</li>
                        <ul>
                            <li>⭐⭐⭐⭐ 牟新雨（愈战愈勇）：自身每受两次伤，随机获得1张学生</li>
                            <li>⭐⭐⭐⭐ 邓行知（永不言弃）：友方概率类技能失败时重试，成功时永久+2/+2</li>
                            <li>⭐⭐⭐⭐ 张之缈（同甘共苦）：受伤时使全体友方永久+1/+1</li>
                            <li>⭐⭐⭐⭐ 董润羲（连环增益）：开战时50%概率+4/+4并再次判定，最多4次</li>
                            <li>⭐⭐⭐⭐⭐ 马皓轩（幸运加持）：友方概率类技能概率提高25%</li>
                            <li>⭐⭐⭐⭐⭐ 杨东兴（同舟共济）：友方受伤时使随机3个友方永久+1/+2</li>
                            <li>⭐⭐⭐⭐⭐ 刘岳（凤凰涅槃）：受伤时50%概率使全体友方永久+2/+3</li>
                            <li>⭐⭐⭐⭐⭐ 周奕辰（借势而为）：开战时获得左侧友方属性值</li>
                            <li>⭐⭐⭐⭐⭐⭐ 董浩铭（左膀右臂）：受伤时50%概率使左侧友方永久+3/+6</li>
                            <li>⭐⭐⭐⭐⭐⭐ 李佳轩（幸运一击）：概率技能成功时对随机敌方造成攻击力1/4伤害</li>
                            <li>⭐⭐⭐⭐⭐⭐ 宫伯洋（同仇敌忾）：友方被攻击时对全体角色造成1点伤害</li>
                        </ul>
                        <li>调整敌人预设难度：每回合难度提升（第1回合难度1，第2回合难度2...）</li>
                        <li>敌人角色现在无技能，仅通过属性提升来增加难度</li>
                        <li>增加6-10级敌人预设，队伍更庞大，属性更强悍</li>
                        <li>战场容量：双方最多同时上阵7个角色</li>
                        <li>修复多个技能在测试和战斗中的报错问题</li>
                    </ul>
                `
            },
            {
                id: 'v1.3.3.2',
                version: 'V1.3.3.2',
                title: '技能系统优化与2-3星角色登场！',
                date: '2026-05-10',
                body: `
                    <p>本次更新对技能系统和角色阵容进行了重大扩展！</p>
                    <ul>
                        <li>新增7个2-3星十班角色：</li>
                        <ul>
                            <li>⭐⭐ 张皓军（激励之击）：攻击时使全体友方血量+1，然后对自己造成1点伤害</li>
                            <li>⭐⭐ 马铭泽（财运亨通）：招募结束时50%概率获得2金币</li>
                            <li>⭐⭐ 刘奕辰（全员治愈）：招募结束时使全体友方血量永久+1</li>
                            <li>⭐⭐⭐ 黄彦程（浴血奋战）：受伤时50%概率永久+1/+2</li>
                            <li>⭐⭐⭐ 李嗣坤（概率增幅）：友方概率类技能成功触发时，使其永久+2/+2</li>
                            <li>⭐⭐⭐ 刘祎盟（精打细算）：受伤时50%概率使营帐升级价格-1</li>
                            <li>⭐⭐⭐ 孙方浩（战友情深）：开战时对两侧友方造成1点伤害，使其永久+1/+1</li>
                        </ul>
                        <li>营帐等级提升后可刷新更高等级的角色（可刷新角色最高等级≤营帐等级）</li>
                        <li>技能提示现在能正确显示在对应卡牌的正中央位置</li>
                        <li>优化战斗定位系统，确保所有技能效果精准定位</li>
                    </ul>
                `
            },
            {
                id: 'v1.3.3',
                version: 'V1.3.3',
                title: '战斗体验全面优化！',
                date: '2026-05-09',
                body: `
                    <p>本次更新对战斗系统和UI进行了全面优化！</p>
                    <ul>
                        <li>新增角色详情面板，悬停1秒后显示详细信息（血量、攻击、技能）</li>
                        <li>添加角色血量条，实时显示血量百分比和颜色变化</li>
                        <li>战斗中的技能触发提示现在显示在对应角色位置</li>
                        <li>优化死亡判定逻辑，修复属性提升bug</li>
                        <li>修复角色详情面板自动关闭干扰合成奖励页面的问题</li>
                    </ul>
                `
            },
            {
                id: 'v1.3.2.1',
                version: 'V1.3.2.1',
                title: '平衡调整与合成优化！',
                date: '2026-05-09',
                body: `
                    <p>本次更新对游戏平衡和奖励系统进行了优化！</p>
                    <ul>
                        <li>敌方角色数值全面调整，与玩家十班角色数值相近</li>
                        <li>合成奖励现在只能从十班角色中抽取</li>
                        <li>新增更多敌方角色配置，提供更好的游戏体验</li>
                    </ul>
                `
            },
            {
                id: 'v1.3.2',
                version: 'V1.3.2',
                title: '十班角色登场！',
                date: '2026-05-09',
                body: `
                    <p>本次更新新增十班角色！</p>
                    <ul>
                        <li>新增十班一星角色：王昊轩、倪嘉阳</li>
                        <li>王昊轩：开战时对自己造成1点伤害；受伤时永久+1/+1</li>
                        <li>倪嘉阳：受伤时对随机敌方造成2点伤害</li>
                        <li>商店现在只显示十班角色</li>
                        <li>新增技能触发特效显示</li>
                    </ul>
                `
            },
            {
                id: 'v1.3.1',
                version: 'V1.3.1',
                title: '优化公告系统与手机端适配',
                date: '2026-05-09',
                body: `
                    <p>本次更新优化了公告系统和游戏适配！</p>
                    <ul>
                        <li>将更新日志按钮移至主菜单</li>
                        <li>优化手机端刷新商店按钮显示</li>
                        <li>完善横屏适配体验</li>
                    </ul>
                `
            },
            {
                id: 'v1.3',
                version: 'V1.3.0',
                title: '新增角色合成系统与开发者模式',
                date: '2026-05-09',
                body: `
                    <p>本次更新带来了全新的角色合成系统和开发者调试工具！</p>
                    <ul>
                        <li>新增角色合成功能：集齐3个相同角色可合成金边卡牌</li>
                        <li>金边卡牌属性提升：攻击+1，血量+1</li>
                        <li>合成奖励：每次合成后可在3个随机角色中选择1个</li>
                        <li>新增开发者模式：通过密码123456解锁</li>
                        <li>支持营帐6级和6星角色</li>
                        <li>新增12种角色技能</li>
                    </ul>
                `
            },
            {
                id: 'v1.2',
                version: 'V1.2.0',
                title: '手机端横屏适配',
                date: '2026-05-09',
                body: `
                    <p>游戏现已支持手机端横屏游玩！</p>
                    <ul>
                        <li>新增横屏提示界面</li>
                        <li>优化手机端触摸操作</li>
                        <li>调整刷新商店按钮大小</li>
                        <li>响应式布局适配各种屏幕尺寸</li>
                    </ul>
                `
            },
            {
                id: 'v1.1',
                version: 'V1.1.0',
                title: '战斗系统优化',
                date: '2026-05-08',
                body: `
                    <p>战斗系统进行了多项优化！</p>
                    <ul>
                        <li>新增战斗速度控制（0.5x - 2x）</li>
                        <li>优化战斗动画效果</li>
                        <li>修复战斗结算问题</li>
                    </ul>
                `
            }
        ];

        this.lastReadAnnouncement = localStorage.getItem('lastReadAnnouncement') || '';
        this.sessionShowedAnnouncement = false;

        this.bindAnnouncementEvents();
        console.log('MenuSystem: 公告系统初始化完成');
    }

    bindAnnouncementEvents() {
        const closeBtn = document.getElementById('close-announcement');
        const confirmBtn = document.getElementById('confirm-announcement');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeAnnouncement();
            });
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.closeAnnouncement();
            });
        }

        const overlay = document.getElementById('announcement-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeAnnouncement();
                }
            });
        }

        console.log('MenuSystem: 公告事件绑定完成');
    }

    checkAndShowAnnouncement() {
        if (this.sessionShowedAnnouncement) {
            return;
        }

        const latestAnnouncement = this.announcements[0];
        if (latestAnnouncement && latestAnnouncement.id !== this.lastReadAnnouncement) {
            this.sessionShowedAnnouncement = true;
            this.showAnnouncement(false);
        }
    }

    showAnnouncement(isManual) {
        const overlay = document.getElementById('announcement-overlay');
        const content = document.getElementById('announcement-content');

        if (!overlay || !content) {
            console.error('MenuSystem: 找不到公告元素');
            return;
        }

        content.innerHTML = '';

        this.announcements.forEach(announcement => {
            const item = document.createElement('div');
            item.className = 'announcement-item';
            item.innerHTML = `
                <span class="announcement-version">${announcement.version}</span>
                <div class="announcement-title">${announcement.title}</div>
                <div class="announcement-date">${announcement.date}</div>
                <div class="announcement-body">${announcement.body}</div>
            `;
            content.appendChild(item);
        });

        overlay.classList.remove('hidden');
        console.log('MenuSystem: 显示更新公告');
    }

    closeAnnouncement() {
        const overlay = document.getElementById('announcement-overlay');
        const dontShowAgain = document.getElementById('dont-show-again');

        if (overlay) {
            overlay.classList.add('hidden');
        }

        if (dontShowAgain && dontShowAgain.checked) {
            const latestAnnouncement = this.announcements[0];
            if (latestAnnouncement) {
                this.lastReadAnnouncement = latestAnnouncement.id;
                localStorage.setItem('lastReadAnnouncement', this.lastReadAnnouncement);
            }
        }

        console.log('MenuSystem: 关闭公告');
    }
}
