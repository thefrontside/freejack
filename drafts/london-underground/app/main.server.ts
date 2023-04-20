import { getframe, type Operation } from "https://deno.land/x/effection@3.0.0-alpha.7/mod.ts";
import type { Context } from "../lib/oak.ts";
import type { Tag, Node } from "../lib/html.ts";
import { Document, type Element } from "../lib/dom.ts";
import { default as inc } from "npm:incremental-dom";

import data from "../metro-stations.json" assert { type: "json" };

import { app } from "./app.ts";

export default function*(cxt: Context): Operation<void> {
  let [root, routes] = app;

  let index = routes["/"];

  let stations = data.map(item => ({
    id: item.naptanId,
    name: item.commonName,
  }));

  let body = yield* index(stations);

  let frame = yield* getframe();
  frame.context.outlet = body;

  let html = yield* root();

  let doc = new Document().implementation.createHTMLDocument();
  if (!doc.documentElement) {
    throw new Error('null document element');
  }

  let element = doc.documentElement;
  render(html, element)

  cxt.response.body = element.outerHTML;
}

export function render(html: Tag<string>, element: Element): void {
  let [, attrs, nodes] = html;

  for (let [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, String(value));
  }

  inc.patch(element, () => apply(nodes));
}

function apply(nodes: Node[]): void {
  for (let node of nodes) {
    if (typeof node === "string") {
      inc.text(node);
    } else {
      let [name, attrs, children] = node;

      inc.elementOpen(name, "", Object.entries(attrs).flat());

      apply(children);

      inc.elementClose(name);
    }
  }
}
