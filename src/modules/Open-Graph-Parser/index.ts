
// * Module Required

import Logger from "@modules/Logger";

// * Interfaces Required

import { type Open_Graph_Data } from "./interface";

class Website_Open_Graph_Parser {

    private url: string;
    private html: string = "";

    constructor(url: string) {
        this.url = url;
    }

    private async load_HTML(): Promise<void> {

        Logger.log({ channel: "Open-Graph", message: `Fetching HTML for ${this.url}` });

        const response = await fetch(this.url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (compatible; WebDesignNodes-Bot/1.0)"
            }
        });

        if (!response.ok) {
            throw new Error(`HTML Fetch Error: ${response.status}`);
        }

        this.html = await response.text();
    }

    private extract_Title(): string {

        // 1) Try <meta property="og:title">
        const og = this.html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
        if (og) return og[1];

        // 2) Try <title>
        const title = this.html.match(/<title>(.*?)<\/title>/i);
        if (title) return title[1];

        return "";
    }

    // ---------------------------------------------
    // Extract <meta name="description">
    // ---------------------------------------------
    private extract_Description(): string {

        // Try <meta name="description">
        const desc = this.html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
        if (desc) return desc[1];

        // Try og:description
        const og = this.html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
        if (og) return og[1];

        return "";
    }

    // ---------------------------------------------
    // Extract image from several sources
    // ---------------------------------------------
    private extract_Image(): string {

        // 1) Try og:image
        const og = this.html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
        if (og) return og[1];

        // 2) Try twitter:image
        const twitter = this.html.match(/<meta\s+name="twitter:image"\s+content="([^"]*)"/i);
        if (twitter) return twitter[1];

        // 3) Try <img src="..."> first image
        const img = this.html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (img) return img[1];

        return "";
    }

    // ---------------------------------------------
    // Public method to get OpenGraph fallback
    // ---------------------------------------------
    public async get_Open_Graph_Data(): Promise<Open_Graph_Data> {

        try {

            await this.load_HTML();

            const title = this.extract_Title();
            const description = this.extract_Description();
            const image = this.extract_Image();

            return { title, description, image };

        } catch (error) {

            Logger.error({ channel: "Open-Graph", message: `Error parsing OpenGraph for ${this.url}` });

            return {
                title: "",
                description: "",
                image: ""
            };
        }
    }
}

export default Website_Open_Graph_Parser;
