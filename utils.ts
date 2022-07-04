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

import { bold, red, cyan, yellow } from "https://deno.land/std@0.139.0/fmt/colors.ts";
import { parse } from "https://deno.land/x/tinyargs@v0.1.4/mod.ts"
import { config } from "./config.ts"
import { composer } from "./composer.ts";

const mainRenderer = new composer.main;

export class renderer {
    static showRenderTime = false;
    static renderInformer = (pageRendered: string, initialTime: number) => console.log(yellow(bold("(Renderer)")), `Rendered '${pageRendered}'. Elapsed time: ${((Date.now()) - initialTime)}ms`);

    static main = class {
        static clearMasterPool = () => mainRenderer.clearMasterPool();

        static async render() {
            const renderStartTime = Date.now();
            const render = (await mainRenderer.compose()).toString();
            if (renderer.showRenderTime) renderer.renderInformer("Main", renderStartTime);
            return (render);
        }
    }

    static async manage() {
        const renderStartTime = Date.now();
        const render = (await composer.manage()).toString();
        if (renderer.showRenderTime) renderer.renderInformer("Manage", renderStartTime);
        return (render);
    }

    static async setup() {
        const renderStartTime = Date.now();
        const render = (await composer.setup()).toString();
        if (renderer.showRenderTime) renderer.renderInformer("Setup", renderStartTime);
        return (render);
    }
}

export class cli {
    static showHelp = () => { console.log(bold("Usage:"), `\n${cyan(" --help (-h)")}: Show this message (If this is passed, any other argument passed won't take effect!)`, `\n${cyan(" --hostname")}: Set the hostname (Will be saved)`, `\n${cyan(" --port")}: Set the port to listen (Will be saved)`, `\n${cyan(" --publicAPI")}: ${((config.getData("publicAPI") as boolean) ? "Disable" : "Activate")} public API (Will be saved)`, `\n${cyan(" --renderTime")}: Show the amount of time elapsed rendering`, `\n${cyan(" --debug")}: Activate debug messages :o`); Deno.exit(0); }

    static updateHostname = async (hostname: string) => { await config.updateConfig(["hostname", (hostname as string)]); }
    static updatePort = async (port: number) => { await config.updateConfig(["port", (port as number)]); }
    static togglePublicAPIAccess = async () => { await config.updateConfig(["publicAPI", ((config.getData("publicAPI") as boolean) ? false : true)]); }

    static args2Parse: { name: string, flags: string[], type: BooleanConstructor | StringConstructor | NumberConstructor, stop: boolean }[] = [{ name: "help", flags: ["h"], type: Boolean, stop: true }, { name: "hostname", flags: [], type: String, stop: false }, { name: "port", flags: [], type: Number, stop: false }, { name: "publicAPI", flags: [], type: Boolean, stop: false }, { name: "renderTime", flags: [], type: Boolean, stop: false }, { name: "debug", flags: [], type: Boolean, stop: false }];

    static async parse() {
        const parsedArgs = parse(Deno.args, cli.args2Parse)
        if (parsedArgs.help) cli.showHelp();
        if (parsedArgs.hostname != undefined) await cli.updateHostname(parsedArgs.hostname);
        if (parsedArgs.port != undefined) await cli.updatePort(parsedArgs.port);
        if (parsedArgs.publicAPI) await cli.togglePublicAPIAccess();
        if (parsedArgs.renderTime) renderer.showRenderTime = true;
    }

    static preParse() {
        let parsedArgs;
        try { parsedArgs = parse(Deno.args, cli.args2Parse) }
        catch { console.log(red("Invalid argument passed!")); Deno.exit(1); }
        if (parsedArgs.debug) debug.status = true;
    }
}

export class debug {
    static status = false;

    static tell = (text: string) => { if (debug.status) console.log(yellow(bold("(Debug)")), text) }
}

export class special {
    static formatNavbar(navbarText: string) {
        let buff1 = "", buff2 = "";
        for (let i = 0, encountered = false; i < navbarText.length; i++) {
            const char = navbarText.charAt(i);
            if (char == " ") { if (!encountered) { encountered = true; continue } }
            if (!encountered) buff1 += char;
            else buff2 += char;
        }
        return [buff1, buff2]
    }
}
