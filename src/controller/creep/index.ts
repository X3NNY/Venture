import { creepActionRun } from "./action";

export const eventLoop = (creep: Creep) => {
    if (!creep) return;

    if (creep.spawning) {
        creep.room.visual.text(`${creep.memory.role}`, creep.pos.x, creep.pos.y, {color: '#ffffff', font: 0.5, align: 'center', stroke: '#ff9900' });
        return ;
    }

    // 跨shard找回记忆
    if (!creep.memory.role) {
        // if (Game.shard.name === 'shard2')
        //     console.log(creep.name, JSON.stringify(global.intershardData['creep']?.[creep.name]))
        if (global.intershardData['creep']?.[creep.name]) {
            creep.memory = global.intershardData['creep'][creep.name].creepMemory;
            delete global.intershardData['creep'][creep.name];
        }
        return ;
    }

    // const start = Game.cpu.getUsed();
    creepActionRun(creep);
    // console.log(creep.name, 'use CPU:', Game.cpu.getUsed()-start);
}