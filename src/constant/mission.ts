export const MISSION_TYPE = {
    SPAWN: 'spawn',             // 爬爬孵化任务
    BUILD: 'build',             // 工地建造任务
    REPAIR: 'repair',           // 修理刷墙任务
    TRANSPORT: 'transport',     // 资源运输任务
    MANAGE: 'manage',           // 中央管理任务
    TERMINAL: 'terminal'        // 终端传送任务
};

export const SPAWN_MISSION = {
    // 采集者：采集能源
    harvester: {
        type: MISSION_TYPE.SPAWN,
        code: 'EH',
        level: 3,
        role: 'harvester'
    },

    // 通用者：前期过渡&停摆修复
    universal: {
        type: MISSION_TYPE.SPAWN,
        code: 'UN',
        level: 0,
        role: 'universal'
    },

    // 搬运者：搬运资源至需要的地方或仓库、终端。
    carrier: {
        type: MISSION_TYPE.SPAWN,
        code: 'CA',
        level: 4,
        role: 'carrier'
    },

    // 建造者：只负责建造工地
    builder: {
        type: MISSION_TYPE.SPAWN,
        code: 'B',
        level: 10,
        role: 'builder'
    },

    upgrader: {
        type: MISSION_TYPE.SPAWN,
        code: 'UP',
        level: 10,
        role: 'upgrader',
    },
    mender: {
        type: MISSION_TYPE.SPAWN,
        code: 'ME',
        level: 10,
        role: 'mender'
    },
    courier: {
        type: MISSION_TYPE.SPAWN,
        code: 'CO',
        level: 2,
        role: 'courier'
    },
    manager: {
        type: MISSION_TYPE.SPAWN,
        code: 'MA',
        level: 1,
        role: 'manager'
    },
    miner: {
        type: MISSION_TYPE.SPAWN,
        code: 'MI',
        level: 6,
        role: 'miner'
    },

    claimer: {
        type: MISSION_TYPE.SPAWN,
        code: 'CL',
        level: 10,
        role: 'claimer'
    },
    sweeper: {
        type: MISSION_TYPE.SPAWN,
        code: 'SW',
        level: 11,
        role: 'sweeper'
    },

    defend_attacker: {
        type: MISSION_TYPE.SPAWN,
        code: 'DFA',
        level: 8,
        role: 'defend_attacker'
    },

    // 援助工作
    aid_builder: {
        type: MISSION_TYPE.SPAWN,
        code: 'AB',
        level: 10,
        role: 'aid_builder'
    },
    aid_carrier: {
        type: MISSION_TYPE.SPAWN,
        code: 'AC',
        level: 10,
        role: 'aid_carrier',
    },

    // 外矿工作
    out_harvester: {
        type: MISSION_TYPE.SPAWN,
        code: 'OH',
        level: 12,
        role: 'out_harvester'
    },
    out_carrier: {
        type: MISSION_TYPE.SPAWN,
        code: 'OC',
        level: 13,
        role: 'out_carrier'
    },
    out_builder: {
        type: MISSION_TYPE.SPAWN,
        code: 'OB',
        level: 12,
        role: 'out_builder'
    },
    out_reserver: {
        type: MISSION_TYPE.SPAWN,
        code: 'OR',
        level: 11,
        role: 'out_reserver'
    },
    out_scouter: {
        type: MISSION_TYPE.SPAWN,
        code: 'OS',
        level: 11,
        role: 'out_scouter'
    },
    out_defender: {
        type: MISSION_TYPE.SPAWN,
        code: 'OD',
        level: 8,
        role: 'out_defender'
    },
    out_invader: {
        type: MISSION_TYPE.SPAWN,
        code: 'OI',
        level: 10,
        role: 'out_invader'
    },
    out_pair_healer: {
        type: MISSION_TYPE.SPAWN,
        code: 'OPH',
        level: 8,
        role: 'out_pair_healer'
    },
    out_pair_attacker: {
        type: MISSION_TYPE.SPAWN,
        code: 'OPA',
        level: 8,
        role: 'out_pair_attacker'
    },

    out_attacker: {
        type: MISSION_TYPE.SPAWN,
        code: 'OA',
        level: 9,
        role: 'out_attacker'
    },
    out_protector: {
        type: MISSION_TYPE.SPAWN,
        code: 'OP',
        level: 9,
        role: 'out_protector'
    },
    out_miner: {
        type: MISSION_TYPE.SPAWN,
        code: 'OM',
        level: 12,
        role: 'out_miner'
    },

    // 商品采集
    deposit_harvester: {
        type: MISSION_TYPE.SPAWN,
        code: 'DH',
        level: 11,
        role: 'deposit_harvester'
    },
    deposit_carrier: {
        type: MISSION_TYPE.SPAWN,
        code: 'DC',
        level: 11,
        role: 'deposit_carrier'
    },
    deposit_guardian: {
        type: MISSION_TYPE.SPAWN,
        code: 'DG',
        level: 11,
        role: 'deposit_guardian'
    },

    // 超能采集
    power_attacker: {
        type: MISSION_TYPE.SPAWN,
        code: 'PAT',
        level: 9,
        role: 'power_attacker',
    },
    power_healer: {
        type: MISSION_TYPE.SPAWN,
        code: 'PH',
        level: 9,
        role: 'power_healer',
    },
    power_carrier: {
        type: MISSION_TYPE.SPAWN,
        code: 'PC',
        level: 11,
        role: 'power_carrier',
    },
    power_archer: {
        type: MISSION_TYPE.SPAWN,
        code: 'PAR',
        level: 11,
        role: 'power_archer',
    },

    // 小队爬爬
    squad_attacker: {
        type: MISSION_TYPE.SPAWN,
        code: 'SA',
        level: 10,
        role: 'squad_attacker'
    },

    // 双人队
    double_attacker: {
        type: MISSION_TYPE.SPAWN,
        code: 'DA',
        level: 10,
        role:'double_attacker'
    },
    double_dismantler: {
        type: MISSION_TYPE.SPAWN,
        code: 'DD',
        level: 10,
        role:'double_dismantler'
    },
    double_healer: {
        type: MISSION_TYPE.SPAWN,
        code: 'DH',
        level: 10,
        role:'double_healer'
    },

    aio: {
        type: MISSION_TYPE.SPAWN,
        code: 'AIO',
        level: 10,
        role: 'aio'
    }
}

