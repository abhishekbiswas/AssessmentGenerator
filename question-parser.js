/**
 * Question Parser Module (Schema v4.0)
 * Shared parsing and normalization logic for assessment questions
 * Used by: assessment-authoring-tool.html, assessment-selection-tool.html
 * 
 * This module provides functions to:
 * - Parse JSONL/JSON content into question objects
 * - Normalize questions from old schemas to v4.0 schema
 * - Extract and resolve image tokens [[tag]] in RichText
 * - Utility helpers for working with question data
 * 
 * Schema v4.0 Key Features:
 * - Images embedded as [[tag]] tokens in RichText strings
 * - Polymorphic 'data' field based on question 'type'
 * - Types: MCQ, FIB, MATCH, SUBJECTIVE, COMPOSITE
 * - Mandatory 'style' object in all data types
 * - Layout values: 'vertical', 'horizontal', 'matrix' (for sub_questions_layout only)
 */

// =====================================================
// CONSTANTS
// =====================================================

const QUESTION_TYPES = ['MCQ', 'FIB', 'MATCH', 'SUBJECTIVE', 'COMPOSITE'];
const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];
const POOL_TYPES = ['Practice', 'Exam'];
const LAYOUT_VALUES = ['vertical', 'horizontal'];
const SUB_LAYOUT_VALUES = ['vertical', 'horizontal', 'matrix'];

// Regex for image tokens in RichText
const IMAGE_TOKEN_REGEX = /\[\[([^\]]+)\]\]/g;

// Default style config for v4.0
const DEFAULT_STYLE = {
    image_layout: 'vertical',
    options_layout: 'vertical',
    sub_questions_layout: 'vertical'
};

// =====================================================
// JSONL PARSING
// =====================================================

/**
 * Parse mixed JSON/JSONL content into an array of question objects
 * Handles BOM, JSON arrays, multiple JSON objects, and normalizes to v4.0 schema
 * @param {string} content - Raw JSON/JSONL content
 * @returns {Array} Array of normalized question objects
 */
