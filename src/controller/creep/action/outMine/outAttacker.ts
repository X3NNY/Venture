import { CREEP_ROLE } from "@/constant/creep";
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
        const hostiles = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: c => c.owner.username === 'Source Keeper'
        });

        // 清理敌军
        if (hostiles.length > 0) {
            // 优先攻击治疗者
            const target = creep.pos.findClosestByRange(hostiles, {
                filter: (c: Creep) => c.getActiveBodyparts(HEAL) > 0
            });
            if (target) {
                if (!creep.pos.isNearTo(target)) {
                    creepMoveTo(creep, target);
                } else {
                    creep.attack(target);
                    creepMoveTo(creep, target);
                    return ;
                }
            } else {
                const target = creep.pos.findClosestByRange(hostiles);
                if (!creep.pos.isNearTo(target)) {
                    creepMoveTo(creep, target);
                } else {
                    creep.attack(target);
                    creepMoveTo(creep, target);
                    return ;
                }
            }

            if (creep.hits < creep.hitsMax) creep.heal(creep);
            return ;
        }

        // 寻找受伤的爬爬
        const myCreeps = creep.room.find(FIND_MY_CREEPS, {
            filter: c => c.hits < c.hitsMax && c.id !== creep.id && c.memory.role !== CREEP_ROLE.OUT_CARRIER
        });
        if (myCreeps.length > 0) {
            const target = creep.pos.findClosestByRange(myCreeps);
            if (creep.pos.inRangeTo(target, 1)) {
                creep.heal(target);
            } else {
                if (creep.hits < creep.hitsMax) creep.heal(creep);
                creepMoveTo(creep, target);
            }
            return ;
        }

        // 找马上要孵化的巢穴
        const lairs = creep.room.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_KEEPER_LAIR
        });
        if (lairs.length > 0) {
            const target = lairs.reduce((l, r) => l.ticksToSpawn < r.ticksToSpawn ? l : r);

            if (!creep.pos.isNearTo(target)) {
                creepMoveTo(creep, target);
            }
            if (creep.hits < creep.hitsMax) creep.heal(creep);
            return 
        }

        if (creep.hits < creep.hitsMax) creep.heal(creep);
        return;

    },
    done: (creep: Creep, res: any) => {

    }
}