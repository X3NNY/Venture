import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";

export default {
    colddown: 500,
    prepare: (flag: Flag) => {
        const spawnRoomName = flag.name.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];

        const B = flag.name.match(/\/-B\[(.+)\]$/)?.[1] || '2T';

        const spawnRoom = Game.rooms[spawnRoomName];
        if (!spawnRoom ||!spawnRoom.my) {
            flag.remove();
            return false;
        }

        return true;
    },
    action: (flag: Flag) => {
        const spawnRoomName = flag.name.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];
        const spawnRoom = Game.rooms[spawnRoomName];
        if (!spawnRoom ||!spawnRoom.my) {
            flag.remove();
            return false;
        }

        const targetRoom = flag.pos.roomName;
        const boostLevel = flag.memory.data.boostLevel || 0;

        addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.aio, {
            home: spawnRoom.name,
            targetRoom: targetRoom,
            boostLevel: boostLevel
        });
    }
}