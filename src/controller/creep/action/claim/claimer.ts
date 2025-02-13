import { creepMoveTo, creepMoveToRoom, creepMoveToRoomBypass } from "../../function/move";
import { creepGetRangePos, creepIsOnEdge } from "../../function/position";

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
        const flag = Game.flags['CP-CLAIM'];
        if (flag && !creep.memory.cache.checkpoint) {
            if (creep.room.name !== flag.pos.roomName || creepIsOnEdge(creep)) {
                // 绕过敌对单位
                if (creep.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (c: Creep) => (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0) && !Memory.Whitelist?.includes(c.owner.username)
                }).length > 0) {
                    creepMoveToRoomBypass(creep, flag.pos.roomName, {visualizePathStyle: {stroke: '#00ff00'}})
                } else {
                    creepMoveToRoom(creep, flag.pos.roomName, {visualizePathStyle: {stroke: '#00ff00'}})
                }
                return false;
            } else {
                creep.memory.cache.checkpoint = true;
            }
        }

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            // 绕过敌对单位
            if (creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: (c: Creep) => (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0) && !Memory.Whitelist?.includes(c.owner.username)
            }).length > 0) {
                creepMoveToRoomBypass(creep, creep.memory.targetRoom, {visualizePathStyle: {stroke: '#00ff00'}})
            } else {
                creepMoveToRoom(creep, creep.memory.targetRoom, {visualizePathStyle: {stroke: '#00ff00'}})
            }
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