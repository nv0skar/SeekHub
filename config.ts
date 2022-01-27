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
import { renderer, special } from "./utils.ts"

const file2SaveConfig = "./config.json";
const netDefaults: [string, number] = ["127.0.0.1", 2000];
export const idGenDict = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_+=@";

export const configKeys = ["hostname", "port", "setup", "title", "name", "navTitle", "categories", "items", "extraInfo", "legalNotice", "masterKey", "tempKey", "sessionTime"];
export const setupKeys = ["title", "name", "navTitle", "legalNotice"];
export interface configStructure {
    name:string;
    value:boolean | string | number | string[] | {tag: string, name: string}[] | {id: number, type: string, image: string, name: string, description: string, price: string, allergens: string}[] | {text: string}[] | undefined;
}

export class config {
    static data: configStructure[] = [
        {name: "hostname", value: "127.0.0.1"},
        {name: "port", value: 2000},
        {name: "setup", value: false}, 
        {name: "title", value: ""}, 
        {name: "name", value: ""}, 
        {name: "navTitle", value: ""},
        {name: "categories", value: []},
        {name: "items", value: []},
        {name: "extraInfo", value: []},
        {name: "legalNotice", value: ""},
        {name: "masterKey", value: ""}
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
                            if (configKeysNotInData[configKeysNotInDataKey] == config.data[dataIndex].name) delete configKeysNotInData[configKeysNotInDataKey];
                        }
                    // deno-lint-ignore no-empty
                    } catch {}
                }
                for (const configKeysNotInDataKey in configKeysNotInData) config.data.push({name: configKeysNotInData[configKeysNotInDataKey], value: undefined});
                await config.updateConfig(undefined, false)
            }
            renderer.main.clearMasterPool();
            return true;
        } catch {
            console.log(red("There was an error while trying to load config data!"), cyan("So regenerating the file..."));
            await config.updateConfig(undefined, false)
            renderer.main.clearMasterPool();
        }
    }
    
    static async updateConfig(data2Update: configStructure | undefined, fetch=true) {
        if (data2Update != undefined)
        for (const dataIndex in config.data) {
            if (config.data[dataIndex].name === data2Update.name) {
                try {
                    config.data[dataIndex].value = data2Update.value;
                    await Deno.writeTextFile(file2SaveConfig, JSON.stringify(config.data));
                } catch(e) {
                    console.log(red(e));
                }
                break
            }
        } else {
            try {
                await Deno.writeTextFile(file2SaveConfig, JSON.stringify(config.data));
            } catch(e) {
                console.log(red("Error:"), e);
            }
        }
        if (fetch) await config.fetchConfig();
    }
    
    static getData(key:string) {
        for (const dataIndex in config.data) {
            if (config.data[dataIndex].name === key) {
                if (config.data[dataIndex].name === "navTitle") return special.formatNavbar((config.data[dataIndex].value as string));
                if (config.data[dataIndex].name == "hostname" && config.data[dataIndex].value == undefined) return netDefaults[0];   
                if (config.data[dataIndex].name == "port" && config.data[dataIndex].value == undefined) return netDefaults[1];
                if (config.data[dataIndex].name == "setup" && config.data[dataIndex].value == undefined) return false;
                return config.data[dataIndex].value;
            }
        }
    }
}
