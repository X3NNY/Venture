import { MANAGE_MISSION, MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { addMission, countMission } from "../mission/pool";
import { getRoomResourceAmount } from "../function/get";
import { factoryBlacklist, FactoryTarget, Goods, ResourceBarMap } from "@/constant/resource";
import { FACTORY_STATE } from "@/constant/structure";

/**
 * 计算合成物需要多少底物材料
 * @param product
 * @param amount
 */
const factoryCalcRctAmount = (product: CommodityConstant, amount: number, rType: ResourceConstant) => {
    const rcts = COMMODITIES[product].components;
    return rcts[rType] * Math.ceil(amount / COMMODITIES[product].amount);
}

const factorySleep = (room: Room, time: number) => {
    Memory.RoomInfo[room.name].Factory.wakeup = Game.time + time;
}

const factoryWakeup = (room: Room) => {
    delete Memory.RoomInfo[room.name].Factory.wakeup;
}

const factoryGetTarget = (room: Room) => {
    const task = Memory.RoomInfo[room.name]?.Factory.autoQueue?.[0];

    if (!task) return ;

    if (factoryBlacklist.includes(task.product as MineralConstant) || !(task.product in COMMODITIES)) {
        Memory.RoomInfo[room.name].Factory.autoQueue.shift()
        return ;
    }

    // 底物
    const rcts = COMMODITIES[task.product].components;
    for (const rType in rcts) {
        const amount = factoryCalcRctAmount(task.product, task.amount, rType as ResourceConstant)
        if (factoryBlacklist.includes(rType as MineralConstant) || !(rType in COMMODITIES)) {
            // if (getRoomResourceAmount(Game.rooms[room.name], rType) < amount) {
            //     if (Object.keys(Memory.Resource[rType]).find(roomName => {
            //         if (getRoomResourceAmount(Game.rooms[roomName], rType) > Memory.Resource[rType][roomName]) {
            //             return true;
            //         }
            //     })) {
            //         addMission(room, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.request, {
            //             rType: rType as ResourceConstant,
            //             amount: amount - room.terminal.store[rType],
            //         })
            //     }
            // }
            
            continue;
        }
        

        if (getRoomResourceAmount(room, rType) < amount) {
            // 等级不匹配，发起共享任务
            if (COMMODITIES[rType].level && COMMODITIES[rType].level !== room.factory.level) {
                addMission(room, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.request, {
                    rType: rType as ResourceConstant,
                    amount: amount - room.terminal.store[rType],
                })
                if (Memory.RoomInfo[room.name].Factory.autoQueue.length <= 1) {
                    factorySleep(room, 50);
                }
            } else {
                if (!Memory.RoomInfo[room.name].Factory.autoQueue.find(t => t.product === rType)) {
                    Memory.RoomInfo[room.name].Factory.autoQueue.push({
                        product: rType as CommodityConstant,
                        amount: amount - room.terminal.store[rType],
                    })
                }
            }
            // 重排任务
            Memory.RoomInfo[room.name].Factory.autoQueue.shift()
            Memory.RoomInfo[room.name].Factory.autoQueue.push(task)
            return ;
        }
    }
    Memory.RoomInfo[room.name].Factory.product = task.product;
    Memory.RoomInfo[room.name].Factory.amount = task.amount;
    Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.LOAD;
}

const factoryGetResource = (room: Room) => {
    const product = Memory.RoomInfo[room.name].Factory?.product;
    const amount = Memory.RoomInfo[room.name].Factory?.amount;

    if (!product) {
        Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.IDLE;
        return ;
    }

    if (!Memory.RoomInfo[room.name].Factory.loadtime) {
        Memory.RoomInfo[room.name].Factory.loadtime = Game.time;
    }
    if (Game.time - Memory.RoomInfo[room.name].Factory.loadtime > 300) {
        const task = Memory.RoomInfo[room.name]?.Factory.autoQueue?.[0];
        Memory.RoomInfo[room.name].Factory.autoQueue.shift();
        Memory.RoomInfo[room.name].Factory.autoQueue.push(task);
        Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.IDLE;
        delete Memory.RoomInfo[room.name].Factory.loadtime;
        return ;
    }

    const rcts = COMMODITIES[product].components;
    for (const rType in rcts) {
        if (room.factory.store[rType] < rcts[rType]) {
            const mType = rType === RESOURCE_ENERGY ? MANAGE_MISSION.s2f : MANAGE_MISSION.t2f;
            let needAmount = factoryCalcRctAmount(product, amount, rType as ResourceConstant) - room.factory.store[rType];

            if (mType === MANAGE_MISSION.t2f) {
                if (room.terminal.store[rType]) {
                    const maxAmount = Math.min(room.terminal.store[rType], needAmount)
                    addMission(room, MISSION_TYPE.MANAGE, mType, { rType, amount: maxAmount });
                    needAmount -= maxAmount;
                }
                if (needAmount > 0) {
                    if ((room.storage?.store[rType]||0) > needAmount) {
                        addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.s2t, { rType, amount: needAmount });
                    } else {
                        addMission(room, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.request, {
                            rType: rType as ResourceConstant,
                            amount: needAmount,
                        })
                        factorySleep(room, 30);
                    }
                }
            } else {
                addMission(room, MISSION_TYPE.MANAGE, mType, { rType, amount: needAmount });
            }
            return ;
        }
    }
    delete Memory.RoomInfo[room.name].Factory.loadtime;
    Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.WORK;
}

