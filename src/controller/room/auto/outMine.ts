import { filter } from 'lodash';
import { coordDecompress } from "@/util/coord";
import { updateSpawnCreepNum } from "../function";
import { getRoomTargetCreepNum } from "../function/get";
import { CREEP_ROLE } from "@/constant/creep";
import { addMission, countMission, deleteMission, filterMission } from "../mission/pool";
import { MISSION_TYPE, SPAWN_MISSION } from "@/constant/mission";
import { roomStructureLab } from '../structure/lab';

const outEnergyMine = (room: Room) => {
    if (Game.time % 20 !== 0) return ;
    const energyMineral = Memory.RoomInfo[room.name].OutMineral?.[RESOURCE_ENERGY];
    if (!energyMineral || !energyMineral.length) return ;

    updateSpawnCreepNum(room);

    for (const roomName of energyMineral) {
        const targetRoom = Game.rooms[roomName];
        
        // 没有视野创建侦察爬爬
        if (!targetRoom) {
            createOutScoutCreep(room, roomName);
            continue;
        }

        if (!targetRoom) continue ;
        
        // 定时检测，如果规划了路线则铺路
        if (Game.time % 100 === 0 && targetRoom.memory.road?.length > 0) {
            let sites = targetRoom.find(FIND_MY_CONSTRUCTION_SITES).length;
            for (const road of targetRoom.memory.road) {
                if (sites >= 10) break;
                const [x, y] = coordDecompress(road);
                const pos = new RoomPosition(x, y, roomName);
                const result = targetRoom.createConstructionSite(pos, STRUCTURE_ROAD)
                if (result === OK) sites++;
                if (result === ERR_FULL) break;
            }
        }

        const sources = targetRoom.source?.length || targetRoom.find(FIND_SOURCES).length || 0;
        if (sources === 0) continue;

        const hostiles = targetRoom.find(FIND_HOSTILE_CREEPS, {
            filter: c => (
                (c.owner.username === 'Invader' ||
                    c.owner.username === 'Source Keeper' ||
                    c.getActiveBodyparts(ATTACK) > 0 ||
                    c.getActiveBodyparts(RANGED_ATTACK) > 0 
                ) && !Memory.Whitelist?.includes(c.owner.username)
            )
        });

        // 如果有非NPC敌人
        if (hostiles.some(c => {
            if (c.owner.username === 'Invader') return false;
            if (c.owner.username === 'Source Keeper') return false;
            return true;
        })) {
            createOutDefendCreep(room, targetRoom, hostiles);
            // createOutDefendCreepPair(room, targetRoom, hostiles);
        } else {
            createOutDefendCreep(room, targetRoom, hostiles);
        }

        // 有敌人暂时不采集
        if (hostiles.length > 0) {
            const tasks = filterMission(room, MISSION_TYPE.SPAWN,
                m => m.data.role === SPAWN_MISSION.out_harvester.role ||
                    m.data.role === SPAWN_MISSION.out_carrier.role ||
                    m.data.role === SPAWN_MISSION.out_builder.role ||
                    m.data.role === SPAWN_MISSION.out_reserver.role
            )
            // 删除已在队列的其他爬爬
            for (const task of tasks) {
                deleteMission(room, MISSION_TYPE.SPAWN, task.id);
            }
            continue;
        }

        const controller = targetRoom.controller;
        
        // 别人的房间不采集
        if (controller?.owner) continue;

        // 预定该房间
        if (room.level >= 3) createOutReserverCreep(room, targetRoom);

        // 如果别人预定了
        if (controller.reservation &&
            controller.reservation.username !== room.controller.owner.username
        ) continue;

        createOutHarvesterCreep(room, targetRoom, sources);
        createOutCarrierCreep(room, targetRoom, Math.floor(sources*1.5));
        createOutBuilderCreep(room, targetRoom);
    }
}

