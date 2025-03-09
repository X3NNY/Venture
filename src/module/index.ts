
import * as roomController from '@/controller/room';
import * as creepController from '@/controller/creep';
import * as powerCreepController from '@/controller/powerCreep';
import { errorMapper } from './errorMapper';
import { globalInit } from './init/global';
import { memoryInit } from './init/memory';
import mountConsole from '@/console';
import { endClean } from './end/clean';
import { endGeneratePixel } from './end/pixel';
import { getCpuConsumption } from '@/util/function';
import { endClaimCheck } from './end/claim';
import { endAidCheck } from './end/aid';
import { drawTable } from '@/util/chart';

let _cachedMemory: Memory;
let _isFirstCreate = true;

export const globalInitialize = () => {
    mountConsole();
}

const onFirstCreate = () => {
    globalInit();
    memoryInit();
    _isFirstCreate = false;
}

const onCreate = () => {
    if (_cachedMemory) {
        // @ts-ignore
        delete global.Memory;
        // @ts-ignore
        global.Memory = _cachedMemory;
    } else {
        // @ts-ignore
        _cachedMemory = global.Memory;
    }
    if (_isFirstCreate) onFirstCreate();
}

const onStart = () => {

}

const onProcess = () => {
    const roomCPUMap = {};
    const creepCPUMap = {};
    const pcCPUMap = {};
    // 房间动作
    Object.values(Game.rooms).forEach(room => {
        if (Memory.log === 'debug') {
            const start = Game.cpu.getUsed();
            roomController.eventLoop(room);
            roomCPUMap[room.name] = (creepCPUMap[room.name]||0) + Game.cpu.getUsed()-start;
        } else {
            roomController.eventLoop(room)
        }
    });
    
    
    // 爬动作
    Object.values(Game.creeps).forEach(creep => {
        if (Memory.log === 'debug') {
            const start = Game.cpu.getUsed();
            creepController.eventLoop(creep)
            creepCPUMap[creep.memory.role] = (creepCPUMap[creep.memory.role]||0) + Game.cpu.getUsed()-start;
        } else {
            creepController.eventLoop(creep);
        }
    });

    // 超爬
    Object.values(Game.powerCreeps).forEach(pc => {
        if (Memory.log === 'debug') {
            const start = Game.cpu.getUsed();
            powerCreepController.eventLoop(pc)
            pcCPUMap[pc.memory.role] = (creepCPUMap[pc.memory.role]||0) + Game.cpu.getUsed()-start;
        } else {
            powerCreepController.eventLoop(pc);
        }
    })
    if (Memory.log === 'debug') {
        console.log('房间总消耗：', Object.values<number>(roomCPUMap).reduce((a,b)=>a+b,0).toFixed(2), '爬爬总消耗：', Object.values<number>(creepCPUMap).reduce((a,b)=>a+b,0).toFixed(2), '超爬总消耗：', Object.values<number>(pcCPUMap).reduce((a,b)=>a+b,0).toFixed(2))
        console.log(drawTable([Object.values(roomCPUMap).map((v:number)=>v.toFixed(2))], Object.keys(roomCPUMap)));
        console.log(drawTable([Object.values(creepCPUMap).map((v:number)=>v.toFixed(2))], Object.keys(creepCPUMap)));
        console.log(drawTable([Object.values(pcCPUMap).map((v:number)=>v.toFixed(2))], Object.keys(pcCPUMap)));
    }
}

const onEnd = () => {
    endClean();
    endGeneratePixel();
    endClaimCheck();
    endAidCheck();
}

const onDestory = () => {
    // @ts-ignore
    RawMemory._parsed = global.Memory;
}

export const botLoop = () => {
    // 回合创建事件
    onCreate();

    // 回合开始事件
    onStart();

    // 回合主进程：房间&爬
    errorMapper(onProcess);

    // 回合结束事件
    onEnd();

    // 回合销毁事件
    onDestory();
}