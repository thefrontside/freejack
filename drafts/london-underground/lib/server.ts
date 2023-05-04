import { bundle } from "https://deno.land/x/emit@0.21.1/mod.ts";
import { expect, getframe, type Operation, useScope } from "./effection.ts";
import { type OakServer, useOak, Router } from "./oak.ts";
import type { ServerHandler } from "./types.ts";
import type { Node, Tag } from "./html.ts";
import { Document, Element } from "./dom.ts";
import { ScriptsContext } from "./script.ts";
import { createRouteRecognizer, type Pattern } from "./route-recognizer.ts";
import { default as inc } from "npm:incremental-dom";

export interface FreejackServerOptions {
  appdir: string;
  servermod: string;
  clientmod: string;
  port: number;
}

export function useServer(
  options: FreejackServerOptions,
): Operation<OakServer> {
  return useOak({
    port: options.port,
    *init(http) {
      let servermod = yield* expect(
        import(`${options.appdir}/${options.servermod}`),
      );
      let appmod = yield* expect(import(`${options.appdir}/app.ts`));

      let recognizer = createRecognizer(appmod.default, servermod.default);

      let scope = yield* useScope();

      let router = new Router();

      router.get("/scripts/:path", async (ctx) => {
        let { path } = ctx.params;
        let url = new URL(`file://${options.appdir}/scripts/${path}`);
        let result = await bundle(url);
        ctx.response.headers.set("Content-Type", "text/javascript");
        ctx.response.body = result.code;
      });

      http.use(router.routes());

      http.use((ctx) =>
        scope.run(function* (): Operation<void> {
          let scripts = yield* ScriptsContext.set([]);
          let segments = recognizer.recognize(ctx.request.url.pathname);

          if (!segments) {
            ctx.response.body = "Not Found";
          } else {
            let frame = yield* getframe();
            let top: Tag<string> = ["html", {}, []];

            for (let i = segments.length - 1; i >= 0; i--) {
              let result = segments[i];
              let handler = result.handler as ServerHandler<unknown>;
              let model = yield* handler.model(result.params);
              let view = yield* handler.view(model);
              top = frame.context.outlet = view;
            }

            let doc = new Document().implementation.createHTMLDocument();
            if (!doc.documentElement) {
              throw new Error("null document element");
            }

            let element = doc.documentElement;
            render(top, element);

            if (scripts.length > 0) {

              let src = [
                ``,
                `import { run, expect, spawn, suspend } from "/scripts/effection.ts";`,
                `const scripts = ${JSON.stringify(scripts)};`,
                `let task = run(function*() {`,
                `  for (let script of scripts) {`,
                `    yield* spawn(function*() {`,
                `      let mod = yield* expect(import(\`/scripts/\${script}\`).then(i => { console.dir({ i }); return i; }))`,
                `      yield* mod.default()`,
                `    });`,
                `  }`,
                `  yield* suspend();`,
                `});`,
                `window.addEventListener('beforeunload', () => task.halt())`,
                ``,
              ].join("\n");

              let el = doc.createElement("script");
              el.setAttribute("type", "module");
              el.setAttribute("async", true);

              el.innerText = src;

              element.appendChild(el);
            }

            ctx.response.body = element.outerHTML;
          }
        })
              );
    },
  });
}

export function createRecognizer(
  app: any,
  server: any,
): ReturnType<typeof createRouteRecognizer> {
  let recognizer = createRouteRecognizer();
  let collection = collect({
    app,
    server,
    path: "",
    pathway: [],
    patterns: [],
  });

  for (let patterns of collection) {
    recognizer.add(patterns);
  }

  return recognizer;
}

interface PatternCollector {
  app: any;
  server: any;
  path: string;
  patterns: Pattern[][];
  pathway: Pattern[];
}

export function collect(collector: PatternCollector): Pattern[][] {
  let { app, server, path, pathway } = collector;
  if (typeof app === "function") {
    return [
      ...collector.patterns,
      [...pathway, { path, handler: { model: server, view: app } }],
    ];
  } else if (Array.isArray(app)) {
    let [model, childserver] = server;
    let [view, childapp] = app;

    let pattern = { path: "", handler: { model, view } };
    return collect({
      ...collector,
      app: childapp,
      server: childserver,
      pathway: pathway.concat(pattern),
    });
  } else {
    let patterns = collector.patterns;
    for (let [key, childapp] of Object.entries(app)) {
      let childserver = server[key];
      patterns = patterns.concat(collect({
        app: childapp,
        server: childserver,
        path: key,
        patterns: [],
        pathway,
      }));
    }
    return patterns;
  }
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
