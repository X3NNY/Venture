import { roomAutoBuild } from "./auto/build";
import { roomDefendCheck } from "./auto/defend";
import { roomDiscard } from "./auto/discard";
import { roomInfoUpdate } from "./auto/info";
import { roomOutMine } from "./auto/outMine";
import { roomResourceCheck } from "./auto/resource";
import { roomAutoTransaction } from "./auto/transaction";
import { roomMissionUpdate, roomMissionInit } from "./mission";
import { roomStructureWork } from "./structure";

export const roomInit = (room: Room) => {
    // global.CreepNum[room.name] = {}
    // global.SpawnCreepNum[room.name] = {}
    roomMissionInit(room);
    room.update();
    room.memory.init = true;
}

export const eventLoop = (room: Room) => {
    // 更新建筑缓存
    if (Game.time % 300 == 0) room.update();

    // 是否自己的房间
    if (!room || !room.controller?.my) return ;
    
    // 自动模式下自动添加房间信息
    if (!Memory.RoomInfo[room.name]) {
        if (Memory.gamemode === 'auto') {
            Memory.RoomInfo[room.name] = {
                autobuild: true,
            }
        } else return ;
    }

    // 如果不要这个房了
    if (room.memory.discard) {
        roomDiscard(room);
        return ;
    }

    if (Game.time % 100 == 0) {
        // 分配高复杂度代码的运行帧
        room.memory.index = Math.floor(Math.random() * 100); // 0-99
    }

    if (!room.memory.init) roomInit(room);
    roomMissionUpdate(room);                // 更新房间运维任务
    roomStructureWork(room);                // 建筑行为
    roomAutoBuild(room);                    // 自动建设
    roomDefendCheck(room);                  // 防御检测
    roomAutoTransaction(room);              // 自动交易
    roomOutMine(room);                      // 外矿采集
    roomResourceCheck(room);                // 资源管理
    
    if (Memory.gamemode === 'auto') {
        roomInfoUpdate(room);               // 更新房间信息
    }
    
}