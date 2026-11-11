# Data Blueprint

Extracted database schemas, models, schemas, and storage keys.

## Generated facts

- **Storage Key: styleMode**
  - Evidence: `teno-web/src/ThemeContext.jsx:137` (confidence: high)
    - `if (!initialStyleMode) initialStyleMode = localStorage.getItem('styleMode');`
- **Storage Key: styleMode**
  - Evidence: `teno-web/src/ThemeContext.jsx:27` (confidence: high)
    - `_bootstrapStyle = localStorage.getItem('styleMode') || 'minimal';`
- **Storage Key: styleMode**
  - Evidence: `teno-web/src/ThemeContext.jsx:31` (confidence: high)
    - `_bootstrapStyle = localStorage.getItem('styleMode') || 'minimal';`
- **Storage Key: styleMode**
  - Evidence: `teno-web/src/ThemeContext.jsx:83` (confidence: high)
    - `localStorage.setItem('styleMode', newStyleMode);`
- **Storage Key: styleMode**
  - Evidence: `teno-web/tests/context/ThemeContext.test.jsx:332` (confidence: high)
    - `expect(localStorage.getItem('styleMode')).toBe('modern')`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/App.jsx:107` (confidence: high)
    - `localStorage.setItem('teno_session', JSON.stringify(data));`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/App.jsx:118` (confidence: high)
    - `localStorage.removeItem('teno_session');`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/App.jsx:63` (confidence: high)
    - `const cached = localStorage.getItem('teno_session');`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/ThemeContext.jsx:129` (confidence: high)
    - `const session = JSON.parse(localStorage.getItem('teno_session'));`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/ThemeContext.jsx:18` (confidence: high)
    - `const sessionData = localStorage.getItem('teno_session');`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/ThemeContext.jsx:60` (confidence: high)
    - `const session = JSON.parse(localStorage.getItem('teno_session') || '{}');`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/ThemeContext.jsx:62` (confidence: high)
    - `localStorage.setItem('teno_session', JSON.stringify(session));`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/ThemeContext.jsx:85` (confidence: high)
    - `const session = JSON.parse(localStorage.getItem('teno_session') || '{}');`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/ThemeContext.jsx:87` (confidence: high)
    - `localStorage.setItem('teno_session', JSON.stringify(session));`
- **Storage Key: teno_session**
  - Evidence: `teno-web/src/components/Header.jsx:14` (confidence: high)
    - `const session = JSON.parse(localStorage.getItem('teno_session'));`
- **Storage Key: theme**
  - Evidence: `teno-web/src/ThemeContext.jsx:136` (confidence: high)
    - `if (!initialTheme) initialTheme = localStorage.getItem('theme');`
- **Storage Key: theme**
  - Evidence: `teno-web/src/ThemeContext.jsx:26` (confidence: high)
    - `_bootstrapTheme = localStorage.getItem('theme') || 'dark';`
- **Storage Key: theme**
  - Evidence: `teno-web/src/ThemeContext.jsx:30` (confidence: high)
    - `_bootstrapTheme = localStorage.getItem('theme') || 'dark';`
- **Storage Key: theme**
  - Evidence: `teno-web/src/ThemeContext.jsx:58` (confidence: high)
    - `localStorage.setItem('theme', newTheme);`
- **Storage Key: theme**
  - Evidence: `teno-web/tests/context/ThemeContext.test.jsx:246` (confidence: high)
    - `expect(localStorage.getItem('theme')).toBe('light')`

## Signals (evidence only, not facts)

- Time serialization signal: `teno-extension/src/App.jsx:148` (`const now = Date.now()`)
- Time serialization signal: `teno-extension/src/App.jsx:225` (`lastClickedAt: new Date().toISOString(),`)
- Time serialization signal: `teno-extension/src/App.jsx:310` (`const now = Date.now()`)
- Time serialization signal: `teno-extension/src/App.jsx:335` (`const now = Date.now()`)
- Time serialization signal: `teno-extension/src/App.jsx:358` (`const now = Date.now()`)
- Time serialization signal: `teno-extension/src/components/LinkStorer.jsx:482` (`const base = Date.now();`)
- Time serialization signal: `teno-extension/src/components/LinkStorer.jsx:487` (`createdAt: new Date(base - (newIds.length - 1 - i) * 1000).toISOString(),`)
- Time serialization signal: `teno-extension/src/components/Terminal.jsx:231` (`pushOutputLine(new Date().toISOString())`)
- Time serialization signal: `teno-web/src/App.jsx:176` (`const now = Date.now()`)
- Time serialization signal: `teno-web/src/App.jsx:225` (`lastClickedAt: new Date().toISOString(),`)
- Time serialization signal: `teno-web/src/App.jsx:310` (`const now = Date.now()`)
- Time serialization signal: `teno-web/src/App.jsx:335` (`const now = Date.now()`)
- Time serialization signal: `teno-web/src/App.jsx:358` (`const now = Date.now()`)
- Time serialization signal: `teno-web/src/api/user.js:84` (`updatedAt: new Date().toISOString()`)
- Time serialization signal: `teno-web/src/components/LinkStorer.jsx:308` (`favoritedAt: new Date().toISOString(),`)
- Time serialization signal: `teno-web/src/components/LinkStorer.jsx:316` (`createdAt: new Date(0).toISOString(), // epoch → top of regular list`)
- Time serialization signal: `teno-web/src/components/LinkStorer.jsx:480` (`const base = Date.now();`)
- Time serialization signal: `teno-web/src/components/LinkStorer.jsx:485` (`createdAt: new Date(base - (newIds.length - 1 - i) * 1000).toISOString(),`)
- Time serialization signal: `teno-web/src/components/Terminal.jsx:233` (`pushOutputLine(new Date().toISOString())`)
- Time serialization signal: `teno-web/src/components/TermsAgreementModal.jsx:20` (`updatedAt: new Date().toISOString()`)
- Time serialization signal: `teno-web/src/lib/db.js:12` (`toMillis: () => Date.now(),`)
- Time serialization signal: `teno-web/src/lib/db.js:9` (`seconds: Math.floor(Date.now() / 1000),`)
- Time serialization signal: `teno-web/src/pages/DPDPPage.jsx:23` (`const date = new Date().toISOString().split('T')[0];`)
- Time serialization signal: `teno-web/src/pages/LoginPage.jsx:114` (`createdAt: new Date().toISOString(),`)
- Time serialization signal: `teno-web/tests/setup.js:127` (`now: vi.fn(() => ({ seconds: Math.floor(Date.now() / 1000), nanoseconds: 0, toMillis: () => Date.now`)

<!-- BEGIN CUSTOM: contracts -->
<!-- END CUSTOM: contracts -->
