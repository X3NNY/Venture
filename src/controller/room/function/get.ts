
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