'use strict';

/* TRANSLATIONS */

/**
 * UI strings for multilingual support (IT / EN)
 */
const TRANSLATIONS = {
  it: {
    words: 'Parole',
    paragraphs: 'Paragrafi',
    characters: 'Caratteri',
    bytes: 'Bytes',
    title: 'Dummy Text',
    copyText: 'Copia testo',
    textCopied: 'Testo copiato',
    mode: 'Modalità',
    quantity: 'Quantità',
    madeWith: 'Sviluppata con il supporto di',
    output: 'Output',
    generateText: 'Genera testo'
  },
  en: {
    words: 'Words',
    paragraphs: 'Paragraphs',
    characters: 'Characters',
    bytes: 'Bytes',
    title: 'Dummy Text',
    copyText: 'Copy text',
    textCopied: 'Text copied',
    mode: 'Mode',
    quantity: 'Quantity',
    madeWith: 'Developed with the support of',
    output: 'Output',
    generateText: 'Generate text'
  },
};

/* LOREM WORDS */

/**
 * Base word dictionary used for random text generation
 */
const LOREM_WORDS = `Lorem ipsum dolor sit amet consectetur adipiscing elit
vestibulum at eros sed ligula hendrerit suscipit sed ut perspiciatis
unde omnis iste natus error sit voluptatem quis autem vel eum iure
reprehenderit qui in ea voluptate at vero eos et accusamus et iusto
odio dignissimos ducimus neque porro quisquam est qui dolorem ipsum
quia dolor sit amet duis aute irure dolor in reprehenderit in voluptate
velit esse cillum dolore ut enim ad minim veniam quis nostrud exercitation
ullamco laboris nisi ut aliquip curabitur non nulla sit amet nisl tempus
convallis quis ac lectus`.trim().split(/\s+/).filter(Boolean);

/* APP STATE */
function dummyTextApp() {
  return {

    /* LANGUAGE */

    /**
     * Current language (auto-detected from browser)
     */
    lang: navigator.language.startsWith('it') ? 'it' : 'en',

    /**
     * Active translations object
     */
    get t() {
      return TRANSLATIONS[this.lang];
    },

    /**
     * Toggle between IT and EN languages
     */
    toggleLang() {
      this.lang = this.lang === 'it' ? 'en' : 'it';
    },

    /* MODE */

    /**
     * Selected generation mode
     */
    selectedMode: 'words',

    /**
     * User input quantity
     */
    quantity: 10,

    /**
     * Generated output text
     */
    generatedText: '',

    /**
     * Clipboard copy state
     */
    isCopied: false,

    /**
     * Available generation modes
     */
    modes: [
      {value: 'words', labelKey: 'words'},
      {value: 'paragraphs', labelKey: 'paragraphs'},
      {value: 'characters', labelKey: 'characters'},
      {value: 'bytes', labelKey: 'bytes'},
    ],

    /* CURRENT MODE */

    /**
     * Localized unit for current mode
     */
    get currentModeUnit() {
      return this.t[this.selectedMode] || '';
    },

    /**
     * Maximum allowed value per mode
     */
    get currentMax() {
      const map = {
        words: 500,
        paragraphs: 20,
        characters: 5000,
        bytes: 5000
      };
      return map[this.selectedMode] || 500;
    },

    /**
     * Step increment for UI controls
     */
    get stepAmount() {
      const map = {
        words: 10,
        paragraphs: 1,
        characters: 100,
        bytes: 100
      };
      return map[this.selectedMode] || 10;
    },

    /* PRESETS */

    /**
     * Quick preset values for current mode
     */
    get currentPresets() {
      const map = {
        words: [10, 50, 100, 200],
        paragraphs: [1, 2, 5, 10],
        characters: [100, 500, 1000, 2000],
        bytes: [100, 500, 1000, 2000],
      };
      return map[this.selectedMode] || [10, 50, 100, 200];
    },

    /* STATS */

    /**
     * Output statistics (word and character count)
     */
    get statsLabel() {
      if (!this.generatedText) return '';

      const words = this.generatedText.trim().split(/\s+/).length;
      const chars = this.generatedText.length;

      return `${words} ${this.t.words} · ${chars} ${this.t.characters}`;
    },

    /* RANDOM */

    /**
     * Returns a random word from dictionary
     * @returns {string}
     */
    randWord() {
      return LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];
    },

    /* GENERATORS */

    /**
     * Generates word-based text
     * @param {number} n
     * @returns {string}
     */
    generateWords(n) {
      let words = [];

      for (let i = 0; i < n; i++) {
        words.push(this.randWord());
      }

      // Capitalize first word for readability
      if (words.length > 0) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      }

      return words.join(' ') + '.';
    },

    /**
     * Generates paragraphs
     * @param {number} n
     * @returns {string}
     */
    generateParagraphs(n) {
      let paras = [];

      for (let i = 0; i < n; i++) {
        const len = 30 + Math.floor(Math.random() * 21);
        paras.push(this.generateWords(len));
      }

      return paras.join('\n\n');
    },

    /**
     * Generates character-limited text
     * @param {number} n
     * @returns {string}
     */
    generateCharacters(n) {
      let result = '';

      while (result.length < n) {
        result += this.randWord() + ' ';
      }

      return result.slice(0, n).trim();
    },

    /**
     * Generates ASCII-safe byte-limited string
     * @param {number} n
     * @returns {string}
     */
    generateBytes(n) {
      const text = this.generateCharacters(n * 2);

      const bytes = new TextEncoder().encode(text);

      const ascii = Array.from(bytes)
        .filter(b => b >= 32 && b < 128)
        .slice(0, n);

      return new TextDecoder('ascii').decode(new Uint8Array(ascii));
    },

    /* COPY */

    /**
     * Copies generated text to clipboard (with fallback)
     */
    async copyText() {
      if (!this.generatedText) return;

      try {
        await navigator.clipboard.writeText(this.generatedText);
      } catch {
        // Fallback for browsers without Clipboard API
        const ta = document.createElement('textarea');
        ta.value = this.generatedText;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      this.isCopied = true;

      // Reset UI state after delay
      setTimeout(() => this.isCopied = false, 2600);
    },

    /* GENERATE */

    /**
     * Main generation function based on selected mode
     */
    generate() {
      const n = Math.max(
        1,
        Math.min(parseInt(this.quantity) || 1, this.currentMax)
      );

      this.quantity = n;

      switch (this.selectedMode) {
        case 'words':
          this.generatedText = this.generateWords(n);
          break;

        case 'paragraphs':
          this.generatedText = this.generateParagraphs(n);
          break;

        case 'characters':
          this.generatedText = this.generateCharacters(n);
          break;

        case 'bytes':
          this.generatedText = this.generateBytes(n);
          break;
      }
    },
  };
}
