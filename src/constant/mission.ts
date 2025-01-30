export const MISSION_TYPE = {
    SPAWN: 'spawn',
    BUILD: 'build',
    REPAIR: 'repair',
    TRANSPORT: 'transport',
    MANAGE: 'manage',
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
        level: 5,
        role: 'builder'
    },

    upgrader: {
        type: MISSION_TYPE.SPAWN,
        code: 'UP',
        level: 5,
        role: 'upgrader',
    },

    mender: {
        type: MISSION_TYPE.SPAWN,
        code: 'ME',
        level: 5,
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

    claimer: {
        type: MISSION_TYPE.SPAWN,
        code: 'CL',
        level: 10,
        role: 'claimer'
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
        level: 12,
        role: 'out_invader'
    },
    out_pair_healer: {
        type: MISSION_TYPE.SPAWN,
        code: 'OPH',
        level: 12,
        role: 'out_pair_healer'
    },
    out_pair_attacker: {
        type: MISSION_TYPE.SPAWN,
        code: 'OPA',
        level: 12,
        role: 'out_pair_attacker'
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
        level: 0,
    },
    spawn: {
        type: MISSION_TYPE.TRANSPORT,
        level: 1,
    },
    tower: {
        type: MISSION_TYPE.TRANSPORT,
        level: 1,
    },
    lab_energy: {
        type: MISSION_TYPE.TRANSPORT,
        level: 1,
    },
    lab: {
        type: MISSION_TYPE.TRANSPORT,
        level: 2,
    },
    power_spawn: {
        type: MISSION_TYPE.TRANSPORT,
        level: 2,
    },
    nuker: {
        type: MISSION_TYPE.TRANSPORT,
        level: 3,
    },
}