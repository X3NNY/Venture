import { roomFindClosestPotalRoom } from "@/controller/room/function/find";
import { creepGetRangePos, creepIsOnEdge } from "./position";
import { transmitCreepToIntershard } from "@/module/shard/intershard";

export const creepMoveToShard = (creep: Creep, shardName: string, options = {}) => {
    if (!creep.memory.targetShard) creep.memory.targetShard = shardName;

    if (shardName === Game.shard.name) {
        if (creep.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_PORTAL)) {
            if (creep.memory.targetRoom) {
                creepMoveToRoom(creep, creep.memory.targetRoom);
            } else {
                creep.move(RIGHT);
            }
        }
        return ;
    }

    // 寻找传送房间
    if (!creep.memory.cache?.protalRoom) {
        if (Game.flags[shardName+'-PROTAL']) {
            creep.memory.cache.protalRoom = Game.flags[shardName+'-PROTAL'].room.name;
        } else {
            creep.memory.cache.protalRoom = roomFindClosestPotalRoom(creep.room);
        }
    }
    if (!creep.memory.cache?.protalRoom) {
        return ERR_NO_PATH;
    }

    if (creep.room.name !== creep.memory.cache.protalRoom || creepIsOnEdge(creep)) {
        return creepMoveToRoom(creep, creep.memory.cache.protalRoom, options);
    } else {
        // 寻找传送星门
        const portal = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_PORTAL &&
                ((s.destination as any).shard === shardName ||
                    ((parseInt(Game.shard.name[5])-parseInt(shardName[5])) > 1 && (s.destination as any).shard[5] < Game.shard.name[5]) ||
                    ((parseInt(Game.shard.name[5])-parseInt(shardName[5])) < -1 && (s.destination as any).shard[5] > Game.shard.name[5])
                )
        })[0];
        if (!portal) return ;

        // 移动到附近
        if (!creep.pos.isNearTo(portal)) {
            creepMoveTo(creep, portal.pos, { range: 1 });
        } else {
            const data = {
                targetShard: shardName,
                sourceShard: Game.shard.name,
                creepMemory: creep.memory
            }
            if (transmitCreepToIntershard(creep, data)) {
                creepMoveTo(creep, portal.pos);
            }
        }
    }
}

export const creepMoveToRoom = (creep: Creep, roomName: string, options = {}) => {
    if (creep.fatigue > 0) return ERR_TIRED;

    options['range'] = 1;
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

export const creepMoveToRoomBypass = (creep: Creep, roomName: string, options = {}) => {
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
        if (Game.rooms[roomName] && Game.rooms[roomName].controller) {
            lastTargetPos = Game.rooms[roomName].controller.pos;
        } else {
            lastTargetPos = new RoomPosition(20+Math.floor(Math.random()*10+1), 20+Math.floor(Math.random()*10+1), roomName);
        }
        creep.memory.lastTargetPos = lastTargetPos;
    }
    options['costCallback'] = (roomName: string, costMatrix: CostMatrix) => {
        if (roomName === creep.room.name) {
            creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: (c: Creep) => (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0) && !Memory.Whitelist?.includes(c.owner.username)
            }).forEach(
                c => {
                    let poss;
                    if (c.getActiveBodyparts(RANGED_ATTACK) > 0) {
                        poss = creepGetRangePos(c, 2)
                    } else {
                        poss = creepGetRangePos(c, 1);
                    }
                    for (const pos of poss) {
                        costMatrix.set(pos[0], pos[1], 255);
                    }
                }
            )
            creep.room.find(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_KEEPER_LAIR
            }).forEach(
                s => {
                    for (let dx = -3; dx <= 3; dx++ ) {
                        for (let dy = -3; dy <= 3; dy++) {
                            costMatrix.set(s.pos.x+dx, s.pos.y+dy, 255)
                        }
                    }
                }
            )
        }
        return costMatrix;
    }

    const target = new RoomPosition(lastTargetPos.x, lastTargetPos.y, roomName);

    return creep.originMoveTo(target, options);
}

export const creepMoveToHome = (creep: Creep, options = {}) => {
    if (!creep.memory.home) return true;
    if (creep.room.name == creep.memory.home && !creepIsOnEdge(creep)) return true;
    creepMoveToRoom(creep, creep.memory.home, options);
    return false;
}

/**
 * 移动封装：增加黑名单
 * @param creep 
 * @param target 
 */

