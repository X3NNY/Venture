import flagAccUpAction from './acc/up';

const actions = {
    'ACC_UP': flagAccUpAction
}

const COLDDOWNS = {
    'ACC_UP': 1000
}

export const flagActionRun = (flag: Flag) => {
    if (!flag.memory.action) return ;

    if (Game.time - (flag.memory.lastRun || 0) < COLDDOWNS[flag.memory.action]) return ;

    actions[flag.memory.action].action(flag);

    flag.memory.lastRun = Game.time;
}