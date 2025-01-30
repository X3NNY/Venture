export const roomStructureLink = {
    work: (room: Room) => {
        if (room.level < 5 || room.link?.length < 2) return ;

        if (Game.time % 10 !== 0) return ;

        const center = Memory.RoomInfo[room.name]?.center;
        const pos = center ? new RoomPosition(center.x, center.y, room.name) : null;

        let sLink: StructureLink[] = [];           // 能源/矿藏旁边的链接
        let cLink: StructureLink = null;           // 控制器链接
        let mLink: StructureLink = null;           // 中央链接
        let nLink: StructureLink[] = [];           // 其他链接

        for (const link of room.link) {
            if (room.source.some(s => link.pos.inRangeTo(s, 2))) {
                sLink.push(link);
            } else if (link.pos.inRangeTo(room.controller, 2)) {
                cLink = link;
            } else if (center && link.pos.inRangeTo(center.x, center.y, 1)) {
                mLink = link;
            } else {
                nLink.push(link);
            }
        }

        if (!cLink && !mLink) return ;

        const transferLog = {};                     // 记录被传输过能源的链接

        // 从矿区链接传回需求点
        for (const link of sLink) {
            if (link.cooldown !== 0) continue;
            if (link.store[RESOURCE_ENERGY] < 400) continue;
            
            // 控制器链接缺少能量
            if (cLink?.store[RESOURCE_ENERGY] < 400 && !transferLog[cLink.id]) {
                link.transferEnergy(cLink);
                transferLog[cLink.id] = true;
                continue;
            }

            // 其他链接缺少能量
            const nlink = nLink.find(l => l.store[RESOURCE_ENERGY] < 400 && !transferLog[l.id]);
            if (nlink) {
                link.transferEnergy(nlink);
                transferLog[nlink.id] = true;
                continue;
            }

            // 中央链接缺少能量
            if (mLink?.store[RESOURCE_ENERGY] < 400 && !transferLog[mLink.id]) {
                link.transferEnergy(mLink);
                transferLog[mLink.id] = true;
                continue;
            }

            // 都不缺直接退出
            break;
        }

        // 从中央链接传给需求点
        if (cLink?.store[RESOURCE_ENERGY] < 400 && !transferLog[cLink.id]) {
            if (mLink?.cooldown !== 0) return ;
            if (mLink.store[RESOURCE_ENERGY] > 400) {
                return mLink.transferEnergy(cLink);
            }
        }
        if (mLink?.cooldown === 0 && mLink.store[RESOURCE_ENERGY] > 400) {
            const nlink = nLink.find(l => l.store[RESOURCE_ENERGY] < 400 && !transferLog[l.id]);
            if (nlink) {
                return mLink.transferEnergy(nlink);
            }
        }
    }
    
}