
// * Dependencies Required

import type { WithId } from "mongodb";

// * Module Required

import Database from ".";

// * Models Required

import { type Account_Document } from "./models/Account";

// * Database Operation Exported

class Accounts_Database {

    public static get_Account_Sesson_Status_By_Domain(domains: string[]): Promise<string[]> {

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Database Connection

                const db_connection = await Database.get_Instance();

                // * Connecting to Collection

                const accounts_collection = await db_connection.getCollection<Account_Document>(process.env.DB_Name as string, process.env.Accounts_Collection as string);

                // * Operation Result Processing

                const search_Result = await accounts_collection.find({ domain: { $in: domains } }, { projection: { _id: 1, domain: 1 } }).toArray();

                // * Returning Operation Result

                return resolve(search_Result.map((acc) => acc.domain));

            } catch (error) {

                reject(error);

            }

        })

    }

    public static get_Account_Session_Tokens_By_Domain(domain: string): Promise<{ tokens: { token: string, r_token: string } | null }> {

        return new Promise(async (resolve, reject) => {

            try {

                // * Getting Database Connection

                const db_connection = await Database.get_Instance();

                // * Connecting to Collection

                const accounts_collection = await db_connection.getCollection<Account_Document>(process.env.DB_Name as string, process.env.Accounts_Collection as string);

                // * Operation Result Processing

                const search_Result = await accounts_collection.findOne({ domain: domain }, { projection: { token: 1, r_token: 1 } });
                
                // * Returning Operation Result

                return resolve({ tokens: search_Result === null ? null : { token: search_Result.token, r_token: search_Result.r_token } });

            } catch (error) {

                reject(error);

            }

        })

    }

}

export default Accounts_Database