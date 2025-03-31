export const CREEP_ROLE = {
    /** 房间运维爬爬 */
    HARVESTER: 'harvester',                 // 采集爬爬 能量采集者
    UNIVERSAL: 'universal',                 // 通用爬爬 新房起步&房间停摆
    CARRIER: 'carrier',                     // 运输爬爬 搬运/收集能量和资源
    BUILDER: 'builder',                     // 建设爬爬 建设工地
    UPGRADER: 'upgrader',                   // 升级爬爬 升级控制器
    MENDER: 'mender',                       // 修理爬爬 修理建筑&修建墙盾
    COURIER: 'courier',                     // 快递爬爬 参与制定运输任务
    MANAGER: 'manager',                     // 管理爬爬 管理中心点资源运转
    MINER: 'miner',                         // 采矿爬爬 采集矿藏

    /** 特殊任务爬爬 */
    CLAIMER: 'claimer',                     // 占领爬爬 占领中立房间
    SWEEPER: 'sweeper',                     // 清障爬爬 清理房间剩余建筑
    DISMANTLER: 'dismantler',               // 拆解爬爬 拆解房间建筑
    ACCELERATER: 'accelerater',             // 加速爬爬 加速房间升级

    /** 防御爬爬 */
    DEFEND_ATTACKER: 'defend_attacker',     // 防御组攻击爬爬

    /** 援助爬爬 */
    AID_BUILDER: 'aid_builder',             // 援助建设爬爬 帮助其他房间建设工地
    AID_CARRIER: 'aid_carrier',             // 援助运输爬爬 运输资源给其他房间

    DOUBLE_ATTACKER: 'double_attacker',     // 双人队攻击爬爬
    DOUBLE_DISMANTLER: 'double_dismantler', // 双人队拆解爬爬
    DOUBLE_HEALER: 'double_healer',         // 双人队治疗爬爬
    /** 小队爬爬 */

    /** 普通外矿爬爬 */
    OUT_HARVESTER: 'out_harvester',         // 外房采集爬爬
    OUT_CARRIER: 'out_carrier',             // 外房运输爬爬
    OUT_BUILDER: 'out_builder',             // 外房建设爬爬
    OUT_RESERVER: 'out_reserver',           // 外房预订爬爬
    OUT_SCOUTER: 'out_scouter',             // 外房斥候爬爬
    OUT_DEFENDER: 'out_defender',           // 外房防御爬爬
    OUT_INVADER: 'out_invader',             // 外房入侵爬爬
    OUT_PAIR_ATTACKER: 'out_pair_attacker', // 外房二人队攻击爬爬
    OUT_PAIR_HEALER: 'out_pair_healer',     // 外房二人队治疗爬爬
    OUT_ATTACKER: 'out_attacker',           // 外房攻击爬爬
    OUT_PROTECTOR: 'out_protector',         // 外房守卫爬爬
    OUT_MINER: 'out_miner',                 // 外房采矿爬爬

    /** 商品外矿爬爬 */

    DEPOSIT_HARVESTER: 'deposit_harvester', // 商品采集爬爬
    DEPOSIT_CARRIER: 'deposit_carrier',     // 商品运输爬爬

    /** 超能外矿爬爬 */
    POWER_CARRIER: 'power_carrier',         // 超能运输爬爬
    POWER_ATTACKER: 'power_attacker',       // 超能攻击爬爬
    POWER_HEALER: 'power_healer',           // 超能治疗爬爬
    POWER_ARCHER: 'power_archer',           // 超能射手爬爬
}

/**
 * 能量预估
 * 1: 300
 * 2: 500 ---> 4 ext
 * 3: 650 ---> 7 ext
 * 4: 800 ---> 10 ext
 */

