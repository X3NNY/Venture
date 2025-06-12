import { CreepRoleBody } from "@/constant/creep";
import { MISSION_TYPE, SPAWN_MISSION, TERMINAL_MISSION } from "@/constant/mission";
import { addMission } from "@/controller/room/mission/pool";
import { roomStructureLab } from "@/controller/room/structure/lab";

export default {
    colddown: 1000,
    prepare: (flag: Flag) => {
        const type = flag.name.match(/-T\[(.+?)\]/)?.[1] || 'ATTACK';
        const boostLevel = flag.name.match(/-B\[(\d+)\]/)?.[1] || 1;
        const body = flag.name.match(/-F\[(.+?)\]/)?.[1] || 'body';
        flag.memory.data = { type, boostLevel, body }
        return true;
    },
    action: (flag: Flag) => {
        const spawnRoomName = flag.name.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];
        const spawnRoom = Game.rooms[spawnRoomName];
        if (!spawnRoom ||!spawnRoom.my) {
            flag.remove();
            return false;
        }

        if ((spawnRoom.storage?.store.energy||0) < 10000) {
            return false;
        }

        const targetRoom = flag.pos.roomName;
        const type = flag.memory.data.type;
        const bootLevel = flag.memory.data.boostLevel || 1;
        const body = flag.memory.data.body || 'body';

        if (type === 'ATTACK') {
            if (bootLevel > 0) {
                let boostPart: any[] = [{
                    [TOUGH]: [['XGHO2', 'GHO2', 'GO'][3-bootLevel]],
                    [ATTACK]: [['XUH2O', 'UH2O', 'UH'][3-bootLevel]],
                    [MOVE]: [['XZHO2', 'ZHO2', 'ZO'][3-bootLevel]]
                }, {
                    [TOUGH]:[['XGHO2', 'GHO2', 'GO'][3-bootLevel]],
                    [HEAL]: [['XLHO2', 'LHO2', 'LO'][3-bootLevel]],
                    [MOVE]: [['XZHO2', 'ZHO2', 'ZO'][3-bootLevel]]
                }]
                if (body === 'W20M25') {
                    boostPart = [{
                        [TOUGH]: [['XGHO2', 'GHO2', 'GO'][3-bootLevel]],
                        [ATTACK]: [['XUH2O', 'UH2O', 'UH'][3-bootLevel]],
                    }, {
                        [TOUGH]: [['XGHO2', 'GHO2', 'GO'][3-bootLevel]],
                        [HEAL]: [['XLHO2', 'LHO2', 'LO'][3-bootLevel]],
                    }]
                } else if (body === 'W25M25') {
                    boostPart = [{
                        [ATTACK]: [['XUH2O', 'UH2O', 'UH'][3-bootLevel]],
                    }, {
                        [HEAL]: [['XLHO2', 'LHO2', 'LO'][3-bootLevel]],
                    }]
                }
                let res = roomStructureLab.setBoostByBody(spawnRoom, CreepRoleBody.double_attacker[spawnRoom.level].body, boostPart[0])
                if (!res[0]) {
                    let rType;
                    if (res[1] === TOUGH) {
                        rType = ['XGHO2', 'GHO2', 'GO'][3-bootLevel];
                    } else if (res[1] === ATTACK) {
                        rType = ['XUH2O', 'UH2O', 'UH'][3-bootLevel];
                    } else {
                        rType = ['XZHO2', 'ZHO2', 'ZO'][3-bootLevel];
                    }
                    roomStructureLab.addTarget(spawnRoom, rType, 1000);
                    addMission(spawnRoom, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.request, {
                        rType: rType,
                        amount: 1000,
                    })
                    console.log(flag.name, `${res[1]}-BOOST 资源不足`);
                    return false;
                }
                res = roomStructureLab.setBoostByBody(spawnRoom, CreepRoleBody.double_healer[spawnRoom.level].body, boostPart[1])
                if (!res[0]) {
                    let rType;
                    if (res[1] === TOUGH) {
                        rType = ['XGHO2', 'GHO2', 'GO'][3-bootLevel];
                    } else if (res[1] === HEAL) {
                        rType = ['XLHO2', 'LHO2', 'LO'][3-bootLevel];
                    } else {
                        rType = ['XZHO2', 'ZHO2', 'ZO'][3-bootLevel];
                    }
                    roomStructureLab.addTarget(spawnRoom, rType, 1000);
                    addMission(spawnRoom, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.request, {
                        rType: rType,
                        amount: 1000,
                    })
                    console.log(flag.name, `${res[1]}-BOOST 资源不足`)
                    return false;
                }
            }

            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.double_attacker, {
                home: spawnRoom.name,
                targetRoom: targetRoom,
                opts: { body }
            });
            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.double_healer, {
                home: spawnRoom.name,
                targetRoom: targetRoom,
                opts: { body }
            });
        } else if (type == 'DISMANTLE') {
            let res = roomStructureLab.setBoostByBody(spawnRoom, CreepRoleBody.double_dismantler[spawnRoom.level].body, {
                [TOUGH]: ['XGHO2', 'GHO2', 'GO'],
                [WORK]: ['XZH2O', 'ZH2O', 'ZH'],
                [MOVE]: ['XZHO2', 'ZHO2', 'ZO']
            })
            if (!res[0]) {
                console.log(flag.name, `${res[1]}-BOOST 资源不足`);
                return false;
            }
            res = roomStructureLab.setBoostByBody(spawnRoom, CreepRoleBody.double_healer[spawnRoom.level].body, {
                [TOUGH]:['XGHO2', 'GHO2', 'GO'],
                [HEAL]: ['XLHO2', 'LHO2', 'LO'],
                [MOVE]: ['XZHO2', 'ZHO2', 'ZO']
            })
            if (!res[0]) {
                console.log(flag.name, `${res[1]}-BOOST 资源不足`);
                return false;
            }
            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.double_dismantler, {
                home: spawnRoom.name,
                targetRoom: targetRoom,
                opts: { body }
            })
            addMission(spawnRoom, MISSION_TYPE.SPAWN, SPAWN_MISSION.double_healer, {
                home: spawnRoom.name,
                targetRoom: targetRoom,
                opts: { body }
            });
        }
    }
}