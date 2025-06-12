import { MANAGE_MISSION, MISSION_TYPE, SPAWN_MISSION, TERMINAL_MISSION, TRANSPORT_MISSION } from "@/constant/mission";
import { addMission, countMission } from "../mission/pool";
import { updateCreepNum, updateSpawnCreepNum } from "../function";
import { CREEP_ROLE } from "@/constant/creep";
import { roomStructureSpawn } from "../structure/spawn";
import { roomStructureLink } from "../structure/link";

const roomTerminalSendResource = (room: Room) => {
    if (!room.terminal || room.terminal.cooldown !== 0) return ;

    const resources = Object.keys(room.terminal.store);
    const [roomName, dist] = Object.keys(Game.rooms).filter(r => r !== room.name && Game.rooms[r]?.my && Game.rooms[r].terminal).reduce((res: [string, number], roomName) => {
        const dist = Game.map.getRoomLinearDistance(room.name, roomName);
        if (dist < res[1]) {
            res[1] = dist;
            res[0] = roomName;
        }
        return res;
    }, [null, 0xffff]);
    if (!roomName) return ;
    for (const rType of resources) {
        if (rType === RESOURCE_ENERGY && resources.length > 1) continue;

        let amount = room.terminal.store[rType];

        let eCost = Game.market.calcTransactionCost(amount, room.name, roomName);

        if (rType === RESOURCE_ENERGY) {
            amount = Math.min(amount, room.terminal.store[RESOURCE_ENERGY] - eCost); 
        }

        if (eCost > room.terminal.store[RESOURCE_ENERGY]) {
            amount = Math.floor(amount * (room.terminal.store[RESOURCE_ENERGY] / eCost)); 
        }

        if (amount <= 0) continue;
        eCost = Game.market.calcTransactionCost(amount, room.name, roomName);
        room.terminal.send(rType as ResourceConstant, amount, roomName);
        console.log(`[资源发送] ${room.name} -> ${roomName}, ${amount} ${rType}, 消耗能量：${eCost}`);
        break;
    }
    return resources.length;
}

const roomStorageSendResource = (room: Room) => {
    if (Game.time % 15!== 0) return ;
    if (!room.storage) return ;
    let resources = Object.keys(room.storage.store);
    for (const rType of resources) {
        if (room.terminal) {
            if (countMission(room, MISSION_TYPE.MANAGE, m => m.data.target === room.terminal.id && m.data.resourceType === rType) > 0) {
                continue;
            }
            addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.s2t, {
                rType,
                amount: room.storage.store[rType]
            })
        }
    }

    return resources.length;
}

const roomFactorySendResource = (room: Room) => {
    if (Game.time % 30!== 0) return ;
    if (!room.factory) return ;
    let resources = Object.keys(room.factory.store); 
    for (const rType of resources) {
        if (!countMission(room, MISSION_TYPE.MANAGE, m => m.data.target === room.terminal.id && m.data.resourceType === rType)) {
            addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.f2t, {
                rType,
                amount: room.factory.store[rType]
            })
        }
    }
    return resources.length;
}

const roomDeclaim = (room: Room) => {
    room.find(FIND_MY_CREEPS).forEach(c => c.suicide());
    delete Memory.RoomInfo[room.name];
    delete Memory.Layout[room.name];
    delete Memory.rooms[room.name];
    Memory.System.rooms -= 1;
    for (const rType of Object.keys(Memory.Resource)) {
        if (Memory.Resource[rType][room.name]) {
            delete Memory.Resource[rType][room.name];
        }
    }
    room.controller.unclaim();
    console.log('ready to declaim');
}


export const roomDiscard = (room: Room) => {
    if (room.level < 6) {
        roomDeclaim(room);
        return ;
    }
    let resource = 0;
    resource += roomStorageSendResource(room);
    resource += roomFactorySendResource(room);
    resource += roomTerminalSendResource(room);

    if (Game.time % 10 === 0) {
        room.lab.forEach(lab => {
            if (lab.store[RESOURCE_ENERGY] > 0 || lab.mineralType) {
                resource += 1;
                if (!countMission(room, MISSION_TYPE.TRANSPORT, m => m.data.target === room.terminal.id && m.data.source == lab.id)) {
                    addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                        source: lab.id,
                        target: room.terminal.id,
                        pos: lab.pos,
                        rType: lab.store[RESOURCE_ENERGY] > 0 ? RESOURCE_ENERGY : lab.mineralType,
                        amount: lab.store[RESOURCE_ENERGY] > 0 ? lab.store[RESOURCE_ENERGY] : lab.store[lab.mineralType]
                    })
                }
            }
        })

        if (room.powerSpawn?.store[RESOURCE_ENERGY] > 0) {
            resource += 1;
            if (!countMission(room, MISSION_TYPE.TRANSPORT, m => m.data.target === room.terminal.id && m.data.source == room.powerSpawn.id)) {
                addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                    source: room.powerSpawn.id,
                    target: room.terminal.id, 
                    pos: room.powerSpawn.pos,
                    rType: RESOURCE_ENERGY,
                    amount: room.powerSpawn.store[RESOURCE_ENERGY]
                }) 
            }
        }
        if (room.powerSpawn?.store[RESOURCE_POWER] > 0) {
            resource += 1;
            if (!countMission(room, MISSION_TYPE.TRANSPORT, m => m.data.target === room.terminal.id && m.data.source == room.powerSpawn.id)) {
                addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                    source: room.powerSpawn.id,
                    target: room.terminal.id,
                    pos: room.powerSpawn.pos,
                    rType: RESOURCE_POWER,
                    amount: room.powerSpawn.store[RESOURCE_POWER] 
                }) 
            } 
        }

        room.find(FIND_RUINS, { filter: r => Object.keys(r.store).length > 0 }).forEach(r => {
            for (const rType in r.store) {
                resource += 1;
                if (!countMission(room, MISSION_TYPE.TRANSPORT, m => m.data.target === room.terminal.id && m.data.source == r.id)) {
                    addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                        source: r.id,
                        target: room.terminal.id,
                        pos: r.pos,
                        rType: rType as ResourceConstant,
                        amount: r.store[rType as ResourceConstant] 
                    })
                } 
            } 
        })
    } else {
        resource += 1;
    }

    if (resource <= 1) {
        return roomDeclaim(room);
    }

    updateCreepNum(room);
    updateSpawnCreepNum(room);

    const mcs = (global.CreepNum[room.name][CREEP_ROLE.MANAGER] || 0) + (global.SpawnCreepNum[room.name][CREEP_ROLE.MANAGER] || 0);
    if (mcs < 1) {
        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.manager, {
            home: room.name
        });
    }

    const cos = (global.CreepNum[room.name][CREEP_ROLE.COURIER] || 0) + (global.SpawnCreepNum[room.name][CREEP_ROLE.COURIER] || 0);

    if (cos < 1) {
        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.courier, {
            home: room.name
        }); 
    }

    roomStructureLink.work(room);
    roomStructureSpawn.work(room);
}