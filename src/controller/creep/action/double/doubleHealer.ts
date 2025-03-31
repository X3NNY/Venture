import { CREEP_ROLE } from "@/constant/creep";
import { creepChargeBoost } from "../../function/charge";
import { creepMoveToHome } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }

        if (!creep.memory.boosted) {
            const boosts = ['XGHO2', 'GHO2', 'GO', 'XLHO2', 'LHO2', 'LO', 'XZHO2', 'ZHO2', 'ZO'];
            creep.memory.boosted = creepChargeBoost(creep, boosts);
            return false;
        }
        
        const creeps = creep.room.find(FIND_MY_CREEPS, {
            filter: c => (c.memory.role === CREEP_ROLE.DOUBLE_ATTACKER || c.memory.role === CREEP_ROLE.DOUBLE_DISMANTLER) && !c.memory.bindCreep
        });
        if (creeps.length > 0) {
            const bindCreep = creep.pos.findClosestByRange(creeps);
            creep.memory.bindCreep = bindCreep.id;
            bindCreep.memory.bindCreep = creep.id;
            return true;
        }
        return false;
    },
    action: (creep: Creep) => {
        let isHeal = false;
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
            isHeal = true;
        }

        if (!creep.memory.bindCreep) {
            if (creep.room.name !== creep.memory.home || creepIsOnEdge(creep)) {
                return creepMoveToHome(creep);
            }
            creep.memory.ready = false;
            return ;
        }

        const bindCreep = Game.getObjectById(creep.memory.bindCreep);
        if (!bindCreep) {
            delete creep.memory.bindCreep;
            return ;
        }

        if (bindCreep && !isHeal) {
            if (creep.pos.isNearTo(bindCreep)) {
                creep.heal(bindCreep);
                isHeal = true;
            } else if (creep.pos.inRangeTo(bindCreep, 3)) {
                creep.rangedHeal(bindCreep);
                isHeal = true;
            }
        }

        if (creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
            const enemies = creep.room.lookForAtArea(LOOK_CREEPS, ...[
                Math.max(creep.pos.y - 4, 0),
                Math.max(creep.pos.x - 4, 0),
                Math.min(creep.pos.y + 4, 49),
                Math.min(creep.pos.x + 4, 49)
            ], true)
            .map(o => o.creep)
            .filter(c => !c.my);
            if (enemies.length > 0) {
                if (creep.pos.inRangeTo(enemies[0], 3)) {
                    creep.rangedAttack(enemies[0]);
                    return ;
                }
            }
        }
    }
}