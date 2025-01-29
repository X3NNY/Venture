import { creepActionRun } from "./action";

export const eventLoop = (creep: Creep) => {
    if (!creep || creep.spawning) return;

    creepActionRun(creep);
}