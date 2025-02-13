import { MANAGE_MISSION, MISSION_TYPE } from "@/constant/mission";
import { addMission, deleteMission, filterMission, getMission, getMissionByFilter } from "../pool";

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
    if (!room.storage.pos.inRangeTo(room.terminal.pos, 1)) return false;

    const missions = filterMission(room, MISSION_TYPE.TERMINAL);
    const sends:{[k: string]: number} = {};
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

export const updateManageMission = (room: Room) => {
    // 检查终端资源数量
    roomTerminalManageChcek(room);
}