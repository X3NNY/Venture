import { BaseConfig } from "@/constant/config";

/**
 * 全局初始化，管理global中的半持久数据
 */
export const globalInit = () => {
    global.BaseConfig = BaseConfig;
    global.BOT_NAME = BaseConfig.BOT_NAME;

    global.CreepNum = {}        // 爬爬数量
    global.SpawnCreepNum = {} // 孵化中数量

}