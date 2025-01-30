import autoPlanner63 from "@/module/layout/dynamic/autoPlanner63";
import { coordCompress, coordDecompress } from "@/util/coord";
import layoutVisual from '@/module/layout/visual';

export default {
    layout: {
        // 构建布局
        build: (roomName: string) => {
            if (!Memory.RoomInfo[roomName]) {
                return Error(`房间 ${roomName} 未在控制列表。`);
            }
            const layoutInfo = Memory.Layout[roomName];
            if (layoutInfo && Object.keys(layoutInfo).length > 0) {
                return Error(`房间 ${roomName} 已构建过布局。`)
            }

            const layoutType = Memory.RoomInfo[roomName].layout;
            let res;

            if (!layoutType || layoutType === '63') {
                res = layoutDynamicPlanner(roomName, '63');
            }

            if (res !== OK) {
                return Error(res);
            }
        },
        visual: (roomName: string, layout?: string) => {
            let cpu = Game.cpu.getUsed();
            let layoutInfo = Memory.Layout[roomName];
    
            const result = layoutVisualShow(roomName, layoutInfo);
    
            cpu = Game.cpu.getUsed() - cpu;
            if (result === OK) {
                console.log(`可视化完成，消耗 ${cpu.toFixed(2)} CPU`);
            } else {
                console.log(`可视化失败，消耗 ${cpu.toFixed(2)} CPU`);
            }
        }
    },
}

export const layoutVisualShow = (roomName: string, layoutInfo?: any) => {
    let structMap = {};
    if (layoutInfo) {
        for (const s in layoutInfo) {
            structMap[s] = coordDecompress(layoutInfo[s]);
        }
    } else {
        const room = Game.rooms[roomName];
        const pa = room.source?.[0]?.pos || room.find(FIND_SOURCES)[0]?.pos;
        const pb = room.source?.[1]?.pos || room.find(FIND_SOURCES)[1]?.pos;
        const pm = room.mineral?.pos || room.find(FIND_MINERALS)[0]?.pos;
        const pc = room.controller?.pos;
        structMap = autoPlanner63.ManagerPlanner.computeManor(roomName, [pc, pm, pa, pb]);
    }
    layoutVisual.showRoomStructures(roomName, structMap);
    return OK
}

export const layoutDynamicPlanner = (roomName: string, type: string) => {
    if (Game.cpu.bucket < 100) {
        return `CPU容量不足100。`
    }
    
    const room = Game.rooms[roomName];
    if (!room) return `房间 ${roomName} 不存在或不可见。`
    
    const pa = room.source?.[0]?.pos || room.find(FIND_SOURCES)[0]?.pos;
    const pb = room.source?.[1]?.pos || room.find(FIND_SOURCES)[1]?.pos;
    const pm = room.mineral?.pos || room.find(FIND_MINERALS)[0]?.pos;
    const pc = room.controller?.pos;

    if (!pa || !pb) return `房间 ${roomName} 能量源不足两个。`;
    if (!pm) return `房间 ${roomName} 不存在矿藏`;
    if (!pc) return `房间 ${roomName} 不存在控制器。`;

    const structureData = autoPlanner63.ManagerPlanner.computeManor(roomName, [pc, pm, pa, pb]);
    
    if (!structureData)  {
        return `房间 ${roomName} 63布局失败。`;
    }

    Memory.RoomInfo[roomName].layout = '63';
    Memory.RoomInfo[roomName].center = {
        x: structureData.storagePos.storageX,
        y: structureData.storagePos.storageY
    }
    Memory.Layout[roomName] = {}

    const layoutInfo = Memory.Layout[roomName];
    for (const s in structureData.structMap) {
        layoutInfo[s] = coordCompress(structureData.structMap[s]);
    }
    console.log(`房间 ${roomName} 布局已生成。`);
    console.log(`Storage集群中心位置：${JSON.stringify(structureData.storagePos)}`);
    console.log(`Lab中心位置：${JSON.stringify(structureData.labPos)}`);
    return OK;
}