// 爬爬身体部件
export const CreepRoleBody = {
    harvester: {
        1: { body: [WORK, WORK,], num: 0, },
        2: { body: [WORK, WORK, WORK, CARRY,], num: 0 },
        3: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY,], num: 0 },
        4: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY,],num: 0 },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY,],num: 0 },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY,],num: 0 },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY,],num: 0 },
        8: {
            body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE],num: 0, move: 'nope',
            upbody: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE]
        }
    },
    universal: {
        1: { body: [WORK, CARRY,], num: 2 },
        2: { body: [WORK, CARRY, CARRY], num: 2 },
        3: { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY], num: 2},
        4: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        5: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        6: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        7: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
    },
    carrier: {
        1: { body: [CARRY, CARRY], num: 2 },
        2: { body: [CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        3: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        4: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        5: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        6: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
        7: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
        8: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
    },
    builder: {
        1: { body: [WORK, CARRY,], num: 0 },
        2: { body: [WORK, WORK, CARRY, CARRY,], num: 0 },
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY,], num: 0 },
        4: { body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,], num: 0 },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,CARRY, CARRY], num: 0 },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 }
    },
    upgrader: {
        1: { body: [WORK, CARRY,], num: 3 },
        2: { body: [WORK, WORK, CARRY, CARRY,], num: 3 },
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY,], num: 3 },
        4: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,], num: 2 },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 1, move: 'nope'},
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 1, move: 'nope'},
    },
    accelerater: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,CARRY, CARRY], num: 0 },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], num: 0 },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], num: 0, move: 'nope'},
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 0, move: 'nope'},
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 0, move: 'nope'},
    },
    mender: {
        1: { body: [WORK, CARRY,], num: 1},
        2: { body: [WORK, WORK, CARRY, CARRY,], num: 1},
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY,], num: 1},
        4: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,], num: 2},
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,], num: 2},
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2},
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 }
    },
    courier: {
        1: { body: [CARRY, CARRY], num: 0 },
        2: { body: [CARRY, CARRY, CARRY, CARRY], num: 0 },
        3: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 },
        4: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
        5: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
        6: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
        7: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
        8: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 1 },
    },
    manager: {
        1: { body: [CARRY, CARRY, MOVE], num: 0, move: 'nope' },
        2: { body: [CARRY, CARRY, MOVE], num: 0, move: 'nope' },
        3: { body: [CARRY, CARRY, MOVE], num: 0, move: 'nope' },
        4: { body: [CARRY, CARRY, MOVE], num: 0, move: 'nope' },
        5: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], num: 1, move: 'nope' },
        6: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], num: 1, move: 'nope' },
        7: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], num: 1, move: 'nope' },
        8: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], num: 1, move: 'nope'},
    },
    miner: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], num: 0 },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], num: 0 },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 0, move: 'nope'},
    },

    claimer: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [TOUGH, CLAIM], num: 0, move: 'full' },
        5: { body: [TOUGH, TOUGH, HEAL, CLAIM, CLAIM], num: 0, move: 'full' },
        6: { body: [TOUGH, TOUGH, TOUGH, HEAL, HEAL, CLAIM], num: 0, move: 'full' },
        7: { body: [TOUGH, TOUGH, TOUGH, HEAL, HEAL, CLAIM], num: 0, move: 'full' },
        8: { body: [TOUGH, TOUGH, TOUGH, HEAL, HEAL, CLAIM], num: 0, move: 'full' },
    },


    defend_attacker: {
        1: { body: [ATTACK, ATTACK,], num: 0, move: 'full' },
        2: { body: [ATTACK, ATTACK, ATTACK, ATTACK,], num: 0, move: 'full' },
        3: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,], num: 0, move: 'full' },
        4: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,], num: 0, move: 'full' },
        5: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], num: 0, move: 'full' },
        6: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], num: 0, move: 'full' },
        7: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 0, move: 'nope' },
        8: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 0, move: 'nope' },
    },

    aid_builder: {
        1: { body: [WORK, CARRY], num: 0, move: 'full' },
        2: { body: [WORK, WORK, CARRY, CARRY], num: 0, move: 'full' },
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        4: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 0, move: 'nope' },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], num: 0, move: 'nope' },
    },
    aid_carrier: {
        1: { body: [], num: 0, move: 'full' },
        2: { body: [CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        3: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        4: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        5: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        6: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        7: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
        8: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
    },

    sweeper: {
        1: { body: [], num: 0 },
        2: { body: [WORK, WORK], num: 0, move: 'full'},
        3: { body: [WORK, WORK, WORK], num: 0, move: 'full' },
        4: { body: [WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
    },
    dismantler: {
        1: { body: [], num: 0 },
        2: { body: [WORK, WORK], num: 0, move: 'full'},
        3: { body: [WORK, WORK, WORK], num: 0, move: 'full' },
        4: { body: [WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0, move: 'full' },
    },

    out_harvester: {
        1: { body: [WORK, WORK,], num: 0 },
        2: { body: [WORK, WORK, WORK, WORK,], num: 0 },
        3: { body: [WORK, WORK, WORK, WORK, WORK, CARRY,], num: 0 },
        4: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY,], num: 0 },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY,], num: 0 },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY,], num: 0 },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], num: 0 },
        8: { body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], num: 0, move: 'nope'},
    },
    out_carrier: {
        1: { body: [CARRY, CARRY,], num: 0 },
        2: { body: [CARRY, CARRY, CARRY,], num: 0},
        3: { body: [CARRY, CARRY, CARRY, CARRY,], num: 0},
        4: { body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,], num: 0},
        5: { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0},
        6: { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0},
        7: { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0},
        8: { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0},
    },
    out_builder: {
        1: { body: [WORK, CARRY], num: 0 },
        2: { body: [WORK, WORK, CARRY, CARRY], num: 0 },
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY], num: 0 },
        4: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY], num: 0 },
        5: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 },
        6: { body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 },
    },
    out_defender: {
        1: { body: [HEAL], num: 0, move: 'full' },
        2: { body: [RANGED_ATTACK, HEAL], num: 0, move: 'full' },
        3: { body: [RANGED_ATTACK, HEAL], num: 0, move: 'full' },
        4: { body: [TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL], num: 0, move: 'full' },
        5: { body: [TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL], num: 0, move: 'full' },
        6: { body: [TOUGH, TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL], num: 0, move: 'full' },
        7: { body: [TOUGH, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL], num: 0, move: 'full' },
        8: { body: [RANGED_ATTACK, RANGED_ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, ATTACK, RANGED_ATTACK, RANGED_ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL], num: 0, move: 'full' },
    },
    out_invader: {
        1: { body: [ATTACK], num: 0, move: 'full' },
        2: { body: [ATTACK, ATTACK], num: 0, move: 'full' },
        3: { body: [ATTACK, ATTACK, ATTACK], num: 0, move: 'full' },
        4: { body: [ATTACK, ATTACK, ATTACK, ATTACK], num: 0, move: 'full' },
        5: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], num: 0, move: 'full' },
        6: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], num: 0, move: 'full' },
        7: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], num: 0, move: 'full' },
        8: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], num: 0, move: 'full' },
    },
    out_scouter: {
        1: { body: [MOVE], num: 0, move: 'nope' },
        2: { body: [MOVE], num: 0, move: 'nope' },
        3: { body: [MOVE], num: 0, move: 'nope' },
        4: { body: [MOVE], num: 0, move: 'nope' },
        5: { body: [MOVE], num: 0, move: 'nope' },
        6: { body: [MOVE], num: 0, move: 'nope' },
        7: { body: [MOVE], num: 0, move: 'nope' },
        8: { body: [MOVE], num: 0, move: 'nope' },
    },
    out_reserver: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [CLAIM], num: 0 },
        4: { body: [CLAIM], num: 0 },
        5: { body: [CLAIM, CLAIM], num: 0 },
        6: { body: [CLAIM, CLAIM], num: 0 },
        7: { body: [CLAIM, CLAIM, CLAIM], num: 0 },
        8: { body: [CLAIM, CLAIM, CLAIM, CLAIM, CLAIM], num: 0 },
    },
    out_attacker: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0, move: 'full' },
        6: { body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL], num: 0, move: 'full' },
        7: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL], num: 0, move: 'full' },
        8: { body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, MOVE, ATTACK, ATTACK, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE], num: 0, move: 'nope' }
    },
    out_protector: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL,], num: 0, move: 'full' },
        7: { body: [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL], num: 0, move: 'full' },
        8: { body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE], num: 0, move: 'nope' },
    },
    out_miner: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY], num: 0 },
        7: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK], num: 0 },
        8: { body: [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'nope'},
    },

    deposit_harvester: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [], num: 0 },
        8: { body: [WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
    },

    deposit_carrier: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [], num: 0 },
        8: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0, move: 'full' },
    },

    [CREEP_ROLE.POWER_ATTACKER]: {
        1: { body: [], num: 0},
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [], num: 0 },
        8: { body: [
            TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK,
            ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,
            ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE
        ], num: 0, move: 'nope'},
    },
    [CREEP_ROLE.POWER_HEALER]: {
        1: { body: [], num: 0},
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [], num: 0 },
        8: { body: [
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL,
            HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL,
            HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, 
        ], num: 0, move: 'nope'},
    },
    [CREEP_ROLE.POWER_CARRIER]: {
        1: { body: [], num: 0},
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [], num: 0 },
        8: { body: [
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY,
            CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, 
        ], num: 0, move: 'nope'},
    },
    [CREEP_ROLE.POWER_ARCHER]: {
        1: { body: [], num: 0},
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [], num: 0 },
        8: { body: [
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
            MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
            RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK,
            RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, 
        ], num: 0, move: 'nope'},
    },
    double_attacker: {
        1: { body: [], num: 0},
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE], num: 0, move: 'nope'},
        8: { body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, MOVE, MOVE], num: 0, move: 'nope'},
    },
    double_dismantler: {
        1: { body: [], num: 0},
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE], num: 0, move: 'nope'},
        8: { body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE], num: 0, move: 'nope'},
    },
    double_healer: {
        1: { body: [], num: 0},
        2: { body: [], num: 0 },
        3: { body: [], num: 0 },
        4: { body: [], num: 0 },
        5: { body: [], num: 0 },
        6: { body: [], num: 0 },
        7: { body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE], num: 0, move: 'nope'},
        8: { body: [TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, RANGED_ATTACK, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE], num: 0, move: 'nope'},
    }
}

export const CreepBoosts = {
    'aio': {
        '2T': {
            body: [],
            BOOST: { [HEAL]: 'XLHO2', [RANGED_ATTACK]: 'XKHO2', [MOVE]: 'XZHO2', [TOUGH]: 'XGHO2' }
        }
    }
}