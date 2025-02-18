import { MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { addMission, countMission, deleteMission, doneMission, getMission, getMissionByFilter } from "../mission/pool";

const getTerminalMission = (room: Room) => {
    const terminal = room.terminal;
    const task = getMissionByFilter(room, MISSION_TYPE.TERMINAL, t => {
        return terminal.store[t.data.rType] >= Math.min(t.data.amount, 1000);
    });

    if (!task) return null;
    return task;
}

export const roomStructureTerminal = {
    work: (room: Room) => {
        if (Game.time % 30 !== 2) return ;
        const terminal = room.terminal;

        if (!terminal || terminal.cooldown !== 0) return ;

        const task = getTerminalMission(room);
        if (!task) return ;

        const { targetRoom, rType, amount } = task.data;

        if (!targetRoom || !rType) {
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
    }
}