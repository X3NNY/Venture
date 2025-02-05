import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

const creepOutDefenderActions = {
    patrol: (creep: Creep) => {
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return ;
        }
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: c => !Memory.Whitelist?.includes(c.owner.username)
        });

        let targets = hostiles;

        // 没有敌军时候找一下核心有没有
        if (targets.length === 0) {
            const invaderCores = creep.room.find(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_INVADER_CORE
            });
            targets = invaderCores as any;
        }

        // 什么都没有了治疗友军
        if (targets.length === 0) {
            creepOutDefenderActions.heal(creep);
            return ;
        }

        // 优先攻击治疗单位
        let target = targets.find(c => c.getActiveBodyparts?.(HEAL) > 0);
        if (!target) {
            target = creep.pos.findClosestByRange(targets);
        }
        
        let healFlag = true;

        if (creep.getActiveBodyparts(ATTACK) > 0) {
            if (creep.pos.inRangeTo(target, 1)) {
                creep.attack(target);
                healFlag = false;
                creep.rangedMassAttack();
            } else if (creep.pos.inRangeTo(target, 3)) {
                creep.rangedAttack(target);
                creepMoveTo(creep, target, { ignoreCreeps: false, range: 1 });
            } else {
                creepMoveTo(creep, target, { ignoreCreeps: false, range: 1});
            }
        } else {
            if (creep.pos.inRangeTo(target, 1)) {
                creep.rangedMassAttack();
            } else if (creep.pos.inRangeTo(target, 3)) {
                creep.rangedAttack(target);
                creepMoveTo(creep, target, { ignoreCreeps: false, range: 1 });
            } else {
                creepMoveTo(creep, target, { ignoreCreeps: false, range: 1 });
            }
        }

        // 自我治疗
        if (healFlag && creep.hits < creep.hitsMax) {
            creep.heal(creep);
        }
        return ;
    },
    heal: (creep: Creep) => {
        const damagedCreeps = creep.room.find(FIND_MY_CREEPS, {
            filter: c => c.hits < c.hitsMax
        });
        if (damagedCreeps.length === 0) {
            creepMoveTo(creep, new RoomPosition(25, 25, creep.room.name), { range: 5 });
            return ;
        }

        const closestCreep = creep.pos.findClosestByRange(damagedCreeps);
        const range = creep.pos.getRangeTo(closestCreep);

        if (range <= 1) {
            creep.heal(closestCreep);
        } else if (range <= 3) {
            creep.rangedHeal(closestCreep);
            creep.moveTo(closestCreep);
        } else {
            creep.moveTo(closestCreep);
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