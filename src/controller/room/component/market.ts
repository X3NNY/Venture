export const roomMarketAddOrder = (roomName: string, rType: ResourceConstant, type: ORDER_BUY | ORDER_SELL | 'deal_buy' | 'deal_sell', amount: number, price?: number) => {
    if (!Memory.RoomInfo[roomName].Market) {
        Memory.RoomInfo[roomName].Market = [];
    }
    
    const orders = Memory.RoomInfo[roomName].Market;

    const order = orders.find(o => o.rType === rType && o.orderType === type);

    if (!order) {
        orders.push({rType, amount, orderType: type, price});
        return [OK, true];
    }

    order['amount'] = amount;
    order['price'] = price;
    return [OK, false];
}

export const roomMarketRemoveOrder = (roomName: string, rType: ResourceConstant, type?: ORDER_BUY | ORDER_SELL | 'deal_buy' | 'deal_sell'): number => {
    if (!Memory.RoomInfo[roomName].Market) return 0;

    let count = 0;
    Memory.RoomInfo[roomName].Market = Memory.RoomInfo[roomName].Market.filter(order => {
        if (order.rType === rType && (!type || order.orderType === type)) {
            count += 1;
            return false;
        }
        return true;
    });

    return count;
}