import { CREEP_ROLE } from "@/constant/creep";
import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";
import { isLPShard } from "@/util/function";

const creepOutCarrierActions = {
    withdraw: (creep: Creep) => {
        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'transfer';
            return ;
        }

        // 快死了快去存
        if ((creep.hits < creep.hitsMax * 0.8 || creep.ticksToLive < 80) &&
            creep.store.getUsedCapacity() > 0
        ) {
            creep.memory.action = 'transfer';
            return ;
        }

        // 先移动过去
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }

        if (creep.memory.cache.sourceId) {
            const target = Game.getObjectById(creep.memory.cache.sourceId) as any;
            if (!target) {
                delete creep.memory.cache.sourceId;
                delete creep.memory.cache.sourceType;
                return ;
            }

            // 不在附近
            if (!creep.pos.inRangeTo(target, 1)) {
                creepMoveTo(creep, target, { maxRooms: 1, range: 1});
                return ;
            }

            const tType = creep.memory.cache.sourceType;
            if (tType === 'dropped') {
                creep.pickup(target);
            } else if (tType === 'container' || tType === 'ruin' || tType === 'tombstone') {
                const resourceType = Object.keys(target.store)[0];
                creep.withdraw(target, resourceType as ResourceConstant);
            }

            if ((tType === 'dropped' && target.amount === 0) ||
                ((tType === 'container' || tType === 'ruin' || tType === 'tombstone') && target.store.getUsedCapacity() === 0)) {
                delete creep.memory.cache.sourceId;
                delete creep.memory.cache.sourceType;
                return ;
            }

            delete creep.memory.cache.sourceId;
            delete creep.memory.cache.sourceType;
        }

        let target;
        // 寻找容器：资源足够&没有其他爬爬选中
        const containers = creep.room.container.filter(s => s.store.getUsedCapacity() >= 500 && Object.values(Memory.creeps).every(m => m.role !== CREEP_ROLE.OUT_CARRIER || m.cache?.targetId !== s.id));

        // 优先搬矿旁边的容器
        if (creep.room.mineral && creep.room.extractor && creep.room.name.match(/^[EW]\d*[456][NS]\d*[456]$/)) {
            const mContainer = containers.find(c => c.pos.inRangeTo(creep.room.mineral, 2))
            if (mContainer) {
                target = mContainer;
                creep.memory.cache.sourceId = target.id;
                creep.memory.cache.sourceType = STRUCTURE_CONTAINER;
                creepMoveTo(creep, target, { maxRooms: 1, range: 1, plainCost: 2, swampCost: 10 });
                return ;
            }
        }

        // 次先找能源旁边的容器
        target = creep.pos.findClosestByRange(containers||[]);
        if (target) {
            creep.memory.cache.sourceId = target.id;
            creep.memory.cache.sourceType = STRUCTURE_CONTAINER;
            creepMoveTo(creep, target, { maxRooms: 1, range: 1, plainCost: 2, swampCost: 10 });
            return ;
        }

        // 找掉落资源
        const minAmount = Math.min(creep.store.getFreeCapacity(), 500);
        const droppedResource = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: r => r.amount > minAmount
        });
        if (droppedResource && droppedResource.length > 0) {
            const resource = droppedResource.reduce((a, b) => {
                if (a.resourceType !== RESOURCE_ENERGY && b.resourceType === RESOURCE_ENERGY) return a;
                if (b.resourceType !== RESOURCE_ENERGY && a.resourceType === RESOURCE_ENERGY) return b;
                return a.amount < b.amount ? b : a;
            });
            creep.memory.cache.sourceId = resource.id;
            creep.memory.cache.sourceType = 'dropped';
            creepMoveTo(creep, resource, { maxRooms: 1, range: 1, plainCost: 2, swampCost: 10 });
            return ;
        }

        // 找墓碑
        // const tombstones = creep.room.find(FIND_TOMBSTONES, {
        //     filter: t => t.store.getUsedCapacity() > 0
        // });
        // if (tombstones.length > 0) {
        //     target = creep.pos.findClosestByRange(tombstones);
        //     creep.memory.cache.sourceId = target.id;
        //     creep.memory.cache.sourceType = 'tombstone';
        //     creepMoveTo(creep, target, { maxRooms: 1, range: 1, plainCost: 2, swampCost: 10 });
        //     return ;
        // }

        // 找仓库
        // const storage = creep.room.storage || creep.room.terminal;
        // if (storage && storage.store[RESOURCE_ENERGY] > 0) {
        //     creep.memory.cache.sourceId = storage.id;
        //     creep.memory.cache.sourceType = 'container';
        //     creepMoveTo(creep, storage);
        //     return ;
        // }

        // 移动到采集点旁边
        const miner = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: c => c.memory.role === CREEP_ROLE.OUT_HARVESTER
        });
        if (miner) {
            if (!creep.pos.inRangeTo(miner, 1) || miner.store.getUsedCapacity() > 0) {
                creepMoveTo(creep, miner, {
                    range: 1,
                    maxRooms: 1,
                    plainCost: 2, swampCost: 10
                })
            }
            return ;
        }

        const source = creep.pos.findClosestByRange(FIND_SOURCES);
        if (source && !creep.pos.inRangeTo(source, 3)) {
            creepMoveTo(creep, source, {
                range: 3,
                maxRooms: 1,
                plainCost: 2, swampCost: 10
            })
        }
    },
    transfer: (creep: Creep) => {
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
            return ;
        }

        // 找有要修的
        if (creep.getActiveBodyparts(WORK) > 0 && creep.room.name === creep.memory.targetRoom) {
            // 修路
            // const roads = creep.room.road.filter(r => {
            //     if (!r || r.hits >= r.hitsMax * 0.8) return false;
            //     if (!creep.pos.inRangeTo(r.pos, 1)) return false;
            //     return true;
            // });
            // const roads = creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: s => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax * 0.8});
            const roads = creep.pos.lookFor(LOOK_STRUCTURES).filter(s => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax * 0.8);

            if (roads.length > 0) {
                const road = creep.pos.findClosestByRange(roads);
                const result = creep.repair(road);
                if (creepIsOnEdge(creep)) {
                    creepMoveToRoom(creep, creep.room.name, { plainCost: 2, swampCost: 10 });
                }
                if (result === OK) return true;
                else if (result === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, road, {plainCost: 2, swampCost: 10});
                    return true;
                }
            }

            // 修容器
            // const containers = creep.room.container.filter(c => {
            //     if (!c || c.hits >= c.hitsMax * 0.8) return false;
            //     if (!creep.room.source.some(s => s.pos.isNearTo(c.pos))) return false;
            //     if (!creep.pos.inRangeTo(c.pos, 5)) return false;
            //     return true;
            // })
            // if (containers.length > 0) {
            //     const container = creep.pos.findClosestByRange(containers);
            //     const result = creep.repair(container);

            //     if (result === OK) return true;
            //     if (result === ERR_NOT_IN_RANGE) {
            //         creepMoveTo(creep, container);
            //         return true;
            //     }
            // }

            // 找工地
            const sites = creep.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 2);
            if (sites.length > 0) {
                if (creepIsOnEdge(creep)) {
                    creepMoveToRoom(creep, creep.room.name, { plainCost: 2, swampCost: 10 });
                    return true;
                }
                const site = creep.pos.findClosestByRange(sites);
                const result = creep.build(site);
                if (result === OK) return true;
                if (result === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, site, { plainCost: 2, swampCost: 10 });
                    return true;
                }
            }
        }
        // 沿途也修复一下
        else if (creep.getActiveBodyparts(WORK) > 0 && creep.room.name !== creep.memory.targetRoom && creep.room.name !== creep.memory.home) {
            const roads = creep.pos.lookFor(LOOK_STRUCTURES).filter(s => s.structureType === STRUCTURE_ROAD && s.hits < s.hitsMax * 0.8);

            if (roads.length > 0) {
                const result = creep.repair(roads[0]);
                if (creepIsOnEdge(creep)) {
                    creepMoveToRoom(creep, creep.room.name, { plainCost: 2, swampCost: 10 });
                }
                if (result === OK) return true;
            }

            const sites = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3, {
                filter: cs => cs.structureType === STRUCTURE_ROAD
            });

            if (sites.length > 0) {
                if (creepIsOnEdge(creep)) {
                    creepMoveToRoom(creep, creep.room.name, { plainCost: 2, swampCost: 10 });
                    return true;
                }
                const site = creep.pos.findClosestByRange(sites);
                const result = creep.build(site);

                if (result === OK) return true;
                if (result === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, site, { plainCost: 2, swampCost: 10 });
                    return true;
                }
            }
        }

        // 否则先走回去存仓库
        if(creep.room.name !== creep.memory.home || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.home, { visualizePathStyle: {stroke: '#00ff00', plainCost: 2, swampCost: 10 }});
            return ;
        }

        // 非LP，看是否路过Controller
        if (!isLPShard()) {
            if (creep.memory.cache.goController || creep.pos.inRangeTo(creep.room.controller, 5)) {
                const cContainer = creep.room.container.find(c => c.pos.isNearTo(creep.room.controller) && c.store.getFreeCapacity() >= creep.store.energy);
                if (cContainer) {
                    const res = creep.transfer(cContainer, RESOURCE_ENERGY);
                    if (res === ERR_NOT_IN_RANGE) {
                        creepMoveTo(creep, cContainer, { maxRooms: 1, range: 1, plainCost: 2, swampCost: 10 });
                    }
                    creep.memory.cache.goController = true;
                    return ;
                }
            }
        }

        let target: StructureContainer | StructureStorage;
        if (creep.memory.cache.targetId) {
            target = Game.getObjectById(creep.memory.cache.targetId) as any;
            if (target) {
                if (target.room.name !== creep.memory.home) {
                    creep.memory.cache = {};
                    return ;
                }
                if (creep.pos.inRangeTo(target, 1)) {
                    if (target.store.getFreeCapacity(RESOURCE_ENERGY) > 200) {
                        creep.transfer(target, Object.keys(creep.store)[0] as ResourceConstant);
                    } else {
                        delete creep.memory.cache.targetId;
                    }
                } else {
                    creepMoveTo(creep, target, { maxRooms: 1, range: 1, plainCost: 2, swampCost: 10 });
                }
                return ;
            }
            delete creep.memory.cache.targetId;
        }

        if (!target) {
            if (creep.room.storage &&
                creep.room.storage.store.getFreeCapacity() > 10000
            ) target = creep.room.storage;
        }

        if (!target) {
            target = creep.pos.findClosestByRange(creep.room.container.filter(c => c && c.store.getFreeCapacity() > 0));
        }

        if (target) {
            creep.memory.cache.targetId = target.id;
            if (creep.pos.inRangeTo(target, 1)) {
                if (target.store.getFreeCapacity() > 0) {
                    creep.transfer(target, Object.keys(creep.store)[0] as ResourceConstant);
                } else {
                    delete creep.memory.cache.targetId;
                }
            } else {
                creepMoveTo(creep, target, { maxRooms: 1, range: 1, plainCost: 2, swampCost: 10 });
            }
        } else {
            if (creep.room.storage) {
                if (creep.pos.inRangeTo(creep.room.storage, 1)) {
                    creep.drop(Object.keys(creep.store)[0] as ResourceConstant);
                } else {
                    creepMoveTo(creep, creep.room.storage, { maxRooms: 1, range: 1, plainCost: 2, swampCost: 10 });
                }
            } else {
                const site = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER
                });
                if (site) {
                    if (creep.pos.inRangeTo(site, 3)) {
                        creep.drop(Object.keys(creep.store)[0] as ResourceConstant);
                    } else {
                        creepMoveTo(creep, site, { maxRooms: 1, range: 3, plainCost: 2, swampCost: 10 });
                    }
                } else {
                    creep.drop(Object.keys(creep.store)[0] as ResourceConstant);
                }
            }
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
            case 'withdraw':            creepOutCarrierActions.withdraw(creep); break;
            case 'transfer':            creepOutCarrierActions.transfer(creep); break;
        }
    }
}