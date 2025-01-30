import { creepChargeEnergy } from "../../function/charge";
import { creepMoveTo, creepMoveToHome } from "../../function/move";

const sign = () => {

}

const creepUpgraderActions = {
    withdraw: (creep: Creep) => {
        const link = creep.room.link.find(l => l.pos.inRangeTo(creep.room.controller, 2));
        let container = creep.room.container.find(c => c.pos.inRangeTo(creep.room.controller, 2)) ?? null;
        let res;

        // 有控制器链接
        if (link && link.store[RESOURCE_ENERGY] > 0) {
            res = creep.withdraw(link, RESOURCE_ENERGY);
            if (res === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, link, { maxRooms: 1, range: 1 });
            }
        } 
        // 控制器旁边有容器
        else if (container && container.store[RESOURCE_ENERGY] > 0) {
            res = creep.withdraw(container, RESOURCE_ENERGY);
            if (res === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, container, { maxRooms: 1, range: 1 });
            }
        }
        
        // 否则自己找
        else if (creep.room.level < 6) {
            creepChargeEnergy(creep)
        }

        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'upgrade';
        }
    },
    upgrade: (creep: Creep) => {
        if (!creepMoveToHome(creep)) return ;

        // 先移动过去
        const link = creep.room.link.find(l => l.pos.inRangeTo(creep.room.controller, 2));
        if (link && !creep.pos.inRangeTo(link, 1)) {
            creepMoveTo(creep, creep.room.controller.pos, {
                maxRooms: 1,
                range: 2,
            })
        }
        else if (!link && !creep.pos.inRangeTo(creep.room.controller, 2)) {
            creepMoveTo(creep, creep.room.controller.pos, {
                maxRooms: 1,
                range: 2,
            })
        }

        if (creep.pos.inRangeTo(creep.room.controller, 3)) {
            creep.upgradeController(creep.room.controller);

            const sign = Memory.RoomInfo[creep.room.name].sign ?? '𝙑𝙚𝙣𝙩𝙪𝙧𝙚';
            if (creep.room.controller && (creep.room.controller.sign?.text ?? '') !== sign) {
                if (creep.pos.inRangeTo(creep.room.controller, 1)) {
                    creep.signController(creep.room.controller, sign);
                } else {
                    creepMoveTo(creep, creep.room.controller, { maxRooms: 1, range: 1 });
                }
            }
        }

        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        creep.memory.action = 'withdraw';
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'withdraw':        creepUpgraderActions.withdraw(creep); break;
            case 'upgrade':         creepUpgraderActions.upgrade(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {

    }
}