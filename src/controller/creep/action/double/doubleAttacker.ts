import { creepChargeBoost } from "../../function/charge";
import { creepDoubleMoveTo, creepDoubleMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

const creepDoubleAttackerActions = {
    attack: (creep: Creep) => {
        const enemies = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: c => !creepIsOnEdge(c)
        });
        if (enemies.length > 0) {
            const targetEnemy = creep.pos.findClosestByRange(enemies);
            if(creep.pos.inRangeTo(targetEnemy, 1)) {
                creep.attack(targetEnemy);
            } else {
                creepDoubleMoveTo(creep, targetEnemy.pos, '#ff0000');
            }
            return ;
        }

        let target = Game.getObjectById<Structure>(creep.memory.cache?.target);

        if (!target) {
            const enemyStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_SPAWN ||
                            s.structureType === STRUCTURE_TOWER ||
                            s.structureType === STRUCTURE_EXTENSION ||
                            s.structureType === STRUCTURE_RAMPART
            });
    
            if (enemyStructures.length > 0) {
                target = creep.pos.findClosestByRange(enemyStructures);
                if (target) {
                    creep.memory.cache.target = target.id;
                }
            }
        }

        if (target) {
            if (creep.pos.inRangeTo(target, 1)) {
                creep.attack(target);
            } else {
                creepDoubleMoveTo(creep, target.pos, '#ff0000'); 
            }
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }

        if (!creep.memory.boosted) {
            const boosts = ['XGHO2', 'GHO2', 'GO', 'XUH2O', 'UH2O', 'UH', 'XZHO2', 'ZHO2', 'ZO'];
            creep.memory.boosted = creepChargeBoost(creep, boosts);
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        if (!creep.memory.bindCreep) return false;
        const bindCreep = Game.getObjectById(creep.memory.bindCreep) as Creep;
        
        if (!bindCreep) {
            delete creep.memory.bindCreep;
            return false; 
        }

        // if (creepDoubleAttackerActions.move(creep)) return ;

        if (creepDoubleMoveToRoom(creep, creep.memory.targetRoom)) return ;

        creepDoubleAttackerActions.attack(creep)
    }
}