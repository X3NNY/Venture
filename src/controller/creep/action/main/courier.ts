import { MISSION_TYPE } from "@/constant/mission";
import { deleteMission, doneMission, getMission, getMissionByDist, lockMission, unlockMission } from "@/controller/room/mission/pool";
import { creepMoveTo } from "../../function/move";
import { creepGoTransfer } from "../../function/work";

const getTransportMission = (creep: Creep) => {
    const task = getMissionByDist(creep.room, MISSION_TYPE.TRANSPORT, creep.pos, true);
    if (!task) return {};

    const source = Game.getObjectById(task.data.source as Id<AnyStoreStructure>);
    const target = Game.getObjectById(task.data.target as Id<AnyStoreStructure>);

    if (!source || !target || !task.data.rType || !task.data.amount ||
        source.store?.getUsedCapacity(task.data.rType) < task.data.amount ||
        target.store?.getFreeCapacity(task.data.rType) === 0
    ) {
        deleteMission(creep.room, MISSION_TYPE.TRANSPORT, task.id);
    } else {
        // lockMission(creep.room, MISSION_TYPE.TRANSPORT, task.id, creep.id);
        return Object.assign({missionId: task.id}, task.data);
    }
    return {};
}

const creepCourierActions = {
    transport: (creep: Creep) => {
        // 寻找任务
        if (!creep.memory.cache.target && creep.ticksToLive > 30) {
            creep.memory.cache = getTransportMission(creep);
        }

        // 没有任务，检查是否有资源且快死了
        if (!creep.memory.cache.target) {
            if (creep.ticksToLive > 30) return ;
            if (creep.store.getUsedCapacity() === 0) return ;
            const storage = creep.room.storage;
            if (!storage) return ;
            if (creep.transfer(storage, Object.keys(creep.store)[0] as ResourceConstant) === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, storage, { maxRooms: 1, range: 1 });
            }
            return ;
        }

        // if (creep.ticksToLive < 30 && creep.memory.cache.missionId) {
        //     unlockMission(creep.room, MISSION_TYPE.TRANSPORT, creep.memory.cache.missionId)
        // }

        const source = Game.getObjectById(creep.memory.cache.source as Id<AnyStoreStructure>);
        const target = Game.getObjectById(creep.memory.cache.target as Id<AnyStoreStructure>);
        const rType = creep.memory.cache.rType as ResourceConstant;
        const amount = creep.memory.cache.amount;
        
        // 目标不存在或者存满了
        if (!target || target?.store.getFreeCapacity(rType) === 0) {
            deleteMission(creep.room, MISSION_TYPE.TRANSPORT, creep.memory.cache.missionId);
            creep.memory.cache = {};
            return ;
        }

        // 能源不够
        if ((source?.store[rType]||0) + creep.store[rType] < amount) {
            deleteMission(creep.room, MISSION_TYPE.TRANSPORT, creep.memory.cache.missionId);
            creep.memory.cache = {};
            return ;
        }

        // 身上有其他资源先放入仓库
        if (creep.store.getUsedCapacity() > 0 && Object.keys(creep.store).some(r => r !== rType) && creep.room.storage) {
            for (const resource in creep.store) {
                if (resource !== rType) creepGoTransfer(creep, creep.room.storage, resource as ResourceConstant);
                return ;
            }
        }

        // 资源不够，先去取
        if (creep.store.getFreeCapacity(rType) > 0 && creep.store[rType] < amount) {
            const withdrawAmount = rType === RESOURCE_ENERGY ? null : Math.min(amount-creep.store[rType], creep.store.getFreeCapacity(rType));
            const result = creep.withdraw(source, rType, withdrawAmount);
            if (result === OK && !creep.pos.isNearTo(target)) {
                creepMoveTo(creep, target, { maxRooms: 1, range: 1 });
            } else if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, source, { maxRooms: 1, range: 1 });
            } else {
                deleteMission(creep.room, MISSION_TYPE.TRANSPORT, creep.memory.cache.missionId);
                creep.memory.cache = {};
                return ;
            }
            return ;
        }
        
        const result = creep.transfer(target, rType, Math.min(amount, creep.store[rType], target.store.getFreeCapacity(rType)));
        if (result === OK) {
            doneMission(creep.room, MISSION_TYPE.TRANSPORT, creep.memory.cache.missionId, Math.min(amount, creep.store[rType]));

            // 偷步
            creep.memory.cache = getTransportMission(creep);
            if (!creep.memory.cache.target) return ;
            const source = Game.getObjectById(creep.memory.cache.source as Id<AnyStoreStructure>);
            const target = Game.getObjectById(creep.memory.cache.target as Id<AnyStoreStructure>);
            const nxtRType = creep.memory.cache.rType;

            if (nxtRType !== rType || creep.store[nxtRType]-amount < creep.memory.cache.amount) {
                creepMoveTo(creep, source, { maxRooms: 1, range: 1 });
            } else {
                creepMoveTo(creep, target, { maxRooms: 1, range: 1 });
            }
        } else if (result === ERR_FULL || result === ERR_INVALID_TARGET) {
            deleteMission(creep.room, MISSION_TYPE.TRANSPORT, creep.memory.cache.missionId);
            creep.memory.cache = {};
        } else if (result === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, target, { maxRooms: 1, range: 1 });
        }
    },
    withdraw: (creep: Creep) => {
        
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}
        creep.memory.action = 'transport';
        return true;
    },
    action: (creep: Creep) => {
        switch (creep.memory.action) {
            case 'transport':             creepCourierActions.transport(creep); break;
            case 'withdraw':              creepCourierActions.withdraw(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {

    }
}