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
import { compose } from "./composer.ts"

async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);

  if (pathname.startsWith("/")){
    return new Response((await compose.contruct()).toString(), {headers: {"content-type": "text/html",},});
  } else if (pathname.startsWith("/assets/styles/foundation.css")) {
    const file = await Deno.readTextFile("./public/assets/styles/foundation.css");
    return new Response(file, {headers: {"content-type": "text/css",},});
  }
  return new Response("404 Error 😅", {headers: {"content-type": "text/html",},});
}

console.log("Listening on port 8000");
serve(handleRequest);