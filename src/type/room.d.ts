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
        missions: {
            [taskType: string]: Task[]
        },
        sourceHarvestPos?: {},
        index?: number,
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