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

import { bold, green, white } from "https://deno.land/std@0.139.0/fmt/colors.ts";
import { config } from "./config.ts"
import { handler } from "./handler.ts"
import { cli } from "./utils.ts"

async function main() {
  cli.preParse() // Preparse args
  await config.fetchConfig(); // Fetch configs from file
  console.log(white(bold("--- SeekHub ---")));
  await cli.parse() // Parse args
  console.log(green(bold(`Listening on: ${config.getData("hostname")}:${config.getData("port")}!`)));
  await (new handler((config.getData("hostname") as string), (config.getData("port") as number))).listen()
}

main(); // Let's go!
