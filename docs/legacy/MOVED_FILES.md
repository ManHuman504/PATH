Moved files index

The following files were moved during repository reorganization (engine/modules/plugins layout):

- Root documentation moved to `docs/legacy/`:
  - ACHIEVEMENTS_FIX.md
  - ACTIVE_COMPONENTS.md
  - ARCHITECTURE.md
  - CONTRIBUTING_PLUGIN.md
  - FEATURE_PLAN.md
  - IMPLEMENTATION_SUMMARY.md
  - LIGHT_THEME_GUIDE.md
  - LIGHT_THEME_TEST_CHECKLIST.md
  - NODE_IMPROVEMENTS.md
  - PATH_SEQUENCES_GUIDE.md
  - PATH_SEQUENCES_IMPLEMENTATION.md
  - PATH_SEQUENCES_SYSTEM.md
  - PATH_SEQUENCES_TEST_CHECKLIST.md
  - PHASE5_LIGHT_THEME_COMPLETE.md
  - PHASE7_SEQUENCES_COMPLETE.md
  - SEQUENCE_EDITOR_SETTINGS.md
  - SETTINGS_SYSTEM.md

- Legacy code and archived files moved to `legacy/`:
  - nodeUIPlugin.old.ts
  - packages-legacy/*

- Scripts moved to `scripts/`:
  - start-dev.bat
  - start-dev.ps1
  - start-dev.sh
  - test-achievements.ps1
  - test-api.bat
  - test-api.ps1

If you relied on these paths, update your bookmarks and CI pipelines to use the new layout:
- `engine/core` (core runtime)
- `modules/modules`, `modules/shared`, `modules/nodes-3d`
- `plugins/extensions`, `plugins/template` (plugin scaffold)

If you find anything broken, please open an issue with the path and I'll fix it.