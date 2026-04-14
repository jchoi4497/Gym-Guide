/**
 * Theme Configuration
 * Defines color schemes for the application
 */

export const THEMES = {
  original: {
    id: 'original',
    name: 'Original Blue',
    description: 'Classic blue and sky theme',

    // Page backgrounds
    pageBg: 'bg-gradient-to-br from-sky-300 to-stone-300',

    // Navbar
    navBg: 'bg-gradient-to-r from-sky-500 to-blue-700',
    navText: 'text-sky-50',
    navBorder: 'border-sky-50',
    navActive: 'bg-sky-50 text-blue-700 shadow-md',
    navHover: 'hover:bg-sky-50/20',

    // Cards
    cardBg: 'bg-white',
    cardBgSecondary: 'bg-blue-50',
    cardBorder: 'border-gray-300',
    cardText: 'text-gray-800',
    cardTextSecondary: 'text-gray-600',

    // Buttons - Primary
    btnPrimary: 'bg-blue-600 hover:bg-blue-700',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: '',

    // Buttons - Secondary
    btnSecondary: 'bg-gray-200 hover:bg-gray-300',
    btnSecondaryText: 'text-gray-700',

    // Headers
    headerText: 'text-gray-800',
    subheaderText: 'text-gray-700',

    // Inputs
    inputBg: 'bg-white',
    inputBorder: 'border-gray-300',
    inputFocus: 'focus:ring-blue-500 focus:border-blue-500',

    // Stats cards
    statCardBg: 'bg-white',
    statCardHighlight: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white',

    // Mobile menu
    mobileMenuBg: 'bg-sky-50',
    mobileMenuText: 'text-blue-700',
    mobileMenuBorder: 'border-blue-100',
    mobileMenuActive: 'bg-blue-100 text-blue-800',
    mobileMenuHover: 'hover:bg-blue-50',
  },

  metallic: {
    id: 'metallic',
    name: 'Metallic Silver',
    description: 'Modern chrome and steel aesthetic',

    // Page backgrounds
    pageBg: 'bg-slate-800',

    // Navbar
    navBg: 'bg-slate-700 border-b-2 border-slate-500 shadow-[0_4px_12px_rgba(0,0,0,0.3)]',
    navText: 'text-slate-100',
    navBorder: 'border-slate-300',
    navActive: 'bg-slate-200 text-slate-900 shadow-[0_2px_8px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.3)] border-t border-l border-slate-100 border-b border-r border-b-slate-400 border-r-slate-400',
    navHover: 'hover:bg-slate-600',

    // Cards - Beveled metal plate effect
    cardBg: 'bg-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.2)] border-t border-l border-slate-300 border-b-2 border-r-2 border-b-slate-500 border-r-slate-500',
    cardBgSecondary: 'bg-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),inset_0_-1px_0_rgba(255,255,255,0.3)] border-t border-l border-slate-200 border-b border-r border-b-slate-400 border-r-slate-400',
    cardBorder: 'border-slate-400',
    cardText: 'text-slate-900',
    cardTextSecondary: 'text-slate-700',

    // Buttons - Primary (pressed metal button)
    btnPrimary: 'bg-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-slate-600 border-b-2 border-r-2 border-b-slate-800 border-r-slate-800 hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] active:translate-y-0.5',
    btnPrimaryText: 'text-slate-100',
    btnPrimaryBorder: 'border-slate-500',

    // Buttons - Secondary (light metal button)
    btnSecondary: 'bg-slate-300 shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.3)] border-t border-l border-slate-200 border-b-2 border-r-2 border-b-slate-500 border-r-slate-500 hover:shadow-[0_6px_16px_rgba(0,0,0,0.4)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] active:translate-y-0.5',
    btnSecondaryText: 'text-slate-800',

    // Headers
    headerText: 'text-slate-100 drop-shadow-[0_2px_3px_rgba(0,0,0,0.3)]',
    subheaderText: 'text-slate-200',

    // Inputs - Inset effect
    inputBg: 'bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]',
    inputBorder: 'border-slate-400',
    inputFocus: 'focus:ring-2 focus:ring-slate-500 focus:border-slate-600',

    // Stats cards
    statCardBg: 'bg-slate-200 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.5),inset_0_-1px_0_rgba(0,0,0,0.2)] border-t border-l border-slate-300 border-b-2 border-r-2 border-b-slate-500 border-r-slate-500',
    statCardHighlight: 'bg-slate-700 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] border-t border-l border-slate-600 border-b-2 border-r-2 border-b-slate-800 border-r-slate-800',

    // Mobile menu
    mobileMenuBg: 'bg-slate-100 shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.5)] border-t border-l border-slate-200 border-b-2 border-r-2 border-b-slate-400 border-r-slate-400',
    mobileMenuText: 'text-slate-800',
    mobileMenuBorder: 'border-slate-400',
    mobileMenuActive: 'bg-slate-300 text-slate-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] border-t border-l border-slate-200 border-b border-r border-b-slate-500 border-r-slate-500',
    mobileMenuHover: 'hover:bg-slate-200',
  },
};

export const DEFAULT_THEME = 'metallic';

export function getTheme(themeId) {
  return THEMES[themeId] || THEMES[DEFAULT_THEME];
}
