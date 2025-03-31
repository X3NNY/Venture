import { roomInfoUpdate } from "@/controller/room/auto/info";
import { coordCompress } from "@/util/coord";

const roomStrings = {
    cn: {
        room_illegal: '[房间指令] 房间名不合法。',
        room_not_found: `[市场指令] 房间「{0}」未在控制列表或未占领。`,
    },
    us: {
        room_illegal: '',
        room_not_found: `[市场指令] 房间「{0}」未在控制列表或未占领。`,
    }
}

const rampartDFS = (roomName: string, start: [number, number], walls: number[]) => {
    const queue = [start];
    while (queue.length > 0) {
        const [x, y] = queue.pop();

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const [nx, ny] = [x + i, y + j];
                if (nx < 1 || nx >= 49 || ny < 1 || ny >= 49) continue;
    
                if (walls.indexOf(coordCompress([nx, ny]) as number) !== -1) continue;
    
                if (new RoomPosition(nx, ny, roomName).lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_WALL)) {
                    walls.push(coordCompress([nx, ny]) as number);
                    queue.push([nx, ny]);
                }
            }
        }
    }
    
}

export default {
    room: {
        add_outMineral: (roomName: string, targetRoom: string) => {
            const lang = Memory.lang || 'cn';
            if (!Memory.RoomInfo[roomName].OutMineral) Memory.RoomInfo[roomName].OutMineral = {};
            const isRoom = /^[EW]\d+[NS]\d+$/.test(targetRoom); // 中间房间
            const isCenterRoom = /^[EW]\d*[456][NS]\d*[456]$/.test(targetRoom); // 中间房间
            const isNotHighway = /^[EW]\d*[1-9][NS]\d*[1-9]$/.test(targetRoom); // 非过道房间

            if (!isRoom) {
                return roomStrings[lang].room_illegal;
            }

            // 普通房间
            if (!isCenterRoom && isNotHighway) {
                if (!Memory.RoomInfo[roomName].OutMineral.energy) {
                    Memory.RoomInfo[roomName].OutMineral.energy = [];
                }

                if (Memory.RoomInfo[roomName].OutMineral.energy.indexOf(targetRoom) === -1) {
                    Memory.RoomInfo[roomName].OutMineral.energy.push(targetRoom);
                    console.log(`[指令] 房间 ${targetRoom} 已添加到房间 ${roomName} 的外矿列表。`);
                    return OK;
                } else {
                    console.log(`[指令] 房间 ${targetRoom} 已存在于房间 ${roomName} 的外矿列表。`);
                    return OK;
                }
            }
            // 过道房间
            else if(!isNotHighway) {
                if (!Memory.RoomInfo[roomName].OutMineral.highway) {
                    Memory.RoomInfo[roomName].OutMineral.highway = [];
                }

                if (Memory.RoomInfo[roomName].OutMineral.highway.indexOf(targetRoom) === -1) {
                    Memory.RoomInfo[roomName].OutMineral.highway.push(targetRoom);
                    console.log(`[指令] 通道房间 ${targetRoom} 已添加到房间 ${roomName} 的监控列表。`);
                    return OK;
                } else {
                    console.log(`[指令] 通道房间 ${targetRoom} 已存在于房间 ${roomName} 的监控列表。`);
                    return OK;
                }
            }
            // 中央九房
            else {
                if (!Memory.RoomInfo[roomName].OutMineral.center) {
                    Memory.RoomInfo[roomName].OutMineral.center = [];
                }

                if (Memory.RoomInfo[roomName].OutMineral.center.indexOf(targetRoom) === -1) {
                    Memory.RoomInfo[roomName].OutMineral.center.push(targetRoom);
                    console.log(`[指令] 中央房间 ${targetRoom} 已添加到房间 ${roomName} 的外矿列表。`);
                    return OK;
                } else {
                    console.log(`[指令] 中央房间 ${targetRoom} 已存在于房间 ${roomName} 的外矿列表。`);
                    return OK;
                }
            }
        },
        remove_outMineral: (roomName: string, targetRoom: string) => {
            const lang = Memory.lang || 'cn';
            if (!Memory.RoomInfo[roomName].OutMineral) Memory.RoomInfo[roomName].OutMineral = {};
            const isRoom = /^[EW]\d+[NS]\d+$/.test(targetRoom); // 房间 
            const isCenterRoom = /^[EW]\d*[456][NS]\d*[456]$/.test(targetRoom); // 中间房间
            const isNotHighway = /^[EW]\d*[1-9][NS]\d*[1-9]$/.test(targetRoom); // 非过道房间

            if (!isRoom) {
                return roomStrings[lang].room_illegal;
            }
            // 普通房间
            if (!isCenterRoom && isNotHighway) {
                if (!Memory.RoomInfo[roomName].OutMineral.energy) {
                    Memory.RoomInfo[roomName].OutMineral.energy = [];
                }
                const pos = Memory.RoomInfo[roomName].OutMineral.energy.indexOf(targetRoom);
                if (pos === -1) {
                    console.log(`[指令] 房间 ${targetRoom} 不在房间 ${roomName} 的外矿列表。`);
                    return OK;
                } else {
                    Memory.RoomInfo[roomName].OutMineral.energy.splice(pos, 1);
                    console.log(`[指令] 房间 ${targetRoom} 已从房间 ${roomName} 的外矿列表中删除。`);
                    return OK;
                }
            }
            // 过道房间
            else if(!isNotHighway) {
                if (!Memory.RoomInfo[roomName].OutMineral.highway) {
                    Memory.RoomInfo[roomName].OutMineral.highway = [];
                }

                const pos = Memory.RoomInfo[roomName].OutMineral.highway.indexOf(targetRoom);
                if (pos === -1) {
                    console.log(`[指令] 通道房间 ${targetRoom} 不在房间 ${roomName} 的监控列表。`);
                    return OK;
                } else {
                    Memory.RoomInfo[roomName].OutMineral.highway.splice(pos, 1);
                    console.log(`[指令] 通道房间 ${targetRoom} 已存在于房间 ${roomName} 的监控列表中删除。`);
                    return OK;
                }
            }
            // 中央九房
            else {
                if (!Memory.RoomInfo[roomName].OutMineral.center) {
                    Memory.RoomInfo[roomName].OutMineral.center = [];
                }
                const pos = Memory.RoomInfo[roomName].OutMineral.center.indexOf(targetRoom);
                if (pos === -1) {
                    console.log(`[指令] 中央房间 ${targetRoom} 不在房间 ${roomName} 的外矿列表。`);
                    return OK;
                } else {
                    Memory.RoomInfo[roomName].OutMineral.center.splice(pos, 1);
                    console.log(`[指令] 中央房间 ${targetRoom} 已从房间 ${roomName} 的外矿列表中删除。`);
                    return OK;
                }
            }
        },
        update: (roomName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            if (!room || !room.my) {
                return roomStrings[lang].room_not_found.format(roomName);
            }
            roomInfoUpdate(room, true);
        },
        update_structure: (roomName: string, remove: boolean = false) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            if (!room || !room.my) {
                return roomStrings[lang].room_not_found.format(roomName);
            }

            if (remove) {
                Memory.Layout[roomName] = {};
                if (room.spawn) Memory.Layout[roomName]['spawn'] = coordCompress(room.spawn.map<any>(s => [s.pos.x, s.pos.y]));
                if (room.extension) Memory.Layout[roomName]['extension'] = coordCompress(room.extension.map<any>(e => [e.pos.x, e.pos.y]));
                if (room.rampart) Memory.Layout[roomName]['rampart'] = coordCompress(room.rampart.map<any>(r => [r.pos.x, r.pos.y]));
                if (room.tower) Memory.Layout[roomName]['tower'] = coordCompress(room.tower.map<any>(t => [t.pos.x, t.pos.y]));
                if (room.lab) Memory.Layout[roomName]['lab'] = coordCompress(room.lab.map<any>(l => [l.pos.x, l.pos.y]));
                if (room.link) Memory.Layout[roomName]['link'] = coordCompress(room.link.map<any>(l => [l.pos.x, l.pos.y]));
                if (room.road) Memory.Layout[roomName]['road'] = coordCompress(room.road.map<any>(r => [r.pos.x, r.pos.y]));
                if (room.rampart) Memory.Layout[roomName]['rampart'] = coordCompress(room.rampart.map<any>(r => [r.pos.x, r.pos.y]));

                if (room.terminal) Memory.Layout[roomName]['terminal'] = [coordCompress([room.terminal.pos.x, room.terminal.pos.y])];
                if (room.observer) Memory.Layout[roomName]['observer'] = [coordCompress([room.observer.pos.x, room.observer.pos.y])];
                if (room.storage) Memory.Layout[roomName]['storage'] = [coordCompress([room.storage.pos.x, room.storage.pos.y])];
                if (room.nuker) Memory.Layout[roomName]['nuker'] = [coordCompress([room.nuker.pos.x, room.nuker.pos.y])];
                if (room.powerSpawn) Memory.Layout[roomName]['powerSpawn'] = [coordCompress([room.powerSpawn.pos.x, room.powerSpawn.pos.y])];
                if (room.extractor) Memory.Layout[roomName]['extractor'] = [coordCompress([room.extractor.pos.x, room.extractor.pos.y])];
                if (room.factory) Memory.Layout[roomName]['factory'] = [coordCompress([room.factory.pos.x, room.factory.pos.y])];

                const walls = [];

                for (const r of room.rampart) {
                    rampartDFS(roomName, [r.pos.x, r.pos.y], walls);
                }
                Memory.Layout[roomName]['rampart'].push(...walls);
            }
            
        }
    }
}