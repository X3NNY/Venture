import { roomStructureTower } from "@/controller/room/structure/tower";
import { creepMoveTo } from "../../function/move";

const creepDefendAttackerActions = {
    patrol: (creep: Creep) => {
        const hostiles = Game.rooms[creep.room.name].find(FIND_HOSTILE_CREEPS);
        if (hostiles.length === 0) return ;

        const ramparts = creep.room.rampart.filter(r => {
            const structs = creep.room.lookForAt(LOOK_STRUCTURES, r.pos);

            if (structs.length && structs.some(s =>
                s.structureType !== STRUCTURE_RAMPART &&
                s.structureType !== STRUCTURE_ROAD &&
                s.structureType !== STRUCTURE_CONTAINER
            )) {
                return false;
            }
            return r.hits >= 6e5;
        });

        let minDist = Infinity;
        let targetRampart = null
        for (const rampart of ramparts) {
            const dist = rampart.pos.getRangeTo(hostiles[0].pos);
            if (dist < minDist) {
                minDist = dist;
                targetRampart = rampart;
            }
        }

        if (targetRampart) {
            creepMoveTo(creep, targetRampart.pos)
        }

        const target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (target) {
            const hasAttackPart = creep.body.some(part => part.type === ATTACK);
            const hasRangedAttackPard = creep.body.some(part => part.type === RANGED_ATTACK);

            if (hasAttackPart && !hasRangedAttackPard ||
                (hasAttackPart && hasRangedAttackPard && creep.pos.getRangeTo(target) <= 3)
            ) {
                const result = creep.attack(target);
                if (result === OK) roomStructureTower.attack(creep.room, target);
            } else if (hasAttackPart) {
                const result = creep.rangedAttack(target);
                if (result === OK) roomStructureTower.attack(creep.room, target);
            }
        }
    }
}

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = {}
        creep.memory.action = 'patrol'
        return true;
    },
    action: (creep: Creep) => {
        switch(creep.memory.action) {
            case 'patrol':              creepDefendAttackerActions.patrol(creep); break;
        }
    },
    done: (creep: Creep, res: any) => {

    }
}