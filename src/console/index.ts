import layout from "./global/layout";
import room from './global/room';

const plugins = [
    layout,
    room,
]

export default () => plugins.forEach(plugin => _.assign(global, plugin));