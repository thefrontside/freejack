import { type Operation } from "./effection.ts";
import { createContext } from "./context.ts";
import type { Node } from "./html.ts";

export const outlet = createContext<Node>("outlet", "");

export const subtitle = createContext<string>("subtitles");

export function* useSubtitle(value: string): Operation<void> {
  yield* subtitle.set(value);
}
