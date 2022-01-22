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

import { customAlphabet } from "https://deno.land/x/nanoid/customAlphabet.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { config, idGenDict} from "./config.ts"

export class secrets {
    static masterKey = class {
        static async generate(save=true) {
            const masterKeyGen: string = (customAlphabet(idGenDict, 36))();
            if (save) await config.updateConfig({name: "masterKey", value: bcrypt.hashSync(masterKeyGen)});
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
                const tempKeyGen: string = (customAlphabet(idGenDict, 36))();
                if (save) {
                    await config.updateConfig({name: "tempKey", value: tempKeyGen});
                    await config.updateConfig({name: "sessionTime", value: (Math.floor(Date.now() / 1000))});
                }
                return tempKeyGen
            } else return
        }
    }
}