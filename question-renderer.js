/**
 * Question Renderer Module (Schema v4.9)
 * Shared UX rendering logic for assessment questions
 * Used by: assessment-authoring-tool.html, assessment-selection-tool.html
 * 
 * This module provides functions to:
 * - Render RichText content (Markdown, LaTeX math, image tokens, gaps)
 * - Generate HTML preview for all question types
 * - Handle type-specific rendering (MCQ, FIB, MATCH, SUBJECTIVE, TABLE, COMPOSITE)
 * 
 * Dependencies (must be loaded before this script):
 * - KaTeX (for LaTeX math rendering)
 * - marked.js (for Markdown rendering)
 */

// =====================================================
// CONSTANTS
// =====================================================

const DEFAULT_GAP_WIDTH = '60px';  // Used for [[gap]] without explicit width
const BORDER_COLOR = '#d1d5db';

// =====================================================
// RICH TEXT PROCESSING
// =====================================================

/**
 * Render LaTeX math using KaTeX
 * Supports $...$ for inline and $$...$$ for display math
 * @param {string} text - Text containing LaTeX math
 * @returns {string} Text with rendered math HTML
 */
function renderLatexMath(text) {
    if (!text || typeof katex === 'undefined') return text;
    
    // Render display math first ($$...$$)
    text = text.replace(/\$\$([^$]+)\$\$/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), { displayMode: true, throwOnError: false });
        } catch (e) {
            console.warn('KaTeX display error:', e);
            return match;
        }
    });
    
    // Render inline math ($...$) - be careful not to match $$
    text = text.replace(/\$([^$]+)\$/g, (match, math) => {
        try {
            return katex.renderToString(math.trim(), { displayMode: false, throwOnError: false });
        } catch (e) {
            console.warn('KaTeX inline error:', e);
            return match;
        }
    });
    
    return text;
}

/**
 * Render Markdown using marked.js
 * @param {string} text - Text containing Markdown
 * @returns {string} Text with rendered Markdown HTML
 */
function renderMarkdown(text) {
    if (!text || typeof marked === 'undefined') return text;
    
    try {
        // Configure marked for inline rendering (no wrapping <p> tags for simple text)
        marked.setOptions({
            breaks: true,  // Convert \n to <br>
            gfm: true      // GitHub Flavored Markdown
        });
        
        // Use parseInline for text that shouldn't be wrapped in <p>
        return marked.parseInline(text);
    } catch (e) {
        console.warn('Marked error:', e);
        return text;
    }
}

/**
 * Parse image tag content to extract id and dimensions
 * Format: "id" or "id|height:H|width:W"
 * @param {string} tag - Tag content (without [[image: prefix]])
 * @returns {Object} { id, width, height }
 */
function parseImageTag(tag) {
    // Remove 'image:' prefix if present (for backwards compatibility)
    let cleanTag = tag;
    if (tag.startsWith('image:')) {
        cleanTag = tag.substring(6);
    }
    const parts = cleanTag.split('|');
    const result = { id: parts[0], width: null, height: null };
    
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i].trim();
        if (part.startsWith('width:')) {
            result.width = parseInt(part.substring(6));
        } else if (part.startsWith('height:')) {
            result.height = parseInt(part.substring(7));
        }
    }
    return result;
}

/**
 * Format RichText content for display
 * Handles: [[image:...]] tokens, [[gap]] tokens, legacy ______ blanks, LaTeX math, Markdown
 * Both [[gap]] and ______ render with uniform styling using the .p-gap class
 * @param {string} text - RichText content
 * @param {Object} options - Rendering options
 * @param {Function} options.imageResolver - Function(imageId) => URL or null
 * @param {boolean} options.interactive - Enable resize handles for images (default: false)
 * @returns {string} HTML string
 */
