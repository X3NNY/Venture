import { MISSION_TYPE } from "@/constant/mission";
import { addSpawnMission, doneSpawnMission } from "./component/spawn";
import { addBuildMission } from './component/build';
import { insertSorted } from '@/util/function';
import { addRepairMission } from "./component/repair";
import { addTransportMission, doneTransportMission } from './component/transport';
import { getPosDistance } from "../function/calc";

export const filterMission = (room: Room, type: string, filter: (m: Task) => boolean): Task[] => {
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
    } else if (type === MISSION_TYPE.TRANSPORT) {
        return addTransportMission(room, mission, data);
    }
}

export const getMissionByDist = (room: Room, type: string, pos?: RoomPosition) => {
    if (!room.memory.missions[type]) return;
    const tasks = room.memory.missions[type].filter(m => !m.lock);
    if (tasks.length === 0) return null;
    if (tasks.length === 1) return tasks[0];

    // 根据距离返回任务
    return tasks.reduce((prev, curr) => {
        if (prev.level !== curr.level && !pos) return prev.level <= curr.level ? prev : curr;
        if (!prev.data.pos || !curr.data.pos) return prev;
        const prevDist = getPosDistance(prev.data.pos, pos);
        const currDist = getPosDistance(curr.data.pos, pos);
        return prevDist <= currDist ? prev : curr;
    })
}


export const getMission = (room: Room, type: string, missionId?: string) => {
    if (!room.memory.missions[type]) return;

    if (missionId) {
        const task = room.memory.missions[type].find(t => t.id == missionId);
        return task;
    } else {
        const tasks = room.memory.missions[type].filter(m => !m.lock);
        if (tasks.length === 0) return null;
        return tasks[0];
    }
}

export const deleteMission = (room: Room, type: string, missionId: string) => {
    if (!room.memory.missions[type]) return;

    const index = room.memory.missions[type].findIndex(t => t.id == missionId);

    if (index === -1) return;
    room.memory.missions[type].splice(index, 1);
    return;
}

export const lockMission = (room: Room, type: string, missionId: string, creepId?: Id<Creep>) => {
    if (!room.memory.missions[type]) return;
    
    const index = room.memory.missions[type].findIndex(t => t.id == missionId);
    if (index === -1) return;
    room.memory.missions[type][index].lock = true;
    room.memory.missions[type][index].lockCreep = creepId;
}

export const unlockMission = (room: Room, type: string, missionId: string) => {
    if (!room.memory.missions[type]) return ;

    const task = room.memory.missions[type].find(t => t.id === missionId);
    if (!task) return ;
    task.lock = false;
    task.lockCreep = null;
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



export const doneMission = (room: Room, type: string, missionId: string, data?: any) => {
    const task = getMission(room, type, missionId);

    if (!task) {
        console.log(room.name, type, missionId, data, JSON.stringify(task));
        return ;
    }
    let res;
    if (type == MISSION_TYPE.SPAWN) {
        res = doneSpawnMission(room, task);
    } else if (type === MISSION_TYPE.TRANSPORT) {
        res = doneTransportMission(room, task, data);
    }

    if (res) {
        deleteMission(room, type, missionId);
    }
}