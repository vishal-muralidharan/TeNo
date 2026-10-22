---
name: targeted-module-testing
description: >-
  Use this skill whenever any code change is made to a module, component, context, utility, or endpoint in TeNo.
  Ensures that targeted tests for the changed module are executed even for small changes,
  and that test files are created or updated whenever significant functionality or behavior changes.
---

# Targeted Module Testing & Test Synchronization

This skill provides procedures for running fast, targeted tests against changed modules in the **TeNo** repository and keeping test suites synchronized with implementation changes.

## Core Principles

1. **Test on Every Change:** Even a single-line fix, minor refactor, or small parameter adjustment must be validated by running the corresponding module test suite before moving forward.
2. **Synchronize Tests on Significant Changes:** Whenever new functionality is introduced, existing behavior is altered, or edge cases are added, corresponding test files must be updated or created in tandem.
3. **Targeted Execution:** Run only the relevant module's test suite during active development to get sub-second feedback loops rather than running entire suites.
4. **100% Coverage Alignment:** TeNo's web test configuration (`teno-web/vite.config.js`) enforces strict code coverage expectations across lines, functions, branches, and statements.

---

## When to Use This Skill

Activate this skill:
- Immediately after making any modification to source code (in `teno-web/src/`, `teno-web/api/`, `teno-extension/`, or configuration files).
- When introducing a new module, component, context provider, hook, or database utility.
- When modifying business logic, validation rules, or API contracts (such as label deletion options or share tokens).
- Before staging and committing any changes under the `atomic-commits` skill.

---

## Repository Test Mapping Guide

TeNo's primary test suite is located in `teno-web/tests/`, powered by Vitest, jsdom, and React Testing Library:

| Changed Module Path | Target Test File Path | Runner Command (from `teno-web/`) |
| :--- | :--- | :--- |
| `src/components/<Name>.jsx` | `tests/components/<Name>.test.jsx` | `npx vitest run tests/components/<Name>.test.jsx` |
| `src/<Name>Context.jsx` | `tests/context/<Name>Context.test.jsx`| `npx vitest run tests/context/<Name>Context.test.jsx` |
| `src/lib/db.js` | `tests/lib/db.test.js` | `npx vitest run tests/lib/db.test.js` |
| `src/utils/<name>.{js,jsx}` | `tests/utils/<name>.test.js` | `npx vitest run tests/utils/<name>.test.js` |
| `api/<endpoint>.js` | `tests/api/<endpoint>.test.js` | `npx vitest run tests/api/<endpoint>.test.js` |
| All component tests | `tests/components/` | `npx vitest run tests/components` |
| All context tests | `tests/context/` | `npx vitest run tests/context` |
| Full web test suite | `tests/` | `npm test` |

*Tip (Running from root):* Prefix the command with directory navigation or npm script:
```bash
(cd teno-web && npx vitest run tests/components/LinkStorer.test.jsx)
```

---

## Workflow Steps

### Step 1: Detect the Impact of the Change
Determine whether the change is:
- **Minor/Refactor (no behavior change):** Verify that existing tests still pass unchanged.
- **Significant (new functionality or behavior change):** Plan necessary test updates (see Step 2).
  - *Example:* If modifying `<ConfirmModal />` or the label deletion modal inside `<LinkStorer />` to offer multiple deletion modes ("Delete Label & All Items In It" vs "Just Delete Label"), update the modal button label assertions in `LinkStorer.test.jsx`.

### Step 2: Update or Create Test Files (For Significant Changes)
Update the corresponding test file if any of the following apply:
- **New Feature or Function:** Add unit tests covering expected inputs, outputs, rendered elements, and user interactions.
- **New Logic Branch or Condition:** Add test cases for both truthy and falsy pathways (e.g. Minimalist vs Modern styling branches in `uiConfig`).
- **Boundary & Edge Cases:** Test empty states, missing label references, invalid tokens, `null`/`undefined`, and unauthenticated states.
- **Bug Fix:** Write a regression test that fails without the fix and passes with it.
- **Altered Contract / Schema:** Update assertions reflecting the updated schema or return values without lowering test rigor.

### Step 3: Run the Targeted Test
Execute the targeted command in the terminal:
```bash
cd teno-web && npx vitest run <path/to/test-file>
```
Verify the output:
- All test suites must report `✓ passed`.
- Ensure execution time remains quick (typically < 1–2 seconds).

### Step 4: Handle Failures Immediately
If any test fails:
1. Do not ignore the failure or proceed to another file.
2. Read the assertion diff and stack trace carefully.
3. Determine whether the implementation has a bug or the test assertion needs adjusting to the new contract.
4. Correct the issue and re-run the targeted test until green.

---

## Test Architecture & Mocking Standards

`teno-web/tests/setup.js` automatically configures standard stubs and mocks before every test:
1. **In-Memory `localStorage`:** Cleaned before each test (`localStorageMock.clear()`).
2. **DOM Stubs:** `window.matchMedia`, `requestAnimationFrame`, `cancelAnimationFrame`, and `scrollIntoView`.
3. **Firebase Mocks:**
   - Client SDK entry point (`src/firebase.js`) is mocked globally to avoid initiating network sockets.
   - Granular mocks for `firebase/auth` and `firebase/firestore` are hoisted and available via `vi.mocked()`.
   - Never import real Firebase credentials into test files.

---

## Handling Test Results & Artifacts

Test execution can produce ephemeral artifacts:
* `coverage/`: V8 code coverage reports.
* `.vitest/`: Vitest cache.

### Artifact Policy & Cleanup
1. **Never Commit Execution Artifacts:** Coverage directories and caches are ephemeral and local-only. They must never be staged or committed.
2. **Cleanup Command:**
   ```bash
   rm -rf teno-web/coverage teno-web/.vitest
   ```

---

## Testing Quality Checklist

Before considering module testing complete:
- [ ] Targeted module test executed and passed (`0 errors`).
- [ ] New functionality has corresponding test assertions.
- [ ] Edge cases, error handlers, and empty states are covered.
- [ ] No `test.skip`, `it.only`, or commented-out assertions left behind.
- [ ] Transient test artifacts (`coverage/`, logs) pruned.
- [ ] Ready for atomic commit via `atomic-commits` skill.
