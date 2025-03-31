interface FlagMemory {
    action?: string,                        // 执行动作
    data: any,                              // 执行数据

    manual?: boolean,                       // 是否手动执行
    lastRun?: number,                       // 上次执行时间
}