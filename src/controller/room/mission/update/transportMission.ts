import { MISSION_TYPE, TRANSPORT_MISSION } from "@/constant/mission";
import { addMission } from "../pool";

// 能量运输任务
const updateEnergyMission = (room: Room) => {
    let energy = (room.storage?.store[RESOURCE_ENERGY]||0) + (room.terminal?.store[RESOURCE_ENERGY]||0);

    if (energy < 10000) return ;

    let source = null;
    
    // 从能量多的地方取
    if (room.storage && room.terminal) {
        source = room.storage.store[RESOURCE_ENERGY] > room.terminal.store[RESOURCE_ENERGY] ? room.storage : room.terminal;
    } else {
        source = room.storage || room.terminal;
    }
    if (!source) return ;

    if (room.spawn && room.energyAvailable < room.energyCapacityAvailable) {
        let spawns = room.spawn.filter(s => s?.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        let extensions = room.extension.filter(s => s?.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        const targets = spawns.concat(extensions as any[]);
        targets.forEach(s => {
            if (energy < s.store.getFreeCapacity(RESOURCE_ENERGY)) return ;
            energy -= s.store.getFreeCapacity(RESOURCE_ENERGY);
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.spawn, {
                source: source.id,
                target: s.id,
                pos: { x: s.pos.x, y: s.pos.y, roomName: s.pos.roomName },
                rType: RESOURCE_ENERGY,
                amount: s.store.getFreeCapacity(RESOURCE_ENERGY)
            });
        })
    }

    // 检查塔是否需要能量
    if (room.level >= 3 && room.tower) {
        const towers = room.tower.filter(t => t?.store.getFreeCapacity(RESOURCE_ENERGY) > 200);
        towers.forEach(t => {
            if (energy < t.store.getFreeCapacity(RESOURCE_ENERGY)) return ;
            energy -= t.store.getFreeCapacity(RESOURCE_ENERGY);
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.tower, {
                source: source.id,
                target: t.id,
                pos: { x: t.pos.x, y: t.pos.y, roomName: t.pos.roomName },
                resourceType: RESOURCE_ENERGY,
                amount: t.store.getFreeCapacity(RESOURCE_ENERGY)
            })
        })
    }

    if (energy < 10000) return ;
} 

export const updateTransportMission = (room: Room) => {
    const storage = room.storage;
    if (!storage) return ;

    updateEnergyMission(room);
}