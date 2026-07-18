use rusqlite::{Connection, OptionalExtension};
use serde::{Deserialize, Serialize};
use crate::errors::Result;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PersonaTrait {
    pub id: String,
    pub trait_category: String,
    pub trait_key: String,
    pub trait_value: String,
    pub trait_score: Option<f32>,
    pub confidence: f32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RelationshipAddressing {
    pub id: String,
    pub relationship_tier: String,
    pub person_name: Option<String>,
    pub how_i_address_them: Option<String>,
    pub how_they_address_me: Option<String>,
    pub greeting_style: Option<String>,
    pub sign_off_style: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryCandidate {
    pub node_id: String,
    pub title: String,
    pub content: String,
    pub created_at: i64,
    pub semantic_similarity: f32,
    pub category: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RerankedMemory {
    pub candidate: MemoryCandidate,
    pub final_score: f32,
    pub recency_score: f32,
    pub persona_affinity: f32,
}

/// 1. Terse Persona Distillation Engine
/// Following the PersonaChat/ConvAI2 & PersonalityEdit research lessons:
/// Local 8B models drift when fed 100+ raw rows of JSON. This function pulls the core
/// traits and distills them into a clean, 6-8 line high-signal system prompt.
pub fn compile_mirror_persona_prompt(
    conn: &Connection,
    target_tier: Option<&str>,
) -> Result<String> {
    // 1. Fetch top signature phrases & tone constraints
    let mut stmt = conn.prepare(
        r#"
        SELECT trait_category, trait_key, trait_value, confidence
        FROM persona_dna
        WHERE superseded_by IS NULL AND confidence >= 0.6
        ORDER BY confidence DESC, last_updated DESC
        LIMIT 15
        "#
    )?;

    let trait_rows = stmt.query_map([], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, f32>(3)?,
        ))
    })?;

    let mut signature_phrases = Vec::new();
    let mut tone_rules = Vec::new();
    let mut decision_heuristics = Vec::new();
    let mut humor_style = String::from("Observational, natural tone");

    for r in trait_rows {
        if let Ok((category, key, val, _conf)) = r {
            match category.as_str() {
                "slang" => signature_phrases.push(val),
                "tone" => tone_rules.push(format!("{}: {}", key, val)),
                "cognitive" | "decision" => decision_heuristics.push(val),
                "humor" if key == "humor_style" => humor_style = val,
                _ => {}
            }
        }
    }

    // 2. Resolve addressing for current conversation context
    let addressing = resolve_addressing_context(conn, target_tier.unwrap_or("best_friend"))?;
    let call_me = addressing.how_they_address_me.unwrap_or_else(|| "ok bhai".to_string());
    let call_you = addressing.how_i_address_them.unwrap_or_else(|| "yaar".to_string());

    // 3. Compile into a terse, high-fidelity system prompt
    let mut prompt = String::new();
    prompt.push_str("You are Atlas, the user's mirror digital twin and personal advisor.\n");
    prompt.push_str("CRITICAL BEHAVIORAL & TONE RULES (Do NOT break or sound generic):\n");
    prompt.push_str(&format!("- Addressing: Address the user as '{}'. When greeting, use terms like '{}'.\n", call_me, call_you));
    prompt.push_str(&format!("- Humor & Vibe: {}.\n", humor_style));
    
    if !signature_phrases.is_empty() {
        let phrases_joined = signature_phrases.join(", ");
        prompt.push_str(&format!("- Vocabulary & Slang: Naturally incorporate signature expressions when appropriate: [{}].\n", phrases_joined));
    }

    if !tone_rules.is_empty() {
        prompt.push_str("- Tone Register:\n");
        for rule in tone_rules.iter().take(3) {
            prompt.push_str(&format!("  * {}\n", rule));
        }
    }

    if !decision_heuristics.is_empty() {
        prompt.push_str("- Decision Heuristics (how we think through problems):\n");
        for h in decision_heuristics.iter().take(2) {
            prompt.push_str(&format!("  * {}\n", h));
        }
    }

    prompt.push_str("- Mirror Rule: Be direct, unfiltered, and candid. Never use generic AI filler like 'As an AI' or 'Certainly! Let's dive in'. Speak exactly as the user's sharpest inner monologue.\n");

    Ok(prompt)
}

/// 2. Hybrid Recency-Semantic-Persona Reranking Formula
/// Combines sqlite-vec KNN semantic similarity with recency half-life decay and persona affinity.
pub fn persona_rerank(
    candidates: Vec<MemoryCandidate>,
    active_traits: &[PersonaTrait],
) -> Vec<RerankedMemory> {
    let now = chrono::Utc::now().timestamp();
    // Half-life of 14 days (1,209,600 seconds)
    let half_life_sec = 1_209_600.0f32;

    let mut reranked = Vec::with_capacity(candidates.len());

    for cand in candidates {
        // A. Recency score using exponential half-life decay: e^(-lambda * delta_t)
        let delta_t = (now - cand.created_at).max(0) as f32;
        let recency_score = (-0.693147 * delta_t / half_life_sec).exp();

        // B. Persona affinity: boost if memory category matches top active trait categories
        let mut persona_affinity = 0.5f32;
        for tr in active_traits {
            if cand.category.eq_ignore_ascii_case(&tr.trait_category) || cand.title.to_lowercase().contains(&tr.trait_key) {
                persona_affinity = (persona_affinity + 0.3).min(1.0);
            }
        }

        // C. Final weighted combination: 55% semantic + 30% recency + 15% persona affinity
        let final_score = (cand.semantic_similarity * 0.55)
            + (recency_score * 0.30)
            + (persona_affinity * 0.15);

        reranked.push(RerankedMemory {
            candidate: cand,
            final_score,
            recency_score,
            persona_affinity,
        });
    }

    // Sort descending by final score
    reranked.sort_by(|a, b| b.final_score.partial_cmp(&a.final_score).unwrap_or(std::cmp::Ordering::Equal));
    reranked
}

/// 3. Resolve Relationship Addressing Context
pub fn resolve_addressing_context(
    conn: &Connection,
    tier: &str,
) -> Result<RelationshipAddressing> {
    let mut stmt = conn.prepare(
        r#"
        SELECT id, relationship_tier, person_name, how_i_address_them, how_they_address_me, greeting_style, sign_off_style
        FROM relationship_addressing
        WHERE relationship_tier = ?
        ORDER BY last_updated DESC
        LIMIT 1
        "#
    )?;

    let result = stmt.query_row([tier], |row| {
        Ok(RelationshipAddressing {
            id: row.get(0)?,
            relationship_tier: row.get(1)?,
            person_name: row.get(2)?,
            how_i_address_them: row.get(3)?,
            how_they_address_me: row.get(4)?,
            greeting_style: row.get(5)?,
            sign_off_style: row.get(6)?,
        })
    }).optional()?;

    Ok(result.unwrap_or_else(|| RelationshipAddressing {
        id: "default".to_string(),
        relationship_tier: tier.to_string(),
        person_name: None,
        how_i_address_them: Some("yaar".to_string()),
        how_they_address_me: Some("ok bhai".to_string()),
        greeting_style: Some("Yo!".to_string()),
        sign_off_style: Some("catch you later".to_string()),
    }))
}
