import { MANAGE_MISSION, MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { addMission, deleteMission, filterMission, getMission, getMissionByFilter } from "../pool";
import { getRoomResourceAmount } from "../../function/get";
import { add } from "lodash";

const getTerminalMissionTotal = (room: Room) => {
    const terminal = room.terminal;
    const task = getMissionByFilter(room, MISSION_TYPE.TERMINAL, t => {
        return terminal.store[t.data.rType] >= Math.min(t.data.amount, 1000);
    });

    if (!task) return null;
    return task;
}

const roomTerminalManageChcek = (room: Room) => {
    if (!room.storage || !room.terminal) return false;
    if (!room.storage.pos.inRangeTo(room.terminal.pos, 2)) return false;

    const missions = filterMission(room, MISSION_TYPE.TERMINAL, t => t.data.code === TERMINAL_MISSION.send.code);
    const sends: Partial<Record<ResourceConstant, number>> = {};
    for (const task of missions) {
        const totalResource = (room.terminal?.store[task.data.rType]||0) + (room.storage?.store[task.data.rType]||0);
        if (totalResource < Math.min(task.data.amount, 10000)) {
            deleteMission(room, MISSION_TYPE.TERMINAL, task.id);
            continue;
        }
        sends[task.data.rType] = task.data.amount + (sends[task.data.rType]||0);
    }

    const THRESHOLD = {
        source: {
            RESOURCE_ENERGY: 30000,
            default: 5000
        },
        target: {
            RESOURCE_ENERGY: 25000,
            default: 3000
        }
    }

    // 检查仓库资源是否需要转入终端
    for (const rType in room.storage.store) {
        let amount = 0;
        // 有转入任务，计算能量需求
        if (rType === RESOURCE_ENERGY && Object.keys(sends).length > 0) {
            amount = Math.min(
                room.storage.store[rType],
                Object.values(sends).reduce((a, b) => a+b) - room.terminal.store[rType],
                50e3-room.terminal.store[rType]
            );
        }

        // 有指定资源发送任务，根据数量决定转入量
        else if (sends[rType]) {
            amount = Math.min(
                room.storage.store[rType],
                sends[rType] - room.terminal.store[rType]
            );
        }

        // 按照阈值转入
        else {
            const threshold = THRESHOLD.target[rType] || THRESHOLD.target.default;
            if (room.terminal.store[rType] >= threshold) continue;
            amount = Math.min(
                room.storage.store[rType],
                threshold - room.terminal.store[rType]
            );
        }
        if (amount <= 0) continue;
        addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.s2t, { rType, amount });
    }

    // 检查终端资源是否需要转出至仓库
    for (const rType in room.terminal.store) {
        if (sends[rType]) continue;
        
        const threshold = THRESHOLD.source[rType] || THRESHOLD.source.default;
        if (room.terminal.store[rType] <= threshold) continue;

        const amount = room.terminal.store[rType] - threshold;
        if (amount <= 0) continue;
        addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.t2s, { rType, amount });
    }
}

const roomPowerSpawnManageCheck = (room: Room) => {
    if (!room.powerSpawn) return false;

    const mem = Memory.RoomInfo[room.name];
    if (!mem ||!mem.powerSpawn || !mem.powerSpawn.open) return false;

    const center = Memory.RoomInfo[room.name].center;
    if (!center || !room.powerSpawn.pos.isNearTo(center.x, center.y)) return false;

    const amount = room.powerSpawn.store.getFreeCapacity(RESOURCE_ENERGY)

    if (amount > 400 && room.storage.store.energy >= amount) {
        addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.s2p, {
            rType: RESOURCE_ENERGY,
            amount: amount
        })
    }

    const needPower = 100 - room.powerSpawn.store[RESOURCE_POWER];

    if (needPower < 50 || room.storage.store.energy <= 50000) {
        return ;
    }

    const target = [room.storage, room.terminal].reduce((a, b) => {
        if (!a || !b) return a || b;
        if (a.store.power < b.store.power) return b;
        return a;
    }, null);

    if (!target || target.store.power === 0) return ;
    const missionType = target.id === room.storage.id ? MANAGE_MISSION.s2p : MANAGE_MISSION.t2p;
    addMission(room, MISSION_TYPE.MANAGE, missionType, {
        rType: RESOURCE_POWER,
        amount: Math.min(needPower, target.store.power)
    });
}

const roomFactoryManageCheck = (room: Room) => {
    if (!room.factory || !room.storage) return false;

    const mem = Memory.RoomInfo[room.name];
    if (!mem || !mem.Factory) return false;

    const product = mem.Factory.product;

    // 停止工作时，清空工厂
    if (!mem.Factory.open || !product) {
        for (const rType in room.factory.store) {
            addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.f2t, { rType, amount: room.factory.store[rType] });
        }
        return ;
    }

    const components = COMMODITIES[product]?.components || {};

    // 取走其他资源
    for (const rType in components) {
        if (components[rType]) continue;
        if (rType === product) continue;
        addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.f2t, { rType, amount: room.factory.store[rType] });
    }

    // 补充材料
    for (const rType in components) {
        if (getRoomResourceAmount(room, rType) <= 0) continue;
        if (room.factory.store[rType] >= 1000) continue;
        const amount = 3000 - room.factory.store[rType];

        addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.t2f, { rType, amount });

        // 检查仓库是否有足够的资源
        if (room.terminal.store[rType] < amount) {
            addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.s2f, { rType, amount: Math.min(amount - room.storage.store[rType],
                room.terminal?.store[rType]||0) });
        }
    }

    // 搬走多余产物
    if (room.factory.store[product] > 3000) {
        if (room.storage.store.getFreeCapacity() >= 3000) {
            addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.f2s, { rType: product, amount: 3000 });
        } else if ((room.terminal?.store.getFreeCapacity()||0) >= 3000) {
            addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.f2t, { rType: product, amount: 3000 });
        }
    }
}

export const updateManageMission = (room: Room) => {
    // 检查终端资源数量
    roomTerminalManageChcek(room);
    // 检查工厂资源数量
    // roomFactoryManageCheck(room);
    roomPowerSpawnManageCheck(room);

}