import { CREEP_ROLE } from "@/constant/creep";
import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

const creepDepositHarvesterActions = {
    harvest: (creep: Creep) => {
        if (!creep.memory.targetSourceId) {
            // 按冷却排序，找最小冷却的矿
            let deposits = creep.room.find(FIND_DEPOSITS);
            const activeDeposit = deposits.filter(d => d.lastCooldown <= 120);

            if (activeDeposit.length > 0) {
                deposits = activeDeposit;
            }

            if (deposits.length === 0) return ;

            const deposit = deposits.reduce((prev, curr) => prev.cooldown < curr.cooldown ? prev : curr);
            creep.memory.targetSourceId = deposit.id as any;
        }

        const deposit = Game.getObjectById(creep.memory.targetSourceId as any) as Deposit;

        if (!deposit) {
            creep.memory.targetSourceId = null;
            return ;
        }

        // 采集沉积物
        if (creep.pos.inRangeTo(deposit, 1)) {
            creep.memory.dontPullMe = true;
            if (deposit.cooldown === 0) {
                return creep.harvest(deposit);
            }
        } else {
            creepMoveTo(creep, deposit, { ignoreCreeps: false, range: 1, maxRooms: 1 });
        }

        if (deposit.cooldown > 0 && creep.store.getUsedCapacity() > 0) {
            const carrier = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
                filter: c => c.memory.role === CREEP_ROLE.DEPOSIT_CARRIER && c.store.getFreeCapacity() > 0
            })[0];
            if (carrier) {
                creep.transfer(carrier, Object.keys(creep.store)[0] as ResourceConstant);
                return ;
            }
        }

        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'transfer';
        }
    },
    transfer: (creep: Creep) => {
        const carrier = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: c => c.memory.role === CREEP_ROLE.DEPOSIT_CARRIER && c.store.getFreeCapacity() > 0
        })[0];
        if (carrier) {
            creep.transfer(carrier, Object.keys(creep.store)[0] as ResourceConstant);
        }

        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'transfer'
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }
        creep.memory.action = 'harvest';
        return true;
    },
    action: (creep: Creep) => {
        switch (creep.memory.action) {
            case 'harvest':
                creepDepositHarvesterActions.harvest(creep); break;
            case 'transfer':
                creepDepositHarvesterActions.transfer(creep); break;
        }
    },
}