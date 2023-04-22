import type { Operation } from "./effection.ts";
import type { Tag } from "./html.ts";

export type Route<T> = ContainerRoute<T> | TerminalRoute<T>;

export type RouteMap<T> = Record<string, Route<T>>;

export type ContainerRoute<T> = [TerminalRoute<T>, RouteMap<unknown>];

export interface TerminalRoute<T> {
  (model: T): Operation<Tag<string>>;
}

export interface ServerHandler<T> {
  model(params: Record<string, string>): Operation<T>;
  view(model: T): Operation<Tag<string>>;
}
