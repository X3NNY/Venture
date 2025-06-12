import { MISSION_TYPE, TRANSPORT_MISSION } from "@/constant/mission";
import { addMission } from "../mission/pool";

export const roomStructureContainer = {
    work: (room: Room) => {
        if (room.level < 8) return ;
        if (Game.time % 100) return ;

        if (room.memory.unBoostPos) {
            const container = room.container.find(c => c.pos.isEqualTo(room.memory.unBoostPos.x, room.memory.unBoostPos.y));

            if (container && container.store.getUsedCapacity() > 1000) {
                const rType = Object.keys(container.store)[0] as ResourceConstant;
                addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.mineral, {
                    source: container.id,
                    target: room.storage?.id || room.terminal?.id, 
                    pos: container.pos,
                    rType: rType,
                    amount: container.store[rType]
                })
            }
        }
    }
}