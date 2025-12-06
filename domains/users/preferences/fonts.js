/**
 * Font management utilities
 */

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
 */
export function applyFont() {
    const savedFont = localStorage.getItem('bl_fontFamily');
    const fontValue = savedFont || availableFonts[0].value;
    document.documentElement.style.setProperty('--font-family', fontValue);
}

/**
 * Get the current font from localStorage
 * @returns {string} Current font value
 */
export function getCurrentFont() {
    const savedFont = localStorage.getItem('bl_fontFamily');
    return savedFont || availableFonts[0].value;
}

/**
 * Attach event listeners to the font dropdown selector
 */
export function attachFontDropdown() {
    const fontSelect = document.getElementById('font-select');
    if (!fontSelect) return;

    // Set current font
    const currentFont = getCurrentFont();
    const currentOption = availableFonts.find(font => font.value === currentFont);
    if (currentOption) {
        fontSelect.value = currentOption.value;
        // Update the select element's font to match the selected option
        fontSelect.style.fontFamily = currentOption.value;
    }

    // Update select font when option changes (for preview)
    fontSelect.addEventListener('change', (e) => {
        const selectedFont = e.target.value;
        const selectedOption = availableFonts.find(font => font.value === selectedFont);
        if (selectedOption) {
            fontSelect.style.fontFamily = selectedOption.value;
        }
        localStorage.setItem('bl_fontFamily', selectedFont);
        applyFont();
    });

    // Update font preview on mouseover for each option
    const options = fontSelect.querySelectorAll('option');
    options.forEach((option, index) => {
        const font = availableFonts[index];
        if (font) {
            option.style.fontFamily = font.value;
        }
    });
}

