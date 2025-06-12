import { CompoundMineral, HighWayLabTarget, LabTarget } from "@/constant/resource";
import { LAB_STATE } from "@/constant/structure";
import { addMission, countMission } from "../mission/pool";
import { MISSION_TYPE, TERMINAL_MISSION, TRANSPORT_MISSION } from "@/constant/mission";
import { getRoomCenterLab, getRoomResourceAmount } from "../function/get";
import { checkRoomResourceSharable } from "../function/check";

const labIndexUpdate = (room: Room) => {
    Memory.RoomInfo[room.name].lab.index = (Memory.RoomInfo[room.name].lab.index+1) % Memory.RoomInfo[room.name].lab.autoQueue.length;
}

const labGetTarget = (room: Room) => {
    if (!Memory.RoomInfo[room.name].lab.index) Memory.RoomInfo[room.name].lab.index = 0;

    const resource = Memory.RoomInfo[room.name].lab.autoQueue[Memory.RoomInfo[room.name].lab.index];

    if (!resource) return labIndexUpdate(room);
    if (getRoomResourceAmount(room, resource.target) >= resource.amount) {
        return labIndexUpdate(room);
    }
    // console.log(JSON.stringify(resource))
    // console.log(JSON.stringify(CompoundMineral[resource.target]));
    const {rct1, rct2} = CompoundMineral[resource.target];
    const rct1Count = room.terminal.store[rct1];
    const rct2Count = room.terminal.store[rct2];
    const minAmount = Math.min(rct1Count, rct2Count);

    if (minAmount >= 5) {    // 至少需要5个资源
        Memory.RoomInfo[room.name].lab.state = LAB_STATE.LOAD;
        Memory.RoomInfo[room.name].lab.labAType = rct1;
        Memory.RoomInfo[room.name].lab.labBType = rct2;
        // 这里保持5的倍数，防止底物反应不完
        Memory.RoomInfo[room.name].lab.labAmount = Math.min(minAmount-minAmount%5,LAB_MINERAL_CAPACITY)
    } else {
        if (rct1Count < 2000 && checkRoomResourceSharable(room, rct1, 2000-rct1Count)) {
            addMission(room, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.request, {
                rType: rct1,
                amount: 2000-rct1Count,
            })
        }
        if (rct2Count < 2000 && checkRoomResourceSharable(room, rct2, 2000-rct2Count)) {
            addMission(room, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.request, {
                rType: rct2,
                amount: 2000-rct2Count,
            })
        }
        return labIndexUpdate(room);
    }
}

const labGetResource = (room: Room) => {
    const memory = Memory.RoomInfo[room.name].lab;
    if (!memory.labA || !memory.labB) return ;

    const labAType = memory.labAType;
    const labBType = memory.labBType;

    if (!labAType || !labBType) {
        memory.state = LAB_STATE.IDLE;
        return labIndexUpdate(room);
    }

    const labA = Game.getObjectById(memory.labA) as StructureLab;
    const labB = Game.getObjectById(memory.labB) as StructureLab;

    // 检查是否留有其他物料
    [[labA, labAType], [labB, labBType]].forEach(([lab, rType]: [StructureLab, MineralConstant]) => {
        if (lab.mineralType && lab.mineralType !== rType) {
            if (countMission(room, MISSION_TYPE.TRANSPORT, m => m.data.source === lab.id && m.data.target === room.terminal.id) === 0) {
                addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                    source: lab.id,
                    target: room.terminal.id,
                    pos: lab.pos,
                    rType: lab.mineralType,
                    amount: lab.store[lab.mineralType]
                })
            }
            return ;
        }
    })

    if (labA.mineralType && labB.mineralType) {
        memory.state = LAB_STATE.WORK;
        return ;
    }

    // 检查底物是否足够
    if (labA.store[labAType] < memory.labAmount && countMission(room, MISSION_TYPE.TRANSPORT, m => m.data.target === labA.id && m.data.rType === labAType) === 0) {
        if (room.terminal.store[labAType] < memory.labAmount) {
            memory.state = LAB_STATE.IDLE;
            return labIndexUpdate(room);
        }
        addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
            source: room.terminal.id,
            target: labA.id,
            pos: labA.pos,
            rType: labAType,
            amount: memory.labAmount - labA.store[labAType]
        })
    }
    if (labB.store[labBType] < memory.labAmount && countMission(room, MISSION_TYPE.TRANSPORT, m => m.data.target === labB.id && m.data.rType === labBType) === 0) {
        if (room.terminal.store[labBType] < memory.labAmount) {
            memory.state = LAB_STATE.IDLE;
            return labIndexUpdate(room);
        }
        addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
            source: room.terminal.id,
            target: labB.id,
            pos: labB.pos,
            rType: labBType,
            amount: memory.labAmount - labB.store[labBType]
        })
    }
}

