import { coordDecompress } from "@/util/coord";

// 获取指定房间的工作爬爬数量
export const getRoomTargetCreepNum = (roomName: string) => {
    if (global.RoomCreepNum?.time === Game.time) {
        return global.RoomCreepNum[roomName] || {};
    }

    global.RoomCreepNum = {}
    for (const name in Game.creeps) {
        const creep = Game.creeps[name];
        const role = creep.memory.role;
        const targetRoom = creep.memory.targetRoom;

        if (!role || !targetRoom) continue;

        if (!global.RoomCreepNum[targetRoom]) {
            global.RoomCreepNum[targetRoom] = {};
        }
        if (!global.RoomCreepNum[targetRoom][role]) {
            global.RoomCreepNum[targetRoom][role] = []
        }
        global.RoomCreepNum[targetRoom][role].push({
            ticks: creep.ticksToLive,
            spawning: creep.spawning,
            home: creep.memory.home
        });
    }
    global.RoomCreepNum.time = Game.time;
    return global.RoomCreepNum[roomName] || {};
}

/**
 * 获取房间指定资源数量
 * @param room 
 * @param rType
 */
export const getRoomResourceAmount = (room: Room, rType: ResourceConstant) => {
    let amount = 0;
    if (room.storage)  amount += room.storage.store[rType];
    if (room.terminal) amount += room.terminal.store[rType];

    return amount;
}

export const getRoomNumber = () => {
    return Object.values(Game.rooms).filter(room => room.my).length;
}

export const getRoomList = () => {
    return Object.keys(Game.rooms).filter(room => Game.rooms[room].my);
}

/**
 * 获取房间中心LAB
 * @param room 
 */
export const getRoomCenterLab = (room: Room) => {
    const layout = Memory.Layout[room.name];
    if (!layout) return ;

    const vmap = {}
    for (const pos of layout[STRUCTURE_LAB]) {
        vmap[pos] = 1;
    }
    let labA, labB;
    for (const pos of layout[STRUCTURE_LAB]) {
        if (!vmap[pos+65]) continue;        // +1 +1
        if (!vmap[pos-63]) continue;        // -1 +1
        if (!vmap[pos+63]) continue;        // +1 -1
        if (!vmap[pos-65]) continue;        // -1 -1
        const xy = coordDecompress(pos);
        if (!labA) {
            labA = room.lookForAt(LOOK_STRUCTURES, xy[0], xy[1]).find(s => s.structureType === STRUCTURE_LAB);;
            continue;
        }
        if (!labB) {
            labB = room.lookForAt(LOOK_STRUCTURES, xy[0], xy[1]).find(s => s.structureType === STRUCTURE_LAB);
            continue;
        }
    }

    if (!labA || !labB) return ;

    return [labA.id, labB.id]
}