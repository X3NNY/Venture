import { MISSION_TYPE } from "@/constant/mission";
import { filterMission } from "./mission/pool";

export const updateSpawnCreepNum = (room: Room) => {
    if (!global.SpawnCreepNum) global.SpawnCreepNum = {};
    if (global.SpawnCreepNum[room.name]?.time === Game.time) return ;
    global.SpawnCreepNum[room.name] = { time: Game.time }
    const missions = filterMission(room, MISSION_TYPE.SPAWN, ()=>true);
    for (const mission of missions) {
        const role = mission.data.memory.role;
        global.SpawnCreepNum[room.name][role] = (global.SpawnCreepNum[room.name][role] || 0) + 1;
    }
}

/**
 * 更新爬爬统计数量
 * @param room 
 */
export const updateCreepNum = (room: Room) => {
    if (!global.CreepNum) global.CreepNum = {};
    global.CreepNum[room.name] = {}
    Object.values(Game.creeps).forEach(creep => {
        if (!creep || creep.ticksToLive < creep.body.length * 3) return;
        const role = creep.memory.role;
        const home = creep.memory.home || creep.room.name;

        if (!role || !home || home != room.name) return;
        global.CreepNum[room.name][role] = (global.CreepNum[room.name][role] || 0) + 1;
    })
}