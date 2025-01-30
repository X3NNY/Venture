import { creepActionRun } from "./action";

export const eventLoop = (creep: Creep) => {
    if (!creep || creep.spawning) return;

    // const start = Game.cpu.getUsed();
    creepActionRun(creep);
    // console.log(creep.name, 'use CPU:', Game.cpu.getUsed()-start);
}