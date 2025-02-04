import { filter } from 'lodash';
import { coordDecompress } from "@/util/coord";
import { updateSpawnCreepNum } from "../function";
import { getRoomTargetCreepNum } from "../function/get";
import { CREEP_ROLE } from "@/constant/creep";
import { addMission, countMission, deleteMission, filterMission } from "../mission/pool";
import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";

const outEnergyMine = (room: Room) => {
    if (Game.time % 20 !== 0) return ;
    const energyMineral = Memory.RoomInfo[room.name].OutMineral?.[RESOURCE_ENERGY];
    if (!energyMineral || !energyMineral.length) return ;

    updateSpawnCreepNum(room);

    for (const roomName of energyMineral) {
        const targetRoom = Game.rooms[roomName];
        
        // 没有视野创建侦察爬爬
        if (!targetRoom) {
            createOutScoutCreep(room, roomName);
            continue;
        }

        if (!targetRoom) continue ;
        
        // 定时检测，如果规划了路线则铺路
        if (Game.time % 100 === 0 && targetRoom.memory.road?.length > 0) {
            let sites = targetRoom.find(FIND_MY_CONSTRUCTION_SITES).length;
            for (const road of targetRoom.memory.road) {
                if (sites >= 10) break;
                const [x, y] = coordDecompress(road);
                const pos = new RoomPosition(x, y, roomName);
                const result = targetRoom.createConstructionSite(pos, STRUCTURE_ROAD)
                if (result === OK) sites++;
                if (result === ERR_FULL) break;
            }
        }

        const sources = targetRoom.source?.length || targetRoom.find(FIND_SOURCES).length || 0;
        if (sources === 0) continue;

        const hostiles = targetRoom.find(FIND_HOSTILE_CREEPS, {
            filter: c => (
                (c.owner.username === 'Invader' ||
                    c.owner.username === 'Source Keeper' ||
                    c.getActiveBodyparts(ATTACK) > 0 ||
                    c.getActiveBodyparts(RANGED_ATTACK) > 0 
                ) && !Memory.Whitelist?.includes(c.owner.username)
            )
        });

        // 如果有非NPC敌人
        if (hostiles.some(c => {
            if (c.owner.username === 'Invader') return false;
            if (c.owner.username === 'Source Keeper') return false;
            return true;
        })) {
            createOutDefendCreep(room, targetRoom, hostiles);
            // createOutDefendCreepPair(room, targetRoom, hostiles);
        } else {
            createOutDefendCreep(room, targetRoom, hostiles);
        }

        // 有敌人暂时不采集
        if (hostiles.length > 0) {
            const tasks = filterMission(room, MISSION_TYPE.SPAWN,
                m => m.data.role === SPAWN_MISSION.out_harvester.role ||
                    m.data.role === SPAWN_MISSION.out_carrier.role ||
                    m.data.role === SPAWN_MISSION.out_builder.role ||
                    m.data.role === SPAWN_MISSION.out_reserver.role
            )
            // 删除已在队列的其他爬爬
            for (const task of tasks) {
                deleteMission(room, MISSION_TYPE.SPAWN, task.id);
            }
            continue;
        }

        const controller = targetRoom.controller;
        
        // 别人的房间不采集
        if (controller?.owner) continue;

        // 预定该房间
        if (room.level >= 3) createOutReserverCreep(room, targetRoom);

        // 如果别人预定了
        if (controller.reservation &&
            controller.reservation.username !== room.controller.owner.username
        ) continue;

        createOutHarvesterCreep(room, targetRoom, sources);
        createOutCarrierCreep(room, targetRoom, sources*2);
        createOutBuilderCreep(room, targetRoom);
    }
}

// 中央九房外矿采集
const outCenterMine = (room: Room) => {
    if (Game.time % 20 !== 0) return;
    const centerMineral = Memory.RoomInfo[room.name].OutMineral?.center;

    if (!centerMineral || !centerMineral.length) return ;
    updateSpawnCreepNum(room);

    for (const roomName of centerMineral) {
        const targetRoom = Game.rooms[roomName];

        if (!targetRoom) {
            createOutScoutCreep(room, roomName);
            continue;
        }
        if (!targetRoom) continue;

        if (Game.time % 100 === 0 && (targetRoom.memory.road?.length||0) > 0) {
            let sites = targetRoom.find(FIND_MY_CONSTRUCTION_SITES).length;
            for (const road of targetRoom.memory.road) {
                if (sites >= 10) break;
                const [x, y] = coordDecompress(road);
                const pos = new RoomPosition(x, y, roomName);
                const result = targetRoom.createConstructionSite(pos, STRUCTURE_ROAD)
                if (result === OK) sites++;
                if (result === ERR_FULL) break;
            }
        }

        const hostiles = targetRoom.find(FIND_HOSTILE_CREEPS, {
            filter: c => (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0) &&
            c.owner.username !== 'Source Keeper' &&
            !Memory.Whitelist?.includes(c.owner.username)
        });

        const sourceKeeper = targetRoom.find(FIND_HOSTILE_CREEPS, {
            filter: c => c.owner.username === 'Source Keeper'
        });

        const creeps = getRoomTargetCreepNum(roomName);
        const out_attacker = (creeps[CREEP_ROLE.OUT_ATTACKER] || []).length;

        if (hostiles.length > 0) {
            createOutAttackerCreep(room, targetRoom);
            createOutProtectorCreep(room, targetRoom);
            continue;
        }

        // 有敌人暂时不采集
        if (sourceKeeper.length > 0 && out_attacker < 1) continue;

        const sources = targetRoom.source?.length || targetRoom.find(FIND_SOURCES).length || 0;
        if (sources === 0) continue;

        
        createOutHarvesterCreep(room, targetRoom, sources);
        const mineral = targetRoom.find(FIND_MINERALS)[0];
        if (mineral && mineral.mineralAmount > 0) {
            createOutMinerCreep(room, targetRoom);
        }
        createOutCarrierCreep(room, targetRoom, Math.ceil(sources*1.5));
        createOutBuilderCreep(room, targetRoom);
    }
}

