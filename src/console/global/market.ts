export default {
    market: {
        add_order: (roomName: string, type: ORDER_BUY | ORDER_SELL | 'deal_buy' | 'deal_sell', rType: ResourceConstant, amount: number, price?: number) => {
            if (!Memory.RoomInfo[roomName]) {
                Memory.RoomInfo[roomName] = {};
            }
            if (!Memory.RoomInfo[roomName].Market) {
                Memory.RoomInfo[roomName].Market = [];
            }
            
            const orders = Memory.RoomInfo[roomName].Market;

            const order = orders.find(o => o.rType === rType && o.orderType === type);

            if (!order) {
                orders.push({rType, amount, orderType: type, price});
            } else {
                order['amount'] = amount;
                order['price'] = price;
            }
            switch(type) {
                case ORDER_BUY:
                    if (!order) {
                        console.log(`[指令] 已在房间 ${roomName} 开启资源 ${rType} 买入挂单，购买阈值 ${amount}，价格限制：${price ?? '无'}`);
                    } else {
                        console.log(`[指令] 已修改房间 ${roomName} 中资源 ${rType} 买入挂单购买阈值为 ${amount}，价格限制：${price ?? '无'}`);
                    }
                    break;
                case ORDER_SELL:
                    if (!order) {
                        console.log(`[指令] 已在房间 ${roomName} 开启资源 ${rType} 卖出挂单，出售阈值 ${amount}，价格限制：${price ?? '无'}`);
                    } else {
                        console.log(`[指令] 已修改房间 ${roomName} 中资源 ${rType} 卖出挂单购买阈值为 ${amount}，价格限制：${price ?? '无'}`);
                    }
                    break;
                case 'deal_buy':
                    if (!order) {
                        console.log(`[指令] 已在房间 ${roomName} 开启资源 ${rType} 自动买入，购买阈值 ${amount}，价格限制：${price ?? '无'}`);
                    } else {
                        console.log(`[指令] 已修改房间 ${roomName} 中资源 ${rType} 自动买入购买阈值为 ${amount}，价格限制：${price ?? '无'}`);
                    }
                    break;
                case 'deal_sell':
                    if (!order) {
                        console.log(`[指令] 已在房间 ${roomName} 开启资源 ${rType} 自动卖出，出售阈值 ${amount}，价格限制：${price ?? '无'}`);
                    } else {
                        console.log(`[指令] 已修改房间 ${roomName} 中资源 ${rType} 自动卖出出售阈值为 ${amount}，价格限制：${price ?? '无'}`);
                    }
                    break;
            }
            return OK;
        }
    }
}