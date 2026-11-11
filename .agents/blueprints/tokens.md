# Design Tokens Blueprint

Extracted CSS custom properties, role mappings, and theme palettes.

## Token roles and theme values

| Token | Role | Light Value | Dark Value | Evidence |
|---|---|---|---|---|
| `--color-accent` | action | `#ffffff` | `unknown` | `teno-web/src/index.css:10` |
| `--border-color` | border | `#e2e8f0` | `#262626` | `teno-web/src/index.css:100` |
| `--border-radius` | border | `12px` | `12px` | `teno-web/src/index.css:101` |
| `--border-style` | border | `solid` | `solid` | `teno-web/src/index.css:102` |
| `--color-border` | border | `var(--border-color)` | `unknown` | `teno-web/src/index.css:20` |
| `--font-main` | font | `'Plus Jakarta Sans', 'Inter', sans-serif` | `'Plus Jakarta Sans', 'Inter', sans-serif` | `teno-web/src/index.css:103` |
| `--font-weight-ui` | font | `500` | `500` | `teno-web/src/index.css:104` |
| `--color-danger` | other | `#ef4444` | `unknown` | `teno-web/src/index.css:11` |
| `--color-success` | other | `#22c55e` | `unknown` | `teno-web/src/index.css:12` |
| `--link-card-width` | other | `100%` | `unknown` | `teno-web/src/index.css:687` |
| `--shadow` | other | `var(--shadow-card)` | `unknown` | `teno-web/src/index.css:22` |
| `--shadow-card` | other | `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)` | `0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)` | `teno-web/src/index.css:106` |
| `--terminal-height` | other | `clamp(190px, 30vh, 50vh)` | `unknown` | `teno-web/src/index.css:8` |
| `--radius` | radius | `var(--border-radius)` | `unknown` | `teno-web/src/index.css:21` |
| `--active-tab-bg` | surface | `#0f172a` | `#ffffff` | `teno-web/src/index.css:107` |
| `--bg-app` | surface | `#f8fafc` | `#0a0a0a` | `teno-web/src/index.css:94` |
| `--bg-surface` | surface | `#ffffff` | `#141414` | `teno-web/src/index.css:95` |
| `--bg-surface-hover` | surface | `#f1f5f9` | `#1f1f1f` | `teno-web/src/index.css:96` |
| `--color-bg-card` | surface | `var(--bg-surface)` | `unknown` | `teno-web/src/index.css:16` |
| `--color-bg-hover` | surface | `var(--bg-surface-hover)` | `unknown` | `teno-web/src/index.css:17` |
| `--color-bg-main` | surface | `var(--bg-app)` | `unknown` | `teno-web/src/index.css:15` |
| `--active-tab-text` | text | `#ffffff` | `#000000` | `teno-web/src/index.css:108` |
| `--color-text-main` | text | `var(--text-primary)` | `unknown` | `teno-web/src/index.css:18` |
| `--color-text-muted` | text | `var(--text-muted)` | `unknown` | `teno-web/src/index.css:19` |
| `--text-muted` | text | `#64748b` | `#6b7280` | `teno-web/src/index.css:99` |
| `--text-primary` | text | `#0f172a` | `#f8fafc` | `teno-web/src/index.css:97` |
| `--text-secondary` | text | `#334155` | `#cbd5e1` | `teno-web/src/index.css:98` |
| `--text-transform` | text | `none` | `none` | `teno-web/src/index.css:105` |

## Typography tokens

- `--font-main`: `'Fira Code', 'JetBrains Mono', Consolas, monospace` (`teno-web/src/index.css:36`)
- `--font-main`: `'Fira Code', 'JetBrains Mono', Consolas, monospace` (`teno-web/src/index.css:52`)
- `--font-main`: `'Fira Code', 'JetBrains Mono', Consolas, monospace` (`teno-web/src/index.css:68`)
- `--font-main`: `'Plus Jakarta Sans', 'Inter', sans-serif` (`teno-web/src/index.css:84`)
- `--font-main`: `'Plus Jakarta Sans', 'Inter', sans-serif` (`teno-web/src/index.css:103`)
- `--font-weight-ui`: `500` (`teno-web/src/index.css:85`)
- `--font-weight-ui`: `500` (`teno-web/src/index.css:104`)

<!-- BEGIN CUSTOM: contracts -->
<!-- END CUSTOM: contracts -->
