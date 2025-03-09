interface Creep {
    originMoveTo(x: number, y: number, opts?: MoveToOpts): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET;

    originMoveTo(
        target: RoomPosition | { pos: RoomPosition },
        opts?: MoveToOpts,
    ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
}

interface CreepMemory {
    role: string,
    home: string,
    ready: boolean,
    action: string,
    union?: bool,
    cache: any,
    rType?: ResourceConstant,
    sourceRoom?: string,
    targetRoom?: string,
    dontPullMe?: boolean,
    
    boostCount: number,             // 强化尝试次数
    
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