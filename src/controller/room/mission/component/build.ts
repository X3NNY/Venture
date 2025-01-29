import { MISSION_TYPE } from "@/constant/mission";
import { generateMissionId } from "../util";

export const addBuildMission = (room: Room, mission: MISSION, data: {pos: RoomPosition, structureType: BuildableStructureConstant, exist?: boolean}) => {
    const id = generateMissionId(MISSION_TYPE.BUILD);

    const { pos, structureType, exist } = data;

    if (!exist) {
        const res = room.createConstructionSite(pos, structureType);
        if (res !== OK) {
            return res;
        }
    }

    const site = pos.lookFor(LOOK_CONSTRUCTION_SITES).find(s => s.structureType == structureType)

    room.memory.missions[MISSION_TYPE.BUILD].push({
        id: id,
        time: Game.time,
        type: mission.type,
        level: 9999,
        data: {
            siteId: site.id
        }
    })
}