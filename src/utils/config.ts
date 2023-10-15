import { Plugin } from "siyuan";

export function getPluginConfig(plugin_name: string, storageName = "config") {
    const plugins: Plugin[] = window["siyuan"]["ws"]["app"]["plugins"];
    for(let index = 0; index < plugins.length; index++) {
        const plugin = plugins[index];
        if (plugin.name === plugin_name) {
            return plugin.data[storageName];
        }
    }
}