const labWork = (room: Room) => {
    const memory = Memory.RoomInfo[room.name].lab;

    // 冷却未完成退出
    if (memory.nextRunTime && Game.time < memory.nextRunTime) return ;
    const labA = Game.getObjectById(memory.labA) as StructureLab;
    const labB = Game.getObjectById(memory.labB) as StructureLab;

    if (!labA.mineralType || labA.mineralType !== memory.labAType ||
        !labB.mineralType || labB.mineralType !== memory.labBType
    ) {
        memory.state = LAB_STATE.LOAD;
        return ;
    }

    const labs = room.lab.filter(lab => lab.id !== labA.id && lab.id !== labB.id);
    if (!labs || labs.length === 0) return ;

     // 遍历其他化工厂作为输出厂进行合成
    for (const lab of labs) {
        const product = REACTIONS[memory.labAType][memory.labBType];

        // 如果化工厂分配的BOOST类型和产物不一样，跳过
        if (memory.BOOST && memory.BOOST[lab.id] &&
            memory.BOOST[lab.id].mineral !== product) continue;
        
        // 如果存在与产物不同的资源，跳过
        if (lab.mineralType && lab.mineralType !== product) {
            if (!countMission(room, MISSION_TYPE.TRANSPORT, m => m.data.target === room.terminal.id && m.data.source == lab.id)) {
                addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                    source: lab.id,
                    target: room.terminal.id,
                    pos: lab.pos,
                    rType: lab.mineralType,
                    amount: lab.store[lab.mineralType]
                });
            }
            continue;
        }

        // 如果已满，跳过
        if (lab.store.getFreeCapacity(product) === 0) {
            memory.state = LAB_STATE.TAKE;
            return ;
        }

        // 合成
        const result = lab.runReaction(labA, labB);

        // 在冷却中，记录下次运行时间
        if (result === ERR_TIRED) {
            memory.nextRunTime = Game.time + lab.cooldown;
            return ;
        }
        // 底物不足
        else if (result === ERR_NOT_ENOUGH_RESOURCES) {
            memory.state = LAB_STATE.TAKE;
            return ;
        }
    }
}

const labTakeResource = (room: Room) => {
    const memory = Memory.RoomInfo[room.name].lab;
    // const product = REACTIONS[memory.labAType][memory.labBType];
    // 检查是否已发布转移任务
    if (countMission(room, MISSION_TYPE.TRANSPORT, m =>  m.data.target === room.terminal.id)) return;

    const labs = room.lab.filter(lab => lab.id !== memory.labA && lab.id !== memory.labB);

    // 检查资源有没有全部转移出去
    for (const lab of labs) {
        const product = lab.mineralType;
        if (memory.BOOST && memory.BOOST[lab.id] &&
            memory.BOOST[lab.id].mineral !== product) continue;

        if (lab.mineralType && lab.store[product] > 0) {
            return addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                source: lab.id,
                target: room.terminal.id,
                pos: lab.pos,
                rType: product,
                amount: lab.store[product]
            });
        }
    }

    memory.state = LAB_STATE.IDLE;
    memory.labAmount = 0;
    memory.labAType = memory.labBType = null;
    return labIndexUpdate(room);
}

