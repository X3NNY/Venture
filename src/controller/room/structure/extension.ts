import { MISSION_TYPE, TRANSPORT_MISSION } from "@/constant/mission";
import { getRoomPowerCreepCount } from "../function/get";
import { addMission } from "../mission/pool";

export const roomStructureExtension = {
    work: (room: Room) => {
        if (room.level < 6) return ;
        if (!room.spawn || room.energyAvailable === room.energyCapacityAvailable) return ;
        if (!global.SpawnCount?.[room.name] && Game.time % 50 !== 0) return ;

        
        const spawns = room.spawn.filter(s => s?.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        let targets;

        if (getRoomPowerCreepCount(room, pc => !!pc.powers[PWR_OPERATE_EXTENSION]) > 0) {
            targets = spawns;
        } else {
            targets = spawns.concat(room.extension.filter(s => s?.store.getFreeCapacity(RESOURCE_ENERGY) > 0) as any[])
        }
        const source = room.storage.store[RESOURCE_ENERGY] > room.terminal.store[RESOURCE_ENERGY] ? room.storage : room.terminal;

        targets.forEach(s => {
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.spawn, {
                source: source.id,
                target: s.id,
                pos: { x: s.pos.x, y: s.pos.y, roomName: s.pos.roomName },
                rType: RESOURCE_ENERGY,
                amount: s.store.getFreeCapacity(RESOURCE_ENERGY)
            });
        });
        if (global.SpawnCount?.[room.name] > 0) {
            global.SpawnCount[room.name]--;
        }
    }
}