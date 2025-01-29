export const creepMoveToRoom = (creep: Creep, roomName: string, options = {}) => {
    if (creep.fatigue > 0) return ERR_TIRED;

    options['range'] = 3;
    let lastTargetPos = null;

    // 就在这个房间，移动至controller处
    if (creep.room.name === roomName) {
        lastTargetPos = creep.room.controller?.pos || new RoomPosition(25, 25, roomName);
        creep.memory.lastTargetPos = lastTargetPos;
        options['ignoreCreeps'] = false;
        return creepMoveTo(creep, lastTargetPos, options)
    }
    
    // 上次目标是该房间，移动至上次目标点
    if (creep.memory.lastTargetPos && 
        creep.memory.lastTargetPos.roomName === roomName) {
        lastTargetPos = creep.memory.lastTargetPos;
    } else { // 否则移动至中心附近
        lastTargetPos = new RoomPosition(20+Math.floor(Math.random()*10+1), 20+Math.floor(Math.random()*10+1), roomName);
        creep.memory.lastTargetPos = lastTargetPos;
    }

    const target = new RoomPosition(lastTargetPos.x, lastTargetPos.y, roomName);
    return creepMoveTo(creep, target, options);
}


export const creepMoveToHome = (creep: Creep) => {
    if (!creep.memory.home) return true;
    if (creep.room.name == creep.memory.home) return true;
    creepMoveToRoom(creep, creep.memory.home)
    return false;
}

/**
 * 移动封装：增加黑名单
 * @param creep 
 * @param target 
 */
export const creepMoveTo = (creep: Creep, target: any, options: any = {}) => {
    options.costCallback = (roomName, costMatrix) => {
        // if (roomName === creep.room.name) {

        // }
        return costMatrix;
    }
    return creep.moveTo(target, options);
}

export const creepMoveToCoord= (creep: Creep, x: number, y: number, options: any = {}) => {
    options.costCallback = (roomName, costMatrix) => {
        // if (roomName === creep.room.name) {

        // }
        return costMatrix;
    }
    return creep.moveTo(x, y, options);
}