import { MISSION_TYPE } from "@/constant/mission";
import { addSpawnMission, doneSpawnMission } from "./component/spawn";
import { addBuildMission } from './component/build';
import { insertSorted } from '@/util/function';
import { addRepairMission } from "./component/repair";

export const filterMission = (room: Room, type: string, filter: (m: any) => boolean): Task[] => {
    return room.memory.missions[type].filter(filter);
}

export const countMission = (room: Room, type: string, filter?: (m: Task) => boolean) => {//E57N34
    if (filter){
        return room.memory.missions[type].filter(filter).length;
    }
    return room.memory.missions[type].length;
    
}

export const addMission = (room: Room, type: string, mission: MISSION, data: any) => {

    if (type == MISSION_TYPE.SPAWN) {
        return addSpawnMission(room, mission, data);
    } else if (type === MISSION_TYPE.BUILD) {
        return addBuildMission(room, mission, data);
    } else if (type == MISSION_TYPE.REPAIR) {
        return addRepairMission(room, mission, data);
    }
}

export const getMission = (room: Room, type: string, missionId?: string) => {
    if (!room.memory.missions[type]) return;

    if (missionId) {
        const index = room.memory.missions[type].findIndex(t => t.id == missionId);
        if (index === -1) return;
        return room.memory.missions[type][index];
    } else {
        if (room.memory.missions[type].length == 0) return null;
        
        return room.memory.missions[type][0]
    }
}

export const deleteMission = (room: Room, type: string, missionId: string) => {
    if (!room.memory.missions[type]) return;

    const index = room.memory.missions[type].findIndex(t => t.id == missionId);

    if (index === -1) return;
    room.memory.missions[type].splice(index, 1);
    return;
}

export const delayMission = (room: Room, type: string, missionId: string) => {
    if (!room.memory.missions[type]) return;

    const index = room.memory.missions[type].findIndex(t => t.id == missionId);

    if (index === -1) return;

    const newMission = Object.assign({}, room.memory.missions[type][index]);

    newMission.level += 1;
    newMission.delay = (newMission.delay || 0) + 1;
    room.memory.missions[type].splice(index, 1);
    
    if (newMission.delay > 5) return ;
    insertSorted(room.memory.missions[type], newMission, 'level');
}



export const doneMission = (room: Room, type: string, missionId: string) => {
    const task = getMission(room, type, missionId);
    if (type == MISSION_TYPE.SPAWN) {
        doneSpawnMission(room, task);
    }

    deleteMission(room, type, missionId);
}