/**
 * Question Parser Module (Schema v5.1)
 * Shared parsing and validation logic for assessment questions
 * Used by: assessment-authoring-tool.html, assessment-selection-tool.html
 * 
 * This module provides functions to:
 * - Parse JSONL/JSON content into question objects
 * - Validate and normalize v5.1 schema questions
 * - Extract and resolve image tokens [[image:tag]] in RichText
 * - Utility helpers for working with question data
 * 
 * Schema v5.1 Key Features:
 * - Images embedded as [[image:tag]] or [[image:tag|height:H|width:W]] tokens in RichText
 * - Polymorphic 'data' field based on question 'type'
 * - Types: MCQ, FIB, MATCH, SUBJECTIVE, TABLE, COMPOSITE
 * - TABLE type: { content, style, table: { header?, rows } }
 * - Type-safe 'style' object (mandatory) with composed mix-ins
 * - column_widths support for TABLE type
 */

// =====================================================
// CONSTANTS
// =====================================================

const QUESTION_TYPES = ['MCQ', 'FIB', 'MATCH', 'SUBJECTIVE', 'TABLE', 'COMPOSITE'];
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
const POOL_TYPES = ['Practice', 'Exam'];
const LAYOUT_VALUES = ['vertical', 'horizontal'];
const SUB_LAYOUT_VALUES = ['vertical', 'horizontal', 'matrix'];
const TABLE_GRID_VALUES = ['all', 'none', 'horizontal', 'vertical'];

// Regex for image tokens in RichText - format: [[image:id]] or [[image:id|height:H|width:W]]
const IMAGE_TOKEN_REGEX = /\[\[image:([^\]]+)\]\]/g;

// Default style configs (type-specific)
const BASE_STYLE = {
    image_layout: 'vertical'
};

const MCQ_STYLE = {
    image_layout: 'vertical',
    options_layout: 'vertical'
};

const COMPOSITE_STYLE = {
    image_layout: 'vertical',
    sub_questions_layout: 'vertical'
};

const TABLE_STYLE = {
    image_layout: 'vertical',
    table_grid_lines: 'all',
    hide_header: false
};

// =====================================================
// JSONL PARSING
// =====================================================

/**
 * Parse mixed JSON/JSONL content into an array of question objects
 * Handles BOM, JSON arrays, multiple JSON objects
 * @param {string} content - Raw JSON/JSONL content
 * @returns {Array} Array of validated question objects
 * @throws {Error} If content contains non-v5.1 schema questions
 */
function parseJson(content) {
    const results = [];
    
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    
    // Trim whitespace
    content = content.trim();
    
    // Try parsing as JSON array first (handles JSON files with array wrapper)
    if (content.startsWith('[')) {
        try {
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                parsed.forEach(obj => {
                    if (obj && typeof obj === 'object') {
                        const validated = validateAndNormalize(obj);
                        results.push(validated);
                    }
                });
                return results;
            }
        } catch (e) {
            console.log('Not a valid JSON array, trying JSONL parsing...');
        }
    }
    
    // Try parsing as complete JSON object (single question)
    if (content.startsWith('{') && !content.includes('\n{')) {
        try {
            const obj = JSON.parse(content);
            const validated = validateAndNormalize(obj);
            results.push(validated);
            return results;
        } catch (e) {
            console.log('Not a single JSON object, trying JSONL parsing...');
        }
    }
    
    // Fall back to JSONL parsing (one object per line or concatenated objects)
    let buffer = "";
    let braceCount = 0;
    let inString = false;
    let escape = false;
    
    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        buffer += char;
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (!inString) {
            if (char === '{') { braceCount++; } 
            else if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                    try {
                        const obj = JSON.parse(buffer.trim());
                        const validated = validateAndNormalize(obj);
                        results.push(validated);
                        buffer = ""; 
                    } catch (e) {
                        console.error('Parse error:', e);
                        buffer = ""; // Reset buffer on error
                    }
                }
            }
        }
    }
    return results;
}

// =====================================================
// SCHEMA VALIDATION (v5.1 Only)
// =====================================================

/**
 * Validate and normalize a question object to v5.1 schema
 * Only accepts v5.1 format - throws error for old schemas
 * @param {Object} obj - Raw question object
 * @returns {Object} Validated question object with defaults applied
 * @throws {Error} If object is not in v5.1 format
 */
function validateAndNormalize(obj) {
    // Check for v5.1 format: must have 'data' object and valid 'type'
    if (!obj.data || !QUESTION_TYPES.includes(obj.type)) {
        // Check if it's an old schema format
        if (obj.taxonomy || obj.content || obj.stimulus || obj.prompt) {
            throw new Error('Old schema format detected. Please convert to v5.1 schema format.');
        }
        throw new Error('Invalid question format. Expected v5.1 schema with "type" and "data" fields.');
    }
    
    return ensureDefaults(obj);
}

