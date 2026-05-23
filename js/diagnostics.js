/**
 * 系统诊断工具
 * 联合演习 - 回合制自走棋
 * 
 * 包含BattleSystemDiagnostics类
 * 负责系统诊断、日志记录、错误检测等功能
 */

class BattleSystemDiagnostics {
    constructor() {
        this.logs = [];
        this.errors = [];
        this.warnings = [];
        this.startTime = Date.now();
        this.isEnabled = true;
    }

    log(category, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            category,
            message,
            data,
            type: 'log'
        };
        this.logs.push(entry);
        console.log(`[${category}] ${message}`, data || '');
        return entry;
    }

    error(category, message, error = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            category,
            message,
            error: error?.message || error?.stack || error,
            type: 'error'
        };
        this.errors.push(entry);
        console.error(`[${category}] ERROR: ${message}`, error || '');
        return entry;
    }

    warn(category, message, data = null) {
        const entry = {
            timestamp: new Date().toISOString(),
            category,
            message,
            data,
            type: 'warn'
        };
        this.warnings.push(entry);
        console.warn(`[${category}] WARNING: ${message}`, data || '');
        return entry;
    }

    async runFullDiagnostics() {
        this.log('Diagnostics', '=== 开始系统诊断 ===');

        const results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };

        results.tests.push(await this.checkChessDataIntegrity());
        results.tests.push(await this.checkChessManagerMerge());
        results.tests.push(await this.checkBattleSystem());
        results.tests.push(await this.checkUIComponents());
        results.tests.push(await this.checkSpeedControls());
        results.tests.push(await this.checkAnimationSystem());
        results.tests.push(await this.checkSettingsSystem());

        results.tests.forEach(test => {
            if (test.status === 'pass') results.passed++;
            else if (test.status === 'fail') results.failed++;
            else if (test.status === 'warn') results.warnings++;
        });

        this.log('Diagnostics', '=== 诊断完成 ===', results);

        return results;
    }

    async checkChessDataIntegrity() {
        const test = { name: '棋子数据完整性', status: 'pass', details: [] };

        try {
            if (!window.CHESS_DATA || !window.CHESS_DATA.pool) {
                test.status = 'fail';
                test.details.push('错误: CHESS_DATA 未定义或格式不正确');
                return test;
            }

            const pool = window.CHESS_DATA.pool;
            this.log('Diagnostics', `检查棋子池: 共 ${pool.length} 个棋子`);

            const starGroups = { 1: [], 2: [], 3: [] };

            pool.forEach((chess, index) => {
                if (!chess.name || !chess.star) {
                    test.status = 'fail';
                    test.details.push(`棋子 #${index + 1} 缺少必要字段`);
                }

                if (chess.star >= 1 && chess.star <= 3) {
                    starGroups[chess.star].push(chess);
                }
            });

            test.details.push(`1星棋子: ${starGroups[1].length}, 2星棋子: ${starGroups[2].length}, 3星棋子: ${starGroups[3].length}`);

            if (pool.length < 10) {
                test.status = 'warn';
                test.details.push(`警告: 棋子池数量较少 (${pool.length}个)`);
            }

        } catch (error) {
            test.status = 'fail';
            test.details.push(`错误: ${error.message}`);
            this.error('Diagnostics', '棋子数据检查失败', error);
        }

        return test;
    }

    async checkChessManagerMerge() {
        const test = { name: '棋子合成系统', status: 'pass', details: [] };

        try {
            if (!window.ChessManager) {
                test.status = 'fail';
                test.details.push('错误: ChessManager 未定义');
                return test;
            }

            const manager = new ChessManager();
            this.log('ChessManager', '创建 ChessManager 实例进行测试');

            const mockChessList = [
                { id: 'test1', name: '学生A', star: 1, hp: 100, atk: 20, skill: '攻击提升', camp: '一班' },
                { id: 'test2', name: '学生A', star: 1, hp: 100, atk: 20, skill: '攻击提升', camp: '一班' },
                { id: 'test3', name: '学生A', star: 1, hp: 100, atk: 20, skill: '攻击提升', camp: '一班' }
            ];

            const chessUnits = mockChessList.map(c => new ChessUnit(c));
            this.log('ChessManager', `创建测试棋子: ${chessUnits.length}个 1星学生A`);

            const canMergeResult = manager.canMerge(chessUnits);
            test.details.push(`canMerge 检测到 ${canMergeResult.length} 个可合成组`);

            if (canMergeResult.length > 0) {
                const mergeResult = manager.performMerge(chessUnits, canMergeResult[0].name, canMergeResult[0].star);

                if (mergeResult) {
                    test.details.push(`合成成功: 获得 ${mergeResult.name} (${mergeResult.star}星, 金边: ${mergeResult.isMerged})`);

                    if (!mergeResult.isMerged) {
                        test.status = 'fail';
                        test.details.push(`错误: 合成结果应该是金边卡牌`);
                    }

                    if (mergeResult.hp <= 0 || mergeResult.atk <= 0) {
                        test.status = 'fail';
                        test.details.push(`错误: 合成结果属性不正确! HP: ${mergeResult.hp}, ATK: ${mergeResult.atk}`);
                    }

                } else {
                    test.status = 'fail';
                    test.details.push('错误: performMerge 返回 null');
                    this.error('ChessManager', '合成测试失败: performMerge 返回 null');
                }
            } else {
                test.status = 'fail';
                test.details.push('错误: canMerge 未检测到可合成组');
            }

        } catch (error) {
            test.status = 'fail';
            test.details.push(`错误: ${error.message}`);
            this.error('ChessManager', '棋子合成检查失败', error);
        }

        return test;
    }

    async checkBattleSystem() {
        const test = { name: '战斗系统', status: 'pass', details: [] };

        try {
            if (!window.Battle) {
                test.status = 'fail';
                test.details.push('错误: Battle 类未定义');
                return test;
            }

            const battleElements = {
                overlay: document.getElementById('battle-overlay'),
                container: document.getElementById('battle-container'),
                field: document.getElementById('battle-field'),
                playerUnits: document.getElementById('player-units'),
                enemyUnits: document.getElementById('enemy-units'),
                speedControls: document.getElementById('battle-speed-controls')
            };

            Object.entries(battleElements).forEach(([name, element]) => {
                if (!element) {
                    test.status = 'fail';
                    test.details.push(`错误: 缺少战斗UI元素 #${name}`);
                } else {
                    test.details.push(`✓ 战斗UI元素 #${name} 存在`);
                }
            });

            const speedBtns = document.querySelectorAll('.battle-speed-btn');
            if (speedBtns.length < 4) {
                test.status = 'fail';
                test.details.push(`错误: 速度按钮数量不足! 需要4个, 实际${speedBtns.length}个`);
            } else {
                const speeds = Array.from(speedBtns).map(btn => btn.dataset.speed);
                const expectedSpeeds = ['0.5', '1', '1.5', '2'];
                const hasAllSpeeds = expectedSpeeds.every(s => speeds.includes(s));

                if (hasAllSpeeds) {
                    test.details.push(`✓ 速度按钮配置正确: ${speeds.join(', ')}`);
                } else {
                    test.status = 'fail';
                    test.details.push(`错误: 速度按钮配置不正确! 期望 ${expectedSpeeds.join(', ')}, 实际 ${speeds.join(', ')}`);
                }
            }

        } catch (error) {
            test.status = 'fail';
            test.details.push(`错误: ${error.message}`);
            this.error('Battle', '战斗系统检查失败', error);
        }

        return test;
    }

    async checkUIComponents() {
        const test = { name: 'UI组件完整性', status: 'pass', details: [] };

        const requiredElements = [
            'battle-scene-overlay',
            'battle-scene-container',
            'enemy-battle-scene',
            'player-battle-scene',
            'battle-scene-vs',
            'battle-scene-header'
        ];

        requiredElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                test.status = 'fail';
                test.details.push(`错误: 缺少UI元素 #${id}`);
            } else {
                test.details.push(`✓ UI元素 #${id} 存在`);
            }
        });

        const cardSlots = document.querySelectorAll('.scene-card-slot');
        if (cardSlots.length < 14) {
            test.status = 'warn';
            test.details.push(`警告: 卡槽数量可能不足 (${cardSlots.length}/14)`);
        } else {
            test.details.push(`✓ 卡槽数量正确: ${cardSlots.length}`);
        }

        return test;
    }

    async checkSpeedControls() {
        const test = { name: '速度控制系统', status: 'pass', details: [] };

        try {
            if (window.game && typeof window.game.setBattleSpeed === 'function') {
                test.details.push('✓ Game.setBattleSpeed 方法存在');
            } else {
                test.status = 'warn';
                test.details.push('警告: Game.setBattleSpeed 方法可能未定义');
            }

            const speedBtns = document.querySelectorAll('.battle-speed-btn');
            if (speedBtns.length === 0) {
                test.status = 'fail';
                test.details.push('错误: 未找到速度按钮');
                return test;
            }

            speedBtns.forEach(btn => {
                const speed = btn.dataset.speed;
                if (!['0.5', '1', '1.5', '2'].includes(speed)) {
                    test.status = 'warn';
                    test.details.push(`警告: 速度按钮速度值 "${speed}" 不标准`);
                }
            });

            test.details.push(`✓ 速度按钮配置: ${speedBtns.length}个按钮`);

        } catch (error) {
            test.status = 'fail';
            test.details.push(`错误: ${error.message}`);
            this.error('SpeedControl', '速度控制检查失败', error);
        }

        return test;
    }

    async checkAnimationSystem() {
        const test = { name: '动画系统', status: 'pass', details: [] };

        const requiredAnimations = [
            'damageFloat',
            'damageShake',
            'cardImpact',
            'burstParticle',
            'flashPulse'
        ];

        const styleSheets = document.styleSheets;
        let foundAnimations = [];
        let accessibleCount = 0;
        let inaccessibleCount = 0;

        try {
            for (let sheet of styleSheets) {
                try {
                    for (let rule of sheet.cssRules) {
                        if (rule.type === CSSRule.KEYFRAMES_RULE || rule.type === CSSRule.WEBKIT_KEYFRAMES_RULE) {
                            foundAnimations.push(rule.name);
                        }
                    }
                    accessibleCount++;
                } catch (e) {
                    inaccessibleCount++;
                }
            }

            const foundCount = requiredAnimations.filter(anim => foundAnimations.includes(anim)).length;

            const animationClasses = [
                '.damage-number',
                '.damage-shake',
                '.impact-animation',
                '.card-skill-hint',
                '.targeted'
            ];
            const hasAnimationClasses = animationClasses.some(cls => {
                try {
                    return document.querySelector(`style:has(${cls})`) || 
                           Array.from(document.styleSheets).some(sheet => {
                        try {
                            return Array.from(sheet.cssRules || []).some(rule => 
                                rule.selectorText && rule.selectorText.includes(cls.replace('.', ''))
                            );
                        } catch (e) { return false; }
                    });
                } catch (e) { return false; }
            });

            if (foundCount >= 3 || hasAnimationClasses) {
                test.details.push(`✓ 动画系统正常工作 (检测到 ${foundCount} 个关键帧)`);
                test.status = 'pass';
            } else {
                test.status = 'warn';
                test.details.push(`⚠️ 动画系统可能存在问题 (仅检测到 ${foundCount}/${requiredAnimations.length} 个关键帧)`);
            }

        } catch (error) {
            test.status = 'warn';
            test.details.push(`⚠️ 无法完全检查动画定义 (${error.message})`);
        }

        return test;
    }

    async checkSettingsSystem() {
        const test = { name: '设置系统', status: 'pass', details: [] };

        try {
            const settingsOverlay = document.getElementById('settings-overlay');
            const settingsContainer = document.getElementById('settings-container');
            const closeSettingsBtn = document.getElementById('close-settings');

            if (!settingsOverlay) {
                test.status = 'fail';
                test.details.push('错误: 找不到 #settings-overlay 元素');
                return test;
            } else {
                test.details.push('✓ 设置界面容器存在');
            }

            if (!settingsContainer) {
                test.status = 'fail';
                test.details.push('错误: 找不到 #settings-container 元素');
            } else {
                test.details.push('✓ 设置内容容器存在');
            }

            if (!closeSettingsBtn) {
                test.status = 'fail';
                test.details.push('错误: 找不到 #close-settings 按钮');
            } else {
                test.details.push('✓ 关闭按钮存在');
            }

            const textSizeSlider = document.getElementById('text-size');
            if (!textSizeSlider) {
                test.status = 'warn';
                test.details.push('警告: 找不到 #text-size 滑块');
            } else {
                test.details.push(`✓ 文本大小滑块存在 (当前值: ${textSizeSlider.value})`);
            }

            const speedBtns = document.querySelectorAll('.settings-content .speed-btn');
            const contrastBtns = document.querySelectorAll('.settings-content .contrast-btn');
            const difficultyBtns = document.querySelectorAll('.settings-content .difficulty-btn');

            test.details.push(`✓ 速度按钮: ${speedBtns.length}个`);
            test.details.push(`✓ 对比度按钮: ${contrastBtns.length}个`);
            test.details.push(`✓ 难度按钮: ${difficultyBtns.length}个`);

            if (window.menuSystem) {
                if (typeof window.menuSystem.setTextSize === 'function') {
                    test.details.push('✓ MenuSystem.setTextSize() 方法存在');
                }
                if (typeof window.menuSystem.setBattleSpeed === 'function') {
                    test.details.push('✓ MenuSystem.setBattleSpeed() 方法存在');
                }
                if (typeof window.menuSystem.setContrast === 'function') {
                    test.details.push('✓ MenuSystem.setContrast() 方法存在');
                }
                if (typeof window.menuSystem.setTutorialDifficulty === 'function') {
                    test.details.push('✓ MenuSystem.setTutorialDifficulty() 方法存在');
                }
                if (typeof window.menuSystem.bindSettingsEvents === 'function') {
                    test.details.push('✓ MenuSystem.bindSettingsEvents() 方法存在');
                } else {
                    test.status = 'warn';
                    test.details.push('警告: MenuSystem.bindSettingsEvents() 方法不存在!');
                }
            } else {
                test.status = 'warn';
                test.details.push('警告: MenuSystem 实例未找到');
            }

        } catch (error) {
            test.status = 'fail';
            test.details.push(`错误: ${error.message}`);
            this.error('Settings', '设置系统检查失败', error);
        }

        return test;
    }

    generateReport() {
        const elapsed = Date.now() - this.startTime;

        return {
            summary: {
                totalLogs: this.logs.length,
                totalErrors: this.errors.length,
                totalWarnings: this.warnings.length,
                elapsedMs: elapsed,
                timestamp: new Date().toISOString()
            },
            logs: this.logs,
            errors: this.errors,
            warnings: this.warnings,
            autoFixSuggestions: this.generateAutoFixSuggestions()
        };
    }

    generateAutoFixSuggestions() {
        const suggestions = [];

        if (this.errors.some(e => e.message.includes('performMerge'))) {
            suggestions.push({
                issue: '合成功能返回 null',
                solution: '检查棋子系统配置是否正确'
            });
        }

        if (this.warnings.some(w => w.message.includes('速度按钮'))) {
            suggestions.push({
                issue: '速度控制按钮配置不完整',
                solution: '确保有4个速度按钮: 0.5x, 1x, 1.5x, 2x'
            });
        }

        return suggestions;
    }

    clearLogs() {
        this.logs = [];
        this.errors = [];
        this.warnings = [];
        this.log('Diagnostics', '日志已清空');
    }
}

