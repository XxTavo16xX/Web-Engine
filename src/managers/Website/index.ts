
// * Dependencies Required

import type { WithId } from "mongodb";

// * Module Required

import Logger from "@modules/Logger";

// * Database Operations Required

import Domains_Database from "@modules/Database/Domains";
import Accounts_Database from "@modules/Database/Account";

// * Models Required

import type { Website_Document } from "@modules/Database/models/Website";

// * Modules Required

import Sitemap_Parser from "@modules/Sitemap_Parser";
import Web_Design_Nodes from "@modules/Web-Design-Nodes";

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
    private active_websites: WithId<Website_Document>[] = [];

    private load_Websites(): Promise<void> {

        Logger.log({ channel: "Website-Manager", message: "Loading Websites Status" });

        return new Promise(async (resolve, reject) => {

            try {

                this.websites = await Domains_Database.get_Website_Status();

                Logger.log({ channel: "Website-Manager", message: `${this.websites.length} Websites Found` });

                this.active_websites = [];

                const all_domains = this.websites.map(w => w.domain);

                const found_account_domains = await Accounts_Database.get_Account_Sesson_Status_By_Domain(all_domains);

                this.active_websites = this.websites.filter(website =>
                    found_account_domains.includes(website.domain)
                );

                Logger.log({ channel: "Website-Manager", message: `${this.active_websites.length} will be processed out of ${this.websites.length}` });

                for (const website of this.active_websites) {

                    await this.process_Website(website);

                }

            } catch (error) {

                reject(error);

            }

        })

    }

    private process_Website(website: Website_Document): Promise<void> {

        Logger.log({ channel: "Website-Manager", message: `\n\nProcessing ${website.domain}:${website.sitemap_url}` });

        return new Promise(async (resolve, reject) => {

            try {

                const website_Sitemap = new Sitemap_Parser(website.domain, website.sitemap_url);
                const sitemap_Entries = await website_Sitemap.get_Sitemap_Entries();

                for (const sitemap_entry of sitemap_Entries) {

                    await Web_Design_Nodes.create_Post(website.domain, sitemap_entry, website.categorie);

                }

                return resolve();

            } catch (error) {

                reject(error);

            }

        })

    }

}

export default Website_Manager