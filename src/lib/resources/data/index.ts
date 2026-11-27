/**
 * Every listing, grouped by the county it serves.
 *
 * Entries live in one file per county so that adding a state, or reviewing Brevard
 * without reading Volusia, does not mean opening a single 1,500-line array.
 */

import type { Resource } from "../types";
// Re-exported as well as imported: the validator checks the per-county split adds up
// to ALL_RESOURCES, and tooling otherwise has to reach past this barrel to see them.
export { BREVARD_RESOURCES } from "./brevard";
export { VOLUSIA_RESOURCES } from "./volusia";
export { ORANGE_RESOURCES } from "./orange";
export { STATEWIDE_RESOURCES } from "./statewide";
export { IMPORT_FINDHELP_EXPANDED } from "./import-findhelp-expanded";
export { IMPORT_SERVICES_EXPANDED } from "./import-services-expanded";

import { BREVARD_RESOURCES } from "./brevard";
import { VOLUSIA_RESOURCES } from "./volusia";
import { ORANGE_RESOURCES } from "./orange";
import { STATEWIDE_RESOURCES } from "./statewide";
import { IMPORT_FINDHELP_EXPANDED } from "./import-findhelp-expanded";
import { IMPORT_SERVICES_EXPANDED } from "./import-services-expanded";
import { RESEARCH_ADDITIONS, RESEARCH_OVERRIDES } from "./research-overrides";

const BASE_RESOURCES: Resource[] = [
  ...BREVARD_RESOURCES,
  ...VOLUSIA_RESOURCES,
  ...ORANGE_RESOURCES,
  ...STATEWIDE_RESOURCES,
  ...IMPORT_FINDHELP_EXPANDED,
  ...IMPORT_SERVICES_EXPANDED,
];

// Reviewed corrections and notes override the bulk import. Keeping them in
// one file makes the classification fixes auditable without editing 40 entries
// scattered through the generated import files.
export const ALL_RESOURCES: Resource[] = [
  ...BASE_RESOURCES.map((resource) => {
    const override = RESEARCH_OVERRIDES[resource.id];
    return override ? { ...resource, ...override } : resource;
  }),
  ...RESEARCH_ADDITIONS,
];
