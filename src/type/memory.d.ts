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
    Layout: {
        [roomName: string]: any
    },
    RoomInfo: {
        [roomName: string]: {
            Market?: MarketOrder[],
            OutMineral?: {
                energy?: string[],
                center?: string[],
                highway?: string[],
            },
            [key: string]: any,
        }
    },
    Whitelist: string[]
}