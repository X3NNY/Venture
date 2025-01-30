import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";

export const endAidCheck = () => {
    if (Game.time % 10 !== 0) return;

    for (const flag in Game.flags) {
        if (flag.startsWith('AID-BUILD')) {
            if (Game.time - (Game.flags[flag].memory['lastTime']||0) < 500) continue;

            const spawnRoomName = flag.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];
            const spawnRoom = Game.rooms[spawnRoomName];
            if (!spawnRoom || !spawnRoom.my) {
                Game.flags[flag].remove();
                continue;
            }

            const targetRoom = Game.flags[flag].pos.roomName;
            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.aid_builder, {
                home: spawnRoom.name,
                targetRoom: targetRoom,
            })
            Game.flags[flag].memory['lastTime'] = Game.time;
        }
    }
}