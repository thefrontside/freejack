import { expect, useScope, type Operation } from "./effection.ts";
import { useOak, type OakServer } from "./oak.ts";

export interface FreejackServerOptions {
  appdir: string;
  servermod: string;
  clientmod: string;
  port: number;
}

export function useServer(options: FreejackServerOptions): Operation<OakServer> {
  return useOak({
    port: options.port,
    *init(http) {

      let mod = yield* expect(import(`${options.appdir}/${options.servermod}`));
      let app = mod.default;

      let scope = yield* useScope();

      http.use((ctx) => scope.run(() => app(ctx)));

    },
  });
}
