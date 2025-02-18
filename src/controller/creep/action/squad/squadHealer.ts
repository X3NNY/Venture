export default {
    prepare: (creep: Creep) => {
        if (!creep.memory.union) {
            const squadName = creep.memory['squad'];
            const squad = Memory.SquadInfo[squadName];
            if (!squad) return false;

            if (!squad.creeps.B) squad.creeps.B = creep.id;
            else if (!squad.creeps.D) squad.creeps.D = creep.id;
            else return false;
            
            creep.memory.union = true;
        }
        return true;
    },
    action: (creep: Creep) => {
        
    }
}