import { deleteMission, getMission } from "@/controller/room/mission/pool";
import { creepMoveTo } from "../../function/move";
import { MISSION_TYPE } from "@/constant/mission";

const transferOtherResources = (creep: Creep, rType: ResourceConstant) => {
    if (creep.store.getUsedCapacity() === 0) return false;

    for (const resource in creep.store) {
        if (resource === rType) continue;

        if (creep.room.storage && creep.room.storage.store.getFreeCapacity() > 0) {
            creep.transfer(creep.room.storage, resource as ResourceConstant);
            return true;
        }
        if (creep.room.storage && creep.room.terminal.store.getFreeCapacity() > 0) {
            creep.transfer(creep.room.terminal, resource as ResourceConstant);
            return true;
        }
    }
    return false;
}

const creepManagerActions = {
    /**
     * 检测是否有目标链接需要能量，需要则转移能量到中央链接，否则则取走中央链接的能量。
     * @param creep 
     * @returns 
     */
    transfer: (creep: Creep) => {
        if (!creep.memory.cache.mLink) {
            const center = Memory.RoomInfo[creep.room.name]?.center;
            creep.memory.cache.nLink = [];
            for (const link of creep.room.link) {
                if (creep.room.source.some(s => link.pos.inRangeTo(s, 2))) continue;

                if (link.pos.inRangeTo(creep.room.controller, 2)) {
                    creep.memory.cache.cLink = link.id;
                    continue;
                }

                if (center && link.pos.inRangeTo(center.x, center.y, 1) && link.pos.inRangeTo(creep.room.storage, 2)) {
                    creep.memory.cache.mLink = link.id;
                    continue;
                }
                creep.memory.cache.nLink.push(link.id);
            }
        }

        const cLink = Game.getObjectById(creep.memory.cache.cLink) as StructureLink;
        const mLink = Game.getObjectById(creep.memory.cache.mLink) as StructureLink;

        if (!mLink) {
            creep.memory.cache.mLink = null;
            return;
        }

        // 如果控制器链接需要能量
        if (cLink && cLink.store[RESOURCE_ENERGY] < 400) {
            if (mLink.store.getFreeCapacity(RESOURCE_ENERGY) < 100) {
                return ;
            }

            if (mLink.store.getFreeCapacity(RESOURCE_ENERGY) > 100 && creep.store[RESOURCE_ENERGY] > 100) {
                creep.transfer(mLink, RESOURCE_ENERGY);
                return true;
            }

            // 身上有其他资源先放入仓库/终端
            if (transferOtherResources(creep, RESOURCE_ENERGY)) return true;

            if (creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                return true;
            }
        }
        // 其他链接缺少能量
        else if (creep.memory.cache.nLink.some((linkId: Id<StructureLink>) => (Game.getObjectById(linkId)?.store[RESOURCE_ENERGY]||0) < 400)) {
            if (mLink.store.getFreeCapacity(RESOURCE_ENERGY) < 100) {
                return ;
            }

            if (mLink.store.getFreeCapacity(RESOURCE_ENERGY) > 100 && creep.store[RESOURCE_ENERGY] > 100) {
                creep.transfer(mLink, RESOURCE_ENERGY);
                return true;
            }

            // 身上有其他资源先放入仓库/终端
            if (transferOtherResources(creep, RESOURCE_ENERGY)) return true;

            if (creep.room.storage.store[RESOURCE_ENERGY] > 0) {
                creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
                return true;
            }
        } else if (mLink.store[RESOURCE_ENERGY] > 0) {
            // 身上有其他资源先放入仓库/终端
            if (transferOtherResources(creep, RESOURCE_ENERGY)) return true;
            if (creep.store.getFreeCapacity() > 0) {
                creep.withdraw(mLink, RESOURCE_ENERGY);
            }
            return true;
        }
        return false;
    },
    manage: (creep: Creep) => {
        if (!creep.memory.cache.task) {
            const task = getMission(creep.room, MISSION_TYPE.MANAGE);
            if (!task) return ;
            const source = Game.getObjectById(task.data.source) as AnyStoreStructure;
            const target = Game.getObjectById(task.data.target) as AnyStoreStructure;

            if (!source || !target) {
                deleteMission(creep.room, MISSION_TYPE.MANAGE, task.id);
                return ;
            }

            if (!source.pos.inRangeTo(target.pos, 2)) {
                deleteMission(creep.room, MISSION_TYPE.MANAGE, task.id);
                return ;
            }

            // 能源不够
            if ((source?.store[task.data.rType]||0) + creep.store[task.data.rType] < task.data.amount) {
                deleteMission(creep.room, MISSION_TYPE.MANAGE, task.id);
                return ;
            }

            creep.memory.cache.task = Object.assign({ missionId: task.id }, task.data);
        }

        if (!creep.memory.cache.task.missionId) return ;

        const source = Game.getObjectById(creep.memory.cache.task.source) as AnyStoreStructure;
        const target = Game.getObjectById(creep.memory.cache.task.target) as AnyStoreStructure;
        const rType = creep.memory.cache.task.rType;
        const amount = creep.memory.cache.task.amount;

        // 能源不够
        if ((source?.store[rType]||0) + creep.store[rType] < amount) {
            deleteMission(creep.room, MISSION_TYPE.MANAGE, creep.memory.cache.task.missionId);
            creep.memory.cache.task = null;
            return ;
        }

        // 身上有其他资源先放入仓库/终端
        if (transferOtherResources(creep, rType)) return true;

        // 没资源先取资源
        if (creep.store.getUsedCapacity(rType) === 0) {
            const num = Math.min(amount, creep.store.getFreeCapacity(rType), source.store[rType]);
            creep.withdraw(source, rType, num);
        }
        
        // 转移资源
        else {
            const res = creep.transfer(target, rType);

            if (res === ERR_FULL) {
                deleteMission(creep.room, MISSION_TYPE.MANAGE, creep.memory.cache.task.missionId);
                creep.memory.cache.task = null;
                return ;
            } else if (res === OK) {
                // 查看是否已经转了足够的资源，没转够下轮继续转
                creep.memory.cache.task.amount -= Math.min(creep.store[rType], amount);
                if (creep.memory.cache.task.amount <= 0) {
                    deleteMission(creep.room, MISSION_TYPE.MANAGE, creep.memory.cache.task.missionId);
                    creep.memory.cache.task = null;
                }
            }
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        creep.memory.dontPullMe = true;

        const center = Memory.RoomInfo[creep.room.name]?.center;
        if (center) {
            const pos = new RoomPosition(center.x, center.y, creep.room.name);
            if (!creep.pos.isEqualTo(pos)) {
                creepMoveTo(creep, pos, { ignoreCreeps: false });
                return false;
            }
        } else {
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        if (creepManagerActions.transfer(creep)) return ;
        creepManagerActions.manage(creep);
    },
    done: (creep: Creep, res: any) => {

    }
}