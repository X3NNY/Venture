import { addMission, countMission } from "@/controller/room/mission/pool";
import { creepMoveTo } from "../../function/move";
import { MISSION_TYPE, TRANSPORT_MISSION } from "@/constant/mission";

const creepMinerActions = {
    move: (creep: Creep) => {
        if (!creep.room.extractor) return ;
        const mContainer = creep.room.container.find(c => c.pos.inRangeTo(creep.room.mineral, 1)) || null;

        if (mContainer && !creep.pos.isEqualTo(mContainer)) {
            creepMoveTo(creep, mContainer, { maxRooms: 1 });
        } else {
            if (creep.room.mineral.mineralAmount > 0) {
                if (creep.pos.isNearTo(creep.room.mineral)) {
                    creep.memory.action = 'harvest';
                } else {
                    creepMoveTo(creep, creep.room.mineral, { maxRooms: 1, range: 1 });
                }
            } else {
                creep.suicide();
                return ;
            }
        }
    },
    harvest: (creep: Creep) => {
        const result = creep.harvest(creep.room.mineral);

        if (result === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, creep.room.mineral, { maxRooms: 1, range: 1 });
            return ;
        }

        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'transfer';
            return ;
        }
    },
    transfer: (creep: Creep) => {
        if (!creep.memory.cache.targetId) {
            const mContainer = creep.room.container.find(c => c.pos.inRangeTo(creep.room.mineral, 1)) || null;
            
            // 如果没有采矿容器且没有工地
            if (!mContainer &&
                creep.pos.inRangeTo(creep.room.mineral, 1) &&
                creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {filter: c => c.structureType === STRUCTURE_CONTAINER}).length === 0
            ) {
                creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                return ;
            }
            
            // 检查容器是否有空间

            if (mContainer) {
                creep.memory.cache.targetId = mContainer.id;
            } else {
                return ;
            }
        }

        const target = Game.getObjectById(creep.memory.cache.targetId) as StructureContainer;

        if (!target) {
            return ;
        }

        if (creep.room.level >= 8 && target.store.getUsedCapacity() >= 1000 && countMission(creep.room, MISSION_TYPE.TRANSPORT, m => m.data.source === target.id) === 0) {
            const rType = Object.keys(target.store)[0] as ResourceConstant
            addMission(creep.room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.mineral, {
                source: target.id,
                target: creep.room.storage?.id || creep.room.terminal?.id, 
                pos: target.pos,
                rType: rType,
                amount: target.store[rType]
            })
        }

        const result = creep.transfer(target, Object.keys(creep.store)[0] as ResourceConstant);

        if (result === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, target, { maxRooms: 1, range: 1 });
            return ;
        }

        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'harvest';
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}

        creep.memory.action = 'move';
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'move':
                creepMinerActions.move(creep); break;
            case 'harvest':
                creepMinerActions.harvest(creep); break;
            case 'transfer':
                creepMinerActions.transfer(creep); break;

        }
    }
}