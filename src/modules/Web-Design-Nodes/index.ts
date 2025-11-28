
// * Dependencies Required

import { ObjectId } from "mongodb";

// * Modules Required

import Logger from "@modules/Logger";

// * Interfaces Required

import type { Sitemap_Entry } from "@modules/Sitemap_Parser/interfaces";

// * Model Required

import type { Post_Content } from "@modules/Database/models/Post_Content";
import type { Account_Content_Document } from "@modules/Database/models/Content";

// * Database Operations Required

import Accounts_Database from "@modules/Database/Account";
import Account_Content_Database from "@modules/Database/Account-Content";

// * Module Exported

class Web_Design_Nodes {

    public static create_Post(domain: string, entry: Sitemap_Entry, categorie: string): Promise<{ posted: boolean }> {

        Logger.log({ channel: "Web-Design-Nodes", message: `Creating Post to ${entry.url} content` });

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Domain Account Sesion Tokens

                Logger.log({ channel: "Web-Design-Nodes", message: `Loading ${domain} Session` });

                const account_session = await Accounts_Database.get_Account_Session_Tokens_By_Domain(domain);

                if (account_session.tokens === null) return resolve({ posted: false });

                Logger.log({ channel: "Web-Design-Nodes", message: `Creating Post content` });

                // * Creating Post Content

                const post_Content: Post_Content = {
                    labels: [{ id: "element-0", type: "h1", content: entry.title }, { id: "element-1", type: "text", content: entry.description }],
                    images: [{ id: "post-cover", url: entry.image }],
                    videos: [],
                    links: [{ id: "post-link", url: entry.url }],
                    structure: [
                        { element: "label", id: "element-0" },
                        { element: "label", id: "element-1" },
                        { element: "image", id: "post-cover" },
                        { element: "link", id: "post-link" }
                    ],
                    carousel: [],
                    topics: [`__${categorie}`]
                }

                Logger.log({ channel: "Web-Design-Nodes", message: `Sending Post content` });

                // * Creating Post Request

                fetch("https://api.webdesignnodes.com/apps/sn/new-post", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${account_session.tokens.token}` },
                    body: JSON.stringify({ post_Content, post_Posted_At: entry.lastmod })
                }).then(async (fetch_response) => {

                    const response = await fetch_response.json() as { posted: boolean };

                    Logger.log({ channel: "Web-Design-Nodes", message: response.posted === true ? `Post Content Received` : `Post Content Not Received` });

                    if (response.posted === true) {

                        const account_content: Account_Content_Document = {
                            _id: new ObjectId(),
                            url: entry.url
                        }

                        Logger.log({ channel: "Web-Design-Nodes", message: `Updating Post Content status in Account Content Database` });

                        const save_account_content = await Account_Content_Database.save_Account_Content_Status(domain, account_content);

                        return resolve({ posted: response.posted && save_account_content.saved });

                    } else {

                        console.log(response);
                        return resolve({ posted: false });;

                    }

                })

            } catch (error) {

                reject(error);

            }

        })

    }

}

export default Web_Design_Nodes