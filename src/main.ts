import '@/module/wheel/betterMove';        // 超级移动优化
import '@/module/wheel/structureCache';     // 极致建筑缓存
import { globalInitialize, botLoop } from './module';

globalInitialize();

export const loop = botLoop;

// // 性能开销分析
// import profiler from './module/wheel/screeps-profiler';
// profiler.enable();
// global.profiler = profiler
// export const loop = function() {
//     profiler.wrap(botLoop);
// }
