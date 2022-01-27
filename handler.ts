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

import { bold, yellow } from "https://deno.land/std@0.118.0/fmt/colors.ts";
import { Application, Router, RouterContext } from "https://deno.land/x/oak/mod.ts";
import { config, configStructure, setupKeys } from "./config.ts"
import { secrets } from "./secrets.ts"
import { renderer } from "./utils.ts"

// deno-lint-ignore no-explicit-any
type requestContext = RouterContext<any, any, any>;

export class handler {
    private server: Application;
    private routes: Router;
    private config: [string, number];

    static utils = class {
        static requestInformer = (origin:string, userAgent: string | null, route: string | null, method:string) => console.log(yellow(bold("(Server)")), `Request from '${origin ?? "Unknown"}' with user-agent '${(userAgent ?? "Unknown")}' to '${(route ?? "Unknown")}' with method '${method}'`);
    }

    private endpoints = class {
        static internal = class {
            static getMethod = class {
                static async slashRoute(request: requestContext) {
                    handler.utils.requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
                    request.response.type = "text/html"
                    if (!config.getData("setup")) {
                        console.log(yellow(bold("(Setup)")), "Setup page was returned instead of the main page!")
                        request.response.body = await renderer.setup();
                    } else {
                        request.response.body = await renderer.main.render();
                    }
                }
            }
    
            static postMethod = class {
                static async slashSetupRoute(request: requestContext) {
                    if (!config.getData("setup")) {
                        handler.utils.requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
                        request.response.type = "application/json"
                        console.log(yellow(bold("(Setup)")), "Setup data submitted!");
                        if (request.request.body().type == "json") {
                            try {
                                const dataParsed: configStructure[] = await request.request.body().value;
                                for (const i in setupKeys) {
                                    for (const o in dataParsed) {
                                        if (dataParsed[o].name === setupKeys[i]) {
                                            if (dataParsed[o].value === "") {
                                                console.log(yellow(bold("(Setup)")), `The data sent in the ${setupKeys[i]} value wasn't valid!`);
                                                request.response.status = 500;
                                                request.response.body = {status: "failed"};
                                            }
                                            await config.updateConfig({name: setupKeys[i], value: (dataParsed[o].value ?? config.getData(setupKeys[i]))}, false);
                                        }
                                    }
                                }
                                const masterKey = await secrets.masterKey.generate();
                                await config.updateConfig({name: "setup", value: true});
                                request.response.body = {status: "success", masterKey: masterKey};
                                console.log(yellow(bold("(Setup)")), "Setup finished successfully!");
                                return
                            // deno-lint-ignore no-empty
                            } catch {}
                        }
                        console.log(yellow(bold("(Setup)")), "The data sent in the setup wasn't valid!");
                        request.response.status = 500;
                        request.response.body = {status: "failed"};
                    }
                }
            }
        }
    }

    constructor(host:string, port:number) {
        this.routes = new Router();
        this.route2Route()
        this.server = new Application().use(this.routes.routes())
        this.config = [host, port];
    }

    private route2Route() {
        this.routes.get("/", this.endpoints.internal.getMethod.slashRoute);
        this.routes.post("/setup", this.endpoints.internal.postMethod.slashSetupRoute);
    }

    public async listen() {
        await this.server.listen({hostname: (this.config[0] as string), port: (this.config[1] as number)})
    }
}
