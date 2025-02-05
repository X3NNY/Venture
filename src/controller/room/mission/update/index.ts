import { updateBuildMission } from './buildMission';
import { updateManageMission } from './manageMission';
import { updateRepairMission, updateWallRepairMission } from './repairMission';
import { updateSpawnMission } from './spawnMission';
import { updateTransportMission } from './transportMission';

export const roomMissionUpdate = (room: Room) => {

    // 孵化任务
    if (Game.time % 10 === 0) updateSpawnMission(room);
    if (Game.time % 20 === 0) updateTransportMission(room);
    
    // 中央搬运任务
    if (Game.time % 30 === 1) updateManageMission(room);

    // 建造&修复任务
    if (Game.time % 50 === 1) {
        updateBuildMission(room);
        updateRepairMission(room);
    }

    if (Game.time % 100 === 2) updateWallRepairMission(room);

    
}