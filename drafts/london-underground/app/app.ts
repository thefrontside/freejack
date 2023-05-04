import type { MetroStation } from "./types.ts";

import { a, body, div, head, html, li, p, title } from "../lib/html.ts";
import { outlet, useSubtitle, subtitle } from "../lib/outlet.ts";
import { useScript } from "../lib/script.ts";

export default [function* main() {
  return html(
    { lang: "en-US" },
    head(
      title("Transport for London: ", yield* subtitle),
      body({ class: "body" }, yield* outlet),
    ),
  );
}, {
  *["/"](stations: MetroStation[]) {
    yield* useSubtitle("list of metro stations");

    return div(
      p("Select a station from the list below"),
      ...stations.map((station) =>
        li(a({ href: `/stations/${station.id}` }, station.name))
      ),
    );
  },

  *["/stations/:id"](station: MetroStation) {
    yield* useSubtitle(station.name);

    yield* useScript("update-arrival-info.ts");

    return p("selected station", station.id);
  },
}] as const;
