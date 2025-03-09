export const powerCreepOperateStorage = (pc: PowerCreep) => {
    if (!pc.powers[PWR_OPERATE_STORAGE]) return false;

    const storage = pc.room.storage;
    if (!storage) return false;
    if (pc.store[RESOURCE_OPS] < 100) return false;
    if (storage.store.getFreeCapacity() > 1000) return false;
    if (storage.effects && storage.effects.some(e => e.effect == PWR_OPERATE_STORAGE && e.ticksRemaining > 0)) return false;

    if (pc.powers[PWR_OPERATE_STORAGE].cooldown > 0) return false;
    if (pc.pos.inRangeTo(storage, 3)) {
        pc.usePower(PWR_OPERATE_STORAGE, storage); 
    } else {
        pc.moveTo(storage);
    }
    return true;
}

export const powerCreepOperateLab = (pc: PowerCreep) => {
    if (!pc.powers[PWR_OPERATE_LAB]) return false;
    if (!pc.room.lab) return false;
    if (pc.store[RESOURCE_OPS] < 10) return false;
    if (pc.powers[PWR_OPERATE_LAB].cooldown > 0) return false;

    const botmem =  Memory['RoomInfo'][pc.room.name];
    if (!botmem || !botmem.lab) return false; 
    if (!botmem.lab.labA ||!botmem.lab.labB) return false;
    const labA = Game.getObjectById(botmem.lab.labA);
    const labB = Game.getObjectById(botmem.lab.labB);
    if (!labA ||!labB) return false;
    const labAType = botmem.lab.labAType;
    const labBType = botmem.lab.labBType;
    if (!labAType ||!labBType ||
        labA.store[labAType] < 1000 || labB.store[labBType] < 1000
    ) return false;
    const product = REACTIONS[labAType][labBType];

    const lab = pc.room.lab.find(l => {
        if (l.id == botmem.lab.labA || l.id == botmem.lab.labB) return false;
        if (botmem.lab.BOOST[l.id]) return false;
        if (l.mineralType !== product) return false;
        return !l.effects || l.effects.every(e => e.effect!= PWR_OPERATE_LAB)
    });
    if (!lab) return false;
    if (pc.pos.inRangeTo(lab, 3)) {
        pc.usePower(PWR_OPERATE_LAB, lab); 
    } else {
        pc.moveTo(lab);
    }
    return true;
}

/**
 * 操作factory
 * @param pc
 * @returns
 * 
 * 1. 没有技能时不处理
 * 2. 没有factory时不处理
 * 3. 没有任务时不处理
 * 4. ops不足时不处理
 * 5. factory等级不匹配时不处理
 * 6. 资源不充足时不处理
 * 7. 已有效果未结束时不处理
 * 8. 等级匹配时不处理
*/
export const powerCreepOperateFactory = (pc: PowerCreep) => {
    // 没有技能时不处理
    if (!pc.powers[PWR_OPERATE_FACTORY]) return false;

    const factory = pc.room.factory;
    if (!factory) return false;

    const memory = Memory['RoomInfo'][pc.room.name];
    if (!memory || !memory.Factory?.product) return false;

    // 资源不充足时不处理
    if (pc.store[RESOURCE_OPS] < 100) return false;

    // factory等级不匹配时不处理
    if (!factory.level && (!memory.Factory?.level || memory.Factory.level <= 0))
        return false;

    // 化合物等级不匹配时不处理
    if (COMMODITIES[memory.Factory.product].level!== (factory.level || memory.Factory.level))
        return false;

    // 资源不充足时不处理
    const components = COMMODITIES[memory.Factory.product]?.components;
    for (const resource in components) {
        if (factory.store[resource] < components[resource]) return false;
    }

    // 已有效果未结束时不处理
    if (factory.effects && factory.effects.some(e => e.effect == PWR_OPERATE_FACTORY && e.ticksRemaining > 0)) return false;

    if (pc.powers[PWR_OPERATE_FACTORY].cooldown > 0) return false;

    // 等级匹配时不处理
    if (factory.level && factory.level !== pc.powers[PWR_OPERATE_FACTORY].level) return false;
    if (!factory.level && memory.Factory.level != pc.powers[PWR_OPERATE_FACTORY].level) return false;

    if (pc.pos.inRangeTo(factory, 3)) {
        pc.usePower(PWR_OPERATE_FACTORY, factory); 
    } else {
        pc.moveTo(factory);
    }
    return true;
}


export const powerCreepOperateExtension = (pc: PowerCreep) => {
    if (!pc.powers[PWR_OPERATE_EXTENSION]) return false;

    if (!pc.room.storage) return false;

    // ops不足时不处理
    if (pc.store[RESOURCE_OPS] < 2) return false;

    // 能量不足时不处理
    if (pc.room.energyAvailable > pc.room.energyCapacityAvailable / 2) return false;

    // 冷却未结束时不处理
    if (pc.powers[PWR_OPERATE_EXTENSION].cooldown > 0) return false;

    const target = pc.room.storage;

    // 能量不足时不处理
    if (!target || target.store.energy < 10000) return false;

    if (pc.pos.inRangeTo(target, 3)) {
        pc.usePower(PWR_OPERATE_EXTENSION, target); 
    } else {
        pc.moveTo(target);
    }
    return true;
}

