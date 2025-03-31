const powerSpawnStrings = {
    cn: {
        room_not_found: `[超爬孵化器指令] 房间「{0}」未在控制列表或未占领。`,
        open_ok: '[超爬孵化器指令] 房间「{0}」超爬孵化器已开启。',
        stop_ok: '[超爬孵化器指令] 房间「{0}」超爬孵化器已关闭。',
    },
    us: {
        room_not_found: `[超爬孵化器指令] 房间「{0}」未在控制列表或未占领。`,
        open_ok: '[超爬孵化器指令] 房间「{0}」超爬孵化器已开启。',
        stop_ok: '[超爬孵化器指令] 房间「{0}」超爬孵化器已关闭。',
    }
}

export default {
    ps: {
        open: (roomName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            if (!room || !room.my || !mem) {
                return powerSpawnStrings[lang].room_not_found.format(roomName);
            }

            if (!mem.powerSpawn) {
                mem.powerSpawn = {
                    open: true,
                }
            } else {
                mem.powerSpawn.open = true;
            }
            return powerSpawnStrings[lang].open_ok.format(roomName);
        },
        stop: (roomName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            if (!room ||!room.my ||!mem) {
                return powerSpawnStrings[lang].room_not_found.format(roomName);
            }

            mem.powerSpawn.open = false;
            return powerSpawnStrings[lang].stop_ok.format(roomName);
        },
        spawn: (roomName: string, pcName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            if (!room || !room.my || !mem) {
                return powerSpawnStrings[lang].room_not_found.format(roomName);
            }

            const pc = Game.powerCreeps[pcName];
            if (!pc) {
                return Error(`PC ${pcName} 不存在`)
            }

            const result = pc.spawn(room.powerSpawn);
            return result;
        },
        set_spawn: (roomName: string, pcName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            if (!room || !room.my || !mem) {
                return powerSpawnStrings[lang].room_not_found.format(roomName);
            }

            const pc = Game.powerCreeps[pcName];
            if (!pc) {
                return Error(`PC ${pcName} 不存在`)
            }

            pc.memory.spawnRoom = roomName;
            return OK;
        }
        
    }
}