import layout from "./global/layout";
import market from "./global/market";
import room from './global/room';

const plugins = [
    layout,
    room,
    market,
]

export default () => plugins.forEach(plugin => _.assign(global, plugin));