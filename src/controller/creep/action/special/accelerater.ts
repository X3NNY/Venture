import { creepChargeBoost, creepChargeUnboost } from "../../function/charge";

const creepAcceleraterActions = {
    withdraw: (creep: Creep) => {
        if (!creep.memory.boosted) {
            creep.memory.boosted = creepChargeBoost(creep, ['XGH2O', 'GH2O', 'GH']);
            return ;
        }

        if (creep.ticksToLive < 50 && creep.body.some(part => part.boost)) {
            if (creepChargeUnboost(creep)) {
                creep.suicide();
            }
            return false;
        }

        const link = creep.room.link.find(l => l.pos.inRangeTo(creep.room.controller, 2));
        const container = creep.room.container.find(c => c.pos.inRangeTo(creep.room.controller, 2));
        const terminal = creep.room.terminal?.pos.inRangeTo(creep.room.controller, 3);
    },
    upgrader: (creep: Creep) => {
        
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};

        creep.memory.action = 'withdraw';
        return creepChargeBoost(creep, ['XGH2O', 'GH2O', 'GH']);
    },
    action: (creep: Creep) => {
        switch (creep.memory.action) {
            case 'withdraw':
                creepAcceleraterActions.withdraw(creep);
                break;
            case 'upgrader':
                creepAcceleraterActions.upgrader(creep);
                break;
        }
    }
}