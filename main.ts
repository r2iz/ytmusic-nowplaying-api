import { Hono } from "https://deno.land/x/hono@v4.3.11/mod.ts";
import YTMusic from "npm:ytmusic-api";
import { urlParse } from "https://deno.land/x/url_parse/mod.ts";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";

const app = new Hono();

app.post("/", async (c) => {
    const req = await c.req.json();
    const parsed = urlParse(req.url);
    const query = parsed.search;

    if (!query) {
        return c.text("error: No query found");
    }

    const parsedQuery = await queryString.parse(query);
    if (!parsedQuery.v) {
        return c.text("error: No video id found");
    }

    try {
        const ytmusic = new YTMusic();
        await ytmusic.initialize();
        const info = await ytmusic.getSong(parsedQuery.v as string);
        const text = `Title: ${info.name}\nArtists: ${info.artist.name}\n}`;
        return c.text(text);
    } catch (e) {
        console.error(e);
        return await c.text("error: No video found");
    }
});

Deno.serve(app.fetch);
