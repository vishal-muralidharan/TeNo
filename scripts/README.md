update_labels.cjs

This script patches `src/components/LinkStorer.jsx` to add label-ordering and related UI changes.

Usage

Run with Node (project `package.json` uses `type: "module"`, so the script is a CommonJS file `.cjs`):

```bash
node scripts/update_labels.cjs
```

Notes

- The script expects to run from the project root (`curr-side`) so paths like `src/components/LinkStorer.jsx` resolve correctly.
- Keep this script under `scripts/` to keep repository tidy.
- The script is idempotent-safe for the existing patterns but review the file after running.
