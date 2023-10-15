import { Plugin } from "siyuan";
import { client } from "../api/siyuan";
import { WereadConfig } from "../types/config";

export function getPluginConfig(pluginName: string, storageName = "config") {
    const plugins: Plugin[] = window["siyuan"]["ws"]["app"]["plugins"];
    for(let index = 0; index < plugins.length; index++) {
        const plugin = plugins[index];
        if (plugin.name === pluginName) {
            return plugin.data[storageName];
        }
    }
}

export function updatePluginConfig(pluginName: string, storageName = "config", file: File | BlobPart) {
    client.putFile({
        path: `/data/storage/petal/${pluginName}/${storageName}`,
        isDir: false,
        modTime: Date.now(),
        file: file
    });
}

export function getConfigBlob(config: WereadConfig): Blob {
    const jsonStr = JSON.stringify(config);
    return new Blob([jsonStr], { type: 'application/json' });
}