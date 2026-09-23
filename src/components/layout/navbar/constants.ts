export const NAV_LINK_KEYS = ['home', 'about', 'projects', 'experience', 'certificates', 'contact'] as const;
export type NavLinkKey = (typeof NAV_LINK_KEYS)[number];

export const NAV_LINK_PATHS: Record<NavLinkKey, string> = {
  home: '/',
  about: '/about',
  projects: '/projects',
  experience: '/experience',
  certificates: '/certificates',
  contact: '/contact',
};