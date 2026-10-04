<!-- AI Perfumery Engine; ownership follows the owner's existing agreement. No new licence is granted. -->
# Demo dependency review

Checked locally on 2026-10-04 under rule 86–87, before/with installation. This is a standalone synthetic Next.js demo; no Go/database/library/infrastructure choice is changed. Use `package-lock.json` for exact transitive versions and integrity hashes.

| Direct package | Exact version | Licence | Primary identity / compatibility |
|---|---|---|---|
| next | 16.3.8 | MIT | npm registry package linked to vercel/next.js; Vercel release maintainers; Node >=20.9, React 19 supported |
| react / react-dom | 19.3.0 | MIT | npm packages linked to facebook/react, React release maintainers; react-dom peer React ^19.3 |
| typescript | 5.9.3 | Apache-2.0 | Microsoft TypeScript registry/repository identity; Node >=14.17; a supported stable TS compiler selected instead of untested latest TS 7 |
| @types/react / @types/react-dom | 19.3.0 | MIT | DefinitelyTyped npm definitions matching React 19 |
| @types/node | 24.19.1 | MIT | DefinitelyTyped Node-24 definitions matching locally tested Node 24.18.1 |

Primary references: [Next installation/version requirements](https://nextjs.org/docs/app/getting-started/installation), [Next repository](https://github.com/vercel/next.js), [React repository](https://github.com/facebook/react), [TypeScript registry entry](https://registry.npmjs.org/typescript/5.9.3), [DefinitelyTyped repository](https://github.com/DefinitelyTyped/DefinitelyTyped). Exact npm metadata (`npm view`) was checked for version, licence, engines, dependencies, peers, scripts and maintainer/repository identity, and installed package manifests were reviewed for lifecycle hooks. Local build/typecheck results test compatibility; registry reputation is not treated as chemical/security correctness.

Installation used `npm install --ignore-scripts --no-fund --no-audit`. No downloaded shell script was executed. Installed-package scan found no preinstall/install/postinstall hooks in the installed manifests. Next's Windows SWC binary and optional sharp/platform binary are transitive packages pinned by the lock; non-Windows optional binaries are not used here. React DOM uses the locked scheduler; Next includes PostCSS, caniuse/browser mapping, styled-jsx and SWC helpers. Keep the licence notices shipped inside dependencies, including optional sharp/libvips distribution obligations; this project adds no licence to owner IP.

`npm audit --json` after installation: **0 reported vulnerabilities** (info/low/moderate/high/critical all zero). This is a point-in-time registry audit, not a security certification. No font/image/chart/icon/UI or telemetry service was added. Next telemetry was disabled for the local run/build using `NEXT_TELEMETRY_DISABLED=1`. The demo uses loopback only; no deployment or public sharing was performed.

Generated files (`package-lock.json`, `next-env.d.ts` and `.next/`) retain their generator metadata; adjacent owner headers govern authored project files. `.next/`, installed dependencies and compiler caches are ignored. No fixture data is taken from the owner's confidential dataset or formulas.
