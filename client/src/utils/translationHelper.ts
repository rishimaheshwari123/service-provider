// Translation Helper Utility
// Use this to quickly add translations to any component

import { useTranslation } from 'react-i18next';

// Common translation patterns
export const useCommonTranslations = () => {
  const { t } = useTranslation();
  
  return {
    // Navigation
    home: t('nav.home'),
    about: t('nav.about'),
    services: t('nav.services'),
    contact: t('nav.contact'),
    login: t('nav.login'),
    
    // Common actions
    save: t('common.save'),
    cancel: t('common.cancel'),
    submit: t('common.submit'),
    loading: t('common.loading'),
    search: t('common.search'),
    
    // Form labels
    email: t('pages.login.email'),
    password: t('pages.login.password'),
    name: t('forms.placeholders.enterName'),
    phone: t('forms.placeholders.enterPhone'),
    
    // Messages
    success: t('common.success'),
    error: t('common.error'),
    
    // Helper function to get page-specific translations
    getPageTranslation: (page: string, key: string, fallback?: string) => 
      t(`pages.${page}.${key}`, fallback),
  };
};

// Quick translation function for inline use
export const quickTranslate = (key: string, fallback?: string) => {
  const { t } = useTranslation();
  return t(key, fallback);
};

// Translation keys reference for developers
export const TRANSLATION_KEYS = {
  NAV: {
    HOME: 'nav.home',
    ABOUT: 'nav.about',
    SERVICES: 'nav.services',
    CONTACT: 'nav.contact',
    LOGIN: 'nav.login',
  },
  COMMON: {
    SAVE: 'common.save',
    CANCEL: 'common.cancel',
    LOADING: 'common.loading',
    SUCCESS: 'common.success',
    ERROR: 'common.error',
  },
  PAGES: {
    HOME: {
      TITLE: 'pages.home.title',
      SUBTITLE: 'pages.home.subtitle',
    },
    CONTACT: {
      TITLE: 'pages.contact.title',
      GET_IN_TOUCH: 'pages.contact.getInTouch',
    },
  },
} as const;