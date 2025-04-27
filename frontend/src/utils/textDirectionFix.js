/**
 * Utility to fix text direction issues in input fields
 * This is particularly useful for bidirectional text issues
 */

// Apply text direction fixes to an input element
export const applyTextDirectionFix = (element) => {
  if (!element) return;

  // Apply multiple text direction fixes
  element.style.direction = 'ltr';
  element.style.textAlign = 'left';
  element.setAttribute('dir', 'ltr');
  element.style.unicodeBidi = 'plaintext';
  element.style.writingMode = 'horizontal-tb';

  // Set data attribute for CSS targeting
  element.setAttribute('data-force-ltr', 'true');

  // For input elements
  if (element.tagName === 'INPUT') {
    // Force LTR for input elements
    element.style.direction = 'ltr !important';
    element.style.textAlign = 'left !important';

    // Try to prevent text inversion by setting the type
    if (element.type !== 'password') {
      element.setAttribute('type', 'text');
    }
  }

  // For textarea elements
  if (element.tagName === 'TEXTAREA') {
    element.style.resize = 'none'; // Prevent resizing which can cause issues
    element.style.direction = 'ltr !important';
    element.style.textAlign = 'left !important';
  }

  // For contentEditable elements
  if (element.getAttribute('contenteditable') === 'true') {
    element.style.unicodeBidi = 'plaintext';
    element.style.direction = 'ltr !important';
    element.style.textAlign = 'left !important';
  }

  // Apply to parent elements
  let parent = element.parentElement;
  for (let i = 0; i < 3 && parent; i++) { // Limit to 3 levels up
    if (parent.classList.contains('MuiInputBase-root') ||
        parent.classList.contains('MuiOutlinedInput-root')) {
      parent.style.direction = 'ltr';
      parent.style.textAlign = 'left';
      parent.setAttribute('dir', 'ltr');
    }
    parent = parent.parentElement;
  }
};

// Add global CSS rules to fix text direction
export const addGlobalTextDirectionFixes = () => {
  const style = document.createElement('style');
  style.innerHTML = `
    /* Global text direction fixes - aggressive approach */
    input, textarea, [contenteditable="true"],
    .MuiInputBase-input, .MuiOutlinedInput-input,
    [data-force-ltr="true"], [dir="ltr"] {
      direction: ltr !important;
      text-align: left !important;
      unicode-bidi: plaintext !important;
      writing-mode: horizontal-tb !important;
    }

    /* Force all text inputs to be LTR */
    .MuiTextField-root, .MuiOutlinedInput-root, .MuiInputBase-root {
      direction: ltr !important;
      text-align: left !important;
    }

    /* Target the specific chat input */
    .message-area-container input,
    .message-area-container textarea,
    .message-area-container .MuiInputBase-input {
      direction: ltr !important;
      text-align: left !important;
      unicode-bidi: plaintext !important;
      writing-mode: horizontal-tb !important;
    }

    /* Override any RTL settings */
    [dir="rtl"] input, [dir="rtl"] textarea, [dir="rtl"] .MuiInputBase-input {
      direction: ltr !important;
      text-align: left !important;
    }
  `;
  document.head.appendChild(style);

  // Return a cleanup function
  return () => {
    document.head.removeChild(style);
  };
};

// Normalize text to ensure consistent direction
export const normalizeText = (text) => {
  if (!text) return '';

  // Add LTR mark at the beginning and end of the text
  // \u200E is the Left-to-Right Mark (LRM)
  // \u202A is the Left-to-Right Embedding (LRE)
  // \u202C is the Pop Directional Formatting (PDF)
  return '\u202A\u200E' + text + '\u200E\u202C';
};

// Export a complete fix function
export const fixTextDirection = (inputRef) => {
  // Add global CSS
  const cleanup = addGlobalTextDirectionFixes();

  // Apply fixes to the input element
  if (inputRef && inputRef.current) {
    applyTextDirectionFix(inputRef.current);
  }

  // Return cleanup function
  return cleanup;
};
