import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";

const spawnStrings = {
    cn: {
        room_not_found: `[孵化器指令] 房间「{0}」未在控制列表或未占领。`,
        role_not_found: `[孵化器指令] 不存在「{0}」类型爬爬。`,
        create_ok: '[孵化器指令] 房间「{0}」已添加「{1}」类型爬爬孵化任务，爬爬内存信息：「{2}」。',
    },
    us: {
        room_not_found: `[孵化器指令] 房间「{0}」未在控制列表或未占领。`,
        
        role_not_found: `[孵化器指令] 不存在「{0}」类型爬爬。`,
        create_ok: '[孵化器指令] 房间「{0}」已添加「{1}」类型爬爬孵化任务，爬爬内存信息：「{2}」。',
    }
}

export default {
    spawn: {
        create: (roomName: string, role: string, memory?: any) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            if (!room || !room.my) {
                return spawnStrings[lang].room_not_found.format(roomName);
            }
            if (!SPAWN_MISSION[role]) {
                return spawnStrings[lang].role_not_found.format(role);
            }

            if (!memory) memory = {}
            memory.home = roomName;

            addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION[role], memory);
            return spawnStrings[lang].create_ok.format(roomName, role, JSON.stringify(memory));
        }
    }
}