/**
 * Ensure all required v5.1 fields have defaults
 * @param {Object} obj - Question object
 * @returns {Object} Question object with all defaults applied
 */
function ensureDefaults(obj) {
    if (!obj.id) obj.id = generateId();
    
    // Ensure metadata
    if (!obj.metadata) obj.metadata = {};
    obj.metadata.grade = obj.metadata.grade ?? 'Nursery';
    obj.metadata.subject = obj.metadata.subject || 'Maths';
    obj.metadata.chapter = obj.metadata.chapter ?? 0;
    obj.metadata.section = obj.metadata.section || 'A';
    obj.metadata.difficulty = obj.metadata.difficulty || 'Medium';
    obj.metadata.marks = obj.metadata.marks || 1;
    obj.metadata.pool = obj.metadata.pool || 'Practice';
    obj.metadata.subpool = obj.metadata.subpool || 'NA';
    
    // Ensure type
    if (!obj.type || !QUESTION_TYPES.includes(obj.type)) {
        obj.type = 'SUBJECTIVE';
    }
    
    // Ensure data based on type
    if (!obj.data) {
        obj.data = getDefaultDataForType(obj.type);
    }
    
    // Ensure style object exists in data (mandatory)
    if (!obj.data.style) {
        obj.data.style = getStyleForType(obj.type);
    } else {
        obj.data.style = normalizeStyleValues(obj.data.style, obj.type);
    }
    
    // Ensure sub-questions also have style
    if (obj.data.sub_questions && Array.isArray(obj.data.sub_questions)) {
        obj.data.sub_questions.forEach(sq => {
            if (sq.data && !sq.data.style) {
                sq.data.style = getStyleForType(sq.type);
            } else if (sq.data?.style) {
                sq.data.style = normalizeStyleValues(sq.data.style, sq.type);
            }
            // Normalize sub-question TABLE data if needed
            if (sq.type === 'TABLE' && sq.data) {
                sq.data = normalizeTableData(sq.data);
            }
        });
    }
    
    // Normalize TABLE type data
    if (obj.type === 'TABLE' && obj.data) {
        obj.data = normalizeTableData(obj.data);
    }
    
    // Ensure solution
    if (!obj.solution) obj.solution = { text: '' };
    if (typeof obj.solution === 'string') obj.solution = { text: obj.solution };
    
    return obj;
}

/**
 * Normalize table data structure
 * Ensures proper { table: { header?, rows } } format
 * @param {Object} data - Table question data
 * @returns {Object} Normalized data with proper table structure
 */
function normalizeTableData(data) {
    if (!data) return data;
    
    // Already has proper table structure with 2D rows array
    if (data.table?.rows && Array.isArray(data.table.rows) && 
        data.table.rows.length > 0 && Array.isArray(data.table.rows[0])) {
        return data;
    }
    
    // Ensure table structure exists with defaults
    if (!data.table) {
        data.table = {
            header: ['Column 1', 'Column 2'],
            rows: [['Row 1', ''], ['Row 2', '']]
        };
    }
    
    return data;
}

/**
 * Normalize style values
 * @param {Object} style - Style object
 * @param {string} type - Question type
 * @returns {Object} Normalized style object
 */
function normalizeStyleValues(style, type) {
    const normalized = { ...style };
    
    // Ensure defaults based on type
    normalized.image_layout = normalized.image_layout || 'vertical';
    
    // Only add options_layout for MCQ/FIB types
    if (type === 'MCQ' || type === 'FIB') {
        normalized.options_layout = normalized.options_layout || 'vertical';
    }
    
    // Only add sub_questions_layout for COMPOSITE type
    if (type === 'COMPOSITE') {
        normalized.sub_questions_layout = normalized.sub_questions_layout || 'vertical';
    }
    
    // Table-specific style normalization
    if (type === 'TABLE') {
        normalized.table_grid_lines = normalized.table_grid_lines || 'all';
        if (!TABLE_GRID_VALUES.includes(normalized.table_grid_lines)) {
            normalized.table_grid_lines = 'all';
        }
        if (normalized.hide_header === undefined) {
            normalized.hide_header = false;
        }
        // column_widths - preserve if valid array
        if (normalized.column_widths && !Array.isArray(normalized.column_widths)) {
            delete normalized.column_widths;
        }
    }
    
    return normalized;
}

/**
 * Get the appropriate style object for a question type
 * @param {string} type - Question type
 * @returns {Object} Style object with type-appropriate fields
 */
