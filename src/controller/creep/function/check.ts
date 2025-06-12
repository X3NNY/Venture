export const creepCheckUnboostAvailable = (creep: Creep, roomCheck: boolean = true) => {
    if (roomCheck && !creep.room.memory.unBoostPos) return false;

    return creep.body.some(p => p.boost);
}