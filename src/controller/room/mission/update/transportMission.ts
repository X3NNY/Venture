import { MISSION_TYPE, TRANSPORT_MISSION } from "@/constant/mission";
import { addMission } from "../pool";
import { getRoomResourceAmount } from "../../function/get";

// 能量运输任务
const updateEnergyMission = (room: Room) => {
    let energy = (room.storage?.store[RESOURCE_ENERGY]||0) + (room.terminal?.store[RESOURCE_ENERGY]||0);

    if (energy < 10000) return ;

    let source = null;
    
    // 从能量多的地方取
    if (room.storage && room.terminal) {
        source = room.storage.store[RESOURCE_ENERGY] > room.terminal.store[RESOURCE_ENERGY] ? room.storage : room.terminal;
    } else {
        source = room.storage || room.terminal;
    }
    if (!source) return ;

    if (room.spawn && room.energyAvailable < room.energyCapacityAvailable) {
        let spawns = room.spawn.filter(s => s?.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        let extensions = room.extension.filter(s => s?.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        const targets = spawns.concat(extensions as any[]);
        targets.forEach(s => {
            if (energy < s.store.getFreeCapacity(RESOURCE_ENERGY)) return ;
            energy -= s.store.getFreeCapacity(RESOURCE_ENERGY);
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.spawn, {
                source: source.id,
                target: s.id,
                pos: { x: s.pos.x, y: s.pos.y, roomName: s.pos.roomName },
                rType: RESOURCE_ENERGY,
                amount: s.store.getFreeCapacity(RESOURCE_ENERGY)
            });
        })
    }

    // 检查塔是否需要能量
    if (room.level >= 3 && room.tower) {
        const towers = room.tower.filter(t => t?.store.getFreeCapacity(RESOURCE_ENERGY) > 200);
        towers.forEach(t => {
            if (energy < t.store.getFreeCapacity(RESOURCE_ENERGY)) return ;
            energy -= t.store.getFreeCapacity(RESOURCE_ENERGY);
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.tower, {
                source: source.id,
                target: t.id,
                pos: { x: t.pos.x, y: t.pos.y, roomName: t.pos.roomName },
                rType: RESOURCE_ENERGY,
                amount: t.store.getFreeCapacity(RESOURCE_ENERGY)
            })
        })
    }

    if (energy < 10000) return ;

    if (Game.time % 50 === 0 && room.level >= 6 && room.lab) {
        const labs = room.lab.filter(lab => lab && lab.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
        labs.forEach(lab => {
            if (energy < lab.store.getFreeCapacity(RESOURCE_ENERGY)) return ;
            energy -= lab.store.getFreeCapacity(RESOURCE_ENERGY);
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab_energy, {
                source: source.id,
                target: lab.id,
                pos: { x: lab.pos.x, y: lab.pos.y, roomName: lab.pos.roomName },
                rType: RESOURCE_ENERGY,
                amount: lab.store.getFreeCapacity(RESOURCE_ENERGY)
            })
        })
    }
}

const updateLabBoostMission = (room: Room) => {
    if (!room.terminal) return ;

    const memory = Memory.RoomInfo[room.name].lab;
    if (!memory) return ;
    if (!room.lab || room.lab.length === 0) return ;

    if (!memory.boostQueue) memory.boostQueue = {};

    // 如果有boost队列，更新空闲lab
    if (Object.keys(memory.boostQueue).length) {
        // 筛选没有分配boost的lab
        room.lab
            .filter(lab => lab && !memory.BOOST[lab.id] &&
                lab.id !== memory.labA && lab.id !== memory.labB)
            .forEach(lab => {
                const mType = Object.keys(memory.boostQueue)[0] as MineralBoostConstant;
                memory.BOOST[lab.id] = {
                    mineral: mType,
                    amount: memory.boostQueue[mType]
                };
                delete memory.boostQueue[mType];
            })
    }

    if (!memory.BOOST) return ;

    // 根据boost类型填充lab
    room.lab.forEach(lab => {
        if (!lab) return ;
        let mType = memory.BOOST[lab.id]?.mineral;

        // 没有设置boost类型
        if (!mType) return;
        // 如果存在其他资源，先搬走
        if (lab.mineralType && lab.mineralType !== mType && lab.store[lab.mineralType] > 0) {
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.boost, {
                source: lab.id,
                target: room.storage.id,
                pos: lab.pos,
                rType: lab.mineralType,
                amount: lab.store[lab.mineralType]
            });
            return ;
        }

        if (mType) {
            // 化工厂不能是底物化工厂
            if (lab.id === memory.labA || lab.id === memory.labB) {
                delete memory.BOOST[lab.id];
                return ;
            }
            // boost数量完成了
            if ((memory.BOOST[lab.id].amount||0) <= 0) {
                delete memory.BOOST[lab.id];
                return ;
            }
            // 没有资源了
            const totalAmount = room.storage.store[mType] + room.terminal.store[mType] + room.lab.reduce((a,b) => a + (b.store[mType]||0), 0) + room.find(FIND_MY_CREEPS).reduce((a, b) => a + (b.store[mType]||0), 0);
            if (memory.BOOST[lab.id].amount > totalAmount) {
                memory.BOOST[lab.id].amount = totalAmount;
            }
        }

        let totalAmount = 3000;
        if (memory.BOOST[lab.id].amount) {
            totalAmount = Math.min(3000, memory.BOOST[lab.id].amount);
        }

        // 补充资源
        if (lab.store[mType] < totalAmount) {
            const target = [room.storage, room.terminal].find(s => s.store[mType] > 0);
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.boost, {
                source: target.id,
                target: lab.id,
                pos: lab.pos,
                rType: mType,
                amount: Math.min(totalAmount - lab.store[mType], target.store[mType])
            });
        }
    })
}

const updatePowerMission = (room: Room) => {
    if (room.level < 8 || !room.powerSpawn) return ;

    const center = Memory.RoomInfo[room.name].center;
    let pos;
    if (center) pos = new RoomPosition(center.x, center.y, room.name);
    if (center && room.powerSpawn.pos.inRangeTo(pos, 1)) return 1;

    const powerSpawn = room.powerSpawn;
    const needAmount = 100 - powerSpawn.store[RESOURCE_POWER];
    if (needAmount < 50) return ;

    const target = [room.storage, room.terminal].reduce((a, b) => {
        if (!a || !b) return a || b;
        if (a.store[RESOURCE_POWER] < b.store[RESOURCE_POWER]) return b;
        return a;
    }, null);

    if (!target || target.store[RESOURCE_POWER] === 0) return ;

    addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.power_spawn, {
        source: target.id,
        target: powerSpawn.id,
        pos: powerSpawn.pos,
        rType: RESOURCE_POWER,
        amount: Math.min(needAmount, target.store[RESOURCE_POWER])
    });
}

export const updateTransportMission = (room: Room) => {
    if (!room.storage) return ;

    updateEnergyMission(room);
    updatePowerMission(room);
    updateLabBoostMission(room);
}