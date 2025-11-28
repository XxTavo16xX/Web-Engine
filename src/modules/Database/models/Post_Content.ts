
export interface Post_Content {
    labels: { id: string, type: "h1" | "text", content: string }[];
    images: { id: string, url: string }[];
    videos: { id: string, type: "mp4" | "mkv" | "m3u8", thumbnail_url: string, video_url: string }[];
    links: { id: string, url: string }[];
    structure: { element: "image" | "label" | "link" | "video", id: string }[];
    carousel: string[],
    topics: string[];
}