function getStyleForType(type) {
    switch (type) {
        case 'MCQ':
        case 'FIB':
            return { ...MCQ_STYLE };
        case 'COMPOSITE':
            return { ...COMPOSITE_STYLE };
        case 'TABLE':
            return { ...TABLE_STYLE };
        case 'MATCH':
        case 'SUBJECTIVE':
        default:
            return { ...BASE_STYLE };
    }
}

/**
 * Get default data structure for a question type
 * @param {string} type - Question type
 * @returns {Object} Default data object
 */
function getDefaultDataForType(type) {
    switch (type) {
        case 'MCQ':
            return { content: '', style: getStyleForType('MCQ'), options: [] };
        case 'FIB':
            return { content: '', style: getStyleForType('FIB') };
        case 'MATCH':
            return { content: '', style: getStyleForType('MATCH'), pairs: [] };
        case 'SUBJECTIVE':
            return { content: '', style: getStyleForType('SUBJECTIVE'), expected_length: 'short' };
        case 'TABLE':
            return {
                content: '', 
                style: getStyleForType('TABLE'), 
                table: {
                    header: ['Column 1', 'Column 2'],
                    rows: [['Row 1', ''], ['Row 2', '']]
                }
            };
        case 'COMPOSITE':
            return { common_content: '', style: getStyleForType('COMPOSITE'), sub_questions: [] };
        default:
            return { content: '', style: getStyleForType(type) };
    }
}

// =====================================================
// IMAGE TOKEN UTILITIES
// =====================================================

/**
 * Extract all image tags from a question
 * @param {Object} question - Question object
 * @returns {Set<string>} Set of image tags
 */
function extractImageTags(question) {
    const tags = new Set();
    
    traverseAllRichText(question, (text) => {
        if (!text) return text;
        let match;
        const regex = new RegExp(IMAGE_TOKEN_REGEX.source, 'g');
        while ((match = regex.exec(text)) !== null) {
            tags.add(match[1]);
        }
        return text;
    });
    
    return tags;
}

/**
 * Resolve image tokens in a question for preview (using data URLs)
 * @param {Object} question - Question object
 * @param {Map} imageStore - Map of tag → { dataUrl, ... }
 * @returns {Object} Question with resolved image URLs
 */
function resolveImagesForPreview(question, imageStore) {
    const resolved = JSON.parse(JSON.stringify(question));
    
    traverseAllRichText(resolved, (text) => {
        if (!text) return text;
        return text.replace(IMAGE_TOKEN_REGEX, (match, tag) => {
            const image = imageStore.get(tag);
            if (image && image.dataUrl) {
                return `![${tag}](${image.dataUrl})`;
            }
            return `[Missing: ${tag}]`;
        });
    });
    
    return resolved;
}

/**
 * Resolve image tokens in a question for publish (using CDN URLs)
 * @param {Object} question - Question object
 * @param {Map} cdnResults - Map of tag → { uri }
 * @returns {Object} Question with resolved CDN URLs
 */
function resolveImagesForPublish(question, cdnResults) {
    const resolved = JSON.parse(JSON.stringify(question));
    
    traverseAllRichText(resolved, (text) => {
        if (!text) return text;
        return text.replace(IMAGE_TOKEN_REGEX, (match, tag) => {
            const cdn = cdnResults.get(tag);
            if (cdn && cdn.uri) {
                return `![${tag}](${cdn.uri})`;
            }
            return match; // Keep token if not found
        });
    });
    
    return resolved;
}

/**
 * Traverse all RichText fields in a question and apply a transformer
 * @param {Object} question - Question object
 * @param {Function} transformer - Function(text, path) → transformed text
 */
function traverseAllRichText(question, transformer) {
    const data = question.data;
    if (!data) return;
    
    // Main content (MCQ, FIB, MATCH, SUBJECTIVE, TABLE)
    if (data.content !== undefined) {
        data.content = transformer(data.content, 'data.content');
    }
    
    // Composite common content
    if (data.common_content !== undefined) {
        data.common_content = transformer(data.common_content, 'data.common_content');
    }
    
    // MCQ options
    if (data.options && Array.isArray(data.options)) {
        data.options.forEach((opt, i) => {
            if (opt.text !== undefined) {
                opt.text = transformer(opt.text, `data.options[${i}].text`);
            }
        });
    }
    
    // COMPOSITE options_pool (word bank for FIB sub-questions)
    if (data.options_pool && Array.isArray(data.options_pool)) {
        data.options_pool = data.options_pool.map((item, i) => 
            transformer(item, `data.options_pool[${i}]`)
        );
    }
    
    // Match pairs
    if (data.pairs && Array.isArray(data.pairs)) {
        data.pairs.forEach((pair, i) => {
            if (pair.left !== undefined) {
                pair.left = transformer(pair.left, `data.pairs[${i}].left`);
            }
            if (pair.right !== undefined) {
                pair.right = transformer(pair.right, `data.pairs[${i}].right`);
            }
        });
    }
    
    // TABLE structure: table.header and table.rows (2D array)
    if (data.table) {
        if (data.table.header && Array.isArray(data.table.header)) {
            data.table.header = data.table.header.map((cell, i) => 
                transformer(cell, `data.table.header[${i}]`)
            );
        }
        if (data.table.rows && Array.isArray(data.table.rows)) {
            data.table.rows = data.table.rows.map((row, i) => {
                if (Array.isArray(row)) {
                    return row.map((cell, j) => 
                        transformer(cell, `data.table.rows[${i}][${j}]`)
                    );
                }
                return row;
            });
        }
    }
    
    // Composite sub-questions (recursive)
    if (data.sub_questions && Array.isArray(data.sub_questions)) {
        data.sub_questions.forEach((sub, i) => {
            traverseAllRichText({ type: sub.type, data: sub.data }, transformer);
        });
    }
    
    // Solution
    if (question.solution?.text !== undefined) {
        question.solution.text = transformer(question.solution.text, 'solution.text');
    }
}

