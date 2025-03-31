import { filter } from 'lodash';
import { BaseBar, BaseMineral, BoostTarget, Goods, ResourceBarMap } from "@/constant/resource";
import { addMission } from "../mission/pool";
import { MISSION_TYPE, TERMINAL_MISSION, TRANSPORT_MISSION } from "@/constant/mission";
import { roomMarketAddOrder } from "../component/market";
import { roomStructureLab } from "../structure/lab";
import { getRoomNumber } from '../function/get';
import { roomStructureFactory } from '../structure/factory';


export const roomMarketUpdate = (room: Room) => {
    if (!room.terminal) return ;
    // 自动资源挂单
    Object.keys(room.storage.store).forEach((r: ResourceConstant) => {
        if (r === RESOURCE_ENERGY && room.storage.store[r] > 200000) {
            roomMarketAddOrder(room.name, r, ORDER_SELL, 200000);
        } else if (r !== RESOURCE_ENERGY && room.storage.store[r] > 100000) {
            roomMarketAddOrder(room.name, r, ORDER_SELL, 100000);
        }

        if (r !== RESOURCE_ENERGY && room.storage.store[r] > 200000) {
            roomMarketAddOrder(room.name, r, 'deal_sell', 200000);
        }
    })

    const mType = room.mineral?.mineralType;
    // 终端资源共享
    if (!Memory.Resource) Memory.Resource = { [RESOURCE_ENERGY]: { [room.name]: 200000 } }
    if (mType && !Memory.Resource[mType]?.[room.name]) {
        if (!Memory.Resource[mType]) {
            Memory.Resource[mType] = {}
        }
        // OH 自用多一些
        if (mType === RESOURCE_OXYGEN || mType === RESOURCE_HYDROGEN) {
            Memory.Resource[mType][room.name] = 30000;
        }
        // X全部可分享
        else if (mType === RESOURCE_CATALYST){
            Memory.Resource[mType][room.name] = 10000;
        }
        // 商品
        else if (mType in Goods) {
            Memory.Resource[mType][room.name] = 1;
        }
        // 其他
        else {
            Memory.Resource[mType][room.name] = 1000;
        }
    }

    
    // 合成物分享
    const labList = Memory.RoomInfo[room.name].lab?.autoQueue;
    for (const item of labList||[]) {
        if (!Memory.Resource[item.target]) Memory.Resource[item.target] = {}
        Memory.Resource[item.target][room.name] = Math.max(item.amount-1000, 1000)
    }

    // 检查基础元素资源数量
    // BaseMineral.forEach(r => {
    //     if (room.mineral?.mineralType === r) return;
    //     // 资源不足，挂终端单
    //     if ((room.storage?.store[r]||0) + (room.terminal?.store[r]||0) < 3000) {
    //         let needAmount = 3000 - (room.storage?.store[r]||0) + (room.terminal?.store[r]||0);
    //         // 遍历资源共享
    //         for (const roomName in Memory.Resource[r]) {
    //             const tRoom = Game.rooms[roomName];
    //             // 如果资源大于阈值
    //             if ((tRoom.storage?.store[r]||0) + (tRoom.terminal?.store[r]||0) > Memory.Resource[r][roomName]) {
    //                 const maxAmount = Math.min((tRoom.storage?.store[r]||0) + (tRoom.terminal?.store[r]||0) - Memory.Resource[r][roomName], needAmount);
    //                 addMission(tRoom, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.send, {
    //                     rType: r,
    //                     amount: maxAmount,
    //                     targetRoom: room.name
    //                 });
    //                 needAmount -= maxAmount;
    //             }
    //             if (needAmount <= 0) return;
    //         }

    //         // 运行到这里说明还需要资源，判断是否重要资源（ZKUL合成G）
    //         if (r === RESOURCE_ZYNTHIUM ||
    //             r === RESOURCE_KEANIUM ||
    //             r === RESOURCE_UTRIUM ||
    //             r === RESOURCE_LEMERGIUM
    //         ) {
    //             roomMarketAddOrder(room.name, r, ORDER_BUY, 2000);
    //         }
    //     }
    // });

    // BaseBar.forEach(r => {
    //     if (room.mineral?.mineralType === Object.keys(COMMODITIES[r].components).find(s=>s!=RESOURCE_ENERGY)) return;
    //     // 资源不足，挂终端单
    //     if ((room.storage?.store[r]||0) + (room.terminal?.store[r]||0) < 1000) {
    //         let needAmount = 1000 - (room.storage?.store[r]||0) + (room.terminal?.store[r]||0);
    //         // 遍历资源共享
    //         for (const roomName in Memory.Resource[r]) {
    //             const tRoom = Game.rooms[roomName];
    //             // 如果资源大于阈值
    //             if ((tRoom.storage?.store[r]||0) + (tRoom.terminal?.store[r]||0) > Memory.Resource[r][roomName]) {
    //                 const maxAmount = Math.min((tRoom.storage?.store[r]||0) + (tRoom.terminal?.store[r]||0) - Memory.Resource[r][roomName], needAmount);
    //                 addMission(tRoom, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.send, {
    //                     rType: r,
    //                     amount: maxAmount,
    //                     targetRoom: room.name
    //                 });
    //                 needAmount -= maxAmount;
    //             }
    //             if (needAmount <= 0) return;
    //         }
    //     }
    // })
}

/**
 * 自动化信息更新
 * @param room 
 * @returns 
 */
export const roomInfoUpdate = (room: Room, force?: boolean) => {
    if (!force && Game.time % 1000 !== 1) return;
    if (room.level < 6) return ;

    // 自动运行化工厂
    if (room.lab.length >= 3 && !Memory.RoomInfo[room.name].lab?.open) roomStructureLab.open(room);

    // 检查房间数量
    const rooms = getRoomNumber();
    
    // 房间数增加了
    if (rooms > (Memory.System.rooms||0)) {
        // 更新化工厂合成列表。
        roomStructureLab.setTarget(room, true);
        Memory.System.rooms = rooms;
    }

    if (Game.time % 10000 === 1) {
        roomMarketUpdate(room);
    }

    // 设置BOOST任务
    // if (room.level < 8) {
    //     for (const rType in BoostTarget) {
    //         const item = BoostTarget[rType];
    //         if (room.storage.store[rType] + room.terminal.store[rType] >= item.threshold) {
    //             roomStructureLab.setBoost(room, rType as MineralBoostConstant, item.amount);
    //         }
    //     }
    // }

    // 强化设置检查
    const BOOST = Memory.RoomInfo[room.name].lab?.BOOST;

    for (const labId in BOOST) {
        const lab = Game.getObjectById<StructureLab>(labId);
        if (!lab) {
            delete BOOST[labId];
            continue;
        }
        if (Game.time - (BOOST[labId].time||0) > 1000) {
            delete BOOST[labId];
            if (lab.mineralType && lab.store[lab.mineralType] > 0) {
                addMission(room, MISSION_TYPE.TRANSPORT, TRANSPORT_MISSION.lab, {
                    source: labId,
                    target: room.storage.id,
                    pos: lab.pos,
                    rType: lab.mineralType,
                    amount: lab.store[lab.mineralType]
                })
            }
            continue;
        }
        // BOOST[labId].time = Game.time;
    }

    if (room.factory && Memory.RoomInfo[room.name].Factory?.open) {
        if (Memory.RoomInfo[room.name].Factory.autoQueue.length === 0) {
            roomStructureFactory.setTarget(room);
        }
    }
}