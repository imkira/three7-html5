goog.provide('three7.i18n');
goog.require('goog.locale');
goog.require('goog.string.format');

/**
 * Detect user's selected language
 */
three7.i18n.detectLanguage = function() {
  three7.i18n.language = three7.i18n.currentLanguage();
};

/**
 * Extract user's selected language
 */
three7.i18n.currentLanguage = function() {
  var lang;
  // FIXME: remove this
  //return 'ja';
  if (navigator) {
    if (navigator.language) {
      lang = navigator.language;
    }
    else if (navigator.userLanguage) {
      lang = navigator.userLanguage;
    }
    else if (navigator.browserLanguage) {
      lang = navigator.browserLanguage;
    }
    else if (navigator.systemLanguage) {
      lang = navigator.systemLanguage;
    }
  }
  if (!lang) {
    lang = 'en';
  }
  return goog.locale.getLanguageSubTag(lang);
};

/**
 * Initial list of translations (empty)
 */
three7.i18n.translations = {};

three7.i18n.UNKOWN_TRANSLATION = '???';

/**
 * Register language.
 */
three7.i18n.registerLanguage = function(language) {
  three7.i18n.translations[language.name] = language.translations;
};

/**
 * Get translation for the specified key
 */
three7.i18n.translate = function(key) {
  var k, keys = key.split('.'), lang = three7.i18n.language, translations, args;
  if (!three7.i18n.translations.hasOwnProperty(lang)) {
    lang = 'en';
  }
  translations = three7.i18n.translations[lang];
  for (k = 0, key = keys[0]; k < keys.length - 1; ++k, key = keys[k]) {
    if (!translations.hasOwnProperty(key)) {
      return three7.i18n.UNKOWN_TRANSLATION;
    }
    translations = translations[key];
  }
  if (!translations.hasOwnProperty(key)) {
    return three7.i18n.UNKOWN_TRANSLATION;
  }
  // do interpolation?
  if (arguments.length > 1) {
    args = Array.prototype.slice.call(arguments).slice(1);
    args.unshift(translations[key]);
    return goog.string.format.apply(null, args);
  }
  return translations[key];
};

/**
 * Shorthand method for i18n.translate
 */
three7.i18n.t = three7.i18n.translate;
