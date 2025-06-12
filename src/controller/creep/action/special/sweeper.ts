import { creepMoveTo, creepMoveToRoom } from "../../function/move";
import { creepIsOnEdge } from "../../function/position";

export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.cache) creep.memory.cache = { exclude: [], standby: 0 }
        if (creep.room.name !== creep.memory.targetRoom || creepIsOnEdge(creep)) {
            creepMoveToRoom(creep, creep.memory.targetRoom);
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        if (creep.room.my) return ;

        if (!creep.memory.cache.targetId) {
            // 每k tick检测一次
            if (Game.time % (creep.memory.cache.standby+1)) return;
            let target;
            const structs = creep.room.find(FIND_STRUCTURES, {
                filter: (s: any) => s.hits && s.hits > 0 && s.hits < 5e4 &&
                    s.structureType !== STRUCTURE_ROAD &&
                    (!s.store || s.store.getUsedCapacity() < 1000) &&
                    !creep.memory.cache.exclude?.includes(s.id)
            });
            if (structs.length > 0) target = creep.pos.findClosestByRange(structs);

            if (!target) {
                const flags = creep.room.find(FIND_FLAGS, { filter: flag => flag.name.startsWith('SWEEP')});
                if (flags.length > 0) {
                    for (const flag of flags) {
                        target = flag.pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType !== STRUCTURE_ROAD && !creep.memory.cache.exclude?.includes(s.id));

                        if (target) break;
                    }
                }
            }

            if (target) {
                const result = creep.moveTo(target, { maxRooms: 1, range: 1 });
                if (result === ERR_NO_PATH) {
                    creep.memory.cache.exclude?.push(target.id);
                }
                creep.memory.cache.targetId = target.id;
                creep.memory.cache.standby = 0;
                return ;
            }
            creep.memory.cache.standby += 1;
        }

        const target = Game.getObjectById(creep.memory.cache.targetId) as Structure;

        if (!target) {
            delete creep.memory.cache.targetId;
            creep.memory.cache.standby = 0;
            return ;
        }

        const result = creep.dismantle(target);
        if (result === ERR_NOT_IN_RANGE) {
            creepMoveTo(creep, target, { maxRooms: 1, range: 1 });
        }
    }
}