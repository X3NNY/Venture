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
