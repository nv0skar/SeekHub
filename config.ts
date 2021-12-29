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

import {red} from "https://deno.land/std@0.118.0/fmt/colors.ts";

export const configKeys = ["setup", "title", "name", "navTitle", "categories", "items", "extraInfo", "legalNotice"];

export interface configStructure {
    setup:boolean;
    title:string;
    name:string;
    navTitle:string[];
    categories:{tag: string, name: string}[];
    items:{id: number, type: string, image: string, name: string, description: string, price: string, allergens: string}[];
    extraInfo:{text: string}[];
    legalNotice:string;
}

const file2SaveConfig = "./configs.json"

export async function fetchConfig() {
    try {
        const retrievedConfigFile = JSON.parse(await Deno.readTextFile(file2SaveConfig));
        data = {setup: retrievedConfigFile.setup ?? data.setup, title: retrievedConfigFile.title ?? data.title, name: retrievedConfigFile.name ?? data.name, navTitle: retrievedConfigFile.navTitle ?? data.navTitle, categories: retrievedConfigFile.categories ?? data.categories, items: retrievedConfigFile.items ?? data.items, extraInfo: retrievedConfigFile.extraInfo ?? data.extraInfo, legalNotice: retrievedConfigFile.legalNotice ?? data.legalNotice}
        return true;
    } catch {
        console.log(red("There was an error while trying to load configs... Now exiting!"));
        Deno.exit();
    }
}

// deno-lint-ignore no-explicit-any
export async function updateConfig(key:string, value:any, fetch=true) {
    try {
        // @ts-ignore: The configKeys values are the same as the keys in configStructure so it shouldn't be a problem use configKeys as an index key
        data[key] = value
        await Deno.writeTextFile(file2SaveConfig, JSON.stringify(data));
    } catch(e) {
        console.log(e);
    }
    if (fetch) await fetchConfig();
}

export const server = {hostname: "127.0.0.1", port: 2000}
export let data: configStructure = {
    setup: false,
    title: "",
    name: "",
    navTitle: [],
    categories: [],
    items: [],
    extraInfo: [],
    legalNotice: ""
};