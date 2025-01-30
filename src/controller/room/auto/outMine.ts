import { coordDecompress } from "@/util/coord";
import { updateSpawnCreepNum } from "../function";
import { getRoomTargetCreepNum } from "../function/get";
import { CREEP_ROLE } from "@/constant/creep";
import { addMission } from "../mission/pool";
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
            createOutDefendCreepPair(room, targetRoom, hostiles);
        } else {
            createOutDefendCreep(room, targetRoom, hostiles);
        }

        // 有敌人暂时不采集
        if (hostiles.length > 0) continue;

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

export const roomOutMine = (room: Room) => {
    outEnergyMine(room);
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