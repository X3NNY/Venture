import { gerOrderPrice } from "@/util/market";
import { toArray } from "lodash";

const roomTransactionArbitrage = (room: Room) => {
    // 获取最高价能量购买订单
    const highestOrder = Game.market.getAllOrders({
        type: ORDER_BUY,
        resourceType: RESOURCE_ENERGY,
    }).reduce((a, b) => a.price > b.price ? a : b);

    // 获取能量出售订单
    const sellList = Game.market.getAllOrders({
        type: ORDER_SELL,
        resourceType: RESOURCE_ENERGY
    });
    sellList.sort((a, b) => b.price - a.price);
    if (!highestOrder || !highestOrder.roomName) {
        return;
    }
    for (let i = 0; i < Math.min(10, sellList.length); i++) {
        const sellOrder = sellList[i];
        const d1 = Game.map.getRoomLinearDistance(sellOrder.roomName, room.name, true);
        const d2 = Game.map.getRoomLinearDistance(sellOrder.roomName, room.name, true);
        let buyEnergy = sellOrder.amount
        let sellEnergy = Math.floor(sellOrder.amount * Math.exp((d2-d1) / 30) / (2*Math.exp(d2/30) - 1));
        if (sellEnergy > highestOrder.amount) {
            sellEnergy = highestOrder.amount;
            buyEnergy = Math.ceil(sellEnergy * (2*Math.exp(d1 / 30) - Math.exp((d1-d2)/30)));
        }
        let ecost = Game.market.calcTransactionCost(buyEnergy, sellOrder.roomName, room.name)

        if (ecost > room.terminal.store[RESOURCE_ENERGY]) {
            buyEnergy = Math.floor(buyEnergy * room.terminal.store[RESOURCE_ENERGY] / Game.market.calcTransactionCost(buyEnergy, sellOrder.roomName, room.name));
            sellEnergy = Math.floor(sellOrder.amount * Math.exp((d2-d1) / 30) / (2*Math.exp(d2/30) - 1));
            ecost = Game.market.calcTransactionCost(buyEnergy, sellOrder.roomName, room.name)
        }

        // 出账=数量*单价+传过来的花费+传出去的花费
        const out = buyEnergy * sellOrder.price + ecost*sellOrder.price + Game.market.calcTransactionCost(sellEnergy, highestOrder.roomName, room.name)*sellOrder.price;

        // 进账=数量*单价
        const inp = sellEnergy * highestOrder.price;
        if (out < inp) {
            const r1 = Game.market.deal(sellOrder.id, buyEnergy, room.name);
            const r2 = Game.market.deal(highestOrder.id, sellEnergy, room.name);

            if (r1 === OK && r2 === OK) {
                console.log(`[自动交易] 套利交易成功，本次赚取 ${inp-out} Cr。`);
            } else {
                console.log(`[自动交易] 套利交易失败，应赚取 ${inp-out} Cr，返回码${r1},${r2}。`);
            }
            return;
        }
    }
}