function formatRichText(text, options = {}) {
    if (!text) return '';
    
    const imageResolver = options.imageResolver || (() => null);
    const interactive = options.interactive || false;
    
    let result = text;
    
    // Step 1: Protect custom tokens with Unicode placeholders (won't be affected by Markdown/LaTeX)
    // Using Unicode private-use characters as delimiters: \uE000 and \uE001
    const imagePlaceholders = [];
    const gapPlaceholders = [];
    
    // Handle image tokens [[image:id]] or [[image:id|height:H|width:W]]
    result = result.replace(/\[\[image:([^\]]+)\]\]/g, (match, tagContent) => {
        const parsed = parseImageTag(tagContent);
        const imageId = parsed.id;
        const imageUrl = imageResolver(imageId);
        
        let replacement;
        if (imageUrl) {
            let imgStyle = '';
            if (parsed.width) imgStyle += `width:${parsed.width}px;`;
            if (parsed.height) imgStyle += `height:${parsed.height}px;`;
            if (!parsed.width && !parsed.height) imgStyle = 'max-width:100%; max-height:200px;';
            
            if (interactive) {
                const tooltipText = (parsed.width && parsed.height) 
                    ? `${parsed.width} × ${parsed.height}` 
                    : 'Drag to resize';
                
                replacement = `<div class="p-asset-resizable" data-tag="${tagContent}">
                    <img src="${imageUrl}" alt="${imageId}" style="${imgStyle}">
                    <div class="resize-handle resize-handle-se" onmousedown="initImageResize(event, 'se', this.parentElement)"></div>
                    <div class="resize-handle resize-handle-e" onmousedown="initImageResize(event, 'e', this.parentElement)"></div>
                    <div class="resize-handle resize-handle-s" onmousedown="initImageResize(event, 's', this.parentElement)"></div>
                    <div class="size-tooltip">${tooltipText}</div>
                    <button class="reset-size-btn" onclick="resetImageSize(event, '${imageId}')" title="Reset to default size">×</button>
                </div>`;
            } else {
                replacement = `<div class="p-asset"><img src="${imageUrl}" alt="${imageId}" style="${imgStyle}"></div>`;
            }
        } else {
            replacement = `<div class="p-asset-placeholder">[Image: ${imageId}]</div>`;
        }
        
        const placeholder = `\uE000IMG${imagePlaceholders.length}\uE001`;
        imagePlaceholders.push(replacement);
        return placeholder;
    });
    
    // Handle [[gap]] or [[gap|width:<integer>]] placeholders for FIB
    result = result.replace(/\[\[gap(?:\|width:(\d+))?\]\]/g, (match, widthParam) => {
        const width = widthParam ? `${widthParam}px` : DEFAULT_GAP_WIDTH;
        const replacement = `<span class="p-gap" style="width:${width};">&nbsp;</span>`;
        const placeholder = `\uE000GAP${gapPlaceholders.length}\uE001`;
        gapPlaceholders.push(replacement);
        return placeholder;
    });
    
    // Handle legacy underscore blanks (______ or more) - render same as [[gap]] for uniform styling
    // Only process if no [[gap]] tokens present (to avoid double processing)
    if (!text.includes('[[gap')) {
        result = result.replace(/_{2,}/g, (match) => {
            // Scale width based on number of underscores (roughly 10px per underscore, min 60px)
            const width = Math.max(60, match.length * 10) + 'px';
            const replacement = `<span class="p-gap" style="width:${width};">&nbsp;</span>`;
            const placeholder = `\uE000GAP${gapPlaceholders.length}\uE001`;
            gapPlaceholders.push(replacement);
            return placeholder;
        });
    }
    
    // Step 2: Render LaTeX math (before Markdown to preserve math formatting)
    result = renderLatexMath(result);
    
    // Step 3: Render Markdown
    result = renderMarkdown(result);
    
    // Step 4: Restore placeholders (custom tags are now safely rendered)
    imagePlaceholders.forEach((html, i) => {
        result = result.replace(`\uE000IMG${i}\uE001`, html);
    });
    gapPlaceholders.forEach((html, i) => {
        result = result.replace(`\uE000GAP${i}\uE001`, html);
    });
    
    return result;
}

// =====================================================
// TABLE UTILITIES
// =====================================================

/**
 * Get cell border style based on grid lines setting and position
 * @param {string} gridLines - 'all', 'none', 'horizontal', 'vertical'
 * @param {boolean} isFirstCol - Is this the first column?
 * @param {boolean} isLastCol - Is this the last column?
 * @param {boolean} isFirstRow - Is this the first row?
 * @param {boolean} isLastRow - Is this the last row?
 * @returns {string} CSS style string
 */
