import { MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { roomResourceCheck, roomResourceSet } from "@/controller/room/auto/resource";
import { getRoomResourceAmount } from "@/controller/room/function/get"
import { roomStructureLab } from "@/controller/room/structure/lab";

export default {
    action: (flag: Flag) => {
        if (flag.room.level === 8) {
            if (!flag.memory.manual) {
                flag.remove();
                return ;
            }
        }

        if (!flag.memory.lastRun) {
            const roomCount = (Memory.System.rooms||0);
            if (!Memory.RoomInfo[flag.room.name].Resource) {
                roomResourceSet(flag.room)
            }
            if (!Memory.RoomInfo[flag.room.name].Resource[RESOURCE_ENERGY]) {
                Memory.RoomInfo[flag.room.name].Resource[RESOURCE_ENERGY] = {amount: 50000, order: flag.memory.data.order, price: 10.5};
            } else {
                Memory.RoomInfo[flag.room.name].Resource[RESOURCE_ENERGY].amout = 50000;
                if (flag.memory.data.order) {
                    Memory.RoomInfo[flag.room.name].Resource[RESOURCE_ENERGY].order = true;
                    Memory.RoomInfo[flag.room.name].Resource[RESOURCE_ENERGY].price = 10.5;
                }
            }

            let mType;
            let price;
            if (roomCount >= 5) {
                mType = RESOURCE_CATALYZED_GHODIUM_ACID;
                price = 1000;
            } else if (roomCount >= 3) {
                mType = RESOURCE_GHODIUM_ACID;
                price = 600;
            } else {
                mType = RESOURCE_GHODIUM_HYDRIDE;
                price = 250;
            }
            
            Memory.RoomInfo[flag.room.name].Resource[mType] = {
                amount: 3000, order: flag.memory.data.order, price: price
            }
            roomStructureLab.addTarget(flag.room, mType, 3000)
            roomResourceCheck(flag.room, true);
        }

        if (getRoomResourceAmount(flag.room, RESOURCE_CATALYZED_GHODIUM_ACID) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_CATALYZED_GHODIUM_ACID, 600, false);
        } else if (getRoomResourceAmount(flag.room, RESOURCE_GHODIUM_ACID) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_GHODIUM_ACID, 600, false);
        } else if (getRoomResourceAmount(flag.room, RESOURCE_GHODIUM_HYDRIDE) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_GHODIUM_HYDRIDE, 600, false); 
        }

        // if (getRoomResourceAmount(flag.room, RESOURCE_ENERGY) <= 50000) {
        //     const roomName = checkRoomResourceSharable(flag.room, RESOURCE_ENERGY, 5000);
        //     if (roomName) {
        //         addMission(Game.rooms[roomName], MISSION_TYPE.TERMINAL, TERMINAL_MISSION.send, {
        //             targetRoom: flag.room.name,
        //             rType: RESOURCE_ENERGY,
        //             amount: 5000
        //         })
        //     }
        // }

        // if (flag.memory.data.order) {
        //     roomMarketAddOrder(flag.room.name, RESOURCE_ENERGY, ORDER_BUY, 40000, 10.5);
        // }
    }
}