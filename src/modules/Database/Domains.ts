
// * Dependencies Required

import type { WithId } from "mongodb";

// * Module Required

import Database from "."

// * Models Required

import { type Website_Document } from "./models/Website";
import Website from "./models/Website";

// * Database Operation Exported

class Domains_Database {

    public static get_Websites_Status(website_domains: string[]): Promise<{ website_domain: string, status: { sitemap_url: string, last_modification: number } | null }[]> {

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Database Connection

                const db_connection = await Database.get_Instance();

                // * Connecting to Collection

                const domain_collection = await db_connection.getCollection<Website_Document>(process.env.DB_Name as string, process.env.Domains_Collection as string);

                // * Operation Result Processing

                const search_Result = await domain_collection.find({ domain: { $in: website_domains } }, { projection: { _id: 0, domain: 1, sitemap_url: 1, last_modification: 1 } }).toArray();

                // * Convert DB results in a map for fast access

                const foundMap = new Map<string, Website_Document>();

                for (const d of search_Result) {

                    foundMap.set(d.domain, d);

                }

                // * Build final output preserving original order

                const result = website_domains.map(website_domain => ({ website_domain, status: foundMap.has(website_domain) ? { sitemap_url: foundMap.get(website_domain)!.sitemap_url, last_modification: foundMap.get(website_domain)!.last_modification } : null }));

                // * Returning Operation Result

                return resolve(result);

            } catch (error) {

                reject(error);

            }

        })

    }

    public static save_Website_Status(website: Website): Promise<{ saved: boolean }> {

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Database Connection

                const db_connection = await Database.get_Instance();

                // * Connecting to Collection

                const domain_collection = await db_connection.getCollection<Website_Document>(process.env.DB_Name as string, process.env.Domains_Collection as string);

                // * Operation Processing

                const save_Result = await domain_collection.insertOne(website);

                // * Returning Operation Result

                return resolve({ saved: save_Result.acknowledged });

            } catch (error) {

                reject(error);

            }

        })

    }

    public static update_Website_Status(website_Domain: string, updated_Sitemap_URL: string, updated_Last_Modification: number): Promise<{ updated: boolean }> {

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Database Connection

                const db_connection = await Database.get_Instance();

                // * Connecting to Collection

                const domain_collection = await db_connection.getCollection<Website_Document>(process.env.DB_Name as string, process.env.Domains_Collection as string);

                // * Operation Processing

                const update_Result = await domain_collection.updateOne({ domain: website_Domain }, { $set: { sitemap_url: updated_Sitemap_URL, last_modification: updated_Last_Modification } });

                // * Returning Operation Result

                return resolve({ updated: update_Result.modifiedCount > 0 });

            } catch (error) {

                reject(error);

            }

        })

    }

    public static get_Website_Status(): Promise<{ websites: WithId<Website_Document>[] }> {

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Database Connection

                const db_connection = await Database.get_Instance();

                // * Connecting to Collection

                const domain_collection = await db_connection.getCollection<Website_Document>(process.env.DB_Name as string, process.env.Domains_Collection as string);

                // * Operation Processing

                const search_Results = await domain_collection.find().toArray();

                // * Returning Search Results

                return resolve({ websites: search_Results });

            } catch (error) {

                reject(error);

            }

        })

    }

}

export default Domains_Database