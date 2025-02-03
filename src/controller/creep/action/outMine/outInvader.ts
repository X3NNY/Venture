import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

const creepOutDefenderActions = {
    patrol: (creep: Creep) => {
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: c => !Memory.Whitelist?.includes(c.owner.username)
        });

        let targets = hostiles;

        // 优先攻击核心
        const invaderCores = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_INVADER_CORE
        });

        if (invaderCores.length === 0) {
            const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
                filter: (c: Creep) => !Memory.Whitelist?.includes(c.owner.username) && (
                    c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0
                )});
            targets = hostileCreeps;
        } else {
            targets = invaderCores as any;
        }

        if (targets.length > 0) {
            const target = creep.pos.findClosestByRange(targets);
            if (creep.pos.inRangeTo(target, 1)) {
                creep.attack(target);
            } else {
                creepMoveTo(creep, target, { ignoreCreeps: false, range: 1});
            }
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return ;
        }
        creep.memory.action = 'patrol'
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'patrol':          creepOutDefenderActions.patrol(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {

    }
}