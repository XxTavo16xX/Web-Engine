
// * Module Required

import Logger from "@modules/Logger";

// * Database Operations Required

import Domains_Database from "@modules/Database/Domains";

// * Models Required

import type { Website_Document } from "@modules/Database/models/Website";
import type { WithId } from "mongodb";

// * Manager Exported

class Website_Manager {

    private static instance: Website_Manager | null = null;

    public static get_Instance() {

        if (Website_Manager.instance === null) Website_Manager.instance = new Website_Manager();

        return Website_Manager.instance;

    }

    public async start_Processing() {

        Logger.log({ channel: "Website-Manager", message: "Starting Website Manager Processing" });

        await this.load_Websites()

    }

    private websites: WithId<Website_Document>[] = [];

    private load_Websites(): Promise<void> {

        Logger.log({ channel: "Website-Manager", message: "Loading Websites Status" });

        return new Promise(async (resolve, reject) => {

            try {

                this.websites = await Domains_Database.get_Website_Status();

                for (const website of this.websites) {

                    await this.process_Website(website);

                }

            } catch (error) {

                reject(error);

            }

        })

    }

    private process_Website(website: Website_Document): Promise<void> {

        Logger.log({ channel: "Website-Manager", message: `Processing ${website.domain}` });

        return new Promise(async (resolve, reject) => {

            try {

                

            } catch (error) {

            }

        })

    }

}

export default Website_Manager