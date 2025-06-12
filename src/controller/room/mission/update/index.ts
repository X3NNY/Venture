import { deleteMission, filterMission } from '../pool';
import { updateBuildMission } from './buildMission';
import { updateManageMission } from './manageMission';
import { updateRepairMission, updateWallRepairMission } from './repairMission';
import { updateSpawnMission } from './spawnMission';
import { updateTransportMission } from './transportMission';

/**
 * 清除过期任务
 * @param room 
 */
const roomMissionClean = (room: Room) => {
    let count = 0;
    if (room.level === 8) return ;
    for (const mType in room.memory.missions) {
        const tasks = filterMission(room, mType, m => Game.time - m.time > 2000);
        count += tasks.length
        tasks.forEach(task => deleteMission(room, mType, task.id))
    }
    console.log('clean mission: ',count)
}

export const roomMissionUpdate = (room: Room) => {
    // 孵化任务
    updateSpawnMission(room);
    if (Game.time % 20 === 0) updateTransportMission(room);
    
    // 中央搬运任务
    if (Game.time % 30 === 0) updateManageMission(room);

    // 建造&修复任务
    if (Game.time % 50 === 1) {
        updateBuildMission(room);
        updateRepairMission(room);
    }

    if (Game.time % 100 === 2) updateWallRepairMission(room);
    if (Game.time % 1100 === 11) roomMissionClean(room);
}