window.BattleSystemDiagnostics = BattleSystemDiagnostics;

window.runBattleDiagnostics = function() {
    console.clear();
    console.log('%c⚔️ 战斗系统诊断工具 ⚔️', 'font-size: 20px; font-weight: bold; color: #48bb78;');
    console.log('='.repeat(50));

    if (!window.diagnostics) {
        window.diagnostics = new BattleSystemDiagnostics();
    }

    window.diagnostics.runFullDiagnostics().then(results => {
        console.log('%c诊断结果:', 'font-weight: bold;', `通过: ${results.passed}, 失败: ${results.failed}, 警告: ${results.warnings}`);

        if (results.failed > 0) {
            console.log('%c⚠️ 发现问题!', 'color: #fc8181; font-weight: bold;');
            results.tests.filter(t => t.status === 'fail').forEach(test => {
                console.log(`  ❌ ${test.name}:`, test.details);
            });
        }

        if (results.warnings > 0) {
            console.log('%c⚡ 存在警告:', 'color: #f6e05e; font-weight: bold;');
            results.tests.filter(t => t.status === 'warn').forEach(test => {
                console.log(`  ⚠️ ${test.name}:`, test.details);
            });
        }

        if (results.failed === 0 && results.warnings === 0) {
            console.log('%c✅ 所有检查通过!', 'color: #48bb78; font-weight: bold;');
        }

        return results;
    }).catch(error => {
        console.error('%c诊断过程出错:', 'color: #fc8181;', error);
    });
};

