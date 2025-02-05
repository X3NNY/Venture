import { MISSION_TYPE } from "@/constant/mission";
import { generateMissionId } from "../util";
import { insertSorted } from "@/util/function";

export const addTransportMission = (room: Room, mission: MISSION, data: {source: Id<Structure>, target: Id<Structure>, pos: RoomPosition, rType: ResourceConstant, amount: number}) => {
    let pos = room.memory.missions[MISSION_TYPE.TRANSPORT].findIndex(m => m.data.target === data.target && m.data.source === data.source && m.data.rType === data.rType);

    // 已存在则更新
    if (pos !== -1) {
        room.memory.missions[MISSION_TYPE.TRANSPORT][pos] = {
            ...room.memory.missions[MISSION_TYPE.TRANSPORT][pos],
            level: mission.level,
            data: data
        }
        room.memory.missions[MISSION_TYPE.TRANSPORT] = room.memory.missions[MISSION_TYPE.TRANSPORT].sort((a, b) => a.level - b.level);
        return ;
    }

    const id = generateMissionId(MISSION_TYPE.TRANSPORT);

    insertSorted(room.memory.missions[MISSION_TYPE.TRANSPORT], {
        id: id,
        time: Game.time,
        type: mission.type,
        level: mission.level,
        data: data
    }, 'level')
}

export const doneTransportMission = (room: Room, task: Task, amount: number) => {
    amount = task.data.amount - amount;
    if (amount < 0) amount = 0;

    if (amount === 0) return true;

    task.lock = false;
    task.lockCreep = null;
    task.data.amount = amount;
}