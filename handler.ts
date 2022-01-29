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

import { bold, red, yellow } from "https://deno.land/std@0.118.0/fmt/colors.ts";
import { Application, Router, RouterContext } from "https://deno.land/x/oak/mod.ts";
import { config } from "./config.ts"
import { secrets } from "./secrets.ts"
import { renderer, debug as debugHandler } from "./utils.ts"

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

                static async slashManageRoute(request: requestContext) {
                    handler.utils.requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
                    request.response.type = "text/html"
                    if (!config.getData("setup")) {
                        console.log(yellow(bold("(Setup)")), "Setup page was returned instead of the manager!")
                        request.response.body = await renderer.setup();
                    } else {
                        request.response.body = await renderer.manage();
                    }
                }
            }
    
            static postMethod = class {
                static async slashManageSecretRoute(request: requestContext) {
                    if (config.getData("setup")) {
                        handler.utils.requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
                        request.response.type = "application/json"
                        if (request.request.body().type == "json") {
                            try {
                                const value2Retrieve = "masterKey";
                                const dataParsed: {name:string, value:string}[] = await request.request.body().value;
                                for (const o in dataParsed) {
                                    if (dataParsed[o].name === value2Retrieve) {
                                        if (dataParsed[o].value === "") {
                                            console.log(yellow(bold("(Manage)")), `The data sent in the ${value2Retrieve} value wasn't valid!`);
                                            request.response.status = 500;
                                            request.response.body = {status: "failed"};
                                        }
                                        const tempKey: string | undefined = await secrets.tempKey.generate((dataParsed[o].value as string))
                                        if (tempKey != undefined) request.response.body = {status: "success", token: tempKey};
                                        else { request.response.status = 401; request.response.body = {status: "invalid"}; return; }
                                        console.log(yellow(bold("(Manage)")), "Session created successfully!");
                                        return
                                    }
                                }
                            // deno-lint-ignore no-empty
                            } catch {}
                        }
                        request.response.status = 500;
                        request.response.body = {status: "failed"};
                    }
                }

                static async slashSetupRoute(request: requestContext) {
                    if (!config.getData("setup")) {
                        handler.utils.requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
                        request.response.type = "application/json"
                        console.log(yellow(bold("(Setup)")), "Setup data submitted!");
                        if (request.request.body().type == "json") {
                            try {
                                const values2Retrieve = ["title", "name", "navTitle", "legalNotice"];
                                const dataParsed: {name:string, value:string}[] = await request.request.body().value;
                                for (const i in values2Retrieve) {
                                    for (const o in dataParsed) {
                                        if (dataParsed[o].name === values2Retrieve[i]) {
                                            if (dataParsed[o].value === "") {
                                                console.log(yellow(bold("(Setup)")), `The data sent in the ${values2Retrieve[i]} value wasn't valid!`);
                                                request.response.status = 500;
                                                request.response.body = {status: "failed"};
                                            }
                                            await config.updateConfig([values2Retrieve[i], (dataParsed[o].value ?? config.getData(values2Retrieve[i]))], false);
                                        }
                                    }
                                }
                                const identifier = await secrets.identifier.generate()
                                const masterKey = await secrets.masterKey.generate();
                                await config.updateConfig(["setup", true]);
                                request.response.body = {status: "success", id: identifier, masterKey: masterKey};
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

        static api = class {
            static v1 = class {
                static getMethod = class {
                    static slashRoute(request: requestContext) {
                        if (!config.getData("setup")) return
                        handler.utils.requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
                        request.response.type = "application/json"
                        request.response.body = {id: (config.getData("id") as string), name: (config.getData("name") as string), info: (config.getData("extraInfo") as string[]), notice: (config.getData("legalNotice") as string)};
                    }

                    static slashCategoriesRoute(request: requestContext) {
                        if (!config.getData("setup")) return
                        handler.utils.requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
                        request.response.type = "application/json"
                        request.response.body = {id: (config.getData("id") as string), categories: (config.getData("categories") as {tag: string, name: string}[])};
                    }

                    static slashItemsRoute(request: requestContext) {
                        if (!config.getData("setup")) return
                        handler.utils.requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
                        request.response.type = "application/json"
                        request.response.body = {id: (config.getData("id") as string), items: (config.getData("items") as {id: number, type: string, image: string, name: string, description: string, price: string, allergens: string}[])};
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
        this.routes.get("/", this.endpoints.internal.getMethod.slashRoute)
        // .get("/manage", this.endpoints.internal.getMethod.slashManageRoute)
        // .post("/manage/secret", this.endpoints.internal.postMethod.slashManageSecretRoute)
        .post("/setup", this.endpoints.internal.postMethod.slashSetupRoute);
        if (config.getData("publicAPI")) {
            {
                const apiV1 = "/api/v1";
                this.routes.get(apiV1, this.endpoints.api.v1.getMethod.slashRoute);
                this.routes.get(`${apiV1}/categories`, this.endpoints.api.v1.getMethod.slashCategoriesRoute);
                this.routes.get(`${apiV1}/items`, this.endpoints.api.v1.getMethod.slashItemsRoute);
            }
        }
    }

    public async listen() {
        try {
            await this.server.listen({hostname: (this.config[0] as string), port: (this.config[1] as number)})
        } catch (e) {
            debugHandler.tell(red(`Error caught on server routine (${e})`));
        }
    }
}
