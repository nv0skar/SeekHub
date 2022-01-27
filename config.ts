// SeekHub
// Copyright (C) 2021 ItsTheGuy
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { red, cyan } from "https://deno.land/std@0.118.0/fmt/colors.ts";
import { renderer, special, debug as debugHandler } from "./utils.ts"

const netDefaults: [string, number] = ["127.0.0.1", 2000];

const file2SaveConfig = "./config.json";
export const configKeys = ["hostname", "port", "setup", "title", "name", "navTitle", "categories", "items", "extraInfo", "legalNotice", "masterKey", "tempKey", "sessionTime"];
export type configStructure = [string, boolean | string | number | string[] | {tag: string, name: string}[] | {id: number, type: string, image: string, name: string, description: string, price: string, allergens: string}[] | {text: string}[] | undefined];

export class config {
    static data: configStructure[] = [
        ["hostname", "127.0.0.1"],
        ["port", 2000],
        ["setup", false], 
        ["title", ""], 
        ["name", ""], 
        ["navTitle", ""],
        ["categories", []],
        ["items", []],
        ["extraInfo", []],
        ["legalNotice", ""],
        ["masterKey", ""]
    ];

    static async fetchConfig() {
        try {
            const retrievedConfigFile: configStructure[] = JSON.parse(await Deno.readTextFile(file2SaveConfig));
            config.data = retrievedConfigFile;
            {
                const configKeysNotInData = configKeys;
                for (const dataIndex in config.data) {
                    try {
                        for (const configKeysNotInDataKey in configKeysNotInData) {
                            if (configKeysNotInData[configKeysNotInDataKey] == config.data[dataIndex][0]) delete configKeysNotInData[configKeysNotInDataKey];
                        }
                    // deno-lint-ignore no-empty
                    } catch {}
                }
                for (const configKeysNotInDataKey in configKeysNotInData) config.data.push([configKeysNotInData[configKeysNotInDataKey], undefined]);
                await config.updateConfig(undefined, false)
            }
            renderer.main.clearMasterPool();
            return true;
        } catch (error) {
            if (error instanceof Deno.errors.NotFound ) {
                debugHandler.tell(cyan("Regenerating the config file..."));
                await config.updateConfig(undefined, false); renderer.main.clearMasterPool();
            }
        }
    }
    
    static async updateConfig(data2Update: configStructure | undefined, fetch=true) {
        if (data2Update != undefined)
        for (const dataIndex in config.data) {
            if (config.data[dataIndex][0] === data2Update[0]) {
                try {
                    config.data[dataIndex][1] = data2Update[1];
                    await Deno.writeTextFile(file2SaveConfig, JSON.stringify(config.data));
                } catch (e) {
                    debugHandler.tell(red(`Error while trying to update config file (${e})`));
                }
                break
            }
        } else {
            try {
                await Deno.writeTextFile(file2SaveConfig, JSON.stringify(config.data));
            } catch (e) {
                debugHandler.tell(red(`Error while trying to update config file (${e})`));
            }
        }
        if (fetch) await config.fetchConfig();
    }
    
    static getData(key:string) {
        for (const dataIndex in config.data) {
            if (config.data[dataIndex][0] === key) {
                if (config.data[dataIndex][0] === "navTitle") return special.formatNavbar((config.data[dataIndex][1] as string));
                if (config.data[dataIndex][0] == "hostname" && config.data[dataIndex][1] == undefined) return netDefaults[0];   
                if (config.data[dataIndex][0] == "port" && config.data[dataIndex][1] == undefined) return netDefaults[1];
                if (config.data[dataIndex][0] == "setup" && config.data[dataIndex][1] == undefined) return false;
                return config.data[dataIndex][1];
            }
        }
    }
}
