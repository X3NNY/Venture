import { creepMoveTo, creepMoveToCoord } from "./move";

/**
 * 采集能源，如果制定了采集点先走到采集点
 * @param creep 
 * @param target 
 * @param harvestPos 采集点（容器位置）
 * @returns 
 */
export const creepGoHarvest = (creep: Creep, target: Source, harvestPos?: any) => {
    if (!target) return ;
    if (harvestPos && !creep.pos.isEqualTo(harvestPos.x, harvestPos.y)) {
        // 检测一下还有爬爬没
        if (harvestPos.isLock && Game.time % 50 === 0) {
            if ((new RoomPosition(harvestPos.x, harvestPos.y, creep.room.name)).lookFor(LOOK_CREEPS).length === 0) {
                harvestPos.isLock = false;
            }
        }
        
        else if (!harvestPos.isLock) {
            // 没爬爬就占上
            if ((new RoomPosition(harvestPos.x, harvestPos.y, creep.room.name)).lookFor(LOOK_CREEPS).length === 0) {
                creepMoveToCoord(creep, harvestPos.x, harvestPos.y, {
                    maxRooms: 1,
                });
                return false;
            } else {
                harvestPos.isLock = true;
            }
        }
    }
    const res = creep.harvest(target);
    if (res === OK) {
        return true;
    } else if (res === ERR_NOT_IN_RANGE) {
        creepMoveTo(creep, target, {
            maxRooms: 1,
            range: 1
        });
    }
    return false;
}

export const creepGoMine = (creep: Creep, mineral: Mineral<MineralConstant>, minePos?: any) => {
    if (minePos && !creep.pos.isEqualTo(minePos.x, minePos.y)) {
        // 检测一下还有爬爬没
        if (minePos.isLock && Game.time % 100 === 0) {
            if ((new RoomPosition(minePos.x, minePos.y, creep.room.name)).lookFor(LOOK_CREEPS).length === 0) {
                minePos.isLock = false;
            }
        }
        
        else if (!minePos.isLock) {
            // 没爬爬就占上
            if ((new RoomPosition(minePos.x, minePos.y, creep.room.name)).lookFor(LOOK_CREEPS).length === 0) {
                creepMoveToCoord(creep, minePos.x, minePos.y, {
                    maxRooms: 1,
                });
                return false;
            } else {
                minePos.isLock = true;
            }
        }
    }
    if (mineral) {
        const result = creep.harvest(mineral);
        if (result === OK) {
            return true;
        } else if (result === ERR_NOT_IN_RANGE) {
            if (mineral.pos.findInRange(FIND_HOSTILE_CREEPS, 3).length > 0) return ;
            creepMoveTo(creep, mineral,{
                maxRooms: 1,
                range: 1
            });
        }
    }
    return false;
}

export const creepGoBuild = (creep: Creep, site: ConstructionSite) => {
    if (!site) return false;

    const res = creep.build(site);

    if (res === OK) {
        return true;
    } else if (res === ERR_NOT_IN_RANGE) {
        creepMoveTo(creep, site, {
            maxRooms: 1,
            range: 3
        })
    }
    return false;
}

export const creepGoRepair = (creep: Creep, target: Structure) => {
    if (!target) return false;

    const res = creep.repair(target);

    if (res === OK) {
        return true;
    } else if (res === ERR_NOT_IN_RANGE) {
        creepMoveTo(creep, target, {
            maxRooms: 1,
            range: 2
        })
    }
    return false;
}

export const creepGoTransfer = (creep: Creep, target: AnyStoreStructure, rType: ResourceConstant) => {
    if (!target) return false;

    const res = creep.transfer(target, rType);

    if (res === OK) {
        return true;
    } else if (res === ERR_NOT_IN_RANGE) {
        creepMoveTo(creep, target, {
            maxRooms: 1,
            range: 1
        })
    }
    return false;
}