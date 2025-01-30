interface CreepMemory {
    role: string,
    home: string,
    ready: boolean,
    action: string,
    cache: any,
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

interface Memory {
    gamemode: 'auto' | 'manual',
    Layout: {
        [roomName: string]: any
    },
    RoomInfo: {
        [roomName: string]: any
    },
    Whitelist: string[]
}