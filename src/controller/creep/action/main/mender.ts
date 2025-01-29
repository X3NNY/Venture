import { MISSION_TYPE } from "@/constant/mission";
import { deleteMission, getMission } from "@/controller/room/mission/pool";
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
            const task = getMission(creep.room, MISSION_TYPE.REPAIR);

            if (!task) {
                creep.memory.action = 'upgrade';
                creepMenderActions.upgrade(creep);
                return ;
            }

            const target = Game.getObjectById(task.data.target) as Structure;

            // 修盾单独判断
            if (target?.structureType === STRUCTURE_RAMPART) {
                creep.memory.cache.rampart = true;
                creep.memory.cache.pos = {x: target.pos.x, y: target.pos.y};
            }

            // 没有目标||目标已修复到阈值
            if (!target || target.hits >= task.data.hits) {
                deleteMission(creep.room, MISSION_TYPE.REPAIR, task.id);
                creep.memory.cache = {};
                return ;
            }

            creep.memory.cache.task = task;
        }

        if (!creep.memory.cache.task) return ;

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