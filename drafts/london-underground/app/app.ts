import type { MetroStation } from "./types.ts";

import { body, head, html, p, title, div, li, a } from "../lib/html.ts";
import { outlet, subtitle } from "../lib/outlet.ts";

export default [function* main() {
  return html({ lang: "en-US" },
    head(
      title("Transport for London: ", yield* subtitle.outlet),
      body({ class: "body" }, yield* outlet),
    ),
  )
  ;
}, {
  *["/"](stations: MetroStation[]) {
    yield* subtitle("list of metro stations");
    return div(
      p("Select a station from the list below"),
      ...stations.map(station =>
        li(a({href: `/stations/${station.id}`}, station.name)))
    );
  },

  *["/stations/:id"](station: MetroStation) {
    yield* subtitle(station.name);
    return p("selected station", station.id);
  },
}] as const;
