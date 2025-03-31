import { filter } from 'lodash';
import { creepMoveToHome, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";
import { CREEP_ROLE } from '@/constant/creep';

const creepPowerCarrierActions = {
    withdraw: (creep: Creep) => {
        let tombstone = creep.room.find(FIND_TOMBSTONES, { filter: r => r.store.getUsedCapacity(RESOURCE_POWER) > 0 })[0];

        if (tombstone) {
            if (creep.withdraw(tombstone, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                creep.moveTo(tombstone);
            }
            return ;
        }
        if (creep.store.getFreeCapacity(RESOURCE_POWER) === 0) {
            creep.memory.action = 'transfer';
            return ;
        }

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom, { ignoreCreeps: false });
            return ;
        }
        const powerbank = creep.room.powerBank?.[0] || creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_POWER_BANK })[0];

        if (powerbank) {
            creep.memory.cache.powerbank = powerbank.id;
            if (!creep.pos.inRangeTo(powerbank, 4)) {
                creep.moveTo(powerbank, { range: 4, ignoreCreeps: false });
            }
        }

        let powerDropped = Game.getObjectById<Resource>(creep.memory.cache.powerDropped);

        if (powerDropped) {
            if (creep.pickup(powerDropped) == ERR_NOT_IN_RANGE) {
                creep.moveTo(powerDropped);
            }
            if (creep.store.getFreeCapacity(RESOURCE_POWER) === 0) {
                creep.memory.action = 'transfer';
                return ;
            }
        }

        let powerRuin = Game.getObjectById<Ruin>(creep.memory.cache.powerRuin);

        if (powerRuin) {
            if (creep.withdraw(powerRuin, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                creep.moveTo(powerRuin);
            }
            if (creep.store.getFreeCapacity(RESOURCE_POWER) === 0) {
                creep.memory.action = 'transfer';
                return ; 
            }
        }

        powerDropped = creep.room.find(FIND_DROPPED_RESOURCES, { filter: r => r.resourceType === RESOURCE_POWER })[0];

        if (powerDropped) {
            creep.memory.cache.powerDropped = powerDropped.id;
            if (creep.pickup(powerDropped) == ERR_NOT_IN_RANGE) {
                creep.moveTo(powerDropped);
            }
            if (creep.store.getFreeCapacity(RESOURCE_POWER) === 0) {
                creep.memory.action = 'transfer';
                return ;
            }
        }

        powerRuin = creep.room.find(FIND_RUINS, { filter: r => r.store.getUsedCapacity(RESOURCE_POWER) > 0 })[0];

        if (powerRuin) {
            creep.memory.cache.powerRuin = powerRuin.id;
            if (creep.withdraw(powerRuin, RESOURCE_POWER) == ERR_NOT_IN_RANGE) {
                creep.moveTo(powerRuin);
            }
            if (creep.store.getFreeCapacity(RESOURCE_POWER) === 0) {
                creep.memory.action = 'transfer';
                return ; 
            }
        }

        if (!powerbank && !powerDropped && !powerRuin) {
            _.filter(Game.creeps, (c: Creep) => c.memory.role === CREEP_ROLE.POWER_CARRIER && c.memory.targetRoom === creep.room.name)
            .forEach((c: Creep) => {c.memory.suicide = true});

            if (creep.store.getUsedCapacity(RESOURCE_POWER) === 0) {
                return creep.suicide();
            } else {
                creep.memory.action = 'transfer';
                return ; 
            }
        }

        if (creep.store.getFreeCapacity(RESOURCE_POWER) === 0) {
            creep.memory.action = 'transfer';
        }
    },
    transfer: (creep: Creep) => {
        if (creep.room.name !== creep.memory.home || creepIsOnEdge(creep)) {
            return creepMoveToHome(creep);
        }

        if (creep.room.storage) {
            if (creep.pos.isNearTo(creep.room.storage)) {
                creep.transfer(creep.room.storage, Object.keys(creep.store)[0] as ResourceConstant);
                if (creep.memory.suicide) {
                    creep.suicide();
                }
            } else {
                creep.moveTo(creep.room.storage);
            }
        }

        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        creep.memory.action = 'withdraw';
        return true;
    },
    action: (creep: Creep) => {
        switch (creep.memory.action) {
            case 'withdraw':
                creepPowerCarrierActions.withdraw(creep);
                break;
            case 'transfer':
                creepPowerCarrierActions.transfer(creep);
                break;
        }
    }
}