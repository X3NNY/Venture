import { MANAGE_MISSION, MISSION_TYPE } from "@/constant/mission";
import { addMission } from "../mission/pool";

export const roomStructureFactory = {
    work: (room: Room) => {
        if (!room.factory) return ;
        if (room.factory.cooldown !== 0) return ;

        const mem = Memory.RoomInfo[room.name];

        if (!mem || !mem.Factory) return ;

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
    }
}