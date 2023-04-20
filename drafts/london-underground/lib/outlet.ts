import { createContext, getframe, type Operation } from "./effection.ts";
import type { Node } from "./html.ts";

export const outlet = createContext<Node>("outlet", "");

export function* subtitle(value: string): Operation<void> {
  let frame = yield* getframe();
  frame.context["subtitles"] = value;
}

subtitle.outlet = createContext<string>('subtitles');
