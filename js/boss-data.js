/**
 * Boss数据文件
 * 联合演习 - 回合制自走棋
 * 
 * 包含所有Boss的数据定义
 */

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
