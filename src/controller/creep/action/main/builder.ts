import { MISSION_TYPE } from "@/constant/mission";
import { deleteMission, getMission, getMissionByDist } from "@/controller/room/mission/pool";
import { creepGoBuild, creepGoRepair } from "../../function/work";
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

        // 没能量了
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }

        if (!creep.memory.cache.taskId) {
            const task = getMissionByDist(creep.room, MISSION_TYPE.BUILD, creep.pos);

            // 没活了，去升级算了
            if (!task) {
                creep.memory.action = 'repair';
                creepBuilderActions.repair(creep);
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
    },
    repair: (creep: Creep) => {
        // 没能量了
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }

        if (!creep.memory.cache.rampart) {
            const rampart = creep.room.rampart.find(s => s && s.hits < 5000);
            if (rampart) {
                creep.memory.cache.rampart = rampart.id;
            } else {
                creep.memory.action = 'upgrade';
                creepBuilderActions.upgrade(creep);
                return;
            }
        }

        const rampart = Game.getObjectById(creep.memory.cache.rampart) as StructureRampart;

        if (!rampart || rampart.hits >= 5000) {
            delete creep.memory.cache.rampart;
            return ;
        }
        creepGoRepair(creep, rampart);
    },
    upgrade: (creep: Creep) => {
        if (!creep.room.controller?.my) return ;

        // 没能量了
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }

        const res = creep.upgradeController(creep.room.controller);
        if (res === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, creep.room.controller, { maxRooms: 1, range: 2 });
        }
        
        // 成功升级一次就切回去看看有没有任务
        // else if (res === OK) {
        //     creep.memory.action = 'build';
        // }
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
            case 'repair':         creepBuilderActions.repair(creep); break;
            case 'upgrade':        creepBuilderActions.upgrade(creep); break;

        }
    },
    done: (creep: Creep, res: any) => {

    }
}