// 高速通道外矿采集
const outHighwayMine = (room: Room) => {
    if (Game.time % 20 !== 1) return;
    const highwayMineral = Memory.RoomInfo[room.name].OutMineral?.highway;
    if (!highwayMineral || highwayMineral.length === 0) return ;
    
    updateSpawnCreepNum(room);

    for (const roomName in highwayMineral) {
        const targetRoom = Game.rooms[roomName];

        if (!targetRoom) {
            createOutScoutCreep(room, roomName);
            continue;
        }
        if (!targetRoom) continue;
        const creeps = getRoomTargetCreepNum(roomName);

        if (!targetRoom.memory.depositMineral || Game.time % 50 === 1) {
            outRoomDepositCheck(targetRoom);
            if ((targetRoom.memory.depositMineral?.count||0) > 0) {
                    // 检查商品采集爬爬数量
                    const dhs = (creeps[CREEP_ROLE.DEPOSIT_HARVESTER] || []).filter(c => c.spawning || c.ticksToLive > 200).length;
                    const dhspawns = global.spawnCreepNum[room.name][CREEP_ROLE.DEPOSIT_HARVESTER] || 0
                    if (dhs + dhspawns < targetRoom.memory.depositMineral.count) {
                        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.deposit_harvester, {
                            home: room.name, targetRoom: roomName
                        })
                    }

                    const dcs = (creeps[CREEP_ROLE.DEPOSIT_CARRIER] || []).filter(c => c.spawning || c.ticksToLive > 200).length;
                    const dcspawns = global.spawnCreepNum[room.name][CREEP_ROLE.DEPOSIT_CARRIER] || 0
                    if (dcs + dcspawns < targetRoom.memory.depositMineral.count) {
                        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.deposit_carrier, {
                            home: room.name, targetRoom: roomName
                        })
                    }
            }
        }
    }
}

const outRoomDepositCheck = (room: Room) => {
    const deposits = room.find(FIND_DEPOSITS);

    if (!deposits || deposits.length === 0) return 0;
    
    let count = 0;
    let amount = 0;
    for (const deposit of deposits) {
        // 冷却太长不值得
        if (deposit.lastCooldown >= 100) continue;
        
        // 统计可用采集点
        const terrain = room.getTerrain();
        let hpos = 0;
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dx, dy]) => {
            if (terrain.get(deposit.pos.x+dx, deposit.pos.y+dy) !== TERRAIN_MASK_WALL) hpos++;
        })

        if (hpos === 0) continue;
        if (!room.memory['depositMineral']) room.memory['depositMineral'] = {};
        room.memory['depositMineral'][deposit.id] = hpos;
        count += 1;
    }
    room.memory.depositMineral.count = count;

    for (const id in (room.memory['depositMineral']||{})) {
        if (Game.getObjectById(id as Id<Deposit>)) continue;
        delete room.memory['depositMineral'][id];
    }
}

export const roomOutMine = (room: Room) => {
    outEnergyMine(room);
    outCenterMine(room);
    outHighwayMine(room);
}

// 外房攻击者
const createOutAttackerCreep = (room: Room, targetRoom: Room) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_attacker = (creeps[CREEP_ROLE.OUT_ATTACKER]||[]).filter(c => c.ticksToLive > 300 || c.spawning);

    const spawns = global.SpawnMissionNum[room.name][CREEP_ROLE.OUT_ATTACKER] || 0;

    if ((out_attacker?.length||0) + spawns >= 1) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_attacker, {
        home: room.name,
        targetRoom: targetRoom.name
    });
}

// 外房守护者
const createOutProtectorCreep = (room: Room, targetRoom: Room) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_protector = (creeps[CREEP_ROLE.OUT_PROTECTOR]||[]).filter(c => c.ticksToLive > 300 || c.spawning);

    const spawns = global.SpawnMissionNum[room.name][CREEP_ROLE.OUT_PROTECTOR] || 0;

    if (out_protector.length + spawns >= 1) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_protector, {
        home: room.name,
        targetRoom: targetRoom.name
    });
}

