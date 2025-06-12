import { CreepRoleBody } from "@/constant/creep";
import { CreepNameConstant } from "@/constant/creepName";

export function GenSortNumber() {
    return (Game.time*1296 + Math.floor(Math.random()*1296)).toString(36).slice(-4).toUpperCase();
}

export const generateCreepName = (code: string) => {
    const number = GenSortNumber();
    const index = Math.floor(Game.time * Math.random() * 1000) % CreepNameConstant.length;
    const name = `[${CreepNameConstant[index]}]${code}#${number}`;
    if (Game.creeps[name]) {
        return generateCreepName(code);
    } else {
        return name;
    }
}

export const calcCreepBodyEnergy = (body: string[]) => {
    let sum = 0;
    for (let part of body) {
        if (part == WORK)           sum += 100;
        if (part == CARRY)          sum += 50;
        if (part == MOVE)           sum += 50;
        if (part == ATTACK)         sum += 80;
        if (part == RANGED_ATTACK)  sum += 150;
        if (part == HEAL)           sum += 250;
        if (part == CLAIM)          sum += 600;
        if (part == TOUGH)          sum += 10;
    }
    return sum;
}

const PART_LEVEL = {
    'tough': 0, 'work': 1, 'attack': 4, 'carry': 2, 'move': 3, 'ranged_attack': 5, 'heal': 6, 'claim': 7
}

const getCreepRoleMoveCount = (allRoad: boolean, bodyCount: number, moveType: string = 'normal') => {
    if (moveType === 'nope') return 0;
    if (moveType === 'full') return bodyCount;
    
    return allRoad ? Math.ceil(bodyCount/2) : bodyCount;
}

export const getCreepRoleBody = (room: Room, role: string, options?: any) => {
    if (!options) options = {}
    let level = room.level;
    let body: any[];
    let moveParts: number; 
    const maxEnergy = options.now ? room.energyAvailable : room.energyCapacityAvailable;

    if (room.level == 8 && options.body) {
        return CreepRoleBody[role][level][options.body];
    }

    if (room.level > 2 && room.source.length < 2 && (room.storage?.store[RESOURCE_ENERGY]||0) < 10000) {
        level -= 1;
    }

    const allRoad = room.road.length >= (room.level >= 8 ? 30 : 50);

    if (CreepRoleBody[role]) {
        while (level >= 1) {
            if (options.upbody && CreepRoleBody[role][level].upbody) body = CreepRoleBody[role][level].upbody;
            else body = CreepRoleBody[role][level].body;
            moveParts = getCreepRoleMoveCount(allRoad, body.length, options.move || CreepRoleBody[role][level].move);
            if (maxEnergy >= calcCreepBodyEnergy(body) + moveParts * 50) break;
            level --;
        }
        if (level === 0) return [];
    }

    body = Object.assign([], body);
    if (moveParts > 2) {
        body = body.sort((a, b) => PART_LEVEL[a] - PART_LEVEL[b]);
        for (let i = 0; i < moveParts-2; i++) {
            body.splice(i*2, 0, MOVE);
        }
        body.push(...[MOVE, MOVE]);
    } else if (moveParts > 0) {
        for (let i = 0; i < moveParts; i++) {
            body.push(MOVE);
        }
        body = body.sort((a, b) => PART_LEVEL[a] - PART_LEVEL[b]);
    }
    return body;
}