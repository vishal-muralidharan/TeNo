---
name: repo-search
description: >-
  Use this skill to perform read-only discovery and auditing of any feature, component, utility,
  or symbol across the entire TeNo repository (including teno-web, teno-extension, firestore.rules,
  tests, docs, and .agents/skills/). Reports whether the component is present, its exact declaration
  and usage sites, cross-platform parity, and presents findings in chat or as a Markdown artifact without making any code edits.
---

# Repository Search & Component Discovery (Web, Extension & Skills)

This skill provides a systematic, **read-only** search and audit procedure across the entire **TeNo** codebase. Given any feature name, React component, database entity, CSS class, or concept, this skill determines whether it exists in the repository, scans declaration and usage sites across all architectural layers (including agent skills), assesses cross-platform parity between Web and Extension, and presents structured findings in chat or as a Markdown document.

---

## 1. Core Directive: Search Only (No Edits or Additions)

> **Mandatory Rule:** This skill is strictly **READ-ONLY**. 
> - **Do NOT make any code edits, additions, deletions, or refactors.**
> - **Do NOT create new application files, tests, or stylesheets.**
> - Simply execute a comprehensive search and report the verified findings in chat or in a Markdown document (if requested by the user).

---

## 2. Universal Search Scope Matrix

When given a component or feature query, search across all seven architectural surfaces:

| Surface / Layer | Search Locations | Target Entity Types |
| :--- | :--- | :--- |
| **1. Web Components & Pages** | `teno-web/src/components/`<br>`teno-web/src/pages/`<br>`teno-web/src/App.jsx` | React components, modals, tabs, views, router routes |
| **2. Extension Components** | `teno-extension/src/components/`<br>`teno-extension/src/pages/`<br>`teno-extension/src/App.jsx` | Popup tabs, compact drawer views, read-only consoles |
| **3. Database & Shared Logic** | `teno-web/src/lib/db.js`<br>`teno-web/api/`<br>`teno-extension/src/lib/` | `TeNoDatabase` methods, collections, serverless endpoints |
| **4. Theme, UI & Styling** | `teno-web/src/utils/themeTranslations.js`<br>`teno-web/src/utils/uiConfig.jsx`<br>`teno-web/src/index.css`<br>`teno-extension/src/index.css` | UI translations, bracketed labels, icons, CSS classes |
| **5. Automated Test Suites** | `teno-web/tests/components/`<br>`teno-web/tests/context/`<br>`teno-web/tests/lib/`<br>`teno-web/tests/utils/`<br>`teno-web/tests/api/` | Unit tests, mock declarations, contract assertions |
| **6. Security Rules & Docs** | `firestore.rules`<br>`docs/features/`<br>`firebase.json` | Match blocks, RBAC, schema documentation |
| **7. Skills & Rules Guidelines** | `.agents/skills/**/SKILL.md`<br>`AGENTS.md`<br>`README.md` | Agent guidelines, quality guardrails, naming rules |

---

## 3. Systematic Search Procedure

Follow these four steps when conducting a repository search:

```text
┌────────────────────────────────────────────────────────┐
│ Step 1: Broad Keyword & Identifier Discovery           │
│ Search exact names, kebab-case, PascalCase & concepts   │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Step 2: Separate Declarations from Usage Call Sites    │
│ Pinpoint primary file definition vs consuming imports  │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Step 3: Cross-Surface Parity & Layer Analysis          │
│ Compare Web vs Extension, check CSS tokens & tests     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Step 4: Scan Agent Skills & Repository Rules           │
│ Check if skills or AGENTS.md govern the component      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│ Step 5: Format & Deliver Structured Findings           │
│ Deliver in chat (default) or save as Markdown document  │
└────────────────────────────────────────────────────────┘
```

### Step 1: Identifier & Variation Discovery
Search for the target component or feature using its common naming variations:
- PascalCase: `PromptCard`, `LinkStorer`, `ConfirmModal`, `Timer`
- camelCase: `getPromptCurrentContent`, `deleteEntry`, `uiConfig`
- kebab-case / lowercase: `prompt-card`, `prompts-grid`, `prompts`, `join-label`
- Translation keys: `prompts.*`, `confirm.*`

