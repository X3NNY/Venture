export default {
    room: {
        add_outMineral: (roomName: string, targetRoom: string) => {
            if (!Memory.RoomInfo[roomName].OutMineral) Memory.RoomInfo[roomName].OutMineral = {}; 
            const isCenterRoom = /^[EW]\d*[456][NS]\d*[456]$/.test(targetRoom); // 中间房间
            const isNotHighway = /^[EW]\d*[1-9][NS]\d*[1-9]$/.test(targetRoom); // 非过道房间

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
            if (!Memory.RoomInfo[roomName].OutMineral) Memory.RoomInfo[roomName].OutMineral = {}; 
            const isCenterRoom = /^[EW]\d*[456][NS]\d*[456]$/.test(targetRoom); // 中间房间
            const isNotHighway = /^[EW]\d*[1-9][NS]\d*[1-9]$/.test(targetRoom); // 非过道房间

            // 普通房间
            if (!isCenterRoom && isNotHighway) {
                if (Memory.RoomInfo[roomName].OutMineral.energy) {
                    Memory.RoomInfo[roomName].OutMineral.energy = [];
                }

                if (Memory.RoomInfo[roomName].OutMineral.energy.indexOf(targetRoom) === -1) {
                    console.log(`[指令] 房间 ${targetRoom} 不在房间 ${roomName} 的外矿列表。`);
                    return OK;
                } else {
                    console.log(`[指令] 房间 ${targetRoom} 已从房间 ${roomName} 的外矿列表中删除。`);
                    return OK;
                }
            }
            // 过道房间
            else if(!isNotHighway) {
                if (Memory.RoomInfo[roomName].OutMineral.highway) {
                    Memory.RoomInfo[roomName].OutMineral.highway = [];
                }

                if (Memory.RoomInfo[roomName].OutMineral.highway.indexOf(targetRoom) === -1) {
                    console.log(`[指令] 通道房间 ${targetRoom} 不在房间 ${roomName} 的监控列表。`);
                    return OK;
                } else {
                    console.log(`[指令] 通道房间 ${targetRoom} 已存在于房间 ${roomName} 的监控列表中删除。`);
                    return OK;
                }
            }
            // 中央九房
            else {
                if (Memory.RoomInfo[roomName].OutMineral.center) {
                    Memory.RoomInfo[roomName].OutMineral.center = [];
                }

                if (Memory.RoomInfo[roomName].OutMineral.center.indexOf(targetRoom) === -1) {
                    console.log(`[指令] 中央房间 ${targetRoom} 不在房间 ${roomName} 的外矿列表。`);
                    return OK;
                } else {
                    console.log(`[指令] 中央房间 ${targetRoom} 已从房间 ${roomName} 的外矿列表中删除。`);
                    return OK;
                }
            }
        }
    }
}