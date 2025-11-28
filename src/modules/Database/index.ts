
// * Dependencies Required

import { Db, MongoClient, Collection, type Document } from "mongodb";

// * Modules Required

import Logger from "@modules/Logger";

// * Class Exported

class Database {

    // * Instance

    private static Database_Network_Instance: Database;

    /**
     ** This function will try to connect to the network peers replica set without an user.
     ** Also will request the mongo database version installed.
     * @param network_peers 
     * @param replicasetName 
     * @returns Promise<{ connection_successful: boolean, mongodb_version: string }>
     */

    public static async Test_Connection(): Promise<{ connection_successful: boolean, mongodb_version: string }> {

        return new Promise(async (resolve, reject) => {

            try {

                const db_uri = process.env.DB_Replica_Enable === "true" ? `mongodb://${process.env.DB_URL}/?replicaSet=${process.env.DB_Replica}` : `mongodb://${process.env.DB_URL}`;

                const client = new MongoClient(db_uri);
                const client_connection = await client.connect();

                Logger.log({ channel: "Node-Database", message: `Test connection successful` });

                const database_connection = client_connection.db("admin");

                const { version } = await database_connection.command({ buildInfo: 1 });
                const { ok } = await database_connection.command({ ping: 1 });

                client.close().then(() => {

                    Logger.log({ channel: "Node-Database", message: `Test connection closed successfully` });
                    
                }).finally(() => {

                    return resolve({ connection_successful: Boolean(ok), mongodb_version: version });

                });                

            } catch (error) {

                reject(error);

            }

        })

    }

    /**
     ** This function will return the Database_Network instance.
     * @returns Promise<Database_Network>
     */

    public static async get_Instance(): Promise<Database> {

        return new Promise(async (resolve) => {

            if (!Database.Database_Network_Instance) {

                Database.Database_Network_Instance = new Database();
                await Database.Database_Network_Instance.connect()

            }

            return resolve(Database.Database_Network_Instance)

        })

    }








    private Database_Network_MongoDB_Client: MongoClient | null = null;
    private Database_Network_MongoDB_Client_Databases: Map<string, Db> = new Map();

    /**
      ** set the MongoDB Client URL and the Mongo Client Options.
      * @param config Database Network Configuration
      */

    constructor() {

        try {

            const db_uri = process.env.DB_Replica_Enable === "true" ? `mongodb://${process.env.DB_Auth_User}:${process.env.DB_Auth_Password}@${process.env.DB_URL}/?replicaSet=${process.env.DB_Replica}` : `mongodb://${process.env.DB_URL}`;

            this.Database_Network_MongoDB_Client = new MongoClient(db_uri);

        } catch (error) {

            const err = error as Error;

            Logger.error({ channel: "Node-Database", message: err.toString() });

            if (err.name === "MongoParseError") {

                if (err.message === `Protocol and host list are required in "mongodb://"`) throw { name: "Database_Network", message: "INVALID MONGODB ADDRESS" };

            }

        }

    }

    /**
     ** This instance method will connect the MongoDB Client
     */

    private async connect() {

        try {

            if (this.Database_Network_MongoDB_Client === null) throw Error("MongoClient is null");

            await this.Database_Network_MongoDB_Client.connect();
            Logger.log({ channel: "Node-Database", message: `connection successful` });

        } catch (error) {

            Logger.log({ channel: "Node-Database", message: `Error while trying to connect` });
            throw error;

        }

    }


    /**
     * 
     * @param database_Name 
     * @returns 
     */

    public async get_Database(database_Name: string): Promise<Db> {

        return new Promise((resolve, reject) => {

            try {

                if (!this.Database_Network_MongoDB_Client_Databases.has(database_Name)) {

                    if (this.Database_Network_MongoDB_Client === null) throw ("MongoClient is null");

                    const db = this.Database_Network_MongoDB_Client.db(database_Name);
                    this.Database_Network_MongoDB_Client_Databases.set(database_Name, db);
                    Logger.log({ channel: "Node-Database", message: `db selected ${database_Name}` });

                }

                const db = this.Database_Network_MongoDB_Client_Databases.get(database_Name);

                if (!db) return reject();

                return resolve(db);

            } catch (error) {

                const err = error as Error;
                Logger.error({ channel: "Node-Database", message: err.toString() })

                reject(error);

            }

        })

    }

    /**
     * 
     * @param database_Name 
     * @param collection_Name 
     * @returns 
     */

    public async getCollection<T extends Document>(database_Name: string, collection_Name: string): Promise<Collection<T>> {

        const db = await this.get_Database(database_Name);
        const collection = db.collection<T>(collection_Name);

        Logger.log({ channel: "Node-Database", message: `Connecting to ${collection_Name} Collection` });
        return collection;

    }

    /**
 * Verifica si existe una base de datos con el nombre especificado.
 * @param database_Name Nombre de la base de datos a verificar.
 * @returns Promise<boolean>
 */
    public async databaseExists(database_Name: string): Promise<boolean> {

        try {

            if (this.Database_Network_MongoDB_Client === null) throw Error("MongoClient is null");

            const adminDb = this.Database_Network_MongoDB_Client.db("admin");
            const { databases } = await adminDb.admin().listDatabases();

            return databases.some((db) => db.name === database_Name);

        } catch (error) {

            throw error;

        }
    }

    /**
     * Elimina una base de datos con el nombre especificado.
     * @param database_Name Nombre de la base de datos a eliminar.
     * @returns Promise<boolean>
     */
    public async dropDatabase(database_Name: string): Promise<boolean> {

        try {

            if (this.Database_Network_MongoDB_Client === null) throw Error("MongoClient is null");

            const db = this.Database_Network_MongoDB_Client.db(database_Name);
            const result = await db.dropDatabase();

            Logger.log({ channel: "Node-Database", message: `Database ${database_Name} dropped: ${result}` });
            return result;

        } catch (error) {

            throw error;

        }
    }

    public async disconnect() {

        if (this.Database_Network_MongoDB_Client === null) throw Error("MongoClient is null");

        await this.Database_Network_MongoDB_Client.close();

    }

}

export default Database
