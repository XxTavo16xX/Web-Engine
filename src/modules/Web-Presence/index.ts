
// * Dependencies Required

import Web_Design_Nodes from "web-design-nodes";

// * Database Operations Required

import Domains_Database from "@modules/Database/Domains";

// * Module Required

import Logger from "@modules/Logger";

// * Model Required

import Website from "@modules/Database/models/Website";

// * Module Exported

class Web_Presence {

    private static instance: Web_Presence | null = null;

    public static get_Instance(): Web_Presence {

        if (Web_Presence.instance === null) {

            Web_Presence.instance = new Web_Presence();

        }

        return Web_Presence.instance;

    }

    private web_Presence_Connection = Web_Design_Nodes.Web_Presence.connect({ project_id: process.env.WP_Project_ID as string, project_token: process.env.WP_Project_Token as string });


    public async sync_Domains(): Promise<void> {

        // * Loading Domains from Web Presence

        Logger.log({ channel: "Web-Presence", message: "Loading Domains from Web Presence" });

        const websites_at_web_presence = await this.web_Presence_Connection.Database.find_Many_Documents("news_domains", {}, { name: 1, domain: 1, sitemap_url: 1, categorie: 1, last_modification: 1 }, {}, 100) as { acknowledged: boolean; results: { name: string, domain: string, sitemap_url: string, categorie: string, last_modification: number }[]; };

        // * Comparing Status in local database

        Logger.log({ channel: "Web-Presence", message: "Comparing Status in local database" });

        const websites_names = websites_at_web_presence.results.map(website => website.domain);

        const website_status = await Domains_Database.get_Websites_Status(websites_names);

        // * Processing Local Database Status

        Logger.log({ channel: "Web-Presence", message: "Procesing Local Database Status" });

        for (const website of websites_at_web_presence.results) {

            const website_db_status = website_status.find((website_status) => website_status.website_domain === website.domain)

            if (website_db_status === undefined || website_db_status?.status === null) {

                Logger.log({ channel: "Web-Presence", message: `Syncronizing ${website.domain} Website Domain Status` });

                const website_instance = new Website(website.domain, website.sitemap_url, website.categorie, website.last_modification);

                const operation_Result = await Domains_Database.save_Website_Status(website_instance);

                if (operation_Result.saved) {

                    Logger.log({ channel: "Web-Presence", message: `${website.domain} Website Domain Status Syncronized Succesfully` });

                } else {

                    Logger.log({ channel: "Web-Presence", message: `Error while trying to syncronize ${website.domain} Website Domain Status` });

                }

            } else if (website_db_status.status.last_modification !== website.last_modification) {

                Logger.log({ channel: "Web-Presence", message: `Updating ${website.domain} Website Domain Status` });

                const update_Result = await Domains_Database.update_Website_Status(website.domain, website.sitemap_url, website.last_modification);

                if (update_Result.updated === true) {

                    Logger.log({ channel: "Web-Presence", message: `${website.domain} Website Domain Status Updated Succesfully` });
                    
                } else {
                    
                    Logger.log({ channel: "Web-Presence", message: `Error while trying to update ${website.domain} Website Domain Status` });
                    
                }
                
                
            } else {
                
                Logger.log({ channel: "Web-Presence", message: `${website.domain} Website Domain Status Syncronized` });

            }

        }

        return;
        
    }

}

export default Web_Presence