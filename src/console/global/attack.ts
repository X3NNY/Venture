import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";

const attackStrings = {
    cn: {
        compound: '化合物',
        amount: '数量',

        help: '化工厂指令\n',
        
        room_illegal: '[房间指令] 房间名不合法。',
        room_not_found: `[进攻指令] 房间「{0}」未在控制列表或未占领。`,
        
    },
    us: {
        room_illegal: '[房间指令] 房间名不合法。',
        room_not_found: `[进攻指令] 房间「{0}」未在控制列表或未占领。`,
    }
}

export default {
    attack: {
        go: (roomName: string, targetRoom: string, options?: AttackOptions) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            if (!room) {
                return attackStrings[lang].room_not_found.format(roomName);
            }

            if (!targetRoom.match(/^[EW]\d+[NS]\d+$/)) {
                return attackStrings[lang].room_illegal.format(targetRoom);
            }

            const type = options?.type || 'duo';
            const action = options?.action || 'attack'
            const num = options?.num || 1;

            const squadName = (Game.time*36*36 + Math.floor(Math.random()*36*36)).toString(36).slice(-4).toUpperCase();

            const missions = [];

            // if (type === 'solo') {
            //     if (action === 'attack') missions.push(SPAWN_MISSION.solo_attacker);
            //     else if (action === 'support') missions.push(SPAWN_MISSION.solo_supporter);
            // } else if (type === 'duo') {
            //     if (action === 'attack') missions.push(SPAWN_MISSION.squad_attacker);
            //     else if (action === 'dismantle') missions.push(SPAWN_MISSION.squad_demolition);
            //     missions.push(SPAWN_MISSION.squad_healer);
            // } else if (type === 'trio') {
            //     missions.push(SPAWN_MISSION.squad_attacker);
            //     missions.push(SPAWN_MISSION.squad_dismantle);
            //     missions.push(SPAWN_MISSION.squad_healer);
            // } else if (type === 'quad') {
            //     missions.push(SPAWN_MISSION.squad_attacker);
            //     missions.push(SPAWN_MISSION.squad_dismantle);
            //     missions.push(SPAWN_MISSION.squad_healer);
            //     missions.push(SPAWN_MISSION.squad_healer);
            // }

            for (const mission of missions) {
                addMission(room, MISSION_TYPE.SPAWN, mission, {
                    squad: squadName,
                    targetRoom: targetRoom
                });
            }

        }
    }
}