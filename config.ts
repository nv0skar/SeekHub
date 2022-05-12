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

import { red, cyan } from "https://deno.land/std/fmt/colors.ts";
import { renderer, special, debug as debugHandler } from "./utils.ts"

const netDefaults: [string, number] = ["127.0.0.1", 2000];
export const apiEndpoint = "/api"

const file2SaveConfig = "./config.json";
export const configKeys = ["hostname", "port", "id", "masterKey", "tempKey", "sessionTime", "publicAPI", "setup", "title", "name", "navTitle", "categories", "items", "extraInfo", "legalNotice"];
export type categoryStructure = { tag: string, name: string };
export type itemStructure = { id: number, type: string, image: string, name: string, description: string, price: string, allergens: string };
export type configStructure = [string, boolean | string | number | string[] | categoryStructure[] | itemStructure[] | { text: string }[] | null];

export class config {
    static data: configStructure[] = [
        ["hostname", null],
        ["port", null],
        ["id", null],
        ["masterKey", null],
        ["tempKey", null],
        ["sessionTime", null],
        ["publicAPI", false],
        ["setup", false],
        ["title", null],
        ["name", null],
        ["navTitle", null],
        ["categories", null],
        ["items", null],
        ["extraInfo", null],
        ["legalNotice", null]
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
                    } catch { }
                }
                for (const configKeysNotInDataKey in configKeysNotInData) config.data.push([configKeysNotInData[configKeysNotInDataKey], null]);
                await config.updateConfig(undefined, false)
            }
            return true;
        } catch (error) {
            if (error instanceof Deno.errors.NotFound) {
                debugHandler.tell(cyan("Regenerating the config file..."));
                await config.updateConfig(undefined, false);
            }
        }
    }

    static async updateConfig(data2Update: configStructure | undefined, fetch = true) {
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
        renderer.main.clearMasterPool();
    }

    static getData(key: string, force = false) {
        for (const dataIndex in config.data) {
            if (config.data[dataIndex][0] === key) {
                if (config.data[dataIndex][0] === "navTitle") return special.formatNavbar((config.data[dataIndex][1] as string));
                if (config.data[dataIndex][0] === "hostname" && config.data[dataIndex][1] === null) return netDefaults[0];
                if (config.data[dataIndex][0] === "port" && config.data[dataIndex][1] === null) return netDefaults[1];
                if (((config.data[dataIndex][0] === "setup") || (config.data[dataIndex][0] === "publicAPI")) && config.data[dataIndex][1] === null) return false;
                if (((config.data[dataIndex][0] === "categories") || (config.data[dataIndex][0] === "items") || (config.data[dataIndex][0] === "extraInfo")) && config.data[dataIndex][1] === null) return [];
                if (config.data[dataIndex][1] === null) { if (!force) throw new Error(`The value of the data requested is not defined! (${config.data[dataIndex][0]})`); else return config.data[dataIndex][1]; }
                return config.data[dataIndex][1];
            }
        }
        throw new Error(`The data requested doesnt't exist! (${key})`);
    }
}
