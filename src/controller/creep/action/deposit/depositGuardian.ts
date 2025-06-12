import { CREEP_ROLE } from "@/constant/creep";
import { creepMoveTo, creepMoveToRoom, getDirection } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";
import { creepChargeBoost } from "../../function/charge";

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true; 
        }

        const boostLevel = creep.memory.boostLevel || 0;

        if (boostLevel === 0) {
            return true;
        } else if (boostLevel === 1) {
            return creepChargeBoost(creep, ['UH', 'GO'], true);
        } else if (boostLevel === 2) {
            return creepChargeBoost(creep, ['UH2O', 'GHO2'], true);
        }

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        // let isHeal = false, isAttack = false;

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            // if (creep.hits < creep.hitsMax) creep.heal(creep);
            return false;
        }

        // if (creep.hits < creep.hitsMax) {
        //     creep.heal(creep);
        //     isHeal = true;
        // }

        // 找敌人
        if (Game.time % 5 === 0 || !creep.memory.cache.hostile) {
            const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10) || [];

            const target = creep.pos.findClosestByRange(hostiles);
            
            if (target) creep.memory.cache.hostile = target.id;
        }
        
        // 攻击敌人
        if (creep.memory.cache.hostile) {
            const target = Game.getObjectById<Creep>(creep.memory.cache.hostile);
            if (target && target.room.name != creep.room.name) {
                creep.memory.cache.hostile = null;
                return ;
            }
            if (target) {
                if (creep.pos.isNearTo(target)) return creep.attack(target);
                return creepMoveTo(creep, target.pos);
            } else {
                creep.memory.cache.embattle = false;
                delete creep.memory.cache.hostile;
            }
        }

        if (!creep.memory.cache.embattle) {
            const deposits = creep.room.deposit ?? creep.room.find(FIND_DEPOSITS);
            const activeDeposit = deposits.filter(d => d.lastCooldown <= 120);

            if (activeDeposit.length > 0) {
                if (creep.pos.isNearTo(activeDeposit[0])) {
                    creep.memory.cache.embattle = true;
                } else {
                    creepMoveTo(creep, activeDeposit[0], { ignoreCreeps: false, range: 4, maxRooms: 1 });
                }
            }
        }
    }
}