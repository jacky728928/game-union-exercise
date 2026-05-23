/**
 * 阵营系统数据配置
 * 联合演习 - 回合制自走棋
 * 
 * 包含所有阵营的定义、效果公式等
 */

const FACTION_DATA = {
    specialAffixes: [
        {
            id: 'qiangong',
            name: '强攻',
            image: 'pic/强攻系.jpg',
            minCount: 3,
            description: '强化攻击力和暴击',
            effects: [
                {
                    attribute: '攻击力',
                    formula: (count) => 2 + (count - 3) * 2,
                    description: '每层+2攻击力'
                },
                {
                    attribute: '暴击率',
                    formula: (count) => Math.max(0, (count - 4) * 10),
                    description: '5层起每层+10%暴击率',
                    threshold: 5
                },
                {
                    attribute: '暴击伤害',
                    formula: (count) => Math.max(0, (count - 5) * 15),
                    description: '6层起每层+15%暴击伤害',
                    threshold: 6
                }
            ]
        },
        {
            id: 'shuxue',
            name: '数学',
            image: 'pic/数学.jpg',
            minCount: 3,
            description: '技能成功率提升',
            effects: [
                {
                    attribute: '技能成功率',
                    formula: (count) => 15 + (count - 3) * 15,
                    description: '每层+15%成功率'
                },
                {
                    attribute: '伤害取整',
                    formula: (count) => count >= 5 ? '生效' : '',
                    description: '5层起生效',
                    isBoolean: true,
                    threshold: 5
                },
                {
                    attribute: '额外加值',
                    formula: (count) => Math.max(0, (count - 6) * 1),
                    description: '7层起每层+1点额外伤害',
                    threshold: 7
                }
            ]
        },
        {
            id: 'jisuanji',
            name: '计算机',
            image: 'pic/计算机.jpg',
            minCount: 3,
            description: '同时触发多个主阵营',
            effects: [
                {
                    attribute: '同时触发数',
                    formula: (count) => 1 + (count - 3) * 1,
                    description: '每层+1个相同主阵营可同时触发'
                }
            ]
        },
        {
            id: 'hudun',
            name: '护盾',
            image: 'pic/护盾系.jpg',
            minCount: 3,
            description: '提供护盾和反伤',
            effects: [
                {
                    attribute: '护盾值',
                    formula: (count) => 5 + (count - 3) * 5,
                    description: '每层+5护盾'
                },
                {
                    attribute: '反伤比例',
                    formula: (count) => Math.max(0, (count - 4) * 10),
                    description: '5层起每层+10%反伤',
                    threshold: 5
                },
                {
                    attribute: '破碎免疫',
                    formula: (count) => count >= 6 ? '生效' : '',
                    description: '6层起生效',
                    isBoolean: true,
                    threshold: 6
                },
                {
                    attribute: '自动刷新',
                    formula: (count) => Math.max(0, (count - 7) * 10),
                    description: '8层起每层+10%概率自动刷新护盾',
                    threshold: 8
                }
            ]
        },
        {
            id: 'ranjin',
            name: '燃尽',
            image: 'pic/燃尽系.jpg',
            minCount: 3,
            description: '回合伤害和传递',
            effects: [
                {
                    attribute: '回合伤害',
                    formula: (count) => 2 + (count - 3) * 2,
                    description: '每层+2点伤害'
                },
                {
                    attribute: '传递范围',
                    formula: (count) => count >= 5 ? '相邻' : '',
                    description: '5层起传递给相邻',
                    isBoolean: true,
                    threshold: 5
                },
                {
                    attribute: '传递增强',
                    formula: (count) => Math.max(0, (count - 6) * 25),
                    description: '7层起每层+25%传递伤害',
                    threshold: 7
                }
            ]
        }
    ],

    mainCamps: [
        {
            id: 'class10',
            name: '10班',
            image: 'pic/10班.jpg',
            minCount: 3,
            description: '综合辅助、概率触发',
            effects: [
                {
                    attribute: '血量',
                    formula: (count) => 5 + (count - 3) * 5,
                    description: '每层+5血量'
                },
                {
                    attribute: '技能成功率',
                    formula: (count) => 10 + (count - 3) * 15,
                    description: '每层+15%成功率'
                },
                {
                    attribute: '额外效果概率',
                    formula: (count) => Math.max(0, (count - 5) * 20),
                    description: '6层起每层+20%概率',
                    threshold: 6
                },
                {
                    attribute: '额外效果增幅',
                    formula: (count) => Math.max(0, (count - 6) * 25),
                    description: '7层起每层+25%增幅',
                    threshold: 7
                }
            ]
        },
        {
            id: 'class9',
            name: '9班',
            image: 'pic/9班.jpg',
            minCount: 3,
            description: '燃尽、受伤',
            effects: [
                {
                    attribute: '攻击力',
                    formula: (count) => 3 + (count - 3) * 3,
                    description: '每层+3攻击力'
                },
                {
                    attribute: '受伤反击',
                    formula: (count) => 2 + (count - 3) * 2,
                    description: '每层+2点反击'
                },
                {
                    attribute: '死亡燃尽',
                    formula: (count) => Math.max(0, (count - 5) * 2),
                    description: '6层起每层+2层燃尽',
                    threshold: 6
                },
                {
                    attribute: '燃尽增幅',
                    formula: (count) => Math.max(0, (count - 6) * 25),
                    description: '7层起每层+25%燃尽伤害',
                    threshold: 7
                }
            ]
        },
        {
            id: 'class14',
            name: '14班',
            image: 'pic/14班.jpg',
            minCount: 3,
            description: '护盾、强攻',
            effects: [
                {
                    attribute: '护盾值',
                    formula: (count) => 8 + (count - 3) * 7,
                    description: '每层+7护盾'
                },
                {
                    attribute: '攻击力',
                    formula: (count) => 2 + (count - 3) * 3,
                    description: '每层+3攻击力'
                },
                {
                    attribute: '护盾额外攻击',
                    formula: (count) => Math.max(0, (count - 5) * 3),
                    description: '6层起每层+3攻击力（护盾存在时）',
                    threshold: 6
                },
                {
                    attribute: '自动刷新阈值',
                    formula: (count) => Math.max(0, 50 - (count - 6) * 5),
                    description: '7层起阈值每降低5%',
                    threshold: 7
                }
            ]
        }
    ],

    subCamps: {
        class10: [
            {
                id: 'shoushang_class10',
                name: '受伤系',
                image: 'pic/受伤系.jpg',
                minCount: 3,
                description: '受伤时触发效果',
                effects: [
                    {
                        attribute: '生命回复',
                        formula: (count) => 1 + (count - 3) * 1,
                        description: '每层+1生命回复'
                    },
                    {
                        attribute: '反伤概率',
                        formula: (count) => Math.max(0, (count - 4) * 15),
                        description: '5层起每层+15%反伤概率',
                        threshold: 5
                    },
                    {
                        attribute: '反伤增幅',
                        formula: (count) => Math.max(0, (count - 5) * 50),
                        description: '6层起每层+50%反伤增幅',
                        threshold: 6
                    }
                ]
            },
            {
                id: 'kaizhan_class10',
                name: '开战系',
                image: 'pic/开战系.jpg',
                minCount: 3,
                description: '战斗开始时触发',
                effects: [
                    {
                        attribute: '临时护盾',
                        formula: (count) => 1 + (count - 3) * 1,
                        description: '每层+1临时护盾'
                    },
                    {
                        attribute: '攻击力',
                        formula: (count) => Math.max(0, (count - 4) * 2),
                        description: '5层起每层+2攻击力',
                        threshold: 5
                    },
                    {
                        attribute: '首回合增幅',
                        formula: (count) => Math.max(0, (count - 5) * 20),
                        description: '6层起每层+20%伤害增幅',
                        threshold: 6
                    }
                ]
            },
            {
                id: 'zhaomu_class10',
                name: '招募系',
                image: 'pic/招募系.jpg',
                minCount: 3,
                description: '招募结束时触发效果',
                effects: [
                    {
                        attribute: '金币概率',
                        formula: (count) => 10 + (count - 3) * 10,
                        description: '每层+10%概率'
                    },
                    {
                        attribute: 'CD减免',
                        formula: (count) => Math.max(0, (count - 4) * 1),
                        description: '5层起每层-1回合CD',
                        threshold: 5
                    }
                ]
            },
            {
                id: 'fuzhu_class10',
                name: '辅助系',
                image: 'pic/辅助系.jpg',
                minCount: 3,
                description: '为友方提供增益',
                effects: [
                    {
                        attribute: '额外伤害',
                        formula: (count) => 1 + (count - 3) * 1,
                        description: '每层+1额外伤害'
                    },
                    {
                        attribute: '眩晕概率',
                        formula: (count) => Math.max(0, (count - 4) * 10),
                        description: '5层起每层+10%眩晕概率',
                        threshold: 5
                    },
                    {
                        attribute: '眩晕持续',
                        formula: (count) => Math.max(0, (count - 5) * 1),
                        description: '6层起每层+1回合持续',
                        threshold: 6
                    }
                ]
            },
            {
                id: 'gailv_class10',
                name: '概率触发系',
                image: 'pic/概率触发系.jpg',
                minCount: 3,
                description: '强化概率类技能',
                effects: [
                    {
                        attribute: '技能成功率',
                        formula: (count) => 10 + (count - 3) * 10,
                        description: '每层+10%成功率'
                    },
                    {
                        attribute: 'CD减免',
                        formula: (count) => Math.max(0, (count - 4) * 1),
                        description: '5层起每层-1回合CD',
                        threshold: 5
                    },
                    {
                        attribute: '额外增幅',
                        formula: (count) => Math.max(0, (count - 5) * 25),
                        description: '6层起每层+25%增幅',
                        threshold: 6
                    }
                ]
            }
        ],
        class9: [
            {
                id: 'shoushang_class9',
                name: '受伤系',
                image: 'pic/受伤系.jpg',
                minCount: 3,
                description: '受伤时触发',
                effects: [
                    {
                        attribute: '反击伤害',
                        formula: (count) => 1 + (count - 3) * 1,
                        description: '每层+1反击伤害'
                    },
                    {
                        attribute: '燃尽概率',
                        formula: (count) => Math.max(0, (count - 4) * 10),
                        description: '5层起每层+10%概率',
                        threshold: 5
                    },
                    {
                        attribute: '燃尽层数',
                        formula: (count) => Math.max(0, (count - 5) * 1),
                        description: '6层起每层+1层燃尽',
                        threshold: 6
                    }
                ]
            },
            {
                id: 'qiangong_class9',
                name: '强攻系',
                image: 'pic/强攻系.jpg',
                minCount: 3,
                description: '提升攻击力',
                effects: [
                    {
                        attribute: '攻击力',
                        formula: (count) => 2 + (count - 3) * 2,
                        description: '每层+2攻击力'
                    },
                    {
                        attribute: '暴击率',
                        formula: (count) => Math.max(0, (count - 4) * 5),
                        description: '5层起每层+5%暴击率',
                        threshold: 5
                    }
                ]
            },
            {
                id: 'gailv_class9',
                name: '概率系',
                image: 'pic/概率触发系.jpg',
                minCount: 3,
                description: '概率触发强化',
                effects: [
                    {
                        attribute: '双倍概率',
                        formula: (count) => 10 + (count - 3) * 10,
                        description: '每层+10%概率'
                    },
                    {
                        attribute: '双倍增幅',
                        formula: (count) => Math.max(0, (count - 4) * 25),
                        description: '5层起每层+25%增幅',
                        threshold: 5
                    },
                    {
                        attribute: '重置冷却',
                        formula: (count) => count >= 6 ? '生效' : '',
                        description: '6层起生效',
                        isBoolean: true,
                        threshold: 6
                    }
                ]
            },
            {
                id: 'ranjin_class9',
                name: '燃尽系',
                image: 'pic/燃尽系.jpg',
                minCount: 3,
                description: '燃尽效果叠加、死亡传递',
                effects: [
                    {
                        attribute: '燃尽层数',
                        formula: (count) => 1 + (count - 3) * 1,
                        description: '每层+1层燃尽'
                    },
                    {
                        attribute: '燃尽增幅',
                        formula: (count) => Math.max(0, (count - 4) * 15),
                        description: '5层起每层+15%增幅',
                        threshold: 5
                    },
                    {
                        attribute: '全敌传递',
                        formula: (count) => count >= 6 ? '生效' : '',
                        description: '6层起传递给所有敌人',
                        isBoolean: true,
                        threshold: 6
                    }
                ]
            }
        ],
        class14: [
            {
                id: 'ranjin_class14',
                name: '燃尽系',
                image: 'pic/燃尽系.jpg',
                minCount: 3,
                description: '施加/传递燃尽',
                effects: [
                    {
                        attribute: '燃尽概率',
                        formula: (count) => 10 + (count - 3) * 15,
                        description: '每层+15%概率'
                    },
                    {
                        attribute: '燃尽层数',
                        formula: (count) => Math.max(0, (count - 4) * 1),
                        description: '5层起每层+1层燃尽',
                        threshold: 5
                    },
                    {
                        attribute: '持续时间',
                        formula: (count) => Math.max(0, (count - 5) * 1),
                        description: '6层起每层+1回合',
                        threshold: 6
                    }
                ]
            },
            {
                id: 'hudun_class14',
                name: '护盾系',
                image: 'pic/护盾系.jpg',
                minCount: 3,
                description: '护盾管理与反制',
                effects: [
                    {
                        attribute: '护盾值',
                        formula: (count) => 5 + (count - 3) * 5,
                        description: '每层+5护盾'
                    },
                    {
                        attribute: '破碎伤害',
                        formula: (count) => Math.max(0, (count - 4) * count * 2),
                        description: '5层起每层递增',
                        threshold: 5
                    },
                    {
                        attribute: '治疗转化',
                        formula: (count) => Math.max(0, (count - 5) * 20),
                        description: '6层起每层+20%转化',
                        threshold: 6
                    }
                ]
            },
            {
                id: 'shoushang_class14',
                name: '受伤系',
                image: 'pic/受伤系.jpg',
                minCount: 3,
                description: '受伤触发全体增益',
                effects: [
                    {
                        attribute: '防御增益',
                        formula: (count) => 1 + (count - 3) * 1,
                        description: '每层+1防御'
                    },
                    {
                        attribute: '攻击增益',
                        formula: (count) => Math.max(0, (count - 4) * 1),
                        description: '5层起每层+1攻击',
                        threshold: 5
                    },
                    {
                        attribute: '持续回合',
                        formula: (count) => Math.max(0, (count - 5) * 1),
                        description: '6层起每层+1回合',
                        threshold: 6
                    }
                ]
            },
            {
                id: 'qiangong_class14',
                name: '强攻系',
                image: 'pic/强攻系.jpg',
                minCount: 3,
                description: '无限连攻',
                effects: [
                    {
                        attribute: '额外行动概率',
                        formula: (count) => 20 + (count - 3) * 20,
                        description: '每层+20%概率'
                    },
                    {
                        attribute: '额外行动增幅',
                        formula: (count) => Math.max(0, (count - 4) * 30),
                        description: '5层起每层+30%增幅',
                        threshold: 5
                    }
                ]
            },
            {
                id: 'gailv_class14',
                name: '概率系',
                image: 'pic/概率触发系.jpg',
                minCount: 3,
                description: '高爆发概率强化',
                effects: [
                    {
                        attribute: '暴击率',
                        formula: (count) => 10 + (count - 3) * 10,
                        description: '每层+10%暴击率'
                    },
                    {
                        attribute: '暴击伤害',
                        formula: (count) => Math.max(0, (count - 4) * 15),
                        description: '5层起每层+15%伤害',
                        threshold: 5
                    },
                    {
                        attribute: '连击概率',
                        formula: (count) => Math.max(0, (count - 5) * 30),
                        description: '6层起每层+30%连击',
                        threshold: 6
                    }
                ]
            }
        ]
    },

    getAllFactions() {
        const all = [...this.specialAffixes, ...this.mainCamps];
        Object.values(this.subCamps).forEach(subGroup => {
            all.push(...subGroup);
        });
        return all;
    },

    getFactionById(id) {
        return this.getAllFactions().find(f => f.id === id);
    }
};
