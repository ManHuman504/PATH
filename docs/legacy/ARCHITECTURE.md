Project Architecture — Engine / Modules / Plugins

Overview
--------
This repository is now organized into three primary layers:

- **Engine** (core runtime and APIs)
  - Location: `engine/core`
  - Responsibility: State management, EventBus, command handling, module registry

- **Modules** (domain modules providing features)
  - Location: `modules/*`
  - Responsibility: Provide domain-specific data and tabs (paths, nodes, hub, etc.)

- **Plugins / Extensions** (UI and extension plugins)
  - Location: `plugins/extensions`, `modules/nodes-3d`, and user plugins under `plugins/` (recommended)
  - Responsibility: UI rendering, additional features, and integrations

Legacy and docs
---------------
- Non-essential documentation has been archived to `docs/legacy`
- Legacy code (old implementations) moved to `packages/legacy`

Plugin Development
------------------
- A safe plugin development scaffold is available at `plugins/template`.
- Plugins should implement `IPlugin` and declare `metadata.requiredAPIs` to express dependencies on engine features.
- Use `api.registerCleanup()` and the provided `props.context` sandbox to avoid leaks.

Next steps
----------
- Use `tools/plugin-template` to create new plugins locally and test them with the VM runner before registering with `PluginManager`.
- Follow contribution guidelines in `CONTRIBUTING.md` (if created).
