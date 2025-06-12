import { creepChargeBoost } from "../../function/charge";
import { creepDoubleMoveTo, creepDoubleMoveToRoom, creepMoveTo } from "../../function/move";

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }

        if (!creep.memory.boosted) {
            const boosts = ['XGHO2', 'GHO2', 'GO', 'XZH2O', 'ZH2O', 'ZH', 'XZHO2', 'ZHO2', 'ZO'];
            creep.memory.boosted = creepChargeBoost(creep, boosts);
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        if (!creep.memory.bindCreep && creep.room.name !== creep.memory.targetRoom) return ;

        const bindCreep = Game.getObjectById(creep.memory.bindCreep) as Creep;

        if (!bindCreep) {
            delete creep.memory.bindCreep;
        }

        if (bindCreep && creepDoubleMoveToRoom(creep, creep.memory.targetRoom)) return ;

        if (creep.room.controller?.my) return false;

        const disflag = Game.flags[creep.memory.targetRoom+'-DIS']

        if (disflag) {
            const structs = disflag.pos.lookFor(LOOK_STRUCTURES);
            
            if (structs.length > 0) {
                const fstruct = structs.filter(
                    s => s.structureType !== STRUCTURE_ROAD &&
                        s.structureType !== STRUCTURE_CONTAINER);
                const target = fstruct.find(s => s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART) || fstruct[0];;
                if (creep.pos.isNearTo(target)) {
                    creep.dismantle(target); 
                } else {
                    if (bindCreep) {
                        creepDoubleMoveTo(creep, target.pos); 
                    } else {
                        creepMoveTo(creep, target.pos); 
                    }
                }
                return ;
            } else {
                disflag.remove();
            }
        }

        let target = Game.getObjectById<Structure>(creep.memory.cache?.wall);

        if (!target) {
            const walls = creep.room.find(FIND_STRUCTURES, {
                filter: s => s.structureType === STRUCTURE_WALL || s.structureType === STRUCTURE_RAMPART
            });
            target = creep.pos.findClosestByRange(walls);
            if (target) {
                creep.memory.cache.wall = target.id;
            }
        }
        if (target) {
            if (creep.pos.isNearTo(target.pos)) {
                creep.dismantle(target);
            } else {
                if (bindCreep) {
                    creepDoubleMoveTo(creep, target.pos);
                } else {
                    creepMoveTo(creep, target.pos);
                }
            }
        }
    }
}