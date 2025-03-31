import { creepMoveTo, creepMoveToHome } from "../../function/move"

// 检查spawn和tower是否需要能量
const checkSpawnAndTower = (room: Room) => {
    const towers = (room.tower || []).filter(t => t?.store.getFreeCapacity(RESOURCE_ENERGY) > 100);
    if (room.energyAvailable === room.energyCapacityAvailable && towers.length == 0) {
        return false;
    }
    return true;
}

const creepCarrierActions = {
    // 获取资源
    withdraw: (creep: Creep) => {
        let source = Game.getObjectById(creep.memory.cache.sourceId) as any;
        const minAmount = Math.min(creep.store.getFreeCapacity(), 500);
        if ((source?.amount||0) === 0 && (source?.store[RESOURCE_ENERGY]||0) === 0) {
            delete creep.memory.cache.sourceId;
            source = null;
        }
        if (!source && Game.time % 10 === 2) {
            delete creep.memory.cache.type;
            delete creep.memory.cache.sourceId;

            // 捡垃圾
            const tombstone = creep.pos.findClosestByRange(FIND_TOMBSTONES, {
                filter: t => t.store[RESOURCE_ENERGY] >= minAmount || (Object.keys(t.store).length > 1)
            })
            if (tombstone && (creep.room.storage || tombstone[RESOURCE_ENERGY] >= minAmount)) {
                source = tombstone;
            }

            if (!source) {
                const droppedEnergy = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                    filter: r => (r.resourceType === RESOURCE_ENERGY && r.amount >= minAmount) || (r.resourceType !== RESOURCE_ENERGY && r.amount >= 10)
                })
                if (droppedEnergy && (creep.room.storage || droppedEnergy.resourceType === RESOURCE_ENERGY)) {
                    source = droppedEnergy;
                    creep.memory.cache.type = 'pickup'
                }
            }
            if (!source) {
                // 收破烂
                const ruinedEnergy = creep.pos.findClosestByRange(FIND_RUINS, {
                    filter: r => r.store[RESOURCE_ENERGY] > 50
                });
                if (ruinedEnergy) source = ruinedEnergy;
            }
            if (source) {
                creep.memory.cache.sourceId = source.id;
            }
        }

        // 从容器获取
        if (!source) {
            const containers = creep.room.container.filter(s => (creep.room.storage ? s.store.getUsedCapacity() > minAmount : s?.store[RESOURCE_ENERGY] > Math.min(1200, creep.store.getFreeCapacity())) && !s.pos.inRangeTo(creep.room.controller, 2));
            if (containers) source = creep.pos.findClosestByRange(containers);
        }
        if (!source && creep.room.storage && creep.room.storage.store[RESOURCE_ENERGY] > 10000) source = creep.room.storage;
        if (!source && creep.room.terminal && creep.room.terminal.store[RESOURCE_ENERGY] > 10000) source = creep.room.terminal;
        if (!source && creep.room.storage) source = creep.room.storage;

        if (source) {
            creep.memory.cache.sourceId = source.id;
        }

        if (source) {
            let result;
            if (!source.store) {
                result = creep.pickup(source);
            } else {
                const resourceType = (creep.room.storage && source.id !== creep.room.storage.id) ? Object.keys(source.store)[0] : RESOURCE_ENERGY;
                result = creep.withdraw(source, resourceType as ResourceConstant);
            }
            if (result === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, source, { maxRooms: 1, range: 1, visualizePathStyle: {stroke: '#00ff00'} });
            }
        }
    },
    transfer: (creep: Creep) => {
        let target = Game.getObjectById(creep.memory.cache.targetId as Id<AnyStoreStructure>);
        
        // 目标不存在||目标已存满指定资源，重找
        if (!target || !target.store.getFreeCapacity(creep.memory.cache.resourceType)) {
            // 如果携带的是能量
            if (creep.store[RESOURCE_ENERGY] > 0) {
                // 看扩展是否缺能量
                const extensions = creep.room.extension?.filter(s => s?.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                // console.log(creep.name, extensions.length)
                if (extensions.length > 0) target = creep.pos.findClosestByRange(extensions);
                
                // 检查巢穴和塔
                else if (checkSpawnAndTower(creep.room)) {
                    // 看spawn是否缺能量
                    const spawns = creep.room.spawn?.filter(s => s?.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
                    if (spawns) target = creep.pos.findClosestByRange(spawns);

                    // 看tower是否缺能量
                    if (!target && creep.room.tower) target = creep.pos.findClosestByRange(creep.room.tower.filter(t => t.store.getFreeCapacity(RESOURCE_ENERGY) > 100));
                }

                // 检查控制器旁边的容器是否有Link
                if (!target) {
                    const cContainer = creep.room.container.find(c => c.pos.inRangeTo(creep.room.controller, 2));
                    

                    if (creep.room.level >= 6) {
                        const cLink = creep.room.link.find(l => l.pos.inRangeTo(creep.room.controller, 2));
                        if (!cLink && cContainer && cContainer.store.getFreeCapacity() > 0) {
                            target = cContainer;
                        }
                    } else {
                        if (cContainer && cContainer.store.getFreeCapacity() > 0) {
                            target = cContainer;
                        }
                    }
                    
                }

                if (target) {
                    creep.memory.cache.targetId = target.id;
                    creep.memory.cache.resourceType = RESOURCE_ENERGY;
                }
            }

            if (!target) {
                target = [creep.room.storage, creep.room.terminal].find(s => s && s.store.getFreeCapacity() > 0);
                if (target) {
                    creep.memory.cache.targetId = target.id;
                    creep.memory.cache.resourceType = Object.keys(creep.store)[0];
                }
            }
        }

        if (target) {
            const rType = creep.memory.cache.resourceType??RESOURCE_ENERGY;
            const res = creep.transfer(target, rType);
            // console.log(target, res, creep.memory.cache.resourceType??RESOURCE_ENERGY)
            if (res === OK || target.store.getFreeCapacity(creep.memory.cache.resourceType) === 0) {
                creep.memory.cache = {}
                // delete creep.memory.cache.targetId;
                // delete creep.memory.cache.resourceType;
                if (Object.keys(creep.store).length == 1 &&
                    target.store.getFreeCapacity(rType) >= creep.store[rType]) {
                    return OK;
                }
            } else if (res === ERR_NOT_IN_RANGE) {
                creepMoveTo(creep, target, { maxRooms: 1, range: 1 });
            }
        }

        if (creep.store.getUsedCapacity() === 0) {
            creep.memory.action = 'withdraw';
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creepMoveToHome(creep)) return false;
        if (!creep.memory.cache) creep.memory.cache = { };

        creep.memory.action = 'withdraw'
        return true;
    },
    action: (creep: Creep) => {
        let res;
        switch (creep.memory.action) {
            case 'withdraw':        res = creepCarrierActions.withdraw(creep); break;
            case 'transfer':        res = creepCarrierActions.transfer(creep);break;
        }
        return res;
    },
    done: (creep: Creep, res: any) => {
        switch (creep.memory.action) {
            case 'withdraw':
                if (creep.store.getFreeCapacity() === 0) {
                    creep.memory.action = 'transfer';
                }
                break;
            case 'transfer':
                if (res === OK) {
                    creep.memory.action = 'withdraw';
                }
                break;
        }
    }
}
