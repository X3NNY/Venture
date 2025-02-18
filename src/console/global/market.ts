import { roomMarketAddOrder } from "@/controller/room/component/market";
import { getRoomList } from "@/controller/room/function/get";
import { drawTable } from "@/util/chart";
import { gerOrderPrice } from "@/util/market";

const marketStrings = {
    cn: {
        help: '市场指令\n' +
            'add_order(roomName, type, rType, amount, price?)\n' +
            '   在房间中添加或更新指定资源订单\n' +
            'list_order(roomName)\n' +
            '   列出房间中所有订单\n' +
            'remove_order(roomName, rType, type?)\n' +
            '   移除房间中资源对应类型订单，不指定类型则移除全部订单',
        help_add_order: `在房间中添加指定资源订单，若资源对应类型订单已存在则更新参数。\n` +
            '调用：add_order(roomName, type, rType, amount, price?)\n' +
            '参数：\n' +
            '   roomName: 房间坐标\n' +
            '   rType: 资源类型，应为ResourceConstant常量\n' +
            '   type: 订单类型，包含如下四种类型\n' +
            '       "buy": 自动在市场上挂资源买单\n' +
            '       "sell": 自动在市场上挂资源卖单\n' +
            '       "deal_buy": 按市场上最优卖单自动买入\n' +
            '       "buy": 按市场上最优买单自动卖出\n' +
            '   amount: 操作阈值，低于该阈值则不再卖出，高于该阈值则不再买入。\n' +
            '   price?: 价格，可选项。对应买入资源的最高价格和卖出资源的最低价格，不填则按照最优价格处理。',
        order_room: '房间',
        order_type: '订单类型',
        order_rType: '资源类型',
        order_amount: '交易阈值',
        order_price: '价格线',
        order_list_head: '[市场指令] 房间「{0}」的市场交易列表如下：',
        order_list_head_all: '[市场指令] 全部市场交易列表如下：',
        
        room_not_found: `[市场指令] 房间「{0}」未在控制列表或未占领。`,
        add_buy_order: '[市场指令] 已在房间「{0}」开启资源「{1}」买入挂单，购买阈值「{2}」，价格限制：「{3}」',
        update_buy_order: '[市场指令] 已修改房间「{0}」中资源「{1}」买入挂单购买阈值为「{2}」，价格限制：「{3}」',
        add_sell_order: '[市场指令] 已在房间「{0}」开启资源「{1}」卖出挂单，出售阈值「{2}」，价格限制：「{3}」',
        update_sell_order: '[市场指令] 已修改房间「{0}」中资源「{1}」卖出挂单出售阈值为「{2}」，价格限制：「{3}」',
        add_dbuy_order: '[市场指令] 已在房间「{0}」开启资源「{1}」自动买入，购买阈值「{2}」，价格限制：「{3}」',
        update_dbuy_order: '[市场指令] 已修改房间「{0}」中资源「{1}」自动买入购买阈值为「{2}」，价格限制：「{3}」',
        add_dsell_order: '[市场指令] 已在房间「{0}」开启资源「{1}」自动卖出，出售阈值「{2}」，价格限制：「{3}」',
        update_dsell_order: '[市场指令] 已修改房间「{0}」中资源「{1}」自动卖出出售阈值为「{2}」，价格限制：「{3}」',
        order_remove: '[市场指令] 房间「{0}」中资源「{1}」全部订单已清除，成功清理「{2}」个订单。',
        order_remove_type: '[市场指令] 房间「{0}」中资源「{1}」订单类型「{2}」已清除。',
        resource_price: '[市场指令] 资源「{0}」订单「{1}」类型最近均价为「{2}」。'
    },
    
    us: {
        help: '市场指令\n' +
            'add_order(roomName, type, rType, amount, price?)\n' +
            '   在房间中添加或更新指定资源订单\n' +
            'list_order(roomName)\n' +
            '   列出房间中所有订单\n' +
            'remove_order(roomName, rType, type?)\n' +
            '   移除房间中资源对应类型订单，不指定类型则移除全部订单',
        help_add_order: `在房间中添加指定资源订单，若资源对应类型订单已存在则更新参数。\n` +
        '调用：add_order(roomName, type, rType, amount, price?)\n' +
        '参数：\n' +
        '   roomName: 房间坐标\n' +
        '   rType: 资源类型，应为ResourceConstant常量\n' +
        '   type: 订单类型，包含如下四种类型\n' +
        '       "buy": 自动在市场上挂资源买单\n' +
        '       "sell": 自动在市场上挂资源卖单\n' +
        '       "deal_buy": 按市场上最优卖单自动买入\n' +
        '       "buy": 按市场上最优买单自动卖出\n' +
        '   amount: 操作阈值，低于该阈值则不再卖出，高于该阈值则不再买入。' +
        '   price?: 价格，可选项。对应买入资源的最高价格和卖出资源的最低价格，不填则按照最优价格处理。',
        order_room: 'Room',
        order_type: 'Order type',
        order_rType: 'Resource',
        order_amount: '交易阈值',
        order_price: '价格线',
        order_list_head: '[市场指令] 房间「{0}」的市场交易列表如下：',
        order_list_head_all: '[市场指令] 全部市场交易列表如下：',

        room_not_found: `[市场指令] 房间「{0}」未在控制列表或未占领。`,
        add_buy_order: '[市场指令] 已在房间「{0}」开启资源「{1}」买入挂单，出售阈值为「{2}」，价格限制：「{3}」',
        update_buy_order: '[市场指令] 已修改房间「{0}」中资源「{1}」买入挂单出售阈值为「{2}」，价格限制：「{3}」',
        add_sell_order: '[市场指令] 已在房间「{0}」开启资源「{1}」卖出挂单，出售阈值为「{2}」，价格限制：「{3}」',
        update_sell_order: '[市场指令] 已修改房间「{0}」中资源「{1}」卖出挂单出售阈值为「{2}」，价格限制：「{3}」',
        add_dbuy_order: '[市场指令] 已在房间「{0}」开启资源「{1}」自动买入，购买阈值「{2}」，价格限制：「{3}」',
        update_dbuy_order: '[市场指令] 已修改房间「{0}」中资源「{1}」自动买入购买阈值为「{2}」，价格限制：「{3}」',
        add_dsell_order: '[市场指令] 已在房间「{0}」开启资源「{1}」自动卖出，出售阈值「{2}」，价格限制：「{3}」',
        update_dsell_order: '[市场指令] 已修改房间「{0}」中资源「{1}」自动卖出出售阈值为「{2}」，价格限制：「{3}」',
        order_remove: '[市场指令] 房间「{0}」中资源「{1}」全部订单已清除，成功清理「{2}」个订单。',
        order_remove_type: '[市场指令] 房间「{0}」中资源「{1}」类型「{2}」订单已清除。',
        resource_price: '[市场指令] 资源「{0}」订单「{1}」类型最近均价为「{2}」。'
    }
}

