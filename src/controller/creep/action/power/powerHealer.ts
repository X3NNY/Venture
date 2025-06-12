import { CREEP_ROLE } from "@/constant/creep";
import { creepChargeBoost, creepChargeUnboost } from "../../function/charge";
import { creepCheckUnboostAvailable } from "../../function/check";

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true; 
        }

        if (!creep.memory.cache.boosted) {
            const boostLevel = creep.memory.boostLevel;

            if (boostLevel >= 1) {
                creep.memory.cache.boosted = creepChargeBoost(creep, ['LO'], true);
            } else {
                creep.memory.cache.boosted = true;
            }
            return false;
        }

        if (!creep.memory.bindCreep) {
            const powerAttacker = creep.room.find(FIND_MY_CREEPS, { filter: c => c.memory.role === CREEP_ROLE.POWER_ATTACKER && !c.memory.bindCreep && c.memory.targetRoom === creep.memory.targetRoom });

            if (powerAttacker.length > 0) {
                creep.memory.bindCreep = powerAttacker[0].id;
                powerAttacker[0].memory.bindCreep = creep.id; 
            }
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {

        // if (bindCreep.memory.cache.hostile) {
        //     const target = Game.getObjectById<Creep>(bindCreep.memory.cache.hostile);
        //     if (target) {
        //         // if (creep.pos.isNearTo(target)) {
        //         //     creep.rangedMassAttack()
        //         // } else if (creep.pos.inRangeTo(target, 3)) {
        //         creep.rangedAttack(target)
        //         // }
        //     }
        // }

        if (creep.hits < creep.hitsMax) {
            return creep.heal(creep);
        }
        const bindCreep = Game.getObjectById(creep.memory.bindCreep);
        if (!bindCreep) {
            if (creep.room.name === creep.memory.home) {
                if (creepCheckUnboostAvailable(creep)) {
                    creepChargeUnboost(creep);
                } else {
                    creep.suicide();
                }
            }
            return ;
        }

        if (creep.pos.isNearTo(bindCreep)) {
            creep.heal(bindCreep);
        } else {
            creep.moveTo(bindCreep);
        }
    }
}