import { MANAGE_MISSION, MISSION_TYPE } from "@/constant/mission";
import { addMission } from "../mission/pool";
import { getRoomResourceAmount } from "../function/get";
import { Goods } from "@/constant/resource";

export const roomStructureFactory = {
    product: (room: Room) => {
        if (room.factory.cooldown !== 0) return ;

        const mem = Memory.RoomInfo[room.name];

        if (!mem || !mem.Factory?.open) return ;

        const product = mem.Factory.product;
        if (!product) return ;

        // 原料
        const components = COMMODITIES[product]?.components;
        if (!components) return ;

        // 检查原料是否充足
        if (Object.keys(components).some(c => room.factory.store[c] < components[c])) return ;

        const result = room.factory.produce(product);

        if ((Game.time % 1000 === 0 ||
            result !== OK) &&
            room.factory.store[product] > 0
        ) {
            addMission(room, MISSION_TYPE.MANAGE, MANAGE_MISSION.f2s, {
                rType: product,
                amount: room.factory.store[product]
            });
        }
    },
    auto: (room: Room) => {
        if (Game.time % 50) return ;
        const mem = Memory.RoomInfo[room.name];

        if (!mem || !mem.Factory?.open) return ;

        const product = mem.Factory.product;
        const amount = mem.Factory.amount||0;
        const components = COMMODITIES[product]?.components;

        // 当前任务：原料充足，未达数量 不变更任务
        if (product && components &&
            (amount <= 0 || getRoomResourceAmount(room, product) < amount) &&
            Object.keys(components).every((c: any) => {
                const count = getRoomResourceAmount(room, c);
                if (Goods.includes(c) && count >= components[c]) return true;
                if (count >= 1000 || room.factory.store[c] >= components[c]) return true;
            })
        ) {
            return ;
        }

        if (product) {
            mem.Factory.product = null;
            mem.Factory.amount = 0;
        }

        const autoQueue = mem.Factory.autoQueue;

        if (!autoQueue || !autoQueue.length) return ;

        let myLevel = -Infinity;
        let task;
        autoQueue.forEach(t => {
            const level = COMMODITIES[t.product].level || 0;
            if (myLevel >= level) return ;
            const components = COMMODITIES[t.product].components;
            const amount = t.amount;
            if (amount > 0 && getRoomResourceAmount(room, t.product) >= amount * 0.9) return ;

            if (Goods.includes(t.product as any)) {
                if (Object.keys(components).some(c => getRoomResourceAmount(room, c) < components[c] * 10)) return ;
            } else if (Object.keys(components).some(c => getRoomResourceAmount(room, c) < 1000)) {
                return ;
            }

            myLevel = level;
            task = t;
        });

        if (!task) return ;

        mem.Factory.product = task.product;
        mem.Factory.amount = task.amount;

        console.log(`[${room.name}] 已分配工厂生产任务：${task.product}，数量: ${task.amount || '无'}`)

    },
    work: (room: Room) => {
        if (!room.factory) return ;

        roomStructureFactory.product(room);
        roomStructureFactory.auto(room);
    }
}