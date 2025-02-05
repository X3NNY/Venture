import { CreepRoleBody } from "@/constant/creep";
import { updateCreepNum, updateSpawnCreepNum } from "../../function";
import { addMission, countMission } from "../pool";
import { MISSION_TYPE, REPAIRE_MISSION, SPAWN_MISSION } from '@/constant/mission';

const spawnMissionCheck = {
    /**
     * 检查是否有空闲能量矿
     * @param room 房间
     */
    harvester: (room: Room, current: number, maxNum: number): boolean => {
        if (room.memory.defend) return false;
        
        // 前期要双倍的矿工
        if (room.level < 3) return current < room.source.length * 2;
        return current < room.source.length;
    },
    /**
     * 新房运营
     * @param room 
     */
    universal: (room: Room, current: number, maxNum: number) => {
        return (current < 2 && room.level < 3 && (!room.container || room.container.length <= 1));
    },
    
    /**
     * 搬运工检查
     */
    carrier: (room: Room, current: number, maxNum: number) => {
        // 新手期不需要
        if (!room.container && room.level < 2) return false;

        // 过渡期保持在最大数量
        if (room.level < 5 && maxNum > 0) return current < maxNum;

        // 后期最多一只就够了
        if (current >= 1) return false;

        // 容器快满了
        if (room.container?.some(c => c.store.getUsedCapacity() > 1500)) return true;
        // 捡垃圾
        if (room.find(FIND_DROPPED_RESOURCES).filter(r => r.amount > 1000)) return true;

        return false
    },

    courier: (room: Room, current: number, maxNum: number) => {
        if (!room.storage || room.storage.store[RESOURCE_ENERGY] < 10000) return false;
        return current < maxNum;
    },

    /**
     * 建造者检查
     */
    builder: (room: Room, current: number, maxNum: number) => {
        // 前期有工地直接造
        if (room.level < 3 && current < 2 && countMission(room, MISSION_TYPE.BUILD)) return true;

        // 有资源后可以多造点
        if (room.level < 4 && room.source.length >= 2 && current < 3 && countMission(room, MISSION_TYPE.BUILD) > 5) return true;

        // 后续的话任务多孵化两个，否则一个就够了
        if (countMission(room, MISSION_TYPE.BUILD) > 5 && current < 2) return true;
        if (countMission(room, MISSION_TYPE.BUILD) && current < 1) return true;
    },

    upgrader: (room: Room, current: number, maxNum: number) => {
        if (room.memory.defend) return false;

        // 新手期不需要
        if (room.level < 2) return false;

        // 冲级
        if (room.level < 8 && (room.storage?.store[RESOURCE_ENERGY]||0) > 100000) {
            return current < maxNum+1;
        }

        // 建造任务太多了 少造一个
        if (countMission(room, MISSION_TYPE.BUILD) > 10) return current < maxNum -1;

        return current < maxNum;
    },
    manager: (room: Room, current: number, maxNum: number) => {
        if (maxNum === 0 || room.level < 6) return false;
        const center = Memory.RoomInfo[room.name]?.center;
        // 没有中心点
        if (!center) return false;

        const link = room.link.find(l => l?.pos.inRangeTo(center.x, center.y, 1));

        // 还没有仓库和中央链接
        if (!room.storage || (!room.terminal && !link)) return ;

        return current < maxNum;
    },
    mender: (room: Room, current: number, maxNum: number) => {
        if (room.memory.defend) return false;
        
        // 新手期不需要
        if (room.level < 3) return false;

        // 低能量时 最多一个
        if ((room.storage?.store[RESOURCE_ENERGY]||0) < 100000 && current >= 1) return false;

        // 紧急任务大于5个
        if (countMission(room, MISSION_TYPE.REPAIR, m => m.type === REPAIRE_MISSION.urgent_structure.type || m.type === REPAIRE_MISSION.urgent_wall.type) > 5) return current < maxNum;

        // 太多要坏的了
        if (countMission(room, MISSION_TYPE.REPAIR) >= 20) return current < maxNum;
        return false;
    },
    miner: (room: Room, current: number, maxNum: number) => {
        // 防御模式不开
        if (room.memory.defend) return false;

        if (!room.storage || room.storage.store[RESOURCE_ENERGY] < 10000) return false;

        // 能采矿且没有采矿爬爬
        if (room.level >= 6 && room.extractor && current < 1 && room.mineral.mineralAmount > 0) return true;
    }
}

export const updateSpawnMission = (room: Room) => {
    updateSpawnCreepNum(room)
    updateCreepNum(room)

    for (const role in spawnMissionCheck) {
        const current = (global.CreepNum[room.name][role] || 0) + (global.SpawnCreepNum[room.name][role] || 0);
        // console.log(role, room.level, Object.keys(CreepRoleBody[role][room.level]))
        const maxNum = CreepRoleBody[role][room.level].num;
        if (spawnMissionCheck[role](room, current, maxNum)) {
            addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION[role], { home: room.name });
        }
    }
}