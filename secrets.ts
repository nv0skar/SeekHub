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
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { config } from "./config.ts"

const idGenAlphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
const idKeyGenAlphabet = ((idGenAlphabet + "-_+=@!") as string);

export class secrets {
    static identifier = class {
        static async generate(save=true) {
            const identifier: string = (generateID(idGenAlphabet, 32))();
            if (save) await config.updateConfig(["id", identifier]);
            return identifier
        }
    }

    static masterKey = class {
        static async generate(save=true) {
            const masterKeyGen: string = (generateID(idKeyGenAlphabet, 36))();
            if (save) await config.updateConfig(["masterKey", bcrypt.hashSync(masterKeyGen)]);
            return masterKeyGen
        }
    }
    
    static tempKey = class {
        static match(tempKey:string) {
            if (tempKey === (config.getData("tempKey"))) {
                return true
            } else return false
        }

        static async generate(masterKey:string, save=true) {
            const keyMatches = await bcrypt.compare(masterKey, (config.getData("masterKey") as string));
            if (keyMatches) {
                const tempKeyGen: string = (generateID(idKeyGenAlphabet, 36))();
                if (save) {
                    await config.updateConfig(["tempKey", tempKeyGen]);
                    await config.updateConfig(["sessionTime", (Math.floor(Date.now() / 1000))]);
                }
                return tempKeyGen
            } else return
        }
    }
}
