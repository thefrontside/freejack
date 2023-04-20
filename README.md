## Freejack

> 1. A dissident or loner; somebody who roams the world without being
> tied to a distict group, ideology or belief system.
>
> 2. A framework that derives interfaces from freely combined streams
> of data.


### Goals

1. Zero build, 20ms deploys
2. Good choice for pure-content sites with little or no interactivity.
3. Good choice for highly interactive websites that require efficient transfer
   of data.
4. Always-on dev experience with seamless reloading.
5. Usable for the Effection inspector which must
   1. run inside a Node / Deno process stream data to browser
   2. run in a browser and stream data to devtools pane.
   3. Act as standalone app and stream data from node/deno process
   4. be self-inspectable. I.e. Inspector can inspect Inspector


### Principles

1. Data is pushed, never pulled unless it is to either re-push elswhere or to
   consume for rendering.
2. view = f(event) e.g. view is the terminus of a data stream.
3. clear route hierachy for mapping urls to application state
