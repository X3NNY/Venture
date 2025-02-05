interface CreepMemory {
    role: string,
    home: string,
    ready: boolean,
    action: string,
    cache: any,
    rType?: ResourceConstant,
    sourceRoom?: string,
    targetRoom?: string,
    dontPullMe?: boolean,
    
    sign?: string,

    lastTargetPos?: {
        x: number,
        y: number,
        roomName: string
    },

    targetSourceId?: Id<Source>,
    targetHarvestPos?: {
        x: number,
        y: number,
        roomName: string
    },
}

interface MarketOrder {
    orderType: ORDER_BUY | ORDER_SELL | 'deal_buy' | 'deal_sell',
    amount: number,
    price: number,
    rType: ResourceConstant,
}
interface Memory {
    gamemode: 'auto' | 'manual',
    lang: 'cn' | 'us',
    Layout: {
        [roomName: string]: any
    },
    RoomInfo: {
        [roomName: string]: {
            autobuild: boolean,
            layout?: string,
            sign?: string,
            defend?: boolean,
            center?: { x: number, y: number },
            Market?: MarketOrder[],
            OutMineral?: {
                energy?: string[],
                center?: string[],
                highway?: string[],
            },
            lab?: {
                labA: Id<StructureLab>,
                labB: Id<StructureLab>,
                labAType: ResourceConstant,
                labBType: ResourceConstant,
                BOOST?: {
                    [labId: Id<StructureLab>]: {
                        type: MineralBoostConstant,
                        mineral: MineralBoostConstant,
                        amount: number
                    }
                },
                boostQueue?: {
                    [m: MineralBoostConstant]: number
                }
            },
        }
    },
    Whitelist: string[]
}