import React from 'react';
import { useTranslation } from 'react-i18next';

interface TranslatedTextProps {
  translationKey: string;
  fallback?: string;
  values?: Record<string, any>;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({
  translationKey,
  fallback,
  values,
  className,
  as: Component = 'span'
}) => {
  const { t } = useTranslation();
  
  return (
    <Component className={className}>
      {t(translationKey, fallback, values)}
    </Component>
  );
};

export default TranslatedText;