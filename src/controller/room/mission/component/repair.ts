import { MISSION_TYPE } from "@/constant/mission";
import { generateMissionId } from "../util";
import { insertSorted } from "@/util/function";

export const addRepairMission = (room: Room, mission: MISSION, data: {target: Id<Structure>, pos: RoomPosition, hits: number}) => {
    let pos = room.memory.missions[MISSION_TYPE.REPAIR].findIndex(m => m.data.target === data.target);

    // 已存在则更新
    if (pos !== -1) {
        room.memory.missions[MISSION_TYPE.REPAIR][pos] = {
            ...room.memory.missions[MISSION_TYPE.REPAIR][pos],
            level: mission.level,
            data: data
        }
        room.memory.missions[MISSION_TYPE.REPAIR] = room.memory.missions[MISSION_TYPE.REPAIR].sort((a, b) => a.level - b.level);
        return ;
    }

    const id = generateMissionId(MISSION_TYPE.REPAIR);

    insertSorted(room.memory.missions[MISSION_TYPE.REPAIR], {
        id: id,
        time: Game.time,
        type: mission.type,
        level: mission.level,
        data: data
    }, 'level')
}