export const powerCreepOperateTower = (pc: PowerCreep) => {
    if (!pc.powers[PWR_OPERATE_TOWER]) return false;

    if (!pc.room.memory.defend) return false;

    // ops不足时不处理
    if (pc.store[RESOURCE_OPS] < 10) return false;

    // 冷却未结束时不处理
    if (pc.powers[PWR_OPERATE_TOWER].cooldown > 0) return false;

    const towers = pc.room.tower;
    if (!towers) return false;

    const tower = towers.find(t => {
        if (t.effects) return false;
        if (t.effects.some(e => e.effect === PWR_OPERATE_TOWER && e.ticksRemaining > 0)) return false;
        return true;
    });
    if (!tower) return false;

    if (pc.pos.inRangeTo(tower, 3)) {
        pc.usePower(PWR_OPERATE_TOWER, tower); 
    } else {
        pc.moveTo(tower);
    }
    return true;
}



export const powerCreepOperateSpawn = (pc: PowerCreep) => {
    if (!pc.powers[PWR_OPERATE_SPAWN]) return false;

    const spawns = pc.room.spawn; 
    if (!spawns) return false;

    // ops不足时不处理
    if (pc.store[RESOURCE_OPS] < 100) return false;

    const roles = ['powerAttacker', 'powerHealer', 'powerCarrier', 'powerDefender', 'powerHarvester', 'depositHarvester', 'depositCarrier'];

    if (!pc.memory.upspawn &&
        (Memory.RoomInfo[pc.room.name].OutMineral.highway.length === 0)
    ) {
        return false;
    }

    if (pc.powers[PWR_OPERATE_SPAWN].cooldown > 0) return false;

    const spawn = spawns.find(s => {
        if (s.effects) return false;
        if (s.effects.some(e => e.effect === PWR_OPERATE_SPAWN && e.ticksRemaining > 0)) return false;
        return true;
    });

    if (!spawn) return false;

    if (pc.pos.inRangeTo(spawn, 3)) {
        pc.usePower(PWR_OPERATE_SPAWN, spawn);  
    } else {
        pc.moveTo(spawn); 
    }
    return true;
}

export const powerCreepOperatePower = (pc: PowerCreep) => {
    if (!pc.powers[PWR_OPERATE_POWER]) return false;

    const powerSpawn = pc.room.powerSpawn; 
    if (!powerSpawn) return false;

    const mem = Memory['RoomInfo'][pc.room.name];
    if (!mem || !mem.powerSpawn?.open) return false;

    
    if (powerSpawn.effects && powerSpawn.effects.some(e => e.effect === PWR_OPERATE_POWER && e.ticksRemaining > 0)) return false;

    if (pc.powers[PWR_OPERATE_POWER].cooldown > 0) return false;

    if (pc.pos.inRangeTo(powerSpawn, 3)) {
        pc.usePower(PWR_OPERATE_POWER, powerSpawn); 
    } else {
        pc.moveTo(powerSpawn);
    }
    return true;
}

export const powerCreepRegenSource = (pc: PowerCreep) => {
    if (!pc.powers[PWR_REGEN_SOURCE]) return false;

    if (pc.powers[PWR_REGEN_SOURCE].cooldown > 0) return false;

    const sources = pc.room.source;
    if (!sources) return false;

    const source = sources.find(s => {
        if (s.effects) return false;
        if (s.effects.some(e => e.effect === PWR_REGEN_SOURCE && e.ticksRemaining > 0)) return false;
        return true;  
    })
    if (!source) return false;

    if (pc.pos.inRangeTo(source, 3)) {
        pc.usePower(PWR_REGEN_SOURCE, source);  
    } else {
        pc.moveTo(source);
    }
    return true;
}

export const powerCreepTransferPower = (pc: PowerCreep) => {
    const mem = Memory['RoomInfo'][pc.room.name];
    if (!mem ||!mem.powerSpawn?.open) return false;
    
    const powerSpawn = pc.room.powerSpawn;
    if (!powerSpawn) return false;
    const storage = pc.room.storage;
    if (!storage) return false;

    if (storage.store[RESOURCE_POWER] < 100) return false;
    if (storage.store[RESOURCE_ENERGY] < 10000) return false;

    if (pc.pos.isNearTo(powerSpawn)) {
        if (powerSpawn.store[RESOURCE_POWER] < 50 && pc.store[RESOURCE_POWER] > 0) {
            pc.transfer(powerSpawn, RESOURCE_POWER);
            return true;
        }
    }

    if (pc.pos.isNearTo(storage)) {
        if (powerSpawn.store[RESOURCE_POWER] > 60 && pc.store[RESOURCE_POWER] > 0) {
            pc.transfer(storage, RESOURCE_POWER);
            return true;
        }
        if (powerSpawn.store[RESOURCE_POWER] < 50 && pc.store[RESOURCE_POWER] === 0) {
            pc.withdraw(storage, RESOURCE_POWER, 100);
            return true;
        }
    }

    if (powerSpawn.store[RESOURCE_POWER] < 50 && pc.store[RESOURCE_POWER] > 0) {
        pc.moveTo(powerSpawn);
        return true;
    }
    if ((powerSpawn.store[RESOURCE_POWER] > 60 && pc.store[RESOURCE_POWER] > 0) ||
        (powerSpawn.store[RESOURCE_POWER] < 50 && pc.store[RESOURCE_POWER] === 0)
    ) {
        pc.moveTo(storage);
        return true;
    }
    return false;
}