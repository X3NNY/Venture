interface MarketOrder {
    orderType: ORDER_BUY | ORDER_SELL | 'deal_buy' | 'deal_sell',
    amount: number,
    price: number | null,
    rType: ResourceConstant,
}
interface Memory {
    gamemode: 'auto' | 'manual',                                // 游戏模式：自动/手动
    lang: 'cn' | 'us',                                          // 语言选择
    log: 'info' | 'debug',                                                // 消息级别 info/debug
    Layout: {                                                   // 布局信息
        [roomName: string]: {
            [structure: StructureConstant]: number[]            // 建筑名：坐标数组
        }
    },
    System: {                                                   // 全局系统信息
        rooms: number,                                          // 房间数
    },
    SquadInfo: {                                                // 小队信息
        [squadName: string]: {                                  // 队伍名
            type: string,                                       // 队伍类型
            member: number,                                     // 成员数量
            assemble: boolean,                                  // 是否集结完毕
            creeps: {                                           // 对应爬爬ID
                A: Id<Creep>,
                B: Id<Creep>,
                C: Id<Creep>,
                D: Id<Creep>,
            }
        }
    },
    Resource: {                                                 // 资源分享
        [r: ResourceConstant]: {
            [roomName: string]: number,                         // 房间分享阈值
        }
    },
    RoomInfo: {                                                 // 房间信息
        [roomName: string]: {
            autobuild: boolean,                                 // 是否自动建造
            layout?: string,                                    // 房间布局类型
            sign?: string,                                      // 房间签名
            defend?: boolean,                                   // 是否处于防御模式
            center?: { x: number, y: number },                  // 布局中心
            Market?: MarketOrder[],                             // 市场订单任务
            OutMineral?: {
                energy?: string[],                              // 能量外矿房
                center?: string[],                              // 中央九房
                highway?: string[],                             // 高速公路
            },                                         
            lab?: {                                             // 化工厂信息
                open: boolean,                                  // 是否工作
                index?: number,                                 // 索引
                state: number,                                  // 工作阶段
                labA?: Id<StructureLab>,                        // 底物化工厂A
                labB?: Id<StructureLab>,                        // 底物化工厂B
                labAType?: MineralConstant | MineralCompoundConstant,                        // 底物B类型
                labBType?: MineralConstant | MineralCompoundConstant,                        // 底物B类型
                labAmount?: number,                             // 底物数量
                nextRunTime?: number,                           // 下次运行时间
                BOOST?: {
                    [labId: Id<StructureLab>]: {                // 化工厂ID
                        mineral: MineralBoostConstant,          // 实际化合物类型
                        amount: number                          // 强化数量
                    }
                },
                boostQueue?: {                                  // 强化队列
                    [m: MineralBoostConstant]: number           // 化合物类型：需求数量
                },
                autoQueue?: {                                   // 合成队列
                    target: MineralCompoundConstant,            // 化合物类型
                    amount: number,                             // 合成阈值
                    manual?: boolean,                           // 是否手动设置（不会被自动清理）
                }[]
            },
            Factory?: {
                open: boolean,                                  // 是否工作
                product: "energy"|MineralConstant|"G"|CommodityConstant|null, // 生产化合物
                level: number,                                  // 生产等级
                amount: number|null,                                 // 生产数量
                autoQueue: {                                  // 自动生产
                    product: "energy"|MineralConstant|"G"|CommodityConstant,
                    amount: number|null,
                }[]
            },
            powerSpawn?: {
                open: boolean,                                  // 是否工作
            }
        }
    },
    Whitelist: string[]                                         // 白名单房间列表
}