window.testMerge = function() {
    console.log('%c🧪 测试棋子合成系统', 'font-size: 16px; font-weight: bold; color: #4299e1;');

    if (!window.ChessManager || !window.CHESS_DATA) {
        console.error('ChessManager 或 CHESS_DATA 未定义');
        return;
    }

    const manager = new ChessManager();

    console.log('步骤1: 创建3个1星学生A进行测试...');
    const testChess = [
        new ChessUnit({ id: 'test_1', baseId: 'student_a', name: '学生A', star: 1, hp: 100, atk: 20, skill: '攻击提升', camp: '一班' }),
        new ChessUnit({ id: 'test_2', baseId: 'student_a', name: '学生A', star: 1, hp: 100, atk: 20, skill: '攻击提升', camp: '一班' }),
        new ChessUnit({ id: 'test_3', baseId: 'student_a', name: '学生A', star: 1, hp: 100, atk: 20, skill: '攻击提升', camp: '一班' })
    ];
    console.log(`已创建 ${testChess.length} 个棋子`);

    console.log('步骤2: 检查可合成性...');
    const canMerge = manager.canMerge(testChess);
    console.log('canMerge 结果:', canMerge);

    if (canMerge.length > 0) {
        console.log(`步骤3: 执行合成 (${canMerge[0].name}, ${canMerge[0].star}星)...`);
        const result = manager.performMerge(testChess, canMerge[0].name, canMerge[0].star);

        if (result) {
            console.log('%c✅ 合成成功!', 'color: #48bb78; font-weight: bold;');
            console.log(`  - 获得: ${result.name} (${result.star}星, 金边: ${result.isMerged})`);
            console.log(`  - 生命值: ${result.hp}`);
            console.log(`  - 攻击力: ${result.atk}`);
            console.log(`  - 剩余棋子数: ${testChess.length}`);

            if (result.isMerged && testChess.length === 0) {
                console.log('%c✅ 合成逻辑完全正确!', 'color: #48bb78;');
            } else {
                console.log('%c⚠️ 合成结果异常:', 'color: #f6e05e;');
                if (!result.isMerged) console.log(`  - 金边标记缺失`);
                if (testChess.length !== 0) console.log(`  - 剩余棋子数错误: 期望0, 实际${testChess.length}`);
            }
        } else {
            console.log('%c❌ 合成失败! performMerge 返回 null', 'color: #fc8181; font-weight: bold;');
            console.log('请检查控制台错误日志');

            console.log('调试信息:');
            console.log('  - 可用棋子池:', window.CHESS_DATA.pool.map(c => `${c.name}(${c.star}星)`));
            console.log('  - 测试棋子:', testChess.map(c => `${c.name}(${c.star}星)`));
        }
    } else {
        console.log('%c❌ 无法合成: canMerge 返回空数组', 'color: #fc8181; font-weight: bold;');
    }
};

