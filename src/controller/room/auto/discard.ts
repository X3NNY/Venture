import { MANAGE_MISSION, MISSION_TYPE, SPAWN_MISSION, TERMINAL_MISSION } from "@/constant/mission";
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
        if (countMission(room, MISSION_TYPE.MANAGE, m => m.data.target === room.terminal.id && m.data.resourceType === rType) > 0) {
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

    if (resource <= 0) {
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

    const ccs = (global.CreepNum[room.name][CREEP_ROLE.CARRIER] || 0) + (global.SpawnCreepNum[room.name][CREEP_ROLE.CARRIER] || 0);

    if (ccs < 1) {
        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.carrier, {
            home: room.name
        }); 
    }

    roomStructureLink.work(room);
    roomStructureSpawn.work(room);
}