
// * Dependencies Required

import { ObjectId, type Document } from "mongodb";

// * Model Interface

export interface Account_Content_Document extends Document {
    _id: ObjectId;
    url: string;
}
