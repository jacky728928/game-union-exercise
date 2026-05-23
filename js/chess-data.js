/**
 * 棋子数据文件
 * 联合演习 - 回合制自走棋
 * 
 * 包含所有棋子的数据定义
 */

const CHESS_DATA = {
    pool: [
        // 十班角色
        { id: 'chess_wang', baseId: 'wang_haoxuan', name: '王昊轩', star: 1, hp: 2, atk: 2, skillKey: 'self_harm_buff', camp: '十班', factions: ['受伤系'] },
        { id: 'chess_ni', baseId: 'ni_jiayang', name: '倪嘉阳', star: 1, hp: 2, atk: 2, skillKey: 'ni_jiayang_new', camp: '十班', factions: ['强攻系', '强攻'] },
        { id: 'chess_zhang', baseId: 'zhang_haojun', name: '张浩军', star: 2, hp: 4, atk: 2, skillKey: 'attack_buff_all', camp: '十班', factions: ['辅助系'] },
        { id: 'chess_ma_ming', baseId: 'ma_mingze', name: '马铭泽', star: 2, hp: 3, atk: 3, skillKey: 'gold_on_recruit', camp: '十班', factions: ['招募系'] },
        { id: 'chess_liu_yi', baseId: 'liu_yichen', name: '刘奕辰', star: 2, hp: 3, atk: 2, skillKey: 'heal_all_on_recruit', camp: '十班', factions: ['辅助系', '招募系'] },
        { id: 'chess_huang', baseId: 'huang_yancheng', name: '黄彦程', star: 3, hp: 5, atk: 3, skillKey: 'hurt_prob_buff', camp: '十班', factions: ['概率触发系'] },
        { id: 'chess_li_si', baseId: 'li_sikun', name: '李嗣堃', star: 3, hp: 3, atk: 3, skillKey: 'boost_prob_skill', camp: '十班', factions: ['概率触发系', '数学'] },
        { id: 'chess_liu_yi_meng', baseId: 'liu_yimeng', name: '刘祎盟', star: 3, hp: 4, atk: 3, skillKey: 'hurt_prob_camp_upgrade', camp: '十班', factions: ['受伤系'] },
        { id: 'chess_sun', baseId: 'sun_fanghao', name: '孙方浩', star: 3, hp: 3, atk: 3, skillKey: 'battle_start_side_buff', camp: '十班', factions: ['开战系'] },
        { id: 'chess_mou', baseId: 'mou_xinyu', name: '牟新雨', star: 4, hp: 5, atk: 4, skillKey: 'hurt_gain_chess', camp: '十班', factions: ['受伤系'] },
        { id: 'chess_deng', baseId: 'deng_xingzhi', name: '邓行知', star: 4, hp: 3, atk: 3, skillKey: 'retry_prob_skill', camp: '十班', factions: ['概率触发系', '计算机'] },
        { id: 'chess_zhang_zhi', baseId: 'zhang_zhimiao', name: '张知渺', star: 2, hp: 3, atk: 3, skillKey: 'zhang_zhimiao_new', camp: '十班', factions: ['概率触发系'] },
        { id: 'chess_zhou', baseId: 'zhou_yichen', name: '周奕辰', star: 3, hp: 2, atk: 5, skillKey: 'zhou_yichen_new', camp: '十班', factions: ['护盾系', '护盾'] },
        { id: 'chess_dong', baseId: 'dong_runxi', name: '董润羲', star: 4, hp: 5, atk: 5, skillKey: 'battle_start_multi_buff', camp: '十班', factions: ['开战系', '辅助系'] },
        { id: 'chess_ma_hao', baseId: 'ma_haoxuan', name: '马皓轩', star: 5, hp: 6, atk: 2, skillKey: 'prob_boost_passive', camp: '十班', factions: ['概率触发系', '数学'] },
        { id: 'chess_yang', baseId: 'yang_dongxing', name: '杨东兴', star: 6, hp: 4, atk: 8, skillKey: 'yang_dongxing_new', camp: '十班', factions: ['强攻系', '计算机', '强攻'] },
        { id: 'chess_liu_yue', baseId: 'liu_yue', name: '刘岳', star: 5, hp: 6, atk: 1, skillKey: 'hurt_prob_all_buff', camp: '十班', factions: ['受伤系', '概率触发系'] },
        { id: 'chess_dong_hao', baseId: 'dong_haoming', name: '董浩铭', star: 6, hp: 12, atk: 4, skillKey: 'hurt_prob_left_buff', camp: '十班', factions: ['受伤系', '护盾系', '护盾'] },
        { id: 'chess_li_jia', baseId: 'li_jiaxuan', name: '李佳轩', star: 6, hp: 6, atk: 8, skillKey: 'prob_success_damage', camp: '十班', factions: ['概率触发系', '强攻系', '强攻'] },
        { id: 'chess_gong', baseId: 'gong_boyang', name: '宫伯洋', star: 6, hp: 8, atk: 4, skillKey: 'ally_target_aoe', camp: '十班', factions: ['辅助系', '数学', '计算机'] },
        
        // 一班、二班、三班（9班阵营）
        { id: 'chess_1', baseId: 'student_a', name: '学生A', star: 1, hp: 100, atk: 20, skillKey: 'attack_boost', camp: '一班', factions: ['强攻系', '强攻'] },
        { id: 'chess_2', baseId: 'student_b', name: '学生B', star: 1, hp: 100, atk: 20, skillKey: 'life_steal', camp: '一班', factions: ['受伤系', '燃尽系', '燃尽'] },
        { id: 'chess_3', baseId: 'student_c', name: '学生C', star: 1, hp: 100, atk: 20, skillKey: 'dodge', camp: '二班', factions: ['概率系'] },
        { id: 'chess_4', baseId: 'student_d', name: '学生D', star: 1, hp: 100, atk: 20, skillKey: 'critical', camp: '二班', factions: ['概率系', '强攻系', '强攻'] },
        { id: 'chess_5', baseId: 'student_e', name: '学生E', star: 1, hp: 100, atk: 20, skillKey: 'double_strike', camp: '三班', factions: ['强攻系', '概率系'] },
        { id: 'chess_6', baseId: 'student_f', name: '学生F', star: 1, hp: 100, atk: 20, skillKey: 'shield', camp: '三班', factions: ['受伤系', '护盾系', '护盾'] },
        { id: 'chess_7', baseId: 'student_a', name: '学生A', star: 2, hp: 150, atk: 30, skillKey: 'attack_boost', camp: '一班', factions: ['强攻系', '强攻'] },
        { id: 'chess_8', baseId: 'student_b', name: '学生B', star: 2, hp: 150, atk: 30, skillKey: 'life_steal', camp: '一班', factions: ['受伤系', '燃尽系', '燃尽'] },
        { id: 'chess_9', baseId: 'student_c', name: '学生C', star: 2, hp: 150, atk: 30, skillKey: 'dodge', camp: '二班', factions: ['概率系'] },
        { id: 'chess_10', baseId: 'student_d', name: '学生D', star: 2, hp: 150, atk: 30, skillKey: 'critical', camp: '二班', factions: ['概率系', '强攻系', '强攻'] },
        { id: 'chess_11', baseId: 'student_e', name: '学生E', star: 2, hp: 150, atk: 30, skillKey: 'double_strike', camp: '三班', factions: ['强攻系', '概率系'] },
        { id: 'chess_12', baseId: 'student_f', name: '学生F', star: 2, hp: 150, atk: 30, skillKey: 'shield', camp: '三班', factions: ['受伤系', '护盾系', '护盾'] },
        { id: 'chess_13', baseId: 'student_a', name: '学生A', star: 3, hp: 200, atk: 40, skillKey: 'attack_boost', camp: '一班', factions: ['强攻系', '强攻'] },
        { id: 'chess_14', baseId: 'student_b', name: '学生B', star: 3, hp: 200, atk: 40, skillKey: 'life_steal', camp: '一班', factions: ['受伤系', '燃尽系', '燃尽'] },
        { id: 'chess_15', baseId: 'student_c', name: '学生C', star: 3, hp: 200, atk: 40, skillKey: 'dodge', camp: '二班', factions: ['概率系'] },
        { id: 'chess_16', baseId: 'student_d', name: '学生D', star: 3, hp: 200, atk: 40, skillKey: 'critical', camp: '二班', factions: ['概率系', '强攻系', '强攻'] },
        { id: 'chess_17', baseId: 'student_e', name: '学生E', star: 3, hp: 200, atk: 40, skillKey: 'double_strike', camp: '三班', factions: ['强攻系', '概率系'] },
        { id: 'chess_18', baseId: 'student_f', name: '学生F', star: 3, hp: 200, atk: 40, skillKey: 'shield', camp: '三班', factions: ['受伤系', '护盾系', '护盾'] },
        { id: 'chess_19', baseId: 'student_a', name: '学生A', star: 4, hp: 280, atk: 55, skillKey: 'attack_boost', camp: '一班', factions: ['强攻系', '强攻'] },
        { id: 'chess_20', baseId: 'student_b', name: '学生B', star: 4, hp: 280, atk: 55, skillKey: 'life_steal', camp: '一班', factions: ['受伤系', '燃尽系', '燃尽'] },
        { id: 'chess_21', baseId: 'student_c', name: '学生C', star: 4, hp: 280, atk: 55, skillKey: 'dodge', camp: '二班', factions: ['概率系'] },
        { id: 'chess_22', baseId: 'student_d', name: '学生D', star: 4, hp: 280, atk: 55, skillKey: 'critical', camp: '二班', factions: ['概率系', '强攻系', '强攻'] },
        { id: 'chess_23', baseId: 'student_e', name: '学生E', star: 4, hp: 280, atk: 55, skillKey: 'double_strike', camp: '三班', factions: ['强攻系', '概率系'] },
        { id: 'chess_24', baseId: 'student_f', name: '学生F', star: 4, hp: 280, atk: 55, skillKey: 'shield', camp: '三班', factions: ['受伤系', '护盾系', '护盾'] },
        { id: 'chess_25', baseId: 'student_a', name: '学生A', star: 5, hp: 380, atk: 75, skillKey: 'attack_boost', camp: '一班', factions: ['强攻系', '强攻'] },
        { id: 'chess_26', baseId: 'student_b', name: '学生B', star: 5, hp: 380, atk: 75, skillKey: 'life_steal', camp: '一班', factions: ['受伤系', '燃尽系', '燃尽'] },
        { id: 'chess_27', baseId: 'student_c', name: '学生C', star: 5, hp: 380, atk: 75, skillKey: 'dodge', camp: '二班', factions: ['概率系', '计算机'] },
        { id: 'chess_28', baseId: 'student_d', name: '学生D', star: 5, hp: 380, atk: 75, skillKey: 'critical', camp: '二班', factions: ['概率系', '强攻系', '强攻'] },
        { id: 'chess_29', baseId: 'student_e', name: '学生E', star: 5, hp: 380, atk: 75, skillKey: 'double_strike', camp: '三班', factions: ['强攻系', '概率系', '数学'] },
        { id: 'chess_30', baseId: 'student_f', name: '学生F', star: 5, hp: 380, atk: 75, skillKey: 'shield', camp: '三班', factions: ['受伤系', '护盾系', '护盾'] },
        { id: 'chess_31', baseId: 'student_a', name: '学生A', star: 6, hp: 500, atk: 100, skillKey: 'attack_boost', camp: '一班', factions: ['强攻系', '强攻', '数学'] },
        { id: 'chess_32', baseId: 'student_b', name: '学生B', star: 6, hp: 500, atk: 100, skillKey: 'life_steal', camp: '一班', factions: ['受伤系', '燃尽系', '燃尽', '计算机'] },
        { id: 'chess_33', baseId: 'student_c', name: '学生C', star: 6, hp: 500, atk: 100, skillKey: 'dodge', camp: '二班', factions: ['概率系', '计算机'] },
        { id: 'chess_34', baseId: 'student_d', name: '学生D', star: 6, hp: 500, atk: 100, skillKey: 'critical', camp: '二班', factions: ['概率系', '强攻系', '强攻'] },
        { id: 'chess_35', baseId: 'student_e', name: '学生E', star: 6, hp: 500, atk: 100, skillKey: 'double_strike', camp: '三班', factions: ['强攻系', '概率系', '数学'] },
        { id: 'chess_36', baseId: 'student_f', name: '学生F', star: 6, hp: 500, atk: 100, skillKey: 'shield', camp: '三班', factions: ['受伤系', '护盾系', '护盾', '燃尽系', '燃尽'] },
        
        // 四班、五班、六班（14班阵营）
        { id: 'chess_37', baseId: 'student_g', name: '战士', star: 1, hp: 120, atk: 25, skillKey: 'retaliation', camp: '四班', factions: ['受伤系', '强攻系', '强攻'] },
        { id: 'chess_38', baseId: 'student_h', name: '医师', star: 1, hp: 90, atk: 18, skillKey: 'healing_aura', camp: '四班', factions: ['受伤系', '护盾系', '护盾'] },
        { id: 'chess_39', baseId: 'student_i', name: '刺客', star: 1, hp: 85, atk: 28, skillKey: 'stealth', camp: '五班', factions: ['概率系', '强攻系', '强攻'] },
        { id: 'chess_40', baseId: 'student_j', name: '狂战士', star: 1, hp: 110, atk: 30, skillKey: 'blood_rage', camp: '五班', factions: ['强攻系', '燃尽系', '燃尽'] },
        { id: 'chess_41', baseId: 'student_k', name: '守护者', star: 1, hp: 140, atk: 15, skillKey: 'iron_will', camp: '六班', factions: ['护盾系', '受伤系', '护盾'] },
        { id: 'chess_42', baseId: 'student_l', name: '弓箭手', star: 1, hp: 95, atk: 22, skillKey: 'group_attack', camp: '六班', factions: ['概率系', '燃尽系', '燃尽'] }
    ]
};