// 中央九房外矿采集
const outCenterMine = (room: Room) => {
    if (Game.time % 20 !== 0) return;
    const centerMineral = Memory.RoomInfo[room.name].OutMineral?.center;

    if (!centerMineral || !centerMineral.length) return ;
    updateSpawnCreepNum(room);

    for (const roomName of centerMineral) {
        const targetRoom = Game.rooms[roomName];

        if (!targetRoom) {
            createOutScoutCreep(room, roomName);
            continue;
        }
        if (!targetRoom) continue;

        if (Game.time % 100 === 0 && (targetRoom.memory.road?.length||0) > 0) {
            let sites = targetRoom.find(FIND_MY_CONSTRUCTION_SITES).length;
            for (const road of targetRoom.memory.road) {
                if (sites >= 10) break;
                const [x, y] = coordDecompress(road);
                const pos = new RoomPosition(x, y, roomName);
                const result = targetRoom.createConstructionSite(pos, STRUCTURE_ROAD)
                if (result === OK) sites++;
                if (result === ERR_FULL) break;
            }
        }
        createOutAttackerCreep(room, targetRoom);
        const hostiles = targetRoom.find(FIND_HOSTILE_CREEPS, {
            filter: c => (c.getActiveBodyparts(ATTACK) > 0 || c.getActiveBodyparts(RANGED_ATTACK) > 0) &&
            c.owner.username !== 'Source Keeper' &&
            !Memory.Whitelist?.includes(c.owner.username)
        });

        const sourceKeeper = targetRoom.find(FIND_HOSTILE_CREEPS, {
            filter: c => c.owner.username === 'Source Keeper'
        });

        const creeps = getRoomTargetCreepNum(roomName);
        const out_attacker = (creeps[CREEP_ROLE.OUT_ATTACKER] || []).filter(c => !c.spawing).length;

        if (hostiles.length > 0) {
            createOutProtectorCreep(room, targetRoom);
            continue;
        }

        // 有敌人暂时不采集
        if (sourceKeeper.length > 0 && out_attacker < 1) {
            const tasks = filterMission(room, MISSION_TYPE.SPAWN,
                m => m.data.role === SPAWN_MISSION.out_harvester.role ||
                    m.data.role === SPAWN_MISSION.out_carrier.role ||
                    m.data.role === SPAWN_MISSION.out_builder.role ||
                    m.data.role === SPAWN_MISSION.out_reserver.role
            )
            // 删除已在队列的其他爬爬
            for (const task of tasks) {
                deleteMission(room, MISSION_TYPE.SPAWN, task.id);
            }
            continue;
        }
        
        createOutHarvesterCreep(room, targetRoom, 3);
        const mineral = targetRoom.find(FIND_MINERALS)[0];
        if (mineral && mineral.mineralAmount > 0) {
            createOutMinerCreep(room, targetRoom);
        }
        createOutCarrierCreep(room, targetRoom, 4);
        createOutBuilderCreep(room, targetRoom, true);
    }
}

// 高速通道外矿采集
const outHighwayMine = (room: Room) => {
    if (Game.time % 15 > 1) return;
    const highwayMineral = Memory.RoomInfo[room.name].OutMineral?.highway;
    if (!highwayMineral || highwayMineral.length === 0) return ;

    if (!room.observer) return ;

    if (Game.time % 15 === 0) {
        const lookIdx = Math.floor(Game.time / 15) % highwayMineral.length;
        const roomName = highwayMineral[lookIdx];
        if (!Game.rooms[roomName]) room.observer.observeRoom(roomName);
        return ;
    }

    for (const roomName of highwayMineral) {
        const targetRoom = Game.rooms[roomName];

        if (!targetRoom) continue;

        if (!room.memory.powerTarget) room.memory.powerTarget = {};
        if (!room.memory.depositTarget) room.memory.depositTarget = {};

        if (!room.memory.powerTarget[roomName]) {
            const count = outRoomPowerBankCheck(targetRoom);
            if (count > 0) {
                const power = targetRoom.find<StructurePowerBank>(FIND_STRUCTURES, {
                    filter: s => s.structureType === STRUCTURE_POWER_BANK && 
                        s.power >= 2000
                })[0].power;
                const data = getPowerBankMissionData(room, count, power);
                room.memory.powerTarget[roomName] = data;
                console.log(`[${room.name}] 外矿 ${roomName} 发现 ${count} 个超能矿，能量 ${power}，准备发送爬爬。`)
            }
        }

        if (!room.memory.depositTarget[roomName]) {
            const count = outRoomDepositCheck(targetRoom);
            if (count > 0) {
                room.memory.depositTarget[roomName] = {
                    num: count,
                    open: true
                }
                console.log(`[${room.name}] 外矿 ${roomName} 发现 ${count} 个商品矿，准备发送爬爬。`)
            }
        }
    }
}

