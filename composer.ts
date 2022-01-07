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

import { render } from 'https://deno.land/x/mustache_ts/mustache.ts';
import { DOMParser, Document } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import * as config from "./config.ts"

export class composeSetup {
    static async contruct() {
        const setup = await Deno.readTextFile("./public/elements/setup/setup.html");
        const foundation = await Deno.readTextFile("./public/elements/setup/foundation.html");
        const scripts = await Deno.readTextFile("./public/elements/setup/scripts.html");

        // deno-lint-ignore prefer-const
        let composition = new DOMParser().parseFromString(setup, "text/html")!;

        composition.documentElement!.getElementById("foundation")!.innerHTML += new DOMParser().parseFromString(foundation.toString(), "text/html")!.documentElement!.outerHTML.toString();
        composition.documentElement!.getElementById("foundation")!.innerHTML += new DOMParser().parseFromString(scripts.toString(), "text/html")!.documentElement!.outerHTML.toString();

        return composition.documentElement!.outerHTML;        
    }
}

export class composeMain {

    static async renderDynamicElements(composition: Document) {
        // For each pair of categories add a section
        const superContainer = await Deno.readTextFile("./public/elements/sections/superContainers.html");
        const numberOfSectionGroups = Math.round(config.data.categories.length/2);
        for (let i = 0; numberOfSectionGroups > i; i++) {
            const sectionGroupsElement = new DOMParser().parseFromString(render(superContainer, {num: i}).toString(), "text/html")!.documentElement!.outerHTML.toString();
            composition.documentElement!.getElementById("mainSection")!.innerHTML += sectionGroupsElement;
        }
      
        // For each category add a new section to the page
        const navbarItem = await Deno.readTextFile("./public/elements/navbar/item.html");
        const sectionContainer = await Deno.readTextFile("./public/elements/sections/container.html");
        let actualGroup = 0
        let repetitionsOfGroup = 0
        for (const i in config.data.categories) {
            const elementData = config.data.categories[i];
            const navbarElement = new DOMParser().parseFromString(render(navbarItem, {id: elementData.tag, name: elementData.name}).toString(), "text/html")!.documentElement!.outerHTML.toString();
            const sectionElement = new DOMParser().parseFromString(render(sectionContainer, {id: elementData.tag, name: elementData.name}).toString(), "text/html")!.documentElement!.outerHTML.toString();
            composition.documentElement!.getElementById("navbarSection")!.innerHTML += navbarElement;
            composition.documentElement!.getElementById("columnGroup" + actualGroup.toString())!.innerHTML += sectionElement;
            if (repetitionsOfGroup == 1) {repetitionsOfGroup = 0; actualGroup += 1}
            else repetitionsOfGroup += 1
        }

        // For each element in menu add a new element to the page
        const elementItem = await Deno.readTextFile("./public/elements/sections/element.html");
        let lastType2Render = ""
        let numberLastTypeRendered = 0
        for (const i in config.data.items) {
            const elementData = config.data.items[i];
            if (elementData.type != lastType2Render) numberLastTypeRendered = 1;
            else numberLastTypeRendered += 1;
            lastType2Render = elementData.type;
            const element = new DOMParser().parseFromString(render(elementItem, {id: elementData.id, image: elementData.image, name: elementData.name, price: elementData.price, description: elementData.description, allergens: elementData.allergens, displaySpan: (elementData.image == "" ? "block":"none"), displayImage: (elementData.image == "" ? "none":"block")}).toString(), "text/html")!.documentElement!.outerHTML.toString();
            composition.documentElement!.getElementById(elementData.type + "Container")!.innerHTML += new DOMParser().parseFromString(((elementData.type == lastType2Render && numberLastTypeRendered != 1) ? "<hr style='position: relative; margin-top: -12px; bottom: 2px;'>":"").toString(), "text/html")!.documentElement!.outerHTML.toString() + element;
        }

        // For each piece of information add it to a box in the footer
        const footerInfoElement = await Deno.readTextFile("./public/elements/footer/footerInfoElement.html");
        for (const i in config.data.extraInfo) {
            const footerInfo = new DOMParser().parseFromString(render(footerInfoElement, {text: config.data.extraInfo[i].text}), "text/html")!.documentElement!.outerHTML.toString();
            composition.documentElement!.getElementById("extraInfoContainer")!.innerHTML += footerInfo;
        }
    }

    static async contruct() {
        const main = render(await Deno.readTextFile("./public/elements/index.html"), {title: config.data.title,navTitle1st: config.data.navTitle[0], navTitle2nd: config.data.navTitle[1], extraInfoVisibility: (config.data.extraInfo.length == 0 ? "none":"block"), nameFooter: config.data.name, legalNotice: config.data.legalNotice});
        const foundation = await Deno.readTextFile("./public/elements/foundation.html");
        const scripts = await Deno.readTextFile("./public/elements/scripts.html");

        // deno-lint-ignore prefer-const
        let composition = new DOMParser().parseFromString(main, "text/html")!;

        composition.documentElement!.getElementById("foundation")!.innerHTML += new DOMParser().parseFromString(foundation.toString(), "text/html")!.documentElement!.outerHTML.toString();
        composition.documentElement!.getElementById("foundation")!.innerHTML += new DOMParser().parseFromString(scripts.toString(), "text/html")!.documentElement!.outerHTML.toString();

        await composeMain.renderDynamicElements(composition);

        return composition.documentElement!.outerHTML;
        
    }

}