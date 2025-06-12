import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";

export default {
    colddown: 1000,
    prepare: (flag: Flag) => {
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
        const isNotCenterRoom = !(/^[EW]\d*[456][NS]\d*[456]$/.test(targetRoom)); // 非中间房间
        const isNotHighway = /^[EW]\d*[1-9][NS]\d*[1-9]$/.test(targetRoom); // 非过道房间
        if (isNotCenterRoom && isNotHighway &&
            (!Game.rooms[targetRoom] || !Game.rooms[targetRoom].my)
        ) {
            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.claimer, {
                targetRoom: targetRoom
            });
        }
        flag.remove()
    }
}