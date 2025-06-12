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
    squad: string,
    bindCreep?: Id<Creep>,
    notified?: boolean,
    boostLevel?: number,
    boosted?: boolean,
    cache: any,
    suicide?: boolean,
    rType?: ResourceConstant,
    sourceRoom?: string,
    targetRoom?: string,
    protalRoom?: string,
    targetShard?: string,
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


interface CreepFindClosestTarget{
    /**
     * Find the object with the shortest linear distance from the given position.
     * @param type Any of the FIND_* constants.
     * @param opts An object containing pathfinding options (see Room.findPath), or one of the following: filter, algorithm
     */
    <K extends FindConstant, S extends FindTypes[K]>(creep: Creep | PowerCreep, type: K, opts?: FilterOptions<K, S>): S | null;
    <S extends AnyStructure>(creep: Creep | PowerCreep, typeOrObjects: FIND_STRUCTURES | FIND_MY_STRUCTURES | FIND_HOSTILE_STRUCTURES, opts?: FilterOptions<FIND_STRUCTURES, S>): S | null;

    /**
     * Find the object with the shortest linear distance from the given position.
     * @param objects An array of RoomPositions or objects with a RoomPosition.
     * @param opts An object containing pathfinding options (see Room.findPath), or one of the following: filter, algorithm
     */
    <T extends _HasRoomPosition | RoomPosition>(
        creep: Creep | PowerCreep,
        objects: T[],
        opts?: { filter: any | string },
    ): T | null;
}