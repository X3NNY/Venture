import layout from "./global/layout";

const plugins = [
    layout
]

export default () => plugins.forEach(plugin => _.assign(global, plugin));