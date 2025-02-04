export const doneTerminalMission = (room: Room, task: Task, amount: number) => {
    amount = task.data.amount - amount;
    if (amount < 0) amount = 0;

    if (amount === 0) return true;

    task.lock = false;
    task.lockCreep = null;
    task.data.amount = amount;
}