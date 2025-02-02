import { creepMoveTo, creepMoveToRoom, creepMoveToRoomBypass } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";
import { creepGoBuild, creepGoHarvest } from "../../function/work";

const creepAidBuilderActions = {
    harvest: (creep: Creep) => {
        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'build';
            creepAidBuilderActions.build(creep);
            return ;
        }

        // 捡垃圾
        const droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
            filter: r => r.resourceType === RESOURCE_ENERGY && r.amount > 500
        })

        if (droppedEnergy) {
            if (creep.pickup(droppedEnergy) === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, droppedEnergy, { maxRooms: 1, range: 1 });
            }
            return ;
        }

        // 捡遗物
        const tombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
            filter: t => t.store[RESOURCE_ENERGY] > 500
        })

        if (tombstone) {
            if (creep.withdraw(tombstone, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, tombstone, { maxRooms: 1, range: 1 });
            }
            return ;
        }

        const targets = []
        creep.room.container.forEach(c => {
            if (c.store[RESOURCE_ENERGY] > 0) {
                targets.push(c);
            }
        });
        if ((creep.room.storage?.store[RESOURCE_ENERGY]||0) > 0) targets.push(creep.room.storage)
        if ((creep.room.terminal?.store[RESOURCE_ENERGY]||0) > 0) targets.push(creep.room.terminal)

        const target = creep.pos.findClosestByRange(targets);
        if (target) {
            const result = creep.withdraw(target, RESOURCE_ENERGY);
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, target);
            }
            return ;
        }

        if (!creep.room.source) {
            if (Game.time % 20 !== 1) return ;
            creep.room.update();
            return ;
        }

        const sources = creep.room.source.filter(s => s.energy > 0);
        const source = creep.pos.findClosestByRange(sources);
        if (!source && creep.store[RESOURCE_ENERGY] > 0) {
            creep.memory.action = 'build';
            creepAidBuilderActions.build(creep);
            return ;
        }

        creepGoHarvest(creep, source);
    },
    build: (creep: Creep) => {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.action = 'harvest';
            creepAidBuilderActions.harvest(creep);
            return ;
        }

        const sites = creep.room.find(FIND_CONSTRUCTION_SITES);
        
        if (sites.length === 0) {
            creep.memory.action = 'repair';
            creepAidBuilderActions.repair(creep);
            return ;
        }

        let target = creep.pos.findClosestByRange(sites, { filter: (s: ConstructionSite) => s.structureType === STRUCTURE_ROAD || s.structureType === STRUCTURE_SPAWN || s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_TERMINAL});

        if (!target) {
            target = creep.pos.findClosestByRange(sites, { filter: (s: ConstructionSite) => s.structureType === STRUCTURE_TOWER || s.structureType === STRUCTURE_EXTENSION});
        }

        if (!target) {
            target = creep.pos.findClosestByRange(sites);
        }

        if (!target) return ;
        creepGoBuild(creep, target);
    },
    repair: (creep: Creep) => {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.action = 'harvest';
            return creepAidBuilderActions.harvest(creep);
        }

        if (!creep.memory.cache.target) {
            const structs = creep.room.find(FIND_STRUCTURES, { filter: s => s.hits < s.hitsMax * 0.7 && s.structureType !== STRUCTURE_WALL && s.structureType !== STRUCTURE_RAMPART  });

            if (structs.length === 0) {
                creep.memory.action = 'upgrade';
                return creepAidBuilderActions.upgrade(creep);
            }

            creep.memory.cache.target = creep.pos.findClosestByRange(structs).id;
        }

        const target = Game.getObjectById(creep.memory.cache.target) as Structure;

        if (!target) return ;

        const result = creep.repair(target);
        if (result === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, target, { range: 3, maxRooms: 1 });
        }
        if (target.hits >= target.hitsMax * 0.9) {
            creep.memory.cache = {};
            creep.memory.action = 'build';
            return ;
        }
    },
    upgrade: (creep: Creep) => {
        if (creep.store[RESOURCE_ENERGY] === 0) {
            creep.memory.action = 'harvest';
            return creepAidBuilderActions.harvest(creep);
        }

        const controller = creep.room.controller;

        const result = creep.upgradeController(controller);

        if (result === OK) {
            creep.memory.action = 'build';
            return;
        } else if (result === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, controller, { maxRooms: 1, range: 3});
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoomBypass(creep, creep.memory.targetRoom, {visualizePathStyle: {stroke: '#00ff00'}})
            return false;
        }
        creep.memory.action = 'harvest';
        return true;
    },
    action: (creep: Creep) => {
        switch (creep.memory.action) {
            case 'harvest':
                creepAidBuilderActions.harvest(creep); break;
            case 'build':
                creepAidBuilderActions.build(creep); break;
            case 'repair':
                creepAidBuilderActions.repair(creep); break;
            case 'upgrade':
                creepAidBuilderActions.upgrade(creep); break;
        }
    },
}