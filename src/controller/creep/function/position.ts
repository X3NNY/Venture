export const creepIsOnEdge = (creep: Creep) => {
    const { x, y } = creep.pos;
    return x === 0 || x === 49 || y === 0 || y === 49;
}
