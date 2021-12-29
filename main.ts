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

import {bold, cyan, green, yellow, white} from "https://deno.land/std@0.118.0/fmt/colors.ts";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as config from "./config.ts"
import { renderBase } from "./renderBase.ts"

const requestInformer = (origin:string, userAgent: string | null, route: string | null) => console.log(yellow(bold("(Server)")), `Request from '${origin ?? "Unknown"}' with user-agent '${(userAgent ?? "Unknown")}' to '${(route ?? "Unknown")}'`);

const requestsHandler = new Router()
  .get("/", async (request) => {
    requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname);
    request.response.type = "text/html"
    if (!config.data.setup) {
      console.log(yellow(bold("(Setup)")), "Setup page was returned instead of the main page!")
      request.response.body = await renderBase.setup();
    } else {
      request.response.body = await renderBase.rootPath();
    }
  })
  .post("/", (request) => {
    requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname);
    request.response.type = "text/json"
    if (!config.data.setup) {
      console.log(yellow(bold("(Setup)")), "Setup data received!");
      // config.updateConfig("setup", true);
      // request.response.body = {status: "success"};
    }
  })

async function main() {
  console.log(white(bold("--- SeekHub ---")));
  console.log(cyan("Loading configs from file..."));
  await config.fetchConfig();
  console.log(green(bold(`Listening on: ${config.server.hostname}:${config.server.port}!`)));
  const appServer = new Application()
    .use(requestsHandler.routes())
  await appServer.listen({hostname: config.server.hostname, port: config.server.port})
}

main();