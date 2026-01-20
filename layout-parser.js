/**
 * Layout Parser Module
 * Layout configuration generation for assessment questions
 * Used by: assessment-authoring-tool.html
 * 
 * This module provides functions to:
 * - Generate layout configuration for questions (regions, themes)
 * - Generate complete layout JSON objects for export
 */

// =====================================================
// LAYOUT JSON GENERATION
// =====================================================

/**
 * Generate layout configuration for a question
 * @param {Object} q - Question object
 * @returns {Object} Layout configuration {theme, regions, print_settings}
 */
function getLayoutConfig(q) {
    const content = q.content || {};
    
    const theme = {
        font_family: "Noto Sans, sans-serif",
        base_font_size: "11pt",
        line_height: "1.5"
    };
    
    const regions = {};
    
    const hasPrompt = content.prompt && (content.prompt.text || (content.prompt.assets && content.prompt.assets.length > 0));
    if (hasPrompt) {
        regions.prompt = { display: content.prompt.layout || 'stack' };
    }
    
    const hasStimulus = content.stimulus && (
        content.stimulus.text || 
        (content.stimulus.assets && content.stimulus.assets.length > 0) ||
        (content.stimulus.word_bank && content.stimulus.word_bank.length > 0) ||
        (content.stimulus.tables && content.stimulus.tables.length > 0)
    );
    if (hasStimulus) {
        regions.stimulus = { display: content.stimulus.layout || 'stack' };
    }
    
    const hasOptions = content.options && content.options.length > 0;
    if (hasOptions) {
        regions.options = { display: content.options_layout || 'stack' };
    }
    
    const hasSubquestions = content.subquestions && content.subquestions.length > 0;
    if (hasSubquestions) {
        regions.subquestions = { display: content.subquestions_layout || 'grid' };
    }
    
    const print_settings = {
        page_break_inside: "avoid",
        keep_with_next: false
    };
    
    return { theme, regions, print_settings };
}

/**
 * Generate complete layout JSON object for a question
 * @param {Object} q - Question object
 * @returns {Object} Complete layout JSON
 */
function generateLayoutJson(q) {
    const layoutConfig = getLayoutConfig(q);
    return {
        layout_id: `lyt_${q.question_id || 'q_xxx'}_print`,
        question_id: q.question_id || 'q_xxx',
        page_layout: "A4",
        theme: layoutConfig.theme,
        regions: layoutConfig.regions,
        print_settings: layoutConfig.print_settings
    };
}
