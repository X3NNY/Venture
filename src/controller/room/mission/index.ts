import { roomMissionUpdate } from "./update";
import { MISSION_TYPE } from '@/constant/mission';

const roomMissionInit = (room: Room) => {
    if (!room.memory.missions) room.memory.missions = {}

    const pools = room.memory.missions;
    const poolTypes = Object.values(MISSION_TYPE);

    Object.keys(pools).forEach(t => {
        if (!poolTypes.includes(t)) delete pools[t]
    })
    poolTypes.forEach(t => {
        if (!pools[t]) pools[t] = []
    })
}

export {
    roomMissionInit,
    roomMissionUpdate
}