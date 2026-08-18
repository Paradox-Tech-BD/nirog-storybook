# Nirog Storybook Preview

This folder is a standard, self-contained Storybook workspace inside the completed Nirog general pre-analysis bundle. It provides a live Storybook entry point for the pre-analysis documentation without using the former custom documentation application.

Run `pnpm install` followed by `pnpm storybook` from this directory. The canonical full documentation remains in this `docs/nirog/pre-analysis/` bundle.

## Netlify deployment

The repository-root `netlify.toml` explicitly scopes Netlify to this directory. Netlify installs the dependencies defined here with the committed `pnpm-lock.yaml`, runs `pnpm build-storybook`, and publishes `storybook-static/`. Do not set the Netlify base directory to the repository root: that would make Netlify install the full upstream Storybook Yarn monorepo instead of this independent preview application.

The preview uses pnpm 11. Its required native `esbuild` post-install script is explicitly permitted in `pnpm-workspace.yaml` through `allowBuilds`. This is intentionally limited to `esbuild`; do not replace it with a broad allow-all policy.

## Vercel deployment

This repository is an upstream Storybook **Yarn monorepo** at its repository root, while this preview is a separate **pnpm** application. In the Vercel project, set **Root Directory** to `docs/nirog/pre-analysis/storybook` exactly—without a leading slash and without using the repository root. Then select Node.js 22.x. The committed `vercel.json` in this directory forces the required static Storybook configuration: `pnpm install --frozen-lockfile`, `pnpm build-storybook`, and the `storybook-static` output directory.

If Vercel logs show Yarn, an upstream workspace dependency graph, `Detected Next.js`, or `next build`, the project is still building the repository root rather than this nested documentation application. Those messages are configuration evidence, not dependency problems in the Nirog Storybook app.
