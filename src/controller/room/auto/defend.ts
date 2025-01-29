import { CREEP_ROLE } from "@/constant/creep";
import { addMission } from "../mission/pool";
import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { updateSpawnCreepNum } from "../function";

export const roomDefendCheck = (room: Room) => {
    // 安全模式不需要管
    if (room.controller.safeMode) return ;

    // 关于主动防御的检查
    if (Game.time % 5) return;

    if (!Memory.Whitelist) Memory.Whitelist = [];
    const hostiles = room.find(FIND_HOSTILE_CREEPS, {
        filter: c => !Memory.Whitelist.includes(c.owner.username) &&
                    c.owner.username !== 'Source Keeper' &&
                    c.owner.username !== 'Invader' &&
                    (c.getActiveBodyparts(ATTACK) > 0 ||
                        c.getActiveBodyparts(RANGED_ATTACK) > 0 ||
                        c.getActiveBodyparts(HEAL) > 0
                    )
    });

    if (hostiles.length === 0) {
        if (!global.Hostiles) global.Hostiles = {}
        global.Hostiles[room.name] = [];
        room.memory.defend = false;
        return ;
    }
    room.memory.defend = true;
    
    if (!global.Hostiles) global.Hostiles = {}
    global.Hostiles[room.name] = hostiles.map(c => c.id);
    if (room.level >= 7) {

    } else {
        const attackDefender = Object.values(Game.creeps).filter(c => c.room.name === room.name && c.memory.role === CREEP_ROLE.DEFEND_ATTACKER);

        if (!global.SpawnMissionNum[room.name]) updateSpawnCreepNum(room);

        let attackQueueNum = global.SpawnMissionNum[room.name][CREEP_ROLE.DEFEND_ATTACKER] || 0;
        if (attackDefender.length + attackQueueNum < 1) {
            addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.defend_attacker, { home: room.name });
        }
    }
}