import { creepMoveTo, creepMoveToRoom } from "../../function/move";

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
        if (creep.room.name !== creep.memory.targetRoom) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }

        return true;
    },
    action: (creep: Creep) => {
        const controller = creep.room.controller;
        if (!controller) return ;

        if (controller.reservation && controller.reservation.username !== creep.owner.username) {
            const result = creep.reserveController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, controller);
            }
            return ;
        }

        if (!controller.my) {
            const result = creep.claimController(controller);
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, controller);
                return ;
            } else if (result !== OK) {
                creep.reserveController(controller);
            }

            if (result === OK) {
                creepDoneClaim(creep);
            }

            if (controller.sign.username !== creep.owner.username) creep.signController(controller, creep.memory.sign??'𝙑𝙚𝙣𝙩𝙪𝙧𝙚');
        }
    }
}