const createOutMinerCreep = (room: Room, targetRoom: Room) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_miner = (creeps[CREEP_ROLE.OUT_MINER]||[]).length;
    const spawns = global.SpawnMissionNum[room.name][CREEP_ROLE.OUT_MINER] || 0;

    if (out_miner + spawns >= 1) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_miner, {
        home: room.name,
        targetRoom: targetRoom.name
    });
}

const createOutBuilderCreep = (room: Room, targetRoom: Room) => {
    const site = targetRoom.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: s => s.structureType === STRUCTURE_ROAD
    });

    if (site.length === 0) return false;

    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_builder = (creeps[CREEP_ROLE.OUT_BUILDER] || []).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_BUILDER] || 0;

    let num = 1;
    if (site.length > 10) num = 2;
    if (out_builder + spawns >= num) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_builder, {
        home: room.name, targetRoom: targetRoom.name
    })
    return true;
}

const createOutCarrierCreep = (room: Room, targetRoom: Room, num: number) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const outCarrier = (creeps[CREEP_ROLE.OUT_CARRIER] || []).filter(c => c.home === room.name).length;
    // const outCar = (creeps[CREEP_ROLE.OUT_] || []).filter(c => c.home === room.name).length;

    const spawnCarrier = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_CARRIER] || 0;
    // const spawnCar = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_CAR] || 0;

    // 没运输车
    // if (outCar + spawnCar == 0) {

    // }

    if (outCarrier + spawnCarrier < num) {
        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_carrier, {
            home: room.name, targetRoom: targetRoom.name
        });
        return true;
    }
    return false;
}

const createOutReserverCreep = (room: Room, targetRoom: Room) => {
    if (!targetRoom.controller || targetRoom.controller.my) return false;
    if (room.controller.level < 3) return false;

    if (targetRoom.controller.reservation &&
        targetRoom.controller.reservation.username === room.controller.owner.username &&
        targetRoom.controller.reservation.ticksToEnd > 2000
    ) return false;

    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_reserver = (creeps[CREEP_ROLE.OUT_RESERVER] || []).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_RESERVER] || 0;

    if (out_reserver + spawns > 0) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_reserver, {
        home: room.name, targetRoom: targetRoom.name
    });
    return true;
}

const createOutScoutCreep = (room: Room, roomName: string) => {
    const creeps = getRoomTargetCreepNum(roomName);
    const scouts = (creeps[CREEP_ROLE.OUT_SCOUTER] || []).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_SCOUTER] || 0;

    if (scouts + spawns > 0) return false;
    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_scouter, {
        home: room.name, targetRoom: roomName
    })
}

const createOutHarvesterCreep = (room: Room, targetRoom: Room, num: number) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const harvesters = (creeps[CREEP_ROLE.OUT_HARVESTER] || []).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_HARVESTER] || 0;
    
    if (harvesters + spawns >= num) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_harvester, {
        home: room.name,
        targetRoom: targetRoom.name,
    });
    return true;
}

const createOutDefendCreepPair = (room: Room, targetRoom: Room, hostiles: Creep[]) => {
    if (hostiles.length === 0) return false;

    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_attacker = (creeps[CREEP_ROLE.OUT_PAIR_ATTACKER] || []).length;
    const attackerSpawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_PAIR_ATTACKER] || 0;

    if (out_attacker + attackerSpawns >= 1) return false;

    const out_healer = (creeps[CREEP_ROLE.OUT_PAIR_HEALER] || []).length;
    const healerSpawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_PAIR_HEALER] || 0;
    if (out_healer + healerSpawns >= 1) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_pair_attacker, {
        home: room.name, targetRoom: targetRoom.name
    });
    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_pair_healer, {
        home: room.name, targetRoom: targetRoom.name
    });
    return true;
}

const createOutDefendCreep = (room: Room, targetRoom: Room, hostiles: Creep[]) => {
    const invaderCore = targetRoom.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_INVADER_CORE
    });

    if (invaderCore.length === 0 && hostiles.length === 0) return false;

    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_defender = (creeps[CREEP_ROLE.OUT_DEFENDER] || []).length;
    const out_invaders = (creeps[CREEP_ROLE.OUT_INVADER] || []).length;

    if (hostiles.length > 0) {
        const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_DEFENDER] || 0;

        let maxNum = 1;
        if (room.level < 4) maxNum = 3;
        else if (room.level < 6) maxNum = 2;

        if (out_defender + spawns >= maxNum) return false;

        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_defender, {
            home: room.name, targetRoom: targetRoom.name
        });
        return true;
    }
    if (invaderCore.length > 0) {
        const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_INVADER] || 0;
        
        let maxNum = 1;
        if (room.level < 4) maxNum = 4;
        else if (room.level < 6) maxNum = 3;
        else if (room.level === 6) maxNum = 2;

        if (out_invaders + spawns >= maxNum) return false;

        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_invader, {
            home: room.name, targetRoom: targetRoom.name
        });
        return true;
    }
    return false;
}