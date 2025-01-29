import { CreepRoleBody } from "@/constant/creep";
import { CreepNameConstant } from "@/constant/creepName";

export function GenSortNumber() {
    return (Game.time*1296 + Math.floor(Math.random()*1296)).toString(36).slice(-4).toUpperCase();
}

export const generateCreepName = (code: string) => {
    const number = GenSortNumber();
    const index = Math.floor(Game.time * Math.random() * 1000) % CreepNameConstant.length;
    const name = `【${CreepNameConstant[index]}】${code}#${number}`;
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
    'tough': 0, 'work': 1, 'carry': 2, 'move': 3, 'attack': 4, 'ranged_attack': 5, 'heal': 6, 'claim': 7
}

export const getCreepRoleBody = (room: Room, role: string, now: boolean = false) => {
    let level = room.level;
    let body: any[];
    const maxEnergy = now ? room.energyAvailable : room.energyCapacityAvailable;

    const allRoad = room.road.length > 100;

    if (CreepRoleBody[role]) {
        while (level >= 1) {
            body = Object.assign([], CreepRoleBody[role][level].body);
            const moveCost = (allRoad ? Math.ceil(body.length/2) : body.length) * 50;
            if (maxEnergy >= calcCreepBodyEnergy(body) + moveCost) break;
            level --;
        }
        if (level === 0) return [];
    }

    const moveParts = allRoad ? Math.ceil(body.length/2) : body.length;
    if (moveParts > 2) {
        for (let i = 0; i < moveParts-2; i++) {
            body.push(MOVE);
        }
        body = body.sort((a, b) => PART_LEVEL[a] - PART_LEVEL[b]);
        body.push(...[MOVE, MOVE]);
    } else {
        for (let i = 0; i < moveParts; i++) {
            body.push(MOVE);
        }
        body = body.sort((a, b) => PART_LEVEL[a] - PART_LEVEL[b]);
    }
    return body;
}