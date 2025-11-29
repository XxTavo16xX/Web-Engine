// * Dependencies Required

import { existsSync, mkdirSync, appendFileSync } from "fs";
import { join } from "path";

// * Interfaces required

import { type Logger_Message } from "@modules/Logger/interfaces";

// * Module Exported

class Logger {

    public static log(message: Logger_Message) {

        console.log(`[${Date.now()}]:[${message.channel}]: ${message.message}`);
        this.save_Locally(message);

    }

    public static error(message: Logger_Message) {

        console.log(`[${Date.now()}]:[${message.channel}]: ${message.message}`);
        this.save_Locally(message);

    }

    private static save_Locally(message: Logger_Message) {

        try {


            const logs_Dir = join(process.cwd(), "logs");

            // * Directory Validation

            if (!existsSync(logs_Dir)) {

                mkdirSync(logs_Dir, { recursive: true });

            }

            // * File Name Construction

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");

            const file_Name = `${year}-${month}-${day}.log`;

            // * File Path

            const file_Path = join(logs_Dir, file_Name);

            // * Message Formating

            const time = now.toISOString();
            const log_Entry = `[${time}] [${message.channel}]: ${message.message}\n`;

            // * Saving Log

            appendFileSync(file_Path, log_Entry, { encoding: "utf8" });

        } catch (error) {

            console.error("Logger Error:", error);

        }

    }

}

export default Logger