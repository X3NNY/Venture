import { BUILD_MISSION, MISSION_TYPE } from "@/constant/mission";
import { addMission } from "../pool";

/**
 * 更新建造任务
 * @param room 
 */
export const updateBuildMission = (room: Room) => {
    const sites = room.find(FIND_CONSTRUCTION_SITES);
    const terrain = room.getTerrain();
    const siteLevelMap = {};

    if (sites.length === 0) return ;

    const missions = room.memory.missions[MISSION_TYPE.BUILD];

    for (const site of sites) {
        let level = Math.round((1 - site.progress / site.progressTotal) * 5);

        // 高级建筑：终端、仓库、爬家
        if (site.structureType === STRUCTURE_TERMINAL ||
            site.structureType === STRUCTURE_STORAGE ||
            site.structureType === STRUCTURE_SPAWN
        ) {
            level = 0;
        }

        // 重点建筑：扩展、沼泽道路
        else if (site.structureType === STRUCTURE_EXTENSION ||
            (site.structureType === STRUCTURE_ROAD &&
            terrain.get(site.pos.x, site.pos.y) === TERRAIN_MASK_SWAMP
            )
        ) {
            level += site.progress > 0 ? 0 : 1;
        }

        // 基本建筑：链接、炮塔
        else if (site.structureType === STRUCTURE_LINK ||
            site.structureType === STRUCTURE_TOWER
        ) {
            level += site.progress > 0 ? 5 : 6;
        }
        
        // 其他建筑
        else {
            level += site.progress > 0 ? 10 : 11;
        }

        siteLevelMap[site.id] = level;

        // 如果没有该任务
        if (missions.findIndex(m => m.data.siteId == site.id) === -1) {
            addMission(room, MISSION_TYPE.BUILD, BUILD_MISSION, {
                pos: site.pos,
                structureType: site.structureType,
                exist: true,
            })
        }
    }

    room.memory.missions[MISSION_TYPE.BUILD] = missions.filter(m => m.data.siteId in siteLevelMap).sort((a, b) => siteLevelMap[a.data.siteId] - siteLevelMap[b.data.siteId]);
}
