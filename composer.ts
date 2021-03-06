// SeekHub
// Copyright (C) 2022 Oscar
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

import { dirname, fromFileUrl } from "https://deno.land/std@0.122.0/path/mod.ts";
import { render } from "https://deno.land/x/mustache_ts@v0.4.1.1/mustache.ts";
import { DOMParser, Document } from "https://deno.land/x/deno_dom@v0.1.20-alpha/deno-dom-wasm.ts";
import { config, categoryStructure, itemStructure } from "./config.ts"

export class composer {
    static setup = async function () {
        const composition = await Deno.readTextFile(fromFileUrl(`${dirname(Deno.mainModule)}/pages/setup.html`));

        return composition;
    }

    static manage = async function () {
        const composition = render((await Deno.readTextFile(fromFileUrl(`${dirname(Deno.mainModule)}/pages/manage.html`))), { id: (config.getData("id") as string) });

        return composition;
    }

    static main = class {
        private masterPool: string | undefined = undefined;
        private navbarItem = `<a class="navbar-item resize" href="#{{id}}"><span style="vertical-align: super;">{{name}}</span></a>`;
        private superContainer = `<div class="columns" id="columnGroup{{num}}"></div>`;
        private sectionContainer = `<div class="column"><section style="scroll-margin-top: 102px;" id="{{id}}"><h2 class="subtitle" style="font-family: Arial, Helvetica, sans-serif; font-display: swap; font-size: 28px; font-weight: 900;">{{name}}</h2><hr><div id="{{id}}Container"></div></section></div><br>`;
        private elementItem = `<div class="productContainer"><div class="imageContainer"><span id="imagePlaceholderProduct{{id}}" class="material-icons placeholder" style="display: {{displaySpan}}">photo_camera</span><img class="productImage" src="{{image}}" style="display: {{displayImage}}" onerror="this.onerror=null; this.src=''; this.style.display='none'; switchVisibility2Placeholder({{id}});"></div><div class="infoContainer"><div style="display: block;"><span class="productName">{{name}}</span>&nbsp;<span class="productPrice">{{price}}</span></div><span class="productDescription">{{description}}</span><br><span class="productAllergens">{{allergens}}</span></div></div>`;
        private footerInfoElement = `<li><span>{{text}}</span></li>`;

        private renderDynamicComponents(composition: Document) {
            // For each pair of categories add a section
            const numberOfSectionGroups = Math.round((config.getData("categories") as categoryStructure[]).length / 2);
            for (let i = 0; numberOfSectionGroups > i; i++) {
                const sectionGroupsElement = new DOMParser().parseFromString(render((this.superContainer), { num: i }).toString(), "text/html")!.documentElement!.outerHTML.toString();
                composition.documentElement!.getElementById("mainSection")!.innerHTML += sectionGroupsElement;
            }

            // For each category add a new section to the page
            let actualGroup = 0
            let repetitionsOfGroup = 0
            for (const i in (config.getData("categories") as categoryStructure[])) {
                const elementData = (config.getData("categories") as categoryStructure[])[i];
                const navbarElement = new DOMParser().parseFromString(render((this.navbarItem), { id: elementData.tag, name: elementData.name }).toString(), "text/html")!.documentElement!.outerHTML.toString();
                const sectionElement = new DOMParser().parseFromString(render((this.sectionContainer), { id: elementData.tag, name: elementData.name }).toString(), "text/html")!.documentElement!.outerHTML.toString();
                composition.documentElement!.getElementById("navbarSection")!.innerHTML += navbarElement;
                composition.documentElement!.getElementById("columnGroup" + actualGroup.toString())!.innerHTML += sectionElement;
                if (repetitionsOfGroup == 1) { repetitionsOfGroup = 0; actualGroup += 1 }
                else repetitionsOfGroup += 1
            }

            // For each element in menu add a new element to the page
            let lastType2Render = ""
            let numberLastTypeRendered = 0
            for (const i in (config.getData("items") as itemStructure[])) {
                const elementData = (config.getData("items") as itemStructure[])[i];
                let tagInCategories = false
                for (const i in config.getData("categories") as categoryStructure[]) {
                    if (elementData.type === (config.getData("categories") as categoryStructure[])[i].tag) {
                        tagInCategories = true
                    }
                }
                if (!tagInCategories) continue;
                if (elementData.type != lastType2Render) numberLastTypeRendered = 1;
                else numberLastTypeRendered += 1;
                lastType2Render = elementData.type;
                const element = new DOMParser().parseFromString(render((this.elementItem), { id: elementData.id, image: elementData.image, name: elementData.name, price: elementData.price, description: elementData.description, allergens: elementData.allergens, displaySpan: (elementData.image == "" ? "block" : "none"), displayImage: (elementData.image == "" ? "none" : "block") }).toString(), "text/html")!.documentElement!.outerHTML.toString();
                composition.documentElement!.getElementById(elementData.type + "Container")!.innerHTML += new DOMParser().parseFromString(((elementData.type == lastType2Render && numberLastTypeRendered != 1) ? "<hr style='position: relative; margin-top: -12px; bottom: 2px;'>" : "").toString(), "text/html")!.documentElement!.outerHTML.toString() + element;
            }

            // For each piece of information add it to a box in the footer
            for (const i in (config.getData("extraInfo") as string[])) {
                const footerInfo = new DOMParser().parseFromString(render((this.footerInfoElement), { text: (config.getData("extraInfo") as string[])[i] }), "text/html")!.documentElement!.outerHTML.toString();
                composition.documentElement!.getElementById("extraInfoContainer")!.innerHTML += footerInfo;
            }
        }

        clearMasterPool() {
            this.masterPool = undefined;
        }

        async compose() {
            if (this.masterPool != undefined) return (this.masterPool);
            const main = render((await Deno.readTextFile(fromFileUrl(`${dirname(Deno.mainModule)}/pages/portfolio.html`))), { title: (config.getData("title") as string), navTitle1st: (config.getData("navTitle") as string[])[0], navTitle2nd: (config.getData("navTitle") as string[])[1], extraInfoVisibility: ((config.getData("extraInfo") as string[]).length == 0 ? "none" : "block"), nameFooter: (config.getData("name") as string), legalNotice: (config.getData("legalNotice") as string), id: (config.getData("id") as string) });
            
            // deno-lint-ignore prefer-const
            let composition = new DOMParser().parseFromString(main, "text/html")!;

            this.renderDynamicComponents(composition);

            const finalComposition = composition.documentElement!.outerHTML;

            this.masterPool = (finalComposition);
            return (finalComposition);

        }
    }
}
