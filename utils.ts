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

import {bold, yellow} from "https://deno.land/std@0.118.0/fmt/colors.ts";
import { showRenderTime } from "./config.ts"
import { composer } from "./composer.ts";

const renderInformer = (pageRendered:string, initialTime:number) => console.log(yellow(bold("(Renderer)")), `Rendered '${pageRendered}'. Elapsed time: ${((Date.now())-initialTime)}ms`);

const mainRenderer = new composer.main;

export class renderer {
    static main = class {
        static clearMasterPool = () => mainRenderer.clearMasterPool();

        static async render() {
            const renderStartTime = Date.now();
            const render = (await mainRenderer.compose()).toString();
            if (showRenderTime) renderInformer("Main", renderStartTime);
            return (render);
        }
    }

    static async setup() {
        const renderStartTime = Date.now();
        const render = (await composer.setup()).toString();
        if (showRenderTime) renderInformer("Setup", renderStartTime);
        return (render);
    }
}

export class special {
    static formatNavbar(navbarText: string) {
        let buff1 = ""; let buff2 = "";
        for (let i = 0, encountered = false; i < navbarText.length; i++) {
            const char = navbarText.charAt(i);
            if (char == " ") { encountered = true; continue }
            if (!encountered) buff1 += char;
            else buff2 += char;
        }
        return [buff1, buff2]
    }
}