const roomMarket = {
    /**
     * 买资源，比市场最低价稍高挂单
     * @param room 
     * @param item 
     * @returns 
     */
    buy: (room: Room, item: MarketOrder) => {
        const total = (room.terminal.store[item.rType] || 0) + (room.storage.store[item.rType] || 0);

        // 如果已有数量大于设定值，返回
        if (total >= item.amount) return;

        // 单次购买量
        const orderAmount = Math.min(item.rType !== RESOURCE_ENERGY ? 3000 : 50000, item.amount-total);
        

        let eOrder = null;
        // 查找是否已挂单
        for (const order of Object.values(Game.market.orders)) {
            if (order.roomName === room.name &&
                order.resourceType === item.rType &&
                order.type == ORDER_BUY &&
                order.remainingAmount > 0
            ) {
                eOrder = order;
                break;
            }
        }

        let price = gerOrderPrice(item.rType, ORDER_BUY);

        // 计算订单最优买价，更新价格
        if (eOrder) {
            if (price > item.price) return ;
            if (price > eOrder.price + 0.1 || price < eOrder.price - 1) {
                return Game.market.changeOrderPrice(eOrder.id, price);
            }
            return ;
        }
        if (price > item.price) price = item.price;
        return Game.market.createOrder({
            type: ORDER_BUY,
            resourceType: item.rType,
            price: price,
            totalAmount: orderAmount,
            roomName: room.name
        })
    },
    /**
     * 卖资源，比市场最低价稍高挂单
     * @param room 
     * @param item 
     * @returns 
     */
    sell: (room: Room, item: MarketOrder) => {
        const total = (room.terminal.store[item.rType] || 0) + (room.storage.store[item.rType] || 0);

        // 如果已有数量小于设定值，返回
        if (total < item.amount) return;
        
        // 单次出售量
        const orderAmount = item.rType !== RESOURCE_ENERGY ? 3000 : 10000;
        if (total - item.amount < orderAmount) return ;

        let eOrder = null;
        // 查找是否已挂单
        for (const order of Object.values(Game.market.orders)) {
            if (order.roomName === room.name &&
                order.resourceType === item.rType &&
                order.type == ORDER_SELL &&
                order.remainingAmount > 0
            ) {
                eOrder = order;
                break;
            }
        }

        let price = gerOrderPrice(item.rType, ORDER_SELL);

        // 计算订单最优买价，更新价格
        if (eOrder) {
            if (price < item.price) return ;
            if (price > eOrder.price + 0.1 || price < eOrder.price - 1) {
                return Game.market.changeOrderPrice(eOrder.id, price);
            }
            return ;
        }
        if (price < item.price) price = item.price;
        return Game.market.createOrder({
            type: ORDER_SELL,
            resourceType: item.rType,
            price: price,
            totalAmount: orderAmount,
            roomName: room.name
        })
    },
    /**
     * 买资源，按照市场最优卖单成交
     * @param room 
     * @param item 
     * @returns 
     */
    deal_buy: (room: Room, item: MarketOrder) => {
        const total = (room.terminal.store[item.rType] || 0) + (room.storage.store[item.rType] || 0);

        // 如果已有数量大于设定值，返回
        if (total >= item.amount) return;

        const buyAmount = Math.min(item.amount - total, room.terminal.store.getFreeCapacity());
        if (buyAmount < 5000) return ;
        // 按照最优卖单成交
        roomMarket.auto_deal(room, item.rType, buyAmount, ORDER_SELL, 10, item.price);
    },
    /**
     * 卖资源，按照市场最优买单成交
     * @param room 
     * @param item 
     * @returns 
     */
    deal_sell: (room: Room, item: MarketOrder) => {
        const total = (room.terminal.store[item.rType] || 0) + (room.storage.store[item.rType] || 0);

        // 如果已有数量小于设定值，返回
        if (total <= item.amount) return;

        const sellAmount = Math.min(total - item.amount, room.terminal.store[item.rType]);
        if (sellAmount < 3000) return ;

        // 按照最优买单成交
        roomMarket.auto_deal(room, item.rType, sellAmount, ORDER_BUY, 10, item.price);
    },

    /**
     * 从市场上寻找最优买/卖单并交易
     * @param room 
     * @param item 
     * @returns 
     */
    auto_deal: (room: Room, rType: ResourceConstant, amount: number, orderType: ORDER_BUY | ORDER_SELL, length: number, price: number) => {
        let orders = Game.market.getAllOrders({type: orderType, resourceType: rType});
        if (!orders || orders.length === 0) return ERR_NOT_FOUND;

        // 剔除比买单低价，卖单高价
        if (price) {
            orders = orders.filter(order => orderType === ORDER_SELL ? order.price <= price : order.price >= price);
        }
        // 排序，买价最高，卖价最低
        orders.sort((a, b) => orderType === ORDER_SELL ? a.price - b.price : b.price - a.price);

        // 获取能量花费
        const avgPrice = Game.market.getHistory(RESOURCE_ENERGY)[0].avgPrice;

        let bOrder = null;      // 最优订单
        let bCost  = orderType === ORDER_SELL ? Infinity : 0;   // 最优花费
        let tAmount = 0;        // 交易总数量
        let tPrice  = 0;        // 交易总金额
        let tECost = 0;         // 传输能量花费

        for (let i = 0; i < Math.min(orders.length, length); i++) {
            const order = orders[i];
            let dealAmount = Math.min(amount, order.amount);
            let ecost = Game.market.calcTransactionCost(dealAmount, room.name, order.roomName);
            
            // 如果不是能量 并且花费超过了终端能量数量，更新交易数量
            // 如果是能量卖单，并且花费超过终端能量数量，更新交易数量
            // 如果是能量，并且总数量超过终端能量数量，更新交易数量
            if ((rType !== RESOURCE_ENERGY && ecost > room.terminal.store[RESOURCE_ENERGY]) ||
                    (rType === RESOURCE_ENERGY && orderType === ORDER_SELL && ecost > room.terminal.store[RESOURCE_ENERGY]) ||
                    (rType === RESOURCE_ENERGY && (dealAmount + ecost) > room.terminal.store[RESOURCE_ENERGY])) {
                dealAmount = Math.floor(dealAmount * room.terminal.store[RESOURCE_ENERGY] / ecost);
                ecost = Game.market.calcTransactionCost(dealAmount, room.name, order.roomName);
            }

            // 计算综合单价（剔除能量消耗成本后的单价）
            let totalPrice = dealAmount * order.price;
            let cost = 0;
            if (rType === RESOURCE_ENERGY) {
                if (orderType === ORDER_SELL) {
                    // 购买能量：价格 = 交易金额/(数量-消耗)
                    cost = totalPrice / (dealAmount - ecost);
                } else {
                    // 出售能量：价格 = 交易金额/(数量+消耗)
                    cost = totalPrice / (dealAmount + ecost);
                }
            } else {
                if (orderType === ORDER_SELL) {
                    // 购买资源：价格 = (交易金额 + 能量成本) / 数量
                    cost = (totalPrice + ecost * avgPrice) / dealAmount;
                } else {
                    // 出售资源：价格 = (交易金额 - 能量成本) / 数量
                    cost = (totalPrice - ecost * avgPrice) / dealAmount;
                }
            }

            if ((orderType === ORDER_SELL && cost < bCost) ||
                (orderType === ORDER_BUY && cost > bCost)) {
                    bOrder = order;
                    bCost = cost;
                    tPrice = totalPrice;
                    tAmount = dealAmount;
                    tECost = ecost;
                }
        }
        if (!bOrder) return ;

        // 卖单，但钱不够
        if (orderType === ORDER_SELL && tPrice >= Game.market.credits) return ;

        if (rType === RESOURCE_ENERGY && tAmount < 5000) return ;
        else if (tAmount <= 0) return ;

        const result = Game.market.deal(bOrder.id, tAmount, room.name);

        if (result === OK) {
            console.log(`[自动交易] 房间${room.name}成功${orderType === ORDER_SELL ? '从' : '向'} ${bOrder.roomName} ${orderType === ORDER_SELL ? '购买' : '出售'} ${tAmount} 单位的 ${rType}，交易金额${tPrice.toFixed(2)} 能量消耗：${tECost.toFixed(2)} 综合单价：${bCost.toFixed(2)}`);
        } else {
            console.log(`[自动交易] 房间${room.name}成功${orderType === ORDER_SELL ? '从' : '向'} ${bOrder.roomName} ${orderType === ORDER_SELL ? '购买' : '出售'} ${tAmount} 单位的 ${rType} 失败。返回码：${result}`);
        }
        return result;
    }
}

export const roomAutoTransaction = (room: Room) => {
    if (Game.time % 50 !== 0) return ;
    if (!room.terminal) return ;
    
    const market = Memory.RoomInfo[room.name].Market;
    if (!market) return ;
    
    for (const item of market) {
        switch(item.orderType) {
            case ORDER_BUY:
                roomMarket.buy(room, item); break;
            case ORDER_SELL:
                roomMarket.sell(room, item); break;
            case 'deal_buy':
                roomMarket.deal_buy(room, item); break;
            case 'deal_sell':
                roomMarket.deal_sell(room, item); break;
        }
    }
    // if (Game.time % 20 === 3) {
    // roomTransactionArbitrage(room);
    // }
}