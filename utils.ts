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

import { bold, red, cyan, yellow } from "https://deno.land/std@0.118.0/fmt/colors.ts";
import { parse } from "https://deno.land/x/tinyargs/mod.ts"
import { config } from "./config.ts"
import { composer } from "./composer.ts";

const mainRenderer = new composer.main;

export class renderer {
    static showRenderTime = false;
    static renderInformer = (pageRendered:string, initialTime:number) => console.log(yellow(bold("(Renderer)")), `Rendered '${pageRendered}'. Elapsed time: ${((Date.now())-initialTime)}ms`);

    static main = class {
        static clearMasterPool = () => mainRenderer.clearMasterPool();

        static async render() {
            const renderStartTime = Date.now();
            const render = (await mainRenderer.compose()).toString();
            if (renderer.showRenderTime) renderer.renderInformer("Main", renderStartTime);
            return (render);
        }
    }

    static async setup() {
        const renderStartTime = Date.now();
        const render = (await composer.setup()).toString();
        if (renderer.showRenderTime) renderer.renderInformer("Setup", renderStartTime);
        return (render);
    }
}

export class cli {
    static showHelp = () => { console.log(bold("Usage:"), `\n${cyan(" --help (-h)")}: Show this message (If this is passed, any other argument passed won't take effect!)`, `\n${cyan(" --hostname")}: Set the hostname (This will replace the default hostname)`, `\n${cyan(" --port")}: Set the port to listen (This will replace the default port)`, `\n${cyan(" --renderTime")}: Show the amount of time elapsed rendering`); Deno.exit(0); }

    static async updateHostname(hostname:string) { await config.updateConfig({name: "hostname", value: (hostname as string)}); }
    static async updatePort(port:number) { await config.updateConfig({name: "port", value: (port as number)}); }

    static async parse() {
        let parsedArgs;
        try { parsedArgs = parse(Deno.args, [{name: "help", flags: ["h"], type: Boolean, stop: true}, {name: "hostname", flags: [], type: String, stop: false}, {name: "port", flags: [], type: Number, stop: false}, {name: "renderTime", flags: [], type: Boolean, stop: false}]); }
        catch { console.log(red("Invalid argument passed!")); Deno.exit(1); }
        if (parsedArgs.help) cli.showHelp();
        if (parsedArgs.hostname != undefined) await cli.updateHostname(parsedArgs.hostname);
        if (parsedArgs.port != undefined) await cli.updatePort(parsedArgs.port);
        if (parsedArgs.renderTime != undefined) renderer.showRenderTime = true;
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