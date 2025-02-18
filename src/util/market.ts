export const gerOrderPrice = (rType: ResourceConstant, orderType: ORDER_BUY | ORDER_SELL) => {
    let orders = Game.market.getAllOrders({type: orderType, resourceType: rType});
    if (!orders || orders.length === 0) return 10;

    const rooms = {}
    const top10 = orders
        // 初步过滤 
        .filter(order => {
            if (orderType === ORDER_BUY && order.price < 10) return false;
            if (rType === RESOURCE_ENERGY && order.amount < 10000) return false;
            if (rooms[order.roomName]) return false;
            rooms[order.roomName] = true;
            return true;
        })
        // 排序，买价最高，卖价最低
        .sort((a, b) => orderType === ORDER_BUY ? b.price - a.price : a.price - b.price)
        // 保留前十
        .slice(0, 10);
    const avg = top10.reduce((sum, order) => sum + order.price, 0) / top10.length;

    let price = avg;
    if (orderType === ORDER_BUY) {
        // 溢价单不要
        orders = top10.filter(order => order.price <= avg * 1.05);
        if (orders.length > 0) {
            price = orders[0].price * 0.99;
        }
    } else if (orderType === ORDER_SELL) {
        // 内卷单不管
        orders = top10.filter(order => order.price > avg * 0.95);
        if (orders.length > 0) {
            price = orders[0].price * 1.01;
        }
    }
    return price;
}