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

const updateLabMission = (room: Room) => {
    if (!room.lab || room.lab.length === 0) return ;

    const memory = Memory.RoomInfo[room.name].lab;
    if (!memory) return ;
    if (!memory.BOOST) memory.BOOST = {};

    // 化工厂不工作时候取走资源
    if (!memory || !memory.labA || !memory.labB ||
        !memory.labAType || !memory.labBType
    ) {
        room.lab.forEach(lab => {
            if (memory.BOOST[lab.id]) return ;

            if (!lab.store[lab.mineralType] || lab.store[lab.mineralType] === 0) return ;
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                source: lab.id,
                target: room.storage.id,
                pos: lab.pos,
                rType: lab.mineralType,
                amount: lab.store[lab.mineralType]
            })
        })
        return ;
    }

    const labA = Game.getObjectById(memory.labA);
    const labB = Game.getObjectById(memory.labB);
    const labAType = memory.labAType;
    const labBType = memory.labBType;

    // 转走不正确的资源
    [[labA, labAType], [labB, labBType]].forEach(([lab, rType]: [StructureLab, MineralConstant]) => {
        if (!lab.mineralType || lab.mineralType === rType) return ;
        if (!lab.store[lab.mineralType] || lab.store[lab.mineralType] === 0) return ;

        addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
            source: lab.id,
            target: room.storage.id,
            pos: lab.pos,
            rType: lab.mineralType,
            amount: lab.store[lab.mineralType]
        });
    });

    // 检查化工厂是否需要添加资源
    [[labA, labAType], [labB, labBType]].forEach(([lab, rType]: [StructureLab, MineralConstant]) => {
        if (lab.mineralType && lab.mineralType !== rType) return ;
        if (lab.store.getFreeCapacity(rType) < 1000) return ;
        if (getRoomResourceAmount(room, rType) < 1000) return ;

        const target = [room.storage, room.terminal].find(s => s.store[rType] > 0);
        addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
            source: target.id,
            target: lab.id,
            pos: lab.pos,
            rType,
            amount: Math.min(lab.store.getFreeCapacity(rType), target.store[rType])
        });
    });

    room.lab.forEach(lab => {
        if (!lab) return ;
        if (lab.id === labA.id || lab.id === labB.id ||
            memory.BOOST[lab.id]
        ) return ;
        if (!lab.store[lab.mineralType] || lab.store[lab.mineralType] === 0) return ;
        // 从已满的化工厂取走产物
        if (lab.store.getFreeCapacity(lab.mineralType) < 100) {
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                source: lab.id,
                target: room.storage.id,
                pos: lab.pos,
                rType: lab.mineralType,
                amount: lab.store[lab.mineralType]
            });
        }
        // 如果lab的资源与产物不同，则取走
        else if (lab.mineralType !== REACTIONS[labAType][labAType]) {
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                source: lab.id,
                target: room.storage.id,
                pos: lab.pos,
                rType: lab.mineralType,
                amount: lab.store[lab.mineralType]
            });
        }
    })
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
        if (lab.mineralType !== mType && lab.store[lab.mineralType] > 0) {
            addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.boost, {
                source: lab.store,
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

export const updateTransportMission = (room: Room) => {
    const storage = room.storage;
    if (!storage) return ;

    updateEnergyMission(room);
    // updateLabMission(room);
    updateLabBoostMission(room);
}