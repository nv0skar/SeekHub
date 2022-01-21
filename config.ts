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

import {red, cyan} from "https://deno.land/std@0.118.0/fmt/colors.ts";

export const server = {hostname: "127.0.0.1", port: 2000}

export const configKeys = ["setup", "title", "name", "navTitle", "categories", "items", "extraInfo", "legalNotice", "masterKey"];
export const setupKeys = ["title", "name", "navTitle", "legalNotice"];

export interface configStructure {
    name:string;
    value:boolean | string | string[] | {tag: string, name: string}[] | {id: number, type: string, image: string, name: string, description: string, price: string, allergens: string}[] | {text: string}[];
}

const file2SaveConfig = "./config.json"

export async function fetchConfig() {
    try {
        const retrievedConfigFile: configStructure[] = JSON.parse(await Deno.readTextFile(file2SaveConfig));
        data = retrievedConfigFile;
        return true;
    } catch {
        console.log(red("There was an error while trying to load config data!"), cyan("So regenerating the file..."));
        await updateConfig(undefined, false)
    }
}

export async function updateConfig(data2Update: configStructure | undefined, fetch=true) {
    if (data2Update != undefined)
    for (const dataIndex in data) {
        if (data[dataIndex].name == data2Update.name) {
            try {
                data[dataIndex].value = data2Update.value;
                await Deno.writeTextFile(file2SaveConfig, JSON.stringify(data));
            } catch(e) {
                console.log(red(e));
            }
            break
        }
    } else {
        try {
            await Deno.writeTextFile(file2SaveConfig, JSON.stringify(data));
        } catch(e) {
            console.log(red("Error:"), e);
        }
    }
    if (fetch) await fetchConfig();
}

export function getData(key:string) {
    for (const dataIndex in data) {
        if (data[dataIndex].name == key) {
            if (data[dataIndex].name == "navTitle") {
                let buff1 = ""; let buff2 = "";
                for (let i = 0, encountered = false; i < (data[dataIndex].value as string).length; i++) {
                    const char = (data[dataIndex].value as string).charAt(i);
                    if (char == " ") { encountered = true; continue }
                    if (!encountered) buff1 += char;
                    else buff2 += char;
                }
                return [buff1, buff2]
            }
            return data[dataIndex].value;
        }
    }
}

export let data: configStructure[] = [
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
