export const transmitCreepToIntershard = (creep: Creep, data: IntershardCreepData) => {
    if (Game.shard.name === data.targetShard) return true;

    const interData = global.intershardData;
    if (!interData['creep']) {
        interData['creep'] = {};
    }

    interData['creep'][creep.name] = {
        ...data,
        time: Game.time
    }
    return true;
}

export const receiveFromIntershard = () => {
    for (const shard of _.difference(['shard0', 'shard1', 'shard2', 'shard3'], [Game.shard.name])) {
        if (shard === Game.shard.name) continue;
        const data = JSON.parse(InterShardMemory.getRemote(shard)) || {};
        if (!data || !data['creep']) continue;

        if (!global.intershardData['creep']) {
            global.intershardData['creep'] = {}; 
        }
        for (const creepName in data['creep']) {
            if (data['creep'][creepName].targetShard === Game.shard.name ||
                (data['creep'][creepName].sourceShard[5]-data['creep'][creepName].targetShard[5] > 1)
            ) {
                global.intershardData['creep'][creepName] = {
                    ...data['creep'][creepName],
                    time: Game.time
                }
            }
        }
    } 
}

export const cleanIntershard = () => {
    for (const creepId in global.intershardData['creep']) {
        if (global.intershardData['creep'][creepId].time + 100 < Game.time) {
            delete global.intershardData['creep'][creepId];
        } 
    }
}

export const endInterShardManage = () => {
    if (!Game.cpu.generatePixel) return ;
    InterShardMemory.setLocal(
        JSON.stringify(
            global.intershardData
        ) || InterShardMemory.getLocal()
    )
    delete global.intershardData;
}

export const startInterShardManage = () => {
    if (!Game.cpu.generatePixel) return ;
    global.intershardData = JSON.parse(InterShardMemory.getLocal()) || {
        'creep': {}
    }
    receiveFromIntershard();
    cleanIntershard();
}