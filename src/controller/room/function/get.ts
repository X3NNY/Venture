
// 获取指定房间的工作爬爬数量
export const getRoomTargetCreepNum = (roomName: string) => {
    if (global.RoomCreepNum?.time === Game.time) {
        return global.RoomCreepNum[roomName] || {};
    }

    global.RoomCreepNum = { time: Game.time }
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
    return global.RoomCreepNum[roomName] || {};
}