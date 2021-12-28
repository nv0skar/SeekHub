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

import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import * as config from "./config.ts"
import { compose } from "./composer.ts"

async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);

  if ((pathname.toString()) == "/") {
    if (!config.setup) {return new Response("Setup", {headers: {"content-type": "text/html"}});
    } else {return new Response((await compose.contruct()).toString(), {headers: {"content-type": "text/html"}});}
  } else {return new Response("404 Error 😅", {headers: {"content-type": "text/html",},});}
}

async function main() {
  console.log("Loading configs from file...");
  const statusConfig:boolean = await config.updateConfig();
  if (!statusConfig) {console.log("There was an error while trying to load configs... Now exiting!"); return(0);}
  console.log("Listening on port 8000...");
  await serve(handleRequest);
}

main();