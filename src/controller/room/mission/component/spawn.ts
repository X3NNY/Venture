import { MISSION_TYPE } from "@/constant/mission";
import { generateMissionId } from "../util";
import { insertSorted } from "@/util/function";
import { getCreepRoleBody } from "@/util/creep";

export const addSpawnMission = (room: Room, mission: MISSION, memory: any) => {
    const id = generateMissionId(MISSION_TYPE.SPAWN);
    memory.role = mission.role;
    insertSorted(room.memory.missions[MISSION_TYPE.SPAWN], {
        id: id,
        time: Game.time,
        type: mission.type,
        level: mission.level,
        data: {
            code: mission.code,
            body: getCreepRoleBody(room, mission.role),
            memory: memory
        }
    }, 'level')
}


export const doneSpawnMission = (room: Room, task: Task) => {
    const role = task.data.memory.role;

    if (!global.SpawnCreepNum) global.SpawnCreepNum = {}
    if (!global.SpawnCreepNum[room.name]) global.SpawnCreepNum[room.name] = {};
    if (!global.SpawnCreepNum[room.name][role]) {
        global.SpawnCreepNum[room.name][role] = 0;
        return;
    }
    global.SpawnCreepNum[room.name][role] = global.SpawnCreepNum[room.name][role] - 1;
}

export const getSpawnMission = (room: Room, filter?: ()=>boolean) => {
    if (room.memory.missions[MISSION_TYPE.SPAWN].length == 0) return null;

    const missions = room.memory.missions[MISSION_TYPE.SPAWN];

    if (filter) {
        return missions.filter(filter).at(0);
    }

    return missions[0]
}