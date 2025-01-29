export const endClean = () => {
    if (Game.time % 50 === 0) {
        cleanMemory();
    }
}

const cleanMemory = () => {
    for (const name in Memory.creeps) {
        if (Game.creeps[name]) continue;
        delete Memory.creeps[name]
    }
}