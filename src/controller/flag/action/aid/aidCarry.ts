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
        if (!sourceRoom) sourceRoom = spawnRoomName;

        let rType = flag.name.match(/-R\[(.+?)\]/)?.[1];
        if (rType == 'null') rType = null;
        else if (!rType) rType = RESOURCE_ENERGY;

        flag.memory.data = {
            spawnRoom: spawnRoomName,
            sourceRoom: sourceRoom,
            rType: rType
        }
        return true;
    },
    action: (flag: Flag) => {
        const spawnRoom = Game.rooms[flag.memory.data.spawnRoom];
        if (!spawnRoom ||!spawnRoom.my) {
            flag.remove();
            return ;
        }
        
        const targetRoom = flag.pos.roomName;
        const sourceRoom = flag.memory.data.sourceRoom;
        
        let opts = {}
        if (Game.rooms[targetRoom] && Game.rooms[targetRoom].road.length > 20 &&
            Game.rooms[sourceRoom] && Game.rooms[sourceRoom].road.length > 20 &&
            Game.map.getRoomLinearDistance(sourceRoom, targetRoom) == 1
        ) {
            opts = { move: 'normal' }
        }
        addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.aid_carrier, {
            home: spawnRoom.name,
            sourceRoom: sourceRoom,
            targetRoom: targetRoom,
            rType: flag.memory.data.rType,
            opts: opts
        })
    }
}