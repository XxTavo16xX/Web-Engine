
// * Dependencies Required

import { ObjectId, type Document } from "mongodb"

// * Model Interface

export interface Website_Document extends Document {
    _id: ObjectId;
    domain: string;
    sitemap_url: string;
    categorie: string;
    last_modification: number;
}


// * Model Exported

class Website implements Website_Document {

    public _id: ObjectId;
    public domain: string;
    public sitemap_url: string;
    public categorie: string;
    public last_modification: number;

    constructor(domain: string, sitemap_url: string, categorie: string, last_modification?: number) {

        this._id = new ObjectId();
        this.domain = domain;
        this.sitemap_url = sitemap_url;
        this.categorie = categorie;
        this.last_modification = last_modification === undefined ? Date.now() : last_modification;

    }

}

export default Website