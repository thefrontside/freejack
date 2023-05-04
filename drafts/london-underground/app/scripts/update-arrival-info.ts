import { sleep } from "./effection.ts";

export default function* updateArrivalInfo() {
  let counter = 1;
  while (true) {
    yield* sleep(5_000);
    console.log('pulse', counter++);
  }
}
