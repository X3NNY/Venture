export const CREEP_ROLE = {
    HARVESTER: 'harvester',                 // 能量采集者
    UNIVERSAL: 'universal',                 // 新房起步&房间停摆
    CARRIER: 'carrier',
    UPGRADER: 'upgrader',
    
    DEFEND_ATTACKER: 'defend_attacker',

    OUT_HARVESTER: 'out_harvester',
    OUT_CARRIER: 'out_carrier',
    OUT_BUILDER: 'out_builder',
    OUT_RESERVER: 'out_reserver',
    OUT_SCOUTER: 'out_scouter',
    OUT_DEFENDER: 'out_defender',
    OUT_INVADER: 'out_invader',
    OUT_PAIR_ATTACKER: 'out_pair_attacker',
    OUT_PAIR_HEALER: 'out_pair_healer',
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
        4: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY,],num: 0 }
    },
    universal: {
        1: { body: [WORK, CARRY,], num: 2 },
        2: { body: [WORK, CARRY, CARRY], num: 2 },
        3: { body: [WORK, WORK, CARRY, CARRY, CARRY, CARRY], num: 2},
        4: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 }
    },
    carrier: {
        1: { body: [CARRY, CARRY, CARRY], num: 2 },
        2: { body: [CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
        3: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,], num: 2 },
        4: { body: [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
    },
    builder: {
        1: { body: [WORK, CARRY,], num: 0 },
        2: { body: [WORK, WORK, CARRY, CARRY,], num: 0 },
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY,], num: 0 },
        4: { body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,], num: 0 }
    },
    upgrader: {
        1: { body: [WORK, CARRY,], num: 3 },
        2: { body: [WORK, WORK, CARRY, CARRY,], num: 3 },
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY,], num: 3 },
        4: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,], num: 2 },
        5: { body: [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 2 },
    },
    mender: {
        1: { body: [WORK, CARRY,], num: 1},
        2: { body: [WORK, WORK, CARRY, CARRY,], num: 1},
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY,], num: 1},
        4: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY,], num: 1},
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,], num: 1},
    },
    defend_attacker: {
        1: { body: [ATTACK, ATTACK,], num: 0 },
        2: { body: [ATTACK, ATTACK, ATTACK, ATTACK,], num: 0 },
        3: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,], num: 0 },
        4: { body: [ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK,], num: 0 },
    },


    out_harvester: {
        1: { body: [WORK, WORK,], num: 0 },
        2: { body: [WORK, WORK, WORK, WORK,], num: 0 },
        3: { body: [WORK, WORK, WORK, WORK, WORK, CARRY,], num: 0 },
        4: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY,], num: 0 },
        5: { body: [WORK, WORK, WORK, WORK, WORK, WORK, CARRY,], num: 0 },
    },
    out_carrier: {
        1: { body: [CARRY, CARRY,], num: 0 },
        2: { body: [CARRY, CARRY, CARRY,], num: 0},
        3: { body: [CARRY, CARRY, CARRY, CARRY,], num: 0},
        4: { body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,], num: 0},
        5: { body: [WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,], num: 0},
    },
    out_builder: {
        1: { body: [WORK, CARRY], num: 0 },
        2: { body: [WORK, WORK, CARRY, CARRY], num: 0 },
        3: { body: [WORK, WORK, WORK, CARRY, CARRY, CARRY], num: 0 },
        4: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY], num: 0 },
        5: { body: [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], num: 0 },
    },
    out_defender: {
        1: { body: [HEAL], num: 0 },
        2: { body: [RANGED_ATTACK, RANGED_ATTACK, HEAL], num: 0 },
        3: { body: [RANGED_ATTACK, RANGED_ATTACK, HEAL], num: 0 },
        4: { body: [RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL], num: 0 },
        5: { body: [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, HEAL, HEAL, HEAL], num: 0 },
    },
    out_scouter: {
        1: { body: [MOVE], num: 0 },
        2: { body: [MOVE], num: 0 },
        3: { body: [MOVE], num: 0 },
        4: { body: [MOVE], num: 0 },
        5: { body: [MOVE], num: 0 },
        6: { body: [MOVE], num: 0 },
        7: { body: [MOVE], num: 0 },
        8: { body: [MOVE], num: 0 },
    },
    out_reserver: {
        1: { body: [], num: 0 },
        2: { body: [], num: 0 },
        3: { body: [CLAIM], num: 0 },
        4: { body: [CLAIM], num: 0 },
        5: { body: [CLAIM], num: 0 },
        6: { body: [CLAIM], num: 0 },
        7: { body: [CLAIM], num: 0 },
        8: { body: [CLAIM], num: 0 },
    }
}

