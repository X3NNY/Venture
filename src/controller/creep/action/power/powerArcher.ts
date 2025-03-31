import { CREEP_ROLE } from "@/constant/creep";
import { creepMoveToRoom, getDirection } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {};
        if (!creep.memory.notified) {
            creep.notifyWhenAttacked(false);
            creep.memory.notified = true; 
        }

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            if (creep.hits < creep.hitsMax) creep.heal(creep);
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        let isHeal = false, isRanged = false, isMove = false;

        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            if (creep.hits < creep.hitsMax) creep.heal(creep);
            return false;
        }

        if (creep.hits < creep.hitsMax) {
            creep.heal(creep);
            isHeal = true;
        }

        const hostileCreeps = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 8, { filter: c => c.body.some(p => p.type === HEAL || p.type === ATTACK || p.type === RANGED_ATTACK || p.type === CARRY )});

        if (hostileCreeps.length > 0) {
            const healer = hostileCreeps.find(c => c.body.some(p => p.type === HEAL));
            const attacker = hostileCreeps.find(c => c.body.some(p => p.type === ATTACK));
            const target = healer || attacker || hostileCreeps[0];

            if (target && !creep.pos.inRangeTo(target, 3)) {
                creep.moveTo(target, { ignoreCreeps: false, range: 3});
                isMove = true;
            }
            if (target && creep.pos.inRangeTo(target, 2) && target.getActiveBodyparts(ATTACK) > 0) {
                const terrain = creep.room.getTerrain();
                let dire = getDirection(target.pos, creep.pos);
                // if (dire === TOP && terrain.get(creep.pos.x, creep.pos.y-1) === TERRAIN_MASK_WALL) {
                //     if (terrain.get(creep.pos.x-1, creep.pos.y-1) !== TERRAIN_MASK_WALL) {
                //         dire = TOP_LEFT;
                //     } else if (terrain.get(creep.pos.x+1, creep.pos.y-1)!== TERRAIN_MASK_WALL) {
                //         dire = TOP_RIGHT;
                //     } else {
                //         dire = [RIGHT, LEFT][Math.floor(Math.random()*2)];
                //     }
                // } else if (dire === BOTTOM && terrain.get(creep.pos.x, creep.pos.y+1) === TERRAIN_MASK_WALL) {
                //     if (terrain.get(creep.pos.x-1, creep.pos.y+1)!== TERRAIN_MASK_WALL) {
                //         dire = BOTTOM_LEFT; 
                //     } else if (terrain.get(creep.pos.x+1, creep.pos.y+1)!== TERRAIN_MASK_WALL) {
                //         dire = BOTTOM_RIGHT; 
                //     } else {
                //         dire = [RIGHT, LEFT][Math.floor(Math.random()*2)]; 
                //     }
                // } else if ()
                const res = creep.move(dire);
                if (res !== OK) {
                    const DIRECTION_OFFSET = {
                        [TOP]: [0, -1],
                        [BOTTOM]: [0, 1],
                        [LEFT]: [-1, 0], 
                        [RIGHT]: [1, 0],
                        [TOP_LEFT]: [-1, -1],
                        [TOP_RIGHT]: [1, -1],
                        [BOTTOM_LEFT]: [-1, 1],
                        [BOTTOM_RIGHT]: [1, 1]
                    }
                    const availableDirect = [TOP, BOTTOM, LEFT, RIGHT, TOP_LEFT, TOP_RIGHT, BOTTOM_LEFT, BOTTOM_RIGHT].filter(d => d !== dire && terrain.get(creep.pos.x+DIRECTION_OFFSET[d][0], creep.pos.y+DIRECTION_OFFSET[d][1]) !== TERRAIN_MASK_WALL);
                    creep.move(availableDirect[Math.floor(Math.random()*availableDirect.length)])
                }
                isMove = true;
            }
            const rangeHostiles = hostileCreeps.filter(c => creep.pos.inRangeTo(c, 3));
            if (rangeHostiles.length >= 10 ||
                rangeHostiles.filter(c => creep.pos.inRangeTo(c, 2)).length >= 3 ||
                rangeHostiles.filter(c => creep.pos.inRangeTo(c, 1)).length >= 1
            ) {
                creep.rangedMassAttack();
                isRanged = true;
            } else {
                const rangeHealer = rangeHostiles.find(c => c.body.some(p => p.type === HEAL));
                const rangeAttacker = rangeHostiles.find(c => c.body.some(p => p.type === ATTACK));
                const rangeTarget = rangeHealer || rangeAttacker || rangeHostiles[0];

                if (rangeTarget) {
                    creep.rangedAttack(rangeTarget);
                    isRanged = true;
                }
            }
        }

        if (!isHeal || !isMove || !isRanged) {
            const myCreeps = creep.room.find(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax && (creep.pos.inRangeTo(c, 3) || c.memory.role === CREEP_ROLE.POWER_ARCHER)});

            if (!isHeal) {
                const healTarget = myCreeps.find(c => creep.pos.inRangeTo(c, 1));
                if (healTarget) creep.heal(healTarget);
            } else if (myCreeps.length > 0) {
                const target = creep.pos.findClosestByRange(myCreeps);
                if (!isMove) creep.moveTo(target, { ignoreCreeps: false });
                if (!isRanged && creep.pos.isNearTo(target)) creep.rangedHeal(target)
            }
        }

        if (isHeal || isMove || isRanged) return ;

        const powerbank = creep.room.powerBank?.[0] ?? creep.room.find(FIND_STRUCTURES, { filter: s => s.structureType === STRUCTURE_POWER_BANK})[0];

        if (powerbank) {
            if (creep.pos.inRangeTo(powerbank, 3)) {
                creep.rangedAttack(powerbank);
                creep.heal(creep);
            } else {
                creep.moveTo(powerbank, { range: 3, ignoreCreeps: false });
            }
            return ;
        }

        if (creep.room.deposit) creep.moveTo(creep.room.deposit[0], { range: 3, ignoreCreeps: false })

        // if (Game.time % 10 === 0) {
        //     creep.suicide();
        // }
    }
}