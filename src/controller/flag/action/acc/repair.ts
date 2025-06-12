import { getRoomResourceAmount } from "@/controller/room/function/get"
import { roomStructureLab } from "@/controller/room/structure/lab";

export default {
    colddown: 1000,
    prepare: (flag: Flag) => {
        return true;
    },
    action: (flag: Flag) => {
        if (!flag.memory.lastRun) {
            const roomCount = (Memory.System.rooms||0);
            let mType;
            let price;
            if (roomCount >= 5) {
                mType = RESOURCE_CATALYZED_LEMERGIUM_ACID;
                price = 1000;
            } else if (roomCount >= 3) {
                mType = RESOURCE_LEMERGIUM_ACID;
                price = 600;
            } else {
                mType = RESOURCE_LEMERGIUM_HYDRIDE;
                price = 250;
            }
            
            roomStructureLab.addTarget(flag.room, mType, 3000);
        }

        if (getRoomResourceAmount(flag.room, RESOURCE_CATALYZED_LEMERGIUM_ACID) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_CATALYZED_LEMERGIUM_ACID, 540, false);
        } else if (getRoomResourceAmount(flag.room, RESOURCE_LEMERGIUM_ACID) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_LEMERGIUM_ACID, 540, false);
        } else if (getRoomResourceAmount(flag.room, RESOURCE_LEMERGIUM_HYDRIDE) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_LEMERGIUM_HYDRIDE, 540, false); 
        }
    }
}