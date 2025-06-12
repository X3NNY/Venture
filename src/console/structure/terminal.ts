import { MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { ResourceBarMap } from "@/constant/resource";
import { addMission } from "@/controller/room/mission/pool";

const terminalStrings = {
    cn: {
        room_not_found: `[终端指令] 房间「{0}」未在控制列表或未占领。`,
        terminal_not_found: `[终端指令] 房间「{0}」没有终端。`,
        error_args: '[终端指令] 参数错误。',
        request_ok: '[终端指令] 房间「{0}」已添加「{1}」资源请求任务，请求量：「{2}」。',
    },
    us: {
        room_not_found: `[终端指令] 房间「{0}」未在控制列表或未占领。`,
        terminal_not_found: `[终端指令] 房间「{0}」没有终端。`,
        error_args: '[终端指令] 参数错误。',
        request_ok: '[终端指令] 房间「{0}」已添加「{1}」资源请求任务，请求量：「{2}」。',
    }
}

export default {
    terminal: {
        send: (roomName: string, targetRoom: string, type: ResourceConstant, amount: number) => {
            const room = Game.rooms[roomName];
            if (!room.terminal) {
                return ERR_TIRED;
            }

            addMission(room, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.send, {
                targetRoom,
                rType: type,
                amount
            })
            return OK;
        },
        sendNow: (roomName: string, targetRoom: string, type: ResourceConstant, amount?: number) => {
            const room = Game.rooms[roomName];
            if (!room.terminal || room.terminal.cooldown !== 0) {
                return ERR_TIRED;
            }
            amount = Math.min(amount||0xffff, room.terminal.store[type]||0)
            if (!amount) return ;
            let eCost = Game.market.calcTransactionCost(amount, roomName, targetRoom);

            if (type === RESOURCE_ENERGY && amount + eCost > room.terminal.store[type]) {
                amount -= eCost;
                amount = Math.floor(amount);
            } else if (eCost > room.terminal.store[RESOURCE_ENERGY]) {
                amount *= room.terminal.store[RESOURCE_ENERGY] / eCost;
                amount = Math.floor(amount);
            }

            const result = room.terminal.send(type, amount, targetRoom);
            if (result === OK) {
                return OK;
            }
        },
        request: (roomName: string, type: ResourceConstant, amount: number) => {
            const room = Game.rooms[roomName];
            const lang = Memory.lang || 'cn';

            if (!room || !room.my) {
                return terminalStrings[lang].room_not_found.format(roomName);
            }

            if (room.level < 6 || !room.terminal) {
                return terminalStrings[lang].terminal_not_found.format(roomName);
            }

            if (!amount || !(amount>0)) {
                return terminalStrings[lang].error_args;
            }

            addMission(room, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.request, {
                rType: type,
                amount 
            });
            return terminalStrings[lang].request_ok.format(roomName, type, amount);
        }
    }
}