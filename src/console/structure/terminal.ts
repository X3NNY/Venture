import { MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";

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
        }
    }
}