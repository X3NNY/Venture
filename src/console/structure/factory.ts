import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { getRoomList } from "@/controller/room/function/get";
import { addMission } from "@/controller/room/mission/pool";
import { roomStructureFactory } from "@/controller/room/structure/factory";
import { drawTable } from "@/util/chart";

const factoryStrings = {
    cn: {
        room: '房间',
        product: '产物',
        amount: '数量',

        room_not_found: `[工厂指令] 房间「{0}」未在控制列表或未占领。`,
        open_ok: '[工厂指令] 房间「{0}」工厂已开启。',
        stop_ok: '[工厂指令] 房间「{0}」工厂已关闭。',
        product_not_found: `[工厂指令] 生产目标「{0}」不存在。`,
        product_level_not_match: `[工厂指令] 生产目标「{0}」需要等级「{1}」工厂，等级不匹配或未设置等级。`,
        set_ok: '[工厂指令] 房间「{0}」工厂已设置为生产「{1}」。',
        set_level_ok: '[工厂指令] 房间「{0}」工厂已设置为等级「{1}」。',
        set_auto_ok: '[工厂指令] 房间「{0}」工厂已设置自动生产「{1}」。',
        remove_auto_ok: '[工厂指令] 房间「{0}」工厂已移除自动生产「{1}」。',
        list_auto_head: '[工厂指令] 房间「{0}」的自动合成列表如下：',
        list_auto_head_all: `[工厂指令] 全部自动合成列表如下：`,
    },
    us: {
        room: 'Room',
        product: 'Product',
        amount: 'Amount',

        room_not_found: `[工厂指令] 房间「{0}」未在控制列表或未占领。`,
        open_ok: '[工厂指令] 房间「{0}」工厂已开启。',
        stop_ok: '[工厂指令] 房间「{0}」工厂已关闭。',
        product_not_found: `[工厂指令] 生产目标「{0}」不存在。`,
        product_level_not_match: `[工厂指令] 生产目标「{0}」需要等级「{1}」工厂，等级不匹配或未设置等级。`,
        set_ok: '[工厂指令] 房间「{0}」工厂已设置为生产「{1}」。',
        set_level_ok: '[工厂指令] 房间「{0}」工厂已设置为等级「{1}」。',
        set_auto_ok: '[工厂指令] 房间「{0}」工厂已设置自动生产「{1}」。',
        remove_auto_ok: '[工厂指令] 房间「{0}」工厂已移除自动生产「{1}」。',
        list_auto_head: '[工厂指令] 房间「{0}」的自动合成列表如下：',
        list_auto_head_all: `[工厂指令] 全部自动合成列表如下：`,
    }
}

export default {
    factory: {
        open: (roomName: string, level: number = 0) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            if (!room || !room.my || !mem) {
                return factoryStrings[lang].room_not_found.format(roomName);
            }

            // mem.Factory.open = true;
            roomStructureFactory.open(room, level);
            return factoryStrings[lang].open_ok.format(roomName);
        },
        stop: (roomName: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            if (!room ||!room.my ||!mem) {
                return factoryStrings[lang].room_not_found.format(roomName);
            }

            mem.Factory.open = false;
            return factoryStrings[lang].stop_ok.format(roomName);
        },
        set: (roomName: string, product: string, amount: number = 0) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName]; 
            if (!room ||!room.my ||!mem) {
                return factoryStrings[lang].room_not_found.format(roomName); 
            }

            // 检查产品是否存在
            if (!COMMODITIES[product]) {
                return factoryStrings[lang].product_not_found.format(product);
            }

            const level = room.factory?.level || mem.Factory.level || 0;

            // 检查等级是否匹配
            if (COMMODITIES[product].level && COMMODITIES[product].level != level) {
                return factoryStrings[lang].product_level_not_match.format(product, COMMODITIES[product].level);
            }

            mem.Factory.product = product as any;
            mem.Factory.amount = Math.max(0, amount);

            if (!mem.Factory.open) {
                mem.Factory.open = true; 
            }

            return factoryStrings[lang].set_ok.format(roomName, product);
        },
        set_level: (roomName: string, level: number) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            if (!room ||!room.my ||!mem) {
                return factoryStrings[lang].room_not_found.format(roomName);
            }
            
            mem.Factory.level = level;
            return factoryStrings[lang].set_level_ok.format(roomName, level);
        },

        set_auto: (roomName: string, product: CommodityConstant, amount?: number) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            if (!room ||!room.my ||!mem) {
                return factoryStrings[lang].room_not_found.format(roomName);
            }

            // 检查产品是否存在
            if (!COMMODITIES[product]) {
                return factoryStrings[lang].product_not_found.format(product);
            }

            const level = room.factory?.level || mem.Factory.level || 0;

            // 检查等级是否匹配
            if (COMMODITIES[product].level && COMMODITIES[product].level!= level) {
                return factoryStrings[lang].product_level_not_match.format(product, COMMODITIES[product].level);
            }

            if (!mem.Factory.autoQueue) {
                mem.Factory.autoQueue = [];
            }
            mem.Factory.autoQueue.push({
                product, amount,
                manual: true
            })

            return factoryStrings[lang].set_auto_ok.format(roomName, product);
        },
        remove_auto: (roomName: string, product: string) => {
            const lang = Memory.lang || 'cn';
            const room = Game.rooms[roomName];
            const mem = Memory.RoomInfo[roomName];
            
            if (!room ||!room.my ||!mem) {
                return factoryStrings[lang].room_not_found.format(roomName); 
            }

            // 检查产品是否存在
            if (!COMMODITIES[product]) {
                return factoryStrings[lang].product_not_found.format(product);
            }

            if (!mem.Factory.autoQueue) {
                mem.Factory.autoQueue = [];
            }
            const pos = mem.Factory.autoQueue.findIndex(task => task.product === product);
            if (pos !== -1) mem.Factory.autoQueue.splice(pos, 1)
            
            return factoryStrings[lang].remove_auto_ok.format(roomName, product);
        },
        list_auto: (roomName?: string) => {
            const lang = Memory.lang || 'cn';
            const rooms = roomName? [roomName] : getRoomList();
            
            if (roomName) {
                const mem = Memory.RoomInfo[roomName];
                if (!mem) {
                    return factoryStrings[lang].room_not_found.format(roomName);
                }
            }

            const data = [];
            for (const room of rooms) {
                const mem = Memory.RoomInfo[room]?.Factory;
                if (!mem) continue;

                data.push(...mem.autoQueue?.map(r => [room, r.product, r.amount]));
            }

            if (roomName) {
                console.log(factoryStrings[lang].list_auto_head.format(roomName));
            } else {
                console.log(factoryStrings[lang].list_auto_head_all);
            }
            return drawTable(data, [factoryStrings[lang].room, factoryStrings[lang].product, factoryStrings[lang].amount])
        }
    }
}