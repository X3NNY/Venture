interface Creep {
    originMoveTo(x: number, y: number, opts?: MoveToOpts): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET;

    originMoveTo(
        target: RoomPosition | { pos: RoomPosition },
        opts?: MoveToOpts,
    ): CreepMoveReturnCode | ERR_NO_PATH | ERR_INVALID_TARGET | ERR_NOT_FOUND;
}