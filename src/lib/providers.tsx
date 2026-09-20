// Barrel re-export for backward compatibility.
// Prefer direct imports: PublicProviders from "./public-providers" (home page
// critical path) and LazyProviders/Providers from "./lazy-providers" (below-fold
// / non-home routes) so heavy providers never leak into the home client bundle.
export { PublicProviders } from "./public-providers";
export { LazyProviders, Providers } from "./lazy-providers";