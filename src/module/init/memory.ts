/**
 * 初始化内存
 */
export const memoryInit = () => {
    /**
     * auto -> 全自动
     * manual -> 人工
     */
    if (!Memory.gamemode) Memory.gamemode = 'auto';
    if (!Memory.Layout) Memory.Layout = {};
    if (!Memory.RoomInfo) Memory.RoomInfo = {};
}