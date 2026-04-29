Plugin Template — safe development scaffold

Purpose
-------
This folder contains a minimal TypeScript plugin template and a safe test runner that executes compiled plugin JS inside a Node VM. The runner provides a sandboxed `context` (timers/fetch stubs) and a minimal fake `PluginAPI`. Use this to develop plugins independently of the main codebase.

Quick start
-----------
1. cd tools/plugin-template
2. npm install
3. npm run build
4. npm test

What it gives you
-----------------
- `src/plugin.ts` — example plugin implementing the minimal interface
- `src/test-runner.ts` — VM-based safe runner (no network) that loads `dist/plugin.js` and runs `init`/`render`/`cleanup`
- `props.context` — sandbox helpers (`setTimeout`, `requestAnimationFrame`, `fetch` disabled)

How to integrate with the main repo
----------------------------------
- Build the plugin (`npm run build`) and then either:
  - Use `npm link` and register the plugin in the main server code (`pluginManager.registerPlugin(new MyPlugin())`), or
  - Publish as a package and add to the main repo's dependencies.

Security notes
--------------
- The test runner uses Node's `vm` to isolate execution and disables network fetch by default.
- The template encourages using the sandboxed `props.context` and `api.registerCleanup()` to avoid leaks.

Next steps
----------
- I can extend the scaffold to generate new plugins via a CLI (e.g. `tools/create-plugin`) and add unit test examples for plugin APIs.
