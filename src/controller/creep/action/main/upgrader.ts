import { isLPShard } from "@/util/function";
import { creepChargeBoost, creepChargeEnergy, creepChargeUnboost } from "../../function/charge";
import { creepMoveTo, creepMoveToHome, getDirection } from "../../function/move";
import { creepGoHarvest } from "../../function/work";
import { creepFindAvailablePos } from "../../function/position";

const creepUpgraderActions = {
    withdraw: (creep: Creep) => {
        if (creep.store.getFreeCapacity() === 0) {
            creep.memory.action = 'upgrade';
            creepUpgraderActions.upgrade(creep);
            return ;
        }

        const link = creep.room.link.find(l => l.pos.inRangeTo(creep.room.controller, 2));
        let container = creep.room.container.find(c => c.pos.inRangeTo(creep.room.controller, 2)) ?? null;
        let res;

        // 有控制器链接
        if (link && link.store[RESOURCE_ENERGY] > 0) {
            res = creep.withdraw(link, RESOURCE_ENERGY);
            if (res === ERR_NOT_IN_RANGE) {
                if (container && container.pos.lookFor(LOOK_CREEPS).length === 0) {
                    creepMoveTo(creep, container, { maxRooms: 1 });
                } else {
                    creepMoveTo(creep, link, { maxRooms: 1, range: 1 });
                }
            }
        } 
        // 控制器旁边有容器
        else if (container && container.store[RESOURCE_ENERGY] > 0) {
            if (!container.pos.isEqualTo(creep.pos) && container.pos.lookFor(LOOK_CREEPS).length === 0) {
                creepMoveTo(creep, container, { maxRooms: 1 });
            } else {
                res = creep.withdraw(container, RESOURCE_ENERGY);
                if (res === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, container, { maxRooms: 1, range: 1 });
                }
            }
        }
        else if (creep.room.storage.pos.inRangeTo(creep.room.controller, 2) && creep.room.storage.store[RESOURCE_ENERGY] > 10000) {
            res = creep.withdraw(creep.room.storage, RESOURCE_ENERGY);
            if (res === ERR_NOT_IN_RANGE) {
                const pos = creepFindAvailablePos(creep, creep.room.storage, pos => pos.lookFor(LOOK_CREEPS).length === 0 &&
                    pos.inRangeTo(creep.room.controller, 2)
                );
                if (pos) {
                    creepMoveTo(creep, pos, { maxRooms: 1, ignoreCreeps: false, visualizePathStyle: { stroke: '#ff0000' } });
                } else {
                    creepMoveTo(creep, creep.room.storage, { maxRooms: 1, range: 1 });
                }
            }
        }
        // 否则自己找
        else if (creep.room.level < 6) {

            if (creep.room.level < 3) {
                if (!isLPShard()) {
                    const source = creep.room.source.find(s => s.energy > 0);
                    if (source) {
                        creepGoHarvest(creep, source);
                    }
                }
            }

            creepChargeEnergy(creep, false);
        }
    },
    upgrade: (creep: Creep) => {
        // if (!creepMoveToHome(creep)) return ;

        // 卸下BOOST
        if (creep.ticksToLive <= 50) {
            if (creep.memory.cache.goUnboost === undefined) {
                if (creep.room.memory.unBoostPos && creep.body.some(p => p.boost)) {
                    creep.memory.cache.goUnboost = true;
                } else {
                    creep.memory.cache.goUnboost = false;
                }
            } else if (creep.memory.cache.goUnboost) {
                const res = creepChargeUnboost(creep);
                if (res === ERR_NO_BODYPART) {
                    creep.suicide();
                }
                return ;
            }
        }

        if (creep.room.level <= 6 && !isLPShard()) {
            const sites = creep.room.find(FIND_MY_CONSTRUCTION_SITES, { 
                filter: s => s.structureType === STRUCTURE_CONTAINER || s.structureType === STRUCTURE_EXTENSION
            });
            const site = creep.pos.findClosestByRange(sites);
            if (site) {
                const res = creep.build(site);
                if (res === ERR_NOT_IN_RANGE) {
                    creepMoveTo(creep, site, { maxRooms: 1, range: 3 });
                } else if (res === ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.action = 'withdraw';
                }
                return ;
            }
        }
        if (creep.pos.inRangeTo(creep.room.controller, 3)) {
            creep.upgradeController(creep.room.controller);

            const sign = Memory.RoomInfo[creep.room.name].sign ?? '𝙑𝙚𝙣𝙩𝙪𝙧𝙚';
            if (creep.room.controller && (creep.room.controller.sign?.text ?? '') !== sign) {
                if (creep.pos.inRangeTo(creep.room.controller, 1)) {
                    creep.signController(creep.room.controller, sign);
                } else {
                    creepMoveTo(creep, creep.room.controller, { maxRooms: 1, range: 1 });
                }
            }

            if (!isLPShard() && !creep.memory.cache?.check) {
                if (creep.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_ROAD)) {
                    const terrain = creep.room.getTerrain();
                    const nextD = [
                        [-1, -1], [1, -1], [-1, 1], [1, 1],
                        [-1, 0], [1, 0], [0, 1], [0, -1]
                    ].find(([x, y])=> {
                        const newPos = new RoomPosition(creep.pos.x+x, creep.pos.y+y, creep.room.name);
                        if (!newPos.inRangeTo(creep.room.controller, 3)) return false;
                        if (terrain.get(newPos.x, newPos.y) === TERRAIN_MASK_WALL) return false;
                        const structs = newPos.lookFor(LOOK_STRUCTURES);
                        if (structs.find(s => s.structureType === STRUCTURE_ROAD)) return false;
                        if (structs.find(s => s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_RAMPART)) return false;
                        return true;
                    });

                    if (nextD) {
                        const newPos = new RoomPosition(creep.pos.x+nextD[0], creep.pos.y+nextD[1], creep.room.name);
                        const direct = getDirection(creep.pos, newPos);
                        creep.move(direct);
                    }
                }
                if (creep.memory.cache)
                    creep.memory.cache.check = true;
            }
        } else {
            // 先移动过去
            const link = creep.room.link.find(l => l.pos.inRangeTo(creep.room.controller, 2));
            if (link && !creep.pos.inRangeTo(link, 1)) {
                creepMoveTo(creep, creep.room.controller.pos, {
                    maxRooms: 1,
                    range: 1,
                })
            }
            else if (!link && !creep.pos.inRangeTo(creep.room.controller, 2)) {
                creepMoveTo(creep, creep.room.controller.pos, {
                    maxRooms: 1,
                    range: 2,
                })
            }
        }

        if (creep.store.getUsedCapacity() < creep.getActiveBodyparts(WORK) * 1.3) {
            creep.memory.action = 'withdraw';
            if (creep.memory.cache)
                creep.memory.cache.check = false;
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        creep.memory.action = 'withdraw';
        return creepChargeBoost(creep, ['XGH2O', 'GH2O', 'GH']);
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'withdraw':        creepUpgraderActions.withdraw(creep); break;
            case 'upgrade':         creepUpgraderActions.upgrade(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {

    }
}