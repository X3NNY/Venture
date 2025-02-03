import { CREEP_ROLE } from "@/constant/creep";
import { creepMoveTo, creepMoveToHome, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

const creepDepositCarrierActions = {
    withdraw: (creep: Creep) => {
        // 剩余时间小于一轮跟随时间则优先放置货物
        if ((creep.memory.cache.longMoveEnd||0) > 0 && (creep.memory.cache.longMoveStart||0)>0) {
            let tick = creep.memory.cache.longMoveEnd - creep.memory.cache.longMoveStart;
            if (tick < 0) tick = 0;
            if (creep.ticksToLive < tick + 25 && creep.store.getUsedCapacity() > 0) {
                creep.memory.action = 'transfer';
                return ;
            }
        }
        // 快死了也先放置货物
        else if (creep.ticksToLive < 200 && creep.store.getUsedCapacity() > 0) {
            creep.memory.action = 'transfer';
                return ;
        }

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            return creepMoveToRoom(creep, creep.memory.targetRoom);
        }

        const target = Game.getObjectById(creep.memory.cache.targetId) as any;
        const tType = creep.memory.cache.tType;

        // 有无目标
        if (target) {
            if (tType === 'dropped' && target.amount > 0) {
                const result = creep.pickup(target);
                if (result === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, target, { range: 1, maxRooms: 1});
                }
            } else if (tType === 'tombstone' && target.store.getUsedCapacity() > 0) {
                const rType = Object.keys(target.store).find(t => t !== RESOURCE_ENERGY) as ResourceConstant;
                const result = creep.withdraw(target, rType);
                if (result === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, target, { range: 1, maxRooms: 1});
                }
            } else if (tType === 'harvester' && !creep.pos.isNearTo(target)) {
                creepMoveTo(creep, target, { range: 1, maxRooms: 1});
            }
            if (creep.store.getFreeCapacity() === 0) {
                creep.memory.action = 'transfer';
            }
            return ;
        }

        // 捡垃圾
        const droppedResources = creep.room.find(FIND_DROPPED_RESOURCES).filter(s => s.resourceType !== RESOURCE_ENERGY);
        if (droppedResources.length > 0) {
            const resource = creep.pos.findClosestByRange(droppedResources);
            creep.memory.cache.targetId = resource.id;
            creep.memory.cache.tType = 'dropped';
            const result = creep.pickup(resource);
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, resource, { range: 1, maxRooms: 1});
            }
            if (creep.store.getFreeCapacity() === 0) {
                creep.memory.action = 'transfer';
            }
            return ;
        }

        // 收破烂
        const tombstones = creep.room.find(FIND_TOMBSTONES, {
            filter: s => s.store.getUsedCapacity() > 0 && Object.keys(s.store).some(t => t !== RESOURCE_ENERGY)
        });
        if (tombstones.length > 0) {
            const tombstone = creep.pos.findClosestByRange(tombstones);
            creep.memory.cache.targetId = tombstone.id;
            creep.memory.cache.tType = 'tombstone';
            const result = creep.withdraw(tombstone, Object.keys(tombstone.store).find(type => type !== RESOURCE_ENERGY) as ResourceConstant);
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, tombstone, { range: 1, maxRooms: 1});
            }
            if (creep.store.getFreeCapacity() === 0) {
                creep.memory.action = 'transfer';
            }
            return ;
        }

        // 记录开始跟随时间
        if (!creep.memory.cache.longMoveStart) creep.memory.cache.longMoveStart = Game.time;

        // 跟随采集爬爬
        let harvester;
        const harvesters = creep.room.find(FIND_MY_CREEPS, {
            filter: creep => creep.memory.role === CREEP_ROLE.DEPOSIT_HARVESTER && creep.room.name === creep.memory.targetRoom && creep.store.getUsedCapacity() > 0
        });
        if (harvesters.length > 0) {
            harvester = creep.pos.findClosestByRange(harvesters, {
                filter: c => c.store.getFreeCapacity() === 0
            });
            if (!harvester) harvester = creep.pos.findClosestByRange(harvesters);
        }
        if (harvester && !creep.pos.isNearTo(harvester)) {
            creep.memory.cache.targetId = harvester.id;
            creep.memory.cache.tType = 'harvester';
            creepMoveTo(harvester, harvester, { ignoreCreeps: false });
            if (creep.store.getFreeCapacity() === 0) {
                creep.memory.action = 'transfer';
            }
            return ;
        }

        // 记录结束跟随时间
        // 跟随逻辑：首次跟随采集爬爬记录时间，待到采集爬爬死亡之后，找不到新的采集爬爬时记录结束时间
        if (!creep.memory.cache.longMoveEnd) creep.memory.cache.longMoveEnd = Game.time;

        // 矿旁边等着
        const deposits = creep.room.deposit || creep.room.find(FIND_DEPOSITS);
        if (deposits.length > 0) {
            const deposit = deposits.length === 1 ? deposits[0] : deposits.reduce((a, b) => a.lastCooldown < b.lastCooldown ? a : b);
            if (deposit && !creep.pos.inRangeTo(deposit, 3)) {
                creepMoveTo(creep, deposit, { ignoreCreeps: false, range: 3 });
            }
        }

        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'transfer';
        }
        return ;
    },
    transfer: (creep: Creep) => {
        if (creep.room.name !== creep.memory.home || creepIsOnEdge(creep)) {
            creepMoveToHome(creep);
            return ;
        }

        const target = [creep.room.storage, creep.room.terminal].find(s => s && s.store.getFreeCapacity() > 1000);

        if (creep.room.my && target) {
            if (creep.pos.inRangeTo(target, 1)) {
                creep.transfer(target, Object.keys(creep.store)[0] as ResourceConstant);
                if ((creep.memory.cache.longMoveEnd||0) > 0 && (creep.memory.cache.longMoveStart||0) > 0 &&
                    (creep.memory.cache.longMoveEnd - creep.memory.cache.longMoveStart) + 25 > creep.ticksToLive) {
                    creep.suicide();
                }
            } else {
                creepMoveTo(creep, target);
            }
        } else {
            creepMoveTo(creep, new RoomPosition(25, 25, creep.memory.home));
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
        switch(creep.memory.action) {
            case 'withdraw':
                creepDepositCarrierActions.withdraw(creep); break;
            case 'transfer':
                creepDepositCarrierActions.transfer(creep); break;
        }
    },
}