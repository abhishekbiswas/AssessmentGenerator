/**
 * Question Parser Module
 * Shared parsing and normalization logic for assessment questions
 * Used by: assessment-authoring-tool.html, assessment-selection-tool.html
 * 
 * This module provides functions to:
 * - Parse JSONL/JSON content into question objects
 * - Normalize questions from old schema to new nested schema
 * - Utility helpers for working with question data
 * 
 * Note: Layout generation functions (getLayoutConfig, generateLayoutJson)
 * have been moved to layout-parser.js
 */

// =====================================================
// JSONL PARSING
// =====================================================

/**
 * Parse mixed JSON/JSONL content into an array of question objects
 * Handles BOM, JSON arrays, multiple JSON objects, and normalizes to the new schema
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
                        const normalized = normalizeToNewSchema(obj);
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
            const normalized = normalizeToNewSchema(obj);
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
                        const normalized = normalizeToNewSchema(obj);
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
// SCHEMA NORMALIZATION
// =====================================================

/**
 * Normalize incoming data to new schema structure
 * Handles both old flat schema and new nested schema
 * @param {Object} obj - Raw question object
 * @returns {Object} Normalized question object
 */
function normalizeToNewSchema(obj) {
    // If already in new schema format (has taxonomy object), just ensure defaults
    if (obj.taxonomy) {
        return ensureSchemaDefaults(obj);
    }
    
    // Convert from old flat schema to new nested schema
    const normalized = {
        question_id: obj.question_id || `q_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        
        // 1. Taxonomy
        taxonomy: {
            grade_id: obj.grade_id || 'grade_3',
            subject_id: obj.subject_id || 'mathematics',
            unit_id: obj.unit_id || obj.chapter_id || 'ch1',
            section_id: obj.section_id || 'A',
            type: obj.type || 'short_answer',
            difficulty: obj.difficulty || 'medium',
            pool: obj.pool || obj.pool_type || 'practice',
            skill_tags: obj.skill_tags || []
        },
        
        // 2. Content
        content: {
            prompt: convertToNewPromptFormat(obj.prompt),
            stimulus: obj.stimulus ? convertToNewStimulusFormat(obj.stimulus) : null,
            options: obj.options ? obj.options.map(convertToNewOptionFormat) : null,
            subquestions: obj.subquestions ? obj.subquestions.map(convertSubquestionToNewFormat) : null
        },
        
        // 3. Grading
        grading: convertToNewGradingFormat(obj.answer, obj.rubric, obj.points),
        
        // 4. Metadata
        metadata: {
            ui_hint: obj.metadata?.ui_hint || '',
            version: obj.metadata?.version || 1,
            source: obj.metadata?.source || 'AI_Generated'
        }
    };
    
    // Clean up null content fields
    if (!normalized.content.stimulus) delete normalized.content.stimulus;
    if (!normalized.content.options) delete normalized.content.options;
    if (!normalized.content.subquestions) delete normalized.content.subquestions;
    
    return normalized;
}

/**
 * Ensure all required fields have defaults
 * @param {Object} obj - Question object
 * @returns {Object} Question object with all defaults applied
 */
function ensureSchemaDefaults(obj) {
    if (!obj.question_id) obj.question_id = `q_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    
    if (!obj.taxonomy) obj.taxonomy = {};
    obj.taxonomy.grade_id = obj.taxonomy.grade_id || 'grade_3';
    obj.taxonomy.subject_id = obj.taxonomy.subject_id || 'mathematics';
    obj.taxonomy.unit_id = obj.taxonomy.unit_id || 'ch1';
    obj.taxonomy.section_id = obj.taxonomy.section_id || 'A';
    obj.taxonomy.type = obj.taxonomy.type || 'short_answer';
    obj.taxonomy.difficulty = obj.taxonomy.difficulty || 'medium';
    obj.taxonomy.pool = obj.taxonomy.pool || 'practice';
    obj.taxonomy.skill_tags = obj.taxonomy.skill_tags || [];
    
    if (!obj.content) obj.content = {};
    if (!obj.content.prompt) obj.content.prompt = { text: '', assets: [] };
    
    if (!obj.grading) obj.grading = { kind: 'text', values: [], points: '1' };
    
    if (!obj.metadata) obj.metadata = {};
    obj.metadata.ui_hint = obj.metadata.ui_hint || '';
    obj.metadata.version = obj.metadata.version || 1;
    obj.metadata.source = obj.metadata.source || 'AI_Generated';
    
    return obj;
}

// =====================================================
// FORMAT CONVERTERS
// =====================================================

/**
 * Convert prompt to new format
 * @param {string|Object} prompt - Prompt in old or new format
 * @returns {Object} Prompt in new format {text, assets}
 */
function convertToNewPromptFormat(prompt) {
    if (!prompt) return { text: '', assets: [] };
    if (typeof prompt === 'string') {
        return { text: prompt, assets: [] };
    }
    return {
        text: prompt.text || '',
        assets: (prompt.media || prompt.assets || []).map(convertToNewAssetFormat)
    };
}

/**
 * Convert stimulus to new format
 * @param {Object} stimulus - Stimulus object
 * @returns {Object|null} Stimulus in new format or null
 */
function convertToNewStimulusFormat(stimulus) {
    if (!stimulus) return null;
    
    // Convert word_bank items to new format with id, text, assets
    const wordBank = (stimulus.word_bank || []).map((item, idx) => {
        if (typeof item === 'string') {
            return { id: `wb_${idx}`, text: item, assets: [] };
        }
        return {
            id: item.id || `wb_${idx}`,
            text: item.text || '',
            assets: (item.assets || []).map(convertToNewAssetFormat)
        };
    });
    
    // Convert tables to new format
    const tables = (stimulus.tables || []).map((table, idx) => ({
        id: table.id || `table_${idx}`,
        header: table.header || [],
        rows: table.rows || []
    }));
    
    const result = {
        text: stimulus.text || '',
        assets: (stimulus.media || stimulus.assets || []).map(convertToNewAssetFormat),
        word_bank: wordBank
    };
    
    // Only include tables if present
    if (tables.length > 0) {
        result.tables = tables;
    }
    
    return result;
}

/**
 * Convert option to new format
 * @param {string|Object} opt - Option in old or new format
 * @returns {Object} Option in new format {id, text, assets}
 */
function convertToNewOptionFormat(opt) {
    if (typeof opt === 'string') {
        return { id: '', text: opt, assets: [] };
    }
    return {
        id: opt.id || '',
        text: opt.text || '',
        assets: (opt.media || opt.assets || []).map(convertToNewAssetFormat)
    };
}

/**
 * Convert asset to new format
 * @param {Object} asset - Asset object
 * @returns {Object} Asset in new format
 */
function convertToNewAssetFormat(asset) {
    return {
        asset_id: asset.asset_id || '#',
        uri: asset.uri || '',
        ai_generation_prompt: asset.ai_generation_prompt || '',
        alt: asset.alt || '',
        width: asset.width,
        height: asset.height
    };
}

/**
 * Convert sub-question to new format
 * @param {Object} sq - Sub-question object
 * @returns {Object} Sub-question in new format
 */
function convertSubquestionToNewFormat(sq) {
    // If grading already exists in new format, use it directly
    let grading;
    if (sq.grading && sq.grading.kind) {
        grading = {
            kind: sq.grading.kind,
            values: sq.grading.values || [],
            points: String(sq.grading.points || 1),
            explanation: sq.grading.explanation || ''
        };
    } else {
        grading = convertToNewGradingFormat(sq.answer, sq.rubric, sq.points);
    }
    
    const converted = {
        sub_id: sq.sub_id || 'a',
        type: sq.type || 'short_answer',
        prompt: convertToNewPromptFormat(sq.prompt),
        grading: grading
    };
    
    if (sq.stimulus) {
        converted.stimulus = convertToNewStimulusFormat(sq.stimulus);
    }
    if (sq.options) {
        converted.options = sq.options.map(convertToNewOptionFormat);
    }
    
    return converted;
}

/**
 * Convert grading/answer/rubric to new grading format
 * @param {string|Object} answer - Answer object or string
 * @param {Object} rubric - Rubric object (optional)
 * @param {number|string} points - Points value
 * @returns {Object} Grading in new format {kind, values, points, explanation}
 */
function convertToNewGradingFormat(answer, rubric, points) {
    let kind = 'text';
    let values = [];
    let explanation = '';
    
    if (answer) {
        if (typeof answer === 'string') {
            values = [answer];
        } else {
            kind = answer.kind || 'text';
            values = answer.value ? [answer.value] : (answer.values || []);
        }
    }
    
    if (rubric) {
        explanation = rubric.explanation || '';
    }
    
    return {
        kind: kind,
        values: values,
        points: String(points || 1),
        explanation: explanation
    };
}

// =====================================================
// LAYOUT JSON GENERATION
// =====================================================
// NOTE: Layout functions (getLayoutConfig, generateLayoutJson) have been
// moved to layout-parser.js for better modularity.
// Include layout-parser.js if you need layout generation functionality.

// =====================================================
// UTILITY HELPERS
// =====================================================

/**
 * Check if a question has any media assets or tables
 * @param {Object} q - Question object
 * @returns {boolean} True if question has media or tables
 */
function hasMedia(q) {
    const content = q.content || {};
    if (content.prompt?.assets?.length) return true;
    if (content.stimulus?.assets?.length) return true;
    if (content.stimulus?.tables?.length) return true;
    if (content.subquestions) { 
        return content.subquestions.some(sq => 
            sq.prompt?.assets?.length || 
            sq.stimulus?.assets?.length ||
            sq.stimulus?.tables?.length
        ); 
    }
    return false;
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
 * Render tables from stimulus as HTML
 * @param {Array} tables - Array of table objects with id, header, and rows
 * @returns {string} HTML string for rendered tables
 */
function renderStimulusTables(tables) {
    if (!tables || tables.length === 0) return '';
    
    return tables.map(table => {
        const tableId = table.id || '';
        const header = table.header || [];
        const rows = table.rows || [];
        
        // Build header row if present
        let headerHtml = '';
        if (header.length > 0) {
            const headerCells = header.map(h => `<th>${h}</th>`).join('');
            headerHtml = `<thead><tr>${headerCells}</tr></thead>`;
        }
        
        // Build body rows
        const bodyRows = rows.map(row => {
            const cells = row.map(cell => `<td>${cell}</td>`).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
        const bodyHtml = bodyRows ? `<tbody>${bodyRows}</tbody>` : '';
        
        return `<table class="p-table" data-table-id="${tableId}">${headerHtml}${bodyHtml}</table>`;
    }).join('');
}

/**
 * Create a new empty question with defaults
 * @returns {Object} New question object with all required fields
 */
function createEmptyQuestion() {
    return {
        question_id: `q_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        taxonomy: {
            grade_id: 'grade_3',
            subject_id: 'mathematics',
            unit_id: 'ch1',
            section_id: 'A',
            type: 'short_answer',
            difficulty: 'medium',
            pool: 'practice',
            skill_tags: []
        },
        content: {
            prompt: { text: '', assets: [] }
        },
        grading: {
            kind: 'text',
            values: [],
            points: '1'
        },
        metadata: {
            ui_hint: '',
            version: 1,
            source: 'AI_Generated'
        }
    };
}

/**
 * Prepare question data for export (removes UI-only fields)
 * @param {Object} q - Question object
 * @returns {Object} Clean question object for export
 */
function prepareForExport(q) {
    const exported = JSON.parse(JSON.stringify(q));
    
    // Clean up assets - remove width/height (UI only)
    const cleanAssets = (assets) => {
        if (!assets) return;
        assets.forEach(a => {
            delete a.width;
            delete a.height;
        });
    };
    
    if (exported.content?.prompt?.assets) cleanAssets(exported.content.prompt.assets);
    if (exported.content?.stimulus?.assets) cleanAssets(exported.content.stimulus.assets);
    if (exported.content?.options) {
        exported.content.options.forEach(opt => cleanAssets(opt.assets));
    }
    if (exported.content?.subquestions) {
        exported.content.subquestions.forEach(sq => {
            if (sq.prompt?.assets) cleanAssets(sq.prompt.assets);
            if (sq.stimulus?.assets) cleanAssets(sq.stimulus.assets);
            if (sq.options) sq.options.forEach(opt => cleanAssets(opt.assets));
        });
    }
    
    return exported;
}