window.testBattleAnimations = function() {
    console.log('%c🎬 测试战斗动画系统', 'font-size: 16px; font-weight: bold; color: #9f7aea;');

    const sceneOverlay = document.getElementById('battle-scene-overlay');
    if (!sceneOverlay) {
        console.error('战斗场景容器 #battle-scene-overlay 不存在');
        return;
    }

    console.log('显示战斗场景...');
    sceneOverlay.classList.remove('hidden');

    console.log('创建测试卡槽...');
    const testSlot = document.createElement('div');
    testSlot.className = 'scene-card-slot player-card';
    testSlot.style.cssText = 'position: fixed; top: 50%; left: 30%; transform: translate(-50%, -50%); width: 80px; height: 100px; background: linear-gradient(145deg, rgba(34, 74, 50, 0.95), rgba(20, 45, 30, 0.98)); border: 2px solid rgba(72, 187, 120, 0.6); border-radius: 10px; z-index: 10000;';
    testSlot.innerHTML = '<div style="color: white; text-align: center; padding-top: 30px;">测试卡</div>';
    document.body.appendChild(testSlot);

    console.log('测试位移动画...');
    setTimeout(() => {
        testSlot.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        testSlot.style.transform = 'translate(-50%, -50%) translateX(50px) scale(1.1)';
        testSlot.style.boxShadow = '0 0 30px #48bb78';
    }, 500);

    setTimeout(() => {
        testSlot.style.transform = 'translate(-50%, -50%) scale(1)';
        testSlot.style.boxShadow = '';
    }, 1000);

    setTimeout(() => {
        testSlot.classList.add('damage-shake');
    }, 1500);

    setTimeout(() => {
        testSlot.classList.remove('damage-shake');
    }, 1900);

    setTimeout(() => {
        console.log('清理测试元素...');
        document.body.removeChild(testSlot);
        console.log('%c✅ 动画测试完成!', 'color: #48bb78; font-weight: bold;');
    }, 2500);
};

