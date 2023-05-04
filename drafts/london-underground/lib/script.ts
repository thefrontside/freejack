import { type Operation } from "./effection.ts";
import { createContext } from "./context.ts";

export const ScriptsContext = createContext<string[]>("clients");

export function* useScript(path: string): Operation<void> {
  let scripts = yield* ScriptsContext;
  scripts.push(path);
}