function parseMixedJson(content) {
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
                        const normalized = normalizeToV40Schema(obj);
                        results.push(normalized);
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
            const normalized = normalizeToV40Schema(obj);
            results.push(normalized);
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
                        const normalized = normalizeToV40Schema(obj);
                        results.push(normalized);
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
// SCHEMA NORMALIZATION (v4.0)
// =====================================================

/**
 * Normalize incoming data to v4.0 schema structure
 * Handles old schemas and ensures v4.0 compliance
 * @param {Object} obj - Raw question object
 * @returns {Object} Normalized question object in v4.0 format
 */
function normalizeToV40Schema(obj) {
    // If already in v4.0/v3.6 format (has 'data' object and valid 'type')
    if (obj.data && QUESTION_TYPES.includes(obj.type)) {
        return ensureV40Defaults(obj);
    }
    
    // If in old nested schema (has 'taxonomy' and 'content')
    if (obj.taxonomy && obj.content) {
        return convertFromOldNestedSchema(obj);
    }
    
    // If in very old flat schema
    return convertFromFlatSchema(obj);
}

/**
 * @deprecated Use normalizeToV40Schema instead
 */
function normalizeToV36Schema(obj) {
    console.warn('normalizeToV36Schema is deprecated, use normalizeToV40Schema');
    return normalizeToV40Schema(obj);
}

/**
 * Convert from old nested schema (v2) to v4.0
 * @param {Object} obj - Question in old nested format
 * @returns {Object} Question in v4.0 format
 */
function convertFromOldNestedSchema(obj) {
    const oldType = obj.taxonomy?.type || 'short_answer';
    const newType = mapOldTypeToNew(oldType);
    
    return {
        id: obj.question_id || obj.id || generateId(),
        metadata: {
            grade: obj.taxonomy?.grade_id || 'grade_3',
            subject: capitalizeFirst(obj.taxonomy?.subject_id || 'mathematics'),
            chapter: obj.taxonomy?.unit_id || obj.taxonomy?.chapter_id || 1,
            section: obj.taxonomy?.section_id || 'A',
            difficulty: capitalizeFirst(obj.taxonomy?.difficulty || 'medium'),
            marks: parseInt(obj.grading?.points) || 1,
            pool: capitalizeFirst(obj.taxonomy?.pool || 'practice')
        },
        type: newType,
        data: convertContentToData(obj.content, newType, oldType),
        solution: {
            text: obj.grading?.explanation || ''
        }
    };
}

/**
 * Convert from very old flat schema to v4.0
 * @param {Object} obj - Question in flat format
 * @returns {Object} Question in v4.0 format
 */
function convertFromFlatSchema(obj) {
    const oldType = obj.type || 'short_answer';
    const newType = mapOldTypeToNew(oldType);
    
    // Build content from flat structure
    const content = {
        prompt: obj.prompt,
        stimulus: obj.stimulus,
        options: obj.options,
        subquestions: obj.subquestions
    };
    
    return {
        id: obj.question_id || obj.id || generateId(),
        metadata: {
            grade: obj.grade_id || obj.grade || 'grade_3',
            subject: capitalizeFirst(obj.subject_id || obj.subject || 'mathematics'),
            chapter: obj.unit_id || obj.chapter_id || obj.chapter || 1,
            section: obj.section_id || obj.section || 'A',
            difficulty: capitalizeFirst(obj.difficulty || 'medium'),
            marks: parseInt(obj.points) || parseInt(obj.grading?.points) || 1,
            pool: capitalizeFirst(obj.pool || obj.pool_type || 'practice')
        },
        type: newType,
        data: convertContentToData(content, newType, oldType),
        solution: {
            text: obj.grading?.explanation || obj.explanation || ''
        }
    };
}

/**
 * Map old question types to new v4.0 types
 * @param {string} oldType - Old type string
 * @returns {string} New v4.0 type
 */
function mapOldTypeToNew(oldType) {
    const typeMap = {
        'mcq': 'MCQ',
        'multiple_choice': 'MCQ',
        'short_answer': 'SUBJECTIVE',
        'long_answer': 'SUBJECTIVE',
        'fill_blank': 'FIB',
        'fill_in_blank': 'FIB',
        'fib': 'FIB',
        'match_columns': 'MATCH',
        'matching': 'MATCH',
        'match': 'MATCH',
        'composite': 'COMPOSITE',
        'sequencing': 'MCQ',  // Treat as MCQ with special handling
        'sorting': 'MCQ',     // Treat as MCQ with special handling
        'labelling': 'SUBJECTIVE'
    };
    
    const normalized = oldType.toLowerCase();
    return typeMap[normalized] || 'SUBJECTIVE';
}

/**
 * Convert old content structure to v4.0 data structure
 * @param {Object} content - Old content object
 * @param {string} newType - New v4.0 type
 * @param {string} oldType - Original old type
 * @returns {Object} Data object for v4.0 schema
 */
function convertContentToData(content, newType, oldType) {
    if (!content) content = {};
    
    // Build the main content RichText from prompt and stimulus
    const mainContent = buildRichTextContent(content.prompt, content.stimulus);
    
    switch (newType) {
        case 'MCQ':
            return buildMCQData(mainContent, content.options, oldType);
        
        case 'FIB':
            return buildFIBData(mainContent, content.stimulus);
        
        case 'MATCH':
            return buildMatchData(mainContent, content.stimulus);
        
        case 'SUBJECTIVE':
            return buildSubjectiveData(mainContent, oldType);
        
        case 'COMPOSITE':
            return buildCompositeData(content);
        
        default:
            return { content: mainContent };
    }
}

/**
 * Build RichText content from prompt and stimulus
 * Converts old assets to [[tag]] tokens
 * @param {Object|string} prompt - Prompt data
 * @param {Object} stimulus - Stimulus data
 * @returns {string} RichText content
 */
function buildRichTextContent(prompt, stimulus) {
    let parts = [];
    
    // Add stimulus text first if present
    if (stimulus) {
        const stimulusText = getTextValue(stimulus);
        if (stimulusText) parts.push(stimulusText);
        
        // Convert stimulus assets to tokens
        const stimulusAssets = stimulus.assets || stimulus.media || [];
        stimulusAssets.forEach(asset => {
            const token = assetToToken(asset);
            if (token) parts.push(token);
        });
    }
    
    // Add prompt text
    const promptText = getTextValue(prompt);
    if (promptText) parts.push(promptText);
    
    // Convert prompt assets to tokens
    if (prompt && typeof prompt === 'object') {
        const promptAssets = prompt.assets || prompt.media || [];
        promptAssets.forEach(asset => {
            const token = assetToToken(asset);
            if (token) parts.push(token);
        });
    }
    
    return parts.join('\n\n');
}

/**
 * Convert asset object to [[tag]] token
 * @param {Object} asset - Asset object
 * @returns {string|null} Token string or null
 */
function assetToToken(asset) {
    if (!asset) return null;
    
    // Try to get tag from various fields
    const tag = asset.asset_id || asset.filename?.replace(/\.[^.]+$/, '') || asset.tag || asset.id;
    if (!tag || tag === '#') return null;
    
    return `[[${tag}]]`;
}

/**
 * Build MCQ data structure
 */
function buildMCQData(content, options, oldType) {
    const data = {
        content: content,
        style: { ...DEFAULT_STYLE },
        options: (options || []).map((opt, idx) => ({
            id: opt.id || opt.opt_id || String.fromCharCode(97 + idx),
            text: buildOptionText(opt)
        }))
    };
    
    // Handle multi-select
    if (oldType === 'multiple_selection' || oldType === 'multi_select') {
        data.allow_multiple = true;
    }
    
    return data;
}

/**
 * Build option text with embedded image tokens
 */
function buildOptionText(opt) {
    if (typeof opt === 'string') return opt;
    
    let text = opt.text || '';
    
    // Convert option assets to tokens
    const assets = opt.assets || opt.media || [];
    assets.forEach(asset => {
        const token = assetToToken(asset);
        if (token) text = token + ' ' + text;
    });
    
    // Handle single asset field
    if (opt.asset) {
        const token = assetToToken(opt.asset);
        if (token) text = token + ' ' + text;
    }
    
    return text.trim();
}

/**
 * Build FIB (Fill in Blank) data structure
 */
function buildFIBData(content, stimulus) {
    const data = {
        content: content,
        style: { ...DEFAULT_STYLE }
    };
    
    // Extract word bank if present
    if (stimulus?.word_bank) {
        data.options_pool = stimulus.word_bank.map(item => 
            typeof item === 'string' ? item : item.text
        );
    }
    
    return data;
}

/**
 * Build Match data structure
 */
function buildMatchData(content, stimulus) {
    const data = {
        content: content,
        style: { ...DEFAULT_STYLE },
        pairs: []
    };
    
    // Convert from old pairs format
    if (stimulus?.pairs) {
        const leftCol = stimulus.pairs.left_column || [];
        const rightCol = stimulus.pairs.right_column || [];
        
        const maxLen = Math.max(leftCol.length, rightCol.length);
        for (let i = 0; i < maxLen; i++) {
            data.pairs.push({
                left: leftCol[i]?.text || '',
                right: rightCol[i]?.text || ''
            });
        }
    }
    
    return data;
}

/**
 * Build Subjective data structure
 */
function buildSubjectiveData(content, oldType) {
    const data = {
        content: content,
        style: { ...DEFAULT_STYLE }
    };
    
    // Determine expected length from old type
    if (oldType === 'long_answer') {
        data.expected_length = 'long';
    } else {
        data.expected_length = 'short';
    }
    
    return data;
}

/**
 * Build Composite data structure
 */
function buildCompositeData(content) {
    // Build common content from stimulus
    let commonContent = '';
    if (content.stimulus) {
        commonContent = buildRichTextContent(null, content.stimulus);
    }
    if (content.prompt) {
        const promptText = getTextValue(content.prompt);
        if (promptText) commonContent += '\n\n' + promptText;
    }
    
    // Convert sub-questions
    const subQuestions = (content.subquestions || content.sub_questions || []).map(sq => {
        const subType = mapOldTypeToNew(sq.type || 'short_answer');
        return {
            id: sq.sub_id || sq.id || 'a',
            type: subType,
            data: convertContentToData({
                prompt: sq.prompt,
                stimulus: sq.stimulus,
                options: sq.options
            }, subType, sq.type)
        };
    });
    
    return {
        common_content: commonContent,
        style: { ...DEFAULT_STYLE },
        sub_questions: subQuestions
    };
}

/**
 * Ensure all required v4.0 fields have defaults
 * @param {Object} obj - Question object
 * @returns {Object} Question object with all defaults applied
 */
function ensureV40Defaults(obj) {
    if (!obj.id) obj.id = generateId();
    
    // Ensure metadata
    if (!obj.metadata) obj.metadata = {};
    obj.metadata.grade = obj.metadata.grade ?? 3;
    obj.metadata.subject = obj.metadata.subject || 'Mathematics';
    obj.metadata.chapter = obj.metadata.chapter ?? 1;
    obj.metadata.section = obj.metadata.section || 'A';
    obj.metadata.difficulty = obj.metadata.difficulty || 'Medium';
    obj.metadata.marks = obj.metadata.marks ?? 1;
    obj.metadata.pool = obj.metadata.pool || 'Practice';
    
    // Ensure type
    if (!obj.type || !QUESTION_TYPES.includes(obj.type)) {
        obj.type = 'SUBJECTIVE';
    }
    
    // Ensure data based on type
    if (!obj.data) {
        obj.data = getDefaultDataForType(obj.type);
    }
    
    // Ensure style object exists in data (mandatory in v4.0)
    if (!obj.data.style) {
        obj.data.style = { ...DEFAULT_STYLE };
    } else {
        // Normalize old style values (stack→vertical, grid→horizontal)
        obj.data.style = normalizeStyleValues(obj.data.style);
    }
    
    // Ensure sub-questions also have style
    if (obj.data.sub_questions && Array.isArray(obj.data.sub_questions)) {
        obj.data.sub_questions.forEach(sq => {
            if (sq.data && !sq.data.style) {
                sq.data.style = { ...DEFAULT_STYLE };
            } else if (sq.data?.style) {
                sq.data.style = normalizeStyleValues(sq.data.style);
            }
        });
    }
    
    // Ensure solution
    if (!obj.solution) obj.solution = { text: '' };
    if (typeof obj.solution === 'string') obj.solution = { text: obj.solution };
    
    return obj;
}

/**
 * Normalize style values from old schema (stack/grid) to v4.0 (vertical/horizontal)
 * @param {Object} style - Style object
 * @returns {Object} Normalized style object
 */
function normalizeStyleValues(style) {
    const normalized = { ...style };
    
    // Map old values to new
    const valueMap = {
        'stack': 'vertical',
        'grid': 'horizontal'
    };
    
    if (normalized.image_layout && valueMap[normalized.image_layout]) {
        normalized.image_layout = valueMap[normalized.image_layout];
    }
    if (normalized.options_layout && valueMap[normalized.options_layout]) {
        normalized.options_layout = valueMap[normalized.options_layout];
    }
    if (normalized.sub_questions_layout && valueMap[normalized.sub_questions_layout]) {
        normalized.sub_questions_layout = valueMap[normalized.sub_questions_layout];
    }
    
    // Ensure defaults for missing values
    normalized.image_layout = normalized.image_layout || 'vertical';
    normalized.options_layout = normalized.options_layout || 'vertical';
    normalized.sub_questions_layout = normalized.sub_questions_layout || 'vertical';
    
    return normalized;
}

/**
 * @deprecated Use ensureV40Defaults instead
 */
function ensureV36Defaults(obj) {
    console.warn('ensureV36Defaults is deprecated, use ensureV40Defaults');
    return ensureV40Defaults(obj);
}

/**
 * Get default data structure for a question type (v4.0 - includes mandatory style)
 */
function getDefaultDataForType(type) {
    const baseStyle = { ...DEFAULT_STYLE };
    
    switch (type) {
        case 'MCQ':
            return { content: '', style: baseStyle, options: [] };
        case 'FIB':
            return { content: '', style: baseStyle };
        case 'MATCH':
            return { content: '', style: baseStyle, pairs: [] };
        case 'SUBJECTIVE':
            return { content: '', style: baseStyle, expected_length: 'short' };
        case 'COMPOSITE':
            return { common_content: '', style: baseStyle, sub_questions: [] };
        default:
            return { content: '', style: baseStyle };
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
    
    const type = question.type;
    
    // Main content (MCQ, FIB, MATCH, SUBJECTIVE)
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
    
    // FIB options_pool (usually plain text, but check anyway)
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
 * Capitalize first letter of a string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
function capitalizeFirst(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Safely extract text from various data structures
 * @param {string|Object} data - Data that may contain text
 * @returns {string} Extracted text value
 */
function getTextValue(data) {
    if (!data) return '';
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data.text !== undefined) return data.text || '';
    if (typeof data === 'object' && data.value !== undefined) return data.value || '';
    return '';
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
 * Create a new empty question with v4.0 defaults
 * @param {string} type - Question type (default: 'SUBJECTIVE')
 * @returns {Object} New question object with all required fields
 */
function createEmptyQuestion(type = 'SUBJECTIVE') {
    return {
        id: generateId(),
        metadata: {
            grade: 3,
            subject: 'Mathematics',
            chapter: 1,
            section: 'A',
            difficulty: 'Medium',
            marks: 1,
            pool: 'Practice'
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
 * Validate a question against v4.0 schema
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
    
    // v4.0: style is mandatory in data
    if (q.data && !q.data.style) {
        errors.push('Missing data.style (mandatory in v4.0)');
    }
    
    // Type-specific validation
    if (q.type === 'MCQ' && (!q.data?.options || q.data.options.length === 0)) {
        errors.push('MCQ requires at least one option');
    }
    if (q.type === 'MATCH' && (!q.data?.pairs || q.data.pairs.length === 0)) {
        errors.push('MATCH requires at least one pair');
    }
    if (q.type === 'COMPOSITE' && (!q.data?.sub_questions || q.data.sub_questions.length === 0)) {
        errors.push('COMPOSITE requires at least one sub-question');
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
        'COMPOSITE': 'Composite'
    };
    return names[type] || type;
}

// =====================================================
// LEGACY COMPATIBILITY
// =====================================================

/**
 * @deprecated Use normalizeToV40Schema instead
 */
function normalizeToNewSchema(obj) {
    console.warn('normalizeToNewSchema is deprecated, use normalizeToV40Schema');
    return normalizeToV40Schema(obj);
}

/**
 * @deprecated Use hasImages instead
 */
function hasMedia(q) {
    console.warn('hasMedia is deprecated, use hasImages');
    return hasImages(q);
}

