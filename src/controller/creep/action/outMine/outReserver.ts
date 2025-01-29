import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

export default {
    prepare: (creep: Creep) => {
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        const controller = creep.room.controller;

        if(!controller) return ;

        if (creep.pos.inRangeTo(controller, 1)) {
            // 别人预定了 攻击
            if (controller.reservation &&
                controller.reservation.username !== creep.owner.username
            ) {
                creep.attackController(controller);
            } else {
                const ticks = controller.reservation?.ticksToEnd || 0;
                if (ticks > 4990) return false;
                creep.reserveController(controller);
            }

            if (!controller.sign || controller.sign.username !== creep.owner.username) {
                creep.signController(controller, creep.memory['sign'] ?? '𝙑𝙚𝙣𝙩𝙪𝙧𝙚');
            }
        } else {
            creepMoveTo(creep, controller, { ignoreCreeps: false });
        }
    },
}