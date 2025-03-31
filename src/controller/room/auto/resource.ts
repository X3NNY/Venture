import { MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { roomMarketAddOrder } from "../component/market";
import { checkRoomResourceSharable } from "../function/check";
import { getRoomResourceAmount } from "../function/get";
import { addMission } from "../mission/pool";

export const roomResourceCheck = (room: Room, force: boolean = false) => {
    if (!force && Game.time % 1000 !== 0) return ;
    if (!Memory.RoomInfo[room.name].Resource || !Memory.RoomInfo[room.name].Resource[RESOURCE_ZYNTHIUM]) {
        roomResourceSet(room);
    }

    for (const rType in Memory.RoomInfo[room.name].Resource) {
        const amount = Memory.RoomInfo[room.name].Resource[rType].amount;
        const needAmount = amount - getRoomResourceAmount(room, rType);

        // 资源不足，需要补充
        if (needAmount > 0) {
            if (Memory.RoomInfo[room.name].Resource[rType].order) {
                roomMarketAddOrder(room.name, rType as ResourceConstant, ORDER_BUY, amount, Memory.RoomInfo[room.name].Resource[rType].price);
            }

            const roomName = checkRoomResourceSharable(room, rType as ResourceConstant, needAmount);

            if (roomName) {
                addMission(room, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.send, {
                    targetRoom: roomName,
                    rType,
                    amount: needAmount
                })
            }
        }
    }
}

export const roomResourceSet = (room: Room, resources?: Record<ResourceConstant, {amount: number, price?: number, order?: boolean}>) => {
    if (!resources) {
        Memory.RoomInfo[room.name].Resource = {
            [RESOURCE_ZYNTHIUM]: { amount: 3000, order: true },
            [RESOURCE_KEANIUM]: { amount: 3000, order: true },
            [RESOURCE_UTRIUM]: { amount: 3000, order: true },
            [RESOURCE_LEMERGIUM]: { amount: 3000, order: true },

            [RESOURCE_HYDROGEN]: { amount: 3000, order: false },
            [RESOURCE_OXYGEN]: { amount: 3000, order: false },
            [RESOURCE_CATALYST]: { amount: 3000, order: false },

            [RESOURCE_UTRIUM_BAR]: { amount: 1000, order: false },
            [RESOURCE_KEANIUM_BAR]: { amount: 1000, order: false },
            [RESOURCE_LEMERGIUM_BAR]: { amount: 1000, order: false },
            [RESOURCE_ZYNTHIUM_BAR]: { amount: 1000, order: false },
            [RESOURCE_OXIDANT]: { amount: 1000, order: false },
            [RESOURCE_REDUCTANT]: { amount: 1000, order: false },
            [RESOURCE_PURIFIER]: { amount: 1000, order: false },
        }
    }
}