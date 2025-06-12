import { filter } from 'lodash';
import { isLPShard } from "@/util/function";

export const creepIsOnEdge = (creep: Creep | PowerCreep) => {
    const { x, y } = creep.pos;
    return x === 0 || x === 49 || y === 0 || y === 49;
}

export const creepIsNearEdge = (creep: Creep | PowerCreep) => {
    const { x, y } = creep.pos;
    return x === 1 || x === 48 || y === 1 || y === 48;
}


export const creepGetRangePos = (creep: Creep, range: number) => {
    const res = [];
    for (let dx = -range; dx <= range; dx++ ) {
        for (let dy = -range; dy <= range; dy++) {
            res.push([creep.pos.x+dx, creep.pos.y+dy]);
        }
    }
    return res;
}

export const creepFindClosestTarget: CreepFindClosestTarget = (creep: Creep | PowerCreep, typeOrObjects: any, opts?: any) => {
    if (isLPShard()) {
        return creep.pos.findClosestByRange(typeOrObjects, opts);
    }
    
    return creep.pos.findClosestByPath(typeOrObjects, opts);
}

export const creepFindAvailablePos = (creep: Creep, target: AnyStructure, filterFn?: (pos: RoomPosition) => boolean) => {
    const terrain = target.room.getTerrain();
    const pos = [
        [0, 1], [0, -1], [1, 0], [-1, 0],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ].find(([dx, dy]) => {
        const pos = new RoomPosition(target.pos.x+dx, target.pos.y+dy, target.room.name);
        if (terrain.get(pos.x, pos.y) === TERRAIN_MASK_WALL) return false;
        if (pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType !== STRUCTURE_CONTAINER && s.structureType !== STRUCTURE_RAMPART && s.structureType !== STRUCTURE_ROAD)) return false;
        if (filterFn && !filterFn(pos)) return false;
        return true;
    });
    if (!pos) return null;
    const [nx, ny] = pos;
    return new RoomPosition(target.pos.x+nx, target.pos.y+ny, target.room.name);
}