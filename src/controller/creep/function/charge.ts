import { creepMoveTo } from "./move";

/**
 * 爬爬充能
 * @param creep 
 * @param pickup 
 */
export const creepChargeEnergy = (creep: Creep, pickup: boolean = true) => {
    if (!creep.memory.cache) creep.memory.cache = {};
    if (!creep.memory.cache.chargeTarget) {
        let target;

        // 捡垃圾
        if (pickup) {
            const resources = creep.room.find(FIND_DROPPED_RESOURCES, {filter: r => r.resourceType === RESOURCE_ENERGY && r.amount >= 50});
            target = creep.pos.findClosestByRange(resources);

            if (target) {
                creep.memory.cache.chargeTarget = {
                    id: target.id,
                    type: 'dropped'
                }
            }
        }

        // 找最近的能量建筑
        if (!target) {
            const structs = []
            if (creep.room.storage?.store[RESOURCE_ENERGY] >= 5000) structs.push(creep.room.storage);
            if (creep.room.terminal?.store[RESOURCE_ENERGY] >= 5000) structs.push(creep.room.terminal);
            creep.room.link.forEach(l => {
                if (l?.store[RESOURCE_ENERGY] >= 400) {
                    structs.push(l);
                }
            })
            creep.room.container.forEach(c => {
                if (c?.store[RESOURCE_ENERGY] >= 500) {
                    structs.push(c);
                }
            })
            target = creep.pos.findClosestByRange(structs);
        }

        // 收破烂
        if (!target) {
            const ruins = creep.room.find(FIND_RUINS, {
                filter: r => r?.store[RESOURCE_ENERGY] > 0
            });
            target = creep.pos.findClosestByRange(ruins);
        }

        if (!creep.memory.cache.chargeTarget && target) {
            creep.memory.cache.chargeTarget = {
                id: target.id,
                type: 'structure'
            }
        }
    }

    if (!creep.memory.cache.chargeTarget) return ;

    const target = Game.getObjectById(creep.memory.cache.chargeTarget.id) as any;

    if (!target) {
        creep.memory.cache.chargeTarget = null;
        return false;
    }
    const type = creep.memory.cache.chargeTarget.type;
    let res;

    if (type === 'dropped') {
        if (target.amount <= 0) {
            creep.memory.cache.chargeTarget = null;
            return false;
        }
        res = creep.pickup(target);
    } else if (type === 'structure') {
        if (target.store?.[RESOURCE_ENERGY] <= 0) {
            creep.memory.cache.chargeTarget = null;
            return false;
        }
        res = creep.withdraw(target, RESOURCE_ENERGY);
    }
    if (res === ERR_NOT_IN_RANGE) {
        creepMoveTo(creep, target, { maxRooms: 1, range: 1 })
    }
    return true;
}