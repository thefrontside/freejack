import {
  action,
  run,
  suspend,
} from "https://deno.land/x/effection@3.0.0-alpha.7/mod.ts";
import { useServer } from "../lib/server.ts";

await run(function* () {
  yield* action<void>(function* (resolve) {
    let server = yield* useServer({
      appdir: `${Deno.cwd()}/app`,
      servermod: "main.server.ts",
      clientmod: "main.client.ts",
      port: 8088,
    });

    console.log(`freejack -> https://${server.hostname}:${server.port}`);

    Deno.addSignalListener("SIGINT", resolve);
    try {
      yield* suspend();
    } finally {
      Deno.removeSignalListener("SIGINT", resolve);
    }
  });

  console.log("exiting...");
});
