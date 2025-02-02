import { roomFindClosestSource } from "@/controller/room/function/find";
import { creepMoveToHome } from "../../function/move"
import { creepGoHarvest } from "../../function/work";
import { addMission } from "@/controller/room/mission/pool";
import { BUILD_MISSION, MISSION_TYPE } from "@/constant/mission";


const creepHarvesterActions = {
    /**
     * 建造阶段：主要是修建采集点
     * @param creep 
     * @returns 
     */
    build: (creep: Creep) => {
        const targetSource = Game.getObjectById(creep.memory.targetSourceId);
        if (!targetSource) {
            creep.memory.ready = false;
            return ;
        }
        
        let res = creepGoHarvest(creep, targetSource, creep.memory.targetHarvestPos);

        // 走到旁边了
        if (res) {
            // 如果没在采集点上
            if (!creep.memory.targetHarvestPos) {
                // 继续找一遍有没有Container
                const containers = targetSource.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER && s.pos.lookFor(LOOK_CREEPS).length === 0
                });
                if (containers.length > 0) {
                    creep.memory.targetHarvestPos = containers[0].pos;
                }

                // 继续找有没有工地
                else {
                    const containerSites = targetSource.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                        filter: s => s.structureType === STRUCTURE_CONTAINER
                    });
                    if (containerSites.length > 0) {
                        creep.memory.targetHarvestPos = containerSites[0].pos;
                    }
                }
            }
            // 如果在采集点上
            else {
                // 如果就是在Container上，顺便修一下
                let container = creep.pos.lookFor(LOOK_STRUCTURES);
                if (container.length > 0 && container[0].structureType === STRUCTURE_CONTAINER && creep.store.getUsedCapacity() > 0) {
                    creep.repair(container[0]);
                    if (container[0].hits >= container[0].hitsMax) {
                        creep.memory.action = 'harvest';
                        return ;
                    }
                }
                
                // 修不了 直接挖
                else {
                    creep.memory.action = 'harvest';
                }

                // 找一下工地，构建
                let containerSite = creep.pos.lookFor(LOOK_CONSTRUCTION_SITES).find(s => s.structureType === STRUCTURE_CONTAINER);
                creep.build(containerSite);
            }

            // 没带CARRY，直接挖吧
            if (creep.getActiveBodyparts(CARRY) === 0) {
                creep.memory.action = 'harvest';
                return ;
            }
        }

        // let energy = 0;
        // for (const part of creep.body) {
        //     if (part.type !== WORK) continue;
        //     if (part.hits === 0) continue;
        //     if (!part.boost) energy += 2;
        //     else energy += 2 * (BOOSTS.work[part.boost]['harvest'] || 1);
        // }

        // if 
    },
    /**
     * 采集阶段：只采能量
     * @param creep 
     * @returns 
     */
    harvest: (creep: Creep) => {
        const targetSource = Game.getObjectById(creep.memory.targetSourceId);
        if (!targetSource) {
            creep.memory.ready = false;
            return ;
        }
        creepGoHarvest(creep, targetSource, creep.memory.targetHarvestPos);

        // 能量不能浪费
        if (creep.ticksToLive < 2) creep.drop(RESOURCE_ENERGY)

        // 检查是否有链接
        if (creep.getActiveBodyparts(CARRY) && creep.store.getFreeCapacity() === 0) {
            if (creep.room.link) {
                creep.memory.action = 'transfer';
            }
        }
    },
    transfer: (creep: Creep) => {
        const target = creep.room.link.find(l => creep.pos.inRangeTo(l, 1) && l.store.getFreeCapacity(RESOURCE_ENERGY) > 0);

        if (!target) {
            creepHarvesterActions.harvest(creep);
        } else {
            creep.transfer(target, RESOURCE_ENERGY);
        }
        creep.memory.action = 'harvest';
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creepMoveToHome(creep)) return false;
        if (!creep.room.source || creep.room.source.length == 0) return false;

        // 先指定能量Source
        if (!creep.memory.targetSourceId) {
            let target = roomFindClosestSource(creep.room, creep);
            if (!target.source) return false;
            creep.memory.targetSourceId = target.source.id;
            creep.memory.targetHarvestPos = target.harvestPos;
        }

        creep.memory.action = 'build';
        return true;
    },
    action: (creep: Creep) => {
        switch (creep.memory.action) {
            case 'build':
                creepHarvesterActions.build(creep); break;
            case 'harvest':
                creepHarvesterActions.harvest(creep); break;
            case 'transfer':
                creepHarvesterActions.transfer(creep); break;
        }
    }
}
