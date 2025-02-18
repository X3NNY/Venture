import { BaseConfig } from "@/constant/config";
import { getRoomNumber } from "@/controller/room/function/get";

/**
 * 初始化内存
 */
export const memoryInit = () => {
    /**
     * auto -> 全自动
     * manual -> 人工
     */
    if (!Memory.gamemode) Memory.gamemode = 'auto';
    if (!Memory.log) Memory.log = 'info';
    if (!Memory.Layout) Memory.Layout = {};
    if (!Memory.RoomInfo) Memory.RoomInfo = {};
    if (!Memory.System) Memory.System = {
        rooms: getRoomNumber()
    }
    if (!Memory.lang) Memory.lang = BaseConfig.LANG
}