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

import { customAlphabet as generateID } from "https://deno.land/x/nanoid/customAlphabet.ts";
import { encode, decode } from "https://deno.land/std/encoding/base64.ts"
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { config } from "./config.ts"

const maxSessionTime = 28800;
const idGenAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const idKeyGenAlphabet = ((idGenAlphabet + "-_+=@!") as string);

export class secrets {
    static identifier = class {
        static async generate(save = true) {
            const identifier: string = (generateID(idGenAlphabet, 32))();
            if (save) await config.updateConfig(["id", identifier]);
            return identifier
        }
    }

    static masterKey = class {
        static async generate(save = true) {
            const masterKeyGen: string = (generateID(idKeyGenAlphabet, 36))();
            if (save) await config.updateConfig(["masterKey", (encode((bcrypt.hashSync(masterKeyGen)) as string))]);
            return masterKeyGen
        }
    }

    static tempKey = class {
        static match(tempKey: string) {
            if (((config.getData("tempKey", true) as string | null) != null) && (tempKey != "")) {
                if ((tempKey as string) === ((new TextDecoder().decode(decode(config.getData("tempKey") as string))) as string)) {
                    if ((Math.floor(Date.now() / 1000) - ((config.getData("sessionTime") as number)) < (maxSessionTime as number))) {
                        return true
                    } else secrets.tempKey.endSession();
                }
            } return false;
        }

        static async generate(masterKey: string, save = true, force2Generate = false) {
            if (((config.getData("masterKey") as string | null) != null) && (masterKey != "")) {
                const keyMatches = await bcrypt.compare((masterKey as string), ((new TextDecoder().decode(decode(config.getData("masterKey") as string))) as string));
                if (keyMatches) {
                    if (((config.getData("tempKey", true)) != "") && ((config.getData("tempKey", true)) != null) && ((config.getData("sessionTime", true)) != null) && (!force2Generate)) {
                        if ((Math.floor(Date.now() / 1000) - ((config.getData("sessionTime") as number)) < (maxSessionTime as number))) return ((new TextDecoder().decode(decode(config.getData("tempKey") as string))) as string)
                    }
                    const tempKeyGen: string = (generateID(idKeyGenAlphabet, 36))();
                    if (save) {
                        await config.updateConfig(["tempKey", (encode(tempKeyGen) as string)]);
                        await config.updateConfig(["sessionTime", (Math.floor(Date.now() / 1000))]);
                    } return tempKeyGen;
                }
            } return;
        }

        static endSession = async () => { await config.updateConfig(["tempKey", null]); await config.updateConfig(["sessionTime", null]); }
    }
}
