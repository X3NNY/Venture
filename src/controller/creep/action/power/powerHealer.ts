import { CREEP_ROLE } from "@/constant/creep";
import { creepChargeBoost } from "../../function/charge";

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
                creep.memory.cache.boosted = creepChargeBoost(creep, ['LO']);
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
        if (creep.hits < creep.hitsMax) {
            return creep.heal(creep);
        }

        const bindCreep = Game.getObjectById(creep.memory.bindCreep);
        if (!bindCreep) return creep.suicide();

        if (creep.pos.isNearTo(bindCreep)) {
            creep.heal(bindCreep);
        } else {
            creep.moveTo(bindCreep);
        }
    }
}