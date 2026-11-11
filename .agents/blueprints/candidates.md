# Blueprint Rule Candidates

Proposed candidates from codebase facts. User confirmation required before adding to profile.

- **ui-no-browser-dialogs** (design): Never use alert, confirm or prompt. Use the project's dialog and toast primitives.
  - Evidence: `Found 4 native dialog uses: teno-extension/src/components/LinkStorer.jsx:64, teno-web/src/pages/DPDPPage.jsx:29, teno-web/src/pages/DPDPPage.jsx:32`
- **ui-no-native-checkbox** (design): Avoid raw HTML native checkbox control; use the themed primitive.
  - Evidence: `Found 1 native checkbox uses outside primitives.`
- **ui-no-native-textarea** (design): Avoid raw HTML native textarea control; use the themed primitive.
  - Evidence: `Found 2 native textarea uses outside primitives.`
- **process-primitive-gap-dialog** (process): Create the primitive first, in its own commit, before using the control.
  - Evidence: `Low-level widget (Modal) exists without a themed dialog primitive.`
