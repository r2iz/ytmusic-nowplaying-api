import { Hono } from 'https://deno.land/x/hono@v4.1.1/mod.ts';
import { getSuggestions } from "npm:node-youtube-music";
import { urlParse } from "https://deno.land/x/url_parse/mod.ts";
import * as queryString from "https://deno.land/x/querystring@v1.0.2/mod.js";
import config from "./config.json" with { type: "json" };

const app = new Hono();

app.post('/', async (c) => {
  const req = await c.req.json();
  const parsed = urlParse(req.url);
  const query =  parsed.search;

  if (!query) {
    return c.text("error: No query found");
  }

  const parsedQuery = await queryString.parse(query);
  if (!parsedQuery.v) {
    return c.text("error: No video id found");
  }
  try {
    const info = await getSuggestions(parsedQuery.v);
    const text = `${info[0]?.title ?? ''} / ${info[0].artists[0].name} `;
    return c.text(text);
  } catch (e) {
    console.error(e);
    return await c.text("error: No video found");
  }
});

Deno.serve({ port: config.port, hostname: config.hostname }, app.fetch);