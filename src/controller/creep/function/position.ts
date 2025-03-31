export const creepIsOnEdge = (creep: Creep | PowerCreep) => {
    const { x, y } = creep.pos;
    return x === 0 || x === 49 || y === 0 || y === 49;
}

export const creepIsNearEdge = (creep: Creep | PowerCreep) => {
    const { x, y } = creep.pos;
    return x === 1 || x === 48 || y === 1 || y === 48;
}


export const creepGetRangePos = (creep: Creep, range: number) => {
    const res = [];
    for (let dx = -range; dx <= range; dx++ ) {
        for (let dy = -range; dy <= range; dy++) {
            res.push([creep.pos.x+dx, creep.pos.y+dy]);
        }
    }
    return res;
}