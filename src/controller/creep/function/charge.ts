import { roomStructureLab } from "@/controller/room/structure/lab";
import { creepMoveTo } from "./move";
import { creepFindClosestTarget } from "./position";

/**
 * 爬爬充能
 * @param creep 
 * @param pickup 
 */
export const creepChargeEnergy = (creep: Creep, pickup: boolean = true, minAmount: number = 50) => {
    if (!creep.memory.cache) creep.memory.cache = {};
    if (!creep.memory.cache.chargeTarget) {
        let target;
        
        // 收破烂
        if (!target) {
            const ruins = creep.room.find(FIND_RUINS, {
                filter: r => r?.store[RESOURCE_ENERGY] > minAmount
            });
            target = creepFindClosestTarget(creep, ruins);
        }
        
        // 捡垃圾
        if (pickup) {
            const resources = creep.room.find(FIND_DROPPED_RESOURCES, {filter: r => r.resourceType === RESOURCE_ENERGY && r.amount >= minAmount});
            target = creepFindClosestTarget(creep, resources);

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
            target = creepFindClosestTarget(creep, structs);
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

export const creepChargeUnboost = (creep: Creep) => {
    if (!creep.body.some(part => part.boost)) return ERR_NO_BODYPART;
    if (!creep.room.memory.unBoostPos) return ERR_NOT_FOUND;

    const unBoostPos = new RoomPosition(creep.room.memory.unBoostPos.x, creep.room.memory.unBoostPos.y, creep.room.name);

    if (creep.pos.isEqualTo(unBoostPos)) {
        const lab = creep.room.lab.find(l => {
            if (!l) return false;
            if (!l.pos.isNearTo(creep.pos)) return false;
            if (l.cooldown > 0) return false;
            return true;
        })
        if (!lab) return ERR_NOT_FOUND;
        return lab.unboostCreep(creep);
    } else {
        creepMoveTo(creep, unBoostPos, { maxRooms: 1, range: 0 });
        return ERR_NOT_IN_RANGE;
    }
}

export const creepChargeBoost = (creep: Creep, boosts: string[], must: boolean = false) => {
    // 所有部件已强化
    if (creep.body.every(part => !boosts.some(bType => BOOSTS[part.type] && bType in BOOSTS[part.type]) || part.boost)) {
        return true;
    }

    // 寻找可用lab
    const labs = creep.room.lab?.filter(lab => lab.mineralType &&
        lab.id !== Memory.RoomInfo[creep.room.name]?.lab?.labA &&
        lab.id !== Memory.RoomInfo[creep.room.name]?.lab?.labB &&
        boosts.includes(lab.mineralType) &&
        lab.store[lab.mineralType] >= 30 &&
        creep.body.some(part => !part.boost && BOOSTS[part.type] && lab.mineralType in BOOSTS[part.type])
    )||[];

    if (labs.length === 0) {
        return !must;
    }

    const priorityLabs = labs.sort((a, b) => {
        for (const type of boosts) {
            if (a.mineralType === type && b.mineralType !== type) return -1;
            if (a.mineralType !== type && b.mineralType === type) return 1;
        }
        return 0;
    });

    const lab = creep.pos.findClosestByRange(priorityLabs);
    if (!lab) return !must;

    if (!creep.pos.isNearTo(lab)) {
        creep.moveTo(lab);
        return false;
    }

    const result = lab.boostCreep(creep);
    if (result === OK) {
        const boostedParts = creep.body.filter(part => BOOSTS[part.type] && lab.mineralType in BOOSTS[part.type]);
        const amount = Math.min(boostedParts.length * 30, lab.store[lab.mineralType] - lab.store[lab.mineralType] % 30);
        roomStructureLab.submitBoost(creep.room, lab.mineralType as MineralBoostConstant, amount);
        return false;
    }
    creep.memory.boostCount = (creep.memory.boostCount||0)+1;
    if (creep.memory.boostCount >= 5 || !must) {
        delete creep.memory.boostCount;
        return true;
    }
    return false;
}