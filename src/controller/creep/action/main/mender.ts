import { MISSION_TYPE } from "@/constant/mission";
import { deleteMission, getMission, getMissionByDist, lockMission, unlockMission } from "@/controller/room/mission/pool";
import { creepGoRepair } from "../../function/work";
import { creepMoveTo, creepMoveToHome } from "../../function/move";
import { creepChargeBoost, creepChargeEnergy, creepChargeUnboost } from "../../function/charge";
import { creepIsOnEdge } from "../../function/position";
import { creepCheckUnboostAvailable } from "../../function/check";

const creepMenderActions = {
    withdraw: (creep: Creep) => {
        if (creep.room.level < 8) {
            creepChargeEnergy(creep)
        } else {
            if (!creep.room.storage) return ;
            if (creep.pos.isNearTo(creep.room.storage)) {
                creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
            } else {
                creepMoveTo(creep, creep.room.storage);
            }
        }

        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'repair';
        }
    },
    repair: (creep: Creep) => {
        if (!creep.memory.cache.task) {
            const task = getMissionByDist(creep.room, MISSION_TYPE.REPAIR, creep.pos);

            if (!task) {
                if (creep.room.level < 8) {
                    creep.memory.action = 'upgrade';
                    creepMenderActions.upgrade(creep);
                }
                return ;
            }

            lockMission(creep.room, MISSION_TYPE.REPAIR, task.id, creep.id);
            const target = Game.getObjectById(task.data.target) as Structure;

            // 没有目标||目标已修复到阈值
            if (!target || target.hits >= task.data.hits) {
                deleteMission(creep.room, MISSION_TYPE.REPAIR, task.id);
                return ;
            }

            if (task.level > 10 && (creep.room.storage?.store[RESOURCE_ENERGY]||0) < 100000) {
                return deleteMission(creep.room, MISSION_TYPE.REPAIR, task.id);
            }

            creep.memory.cache.task = task;
        }

        if (!creep.memory.cache.task) return ;

        if (creep.ticksToLive < 50 && creepCheckUnboostAvailable(creep)) {
            return creepChargeUnboost(creep);
        }

        // 快死了，释放任务
        if (creep.ticksToLive < 10) {
            unlockMission(creep.room, MISSION_TYPE.REPAIR, creep.memory.cache.task.id);
        }

        const task = creep.memory.cache.task;
        const target = Game.getObjectById(task.data.target) as Structure;
        

        // 刷墙任务刷一会就算了，均衡一点
        if (task.level > 10 && Game.time % 50 === 1) {
            deleteMission(creep.room, MISSION_TYPE.REPAIR, task.id);
            creep.memory.cache = {};
            return true;
        }

        // 没有目标||目标已修复到阈值
        if (!target || target.hits >= task.data.hits) {
            deleteMission(creep.room, MISSION_TYPE.REPAIR, task.id);
            creep.memory.cache = {};
            return true;
        }

        creepGoRepair(creep, target);

        // 没能量了
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }

        return true;
    },
    upgrade: (creep: Creep) => {
        if (!creep.room.controller?.my) return ;

        const res = creep.upgradeController(creep.room.controller);
        if (res === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, creep.room.controller, { maxRooms: 1, range: 2 });
        }

        // 没能量了
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }
        
        // 成功升级一次就切回去看看有没有任务
        else if (res === OK) {
            creep.memory.action = 'repair';
        }
    }
}


export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}
        creep.memory.action = 'withdraw';
        return creepChargeBoost(creep, ['XLH2O', 'LH2O', 'LH']);;
    },
    action: (creep: Creep) => {
        if (creepIsOnEdge(creep)) {
            return creepMoveToHome(creep);
        }
        switch(creep.memory.action) {
            case 'withdraw':           creepMenderActions.withdraw(creep); break;
            case 'repair':             creepMenderActions.repair(creep); break;
            case 'upgrade':            creepMenderActions.upgrade(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {
    }
}