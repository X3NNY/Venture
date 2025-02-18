import { creepMoveTo } from "../../function/move";

export default {
    prepare: (creep: Creep) => {
        const squadName = creep.memory['squad'];
        const squad = Memory.SquadInfo[squadName];
        if (!squad) return false;
        // 绑定位置
        if (!creep.memory.union) {
            if (!squad.creeps.A) squad.creeps.A = creep.id;
            else if (!squad.creeps.C) squad.creeps.C = creep.id;
            else return false;
            
            creep.memory.union = true;
        }
        // 还没集结完毕
        if (!squad.assemble) {
            if (!creep.pos.inRangeTo(25, 25, 5)) {
                creepMoveTo(creep, creep.room.getPositionAt(25, 25), { range: 5});
            }
            return false;
        }
        return true;
    },
    action: (creep: Creep) => {
        if (creep.room.name !== creep.memory.targetRoom) {

        }
    }
}