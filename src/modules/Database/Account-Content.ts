
// * Dependencies Required

import type { WithId } from "mongodb";

// * Module Required

import Database from ".";

// * Models Required

import { type Account_Content_Document } from "./models/Content";

// * Database Operation Exported

class Account_Content_Database {

    public static get_Account_Content_Status_By_URL(domain: string, url: string): Promise<boolean> {

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Database Connection

                const db_connection = await Database.get_Instance();

                // * Connecting to Collection

                const accounts_collection = await db_connection.getCollection<Account_Content_Document>(`WE-${domain.replaceAll(".", "_")}-DB` as string, process.env.Account_Content_Collection as string);

                // * Operation Result Processing

                const search_Result = await accounts_collection.findOne({ url: url }, { projection: { _id: 1 } });

                // * Returning Operation Result

                return resolve(search_Result !== null);

            } catch (error) {

                reject(error);

            }

        })

    }

    public static save_Account_Content_Status(domain: string, content: Account_Content_Document): Promise<{ saved: boolean }> {

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Database Connection

                const db_connection = await Database.get_Instance();

                // * Connecting to Collection

                const accounts_collection = await db_connection.getCollection<Account_Content_Document>(`WE-${domain.replaceAll(".", "_")}-DB` as string, process.env.Account_Content_Collection as string);

                // * Operation Result Processing

                const insert_Result = await accounts_collection.insertOne(content);

                // * Returning Operation Result

                return resolve({ saved: insert_Result.acknowledged });

            } catch (error) {

                reject(error);

            }

        })

    }

}

export default Account_Content_Database