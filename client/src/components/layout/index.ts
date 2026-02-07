/**
 * Layout Components
 * Sidebar, Header, Mobile Nav, Navigation Config
 */

export { Header } from "./header";
export { AppSidebar } from "./app-sidebar";
export { MobileBottomNav, MobileModeSwitcher } from "./mobile-nav";
export {
  getNavItems,
  getAllNavItems,
  userNavItems,
  adminNavItems,
  type NavItem,
  type NavSection,
} from "./nav-config";
