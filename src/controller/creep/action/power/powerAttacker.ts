import { creepChargeBoost } from "../../function/charge";
import { creepDoubleMoveTo, creepDoubleMoveToRoom, creepMoveTo } from "../../function/move";

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};

        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true;
        }
        const boostLevel = creep.memory.boostLevel;

        if (boostLevel === 0) {
            return true;
        } else if (boostLevel === 1) {
            return creepChargeBoost(creep, ['UH', 'GO']);
        } else if (boostLevel === 2) {
            return creepChargeBoost(creep, ['UH2O', 'GHO2']);
        }
    },
    action: (creep: Creep) => {
        // 没绑定creep,但是走到了，先清理敌人 
        if (!creep.memory.bindCreep && creep.room.name === creep.memory.targetRoom) {
            const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 8) || [];
            if (hostiles.length === 0) return ;
            const healHostiles = hostiles.filter(c => c.body.some(p => p.type === HEAL));

            if (healHostiles.length > 0) {
                const target = creep.pos.findClosestByRange(healHostiles);
                if (creep.pos.isNearTo(target)) creep.attack(target); 
                return creep.moveTo(target);
            }

            const attackHostiles = hostiles.filter(c => c.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK));
            if (attackHostiles.length > 0) {
                const target = creep.pos.findClosestByRange(attackHostiles);
                if (creep.pos.isNearTo(target)) creep.attack(target);
                return creep.moveTo(target);
            }
        }

        if (!creep.memory.bindCreep) return ;

        const bindCreep = Game.getObjectById(creep.memory.bindCreep);
        if (!bindCreep) {
            delete creep.memory.bindCreep;
            return ;
        }

        // 如果不在目标房间，移动到目标房间
        if (creepDoubleMoveToRoom(creep, creep.memory.targetRoom)) return ;

        const powerBank = creep.room.powerBank?.[0] ?? creep.room.find<StructurePowerBank>(FIND_STRUCTURES, {filter: (s) => s.structureType === STRUCTURE_POWER_BANK})[0]
        // 如果没找到，自杀
        if (!powerBank) {
            if (Game.time % 5 === 0) {
                creep.suicide()
                bindCreep?.suicide();
                if (Game.rooms[creep.memory.home]?.memory.powerTarget?.[creep.memory.targetRoom]) {
                    delete Game.rooms[creep.memory.home].memory.powerTarget[creep.memory.targetRoom];
                }
            }
            return ;
        }

        // 找敌人
        if (Game.time % 5 === 0 || !creep.memory.cache.hostile) {
            const hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10, {
                filter: c => c.pos.inRangeTo(powerBank.pos, 10)
            }) || [];

            const attackHostiles = hostiles.filter(c => c.body.some(p => p.type === ATTACK || p.type === RANGED_ATTACK));
            const healHostiles = hostiles.filter(c => c.body.some(p => p.type === HEAL));
            const carryHostiles = hostiles.filter(c => c.body.some(p => p.type === CARRY));
            const target = creep.pos.findClosestByRange([...healHostiles,...attackHostiles]) ||
                        creep.pos.findClosestByRange(carryHostiles, {
                            filter: c => c.pos.inRangeTo(powerBank.pos, 5)
                        });
            
            if (target) creep.memory.cache.hostile = target.id;
        }

        // 攻击敌人
        if (creep.memory.cache.hostile) {
            const target = Game.getObjectById<Creep>(creep.memory.cache.hostile);
            if (target && target.pos.inRangeTo(powerBank.pos, 10)) {
                if (creep.pos.isNearTo(target)) creep.attack(target);
                return creepDoubleMoveTo(creep, target.pos, '#ff0000', false);
            } else {
                delete creep.memory.cache.hostile;
            }
        }

        // 攻击bank
        if (creep.pos.isNearTo(powerBank)) {
            if (creep.hits >= creep.hitsMax / 2) creep.attack(powerBank); 
        } else {
            creepDoubleMoveTo(creep, powerBank.pos);
        }
    }
}