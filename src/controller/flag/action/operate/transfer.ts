import { MISSION_TYPE, TERMINAL_MISSION } from "@/constant/mission";
import { getRoomResourceAmount } from "@/controller/room/function/get";
import { addMission } from "@/controller/room/mission/pool";

export default {
    colddown: 600,
    prepare: (flag: Flag) => {
        const targetRoomName = flag.name.match(/\[([EW]\d+[NS]\d+)\]/)?.[1];

        const targetRoom = Game.rooms[targetRoomName];
        if (!targetRoom ||!targetRoom.my) {
            flag.remove();
            return false;
        }
        
        const data = {
            targetRoom: targetRoomName,
        } as any;

        let rType = flag.name.match(/-R\[(.+?)\]/)?.[1];
        if (rType) {
            data.rType = rType;
        }

        let threshold = flag.name.match(/-T\[(\d+)\]/)?.[1];
        if (threshold) {
            data.threshold = parseInt(threshold); 
        }

        let amount = flag.name.match(/-A\[(\d+)\]/)?.[1];
        if (amount) {
            data.amount = parseInt(amount);
        }
        flag.memory.data = data;
        return true;
    },
    action: (flag: Flag) => {
        const targetRoom = Game.rooms[flag.memory.data.targetRoom];

        if (!targetRoom) {
            flag.remove();
            return false;
        }
        const rType = flag.memory.data.rType || RESOURCE_ENERGY;
        const threshold = flag.memory.data.threshold || 50000;
        const amount = flag.memory.data.amount || 50000;

        if (getRoomResourceAmount(flag.room, rType) >= amount) {
            return ;
        }

        if (targetRoom.storage?.store[rType] > threshold) {
            const needAmount = Math.min(amount - (flag.room.storage?.store[rType]||0), targetRoom.storage?.store[rType] - threshold);
            addMission(targetRoom, MISSION_TYPE.TERMINAL, TERMINAL_MISSION.send, {
                rType: rType,
                amount: needAmount,
                targetRoom: flag.room.name
            });
        }
    }
}