import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";

export default {
    colddown: 500,
    prepare: (flag: Flag) => {
        const spawnRoomName = flag.name.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];

        const spawnRoom = Game.rooms[spawnRoomName];
        if (!spawnRoom ||!spawnRoom.my) {
            flag.remove();
            return false;
        }

        let sourceRoom = flag.name.match(/-S\[([EW]\d+[NS]\d+)\]/)?.[1];
        if (!sourceRoom) sourceRoom = flag.room.name;

        flag.memory.data = {
            spawnRoom: spawnRoomName,
            sourceRoom: sourceRoom
        }
        return true;
    },
    action: (flag: Flag) => {
        const spawnRoom = Game.rooms[flag.memory.data.spawnRoom];
        if (!spawnRoom ||!spawnRoom.my) {
            flag.remove();
            return ;
        }

        addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.aid_builder, {
            home: spawnRoom.name,
            sourceRoom: flag.memory.data.sourceRoom,
            targetRoom: flag.pos.roomName,
        })
    }
}