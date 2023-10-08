import { Plugin } from "siyuan";
import { WereadConfig } from "../types/config";

export function getPluginConfig(plugin_name: string): WereadConfig | null {
    const plugins: Plugin[] = window["siyuan"]["ws"]["app"]["plugins"];
    for(let index = 0; index < plugins.length; index++) {
        const plugin = plugins[index];
        if (plugin.name === plugin_name) {
            return plugin["config"] as WereadConfig;
        }
    }
    return null;
}