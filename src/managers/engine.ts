
// * Modules Required

import Logger from "@modules/Logger";
import Database from "@modules/Database";

// * Manager Exported

class Engine_Manager {

    private static instance: Engine_Manager | null = null;

    public static init() {

        if (Engine_Manager.instance !== null) throw Error("Engine Manager already initialized");

        Engine_Manager.instance = new Engine_Manager();


    }

    constructor() {

        Logger.log({ channel: "Engine-Manager", message: "Starting Engine" });

        // * Getting Database Status

        Database.Test_Connection();

        // * Shutdown Handler

        this.configure_Shutdown();

    }

    private configure_Shutdown() {

        process.on("SIGINT", () => {

            Logger.log({ channel: "Engine-Manager", message: "Engine Stoped (SIGINT)" });
            process.exit(0);

        });

        process.on("exit", (code) => {

            Logger.log({ channel: "Engine-Manager", message: `Exit code: ${code}\n\n\n` });

        });

        process.on("uncaughtException", (err) => {
            
            Logger.error({ channel: "Engine-Manager", message: `Uncaught Exception: ${err.message}` });
            process.exit(1);

        });

        process.on("unhandledRejection", (reason: any) => {
            
            Logger.error({ channel: "Engine-Manager", message: `Unhandled Rejection: ${reason}`});

        });
    }

}

export default Engine_Manager