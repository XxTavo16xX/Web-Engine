
// * Dependencies Required

import { ObjectId, type Document } from "mongodb";

// * Model Interface

export interface Account_Document extends Document {
    _id: ObjectId;
    domain: string;
    token: string;
    r_token: string;
}
