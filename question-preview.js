/**
 * Question Preview Module (Schema v5.1)
 * Shared preview rendering logic for assessment questions
 * Used by: assessment-authoring-tool.html, assessment-selection-tool.html
 * 
 * This module provides a high-level preview function that:
 * - Applies container styles (font, size, line height) from question.data.style
 * - Delegates to renderQuestionHTML from question-renderer.js
 * - Supports tool-specific customization via options
 * 
 * Dependencies (must be loaded before this script):
 * - question-renderer.js (provides renderQuestionHTML, formatRichText, etc.)
 */

// =====================================================
// CONSTANTS
// =====================================================

const PREVIEW_DEFAULTS = {
    fontFamily: 'Noto Sans, sans-serif',
    fontSize: '11pt',
    lineHeight: '1.5'
};

// =====================================================
// MAIN PREVIEW FUNCTION
// =====================================================

/**
 * Render a question preview into a container element
 * 
 * @param {Object} question - Question object in v5.1 format
 * @param {HTMLElement} container - DOM element to render into
 * @param {Object} options - Rendering options
 * @param {Function} options.imageResolver - Function(imageId) => URL or null
 * @param {boolean} options.interactive - Enable resize handles for images (default: false)
 * @param {string} options.questionNumber - Display number/ID for the question
 * @param {boolean} options.showMarks - Show marks badge (default: false)
 * @param {boolean} options.applyContainerStyles - Apply font styles to container (default: true)
 * @param {string} options.fontFamily - Override font (e.g. from toolbar; takes precedence over question style)
 * @param {string} options.fontSize - Override font size (e.g. from toolbar)
 * @param {string} options.wrapperClass - CSS class for the wrapper div (default: 'q-preview')
 * @returns {string} The rendered HTML (also sets container.innerHTML)
 * 
 * @example
 * // Authoring tool - with interactive images
 * renderPreviewToContainer(question, container, {
 *     imageResolver: (id) => uploadedImages[id],
 *     interactive: true,
 *     questionNumber: question.id
 * });
 * 
 * @example
 * // Selection tool - read-only preview
 * renderPreviewToContainer(question, container, {
 *     imageResolver: (id) => null,
 *     questionNumber: '1',
 *     showMarks: true
 * });
 */
function renderPreviewToContainer(question, container, options = {}) {
    if (!question || !container) return '';
    
    const {
        imageResolver = () => null,
        interactive = false,
        questionNumber = question.id || '1',
        showMarks = false,
        applyContainerStyles = true,
        fontFamily: optionsFontFamily = null,
        fontSize: optionsFontSize = null,
        wrapperClass = 'q-preview'
    } = options;
    
    try {
        // Apply container styles: toolbar overrides (fontFamily, fontSize) take precedence, then question.data.style, then defaults
        if (applyContainerStyles) {
            const style = question.data?.style || {};
            container.style.fontFamily = optionsFontFamily ?? style.font_family ?? PREVIEW_DEFAULTS.fontFamily;
            container.style.fontSize = optionsFontSize ?? style.font_size ?? PREVIEW_DEFAULTS.fontSize;
            container.style.lineHeight = style.line_height || PREVIEW_DEFAULTS.lineHeight;
        }
        
        // Use shared renderQuestionHTML from question-renderer.js
        const html = renderQuestionHTML(question, {
            questionNumber,
            showMarks,
            imageResolver,
            interactive
        });
        
        // Wrap in container div with specified class (or no wrapper if empty)
        const wrappedHtml = wrapperClass ? `<div class="${wrapperClass}">${html}</div>` : html;
        container.innerHTML = wrappedHtml;
        
        return wrappedHtml;
    } catch (error) {
        console.error('Error rendering question preview:', error, question);
        container.innerHTML = `<div class="p-error" style="color: red; padding: 1rem;">
            <strong>Error rendering question ${questionNumber}:</strong><br>
            ${error.message}
        </div>`;
        return '';
    }
}

/**
 * Render a question to HTML string without a container
 * Useful when you need the HTML but not container styling
 * 
 * @param {Object} question - Question object in v5.1 format
 * @param {Object} options - Same options as renderPreviewToContainer (except applyContainerStyles)
 * @returns {string} The rendered HTML
 */
function renderPreviewHTML(question, options = {}) {
    if (!question) return '';
    
    const {
        imageResolver = () => null,
        interactive = false,
        questionNumber = question.id || '1',
        showMarks = false,
        wrapperClass = 'q-preview'
    } = options;
    
    const html = renderQuestionHTML(question, {
        questionNumber,
        showMarks,
        imageResolver,
        interactive
    });
    
    return wrapperClass ? `<div class="${wrapperClass}">${html}</div>` : html;
}

/**
 * Apply default preview styles to a container without rendering
 * Useful when you want to style a container but render content separately
 * 
 * @param {HTMLElement} container - DOM element to style
 * @param {Object} question - Question object (optional, uses its style if provided)
 */
function applyPreviewStyles(container, question = null) {
    if (!container) return;
    
    const style = question?.data?.style || {};
    container.style.fontFamily = style.font_family || PREVIEW_DEFAULTS.fontFamily;
    container.style.fontSize = style.font_size || PREVIEW_DEFAULTS.fontSize;
    container.style.lineHeight = style.line_height || PREVIEW_DEFAULTS.lineHeight;
}

/**
 * Get the default preview styles
 * @returns {Object} { fontFamily, fontSize, lineHeight }
 */
function getPreviewDefaults() {
    return { ...PREVIEW_DEFAULTS };
}