const factoryProduceCheck = (room: Room) => {
    const product = Memory.RoomInfo[room.name].Factory?.product;
    if (!product) {
        return false;
    }

    const rcts = COMMODITIES[product].components;
    for (const rType in rcts) {
        if (room.factory.store[rType] < rcts[rType]) return false; 
    }
    return true;
}

const factoryWork = (room: Room) => {
    if (room.factory.cooldown !== 0) {
        if (Memory.RoomInfo[room.name].Factory.produceCheck) {
            if (!factoryProduceCheck(room)) {
                Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.TAKE;
                delete Memory.RoomInfo[room.name].Factory.produceCheck;
            }
        }
        return ;
    }

    const product = Memory.RoomInfo[room.name].Factory?.product;
    if (!product) {
        Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.IDLE;
        return ;
    }

    const res = room.factory.produce(product);

    // 生成生产
    if (res === OK) {
        Memory.RoomInfo[room.name].Factory.produceCheck = true;
        // Memory.RoomInfo[room.name].Factory.amount -= COMMODITIES[product].amount;
    }
    // 底物不足
    else if (res === ERR_NOT_ENOUGH_RESOURCES) {
        Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.TAKE;
    }
    // 缺少超能
    else if (res === ERR_INVALID_TARGET || res === ERR_BUSY) {
        // factoryGetPower(room);
        factorySleep(room, 50);
    } else {
        console.log(`[${room.name}] 工厂生产失败，错误码：${res}`)
    }
}

const factoryTakeResource = (room: Room) => {
    if (countMission(room, MISSION_TYPE.MANAGE, m => m.data.source === room.factory.id) > 0) {
        return ;
    }

    const product = Memory.RoomInfo[room.name].Factory?.product;
    if (!product) {
        Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.IDLE;
        return ;
    }

    for (const rType in room.factory.store) {
        // if (rType === task.product) 
        const mType = rType === RESOURCE_ENERGY ? MANAGE_MISSION.f2s : MANAGE_MISSION.f2t;
        addMission(room, MISSION_TYPE.MANAGE, mType, { rType, amount: room.factory.store[rType]});
        return ;
    }

    Memory.RoomInfo[room.name].Factory.autoQueue.shift();
    Memory.RoomInfo[room.name].Factory.state = FACTORY_STATE.IDLE;
}

