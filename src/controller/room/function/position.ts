export const roomIsOnEdge = (room: Room) => {
    let [name, x, y]: any = room.name.match(/[EW](\d+)[NS](\d+)/);
    x = parseInt(x);
    y = parseInt(y);

    if (x % 10 === 1) {
        if (y % 10 === 1) return BOTTOM_LEFT;
        if (y % 10 === 9) return TOP_LEFT;
        return LEFT;
    } else if (x % 10 === 9) {
        if (y % 10 === 1) return BOTTOM_RIGHT;
        if (y % 10 === 9) return TOP_RIGHT;
        return RIGHT;
    }
    if (y % 10 === 1) return BOTTOM;
    if (y % 10 === 9) return TOP;
    return 0;
}