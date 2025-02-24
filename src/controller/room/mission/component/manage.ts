import { MISSION_TYPE } from "@/constant/mission";
import { generateMissionId } from "../util";
import { insertSorted } from "@/util/function";

export const addManageMission = (room: Room, mission: MISSION, data: {rType: ResourceConstant, amount: number}) => {
    if (!room.memory.missions[MISSION_TYPE.MANAGE]) room.memory.missions[MISSION_TYPE.MANAGE] = []
    let pos = room.memory.missions[MISSION_TYPE.MANAGE].findIndex(m => m.data.code === mission.code && m.data.rType === data.rType);

    let source, target;
    switch (mission.code) {
        case 's2t':
            source = room.storage.id;
            target = room.terminal.id;
            break;
        case 's2t':
            source = room.terminal.id;
            target = room.storage.id;
            break;
    }

    // 已存在则更新
    if (pos !== -1) {
        room.memory.missions[MISSION_TYPE.MANAGE][pos].data.amount = data.amount;
        return ;
    }

    const id = generateMissionId(MISSION_TYPE.MANAGE);

    insertSorted(room.memory.missions[MISSION_TYPE.MANAGE], {
        id: id,
        time: Game.time,
        type: mission.type,
        level: mission.level,
        data: { source, target, rType: data.rType, amount: data.amount}
    }, 'level')
}