import { coordDecompress } from "@/util/coord";

const roomBuildMaxSite = (room: Room, structureType: string, layouts: any, buildMax: number) => {
    if (structureType === STRUCTURE_ROAD) {
        const layoutType = Memory.RoomInfo[room.name].layout;

        switch (layoutType) {
            case '63':
                if (room.level < 3) return [];
        }
    }

    return layouts
}

const mainStructMap = ['spawn', 'tower', 'storage', 'terminal', 'factory', 'lab', 'nuker', 'powerSpawn'];
const roomBuildRampart = (room: Room, structureType: string, structures: Structure<StructureConstant>[], pos: RoomPosition) => {
    if (room.level < 4) return ;
    if (!mainStructMap.includes(structureType)) return ;
    if (structures.some(s => s.structureType === STRUCTURE_RAMPART)) return ;
    if (structures.every(s => s.structureType !== structureType)) return ;
    room.createConstructionSite(pos.x, pos.y, STRUCTURE_RAMPART);
    return ;
}

export const roomBuildCheckSkip = (room: Room, structureType: string, structures: Structure<StructureConstant>[], pos: RoomPosition) => {
    switch (structureType) {
        case STRUCTURE_RAMPART:
            // 没东西，可以造
            if (structures.length === 0) return false;
            // 已经有墙了
            if (structures.some(s => s.structureType === STRUCTURE_RAMPART || s.structureType === STRUCTURE_WALL)) return true;
            break;
        case STRUCTURE_ROAD:
            // 没东西，可以造
            if (structures.length === 0) return false;
            // 已经有墙了
            if (structures.some(s => s.structureType !== STRUCTURE_RAMPART)) return true;
            break;
        case STRUCTURE_CONTAINER:
            // 有非墙非路建筑，跳过
            if (structures.length > 0 &&
                structures.some(s => s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_ROAD)) return true;
            
            // 6级之前不修矿旁边的容器
            if (room.level <= 6 && room.mineral?.pos.isNearTo(pos)) return  true;
            if (room.level <= 7) return false;

            // 等级高无需建控制器旁边的容器
            if (pos.inRangeTo(room.controller, 2)) return true;
            break;
        case STRUCTURE_LINK:
            // 有非墙非路建筑，跳过
            if (structures.length > 0 &&
                structures.some(s => s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_ROAD)) return true;
            
            // 5级只能两个链接，优先选离仓库远的能源建
            if (room.level === 5) {
                let source = room.source?.find(s => s.pos.inRangeTo(pos, 2));
                if (!source) return false;

                let cSource = room.storage.pos.findClosestByRange(room.source);
                if (source.id == cSource.id) return true;
            }
            break;

        default:
            if (structures.length === 0) return false;
            if (structures.some(s => s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_ROAD)) return true;
            break;
    }
    return false
}

/**
 * 生产工地
 * @param room 
 * @param layoutInfo 
 */
const roomBuildCreateSite = (room: Room, layoutInfo: any) => {
    // 最大限制
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    if (sites.length >= 20) return ;

    for (const sType in layoutInfo) {
        const buildMax = CONTROLLER_STRUCTURES[sType][room.level];
        // 不能建造
        if (!buildMax) continue;

        // 部分建筑最大上限
        if (sType === 'extension' || sType === 'container' || sType === 'link') {
            let count = room[sType] ? room.find(FIND_STRUCTURES, { filter: s => s.structureType === sType }).length : 0;

            if (count >= buildMax) continue;

            count += sites.filter(s => s.structureType === sType).length;
            if (count >= buildMax) continue;
        }

        // 限制构建数量
        const maxSite = roomBuildMaxSite(room, sType, layoutInfo[sType], buildMax);

        if (!maxSite || maxSite.length === 0) continue;

        for (const site of maxSite) {
            const [x, y] = coordDecompress(site);
            const pos = new RoomPosition(x, y, room.name);

            // 已有工地
            if (pos.lookFor(LOOK_CONSTRUCTION_SITES).length > 0) continue;

            const structs = pos.lookFor(LOOK_STRUCTURES);

            // 特殊判断
            if (sType === STRUCTURE_RAMPART) {
                const hasRoadSite = room.find(FIND_CONSTRUCTION_SITES, { filter: s => s.structureType === STRUCTURE_ROAD }).length > 0;
                if (room.level >= 3 && structs.length === 0 && !hasRoadSite) {
                    room.createConstructionSite(x, y, STRUCTURE_WALL);
                    continue
                }
                if (room.level < 5) {
                    continue
                } 
            }

            roomBuildRampart(room, sType, structs, pos);
            if (roomBuildCheckSkip(room, sType, structs, pos)) continue;
            
            room.createConstructionSite(x, y, sType);
        }
    }
}

export const roomAutoBuild = (room: Room) => {
    if (Game.cpu.bucket < 100) return;

    // if (Memory.gamemode === 'auto')

    if (Game.time % 100 !== room.memory.index||0) return;

    if (!Memory.Layout[room.name]) {
        // 先构造布局
        if (Memory.gamemode === 'auto') {
            global.layout?.build(room.name);
        }
        return ;
    }

    // 开始自动建造
    const layoutInfo = Memory.Layout[room.name];
    if (Memory.RoomInfo[room.name].autobuild && layoutInfo && Object.keys(layoutInfo).length > 0) {
        roomBuildCreateSite(room, layoutInfo);
    }
}