// 商品外矿采集
const outDepositMine = (room: Room) => {
    if (Game.time % 15 !== 1) return ;
    if (!room.memory.depositTarget || Object.keys(room.memory.depositTarget).length === 0) return ;

    updateSpawnCreepNum(room);

    for (const roomName in room.memory.depositTarget) {
        const data = room.memory.depositTarget[roomName];

        if (!data.num || data.num <= 0) {
            delete room.memory.depositTarget[roomName];
            continue;
        }

        const targetRoom = Game.rooms[roomName];

        // 检查商品可采集位
        if (targetRoom && Game.time % (15 * 4) === 1) {
            const count = outRoomDepositCheck(targetRoom);
            if (count > 0) {
                data.num = count;
            } else {
                delete room.memory.depositTarget[roomName];
                continue;
            }
        }

        if (!data.open) continue;

        const creeps = getRoomTargetCreepNum(roomName);
        // 检查商品采集爬爬数量
        const dhs = (creeps[CREEP_ROLE.DEPOSIT_HARVESTER] || []).filter(c => c.spawning || c.ticks > 200).length;
        const dhspawns = global.SpawnCreepNum[room.name][CREEP_ROLE.DEPOSIT_HARVESTER] || 0

        if (dhs + dhspawns < data.num) {
            addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.deposit_harvester, {
                home: room.name, targetRoom: roomName
            })
            console.log(`[${room.name}] 外矿 ${roomName} 准备发送商品采集爬爬。`)
        }

        const dcs = (creeps[CREEP_ROLE.DEPOSIT_CARRIER] || []).filter(c => c.spawning || c.ticks > 150).length;
        const dcspawns = global.SpawnCreepNum[room.name][CREEP_ROLE.DEPOSIT_CARRIER] || 0
        if (dcs + dcspawns < data.num / 2) {
            addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.deposit_carrier, {
                home: room.name, targetRoom: roomName
            })
        }
    }
}

const outRoomDepositCheck = (room: Room) => {
    const deposits = room.find(FIND_DEPOSITS);
    
    if (!deposits || deposits.length === 0) return 0;
    
    let count = 0;
    for (const deposit of deposits) {
        // 冷却太长不值得
        if (deposit.lastCooldown >= 100) continue;
        
        // 统计可用采集点
        const terrain = room.getTerrain();
        let hpos = 0;
        [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dx, dy]) => {
            if (terrain.get(deposit.pos.x+dx, deposit.pos.y+dy) !== TERRAIN_MASK_WALL) hpos++;
        })

        if (hpos === 0) continue;
        if (!room.memory.depositMineral) room.memory.depositMineral = {};
        room.memory.depositMineral[deposit.id] = hpos;
        
        count += Math.min(hpos, 3)
    }

    for (const id in (room.memory.depositMineral||{})) {
        if (Game.getObjectById(id as Id<Deposit>)) continue;
        delete room.memory['depositMineral'][id];
    }
    return count;
}

