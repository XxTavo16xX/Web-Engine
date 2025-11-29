
// * Dependencies Required

import { XMLParser } from "fast-xml-parser";

// * Interfaces Required

import type { Sitemap_Entry } from "./interfaces";

// * Module Required

import Logger from "@modules/Logger";
import Website_Open_Graph_Parser from "@modules/Open-Graph-Parser";
import Account_Content_Database from "@modules/Database/Account-Content";

// * Utils required

import { isWithinOneWeek } from "utils/timestamp";

// * Module Expoted

class Sitemap_Parser {

    private domain: string;
    private sitemap_url: string;
    private xml_file_content: string = "";
    private xml_file_content_data: any;

    private parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
        cdataPropName: "cdata"
    });

    constructor(domain: string, sitemap_url: string) {

        this.domain = domain;
        this.sitemap_url = sitemap_url;

    }

    private async load_Sitemap(): Promise<void> {

        Logger.log({ channel: `Sitemap-Parser`, message: "loading Website Sitemap" });

        return new Promise(async (resolve, reject) => {

            // * Requesting Sitemap XML Data

            try {

                const response = await fetch(this.sitemap_url);

                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

                this.xml_file_content = await response.text();

                resolve();

            } catch (error) {

                reject(error);

            }

        })

    }

    private async parse_XML_file_content(): Promise<void> {

        return new Promise(async (resolve, reject) => {

            try {

                this.xml_file_content_data = this.parser.parse(this.xml_file_content);

                resolve();

            } catch (error) {

                reject(error);

            }

        })

    }

    private async processUrlset(list: any[]): Promise<Sitemap_Entry[]> {
        const results: Sitemap_Entry[] = [];

        if (!Array.isArray(list)) list = [list];

        for (const entry of list) {
            const normalized = await this.normalizeEntry(entry);
            if (normalized !== null) results.push(normalized);
        }

        return results;
    }

    private async normalizeEntry(entry: any): Promise<Sitemap_Entry | null> {

        const url = entry.loc;

        if (!url) return null;

        const alreadyExists = await Account_Content_Database.get_Account_Content_Status_By_URL(this.domain ,url);

        if (alreadyExists === true) return null;

        const lastmod = entry.lastmod ? new Date(entry.lastmod).getTime() : entry["news:news"]?.["news:publication_date"] ? new Date(entry["news:news"]["news:publication_date"]).getTime() : Date.now();

        if (isWithinOneWeek(lastmod) === false) return null

        const title = entry["news:news"]?.["news:title"] || entry.title?.cdata || entry.title || "";

        const description = entry["news:news"]?.["news:description"] || entry.description?.cdata || entry.description || "";

        const image = entry["image:image"]?.["image:loc"] || entry.image || "";

        // fallback: scrape webpage if needed
        let finalTitle = title;
        let finalDescription = description;
        let finalImage = image;

        if (!title || !description || !image) {

            const og = new Website_Open_Graph_Parser(url);
            const scraped = await og.get_Open_Graph_Data();

            finalTitle = finalTitle || scraped.title;
            finalDescription = finalDescription || scraped.description;
            finalImage = finalImage || scraped.image;

        }

        return {
            title: finalTitle || "",
            description: finalDescription || "",
            image: finalImage || "",
            url,
            lastmod
        };
    }

    public async get_Sitemap_Entries(): Promise<Sitemap_Entry[]> {

        return new Promise(async (resolve, reject) => {

            try {

                await this.load_Sitemap();

                await this.parse_XML_file_content();

                if (this.xml_file_content_data.urlset) {

                    Logger.log({ channel: `Sitemap-Parser`, message: `${this.xml_file_content_data.urlset.url.length} URL(s) Found at the  website sitemap.` });
                    const sitemap_entries = await this.processUrlset(this.xml_file_content_data.urlset.url);

                    return resolve(sitemap_entries)

                }

                throw new Error("Formato desconocido en el sitemap");

            } catch (error) {

                reject(error)

            }

        })

    }



}

export default Sitemap_Parser