function getCellBorderStyle(gridLines, isFirstCol, isLastCol, isFirstRow, isLastRow) {
    switch (gridLines) {
        case 'none':
            // No internal borders, but keep outer edges
            return `border: none; ${isFirstCol ? `border-left: 1px solid ${BORDER_COLOR};` : ''} ${isLastCol ? `border-right: 1px solid ${BORDER_COLOR};` : ''} ${isFirstRow ? `border-top: 1px solid ${BORDER_COLOR};` : ''} ${isLastRow ? `border-bottom: 1px solid ${BORDER_COLOR};` : ''}`;
        case 'horizontal':
            // Horizontal lines only + left/right outer edges
            return `border-top: 1px solid ${BORDER_COLOR}; border-bottom: 1px solid ${BORDER_COLOR}; border-left: ${isFirstCol ? `1px solid ${BORDER_COLOR}` : 'none'}; border-right: ${isLastCol ? `1px solid ${BORDER_COLOR}` : 'none'};`;
        case 'vertical':
            // Vertical lines only + top/bottom outer edges
            return `border-left: 1px solid ${BORDER_COLOR}; border-right: 1px solid ${BORDER_COLOR}; border-top: ${isFirstRow ? `1px solid ${BORDER_COLOR}` : 'none'}; border-bottom: ${isLastRow ? `1px solid ${BORDER_COLOR}` : 'none'};`;
        case 'all':
        default:
            return '';
    }
}

// =====================================================
// TYPE-SPECIFIC PREVIEW RENDERERS
// =====================================================

/**
 * Render MCQ options
 * @param {Object} data - MCQ data object
 * @param {Object} renderOptions - Rendering options (passed to formatRichText)
 * @returns {string} HTML string
 */
function renderMCQPreview(data, renderOptions) {
    if (!data.options || data.options.length === 0) return '';
    
    const optLayout = data.style?.options_layout || 'vertical';
    const isHorizontal = optLayout === 'horizontal';
    const numOptions = data.options.length;
    
    const optItems = data.options.map((opt, k) => {
        const optText = opt.text || '';
        const optId = opt.id || String.fromCharCode(65 + k); // A, B, C, D...
        
        // For horizontal layout, give each option enough width so words don't break mid-word
        let itemStyle, textStyle;
        if (isHorizontal) {
            // Let each option be at least as wide as its content (so "Stomach" stays on one line); flex-wrap handles wrapping
            itemStyle = 'display:flex; align-items:flex-start; flex-shrink:0; min-width:min-content;';
            // Keep words intact; no overflow:hidden so whole words can wrap to next line
            textStyle = 'word-break:keep-all; overflow-wrap:normal; overflow:visible; white-space:normal;';
        } else {
            itemStyle = 'display:flex; align-items:flex-start; margin-bottom:4px;';
            textStyle = '';
        }
        
        return `<div class="p-option-item" style="${itemStyle}">
            <span class="p-option-id" style="margin-right:0.25px; flex-shrink:0;">(${optId})</span>
            <div class="p-option-text" style="${textStyle}">${formatRichText(optText, renderOptions)}</div>
        </div>`;
    }).join('');
    
    // For horizontal: flex-wrap ensures items wrap, gap provides spacing
    // For vertical: flex-direction:column stacks items
    // margin:0 and padding:0 ensure options align with parent content (no extra indentation)
    const containerStyle = isHorizontal 
        ? 'display:flex; flex-wrap:wrap; gap:1rem; align-items:flex-start; margin:0; padding:0;'
        : 'display:flex; flex-direction:column; margin:0; padding:0;';
    
    return `<div class="p-options" style="${containerStyle}">${optItems}</div>`;
}

/**
 * Render FIB word bank
 * @param {Object} data - FIB data object
 * @returns {string} HTML string
 */
function renderFIBPreview(data) {
    if (!data.options_pool || data.options_pool.length === 0) return '';
    
    const wordItems = data.options_pool.map(word => 
        `<span class="p-word-bank-item">${word}</span>`
    ).join('');
    
    return `<div style="display:flex; justify-content:center;"><div class="p-word-bank" style="width:90%;">${wordItems}</div></div>`;
}

