interface Room {
    road: StructureRoad[];
    /** 房间中的source数组 */
    source: Source[];
    /** 房间中的mineral对象 */
    mineral: Mineral;
    /** 房间中的spawn数组 */
    spawn: StructureSpawn[];
    /** 房间中的extension数组 */
    extension: StructureExtension[];
    /** 房间中的powerSpawn对象 */
    powerSpawn: StructurePowerSpawn;
    /** 房间中的factory对象 */
    factory: StructureFactory;
    /** 房间中的tower数组 */
    tower: StructureTower[];
    /** 房间中的nuker对象 */
    nuker: StructureNuker;
    /** 房间中的lab数组 */
    lab: StructureLab[];
    /** 房间中的link数组 */
    link: StructureLink[];
    /** 房间中的container数组 */
    container: StructureContainer[];
    /** 房间中的extractor对象 */
    extractor: StructureExtractor;
    /** 房间中的observer对象 */
    observer: StructureObserver;
    /** 得到包括此房间所有（按此顺序：）storage、terminal、factory、container的数组 */
    mass_stores: (StructureStorage | StructureTerminal | StructureFactory | StructureContainer)[];
    /** 房间中的powerBank数组 */
    powerBank: StructurePowerBank[];
    /** 房间中的deposit数组 */
    deposit: Deposit[];
    /** 房间中的rampart数组 */
    rampart: StructureRampart[];
    /** 房间等级 */
    level: number;
    /** 房间是否为自己所有 */
    my: boolean;

    memory: {
        missions: {                                       // 任务列表
            [taskType: string]: Task[]
        },
        depositTarget?: {                                 // 商品采集目标
            [depositId: string]: {
                num: number,                              // 采集点数
                open: boolean                             // 采集开关
            }
            [roomName: string]: {
                num: number,                              // 采集点数
                open: boolean                             // 采集开关
            }
        },
        powerTarget?: {                                   // 超能采集目标
            [roomName: string]: {
                avail: boolean,                           // 是否可采集
                creep: number,                            // 能量采集爬爬预计数量
                count?: number,                           // 能量采集爬爬已有数量
                max: number,                              // 能量采集爬爬最大数量
                boostLevel: number,                       // 强化等级
                rCreep: number,                           // 远程爬爬预计数量
                rCount?: number,                          // 远程爬爬已有数量
                rMax: number,                             // 远程爬爬最大数量
            }
        },
        depositMineral?: {
            [depositId: Id<Deposit>]: number              // 矿点采集点数
        },
        powerMineral?: {
            [powerBankId: Id<StructurePowerBank>]: number // 矿点采集点数
        },
        sourceHarvestPos?: any,                           // 采集点
        index?: number,                                   // 耗时任务执行tick
        unBoostPos?: { x: number, y: number },            // 去强化位置 
        [key: string]: any
    };
    
    // 房间建筑缓存更新
    update(type?: StructureConstant): void;
}

interface Task {
    id: string,
    type: string,
    time: number,
    level: number,
    delay?: number,
    lock?: boolean,
    lockCreep?: Id<Creep>,
    data: any
}

interface MISSION {
    type: string,
    code?: string,
    level?: number,
    role?: string
}