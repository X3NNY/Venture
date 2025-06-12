import { creepChargeBoost } from "../../function/charge";
import { creepDoubleMoveTo, creepDoubleMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";


const moveWithAttack = (creep: Creep, target: RoomPosition) => {
    creepDoubleMoveTo(creep, target, '#ff0000');

    if (creep.fatigue > 0) {
        const target = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1);
        if (target.length > 0) {
            creep.attack(target[0]);
        }
    }
}


const creepDoubleAttackerActions = {
    attack: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        const flag = Game.flags['ATTACK'];
        if (flag && flag.room && flag.room.name === creep.room.name) {
            const structs = flag.pos.lookFor(LOOK_STRUCTURES);
            if (structs.length === 0) {
                flag.remove();
            } else {
                if (creep.pos.inRangeTo(flag, 1)) {
                    creep.attack(structs[0]);
                } else {
                    moveWithAttack(creep, flag.pos);
                }
                return ;
            }
        }

        const enemies = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: c => !creepIsOnEdge(c) && (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0 || c.getActiveBodyparts(HEAL) > 0)
        });
        if (enemies.length > 0) {
            const targetEnemy = creep.pos.findClosestByRange(enemies);
            if(creep.pos.inRangeTo(targetEnemy, 1)) {
                creep.attack(targetEnemy);
            } else {
                creepDoubleMoveTo(creep, targetEnemy.pos, '#ff0000');
            }
            creep.memory.cache.target = null;
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
                moveWithAttack(creep, target.pos);
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
            const boosts = ['XGHO2', 'GHO2', 'GO', 'XUH2O', 'UH2O', 'UH'];
            if (creep.getActiveBodyparts(MOVE) < 25) {
                boosts.push('XZHO2', 'ZHO2', 'ZO');
            }
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