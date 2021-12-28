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

export async function updateConfig() {
    try {
        const userConfigFile = JSON.parse(await Deno.readTextFile("./configs.json"));
        if (userConfigFile.setup == undefined) return false;
        setup = userConfigFile.setup;
        if (userConfigFile.title == undefined) return false;
        title = userConfigFile.title;
        if (userConfigFile.name == undefined) return false;
        name = userConfigFile.name;
        if (userConfigFile.navTitle == undefined) return false;
        navTitle = userConfigFile.navTitle;
        if (userConfigFile.categories == undefined) return false;
        categories = userConfigFile.categories;
        if (userConfigFile.items == undefined) return false;
        items = userConfigFile.items;
        if (userConfigFile.extraInfo == undefined) return false;
        extraInfo = userConfigFile.extraInfo;
        if (userConfigFile.legalNotice == undefined) return false;
        legalNotice = userConfigFile.legalNotice;
        return true;
    } catch {return false;}
}

export let setup:boolean;
export let title:string;
export let name:string;
export let navTitle:string;
export let categories:{tag: string, name: string}[];
export let items:{id: number, type: string, image: string, name: string, description: string, price: string, allergens: string}[];
export let extraInfo:{text: string}[];
export let legalNotice:string;