import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { getRoomResourceAmount } from "@/controller/room/function/get";
import { addMission } from "@/controller/room/mission/pool";
import { roomStructureLab } from "@/controller/room/structure/lab";

export default {
    colddown: 1000,
    prepare: (flag: Flag) => {
        return true;
    },
    action: (flag: Flag) => {
        const spawnRoom = flag.room;

        if (spawnRoom.storage?.store[RESOURCE_ENERGY] < 20000) return false;

        if (getRoomResourceAmount(flag.room, RESOURCE_CATALYZED_GHODIUM_ACID) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_CATALYZED_GHODIUM_ACID, 450, true);
        } else if (getRoomResourceAmount(flag.room, RESOURCE_GHODIUM_ACID) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_GHODIUM_ACID, 450, true);
        } else if (getRoomResourceAmount(flag.room, RESOURCE_GHODIUM_HYDRIDE) >= 2000) {
            roomStructureLab.setBoost(flag.room, RESOURCE_GHODIUM_HYDRIDE, 450, true); 
        }

        addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.upgrader, {
            home: spawnRoom.name,
        })
    }
}