export const roomStructureFactory = {
    product: (room: Room) => {
        if (room.factory.cooldown !== 0) return ;

        const mem = Memory.RoomInfo[room.name];

        if (!mem || !mem.Factory?.open) return ;

        const product = mem.Factory.product;
        if (!product) return ;

        // 原料
        const components = COMMODITIES[product]?.components;
        if (!components) return ;

        // 检查原料是否充足
        if (Object.keys(components).some(c => room.factory.store[c] < components[c])) return ;

        const result = room.factory.produce(product);

        if ((Game.time % 1000 === 0 ||
            result !== OK) &&
            room.factory.store[product] > 0
        ) {
            addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.f2t, {
                rType: product,
                amount: room.factory.store[product]
            });
        }
    },
    auto: (room: Room) => {
        if (Game.time % 50) return ;
        const mem = Memory.RoomInfo[room.name];

        if (!mem || !mem.Factory?.open) return ;

        const product = mem.Factory.product;
        const amount = mem.Factory.amount||0;
        const components = COMMODITIES[product]?.components;

        // 当前任务：原料充足，未达数量 不变更任务
        if (product && components &&
            (amount <= 0 || getRoomResourceAmount(room, product) < amount) &&
            Object.keys(components).every((c: any) => {
                const count = getRoomResourceAmount(room, c);
                if (Goods.includes(c) && count >= components[c]) return true;
                if (count >= 1000 || room.factory.store[c] >= components[c]) return true;
            })
        ) {
            return ;
        }

        if (product) {
            mem.Factory.product = null;
            mem.Factory.amount = 0;
        }

        const autoQueue = mem.Factory.autoQueue;

        if (!autoQueue || !autoQueue.length) return ;

        let myLevel = -Infinity;
        let task;
        autoQueue.forEach(t => {
            const level = COMMODITIES[t.product].level || 0;
            if (myLevel >= level) return ;
            const components = COMMODITIES[t.product].components;
            const amount = t.amount;
            if (amount > 0 && getRoomResourceAmount(room, t.product) >= amount * 0.9) return ;

            if (Goods.includes(t.product as any)) {
                if (Object.keys(components).some(c => getRoomResourceAmount(room, c) < components[c] * 10)) return ;
            } else if (Object.keys(components).some(c => getRoomResourceAmount(room, c) < 1000)) {
                return ;
            }

            myLevel = level;
            task = t;
        });

        if (!task) return ;

        mem.Factory.product = task.product;
        mem.Factory.amount = task.amount;

        console.log(`[${room.name}] 已分配工厂生产任务：${task.product}，数量: ${task.amount || '无'}`)
    },
    open: (room: Room, level: number) => {
        const memory = Memory.RoomInfo[room.name];

        if (!memory.Factory) {
            memory.Factory = {
                open: true,
                state: FACTORY_STATE.IDLE,
                level: level,
                product: null,
                amount: 0,
                autoQueue: []
            }
        } else {
            memory.Factory.open = true;
            memory.Factory.level = level;
        }

        roomStructureFactory.setTarget(room);
    },
    setTarget: (room: Room, update: boolean = false) => {
        const memory = Memory.RoomInfo[room.name].Factory;

        if (!memory.autoQueue) {
            memory.autoQueue = [];
        } else {
            memory.autoQueue = memory.autoQueue.filter(task => task?.manual)
        }

        if (getRoomResourceAmount(room, RESOURCE_MIST) > 0) {
            if (room.factory.level || memory.level) {
                memory.autoQueue.push(...FactoryTarget[RESOURCE_MIST][memory.level]);
            }
            memory.autoQueue.push(...FactoryTarget[RESOURCE_MIST][0]);
        }

        if (room.mineral && getRoomResourceAmount(room, room.mineral.mineralType) >= 60000) {
            const product = ResourceBarMap[room.mineral.mineralType];
            memory.autoQueue.unshift({
                product: product,
                amount: 2000
            });
        }

        if (room.storage?.store.energy >= 200000) {
            memory.autoQueue.unshift({
                product: RESOURCE_BATTERY,
                amount: 10000
            })
        }

        // 去除重复
        memory.autoQueue = Object.values(
            _.reduce(memory.autoQueue, (result, item) => {
                const key = item.product;
                if (!result[key] || result[key].amount < item.amount) {
                    result[key] = item;
                }
                return result;
            }, {})
        )
    },
    work: (room: Room) => {
        if (!room.factory || !room.terminal) return ;

        const memory = Memory.RoomInfo[room.name].Factory;
        if (!memory || !memory.open || room.memory.defend) return ;

        if (memory.wakeup) {
            if (Game.time < memory.wakeup) return ;
            factoryWakeup(room);
        }

        switch (memory.state) {
            case FACTORY_STATE.IDLE:
                if (Game.time % 5) return ;
                return factoryGetTarget(room);
            case FACTORY_STATE.LOAD:
                if (Game.time % 5) return ;
                return factoryGetResource(room);
            case FACTORY_STATE.WORK:
                return factoryWork(room);
            case FACTORY_STATE.TAKE:
                if (Game.time % 5) return ;
                return factoryTakeResource(room);

        }

        // roomStructureFactory.product(room);
        // roomStructureFactory.auto(room);
    }
}