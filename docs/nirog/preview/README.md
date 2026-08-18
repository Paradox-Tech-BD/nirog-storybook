# Nirog Storybook Preview

This folder is a standard, self-contained Storybook workspace inside the official Nirog Storybook fork. It provides a live Storybook entry point for the backend documentation without using the former custom documentation application.

Run `pnpm install` followed by `pnpm storybook` from this directory. The canonical full documentation remains in the parent `docs/nirog/` source tree.

## Netlify deployment

The repository-root `netlify.toml` explicitly scopes Netlify to this directory. Netlify installs the dependencies defined here with the committed `pnpm-lock.yaml`, runs `pnpm build-storybook`, and publishes `storybook-static/`. Do not set the Netlify base directory to the repository root: that would make Netlify install the full upstream Storybook Yarn monorepo instead of this independent preview application.

The preview uses pnpm 11. Its required native `esbuild` post-install script is explicitly permitted in `pnpm-workspace.yaml` through `allowBuilds`. This is intentionally limited to `esbuild`; do not replace it with a broad allow-all policy.
