import { CREEP_ROLE } from "@/constant/creep";
import { creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";
import { creepGoMine } from "../../function/work";

const creepMinerActions = {
    mine: (creep: Creep) => {
        if (!creep.memory.targetSourceId) {
            const res = creep.room.mineral || creep.room.find(FIND_MINERALS)[0];
            if (res) {
                creep.memory.targetSourceId = res.id as any;
            } else return ;
        }

        const mineral = Game.getObjectById(creep.memory.targetSourceId);

        const result = creepGoMine(creep, mineral as any, creep.memory.targetHarvestPos);

        // 没有采集点
        if (result && !creep.memory.targetHarvestPos) {
            // 继续找一遍有没有Container
            const containers = mineral.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType === STRUCTURE_CONTAINER && s.pos.lookFor(LOOK_CREEPS).length === 0
            });
            if (containers.length > 0) {
                creep.memory.targetHarvestPos = containers[0].pos;
            }

            // 继续找有没有工地
            else {
                const containerSites = mineral.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER
                });
                if (containerSites.length > 0) {
                    creep.memory.targetHarvestPos = containerSites[0].pos;
                    return ;
                }

                // 建一个工地
                else if (creep.pos.isNearTo(mineral)){
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                    creep.memory.targetHarvestPos = creep.pos;
                    return ;
                }
            }
        }


        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'transfer';
        }
    },
    transfer: (creep: Creep) => {
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'mine';
            return ;
        }

        // 传给其他传输爬爬
        const rType = Object.keys(creep.store)[0] as ResourceConstant;
        const carrier = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: c => c.memory.role === CREEP_ROLE.OUT_CARRIER &&
                        c.store.getFreeCapacity(rType) > 0
        });
        
        if (carrier.length > 0) creep.transfer(carrier[0], rType);
        else creep.drop(rType);

        if (creep.store.getUsedCapacity() === 0) creep.memory.action = 'mine';
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        if (creep.room.name != creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }

        creep.memory.action = 'mine';
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'mine':
                creepMinerActions.mine(creep); break;
            case 'transfer':
                creepMinerActions.transfer(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {

    }
}