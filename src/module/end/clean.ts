export const endClean = () => {
    if (Game.time % 50 === 0) {
        cleanMemory();
    }
    if (Game.time % 150 === 0) {
        cleanMarketOrder();
    }
}

const cleanMemory = () => {
    for (const name in Memory.creeps) {
        if (Game.creeps[name]) continue;
        delete Memory.creeps[name]
    }

    for (const name in Memory.flags) {
        if (Game.flags[name]) continue;
        delete Memory.flags[name];
    }
}

const cleanMarketOrder = () => {
    const orders = Object.values(Game.market.orders);
    if (orders.length < 100) return ;

    const currentTime = Game.time;
    const orderIds = orders.filter((order) =>
        order.remainingAmount === 0 &&
        (currentTime - order.created > 50000)
    ).map(order => order.id);

    if (orderIds.length > 0) {
        orderIds.forEach(oId => Game.market.cancelOrder(oId));
    }
}