window.testSpeedControl = function() {
    console.log('%c⚡ 测试速度控制系统', 'font-size: 16px; font-weight: bold; color: #f6e05e;');

    const speedBtns = document.querySelectorAll('.battle-speed-btn');
    console.log(`找到 ${speedBtns.length} 个速度按钮`);

    if (speedBtns.length === 0) {
        console.error('未找到速度按钮! 请确保战斗界面已打开。');
        return;
    }

    speedBtns.forEach((btn, index) => {
        setTimeout(() => {
            console.log(`点击速度按钮: ${btn.dataset.speed}x`);
            btn.click();

            setTimeout(() => {
                const isActive = btn.classList.contains('active');
                console.log(`  按钮状态: ${isActive ? '✓ 激活' : '✗ 未激活'}`);
            }, 100);
        }, index * 500);
    });
};

window.testSettings = function() {
    console.log('%c⚙️ 测试设置系统', 'font-size: 16px; font-weight: bold; color: #9f7aea;');

    const settingsOverlay = document.getElementById('settings-overlay');
    if (!settingsOverlay) {
        console.error('设置界面容器不存在!');
        return;
    }

    console.log('1. 显示设置界面...');
    settingsOverlay.classList.remove('hidden');

    setTimeout(() => {
        console.log('2. 测试文本大小滑块...');
        const textSizeSlider = document.getElementById('text-size');
        if (textSizeSlider) {
            console.log(`   滑块当前值: ${textSizeSlider.value}`);
            textSizeSlider.value = 18;
            textSizeSlider.dispatchEvent(new Event('input'));
            console.log(`   已设置为: 18px`);
        }

        setTimeout(() => {
            console.log('3. 测试速度按钮...');
            const speedBtns = document.querySelectorAll('.settings-content .speed-btn');
            if (speedBtns.length > 0) {
                speedBtns[1].click();
                console.log(`   已点击: ${speedBtns[1].dataset.speed}x`);
            }

            setTimeout(() => {
                console.log('4. 测试对比度按钮...');
                const contrastBtns = document.querySelectorAll('.settings-content .contrast-btn');
                if (contrastBtns.length > 1) {
                    contrastBtns[1].click();
                    console.log(`   已点击: ${contrastBtns[1].dataset.contrast}`);
                }

                setTimeout(() => {
                    console.log('5. 测试难度按钮...');
                    const difficultyBtns = document.querySelectorAll('.settings-content .difficulty-btn');
                    if (difficultyBtns.length > 0) {
                        difficultyBtns[1].click();
                        console.log(`   已点击: ${difficultyBtns[1].dataset.difficulty}`);
                    }

                    setTimeout(() => {
                        console.log('6. 测试关闭按钮...');
                        const closeBtn = document.getElementById('close-settings');
                        if (closeBtn) {
                            closeBtn.click();
                            console.log('   已点击关闭按钮');

                            setTimeout(() => {
                                const isHidden = settingsOverlay.classList.contains('hidden');
                                console.log(`   设置界面状态: ${isHidden ? '✓ 已隐藏' : '✗ 仍显示'}`);
                                console.log('%c✅ 设置系统测试完成!', 'color: #48bb78; font-weight: bold;');
                            }, 300);
                        }
                    }, 500);
                }, 500);
            }, 500);
        }, 500);
    }, 500);
};

console.log('%c🎮 诊断工具已加载!', 'font-size: 14px; font-weight: bold; color: #48bb78;');
console.log('可用命令:');
console.log('  runBattleDiagnostics()  - 运行完整系统诊断');
console.log('  testMerge()            - 测试棋子合成功能');
console.log('  testBattleAnimations() - 测试战斗动画效果');
console.log('  testSpeedControl()     - 测试战斗速度按钮');
console.log('  testSettings()         - 测试设置界面功能');