export const BUILD_MISSION = {
    type: MISSION_TYPE.BUILD
}

export const REPAIRE_MISSION = {
    urgent_structure: {
        type: MISSION_TYPE.REPAIR,
        level: 1
    },
    urgent_wall: {
        type: MISSION_TYPE.REPAIR,
        level: 2
    },
    normal_structure: {
        type: MISSION_TYPE.REPAIR,
        level: 3
    },
    normal_wall: {
        type: MISSION_TYPE.REPAIR,
        level: 4
    },
    anti_nuclear: {
        type: MISSION_TYPE.REPAIR,
        level: 0
    },
    dynamic: {
        type: MISSION_TYPE.REPAIR,
        level: 'd'
    }
}

export const TRANSPORT_MISSION = {
    boost: {
        type: MISSION_TYPE.TRANSPORT,
        code: 'boost',
        level: 0,
    },
    spawn: {
        type: MISSION_TYPE.TRANSPORT,
        code: 'spawn',
        level: 1,
    },
    tower: {
        type: MISSION_TYPE.TRANSPORT,
        code: 'tower',
        level: 1,
    },
    lab_energy: {
        type: MISSION_TYPE.TRANSPORT,
        code: 'lab_energy',
        level: 1,
    },
    mineral: {
        type: MISSION_TYPE.TRANSPORT,
        code: 'mineral',
        level: 2,
    },
    lab: {
        type: MISSION_TYPE.TRANSPORT,
        code: 'lab',
        level: 2,
    },
    power_spawn: {
        type: MISSION_TYPE.TRANSPORT,
        code: 'power_spawn',
        level: 2,
    },
    nuker: {
        type: MISSION_TYPE.TRANSPORT,
        code: 'nuker',
        level: 3,
    },
}

export const MANAGE_MISSION = {
    s2t: {
        type: MISSION_TYPE.MANAGE,
        code: 's2t',
        level: 1
    },
    s2f: {
        type: MISSION_TYPE.MANAGE,
        code: 's2f',
        level: 1
    },
    s2p: {
        type: MISSION_TYPE.MANAGE,
        code: 's2p',
        level: 1,
    },
    t2s: {
        type: MISSION_TYPE.MANAGE,
        code: 't2s',
        level: 1
    },
    t2f: {
        type: MISSION_TYPE.MANAGE,
        code: 't2f',
        level: 1
    },
    t2p: {
        type: MISSION_TYPE.MANAGE,
        code: 't2p',
        level: 1,
    },
    f2s: {
        type: MISSION_TYPE.MANAGE,
        code: 'f2s',
        level: 1
    },
    f2t: {
        type: MISSION_TYPE.MANAGE,
        code: 'f2t',
        level: 1
    },
}

export const TERMINAL_MISSION = {
    send: {
        type: MISSION_TYPE.TERMINAL,
        code: 's',
        level: 0
    },
    request: {
        type: MISSION_TYPE.TERMINAL,
        code: 'r',
        level: 1
    }
}