import { creepMoveTo, creepMoveToRoom } from "../../function/move";

const creepOutScouterActions = {
    scout: (creep: Creep) => {
        if (creep.room.name !== creep.memory.targetRoom) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }

        const controller = creep.room.controller;
        if (!controller) return ;
        const sign = creep.memory['sign'] ?? '𝙑𝙚𝙣𝙩𝙪𝙧𝙚';
        if (sign !== controller.sign?.text) {
            if (creep.pos.isNearTo(controller)) {
                creep.signController(creep.room.controller, sign);
            } else {
                creepMoveTo(creep, controller);
            }
        }
        return false;
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}
        creep.memory.action = 'scout';
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'scout':       creepOutScouterActions.scout(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {
        
    }
}