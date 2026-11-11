# UI Component Blueprint

Extracted UI components, props contracts, variants, and state primitives.

## Component catalog

- **Component: ConfirmModal**
  - Evidence: `teno-web/src/components/ConfirmModal.jsx:15` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: Footer**
  - Evidence: `teno-web/src/components/Footer.jsx:4` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: GenerateInvite**
  - Evidence: `teno-web/src/components/GenerateInvite.jsx:6` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: Header**
  - Evidence: `teno-web/src/components/Header.jsx:6` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: LinkStorer**
  - Evidence: `teno-web/src/components/LinkStorer.jsx:8` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: MembersModal**
  - Evidence: `teno-web/src/components/MembersModal.jsx:7` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: PromptCard**
  - Evidence: `teno-web/src/components/PromptCard.jsx:7` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: PromptEditorModal**
  - Evidence: `teno-web/src/components/PromptEditorModal.jsx:12` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: PromptsTab**
  - Evidence: `teno-web/src/components/PromptsTab.jsx:11` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: Reminders**
  - Evidence: `teno-web/src/components/Reminders.jsx:8` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: SEO**
  - Evidence: `teno-web/src/components/SEO.jsx:4` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: ShareModal**
  - Evidence: `teno-web/src/components/ShareModal.jsx:147` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: SharedLabelGroup**
  - Evidence: `teno-web/src/components/SharedLabelGroup.jsx:9` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: SharedLabelsTab**
  - Evidence: `teno-web/src/components/SharedLabelsTab.jsx:6` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: Terminal**
  - Evidence: `teno-web/src/components/Terminal.jsx:34` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: TermsAgreementModal**
  - Evidence: `teno-web/src/components/TermsAgreementModal.jsx:6` (confidence: high)
  - Props: `unknown`
  - Variants: none
- **Component: Timer**
  - Evidence: `teno-web/src/components/Timer.jsx:3` (confidence: high)
  - Props: `unknown`
  - Variants: none

## Form controls

| Control family | Themed primitive | Native uses | Status |
|---|---|---|---|
| date | none | 0 | ok |
| time | none | 0 | ok |
| color | none | 0 | ok |
| select | none | 0 | ok |
| dialog | none | 4 (teno-extension/src/components/LinkStorer.jsx:64, teno-web/src/pages/DPDPPage.jsx:29, teno-web/src/pages/DPDPPage.jsx:32) | gap, violation |
| textarea | none | 2 (teno-extension/src/components/LinkStorer.jsx:699, teno-extension/src/components/LinkStorer.jsx:887) | violation |
| range | none | 0 | ok |
| file | none | 0 | ok |
| checkbox | none | 1 (teno-extension/src/components/Reminders.jsx:199) | violation |
| radio | none | 0 | ok |

## State primitives and alerts

- Primitive: `Loading` (`teno-web/src/components/LoadingScreen.jsx:1`)
- Primitive: `Modal` (`teno-web/src/components/ConfirmModal.jsx:1`)
- Primitive: `Modal` (`teno-web/src/components/MembersModal.jsx:1`)
- Primitive: `Modal` (`teno-web/src/components/PromptEditorModal.jsx:1`)
- Primitive: `Modal` (`teno-web/src/components/ShareModal.jsx:1`)
- Primitive: `Modal` (`teno-web/src/components/TermsAgreementModal.jsx:1`)
- Primitive: `Modal` (`teno-web/tests/components/ConfirmModal.test.jsx:1`)
- Primitive: `Modal` (`teno-web/tests/components/PromptEditorModal.test.jsx:1`)
- Primitive: `role='alert'` (`teno-web/src/components/PromptEditorModal.jsx:354`)

## Low level widgets

- `Modal`: `teno-web/src/components/ConfirmModal.jsx:1`

<!-- BEGIN CUSTOM: contracts -->
<!-- END CUSTOM: contracts -->
