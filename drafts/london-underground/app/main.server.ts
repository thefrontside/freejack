import data from "../metro-stations.json" assert { type: "json" };

export default [function* () {}, {
  *["/"]() {
    return data.map((item) => ({
      id: item.naptanId,
      name: item.commonName,
    }));
  },
  *["/stations/:id"]({ id }: { id: string }) {
    let item = data.find((item) => item.id === id);
    if (item) {
      return {
        id: item.naptanId,
        name: item.commonName,
      };
    } else {
      throw new Error("404");
    }
  },
}] as const;
