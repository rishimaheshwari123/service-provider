import { useTranslation as useI18nTranslation } from 'react-i18next';

// Custom hook for easier usage throughout the app
export const useTranslation = () => {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const isRTL = () => {
    // Add RTL languages here if needed (Arabic, Hebrew, etc.)
    const rtlLanguages = ['ar', 'he', 'fa'];
    return rtlLanguages.includes(i18n.language);
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isRTL,
    language: i18n.language,
  };
};

export default useTranslation;