export default {
    market: {
        add_order: (roomName: string, rType: ResourceConstant, type: ORDER_BUY | ORDER_SELL | 'deal_buy' | 'deal_sell', amount: number, price?: number) => {
            const lang = Memory.lang || 'cn';
            if (!Memory.RoomInfo[roomName]) {
                return marketStrings[lang].room_not_found.format(roomName);
            }
            
            const [_, newOrder] = roomMarketAddOrder(roomName, rType, type, amount, price);
            switch(type) {
                case ORDER_BUY:
                    if (newOrder) {
                        return marketStrings[lang].add_buy_order.format(roomName, rType, amount, price ?? '无');
                    } else {
                        return marketStrings[lang].update_buy_order.format(roomName, rType, amount, price ?? '无');
                    }
                case ORDER_SELL:
                    if (newOrder) {
                        return marketStrings[lang].add_sell_order.format(roomName, rType, amount, price ?? '无');
                    } else {
                        return marketStrings[lang].update_sell_order.format(roomName, rType, amount, price ?? '无');
                    }
                case 'deal_buy':
                    if (newOrder) {
                        return marketStrings[lang].add_dbuy_order.format(roomName, rType, amount, price ?? '无');
                    } else {
                        return marketStrings[lang].update_dbuy_order.format(roomName, rType, amount, price ?? '无');
                    }
                case 'deal_sell':
                    if (newOrder) {
                        return marketStrings[lang].add_dsell_order.format(roomName, rType, amount, price ?? '无');
                    } else {
                        return marketStrings[lang].update_dsell_order.format(roomName, rType, amount, price ?? '无');
                    }
            }
        },
        list_order: (roomName?: string) => {
            const lang = Memory.lang || 'cn';
            let rooms = roomName ? [roomName] : getRoomList();
            if (roomName && !Memory.RoomInfo[roomName]) {
                return marketStrings[lang].room_not_found.format(roomName);
            }

            const data = [];

            for (const room of rooms) {
                if (!Memory.RoomInfo[room]) continue;
                for (const order of (Memory.RoomInfo[room].Market||[])) {
                    data.push([room, order.orderType, order.rType, order.amount, order.price ?? '-'])
                }
            }

            if (roomName) {
                console.log(marketStrings[lang].order_list_head.format(roomName));
            } else {
                console.log(marketStrings[lang].order_list_head_all);
            }
            return drawTable(data, [marketStrings[lang].order_room, marketStrings[lang].order_type, marketStrings[lang].order_rType, marketStrings[lang].order_amount, marketStrings[lang].order_price]);
        },
        remove_order: (roomName: string, rType: ResourceConstant, type?: ORDER_BUY | ORDER_SELL | 'deal_buy' | 'deal_sell') => {
            const lang = Memory.lang || 'cn';
            if (!Memory.RoomInfo[roomName]) {
                return marketStrings[lang].room_not_found.format(roomName);
            }
            
            if (!Memory.RoomInfo[roomName].Market) {
                Memory.RoomInfo[roomName].Market = [];
            }
            let count = 0;
            Memory.RoomInfo[roomName].Market = Memory.RoomInfo[roomName].Market.filter(order => {
                if (order.rType === rType && (!type || order.orderType === type)) {
                    count += 1;
                    return false;
                }
                return true;
            });
            if (type) {
                return marketStrings[lang].order_remove_type.format(roomName, rType, type);
            } else {
                return marketStrings[lang].order_remove.format(roomName, rType, count);
            }
                        
        },
        get_price: (rType: ResourceConstant, type?: ORDER_BUY | ORDER_SELL) => {
            const lang = Memory.lang || 'cn';
            const price = gerOrderPrice(rType, type);

            return marketStrings[lang].resource_price.format(rType, type, price);
        },
        help: (func?: string) => {
            const lang = Memory.lang || 'cn';
            if (!func) {
                return marketStrings[lang].help;
            }
            switch (func) {
                case 'add_order':
                    return marketStrings[lang].help_add_order;
            }
        }
    }
}