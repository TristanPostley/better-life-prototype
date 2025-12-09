/**
 * Font management utilities
 * 
 * @typedef {import('../types.js').Font} Font
 */

import { STORAGE_KEYS } from '../../../../shared/constants.js';
import { getState, setState } from '../../../state/app-state.js';
import { getDOMElements, clearDOMElementsCache } from '../../../utils/dom-elements.js';

/** @type {Font[]} */
export const availableFonts = [
    { name: 'Helvetica Neue', value: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
    { name: 'Inter', value: "'Inter', sans-serif" },
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Playfair Display', value: "'Playfair Display', serif" },
    { name: 'Merriweather', value: "'Merriweather', serif" },
    { name: 'Source Sans Pro', value: "'Source Sans Pro', sans-serif" },
    { name: 'Raleway', value: "'Raleway', sans-serif" }
];

/**
 * Apply the saved font to the document
 * @returns {void}
 */
export function applyFont() {
    const savedFont = getState('fontFamily');
    const fontValue = savedFont || availableFonts[0].value;
    document.documentElement.style.setProperty('--font-family', fontValue);
}

/**
 * Get the current font from localStorage
 * @returns {string} Current font value
 */
export function getCurrentFont() {
    const savedFont = getState('fontFamily');
    return savedFont || availableFonts[0].value;
}

/**
 * Attach event listeners to the font dropdown selector
 * @returns {void}
 */
export function attachFontDropdown() {
    // Query elements directly from modal body as fallback
    const dom = getDOMElements();
    const modalBody = dom.display.modalBody;
    
    // Try to get font select from cached DOM elements first
    let fontSelect = dom.fontSelect;
    
    // If not found, query directly from modal body
    if (!fontSelect && modalBody) {
        fontSelect = modalBody.querySelector('#font-select');
    }
    
    if (!fontSelect) return;

    // Set current font
    const currentFont = getCurrentFont();
    const currentOption = availableFonts.find(font => font.value === currentFont);
    if (currentOption) {
        fontSelect.value = currentOption.value;
        // Update the select element's font to match the selected option
        fontSelect.style.fontFamily = currentOption.value;
    }

    // Store selected value before cloning
    const selectedValue = fontSelect.value;
    
    // Remove any existing listeners by cloning the element
    const newFontSelect = fontSelect.cloneNode(true);
    newFontSelect.value = selectedValue; // Preserve selected value
    newFontSelect.style.fontFamily = fontSelect.style.fontFamily; // Preserve font style
    fontSelect.parentNode?.replaceChild(newFontSelect, fontSelect);

    // Update select font when option changes (for preview)
    newFontSelect.addEventListener('change', (e) => {
        const selectedFont = e.target.value;
        const selectedOption = availableFonts.find(font => font.value === selectedFont);
        if (selectedOption) {
            newFontSelect.style.fontFamily = selectedOption.value;
        }
        setState('fontFamily', selectedFont);
        applyFont();
    });

    // Update font preview on mouseover for each option
    const options = newFontSelect.querySelectorAll('option');
    options.forEach((option, index) => {
        const font = availableFonts[index];
        if (font) {
            option.style.fontFamily = font.value;
        }
    });
}