/**
 * Render MATCH pairs
 * @param {Object} data - MATCH data object
 * @param {Object} renderOptions - Rendering options (passed to formatRichText)
 * @returns {string} HTML string
 */
function renderMatchPreview(data, renderOptions) {
    if (!data.pairs || data.pairs.length === 0) return '';
    
    const leftItems = data.pairs.map((p, i) => 
        `<div class="p-pairs-item">
            <span class="p-pairs-item-id">${i + 1}.</span>
            ${formatRichText(p.left, renderOptions)}
        </div>`
    ).join('');
    
    const rightItems = data.pairs.map((p, i) => 
        `<div class="p-pairs-item">
            <span class="p-pairs-item-id">${String.fromCharCode(65 + i)}.</span>
            ${formatRichText(p.right, renderOptions)}
        </div>`
    ).join('');
    
    return `
        <div class="p-pairs-wrapper">
            <div class="p-pairs-container">
                <div class="p-pairs-column">
                    <div class="p-pairs-header">Column A</div>
                    ${leftItems}
                </div>
                <div class="p-pairs-column">
                    <div class="p-pairs-header">Column B</div>
                    ${rightItems}
                </div>
            </div>
        </div>`;
}

/**
 * Render TABLE grid
 * @param {Object} data - TABLE data object
 * @param {Object} renderOptions - Rendering options (passed to formatRichText)
 * @returns {string} HTML string
 */
function renderTablePreview(data, renderOptions) {
    if (!data.table || !data.table.rows) return '';
    
    const tableStyle = data.style || {};
    const gridLines = tableStyle.table_grid_lines || 'all';
    const hideHeader = tableStyle.hide_header === true;
    const columnWidths = tableStyle.column_widths || [];
    
    const tableData = data.table;
    const header = tableData.header || [];
    const rows = tableData.rows || [];
    const numRows = rows.length;
    const numCols = Math.max(header.length, rows[0]?.length || 0);
    
    // Build colgroup for column widths
    let colgroupHtml = '';
    if (columnWidths.length > 0) {
        const colItems = [];
        for (let c = 0; c < numCols; c++) {
            const colWidth = columnWidths[c] || '';
            colItems.push(`<col ${colWidth ? `style="width:${colWidth}"` : ''}>`);
        }
        colgroupHtml = `<colgroup>${colItems.join('')}</colgroup>`;
    }
    
    // Build table header row (only if header exists and not hidden)
    let theadHtml = '';
    if (header.length > 0 && !hideHeader) {
        const headerCellsHtml = header.map((cell, colIdx) => {
            const isFirstCol = colIdx === 0;
            const isLastCol = colIdx === numCols - 1;
            const cellStyle = getCellBorderStyle(gridLines, isFirstCol, isLastCol, true, false);
            return `<th style="${cellStyle}">${formatRichText(cell || '', renderOptions)}</th>`;
        }).join('');
        theadHtml = `<thead><tr>${headerCellsHtml}</tr></thead>`;
    }
    
    // Build table rows
    const tableRows = rows.map((row, rowIdx) => {
        const isFirstRow = (header.length === 0 || hideHeader) && rowIdx === 0;
        const isLastRow = rowIdx === numRows - 1;
        
        const rowCells = (row || []).map((cell, colIdx) => {
            const isFirstCol = colIdx === 0;
            const isLastCol = colIdx === (row.length - 1);
            const cellStyle = getCellBorderStyle(gridLines, isFirstCol, isLastCol, isFirstRow, isLastRow);
            return `<td style="${cellStyle}">${formatRichText(cell || '', renderOptions)}</td>`;
        }).join('');
        
        return `<tr>${rowCells}</tr>`;
    }).join('');
    
    return `
        <div class="p-table-container" style="width: 100%;">
            <table class="p-table-grid" style="border-collapse: collapse; width: 90%;">
                ${colgroupHtml}
                ${theadHtml}
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
        </div>`;
}

/**
 * Get shared options pool from COMPOSITE FIB sub-questions (if they all share the same pool)
 * @param {Object} data - COMPOSITE data object
 * @returns {Array|null} Shared options pool or null if not shared
 */
