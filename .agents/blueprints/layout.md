# Layout Blueprint

Extracted responsive breakpoints, navigation shells, and mobile viewport constraints.

## Breakpoints

- `Breakpoint: 900px`: evidence `teno-extension/src/index.css:1210`
- `Breakpoint: 1199px`: evidence `teno-extension/src/index.css:220`
- `Breakpoint: 1199px`: evidence `teno-extension/src/index.css:236`
- `Breakpoint: 899px`: evidence `teno-extension/src/index.css:246`
- `Breakpoint: 599px`: evidence `teno-extension/src/index.css:256`
- `Breakpoint: 1024px`: evidence `teno-extension/src/index.css:487`
- `Breakpoint: 768px`: evidence `teno-extension/src/index.css:493`
- `Breakpoint: 520px`: evidence `teno-extension/src/index.css:499`
- `Breakpoint: 600px`: evidence `teno-web/src/index.css:1579`
- `Breakpoint: 900px`: evidence `teno-web/src/index.css:1608`
- `Breakpoint: 679px`: evidence `teno-web/src/index.css:2897`
- `Breakpoint: 768px`: evidence `teno-web/src/index.css:3034`
- `Breakpoint: 480px`: evidence `teno-web/src/index.css:3041`
- `Breakpoint: 1199px`: evidence `teno-web/src/index.css:349`
- `Breakpoint: 1199px`: evidence `teno-web/src/index.css:359`
- `Breakpoint: 899px`: evidence `teno-web/src/index.css:367`
- `Breakpoint: 599px`: evidence `teno-web/src/index.css:379`
- `Breakpoint: 1024px`: evidence `teno-web/src/index.css:673`
- `Breakpoint: 768px`: evidence `teno-web/src/index.css:679`
- `Breakpoint: 520px`: evidence `teno-web/src/index.css:685`

## Navigation shells

- `Navigation Shell: Header` (`teno-web/src/components/Header.jsx:1`)

## Mobile and viewport constraints

- Viewport meta tag: `teno-extension/index.html:5` (`<meta name="viewport" content="width=device-width, initial-scale=1.0" />`)
- Viewport meta tag: `teno-web/index.html:5` (`<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-f`)
- Safe area insets constraint: `teno-web/src/index.css:1173` (`height: calc(28px + env(safe-area-inset-bottom, 0px));`)
- Safe area insets constraint: `teno-web/src/index.css:1181` (`padding: 0 10px env(safe-area-inset-bottom, 0px);`)
- Dynamic viewport unit (dvh): `teno-web/src/index.css:125` (`height: 100dvh;`)
- Dynamic viewport unit (dvh): `teno-web/src/index.css:135` (`height: 100dvh;`)
- Safe area insets constraint: `teno-web/src/index.css:138` (`padding-bottom: env(safe-area-inset-bottom, 0px);`)
- Dynamic viewport unit (dvh): `teno-web/src/index.css:2322` (`max-height: 88dvh;`)
- Safe area insets constraint: `teno-web/src/index.css:310` (`padding-bottom: calc(var(--terminal-active-height, var(--terminal-height)) + 16p`)
- Safe area insets constraint: `teno-web/src/index.css:314` (`Add env(safe-area-inset-bottom) so content doesn't underflow the bar on notched `)
- Safe area insets constraint: `teno-web/src/index.css:316` (`padding-bottom: calc(28px + 14px + env(safe-area-inset-bottom, 0px));`)

<!-- BEGIN CUSTOM: contracts -->
<!-- END CUSTOM: contracts -->
