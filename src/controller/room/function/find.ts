// 获取最近的可用能量源
export const roomFindClosestSource = (room: Room, creep: Creep) => {
    // if (!room.memory.sourceHarvestPos) room.memory.sourceHarvestPos = {}

    let creeps = room.find(FIND_MY_CREEPS, {
        filter: c => c.id != creep.id && c.ticksToLive > 100 && c.memory.role === creep.memory.role
    }) || [];

    const zeroSources = [];
    const terrain = room.getTerrain();

    const sources = room.source.filter(source => {
        let creepCount = creeps.filter(c => c.memory.targetSourceId === source.id).length;
        // 周围有敌对爬爬
        if (room.level < 3 && source.pos.findInRange(FIND_HOSTILE_CREEPS, 3, {
            filter: c => c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0
        }).length > 0) return false;

        const hPos = [[1,1], [1, 0], [1, -1], [0, 1], [0, -1], [-1, 1], [-1, 0], [-1, -1]].filter(([dx,dy]) => terrain.get(source.pos.x+dx, source.pos.y+dy) !== TERRAIN_MASK_WALL);

        // if (hPos.length === 0) return false;

        if (creepCount === 0) zeroSources.push(source);

        if (creepCount < hPos.length) return true;
    })

    let targetSource = null;
    
    if (zeroSources.length > 0) {
        targetSource = zeroSources.length === 1 ? zeroSources[0] : creep.pos.findClosestByRange(zeroSources);
    } else if (sources.length === 1) {
        targetSource = sources[0];
    } else if (sources.length >= 1) {
        targetSource = creep.pos.findClosestByRange(sources);
    }

    let cs = room.container.filter(c => c.pos.isNearTo(targetSource) && c.pos.lookFor(LOOK_CREEPS).length === 0);
    let harvestPos = cs.length > 0 ? cs[0].pos : null;

    return {
        source: targetSource,
        harvestPos: harvestPos
    }
}