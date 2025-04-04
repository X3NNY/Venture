import { CREEP_ROLE } from "@/constant/creep";
import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

const creepOutBuilderActions = {
    withdraw: (creep: Creep) => {
        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'build';
            return ;
        }

        let target = Game.getObjectById(creep.memory.cache.targetId) as any;

        // 寻找可用的容器
        if (!target) {
            const containers = creep.room.container.filter(s => 
                s.store.getUsedCapacity() > s.store.getCapacity() * 0.5
            );

            if (containers.length > 0) {
                target = creep.pos.findClosestByRange(containers);
            }
            if (!target) {
                target = [creep.room.storage, ...creep.room.container].find(s => s && s.store[RESOURCE_ENERGY] > 0)
            }
            if (target) {
                creep.memory.cache.targetId = target.id;
            }
        }

        if (target && target.store.getUsedCapacity() > 0) {
            const result = creep.withdraw(target, RESOURCE_ENERGY);

            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, target);
                return ;
            }
            if (target.store.getUsedCapacity(RESOURCE_ENERGY) === 0) {
                delete creep.memory.cache.targetId
                return ;
            }
        }

        const droppedResource = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType == RESOURCE_ENERGY && r.amount > creep.store.getFreeCapacity()
        });
        if (droppedResource && droppedResource.length > 0) {
            const resource = creep.pos.findClosestByRange(droppedResource);

            const result = creep.pickup(resource);
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, resource, { maxRooms: 1, range: 1 });
            }
            return ;
        }
        
        // 自己挖（但是不要占用采集爬爬的地方）
        const source = creep.pos.findClosestByRange(creep.room.source.filter(s => s && s.pos.findInRange(FIND_MY_CREEPS, 1, { filter: c => c.memory.role === CREEP_ROLE.OUT_HARVESTER }).length === 0));
        if (!source) return ;
        const result = creep.harvest(source);
        if (result === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, source, { maxRooms: 1, range: 1 });
        }
    },
    build: (creep: Creep) => {
        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
            delete creep.memory.cache.siteId;
            delete creep.memory.cache.targetId;
            return ;
        }

        if (creep.memory.cache.siteId) {
            const site = Game.getObjectById(creep.memory.cache.siteId) as ConstructionSite;

            if (site) {
                if (creep.pos.inRangeTo(site, 3)) {
                    creep.build(site);
                } else {
                    creepMoveTo(creep, site);
                }
            } else {
                creep.memory.cache.siteId = null;
            }
            return ;
        }

        const targetRoom = Game.rooms[creep.memory.targetRoom];
        const sites = targetRoom.find(FIND_CONSTRUCTION_SITES, { filter: s => s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_CONTAINER });

        if (sites.length > 0) {
            const site = creep.pos.findClosestByRange(sites);
            creep.memory.cache.siteId = site.id;
            if (creep.pos.inRangeTo(site, 3)) {
                creep.build(site);
            } else {
                creepMoveTo(creep, site);
            }
            return ;
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }

        creep.memory.action = 'withdraw';
        return true;
    },
    action: (creep: Creep) => {
        if (creep.hits < creep.hitsMax * 0.66) {
            creep.memory.ready = false;
            return creepMoveToRoom(creep, creep.memory.home);
        }
        switch(creep.memory.action) {
            case 'withdraw':            creepOutBuilderActions.withdraw(creep); break;
            case 'build':               creepOutBuilderActions.build(creep); break;
        }
    },
    done: (creep: Creep, res: any) => [

    ]
}