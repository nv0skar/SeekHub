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

const requestInformer = (origin:string, userAgent: string | null, route: string | null, method:string) => console.log(yellow(bold("(Server)")), `Request from '${origin ?? "Unknown"}' with user-agent '${(userAgent ?? "Unknown")}' to '${(route ?? "Unknown")}' with method '${method}'`);

const requestsHandler = new Router()
  .get("/", async (request) => {
    requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
    request.response.type = "text/html"
    if (!config.data.setup) {
      console.log(yellow(bold("(Setup)")), "Setup page was returned instead of the main page!")
      request.response.body = await renderBase.setup();
    } else {
      request.response.body = await renderBase.rootPath();
    }
  })
  .post("/", async (request) => {
    requestInformer(request.request.ip, request.request.headers.get("user-agent"), request.request.url.pathname, request.request.method);
    request.response.type = "application/json"
    if (!config.data.setup) {
      console.log(yellow(bold("(Setup)")), "Setup data submitted!");
      if (request.request.body().type == "json") {
        try {
          const dataParsed = await request.request.body().value;
          for (const i in config.configKeys.slice(1)) {
            if (dataParsed[config.configKeys.slice(1)[i]] == undefined) continue;
            // @ts-ignore: The configKeys values are the same as the keys in configStructure so it shouldn't be a problem use configKeys as an index key
            await config.updateConfig(config.configKeys.slice(1)[i], (dataParsed[config.configKeys.slice(1)[i]] ?? config.data[config.configKeys.slice(1)]), false);
          }
          await config.updateConfig("setup", true);
          request.response.body = {status: "success"};
          console.log(yellow(bold("(Setup)")), "Setup finished successfully!");
          return
        // deno-lint-ignore no-empty
        } catch {}
      }
      console.log(yellow(bold("(Setup)")), "The data sent in the setup wasn't valid!");
      request.response.status = 500;
      request.response.body = {status: "failed"};
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