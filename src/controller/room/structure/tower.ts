import { filter } from 'lodash';
import { calcTowerDamageToCreep } from "../function/calc";

/**
 * 寻找敌对目标
 * NOTICE: 仅在防御模式时运行
 * @param room 
 * @returns 
 */
const findHostile = (room: Room) => {
    if (!room.memory.defend) return false;

    if (!global.TowerTargets) global.TowerTargets = {};
    if (Game.time % 10 === 0) {
        global.TowerTargets[room.name] = room.find(FIND_HOSTILE_CREEPS).filter(c => !Memory.Whitelist?.includes(c.owner.username)).map(c => c.id);
    }

    // 如果没有目标
    if (!global.TowerTargets[room.name] ||
        global.TowerTargets[room.name].length === 0
    ) return false;

    const hostiles = (global.TowerTargets[room.name]||[]).map(id => Game.getObjectById(id)).filter(c => c && calcTowerDamageToCreep(room, c) > 0);

    // 随机攻击
    if (hostiles.length > 0) {
        room.tower.forEach(t => {
            const index = Math.floor(Math.random() * hostiles.length);
            t.attack(hostiles[index]);
        })
        return true;
    }
}

const findDamagedWall = (room: Room) => {
    const damagedWall = []
    if (room.memory.defend) {
        for (const e of room.getEventLog()) {
            if (e.event !== EVENT_ATTACK) continue;
            const target = Game.getObjectById(e.data.targetId as Id<Structure>);
            if (!target) continue;
            
            if (target.structureType === STRUCTURE_WALL ||
                target.structureType === STRUCTURE_RAMPART
            ) {
                damagedWall.push(target);
            }
        }
    }

    if (damagedWall.length > 0) {
        let target = null;
        if (damagedWall.length === 1) {
            target = damagedWall[0];
        } else {
            target = damagedWall.reduce((a, b) => a.hits < b.hits ? a : b);
        }

        roomStructureTower.repair(room, target, 200);
        return true;
    }
    return false;
}

const findNPC = (room: Room) => {
    if (!global.TowerAttackNPC) global.TowerAttackNPC = {};

    if (Game.time % 10 === 0) {
        global.TowerAttackNPC[room.name] = room.find(FIND_HOSTILE_CREEPS, { filter: c => c.owner.username === 'Source Keeper' || c.owner.username === 'Invader' }).map(c => c.id);
    }

    const hostiles = (global.TowerAttackNPC[room.name]||[]).map(id => Game.getObjectById(id)).filter(c => c && calcTowerDamageToCreep(room, c) > 0);

    // 随机攻击
    if (hostiles.length > 0) {
        room.tower.forEach(t => {
            const index = Math.floor(Math.random() * hostiles.length);
            t.attack(hostiles[index]);
        })
        return true;
    }
    return false;
}

const findDamagedCreep = (room: Room) => {
    if (!global.TowerHeal) global.TowerHeal = {};

    if (Game.time % 10 === 0) {
        global.TowerHeal[room.name] = room.find(FIND_MY_CREEPS, { filter: c => c.hits < c.hitsMax }).map(c => c.id);
    }

    const targets = (global.TowerHeal[room.name]||[]).map(id => Game.getObjectById(id)).filter(c => c && c.hits < c.hitsMax);

    if (targets.length > 0) {
        const attacker = targets.filter(c => c?.body.some(part => part === ATTACK || part === RANGED_ATTACK));

        if (attacker.length > 0) {
            room.tower.forEach(tower => {
                let index = Math.floor(Math.random() * attacker.length);
                tower.heal(attacker[index]);
            })
        } else {
            room.tower.forEach(tower => {
                let index = Math.floor(Math.random() * targets.length);
                tower.heal(targets[index]);
            })
        }
        return true;
    }
    return false;
}


const findDamagedStructure = (room: Room) => {
    // 仅在防御模式进行
    if (!room.memory.defend) return ;
    
    const structs = []

    // 查找被攻击的盾墙
    for (const e of room.getEventLog()) {
        if (e.event !== EVENT_ATTACK) continue;
        const target = Game.getObjectById(e.data.targetId as Id<Structure>);
        if (!target) continue;
        if (target.structureType === STRUCTURE_WALL ||
            target.structureType === STRUCTURE_RAMPART
        ) {
            structs.push(target);
        }
    }

    // 修复血最少的
    if (structs.length > 0) {
        let target = null;
        if (structs.length === 1) {
            target = structs[0];
        } else {
            target = structs.reduce((a, b) => a.hits < b.hits ? a : b);
        }
        roomStructureTower.repair(room, target, 200);
        return true;
    }
    return false;
}

export const roomStructureTower = {
    attack: (room: Room, hostile: Creep) => {
        room.tower.forEach(tower => {
            if (tower.store[RESOURCE_ENERGY] < 10) return ;
            tower.attack(hostile);
        })
    },
    repair: (room: Room, target: Structure, energy: number = 10) => {
        room.tower.forEach(tower => {
            if (tower.store[RESOURCE_ENERGY] < energy) return ;
            tower.repair(target);
        })
    },
    work: (room: Room) => {
        // 没有炮塔不处理
        if (!room.tower) return ;

        // 寻找敌对爬爬
        if (findHostile(room)) return ;
        
        // 修复破损盾墙
        if (findDamagedWall(room)) return ;

        // 攻击NPC
        if (findNPC(room)) return ;
        
        // 治疗己方爬爬
        if (findDamagedCreep(room)) return ;

        // 修复受损建筑
        if (findDamagedStructure(room)) return ;
    }
}