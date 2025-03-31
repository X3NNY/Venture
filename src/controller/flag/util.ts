export const flagParse = (flag: Flag) => {
    if (flag.name.startsWith('ACC_UP')) {
        const isOrder = !!flag.name.match(/-ORDER/);

        flag.memory.action = 'ACC_UP';
        flag.memory.data = { order: isOrder };
    }
}