import { MISSION_TYPE } from "@/constant/mission";
import { deleteMission, getMission } from "@/controller/room/mission/pool";
import { creepGoBuild } from "../../function/work";
import { creepChargeEnergy } from "../../function/charge";
import { creepMoveTo } from "../../function/move";

const creepBuilderActions = {
    withdraw: (creep: Creep) => {
        if (creepChargeEnergy(creep)) {
            creep.memory.cache = {}
        } else {
            const source = creep.pos.findClosestByRange(creep.room.source.filter(s => s && s.energy > 0));
            if (source) {
                const result = creep.harvest(source);
                if (result === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, source, { maxRooms: 1, range: 1});
                }
            }
        }

        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'build';
        }
    },
    build: (creep: Creep) => {
        let site;

        if (!creep.memory.cache.taskId) {
            const task = getMission(creep.room, MISSION_TYPE.BUILD);

            // 没活了，去升级算了
            if (!task) {
                creep.memory.action = 'upgrade';
                creepBuilderActions.upgrade(creep);
                return;
            }

            site = Game.getObjectById(task.data.siteId);

            if (!site) {
                deleteMission(creep.room, MISSION_TYPE.BUILD, task.id);
                return;
            }

            creep.memory.cache.siteId = site.id;
            creep.memory.cache.taskId = task.id;
        }

        if (!site) site = Game.getObjectById(creep.memory.cache.siteId);

        // 如果工地已经没了
        if (!site) {
            deleteMission(creep.room, MISSION_TYPE.BUILD, creep.memory.cache.taskId);
            delete creep.memory.cache.siteId;
            delete creep.memory.cache.taskId;
            return;
        }
        
        creepGoBuild(creep, site);

        // 没能量了
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }
    },
    upgrade: (creep: Creep) => {
        if (!creep.room.controller?.my) return ;

        // 没能量了
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }

        const res = creep.upgradeController(creep.room.controller);
        if (res === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, creep.room.controller, { maxRooms: 1, range: 3 });
        }
        
        // 成功升级一次就切回去看看有没有任务
        else if (res === OK) {
            creep.memory.action = 'build';
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
        switch (creep.memory.action) {
            case 'withdraw':       creepBuilderActions.withdraw(creep); break;
            case 'build':          creepBuilderActions.build(creep); break;
            case 'upgrade':        creepBuilderActions.upgrade(creep); break;

        }
    },
    done: (creep: Creep, res: any) => {

    }
}