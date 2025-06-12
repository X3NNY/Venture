import { creepMoveTo, creepMoveToRoom, creepMoveToRoomBypass, creepMoveToShard } from "../../function/move";
import { creepFindClosestTarget, creepGetRangePos, creepIsOnEdge } from "../../function/position";

const creepDoneClaim = (creep: Creep) => {
    const targetRoom = creep.memory.targetRoom;

    // 不是全自动模式不处理
    if (Memory.gamemode !== 'auto') return ;

    Memory.RoomInfo[targetRoom] = {
        autobuild: true,
    }

    for (const room of Object.keys(Game.rooms)) {
        if (!Game.rooms[room]?.my) continue;
        const outms = Memory.RoomInfo[room].OutMineral;

        if (!outms) continue;

        // 如果是其他房间的外矿，取消开采
        for (const rType in outms) {
            if (outms[rType].indexOf(targetRoom) !== -1) {
                outms[rType].splice(outms[rType].indexOf(targetRoom), 1);
            }
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};

        // 自我治疗
        if (creep.getActiveBodyparts(HEAL) > 0 && creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }

        if (creep.memory.targetShard && creep.memory.targetShard !== Game.shard.name) {
            return creepMoveToShard(creep, creep.memory.targetShard);
        }

        const flag = Game.flags['CP-CLAIM'];
        if (flag && !creep.memory.cache.checkpoint) {
            if ((creep.room.name !== flag.pos.roomName || !creep.pos.isEqualTo(flag.pos)) || creepIsOnEdge(creep)) {
                // 绕过敌对单位
                if (creep.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (c: Creep) => (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0) && !Memory.Whitelist?.includes(c.owner.username)
                }).length > 0) {
                    creepMoveTo(creep, flag.pos, {visualizePathStyle: {stroke: '#00ff00', swampCost: 2}})
                } else {
                    creepMoveTo(creep, flag.pos, {visualizePathStyle: {stroke: '#00ff00', swampCost: 2}})
                }
                return false;
            } else {
                creep.memory.cache.checkpoint = true;
            }
        }

        const protalRoom = creep.memory.protalRoom;
        if (protalRoom && !creep.memory.cache.protalcheck) {
            if (creep.room.name !== protalRoom || creepIsOnEdge(creep)) {
                creepMoveToRoom(creep, protalRoom, {visualizePathStyle: {stroke: '#00ff00', swampCost: 2}})
            } else {
                const protals = creep.room.find(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_PORTAL
                });
                if (protals.length > 0) {
                    const protal = creepFindClosestTarget(creep, protals);

                    if (!creep.pos.isNearTo(protal)) {
                        creepMoveTo(creep, protal, { range: 1, swampCost: 2});
                    } else {
                        creep.say('🚪');
                        creepMoveTo(creep, protal);
                        creep.memory.cache.protalcheck = true;
                    }
                    return ;
                }
            }
        }

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            // 绕过敌对单位
            // if (creep.room.find(FIND_HOSTILE_CREEPS, {
            //     filter: (c: Creep) => (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0) && !Memory.Whitelist?.includes(c.owner.username)
            // }).length > 0) {
            //     creepMoveToRoom(creep, creep.memory.targetRoom, {visualizePathStyle: {stroke: '#00ff00', swampCost: 2}})
            // } else {
                creepMoveToRoom(creep, creep.memory.targetRoom, {visualizePathStyle: {stroke: '#00ff00', swampCost: 2}})
            // }
            return false;
        }

        return true;
    },
    action: (creep: Creep) => {
        const controller = creep.room.controller;
        if (!controller) return ;

        // 自我治疗
        if (creep.getActiveBodyparts(HEAL) > 0 && creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }

        if (controller.reservation && controller.reservation.username !== creep.owner.username) {
            const result = creep.reserveController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, controller, { maxRooms: 1, range: 1 });
            }
            return ;
        }

        if (!controller.my) {
            const result = creep.claimController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, controller, { maxRooms: 1, range: 1 });
                return ;
            } else if (result !== OK) {
                creep.reserveController(controller);
            }

            if (result === OK) {
                creepDoneClaim(creep);
            }

            if (controller.sign?.username !== creep.owner.username) creep.signController(controller, creep.memory.sign??'𝙑𝙚𝙣𝙩𝙪𝙧𝙚');
        }
    }
}