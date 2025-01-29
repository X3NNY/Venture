import { roomFindClosestSource } from "@/controller/room/function/find";
import { creepGoHarvest } from "../../function/work";
import { creepMoveTo } from "../../function/move";

const creepUniversalActions = {
    /**
     * 采集阶段：从丢弃、废墟、容器、能源中获取能量
     * @param creep 
     * @returns 
     */
    harvest: (creep: Creep) => {
        // 捡垃圾
        const droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 100
        })

        if (droppedEnergy) {
            if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, droppedEnergy, { maxRooms: 1, range: 1 });
            }
            return ;
        }

        // 收破烂
        const ruinedEnergy = creep.pos.findClosestByRange(FIND_RUINS, {
            filter: r => r.store[RESOURCE_ENERGY] > 50
        });

        if (ruinedEnergy) {
            if (creep.withdraw(ruinedEnergy, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, ruinedEnergy, { maxRooms: 1, range: 1 });
            }
            return ;
        }


        // 从最近能量点拿
        const structs = [];
        if (creep.room.storage?.store[RESOURCE_ENERGY] >= 1000) structs.push(creep.room.storage);
        if (creep.room.terminal?.store[RESOURCE_ENERGY] >= 1000) structs.push(creep.room.terminal);
        creep.room.link.forEach(l => {
            if (l?.store[RESOURCE_ENERGY] >= 400) {
                structs.push(l);
            }
        })
        creep.room.container.forEach(c => {
            if (c?.store[RESOURCE_ENERGY] >= 500) {
                structs.push(c);
            }
        })
        const target = creep.pos.findClosestByRange(structs);

        if (target) {
            if (creep.withdraw(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { maxRooms: 1, range: 1});
            }
            return ;
        }

        // 爆金币
        const container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 50 && !s.pos.inRangeTo(creep.room.controller, 1)
        });

        if (container) {
            if (creep.withdraw(container, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, container, { maxRooms: 1, range: 1 });
            }
            return ;
        }

        // 已老实，采集
        const targetSource = Game.getObjectById(creep.memory.targetSourceId);
        
        if (targetSource &&  targetSource.energy > 0) {
            creepGoHarvest(creep, targetSource, creep.memory.targetHarvestPos);
        }
    },
    /**
     * 运输阶段：将能量转移到容器、工地
     * @param creep
     */
    transfer: (creep: Creep) => {
        // 优先给指定目标充
        let target = Game.getObjectById(creep.memory.cache.targetId) as StructureContainer | null;

        
        if (!target || target.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
            creep.memory.cache.targetId = null;

            const targets = [];

            // 给spawn充
            creep.room.spawn.forEach(s => {
                if (s.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    targets.push(s);
                }
            })

            // 给扩展充
            creep.room.extension.forEach(e => {
                if (e.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                    targets.push(e);
                }
            })

            // 给容器充
            if (targets.length === 0) {
                creep.room.container.forEach(c => {
                    if (c.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                        targets.push(c);
                    }
                })
            }

            // 给最近的充
            if (targets.length > 0) {
                target = (targets.length === 1) ? targets[0]: creep.pos.findClosestByRange(targets);
                if (target) creep.memory.cache.targetId = target.id;
            }
        }

        if (target) {
            if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, target, { maxRooms: 1, range: 1, ignoreCreeps: false, });
            }
        } else {
            // 没有需要充能的就建，优先建容器
            const sites = creep.room.find(FIND_CONSTRUCTION_SITES, {
                filter: { structureType: STRUCTURE_CONTAINER }
            });
            const site = creep.pos.findClosestByRange(sites);
            if (site) {
                if (creep.build(site) === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, site, { maxRooms: 1, range: 1});
                }
            } else {
                creepUniversalActions.upgrade(creep);
            }
        }
    },
    /**
     * 升级阶段：升级控制器
     * @param creep 
     */
    upgrade: (creep: Creep) => {
        const controller = creep.room.controller;
        if (controller && controller.my && creep.pos.isNearTo(controller)) {
            creep.upgradeController(controller);
        } else {
            creepMoveTo(creep, controller, { maxRooms: 1, range: 1 });
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.room.source || creep.room.source.length == 0) return false;
        let target = roomFindClosestSource(creep.room, creep);
        if (!target.source) return false;
        creep.memory.targetSourceId = target.source.id;
        creep.memory.targetHarvestPos = target.harvestPos;
        creep.memory.action = 'harvest';
        if (!creep.memory.cache) creep.memory.cache = {};
        return true;
    },
    action: (creep: Creep) => {
        switch (creep.memory.action) {
            case 'harvest':     creepUniversalActions.harvest(creep);break;
            case 'transfer':    creepUniversalActions.transfer(creep);break;
            case 'upgrade':     creepUniversalActions.upgrade(creep);break;
        }
    },
    done: (creep: Creep, res: any) => {
        switch (creep.memory.action) {
            case 'harvest':
                if (creep.store.getFreeCapacity() === 0) {
                    if (creep.room.level < 2) {
                        creep.memory.action = 'upgrade';
                    } else {
                        creep.memory.action = 'transfer';
                    }
                }
                break;
            case 'transfer':
                if (creep.store.getUsedCapacity() === 0) {
                    creep.memory.action = 'harvest';
                }
                break;
            case 'upgrade':
                if (creep.store.getUsedCapacity() === 0) {
                    creep.memory.action = 'harvest';
                }
                break;
        }    
    }
}
