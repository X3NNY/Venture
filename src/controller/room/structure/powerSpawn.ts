import { getRoomResourceAmount } from "../function/get";

export const roomStructurePowerCreep = {
    work: (room: Room) => {
        if (room.level < 8) return ;

        if (!Memory['RoomInfo'][room.name].powerSpawn?.open) return;

        if (getRoomResourceAmount(room, RESOURCE_ENERGY) < 50000) return ;

        const powerSpawn = room.powerSpawn;
        if (!powerSpawn) return ;
        const store = powerSpawn.store;
        if (store[RESOURCE_ENERGY] < 50 || store[RESOURCE_POWER] < 1) return ;
        powerSpawn.processPower();
    }
}