function getSharedOptionsPool(data) {
    if (!data.sub_questions || data.sub_questions.length === 0) return null;
    
    const fibSubQuestions = data.sub_questions.filter(sq => 
        sq.type === 'FIB' && sq.data?.options_pool?.length > 0
    );
    
    if (fibSubQuestions.length > 1) {
        const firstPool = JSON.stringify(fibSubQuestions[0].data.options_pool.slice().sort());
        const allSame = fibSubQuestions.every(sq => 
            JSON.stringify(sq.data.options_pool.slice().sort()) === firstPool
        );
        if (allSame) {
            return fibSubQuestions[0].data.options_pool;
        }
    }
    
    return null;
}

/**
 * Render COMPOSITE sub-questions
 * @param {Object} data - COMPOSITE data object
 * @param {Object} renderOptions - Rendering options (passed to formatRichText)
 * @returns {string} HTML string
 */
function renderCompositePreview(data, renderOptions) {
    if (!data.sub_questions || data.sub_questions.length === 0) return '';
    
    // Check if all FIB sub-questions share the same options_pool
    const sharedOptionsPool = getSharedOptionsPool(data);
    const hasSharedOptionsPool = sharedOptionsPool !== null;
    
    const subLayout = data.style?.sub_questions_layout || 'vertical';
    
    const subs = data.sub_questions.map((sq, i) => {
        const label = sq.id || String.fromCharCode(97 + i);
        const sqData = sq.data || {};
        const sqContent = sqData.content || '';
        
        // Sub-question options for MCQ
        let optHtml = '';
        if (sq.type === 'MCQ' && sqData.options && sqData.options.length > 0) {
            optHtml = renderMCQPreview(sqData, renderOptions);
        }
        
        // FIB options_pool as word bank - only show if NOT using shared pool
        let sqWordBank = '';
        if (sq.type === 'FIB' && sqData.options_pool && sqData.options_pool.length > 0 && !hasSharedOptionsPool) {
            sqWordBank = renderFIBPreview(sqData);
        }
        
        // TABLE type for sub-questions
        let sqTableHtml = '';
        if (sq.type === 'TABLE' && sqData.table && sqData.table.rows) {
            sqTableHtml = renderTablePreview(sqData, renderOptions);
        }
        
        // MATCH type for sub-questions
        let sqMatchHtml = '';
        if (sq.type === 'MATCH' && sqData.pairs && sqData.pairs.length > 0) {
            sqMatchHtml = renderMatchPreview(sqData, renderOptions);
        }
        
        // Structure: label is separate, content is in a flex container
        // Options should align with content text, not the label
        // Use margin-left:0 and padding-left:0 to ensure options align with content
        // Check if content has tags (image, gap, etc.) or if there's type-specific content
        const hasTagsOrContent = sqContent.includes('[[') || optHtml || sqTableHtml || sqMatchHtml || sqWordBank;
        const renderedContent = formatRichText(sqContent, renderOptions);
        const contentDisplay = renderedContent || (hasTagsOrContent ? '' : '<em style="color:#999;">No text</em>');
        
        const contentHtml = `
            <div class="p-sub-content" style="flex:1; min-width:0;">
                ${contentDisplay ? `<div>${contentDisplay}</div>` : ''}
                ${optHtml ? `<div style="margin-top:8px; margin-left:0; padding-left:0;">${optHtml}</div>` : ''}
                ${sqTableHtml}
                ${sqMatchHtml}
                ${sqWordBank}
            </div>`;
        
        // Use flex layout for sub-item to ensure proper alignment
        return `<div class="p-sub-item" style="display:flex; align-items:flex-start; margin-bottom:8px;">
            <span class="p-sub-label" style="flex-shrink:0; margin-right:0.25px; font-weight:500;">${label}.</span>
            ${contentHtml}
        </div>`;
    }).join('');
    
    // Apply layout based on mode: vertical (stack) or horizontal (2 cols)
    // Wrap in p-composite-subs for proper indentation from main content
    const subHtml = subLayout === 'horizontal' 
        ? `<div class="p-composite-subs"><div class="p-sub-grid">${subs}</div></div>` 
        : `<div class="p-composite-subs">${subs}</div>`;
    
    // Note: Shared word bank is now rendered in renderQuestionHTML, not here
    return subHtml;
}

// =====================================================
// MAIN PREVIEW RENDERER
// =====================================================

