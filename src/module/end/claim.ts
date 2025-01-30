import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";

export const endClaimCheck = () => {
    if (Game.time % 10 !== 0) return ;
    for (const flag in Game.flags) {
        if (flag.startsWith('CLAIM')) {
            const spawnRoomName = flag.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];
            const spawnRoom = Game.rooms[spawnRoomName];
            if (!spawnRoom || !spawnRoom.my) {
                Game.flags[flag].remove();
                continue;
            }

            const targetRoom = Game.flags[flag].pos.roomName;
            const isNotCenterRoom = !(/^[EW]\d*[456][NS]\d*[456]$/.test(targetRoom)); // 非中间房间
            const isNotHighway = /^[EW]\d*[1-9][NS]\d*[1-9]$/.test(targetRoom); // 非过道房间
            if (isNotCenterRoom && isNotHighway &&
                (!Game.rooms[targetRoom] || !Game.rooms[targetRoom].my)
            ) {
                addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.claimer, {
                    targetRoom: targetRoom
                });
            }
            Game.flags[flag].remove();
        }
    }
}