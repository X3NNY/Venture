/**
 * 检查资源是否足够
 * @param room 房间对象
 * @param inputs 资源数组，{RESOURCE: amount}
 * @returns 
 */
export const checkRoomResourceAvailable = (room: Room, inputs: Partial<Record<ResourceConstant, number>>): boolean => {
    for (const [resource, amount] of Object.entries(inputs)) {
        const total = (room.storage?.store[resource] || 0) +
                    (room.terminal?.store[resource] || 0);
        
        if (total < amount) {
            return false;
        }
    }
    return true;
}

export const checkRoomResourceSharable = (room: Room, rType: ResourceConstant, needAmount: number = 0): string|null => {
    if (!Memory.Resource[rType]) return ;

    for (const roomName in Memory.Resource[rType]) {
        if (roomName === room.name) continue;
        const tRoom = Game.rooms[roomName];

        if (!tRoom || !tRoom.terminal) continue;

        if ((tRoom.storage?.store[rType]||0) +
            (tRoom.terminal.store[rType]||0) > Memory.Resource[rType][roomName] + needAmount) {
            return roomName;
        }
    }
}