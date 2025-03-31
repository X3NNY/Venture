import { MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { addMission, countMission, deleteMission, doneMission, getMission, getMissionByFilter } from "../mission/pool";

const getTerminalMission = (room: Room, code: string) => {
    const terminal = room.terminal;
    const task = getMissionByFilter(room, MISSION_TYPE.TERMINAL, t => {
        if (t.data.code === code) {
            if (t.data.code === TERMINAL_MISSION.send.code) {
                return terminal.store[t.data.rType] >= Math.min(t.data.amount, 1000);
            }
            return true;
        }
        return false;
    });

    // if (!task) return null;
    return task;
}

export const roomStructureTerminal = {
    send: (room: Room, task: Task) => {
        const terminal = room.terminal;
        const { targetRoom, rType, amount } = task.data;

        if (!targetRoom || !rType || targetRoom === room.name) {
            return deleteMission(room, MISSION_TYPE.TERMINAL, task.id);
        }
        if (amount <= 0) {
            return deleteMission(room, MISSION_TYPE.TERMINAL, task.id);
        }

        // 最大发送数量
        let sendAmount = Math.min(amount, terminal.store[rType]);
        const cost = Game.market.calcTransactionCost(sendAmount, room.name, targetRoom);

        // 如果是能量，需要考虑传送消耗
        if (rType === RESOURCE_ENERGY) {
            sendAmount = Math.min(sendAmount, terminal.store[rType] - cost);
        }
        // 如果传送消耗不够
        else if (cost > terminal.store[RESOURCE_ENERGY]) {
            sendAmount = Math.floor(sendAmount * (terminal.store[RESOURCE_ENERGY] / cost));
        }

        if (sendAmount <= 0) return ;

        const result = terminal.send(rType, sendAmount, targetRoom);

        if (result === OK) {
            // 还没发送完
            if (amount - sendAmount > 0) {
                doneMission(room, MISSION_TYPE.TERMINAL, task.id, sendAmount);
            } else {
                deleteMission(room, MISSION_TYPE.TERMINAL, task.id)
            }
            const cost = Game.market.calcTransactionCost(sendAmount, room.name, targetRoom);
            console.log(`[资源发送] ${room.name} -> ${targetRoom}, ${sendAmount} ${rType}, 消耗能量：${cost}`);
        } else {
            console.log(`[资源发送] ${room.name} -> ${targetRoom}, ${sendAmount} ${rType} 失败, 返回值：${result}`);
        }
    },
    request: (room: Room, task: Task) => {
        let { rType, amount } = task.data;

        if (!rType || amount <= 0) {
            return deleteMission(room, MISSION_TYPE.TERMINAL, task.id);
        }

        for (const roomName in Memory.Resource[rType]) {
            const tRoom = Game.rooms[roomName];
            const totalAmount = (tRoom.storage?.store[rType]||0) + (tRoom.terminal?.store[rType]||0);
            if (totalAmount > Memory.Resource[rType][roomName]) {
                const maxAmount = Math.min(totalAmount - Memory.Resource[rType][roomName], amount);
                addMission(tRoom, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.send, {
                    rType: rType,
                    amount: maxAmount,
                    targetRoom: room.name
                });
                amount -= maxAmount;
            }
            if (amount <= 0) {
                break;
            }
        }
        deleteMission(room, MISSION_TYPE.TERMINAL, task.id);
    },
    work: (room: Room) => {
        if (Game.time % 30 >= 2) return ;
        const terminal = room.terminal;

        if (!terminal || terminal.cooldown !== 0) return ;

        if (Game.time % 30 === 0) {
            const task = getTerminalMission(room, TERMINAL_MISSION.request.code);
            if (task) {
                roomStructureTerminal.request(room, task);
            }
        } else if (Game.time % 30 === 1) {
            const task = getTerminalMission(room, TERMINAL_MISSION.send.code);
            
            if (task) {
                roomStructureTerminal.send(room, task);
            }
        }
    }
}