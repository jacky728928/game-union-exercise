# 联合演习 - 自走棋游戏
## Trae Solo AI 开发指南

---

## 一、项目架构

### 核心类（优先级最高）

| 类名 | 文件 | 功能 |
|------|------|------|
| Game | js/game.js | 游戏主控制器，统一管理状态 |
| ChessManager | js/chess.js | 棋子管理器，处理CRUD |
| BattleLogic | js/battle-logic.js | 战斗计算逻辑 |
| Battle | js/battle.js | 战斗界面和动画 |
| MenuSystem | js/menu.js | 菜单系统 |
| BossManager | js/boss.js | Boss管理 |
| FactionSystem | js/faction-system.js | 阵营系统核心逻辑 |

### 文件加载顺序

```
数据层 → skills.js → chess-data.js → faction-data.js → hero-data.js → enemy-presets.js → boss-data.js
    ↓
核心类 → chess.js → boss.js → battle-logic.js → faction-system.js → game.js → battle.js
    ↓
界面系统 → tutorial.js → menu.js → diagnostics.js
```

---

## 二、CSS模块对照表（必查）

| 界面/功能 | CSS文件 | 搜索关键词 |
|-----------|---------|-----------|
| 棋子卡牌 | cards.css | .unit-card, .shop-card |
| 游戏主界面 | game-ui.css | #top-bar, #battlefield |
| 战斗界面 | battle-*.css, battle-scene.css | @keyframes |
| 图鉴系统 | codex.css | #codex-overlay |
| 阵营系统 | faction.css | #faction-container |
| 教程/设置 | tutorial-settings.css | #tutorial-overlay |
| 开始菜单 | menu.css | #start-menu |
| 特效动画 | effects.css | .damage-number |
| 响应式 | responsive.css | @media |
| 全局基础 | global.css | * { margin: 0 } |

---

## 三、快速开发流程

### 3.1 添加/修改棋子
```
文件: js/chess-data.js
数据: CHESS_DATA.pool 数组
示例:
{
    id: 'chess_id',
    name: '角色名',
    camp: '十班',
    star: 1,
    hp: 100,
    atk: 20,
    skillKey: 'skill_xxx',
    price: 3
}
```

### 3.2 添加技能
```
文件: js/skills.js
数据: SKILL_DEFINITIONS 对象
示例:
SKILL_DEFINITIONS['skill_new'] = {
    name: '技能名',
    description: '描述',
    trigger: 'attack', // attack | damaged | roundStart | roundEnd
    effect: function(unit, target) {
        target.hp -= unit.atk * 0.5;
    }
};
```

### 3.3 界面修改
1. 确定界面 → 找到对应CSS文件
2. 修改样式 → 添加/覆盖规则
3. 测试响应式 → 检查 responsive.css

### 3.4 添加新功能
1. HTML结构 → index.html 相应区域
2. CSS样式 → 对应CSS文件
3. JS逻辑 → 新建或修改JS文件
4. 更新加载顺序 → index.html

### 3.5 阵营系统开发
```
阵营数据: js/faction-data.js
- 特殊羁绊词缀: specialAffixes
- 主阵营: mainCamps
- 子阵营: subCamps

棋子阵营配置: js/chess-data.js
- camp: '十班'/'一班'/'二班'/'三班'/'四班'/'五班'/'六班'
- factions: ['受伤系', '强攻系']

阵营系统: js/faction-system.js
- 自动检测战场阵营构成
- 计算阵营效果加成
- UI显示和交互

阵营UI: css/faction.css
- 阵营图标样式
- 详细面板样式
```

---

## 四、HTML区域定位（index.html）

| 功能 | 行号 | ID |
|------|------|-----|
| 开始菜单 | ~26-64 | #start-menu |
| 图鉴界面 | ~67-130 | #codex-overlay |
| 公告弹窗 | ~133-148 | #announcement-overlay |
| 教程界面 | ~151-176 | #tutorial-overlay |
| 设置界面 | ~189-247 | #settings-overlay |
| 游戏主界面 | ~250-347 | #game-container |
| 阵营系统 | JS动态创建 | #faction-container |
| Boss弹窗 | ~350-382 | #boss-intro-overlay |
| 战斗界面 | ~385-419 | #battle-overlay |
| 战斗场景 | ~422-479 | #battle-scene-overlay |
| 游戏结束 | ~482-488 | #game-over |

