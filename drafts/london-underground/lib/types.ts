import type { Operation } from "./effection.ts";
import type { Tag } from "./html.ts";

export type Route<T> = ContainerRoute<T> | TerminalRoute<T>;

export type Router<T> = Record<string, Route<T>>;

export type ContainerRoute<T> = [TerminalRoute<T>, Router<unknown>];

export interface TerminalRoute<T> {
  (model: T): Operation<Tag<string>>;
}