// 超能采集
const outPowerBankMine = (room: Room) => {
    if (Game.time % 15 !== 1) return ;
    if (!room.memory.powerTarget || Object.keys(room.memory.powerTarget).length === 0) return ;

    updateSpawnCreepNum(room);
    for (const roomName in room.memory.powerTarget) {
        const targetRoom = Game.rooms[roomName];
        const powerBank = targetRoom?.powerBank?.[0] ?? targetRoom?.find(FIND_STRUCTURES, {
            filter: s => s.structureType === STRUCTURE_POWER_BANK
        })[0];

        // 房间还在，超能没了
        if (targetRoom && !powerBank) {
            delete room.memory.powerTarget[roomName];
            continue;
        }

        const creeps = getRoomTargetCreepNum(roomName);
        let pas = 0, phs = 0;
        const data = room.memory.powerTarget[roomName];
        let creepNum = data.creep;
        if (!powerBank || powerBank.hits > 500000) {
            pas = (creeps[CREEP_ROLE.POWER_ATTACKER] || []).filter(c => c.spawning || c.ticks > 100).length;
            phs = (creeps[CREEP_ROLE.POWER_HEALER] || []).filter(c => c.spawning || c.ticks > 100).length;
        } else {
            pas = (creeps[CREEP_ROLE.POWER_ATTACKER] || []).length;
            phs = (creeps[CREEP_ROLE.POWER_HEALER] || []).length;
            creepNum = 1;
        }

        if (!data.count) data.count = 0;
        if (data.count < data.max) {
            const paTotal = pas + (global.SpawnCreepNum[room.name][CREEP_ROLE.POWER_ATTACKER] || 0);
            const phTotal = phs + (global.SpawnCreepNum[room.name][CREEP_ROLE.POWER_HEALER] || 0);

            for (let i = Math.min(paTotal, phTotal); i < creepNum; i++) {
                if (data.boostLevel === 0) {
                    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.power_attacker, {
                        home: room.name, targetRoom: roomName,
                        boostLevel: 0
                    })
                    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.power_healer, {
                        home: room.name, targetRoom: roomName,
                        boostLevel: 0
                    })
                } else if (data.boostLevel === 1) {
                    roomStructureLab.setBoost(room, 'GO', 150, true);
                    roomStructureLab.setBoost(room, 'UH', 600, true);
                    roomStructureLab.setBoost(room, 'LO', 750, true);
                    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.power_attacker, {
                        home: room.name, targetRoom: roomName,
                        boostLevel: 1
                    })
                    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.power_healer, {
                        home: room.name, targetRoom: roomName,
                        boostLevel: 1
                    })
                } else if (data.boostLevel === 2) {
                    roomStructureLab.setBoost(room, 'GH2O', 150);
                    roomStructureLab.setBoost(room, 'UH2O', 600);
                    roomStructureLab.setBoost(room, 'LO', 750);
                    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.power_attacker, {
                        home: room.name, targetRoom: roomName,
                        boostLevel: 2
                    })
                    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.power_healer, {
                        home: room.name, targetRoom: roomName,
                        boostLevel: 1
                    })
                }
                data.count++;
                if (data.count >= data.max) break;
            }
        }

        if (!data.rCount) data.rCount = 0;
        if (data.rCount < data.rMax && data.rCreep > 0) {
            const prTotal = (creeps[CREEP_ROLE.POWER_ARCHER] || []).length + (global.SpawnCreepNum[room.name][CREEP_ROLE.POWER_ARCHER] || 0);
            for (let i = prTotal; i < data.rCreep; i++) {
                addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.power_archer, {
                    home: room.name, targetRoom: roomName
                })
                data.rCount++;
            }
        }

        if (!targetRoom) continue;

        const maxPc = powerBank.power / 1250;
        const ticksToArrive = Game.map.getRoomLinearDistance(room.name, roomName) * 50 + Math.ceil(maxPc/3)*150 + 50;

        let threshold = ticksToArrive * Math.max(1800, data.creep*600*(data.boostLevel+1));

        if (threshold < 600e3) threshold = 600e3;
        if (threshold > 1.5e6) threshold = 1.5e6;

        if (powerBank.hits <= threshold) {
            if (pas < 1 || phs < 1) continue;
            const pcTotal = (creeps[CREEP_ROLE.POWER_CARRIER] || []).filter(c => c.spawning || c.ticks > 150).length + (global.SpawnCreepNum[room.name][CREEP_ROLE.POWER_CARRIER] || 0);

            for (let i = pcTotal; i < maxPc; i++) {
                addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.power_carrier, {
                    home: room.name, targetRoom: roomName
                })
            }
        }
    }
}

const outRoomPowerBankCheck = (room: Room) => {
    const powerBank = room.find<StructurePowerBank>(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_POWER_BANK &&
            s.hits >= s.hitsMax
    })[0];

    if (!powerBank || powerBank.power <= 0) return 0;
    if (powerBank.hits < powerBank.hitsMax) return 0;

    let hpos = 0;
    const terrain = room.getTerrain();
    [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]].forEach(([dx, dy]) => {
        const [nx,ny] = [powerBank.pos.x+dx, powerBank.pos.y+dy];
        if (nx <= 1 || ny <= 1 || nx >= 48 || ny >= 48) return ;
        if (terrain.get(nx, ny) !== TERRAIN_MASK_WALL) hpos++;
    });

    if (hpos === 0) return 0;

    const count = Math.min(hpos, 3);
    if (powerBank.ticksToDecay > (2e6 / (600 * count) + 500)) return count;
    return 0;
}