export const creepMoveTo = (creep: Creep, target: any, options: any = {}) => {
    return creep.moveTo(target, options);
}

export const creepMoveToCoord= (creep: Creep, x: number, y: number, options: any = {}) => {
    // options.costCallback = (roomName, costMatrix) => {
    //     // if (roomName === creep.room.name) {

    //     // }
    //     return costMatrix;
    // }
    return creep.moveTo(x, y, options);
}

export const creepDoubleMoveTo = (creep: Creep, target: RoomPosition, color: string = '#ffffff', ignoreCreeps: boolean = false) => {
    const bindCreep = Game.getObjectById(creep.memory.bindCreep);

    if (!bindCreep) return false;

    const ops = {
        visualizePathStyle: { stroke: color },
        ignoreCreeps: ignoreCreeps
    }
    if (creep.pos.isNearTo(bindCreep.pos)) {
        if (creep.fatigue > 0) return false;

        const result = creepMoveTo(creep, target, ops);
        if (result === OK) {
            creep.pull(bindCreep);
            bindCreep.move(creep);
            return true;
        }
    } else {
        if (creepIsOnEdge(creep)) creepMoveTo(creep, target, ops);
        bindCreep.moveTo(creep);
        return true;
    }
    return false;
}

export const getDirection = (fromPos: RoomPosition, toPos: RoomPosition) => {
    if (fromPos.roomName == toPos.roomName) {
        if (toPos.x > fromPos.x) {    // 下一步在右边
            if (toPos.y > fromPos.y) {    // 下一步在下面
                return BOTTOM_RIGHT;
            } else if (toPos.y == fromPos.y) { // 下一步在正右
                return RIGHT;
            }
            return TOP_RIGHT;   // 下一步在上面
        } else if (toPos.x == fromPos.x) { // 横向相等
            if (toPos.y > fromPos.y) {    // 下一步在下面
                return BOTTOM;
            } else if (toPos.y < fromPos.y) {
                return TOP;
            }
        } else {  // 下一步在左边
            if (toPos.y > fromPos.y) {    // 下一步在下面
                return BOTTOM_LEFT;
            } else if (toPos.y == fromPos.y) {
                return LEFT;
            }
            return TOP_LEFT;
        }
    } else {  // 房间边界点
        if (fromPos.x == 0 || fromPos.x == 49) {  // 左右相邻的房间，只需上下移动（左右边界会自动弹过去）
            if (toPos.y > fromPos.y) {   // 下一步在下面
                return BOTTOM;
            } else if (toPos.y < fromPos.y) { // 下一步在上
                return TOP
            } // else 正左正右
            return fromPos.x ? RIGHT : LEFT;
        } else if (fromPos.y == 0 || fromPos.y == 49) {    // 上下相邻的房间，只需左右移动（上下边界会自动弹过去）
            if (toPos.x > fromPos.x) {    // 下一步在右边
                return RIGHT;
            } else if (toPos.x < fromPos.x) {
                return LEFT;
            }// else 正上正下
            return fromPos.y ? BOTTOM : TOP;
        }
    }
}


export const creepDoubleMoveToRoom = (creep: Creep, roomName: string) => {
    const bindCreep = Game.getObjectById(creep.memory.bindCreep);
    if (!bindCreep) return false;

    if (creep.room.name !== roomName) {
        creepDoubleMoveTo(creep, new RoomPosition(25, 25, roomName), '#ff0000')
        return true;
    } else if (creepIsOnEdge(creep)) {
        creep.move(getDirection(creep.pos, new RoomPosition(25, 25, roomName)))
        bindCreep.moveTo(creep);
        return true;
    } else if (creep.room.name === bindCreep.room.name && creepIsOnEdge(bindCreep)) {
        const terrain = creep.room.getTerrain();
        const pos = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].find(pos => {
            const [nx, ny] = [creep.pos.x+pos[0], creep.pos.y+pos[1]];
            if (nx <= 0 || nx >= 49 || ny <= 0 || ny >= 49) return false;
            if (!bindCreep.pos.isNearTo(nx, ny)) return false;
            if (terrain.get(nx, ny) === TERRAIN_MASK_WALL) return false;
            return true;
        });
        const toPos = new RoomPosition(creep.pos.x+pos[0], creep.pos.y+pos[1], roomName);
        bindCreep.move(getDirection(bindCreep.pos, toPos));
    }
    return false;
}