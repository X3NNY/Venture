import { MISSION_TYPE } from "@/constant/mission";
import { generateMissionId } from "../util";
import { insertSorted } from "@/util/function";

export const doneTerminalMission = (room: Room, task: Task, amount: number) => {
    amount = task.data.amount - amount;
    if (amount < 0) amount = 0;

    if (amount === 0) return true;

    task.lock = false;
    task.lockCreep = null;
    task.data.amount = amount;
}

export const addTerminalMission = (room: Room, mission: MISSION, data: {target: string, rType: ResourceConstant, amount: number}) => {
if (!room.memory.missions[MISSION_TYPE.TERMINAL]) room.memory.missions[MISSION_TYPE.TERMINAL] = []
    let pos = room.memory.missions[MISSION_TYPE.TERMINAL].findIndex(m => m.data.code === mission.code && m.data.rType === data.rType && m.data.target === data.target);

    // 已存在则更新
    if (pos !== -1) {
        room.memory.missions[MISSION_TYPE.TERMINAL][pos].data.amount = data.amount;
        return ;
    }

    const id = generateMissionId(MISSION_TYPE.TERMINAL);

    insertSorted(room.memory.missions[MISSION_TYPE.TERMINAL], {
        id: id,
        time: Game.time,
        type: mission.type,
        level: mission.level,
        data: data
    }, 'level')
}