const getPowerBankMissionData = (room: Room, hpos: number, power: number) => {
    const stores = [room.storage, room.terminal, ...room.lab];

    const LOAmount = stores.reduce((sum, s) => sum + s.store['LO'], 0);
    const GOAmount = stores.reduce((sum, s) => sum + s.store['GO'], 0);
    const UHAmount = stores.reduce((sum, s) => sum + s.store['UH'], 0);
    const GHO2Amount = stores.reduce((sum, s) => sum + s.store['GH2O'], 0);
    const UH2OAmount = stores.reduce((sum, s) => sum + s.store['UH2O'], 0);

    let data;
    // 一队T2
    if (power >= 7000 && LOAmount >= 3000 && GHO2Amount >= 3000 && UH2OAmount >= 3000) {
        data = {
            creep: 1,
            max: 1,
            boostLevel: 2,
            rCreep: 0,
            rMax: 0
        }
    }
    // 一队T1 + 5Range
    else if (power >= 7000 && LOAmount >= 3000 && GOAmount >= 3000 && UHAmount >= 3000) {
        data = {
            creep: 1,
            max: 2,
            boostLevel: 1,
            rCreep: 5,
            rMax: 8
        }
    }
    // 两队T1 + 4Range?
    else if (power > 3000 && LOAmount >= 3000 && GOAmount >= 3000 && UHAmount >= 3000) {
        data = {
            creep: Math.min(hpos, 2),
            max: 3,
            boostLevel: 1,
            rCreep: hpos == 1 ? 4 : 0,
            rMax: 6
        }
    }
    // 一队T0 + 7Range
    else if (power >= 6500) {
        data = {
            creep: 1,
            max: 2,
            boostLevel: 0,
            rCreep: 7,
            rMax: 10
        }
    }
    // 三队T0 + 4Range?
    else {
        data = {
            creep: hpos,
            max: 6,
            boostLevel: 0,
            rCreep: hpos <= 2 ? 4 : 0,
            rMax: 10
        }
    }
    return data;
}

export const roomOutMine = (room: Room) => {
    outEnergyMine(room);
    outCenterMine(room);
    outHighwayMine(room);
    outDepositMine(room);
    outPowerBankMine(room);
}

// 外房攻击者
const createOutAttackerCreep = (room: Room, targetRoom: Room) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_attacker = (creeps[CREEP_ROLE.OUT_ATTACKER]||[]).filter(c => c.ticks > 300 || c.spawning);

    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_ATTACKER] || 0;
    if (out_attacker.length + spawns >= 1) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_attacker, {
        home: room.name,
        targetRoom: targetRoom.name
    });
}

// 外房守护者
const createOutProtectorCreep = (room: Room, targetRoom: Room) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_protector = (creeps[CREEP_ROLE.OUT_PROTECTOR]||[]).filter(c => c.ticks > 300 || c.spawning);

    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_PROTECTOR] || 0;

    if (out_protector.length + spawns >= 1) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_protector, {
        home: room.name,
        targetRoom: targetRoom.name
    });
}

const createOutMinerCreep = (room: Room, targetRoom: Room) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_miner = (creeps[CREEP_ROLE.OUT_MINER]||[]).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_MINER] || 0;

    if (out_miner + spawns >= 1) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_miner, {
        home: room.name,
        targetRoom: targetRoom.name
    });
}

const createOutBuilderCreep = (room: Room, targetRoom: Room, isCenter: boolean = false) => {
    const site = targetRoom.find(FIND_MY_CONSTRUCTION_SITES, {
        filter: s => s.structureType === STRUCTURE_ROAD
    });

    if (site.length < 10 && !isCenter) return false;
    else if (site.length === 0) return false;

    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_builder = (creeps[CREEP_ROLE.OUT_BUILDER] || []).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_BUILDER] || 0;

    let num = 1;
    // if (site.length > 10) num = 2;
    if (out_builder + spawns >= num) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_builder, {
        home: room.name, targetRoom: targetRoom.name
    })
    return true;
}