---

## 五、常用API

### Game类
```javascript
game.state.gold              // 当前金币
game.state.round             // 当前回合
game.state.battlefield       // 战场棋子
game.state.bench             // 板凳棋子
game.startBattle()           // 开始战斗
game.refreshShop()           // 刷新商店
game.upgradeCamp()           // 升级营帐
game.factionSystem           // 阵营系统实例
```

### ChessManager
```javascript
game.chessManager.addChess(data)      // 添加棋子
game.chessManager.removeChess(id)       // 移除棋子
game.chessManager.moveChess(from, to)   // 移动棋子
```

### FactionSystem
```javascript
game.factionSystem.updateFactions()     // 更新阵营状态
game.factionSystem.refresh()            // 刷新阵营UI
game.factionSystem.getFactionBonuses()  // 获取阵营加成
```

### 元素获取
```javascript
document.getElementById('game-container')    // 游戏容器
document.getElementById('battlefield')        // 战场
document.getElementById('shop-items')         // 商店
document.getElementById('bench')              // 板凳
```

---

## 六、调试方法

### 浏览器控制台
```javascript
console.log('[模块] 操作', 数据);
console.error('[错误]', error);
```

### 常见问题

**样式不生效**
- 检查选择器优先级
- 确认CSS文件已加载
- 验证类名拼写

**JS报错**
- 检查脚本加载顺序
- 确认DOM元素存在
- 查看具体错误信息

**功能不工作**
- F12打开控制台
- 添加console.log定位
- 检查事件是否绑定

---

## 七、开发规范

### CSS
- BEM命名: `.component-name__element--modifier`
- 状态类: `.is-active`, `.hidden`
- 组织顺序: 布局 → 尺寸 → 视觉 → 文字 → 动画

### JavaScript
- 类名: PascalCase
- 方法/变量: camelCase
- 常量: UPPER_SNAKE_CASE
- 全局对象: window.xxx

### HTML
- ID: #element-name
- Class: .component__element

---

## 八、更新日志

### V1.3.3.7 (2026-05-22)
**主要更新**: 阵营系统完整实现

**新增文件**:
- `js/faction-data.js` - 阵营系统数据配置
- `js/faction-system.js` - 阵营系统核心逻辑
- `css/faction.css` - 阵营系统样式

**功能特性**:
1. **阵营触发机制**: 所有阵营需要3人触发
2. **特殊羁绊词缀**: 强攻、数学、计算机、护盾、燃尽
3. **主阵营系统**: 10班、9班、14班三大阵营
4. **子阵营系统**: 受伤系、开战系、招募系、辅助系、概率触发系、强攻系、燃尽系、护盾系
5. **公式化计算**: 所有效果使用数学公式动态计算，支持无限叠层
6. **智能UI面板**:
   - 左侧阵营显示区域（初始隐藏）
   - 上阵人数显示
   - 当前层数显示
   - 图标状态（灰色/高亮）
   - 右键详细面板
7. **角色详情集成**:
   - 图鉴详情面板显示阵营信息
   - 游戏内卡牌详情显示阵营信息
   - 阵营标签显示在图鉴卡片上
8. **完整阵营数据**: 所有棋子配置了对应的阵营和子阵营

**修改文件**:
- `index.html` - 添加阵营系统JS/CSS引用，更新图鉴详情面板
- `js/game.js` - 集成阵营系统，更新卡牌详情面板
- `js/chess-data.js` - 添加所有棋子的阵营和子阵营数据
- `css/cards.css` - 添加卡牌详情面板的阵营样式
- `css/game-ui.css` - 添加图鉴的阵营标签样式

---

## 九、版本信息

**版本**: V1.3.3.7  
**更新**: 2026-05-22
