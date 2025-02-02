import { MISSION_TYPE } from "@/constant/mission";
import { deleteMission, getMission, getMissionByDist, lockMission, unlockMission } from "@/controller/room/mission/pool";
import { creepGoRepair } from "../../function/work";
import { creepMoveTo } from "../../function/move";
import { creepChargeEnergy } from "../../function/charge";

const creepMenderActions = {
    withdraw: (creep: Creep) => {
        creepChargeEnergy(creep)

        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'repair';
        }
    },
    repair: (creep: Creep) => {
        if (!creep.memory.cache.task) {
            const task = getMissionByDist(creep.room, MISSION_TYPE.REPAIR, creep.pos);

            if (!task) {
                creep.memory.action = 'upgrade';
                creepMenderActions.upgrade(creep);
                return ;
            }

            lockMission(creep.room, MISSION_TYPE.REPAIR, task.id, creep.id);
            const target = Game.getObjectById(task.data.target) as Structure;

            // 没有目标||目标已修复到阈值
            if (!target || target.hits >= task.data.hits) {
                deleteMission(creep.room, MISSION_TYPE.REPAIR, task.id);
                return ;
            }

            if (task.level > 10 && (creep.room.storage?.store[RESOURCE_ENERGY]||0) < 50000) {
                return deleteMission(creep.room, MISSION_TYPE.REPAIR, task.id);
            }

            creep.memory.cache.task = task;
        }

        if (!creep.memory.cache.task) return ;

        // 快死了，释放任务
        if (creep.ticksToLive < 20) {
            unlockMission(creep.room, MISSION_TYPE.REPAIR, creep.memory.cache.task.id);
        }

        const task = creep.memory.cache.task;
        const target = Game.getObjectById(task.data.target) as Structure;
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
            creepMoveTo(creep, creep.room.controller);
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
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'withdraw':           creepMenderActions.withdraw(creep); break;
            case 'repair':             creepMenderActions.repair(creep); break;
            case 'upgrade':            creepMenderActions.upgrade(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {
    }
}