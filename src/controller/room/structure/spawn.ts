import { MISSION_TYPE, SPAWN_MISSION } from '@/constant/mission';
import { calcCreepBodyEnergy, generateCreepName, getCreepRoleBody } from '@/util/creep'
import { delayMission, deleteMission, doneMission } from '../mission/pool';
import { getSpawnMission } from '../mission/component/spawn';
import { filter } from 'lodash';
import { CREEP_ROLE, CreepRoleBody } from '@/constant/creep';

const getSpawnTask = (room: Room) => {
    if (room.energyAvailable < 250) return;

    const mission = getSpawnMission(room);
    if (!mission) return;

    // 检查能量是否够用
    const cost = calcCreepBodyEnergy(mission.data.body);

    if (mission.data.body.length === 0) {
        deleteMission(room, MISSION_TYPE.SPAWN, mission.id)
        return getSpawnTask(room);
    }

    if (cost > room.energyCapacityAvailable) {
        deleteMission(room, MISSION_TYPE.SPAWN, mission.id)
        return getSpawnTask(room);
    }

    return {
        name: generateCreepName(mission.data.code),
        body: mission.data.body,
        memory: mission.data.memory,
        missionId: mission.id,
        cost
    }
}

const spawnCreep = (room: Room) => {
    const spawn = room.spawn.find(spawn => !spawn.spawning);
    if (!spawn) return;

    const task = getSpawnTask(room);
    if (!task) return;

    const result = spawn.spawnCreep(task.body, task.name, {memory: task.memory})
    const role = task.memory.role;

    // if (role === CREEP_ROLE.AID_BUILDER || role === CREEP_ROLE.OUT_HARVESTER) {
    //     console.log(role, 'spawn', Game.time, JSON.stringify(task));
    // }

    // 如果创建成功
    if (result == OK) {
        if (!global.CreepNum) global.CreepNum = {};
        if (!global.CreepNum[room.name]) global.CreepNum[room.name] = {}
        global.CreepNum[room.name][role] = (global.CreepNum[room.name][role] || 0) + 1;
        doneMission(room, MISSION_TYPE.SPAWN, task.missionId);
        return;
    }

    // 高峰不处理
    if (Game.time % 10) return ;

    // 能量不足导致的创建失败
    if (task.cost > room.energyAvailable) {
        // 不是房间运维爬爬
        if (role !== 'harvester' && role !== 'carrier' && role !== CREEP_ROLE.UNIVERSAL) {
            delayMission(room, MISSION_TYPE.SPAWN, task.missionId);
            return ;
        }

        // 已经至少有一个了
        const num = room.find(FIND_MY_CREEPS, { filter: c=>c.memory.role === role }).length;
        if (num !== 0) {
            delayMission(room, MISSION_TYPE.SPAWN, task.missionId);
            return ;
        }

        // 是否已经有通用爬爬了
        let univNum = room.find(FIND_MY_CREEPS, { filter: c => c.memory.role === CREEP_ROLE.UNIVERSAL }).length;
        univNum += global.SpawnCreepNum?.[room.name]?.[CREEP_ROLE.UNIVERSAL] || 0;
        if (univNum >= 2) {
            delayMission(room, MISSION_TYPE.SPAWN, task.missionId);
            return ;
        }

        const body = getCreepRoleBody(room, CREEP_ROLE.UNIVERSAL, true);
        spawn.spawnCreep(
            body,
            generateCreepName(SPAWN_MISSION.universal.code),
            { memory: { role: SPAWN_MISSION.universal.role, home: room.name } as CreepMemory }
        )
        console.log(body)
        console.log(`房间 ${room.name} 没有且不足以孵化 ${role}，已紧急孵化通用爬爬。`);
        return ;
    }
    deleteMission(room, MISSION_TYPE.SPAWN, task.missionId);
}

export const roomStructureSpawn = {
    work: (room: Room) => {
        if (!room.spawn) return;
        spawnCreep(room);
    }
}