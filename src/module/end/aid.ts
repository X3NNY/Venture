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
            let sourceRoom = flag.match(/-S\[([EW]\d+[NS]\d+)\]/)?.[1];
            if (!sourceRoom) sourceRoom = targetRoom;
            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.aid_builder, {
                home: spawnRoom.name,
                sourceRoom: sourceRoom,
                targetRoom: targetRoom,
            })
            Game.flags[flag].memory['lastTime'] = Game.time;
        }

        else if (flag.startsWith('AID-RESOURCE')) {
            if (Game.time - (Game.flags[flag].memory['lastTime']||0) < 500) continue;

            const spawnRoomName = flag.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];
            const spawnRoom = Game.rooms[spawnRoomName];
            if (!spawnRoom || !spawnRoom.my) {
                Game.flags[flag].remove();
                continue;
            }

            const targetRoom = Game.flags[flag].pos.roomName;
            let sourceRoom = flag.match(/-S\[([EW]\d+[NS]\d+)\]/)?.[1];
            if (!sourceRoom) sourceRoom = spawnRoomName;
            let rType = flag.match(/-R\[.+?\]/)?.[1];
            if (!rType) rType = RESOURCE_ENERGY;
            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.aid_carrier, {
                home: spawnRoom.name,
                sourceRoom: sourceRoom,
                targetRoom: targetRoom,
                rType: rType
            })
            Game.flags[flag].memory['lastTime'] = Game.time;
        }
    }
}