Use `grep_search` across `teno-web`, `teno-extension`, `.agents/skills/`, `docs/`, and `firestore.rules`.

### Step 2: Separate Declarations from Usages
- **Declaration:** Where the component/function is defined (`export default function ComponentName`, `export const functionName`, or `class TeNoDatabase`).
- **Call Sites:** Where the component is mounted in JSX (`<ComponentName ... />`), imported (`import ComponentName from ...`), or invoked.

### Step 3: Evaluate Cross-Platform Parity
Answer the key architectural questions:
1. Is it implemented in **`teno-web`**?
2. Is it implemented in **`teno-extension`**?
3. If both, do they have feature symmetry, or is the extension version specialized (e.g. read-only 1-click copy)?
4. Are there dedicated test suites in `teno-web/tests/`?
5. Does it have custom styling in `index.css` supporting both Minimalist (`[data-style="minimal"]`) and Modern (`[data-style="modern"]`) modes?
6. Are there matching permissions in `firestore.rules`?

### Step 4: Scan Skills & Guidelines
Search `.agents/skills/` and `AGENTS.md` to identify:
- Which skills govern this component's design, database operations, or testing?
- Are there specific rules (e.g., zero border-radius, bracketed buttons, 100% test coverage) that apply to it?

---

## 4. Standardized Output Format

Always format the search findings clearly using this template:

```markdown
### Repository Search Results: `<Component or Feature Name>`

#### 1. Presence Summary
- **Status:** [ PRESENT | PARTIALLY PRESENT | ABSENT ]
- **Distribution Scope:** [ Web Only | Extension Only | Both Web & Extension | Documentation Only ]
- **Overview:** <1-2 sentences summarizing what the component does and where it lives>

#### 2. Declarations & Definitions
- **Primary Definition:** [`<FileName>`](file:///path/to/file#L<start>-L<end>)
- **Type:** [ React Functional Component | Custom Hook | Database Class Method | Utility Helper | CSS Rule ]

#### 3. Mount Points & Usage Sites
- **Parent / Mount Sites:**
  - [`<ParentComponent.jsx>`](file:///path/to/parent): `<brief description of usage>`
- **Database / API Connections:**
  - `<db.js methods or API endpoints connected>`
- **Translation / UI Config Keys:**
  - `themeTranslations.js` / `uiConfig.jsx`: `<keys>`

#### 4. Cross-Platform Parity Matrix
| Surface | Present? | Location / Details |
| :--- | :---: | :--- |
| **Web (`teno-web`)** | Yes / No | `<file path & brief notes>` |
| **Extension (`teno-extension`)** | Yes / No | `<file path & brief notes>` |
| **Unit Tests (`teno-web/tests/`)** | Yes / No | `<test file path>` |
| **Theme / Dual-Style CSS** | Yes / No | `<Minimalist & Modern styling details>` |
| **Firestore Security Rules** | Yes / No | `<firestore.rules match block>` |
| **Agent Skills / Guidelines** | Yes / No | `<governing skill names>` |

#### 5. Key Implementation Notes & Observations
- **Props / Interface:** `<notable props or configuration params>`
- **Styling Details:** `<key classes, minimal vs modern treatment>`
- **State & Subscriptions:** `<listeners, local state, or context hooks>`

#### 6. Governing Skills & Rules
- Mention any relevant skills from `.agents/skills/` (e.g. `maintain-minimalist-ui`, `review-responsive-design`, `review-db-structure`).
```

---

## 5. Delivery Mode (Chat vs. Markdown Document)

- **Default (Chat Response):**
  - Present the complete structured search report directly in the chat response using GitHub-style Markdown and clickable `file://` links.
- **When Requested in Markdown File (`MD` / Artifact):**
  - If the user explicitly asks for the results in a Markdown file (e.g., "give the results in MD", "save as report", "create markdown artifact"):
    1. Write the structured report to an artifact file in the conversation artifact directory:
       `<appDataDir>/brain/<conversation-id>/repo_search_<component_name>.md`
    2. Provide a concise chat confirmation with a direct clickable link to the generated Markdown artifact.
