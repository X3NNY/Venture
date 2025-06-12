import { creepMoveTo, creepMoveToRoom, creepMoveToShard } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

const creepOutScouterActions = {
    scout: (creep: Creep) => {
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }

        const controller = creep.room.controller;
        if (!controller) return ;
        
        if (creep.pos.isNearTo(controller)) {
            const sign = creep.memory['sign'];
            if (sign && sign !== controller.sign?.text)
                creep.signController(creep.room.controller, sign);
        } else {
            creepMoveTo(creep, controller);
        }
        return false;
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}

        if (creep.memory.targetShard && creep.memory.targetShard !== Game.shard.name) {
            creepMoveToShard(creep, creep.memory.targetShard, {visualizePathStyle: {stroke: '#00ff00'}});
            return false;
        }

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