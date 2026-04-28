export { downloadIG, downloadSpec, loadLocalSpec } from "./downloader.js";
export { type GeneratorOptions, generate } from "./generator.js";
export type { ExtensionModel } from "./model/extension-model.js";
export type {
  DiscriminatorRule,
  DiscriminatorType,
  ProfileModel,
  SliceModel,
} from "./model/profile-model.js";
export type {
  BackboneElementModel,
  PropertyModel,
  ResourceModel,
  ResourceSearchParams,
  SearchParamModel,
} from "./model/resource-model.js";
export { isExtensionSD, parseExtension } from "./parser/extension.js";
export { parseProfile } from "./parser/profile.js";
export { parseSearchParameters } from "./parser/search-parameter.js";
export { parseStructureDefinition } from "./parser/structure-definition.js";
