import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";
import { creepGoTransfer } from "../../function/work";

const creepAidCarrierActions = {
    withdraw: (creep: Creep) => {
        if (creep.room.name !== creep.memory.sourceRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.sourceRoom);
            return ;
        }
        const rType = creep.memory.rType;
        if (!creep.memory.cache.targetId) {
            // 防止找不到能量仓库也一直找
            // 每k tick检测一次
            if (Game.time % (creep.memory.cache.standby+1)) return;
            let targets;
            // 无主房间且是能量
            if (rType === RESOURCE_ENERGY && creep.room.controller && !creep.room.controller.owner) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: s => (s.structureType === STRUCTURE_CONTAINER ||
                                s.structureType === STRUCTURE_EXTENSION ||
                                s.structureType === STRUCTURE_STORAGE ||
                                s.structureType === STRUCTURE_TOWER ||
                                s.structureType === STRUCTURE_SPAWN ||
                                s.structureType === STRUCTURE_TERMINAL) &&
                                s.store[rType] > 0 &&
                                (creep.room.my || s.pos.lookFor(LOOK_STRUCTURES).every(ls => ls.structureType !== STRUCTURE_RAMPART))
                });
            } else {
                targets = [creep.room.storage, creep.room.terminal].filter(s =>  s && s.store[rType] > 0 && (creep.room.my || s.pos.lookFor(LOOK_STRUCTURES).every(ls => ls.structureType !== STRUCTURE_RAMPART)));
            }
            const target = creep.pos.findClosestByRange(targets) as Structure;
            if (target) {
                creep.memory.cache.targetId = target.id;
                creep.memory.cache.standby = 0;
            } else {
                creep.memory.cache.standby += 1;
            }
        }

        const target = Game.getObjectById(creep.memory.cache.targetId) as AnyStoreStructure;

        if (!target || target.store[rType] === 0) {
            delete creep.memory.cache.targetId;
            creep.memory.cache.standby = 0;
            return ;
        }

        const result = creep.withdraw(target, rType);
        if (result === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, target, { maxRooms: 1, range: 1 });
        }

        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'transfer';
        }
    },
    transfer: (creep: Creep) => {
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return ;
        }

        const rType = creep.memory.rType || Object.keys(creep.store)[0] as ResourceConstant;

        let targets: any[] = [creep.room.storage, creep.room.terminal].filter(s => s && s.store.getFreeCapacity(rType) > 0);
        let target = creep.pos.findClosestByRange(targets);

        if (!target) {
            targets = [...creep.room.container].filter(c => c && c.store.getFreeCapacity(rType) > 0);
            target = creep.pos.findClosestByRange(targets);
        }

        if (target) {
            creepGoTransfer(creep, target, rType);
        }

        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = { standby: 0 };

        creep.memory.action = 'withdraw';
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'withdraw':
                creepAidCarrierActions.withdraw(creep); break;
            case 'transfer':
                creepAidCarrierActions.transfer(creep); break;
        }
    }

}