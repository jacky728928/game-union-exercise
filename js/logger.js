/**
 * 游戏日志系统 v1.1
 * 
 * 功能：
 * - 统一管理所有console.log调用
 * - 支持分类日志（game、battle、skill、shop、ui等）
 * - 自动保存日志到 localStorage
 * - 游戏关闭时可导出日志文件
 * - 可通过配置开关控制日志输出
 */

class GameLogger {
    constructor() {
        this.config = {
            enabled: true,
            consoleOutput: true,
            maxLogSize: 5000,
            showTimestamp: true,
            showPrefix: true,
            autoSaveInterval: 30000,
            localStorageKey: 'game_logger_data',
            logFileName: 'game-log'
        };
        
        this.logs = [];
        this.logCount = 0;
        this.autoSaveTimer = null;
        
        this.colors = {
            game: '#4CAF50',
            battle: '#f44336',
            skill: '#9c27b0',
            shop: '#2196f3',
            ui: '#ff9800',
            debug: '#607d8b',
            warning: '#ffc107',
            error: '#e91e63'
        };
        
        this.init();
    }
    
    init() {
        this.loadFromLocalStorage();
        
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
            this.triggerDownload();
        });
        
        window.addEventListener('pagehide', () => {
            this.saveToLocalStorage();
            this.triggerDownload();
        });
        
        if (this.config.autoSaveInterval > 0) {
            this.startAutoSave();
        }
        
        console.log('%c[GameLogger] 日志系统已加载 (v1.1)', 'color: #4CAF50; font-weight: bold');
        console.log('%c[GameLogger] 可用命令:', 'color: #607d8b');
        console.log('%c  - GameLogger.exportLogs()      导出日志到文件', 'color: #607d8b');
        console.log('%c  - GameLogger.clear()           清空日志', 'color: #607d8b');
        console.log('%c  - GameLogger.disable()         禁用日志（发布时）', 'color: #607d8b');
    }
    
    log(tag, message, category = 'game', data = null) {
        if (!this.config.enabled) return;
        
        const timestamp = this.getTimestamp();
        const logEntry = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp,
            tag,
            message,
            category,
            data
        };
        
        this.logs.push(logEntry);
        this.logCount++;
        
        if (this.logs.length > this.config.maxLogSize) {
            this.logs = this.logs.slice(-this.config.maxLogSize);
        }
        
        if (this.config.consoleOutput) {
            this.outputToConsole(logEntry);
        }
    }
    
    getTimestamp() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    }
    
    outputToConsole(entry) {
        const color = this.colors[entry.category] || this.colors.game;
        const prefix = this.config.showPrefix ? `[${entry.category.toUpperCase()}]` : '';
        const timestamp = this.config.showTimestamp ? `[${entry.timestamp}]` : '';
        
        const fullMessage = `${timestamp} ${prefix} [${entry.tag}] ${entry.message}`;
        
        if (entry.data !== null && entry.data !== undefined) {
            console.log(`%c${fullMessage}`, `color: ${color}; font-weight: bold`, entry.data);
        } else {
            console.log(`%c${fullMessage}`, `color: ${color}`);
        }
    }
    
    saveToLocalStorage() {
        try {
            const data = {
                logs: this.logs,
                logCount: this.logCount,
                savedAt: this.getTimestamp(),
                version: '1.1'
            };
            localStorage.setItem(this.config.localStorageKey, JSON.stringify(data));
        } catch (error) {
            console.error('[GameLogger] 保存到localStorage失败:', error);
        }
    }
    
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(this.config.localStorageKey);
            if (saved) {
                const data = JSON.parse(saved);
                this.logs = data.logs || [];
                this.logCount = data.logCount || this.logs.length;
                console.log(`%c[GameLogger] 从localStorage恢复了 ${this.logs.length} 条日志`, 'color: #2196f3');
            }
        } catch (error) {
            console.error('[GameLogger] 从localStorage加载失败:', error);
        }
    }
    
    triggerDownload() {
        if (this.logs.length === 0) return;
        this.exportLogs();
    }
    
    exportLogs() {
        if (this.logs.length === 0) {
            console.warn('[GameLogger] 没有日志可导出');
            return;
        }
        
        try {
            const logContent = this.generateLogContent();
            const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
            
            const now = new Date();
            const fileName = `game-log_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}.txt`;
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log(`%c[GameLogger] 日志已保存: ${fileName} (${this.logs.length} 条记录)`, 'color: #4CAF50; font-weight: bold');
        } catch (error) {
            console.error('[GameLogger] 导出日志失败:', error);
        }
    }
    
    generateLogContent() {
        let content = '════════════════════════════════════════════════════════════════════════════════\n';
        content += `                           游戏日志 - ${new Date().toLocaleString()}\n`;
        content += `                        日志总数: ${this.logs.length} 条\n`;
        content += '════════════════════════════════════════════════════════════════════════════════\n\n';
        
        this.logs.forEach((entry, index) => {
            content += `[${entry.timestamp}]\n`;
            content += `[${entry.category.toUpperCase()}] [${entry.tag}] ${entry.message}\n`;
            if (entry.data !== null && entry.data !== undefined) {
                content += `  → 数据: ${JSON.stringify(entry.data, null, 2)}\n`;
            }
            content += '────────────────────────────────────────────────────────────────────────\n';
        });
        
        content += '\n════════════════════════════════════════════════════════════════════════════════\n';
        content += '                              日志结束\n';
        content += '════════════════════════════════════════════════════════════════════════════════\n';
        
        return content;
    }
    
    startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            this.saveToLocalStorage();
            console.log(`%c[GameLogger] 自动保存日志 (${this.logs.length} 条)`, 'color: #2196f3');
        }, this.config.autoSaveInterval);
    }
    
    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
    
    clear() {
        this.logs = [];
        this.logCount = 0;
        localStorage.removeItem(this.config.localStorageKey);
        console.clear();
        console.log('%c[GameLogger] 日志已清空', 'color: #f44336; font-weight: bold');
    }
    
    getLogs() {
        return [...this.logs];
    }
    
    getLogsByCategory(category) {
        return this.logs.filter(log => log.category === category);
    }
    
    setConfig(options) {
        Object.assign(this.config, options);
    }
    
    disable() {
        this.enabled = false;
        this.config.consoleOutput = false;
        this.stopAutoSave();
    }
    
    enable() {
        this.enabled = true;
        this.config.consoleOutput = true;
        this.startAutoSave();
    }
}

window.GameLogger = new GameLogger();

window.log = (tag, message, category = 'game', data = null) => {
    window.GameLogger.log(tag, message, category, data);
};

window.logGame = (tag, message, data) => window.log(tag, message, 'game', data);
window.logBattle = (tag, message, data) => window.log(tag, message, 'battle', data);
window.logSkill = (tag, message, data) => window.log(tag, message, 'skill', data);
window.logShop = (tag, message, data) => window.log(tag, message, 'shop', data);
window.logUI = (tag, message, data) => window.log(tag, message, 'ui', data);
window.logDebug = (tag, message, data) => window.log(tag, message, 'debug', data);
window.logWarning = (tag, message, data) => window.log(tag, message, 'warning', data);
window.logError = (tag, message, data) => window.log(tag, message, 'error', data);
