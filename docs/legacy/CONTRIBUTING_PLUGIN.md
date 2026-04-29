Contributing Plugins

Use the `plugins/template` scaffold:

1. cd plugins/template
2. npm install
3. npm run build
4. npm test

Register plugin in the server for local testing (apps/web/src/server.ts):

import { MyPlugin } from 'my-plugin';
pluginManager.registerPlugin(new MyPlugin());
await pluginManager.loadPlugin('my-plugin-id');

Guidelines:
- Do not mutate `props.state` — use `api.executeCommand()` to change engine state.
- Use `props.context` for timers/fetch to ensure proper cleanup.
- Register cleanup handlers via `api.registerCleanup()`.