/**
 * Render complete question HTML preview
 * @param {Object} question - Question object (v4.9 schema)
 * @param {Object} options - Rendering options
 * @param {Function} options.imageResolver - Function(imageId) => URL or null
 * @param {string|number} options.questionNumber - Display number for the question
 * @param {boolean} options.showMarks - Whether to show marks (default: true)
 * @param {boolean} options.interactive - Enable resize handles (default: false)
 * @returns {string} HTML string
 */
function renderQuestionHTML(question, options = {}) {
    if (!question) return '';
    
    const data = question.data || {};
    const meta = question.metadata || {};
    const qType = question.type || 'SUBJECTIVE';
    
    const questionNumber = options.questionNumber || question.id || '1';
    const showMarks = options.showMarks !== false;
    const renderOptions = {
        imageResolver: options.imageResolver || (() => null),
        interactive: options.interactive || false
    };
    
    // Main content - for COMPOSITE it's common_content, others use content
    const mainContent = data.common_content || data.content || '';
    let promptHtml = '';
    try {
        promptHtml = `<div class="p-section-stack">
            <div class="p-section-text">
                <span class="p-q-num">${questionNumber}.</span>
                <div>${formatRichText(mainContent, renderOptions)}</div>
            </div>
        </div>`;
    } catch (e) {
        console.error('Error formatting main content:', e);
        promptHtml = `<div class="p-section-stack">
            <div class="p-section-text">
                <span class="p-q-num">${questionNumber}.</span>
                <div style="color:red;">Error rendering content: ${e.message}</div>
            </div>
        </div>`;
    }
    
    // For COMPOSITE: Check for shared options pool and render it after main content
    let sharedWordBankHtml = '';
    if (qType === 'COMPOSITE') {
        const sharedPool = getSharedOptionsPool(data);
        if (sharedPool && sharedPool.length > 0) {
            const wordItems = sharedPool.map(word => 
                `<span class="p-word-bank-item">${word}</span>`
            ).join('');
            sharedWordBankHtml = `<div class="p-word-bank-wrapper" style="padding-left:2.5rem; margin:8px 0;"><div style="display:flex; justify-content:center;"><div class="p-word-bank" style="width:90%;">${wordItems}</div></div></div>`;
        }
    }
    
    // Type-specific content
    let typeHtml = '';
    
    try {
        switch (qType) {
            case 'MCQ':
                typeHtml = renderMCQPreview(data, renderOptions);
                break;
            case 'FIB':
                typeHtml = renderFIBPreview(data);
                break;
            case 'MATCH':
                typeHtml = renderMatchPreview(data, renderOptions);
                break;
            case 'TABLE':
                typeHtml = renderTablePreview(data, renderOptions);
                break;
            case 'COMPOSITE':
                typeHtml = renderCompositePreview(data, renderOptions);
                break;
            case 'SUBJECTIVE':
            default:
                // SUBJECTIVE has no additional content beyond the main content
                break;
        }
    } catch (e) {
        console.error(`Error rendering ${qType}:`, e);
        typeHtml = `<div style="color:red;">Error rendering ${qType}: ${e.message}</div>`;
    }
    
    // Marks display
    const points = meta.marks || 1;
    const marksText = showMarks ? `[${points}]` : '';
    
    // Wrap type-specific content with proper indentation
    // For non-COMPOSITE types (MCQ, FIB, etc.), options should align with question content text
    // COMPOSITE handles its own sub-question indentation via p-sub-item flex layout
    let typeContentHtml = '';
    if (typeHtml) {
        if (qType === 'COMPOSITE') {
            // COMPOSITE sub-questions have their own indentation structure
            typeContentHtml = typeHtml;
        } else {
            // Non-COMPOSITE types need wrapper for proper indentation
            typeContentHtml = `<div class="p-type-content">${typeHtml}</div>`;
        }
    }
    
    // For COMPOSITE: sharedWordBankHtml appears after main content but before sub-questions
    return `<div class="p-q-block">
        <div class="p-q-header">
            <div class="p-q-content">${promptHtml}${sharedWordBankHtml}</div>
            ${marksText ? `<div class="p-q-marks">${marksText}</div>` : ''}
        </div>
        ${typeContentHtml}
    </div>`;
}
