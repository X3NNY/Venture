import help from "./general/help";
import lang_switch from "./general/lang_switch";
import layout from "./global/layout";
import market from "./global/market";
import room from './global/room';
import lab from "./structure/lab";

const plugins = [
    layout,
    room,
    lab,
    market,
]

const func = [
    help,
    lang_switch
]

export default () => {
    plugins.forEach(plugin => _.assign(global, plugin));
    func.forEach(f => Object.defineProperty(global, f.name, { get: f }))
}