// =====================================================
// UTILITY HELPERS
// =====================================================

/**
 * Generate a unique question ID
 * @returns {string} Generated ID
 */
function generateId() {
    return `Q${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * Check if a question has any image tokens
 * @param {Object} q - Question object
 * @returns {boolean} True if question has image tokens
 */
function hasImages(q) {
    const tags = extractImageTags(q);
    return tags.size > 0;
}

/**
 * Create a new empty question with v5.1 defaults
 * @param {string} type - Question type (default: 'SUBJECTIVE')
 * @returns {Object} New question object with all required fields
 */
function createEmptyQuestion(type = 'SUBJECTIVE') {
    return {
        id: generateId(),
        metadata: {
            grade: 'Nursery',
            subject: 'Maths',
            chapter: 0,
            section: 'A',
            difficulty: 'Medium',
            marks: 1,
            pool: 'Practice',
            subpool: 'NA'
        },
        type: type,
        data: getDefaultDataForType(type),
        solution: {
            text: ''
        }
    };
}

/**
 * Prepare question data for export
 * @param {Object} q - Question object
 * @returns {Object} Clean question object for export
 */
function prepareForExport(q) {
    const exported = JSON.parse(JSON.stringify(q));
    
    // Remove any UI-only fields if present
    delete exported._ui;
    delete exported._selected;
    delete exported._expanded;
    
    return exported;
}

/**
 * Validate a question against v5.1 schema
 * @param {Object} q - Question object
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateQuestion(q) {
    const errors = [];
    
    if (!q.id) errors.push('Missing id');
    if (!q.metadata) errors.push('Missing metadata');
    if (!q.type) errors.push('Missing type');
    if (!QUESTION_TYPES.includes(q.type)) errors.push(`Invalid type: ${q.type}`);
    if (!q.data) errors.push('Missing data');
    if (!q.solution) errors.push('Missing solution');
    
    // style is mandatory in data
    if (q.data && !q.data.style) {
        errors.push('Missing data.style (mandatory in v5.1)');
    }
    
    // Type-specific validation
    if (q.type === 'MCQ' && (!q.data?.options || q.data.options.length === 0)) {
        errors.push('MCQ requires at least one option');
    }
    if (q.type === 'MATCH' && (!q.data?.pairs || q.data.pairs.length === 0)) {
        errors.push('MATCH requires at least one pair');
    }
    if (q.type === 'TABLE') {
        if (!q.data?.table) {
            errors.push('TABLE requires a table object');
        } else if (!q.data.table.rows || q.data.table.rows.length === 0) {
            errors.push('TABLE requires at least one row in table.rows');
        }
    }
    if (q.type === 'COMPOSITE' && (!q.data?.sub_questions || q.data.sub_questions.length === 0)) {
        errors.push('COMPOSITE requires at least one sub-question');
    }
    
    // Validate sub-questions have style
    if (q.type === 'COMPOSITE' && q.data?.sub_questions) {
        q.data.sub_questions.forEach((sq, i) => {
            if (!sq.data?.style) {
                errors.push(`Sub-question ${i + 1} missing data.style (mandatory in v5.1)`);
            }
        });
    }
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Get display-friendly type name
 * @param {string} type - Question type code
 * @returns {string} Display name
 */
function getTypeDisplayName(type) {
    const names = {
        'MCQ': 'Multiple Choice',
        'FIB': 'Fill in the Blank',
        'MATCH': 'Match the Following',
        'SUBJECTIVE': 'Subjective',
        'TABLE': 'Table/Grid',
        'COMPOSITE': 'Composite'
    };
    return names[type] || type;
}