export const roomStructureLab = {
    setTarget: (room: Room, update: boolean = false) => {
        const memory = Memory.RoomInfo[room.name];
        if (memory.lab.autoQueue && !update) return ;
        if (!memory.lab.autoQueue) {
            memory.lab.autoQueue = []
        } else {
            memory.lab.autoQueue = memory.lab.autoQueue.filter(task => task?.manual);
        }

        // 寻找房间大于6级的矿物种类数
        const minerals = _.uniq(Object.keys(Memory.RoomInfo).filter(roomName => (Game.rooms[roomName]?.level||0) >= 6 && Game.rooms[roomName].mineral).map(roomName => Game.rooms[roomName].mineral.mineralType)).length;

        // 小于3种 都需要合成
        if (minerals < 3) {
            memory.lab.autoQueue.push(...LabTarget.OH);
            memory.lab.autoQueue.push(...LabTarget.G);
            memory.lab.autoQueue.push(...LabTarget.U);
            memory.lab.autoQueue.push(...LabTarget.L);
            memory.lab.autoQueue.push(...LabTarget.K);
            memory.lab.autoQueue.push(...LabTarget.Z);

            // memory.lab.autoQueue = _.uniq(memory.lab.autoQueue, false, task => task.target);
        }
        // 小于5种 部分合成
        else if (minerals < 5) {
            switch (room.mineral.mineralType) {
                case RESOURCE_OXYGEN:
                case RESOURCE_HYDROGEN:
                    memory.lab.autoQueue.push(...LabTarget.OH);
                    memory.lab.autoQueue.push(...LabTarget.G);
                    break;
                case RESOURCE_UTRIUM:
                case RESOURCE_LEMERGIUM:
                    memory.lab.autoQueue.push(...LabTarget.U);
                    memory.lab.autoQueue.push(...LabTarget.L);
                    break;
                case RESOURCE_KEANIUM:
                case RESOURCE_ZYNTHIUM:
                    memory.lab.autoQueue.push(...LabTarget.K);
                    memory.lab.autoQueue.push(...LabTarget.Z);
                    break;
                case RESOURCE_CATALYST:
                    memory.lab.autoQueue.push(...LabTarget.OH);
                    break;
            }
            // memory.lab.autoQueue = _.uniq(memory.lab.autoQueue, false, task => task.target);
        }
        // 分开合成
        else {
            switch (room.mineral.mineralType) {
                case RESOURCE_OXYGEN:
                case RESOURCE_HYDROGEN:
                    memory.lab.autoQueue.push(...LabTarget.OH);
                    memory.lab.autoQueue.push(...LabTarget.G);
                    break;
                case RESOURCE_UTRIUM:
                    memory.lab.autoQueue.push(...LabTarget.U);
                    break;
                case RESOURCE_LEMERGIUM:
                    memory.lab.autoQueue.push(...LabTarget.L);
                    break;
                case RESOURCE_KEANIUM:
                    memory.lab.autoQueue.push(...LabTarget.K);
                    break;
                case RESOURCE_ZYNTHIUM:
                    memory.lab.autoQueue.push(...LabTarget.Z);
                    break;
                case RESOURCE_CATALYST:
                    break;
            }
        }

        // 如有通道矿房
        if ((memory.OutMineral?.highway?.length||0) > 0) {
            memory.lab.autoQueue.push(...HighWayLabTarget)
        }

        memory.lab.autoQueue = Object.values(
            _.reduce(memory.lab.autoQueue, (result, item) => {
                const key = item.target;
                if (!result[key] || result[key].amount < item.amount) {
                    result[key] = item;
                }
                return result;
            }, {})
        )
    },
    addTarget: (room: Room, rType: MineralCompoundConstant, amount: number) => {
        const memory = Memory.RoomInfo[room.name];
        if (!memory.lab?.open) return false;

        if (!memory.lab.autoQueue) {
            memory.lab.autoQueue = []
        }

        memory.lab.autoQueue.push({
            target: rType,
            amount: amount,
            manual: true
        })

        memory.lab.autoQueue = Object.values(
            _.reduce(memory.lab.autoQueue, (result, item) => {
                const key = item.target;
                if (!result[key] || result[key].amount < item.amount) {
                    result[key] = item;
                }
                return result;
            }, {})
        )
    },
    /**
     * 根据身体分配boost任务
     * @param room 
     * @param body 
     * @param BOOST 
     * @returns 
     */
    setBoostByBody: (room: Room, body: BodyPartConstant[], BOOST: any) => {
        const bodyparts: any = {};
        const tasks = [];
        for (const part of body) {
            if (!bodyparts[part]) bodyparts[part] = 0;
            bodyparts[part]++;
        }
        for (const part in bodyparts) {
            if (!BOOST[part]) continue;

            const amount = bodyparts[part] * 30;
            if (amount == 0) continue;
            let mIdx = 0;
            while (mIdx < BOOST[part].length) {
                if (getRoomResourceAmount(room, BOOST[part][mIdx]) >= amount) break;
                mIdx++;
            }
            if (mIdx >= BOOST[part].length) {
                return [false, part];
            }
            tasks.push([BOOST[part][mIdx], amount]);
            // roomStructureLab.setBoost(room, BOOST[part][mIdx], amount);
        }
        for (const task of tasks) {
            roomStructureLab.setBoost(room, task[0], task[1], true);
        }
        return [true, null];
    },
    // 指定boost任务化工厂
    setBoost: (room: Room, mineral: MineralBoostConstant, amount: number, increase: boolean = true) => {
        const labInfo = Memory.RoomInfo[room.name].lab;
        if (!labInfo.BOOST) labInfo.BOOST = {}

        // 查看是否已设置该类型任务
        const lab = room.lab.find(lab => labInfo.BOOST[lab.id]?.mineral === mineral);

        if (lab) {
            if (increase) labInfo.BOOST[lab.id].amount += amount;
            else labInfo.BOOST[lab.id].amount = amount;
            labInfo.BOOST[lab.id].time = Game.time;
            return true;
        }

        // 寻找没有BOOST任务的非底物lab
        const labs = room.lab.filter(lab => !labInfo.BOOST[lab.id] && lab.id !== labInfo.labA && lab.id !== labInfo.labB);

        if (labs.length) {
            const lab = labs[0];
            labInfo.BOOST[lab.id] = {
                mineral: mineral,
                amount: amount,
                time: Game.time
            }
            return true;
        } else {
            // 添加到队列
            if (!labInfo.boostQueue) labInfo.boostQueue = {};
            if (increase) {
                labInfo.boostQueue[mineral] = (labInfo.boostQueue[mineral]||0) + amount;
            } else {
                labInfo.boostQueue[mineral] = amount;
            }
            return false;
        }
    },
    // 提交boost已完成数
    submitBoost: (room: Room, mineral: MineralBoostConstant, amount: number) => {
        const labInfo = Memory.RoomInfo[room.name].lab;
        if (!labInfo.BOOST) labInfo.BOOST = {}

        const lab = room.lab.find(lab => labInfo.BOOST[lab.id]?.mineral === mineral);

        if (!lab) return true;

        labInfo.BOOST[lab.id].amount -= amount;

        // boost资源用完清除BOOST指定
        if (labInfo.BOOST[lab.id].amount <= 0) {
            delete labInfo.BOOST[lab.id];
        }
        return true;
    },
    open: (room: Room) => {
        const memory = Memory.RoomInfo[room.name];
        // 不足3个lab
        if (!room.lab || room.lab.length < 3) return -1;

        if (!memory.lab) memory.lab = { open: true, state: LAB_STATE.IDLE };
        else memory.lab.open = true;

        const [labA, labB] = getRoomCenterLab(room);
        if (labA && labB) {
            memory.lab.labA = labA;
            memory.lab.labB = labB;
        }

        // 指定合成线路
        roomStructureLab.setTarget(room);
    },
    work: (room: Room) => {
        // 不足3个lab
        if (!room.lab || room.lab.length < 3) return ;

        // 检查内存中的化工厂设置
        const memory = Memory.RoomInfo[room.name].lab;
        if (!memory || !memory.open || room.memory.defend) return ;
        if (!memory.labA || !memory.labB) return ;

        switch (Memory.RoomInfo[room.name].lab.state) {
            case LAB_STATE.IDLE:
                if (Game.time % 5 !== 1) return ;
                return labGetTarget(room);
            case LAB_STATE.LOAD:
                if (Game.time % 15 !== 1) return ;
                return labGetResource(room);
            case LAB_STATE.WORK:
                if (Game.time % 2) return ;
                return labWork(room);
            case LAB_STATE.TAKE:
                if (Game.time % 15 !== 1) return ;
                return labTakeResource(room);
        }
    }
}