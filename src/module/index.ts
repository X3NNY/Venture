
import * as roomController from '@/controller/room';
import * as creepController from '@/controller/creep';
import { errorMapper } from './errorMapper';
import { globalInit } from './init/global';
import { memoryInit } from './init/memory';
import mountConsole from '@/console';
import { endClean } from './end/clean';
import { endGeneratePixel } from './end/pixel';
import { getCpuConsumption } from '@/util/function';
import { endClaimCheck } from './end/claim';
import { endAidCheck } from './end/aid';

// let _cachedMemory: Memory;
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
    // if (_cachedMemory) {
    //     // @ts-ignore
    //     delete global.Memory;
    //     // @ts-ignore
    //     global.Memory = _cachedMemory;
    // } else {
    //     // @ts-ignore
    //     _cachedMemory = global.Memory;
    // }
    if (_isFirstCreate) onFirstCreate();
}

const onStart = () => {

}

const onProcess = () => {
    // 房间动作
    Object.values(Game.rooms).forEach(room => roomController.eventLoop(room));

    // 爬动作
    Object.values(Game.creeps).forEach(creep => creepController.eventLoop(creep))
}

const onEnd = () => {
    endClean();
    endGeneratePixel();
    endClaimCheck();
    endAidCheck();
}

const onDestory = () => {
    // @ts-ignore
    // RawMemory._parsed = global.Memory;
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