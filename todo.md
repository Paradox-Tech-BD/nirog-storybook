# Nirog Software and Access Architecture

- [x] Review current modular-system, identity, profile authorization, security, validation, workflow, and data ownership contracts.
- [x] Research RBAC and policy-based access-control evolution patterns and define the Nirog-specific architecture taxonomy.
- [x] Write the new `docs/nirog/software-access-architecture/` documentation set with modular design, RBAC baseline, validation, audit, and future policy-extension guidance.
- [x] Add a grouped Software and Access Architecture branch to Storybook, build, and visually verify representative diagrams.
- [x] Commit and push the completed architecture library to `main`.

## Verification notes

The native Storybook build completed successfully after the final MDX adjustments on 18 August 2026. The new Software Architecture Overview, RBAC Baseline, Access Control Enforcement, Validation Architecture, and RBAC-to-PBAC Evolution pages render with their grouped navigation, readable MDX content, and Mermaid diagrams in the native preview.

The completed library was committed and pushed to `main` as `b54fde653d3` on 18 August 2026.

## Site visibility and publishing

- [x] Inspect the deployed branch, Storybook source configuration, navigation index, and all presentation-material source files.
- [x] Add or repair Storybook navigation pages so all documentation libraries and presentation materials are visibly discoverable.
- [x] Build and visually verify the complete Storybook site from the canonical source directory.
- [x] Push the visibility update to GitHub `main` and document the correct deployment settings/path.

### Deployment diagnosis

The canonical `main` branch holds the full Nirog documentation library and 65 Storybook pages, including the completed Software and Access Architecture section. The GitHub default branch remains `next`, which is highly divergent and exposes an older, incomplete Storybook set. The site-facing branch must be synchronized from the canonical Nirog source before the deployed Storybook can show all current materials.

The complete `docs/nirog` tree has been mirrored into the `next` deployment branch source as commit `d0a182197b9`, including all Storybook pages, presentation scripts, deck structure, diagrams, architecture libraries, and source-document links. Its native build completed successfully, and the deployment-branch preview now exposes all six Nirog documentation sections in navigation. The Pre-Analysis presentation script and the Technical Analysis presentation-material group, including the overview script and deck structure, are both visible and render correctly in the synchronized Storybook navigation.

The synchronized site-facing branch was pushed to GitHub as `next` at `d0a182197b9`. The canonical documentation branch was pushed as `main` at `806c39476ba`, and the GitHub repository default branch was changed from the incomplete `next` branch to `main` so repository visitors open the current complete library. Hosting should build from `main` with root directory `docs/nirog/pre-analysis/storybook`, install command `pnpm install --frozen-lockfile`, build command `pnpm build-storybook`, and output directory `storybook-static`.
