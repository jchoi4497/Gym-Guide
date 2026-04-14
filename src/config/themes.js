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
    pageBg: 'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900',

    // Navbar
    navBg: 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-700 border-b-2 border-gray-400/50',
    navText: 'text-gray-100',
    navBorder: 'border-gray-200',
    navActive: 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-900 shadow-md border border-gray-400',
    navHover: 'hover:bg-white/10',

    // Cards
    cardBg: 'bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 border border-gray-400/50',
    cardBgSecondary: 'bg-gradient-to-br from-gray-400 to-gray-500',
    cardBorder: 'border border-gray-400/50',
    cardText: 'text-gray-900',
    cardTextSecondary: 'text-gray-700',

    // Buttons - Primary
    btnPrimary: 'bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800 hover:from-gray-500 hover:via-gray-600 hover:to-gray-700 border border-gray-500',
    btnPrimaryText: 'text-white',
    btnPrimaryBorder: 'border border-gray-500',

    // Buttons - Secondary
    btnSecondary: 'bg-gradient-to-br from-gray-400 to-gray-500 hover:from-gray-300 hover:to-gray-400 border border-gray-600',
    btnSecondaryText: 'text-gray-100',

    // Headers
    headerText: 'text-gray-100',
    subheaderText: 'text-gray-200',

    // Inputs
    inputBg: 'bg-gray-50',
    inputBorder: 'border-gray-400',
    inputFocus: 'focus:ring-gray-500 focus:border-gray-500',

    // Stats cards
    statCardBg: 'bg-gradient-to-br from-gray-300 via-gray-200 to-gray-400 border border-gray-400/50',
    statCardHighlight: 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 text-white border border-gray-500',

    // Mobile menu
    mobileMenuBg: 'bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300 border border-gray-400',
    mobileMenuText: 'text-gray-800',
    mobileMenuBorder: 'border-gray-400',
    mobileMenuActive: 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-900 border border-gray-500',
    mobileMenuHover: 'hover:bg-gray-300/50',
  },
};

export const DEFAULT_THEME = 'metallic';

export function getTheme(themeId) {
  return THEMES[themeId] || THEMES[DEFAULT_THEME];
}
