import { MISSION_TYPE, REPAIRE_MISSION } from "@/constant/mission";
import { addMission } from "../pool";
import { coordCompress, coordDecompress } from "@/util/coord";

export const updateRepairMission = (room: Room) => {
    const structures = room.find(FIND_STRUCTURES, {
        filter: s => s.hits < s.hitsMax
    });

    const NORMAL_THRESHOLD = 0.8;
    const URGENT_THRESHOLD = 0.15;
    const NORMAL_WALL_HITS = room.level < 7 ? 3e5 : 1e6;
    const URGENT_WALL_HITS = 5000;

    for (const struct of structures) {
        const { hits, hitsMax } = struct;
        if (struct.structureType !== STRUCTURE_WALL && struct.structureType !== STRUCTURE_RAMPART) {
            // 建筑紧急维修
            if (hits < hitsMax * URGENT_THRESHOLD) {
                addMission(room, MISSION_TYPE.REPAIR, REPAIRE_MISSION.urgent_structure, {
                    target: struct.id,
                    pos: {x: struct.pos.x, y: struct.pos.y, roomName: struct.pos.roomName },
                    hits: hitsMax * URGENT_THRESHOLD
                })
                continue;
            }

            if (hits < hitsMax * NORMAL_THRESHOLD) {
                addMission(room, MISSION_TYPE.REPAIR, REPAIRE_MISSION.normal_structure, {
                    target: struct.id,
                    pos: {x: struct.pos.x, y: struct.pos.y, roomName: struct.pos.roomName },
                    hits: hitsMax * NORMAL_THRESHOLD
                })
                continue
            }
        } else {
            if (hits < URGENT_WALL_HITS) {
                addMission(room, MISSION_TYPE.REPAIR, REPAIRE_MISSION.urgent_wall, {
                    target: struct.id,
                    pos: {x: struct.pos.x, y: struct.pos.y, roomName: struct.pos.roomName },
                    hits: URGENT_WALL_HITS
                })
                continue
            }

            if (hits < NORMAL_WALL_HITS) {
                addMission(room, MISSION_TYPE.REPAIR, REPAIRE_MISSION.normal_wall, {
                    target: struct.id,
                    pos: {x: struct.pos.x, y: struct.pos.y, roomName: struct.pos.roomName },
                    hits: NORMAL_WALL_HITS
                })
                continue
            }
        }
    }
}

export const updateWallRepairMission = (room: Room) => {
    const WALL_MAX_THRESHOLD = .5;

    if (room.storage?.store[RESOURCE_ENERGY] < 50000) return ;

    const layout = Memory.Layout[room.name] || {};
    const ramparts = []
    const sTypes = [STRUCTURE_SPAWN, STRUCTURE_TOWER, STRUCTURE_STORAGE, STRUCTURE_TERMINAL, STRUCTURE_FACTORY, STRUCTURE_LAB, STRUCTURE_NUKER, STRUCTURE_POWER_SPAWN];

    // 寻找关键建筑上的盾
    for (const s of sTypes) {
        // 如果在布局中，直接加入计划
        if (layout[s]) {
            ramparts.push(...(layout[s] || []));
        }
        // 不在布局但建设了
        else {
            if (Array.isArray(room[s])) {
                const poss = room[s].map(s => [s.pos.x, s.pos.y]) as [number, number][];
                ramparts.push(...coordCompress(poss) as number[]);
            } else if (room[s]) {
                ramparts.push(coordCompress([room[s].pos.x, room[s].pos.y]));
            }
        }
    }

    // 寻找关键墙
    const walls = [];
    const rams = layout[STRUCTURE_RAMPART];
    for (const r of rams) {
        const [x, y] = coordDecompress(r);
        if (room.lookForAt(LOOK_STRUCTURES, x, y).some(s => s.structureType === STRUCTURE_WALL)) {
            walls.push(r);
        }
    }


    const ramwalls = room.find(FIND_STRUCTURES, {
        filter: s =>
            s.hits < s.hitsMax &&
            (
                (s.structureType === STRUCTURE_WALL && walls.includes(coordCompress([s.pos.x, s.pos.y]))) ||
                (s.structureType === STRUCTURE_RAMPART && ramparts.includes(coordCompress([s.pos.x, s.pos.y])))
            )
    })

    const roomNukes = room.find(FIND_NUKES) || [];
    for (const s of ramwalls) {
        const { hits, hitsMax } = s;

        // 计算核弹伤害并维修
        if (roomNukes.length > 0) {
            const nukeDamage = roomNukes.filter(n => s.pos.inRangeTo(n.pos, 2)).reduce((hits, nuke) => s.pos.isEqualTo(nuke.pos) ? hits + 1e7 : hits + 5e6, 0);

            if (hits < nukeDamage + 1e6) {
                addMission(room, MISSION_TYPE.REPAIR, REPAIRE_MISSION.anti_nuclear, {
                    target: s.id,
                    pos: { x: s.pos.x, y: s.pos.y, roomName: s.room.name },
                    hits: nukeDamage + 1e6
                });
                continue;
            }
        }

        // 日常刷墙维修
        if (hits < hitsMax * WALL_MAX_THRESHOLD) {
            const level = Math.floor(hits / hitsMax * 100) + 1;
            const targetHits = level / 100 * hitsMax;
            addMission(room, MISSION_TYPE.REPAIR, {
                ...REPAIRE_MISSION.dynamic,
                level: 10+level
            }, {
                target: s.id,
                pos: { x: s.pos.x, y: s.pos.y, roomName: s.room.name },
                hits: targetHits
            });
            continue;
        }
    }
}