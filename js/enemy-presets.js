/**
 * 敌人预设数据文件
 * 联合演习 - 回合制自走棋
 * 
 * 包含所有敌人的数据定义
 */

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
