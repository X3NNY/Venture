import { coordCompress } from "@/util/coord";
import { creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";
import { roomFindClosestSource } from "@/controller/room/function/find";
import { creepGoHarvest } from "../../function/work";
import { CREEP_ROLE } from "@/constant/creep";

const creepOutHarvesterActions = {
    build: (creep: Creep) => {
        // if (Game.rooms[creep.memory.home].controller.level < 4) return ;
        // 不在目标房间
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom, {
                plainCost: 2, swampCost: 10
            })
            return ;
        }
        // 已经铺路了
        if (creep.room.memory.road && creep.room.memory.road.length > 0) {
            creep.memory.action = 'harvest';
            return ;
        }

        creep.room.memory.road = [];
        
        // 寻找路径
        const path = [];
        const sources = creep.room.find(FIND_SOURCES);
        const pos = sources.map(s => s.pos);

        const isCenterRoom = /^[EW]\d*[456][NS]\d*456/.test(creep.room.name);

        // 中间房间找一下矿
        if (isCenterRoom) {
            const mineral = creep.room.find(FIND_MINERALS)[0];
            if (mineral) pos.push(mineral.pos);
        }
        const closestPos = creep.pos.findClosestByRange(pos);

        const costs = new PathFinder.CostMatrix();
        const terrain = new Room.Terrain(creep.room.name);
        const costMap = {
            TERRAIN_MASK_WALL: 255,
            TERRAIN_MASK_SWAMP: 4,
            0: 2
        }
        for (let i = 0; i < 50; i++) {
            for (let j = 0; j < 50; j++) {
                costs.set(i, j, costMap[terrain.get(i, j)]);
            }
        }

        PathFinder.search(creep.pos, { pos: closestPos, range: 1}, {
            maxRooms: 1,
            roomCallback: () => costs
        }).path.forEach(pos => {
            costs.set(pos.x, pos.y, 1);
            path.push(pos);
        })

        for (let i = 0; i < pos.length; i++) {
            for (let j = i+1; j < pos.length; j++) {
                PathFinder.search(pos[i], { pos: pos[j], range: 1 }, {
                    maxRooms: 1,
                    roomCallback: () => costs
                }).path.forEach(pos => {
                    costs.set(pos.x, pos.y, 1);
                    path.push(pos);
                })
            }
        }

        for (const point of path) {
            const coord = coordCompress([point.x, point.y])
            if (creep.room.memory.road.includes(coord)) continue;
            creep.room.memory.road.push(coord);
        }

        creep.memory.action = 'harvest';
    },
    harvest: (creep: Creep) => {
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom, {
                plainCost: 2, swampCost: 10
            })
            return ;
        }
        if (!creep.memory.targetSourceId) {
            const res = roomFindClosestSource(creep.room, creep);
            if (res.source) {
                creep.memory.targetSourceId = res.source.id;
                creep.memory.targetHarvestPos = res.harvestPos;
            } else return ;
        }

        const target = Game.getObjectById(creep.memory.targetSourceId);

        if (!target) return ;

        const result = creepGoHarvest(creep, target, creep.memory.targetHarvestPos);

        // 没有CARRY的话就继续采集
        if (creep.store.getCapacity() === 0) return ;

        // 如果有采集点且建好了也就只管采
        if (creep.memory.targetHarvestPos) {
            let structs = creep.room.lookForAt(LOOK_STRUCTURES, creep.memory.targetHarvestPos.x, creep.memory.targetHarvestPos.y);
            if (structs.length > 0) return ;
        } else {
            // 继续找一遍有没有Container
            const containers = target.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType === STRUCTURE_CONTAINER && s.pos.lookFor(LOOK_CREEPS).length === 0
            });
            if (containers.length > 0) {
                creep.memory.targetHarvestPos = containers[0].pos;
            }

            // 继续找有没有工地
            else {
                const containerSites = target.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
                    filter: s => s.structureType === STRUCTURE_CONTAINER
                });
                if (containerSites.length > 0) {
                    creep.memory.targetHarvestPos = containerSites[0].pos;
                    return ;
                }

                // 开采了，建一个工地
                else if (result && target.pos.findInRange(FIND_STRUCTURES, 1, {filter: s => s.structureType === STRUCTURE_CONTAINER}).length === 0) {
                    creep.room.createConstructionSite(creep.pos, STRUCTURE_CONTAINER);
                    // addMission(creep.room, MISSION_TYPE.BUILD, BUILD_MISSION, {
                    //     pos: creep.pos,
                    //     structureType: STRUCTURE_CONTAINER
                    // });
                    creep.memory.targetHarvestPos = creep.pos;
                    return ;
                }
            }
        }

        if (creep.store.getFreeCapacity() === 0) creep.memory.action = 'transfer';
    },
    transfer: (creep: Creep) => {
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'harvest';
            return ;
        }

        // 有工地就建
        if (creep.memory.targetHarvestPos) {
            let sites = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.memory.targetHarvestPos.x, creep.memory.targetHarvestPos.y);
            if (sites.length > 0) {
                creep.build(sites[0]);
                return ;
            }
        }

        // 传给其他传输爬爬
        const carrier = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
            filter: c => c.memory.role === CREEP_ROLE.OUT_CARRIER &&
                        c.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        });
        
        if (carrier.length > 0) creep.transfer(carrier[0], RESOURCE_ENERGY);
        else creep.drop(RESOURCE_ENERGY);

        if (creep.store.getUsedCapacity() === 0) creep.memory.action = 'harvest';
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};

        creep.memory.action = 'build';
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'build':               creepOutHarvesterActions.build(creep); break;
            case 'harvest':             creepOutHarvesterActions.harvest(creep); break;
            case 'transfer':            creepOutHarvesterActions.transfer(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {

    }
}