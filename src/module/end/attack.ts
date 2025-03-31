import { CreepBoosts, CreepRoleBody } from "@/constant/creep";
import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";
import { roomStructureLab } from "@/controller/room/structure/lab";

export const endAttackCheck = () => {
    if (Game.time % 10 !== 0) return;

    for (const flag in Game.flags) {
        if (flag.startsWith('AIO')) {
            if (Game.time - (Game.flags[flag].memory['lastTime']||0) < 500) continue;

            const spawnRoomName = flag.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];
            const spawnRoom = Game.rooms[spawnRoomName];
            if (!spawnRoom || !spawnRoom.my) {
                Game.flags[flag].remove();
                continue;
            }

            const targetRoom = Game.flags[flag].pos.roomName;
            const B = flag.match(/\/-B\[(.+)\]$/)?.[1] || '2T';
            

            // const result = roomStructureLab.setBoostByBody(CreepBoosts['aio'][B].body, CreepBoosts['aio'][B].BOOST);

            // if (!result) {
            //     console.log('AIO BOOST 资源不足', B);
            //     Game.flags[flag].remove();
            //     continue;
            // }

            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.aio, {
                home: spawnRoom.name,
                BOOST: CreepBoosts['aio'][B].BOOST,
                targetRoom: targetRoom,
            })
            Game.flags[flag].memory['lastTime'] = Game.time;
        }
        if (flag.startsWith('DOUBLE')) {
            if (Game.time - (Game.flags[flag].memory['lastTime']||0) < 1000) continue;

            const spawnRoomName = flag.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];
            const spawnRoom = Game.rooms[spawnRoomName];
            if (!spawnRoom || !spawnRoom.my) {
                Game.flags[flag].remove();
                continue;
            }

            if ((spawnRoom.storage?.store.energy||0) < 10000) {
                continue;
            }

            const targetRoom = Game.flags[flag].pos.roomName;

            const type = flag.match(/-T\[(.+?)\]/)?.[1] || 'attacker';
            console.log(type);

            if (type === 'ATTACK') {
                if (!roomStructureLab.setBoostByBody(spawnRoom, CreepRoleBody.double_attacker[spawnRoom.level].body, {
                    [TOUGH]:['XGHO2', 'GHO2', 'GO'],
                    [ATTACK]: ['XUH2O', 'UH2O', 'UH'],
                    [MOVE]: ['XZHO2', 'ZHO2', 'ZO']
                })) {
                    console.log(flag, 'BOOST资源不足');
                    continue
                }
                if (!roomStructureLab.setBoostByBody(spawnRoom, CreepRoleBody.double_healer[spawnRoom.level].body, {
                    [TOUGH]:['XGHO2', 'GHO2', 'GO'],
                    [HEAL]: ['XLHO2', 'LHO2', 'LO'],
                    [MOVE]: ['XZHO2', 'ZHO2', 'ZO']
                })) {
                    console.log(flag, 'BOOST资源不足');
                    continue
                }
                addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.double_attacker, {
                    home: spawnRoom.name,
                    targetRoom: targetRoom,
                });
                addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.double_healer, {
                    home: spawnRoom.name,
                    targetRoom: targetRoom,
                });
            } else if (type === 'DIS') {
                if (!roomStructureLab.setBoostByBody(spawnRoom, CreepRoleBody.double_dismantler[spawnRoom.level].body, {
                    [TOUGH]: ['XGHO2', 'GHO2', 'GO'],
                    [WORK]: ['XZH2O', 'ZH2O', 'ZH'],
                    [MOVE]: ['XZHO2', 'ZHO2', 'ZO']
                })) {
                    console.log(flag, 'BOOST资源不足');
                    continue
                }
                if (!roomStructureLab.setBoostByBody(spawnRoom, CreepRoleBody.double_healer[spawnRoom.level].body, {
                    [TOUGH]:['XGHO2', 'GHO2', 'GO'],
                    [HEAL]: ['XLHO2', 'LHO2', 'LO'],
                    [MOVE]: ['XZHO2', 'ZHO2', 'ZO']
                })) {
                    console.log(flag, 'BOOST资源不足');
                    continue
                }
                addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.double_dismantler, {
                    home: spawnRoom.name,
                    targetRoom: targetRoom,
                })
                addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.double_healer, {
                    home: spawnRoom.name,
                    targetRoom: targetRoom,
                });
            }

            Game.flags[flag].memory['lastTime'] = Game.time;
        }
    }
}