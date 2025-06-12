import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        // 远程攻击和治疗不冲突
        if (creep.hits < creep.hitsMax) creep.heal(creep);

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return ;
        }

        let target = Game.getObjectById(creep.memory.cache?.target as Id<Creep>);

        if (!target) {
            const hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                target = creep.pos.findClosestByRange(hostiles);
                if (target) {
                    creep.memory.cache = {target: target.id};
                }
            }
        }

        if (target) {
            if (creep.pos.isNearTo(target)) {
                creep.rangedMassAttack();
            } else if (creep.pos.inRangeTo(target, 3)) {
                creep.rangedAttack(target);
                creepMoveTo(creep, target);
            } else {
                creepMoveTo(creep, target);
            }
            return ;
        }

        // 治疗友军
        const myCreeps = creep.room.find(FIND_MY_CREEPS, {
            filter: (c) => c.hits < c.hitsMax
        });

        if (myCreeps.length > 0) {
            const target = creep.pos.findClosestByRange(myCreeps);
            if (target) {
                if (creep.pos.isNearTo(target)) {
                    creep.heal(target);
                } else {
                    creepMoveTo(creep, target);
                }
            }
        }
    },
    done: (creep: Creep, res: any) => {

    }
}