const createOutCarrierCreep = (room: Room, targetRoom: Room, num: number) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const outCarrier = (creeps[CREEP_ROLE.OUT_CARRIER] || []).filter(c => c.home === room.name).length;
    // const outCar = (creeps[CREEP_ROLE.OUT_] || []).filter(c => c.home === room.name).length;

    const spawnCarrier = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_CARRIER] || 0;
    // const spawnCar = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_CAR] || 0;

    // 没运输车
    // if (outCar + spawnCar == 0) {

    // }

    if (outCarrier + spawnCarrier < num) {
        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_carrier, {
            home: room.name, targetRoom: targetRoom.name
        });
        return true;
    }
    return false;
}

const createOutReserverCreep = (room: Room, targetRoom: Room) => {
    if (!targetRoom.controller || targetRoom.controller.my) return false;
    if (room.controller.level < 3) return false;

    if (targetRoom.controller.reservation &&
        targetRoom.controller.reservation.username === room.controller.owner.username &&
        targetRoom.controller.reservation.ticksToEnd > 2000
    ) return false;

    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_reserver = (creeps[CREEP_ROLE.OUT_RESERVER] || []).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_RESERVER] || 0;

    if (out_reserver + spawns > 0) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_reserver, {
        home: room.name, targetRoom: targetRoom.name
    });
    return true;
}

const createOutScoutCreep = (room: Room, roomName: string) => {
    const creeps = getRoomTargetCreepNum(roomName);
    const scouts = (creeps[CREEP_ROLE.OUT_SCOUTER] || []).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_SCOUTER] || 0;

    if (scouts + spawns > 0) return false;
    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_scouter, {
        home: room.name, targetRoom: roomName
    })
}

const createOutHarvesterCreep = (room: Room, targetRoom: Room, num: number) => {
    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const harvesters = (creeps[CREEP_ROLE.OUT_HARVESTER] || []).length;
    const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_HARVESTER] || 0;
    
    if (harvesters + spawns >= num) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_harvester, {
        home: room.name,
        targetRoom: targetRoom.name,
    });
    return true;
}

const createOutDefendCreepPair = (room: Room, targetRoom: Room, hostiles: Creep[]) => {
    if (hostiles.length === 0) return false;

    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_attacker = (creeps[CREEP_ROLE.OUT_PAIR_ATTACKER] || []).length;
    const attackerSpawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_PAIR_ATTACKER] || 0;

    if (out_attacker + attackerSpawns >= 1) return false;

    const out_healer = (creeps[CREEP_ROLE.OUT_PAIR_HEALER] || []).length;
    const healerSpawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_PAIR_HEALER] || 0;
    if (out_healer + healerSpawns >= 1) return false;

    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_pair_attacker, {
        home: room.name, targetRoom: targetRoom.name
    });
    addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_pair_healer, {
        home: room.name, targetRoom: targetRoom.name
    });
    return true;
}

const createOutDefendCreep = (room: Room, targetRoom: Room, hostiles: Creep[]) => {
    const invaderCore = targetRoom.find(FIND_STRUCTURES, {
        filter: s => s.structureType === STRUCTURE_INVADER_CORE
    });

    if (invaderCore.length === 0 && hostiles.length === 0) return false;

    const creeps = getRoomTargetCreepNum(targetRoom.name);
    const out_defender = (creeps[CREEP_ROLE.OUT_DEFENDER] || []).length;
    const out_invaders = (creeps[CREEP_ROLE.OUT_INVADER] || []).length;

    if (hostiles.length > 0) {
        const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_DEFENDER] || 0;

        let maxNum = 1;
        if (room.level < 4) maxNum = 3;
        else if (room.level < 6) maxNum = 2;

        if (out_defender + spawns >= maxNum) return false;

        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_defender, {
            home: room.name, targetRoom: targetRoom.name
        });
        return true;
    }
    if (invaderCore.length > 0) {
        const spawns = global.SpawnCreepNum[room.name][CREEP_ROLE.OUT_INVADER] || 0;
        
        let maxNum = 1;
        if (room.level < 4) maxNum = 4;
        else if (room.level < 6) maxNum = 3;
        else if (room.level === 6) maxNum = 2;

        if (out_invaders + spawns >= maxNum) return false;

        addMission(room, MISSION_TYPE.SPAWN, SPAWN_MISSION.out_invader, {
            home: room.name, targetRoom: targetRoom.name
        });
        return true;
    }
    return false;
}