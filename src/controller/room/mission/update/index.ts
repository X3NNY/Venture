import { updateBuildMission } from './buildMission';
import { updateRepairMission, updateWallRepairMission } from './repairMission';
import { updateSpawnMission } from './spwanMission';

export const roomMissionUpdate = (room: Room) => {

    // 孵化任务
    if (Game.time % 10 === 0) updateSpawnMission(room);

    // if (Game.time % 20 === 0) updateTransportMission(room);
    
    // 建造&修复任务
    if (Game.time % 50 === 1) {
        updateBuildMission(room);
        updateRepairMission(room);
    }

    if (Game.time % 100 === 2) updateWallRepairMission(room);

    
}