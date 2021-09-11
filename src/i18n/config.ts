import i18n from 'i18next';

import main_en from './en/main.json';
import main_ru from './ru/main.json';

import settings_en from './en/settings.json';
import settings_ru from './ru/settings.json';

import blockly_en from '~/js/utils/blockly/i18n/en/blockly.json';
import blockly_ru from '~/js/utils/blockly/i18n/ru/blockly.json';

export const resources = {
	en: { main: main_en, settings: settings_en, blockly: blockly_en },
    ru: { main: main_ru, settings: settings_ru, blockly: blockly_ru },
} as const;

i18n.init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['main', 'settings', 'blockly'],
    resources,
    // interpolation: {
        // escapeValue: false // react already safes from xss
    // }
});