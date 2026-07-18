# Atlas Behavioral Evidence Engine — Full Instrument & Scoring Guide

A 90+ item adaptive onboarding instrument (`persona_dna` & `interview_responses` schema) designed around the **Behavioral Evidence Engine** paradigm (**Evidence > Opinion**).

Every question below is tagged with how to score it across our 8 evidence formats, how it updates latent trait vectors (`latent_updates_json`), and how it maps to psychological frameworks (OCEAN, MBTI, System 1/2 Heuristics, Enneagram fears, and attachment dynamics).

---

## The 8 Evidence Formats & Scoring Conventions

| Format | Description & How to Score | Latent Update Example |
|:---|:---|:---|
| **1. Forced Choice MCQs** | Concrete ethical/social dilemmas where options correspond to distinct trait directions. Log chosen label in `trait_value` and apply directional latent shifts. | `{"agreeableness": +1.0, "trust": +2.0}` |
| **2. Scenario SJTs** | Situational Judgment Tests testing real-world conflict and execution reflexes. Option choice directly updates behavioral vectors. | `{"brutal_honesty": +3.0, "conflict_avoidance": -2.0}` |
| **3. Ranking Questions** | Ordinal ranking of competing values (e.g., `[Salary, Impact, Freedom, Recognition, Learning]`). Extracts relative utility weights. | `{"priority_weights": {"freedom": 1, "impact": 2}}` |
| **4. Pairwise Choice** | Direct head-to-head comparisons to eliminate middle-ground bias and social desirability. | `{"certainty_preference": +2.0}` |
| **5. Memory Recall** | Episodic memory prompts where verbatim answers extract actual behavioral latency and real conflict reactions. | `{"emotional_closure_speed": "slow", "conflict_style": "brooding"}` |
| **6. Prediction Questions** | Predicting how an external observer (closest friend/colleague) would rate the user. Measures `self_awareness_gap`. | `{"self_awareness_gap": 0.15}` |
| **7. Contradiction Detection** | Paired items placed far apart (e.g., Q4 vs Q81). If answers conflict, confidence on absolute self-image decreases while situational variance increases. | `{"confidence_multiplier": 0.75, "situational_diplomacy": +2.0}` |
| **8. Confidence Questions** | Attached to high-stakes items (`100%`, `80%`, `60%`, `Guessing`). Multiplies the magnitude of latent vector updates. | `latent_update = raw_weight * confidence_rating` |

---

## Module 1 — Core Identity & Values (20 items)

*Goal: OCEAN anchors, Enneagram fears, non-negotiables, core self-concept.*

| # | Item / Scenario | Format | Trait Key | Category | OCEAN / MBTI | Latent Update Guide |
|:---|:---|:---|:---|:---|:---|:---|
| 1 | When a close friend asks for honest feedback on a bad idea — what do you actually say vs. what do you think? | Memory Recall / Open | `feedback_honesty_gap` | communication | — | Note the *gap* between the two halves of the answer. Large gap = diplomatic; near-zero gap = direct. |
| 2 | Pick one: (A) I've already thought 3 steps ahead before anyone else starts / (B) I figure it out as I go — the journey matters more | Pairwise | `planning_style` | cognitive | J/P | A → `{"mbti_j": +2, "system_2": +1}`<br>B → `{"mbti_p": +2, "system_1": +1}` |
| 3 | What's the one thing someone can do that makes you immediately lose respect for them? | Open | `respect_trigger` | values | — | Enneagram core fear classification |
| 4 | You have 72 hours to make a life-changing decision. Walk me through your actual process. | Memory Recall | `decision_process_real` | cognitive | — | Extracts analytical vs. intuitive heuristics |
| 5 | Rate your brutal honesty level 1–10. Now rate how others would rate it. What's the gap? | Prediction × Scale | `honesty_self` / `honesty_perceived` | values | A (reverse) | Score self-rating on A (reverse). The *gap* flags self-awareness (`self_awareness_gap`). |
| 6 | Which feels most like betrayal: (A) a protective lie / (B) an unasked painful truth / (C) staying silent about a mistake | Forced Choice | `betrayal_definition` | values | N | A → `{"trust_vulnerability": +2}`<br>B → `{"sensitivity": +2}`<br>C → `{"accountability_demand": +3}` |
| 7 | What does "winning" look like right now — not in 10 years? | Open | `winning_definition` | values | — | Current motivational anchor |
| 8 | Describe a moment you went against instinct and were right, then one where you followed your gut and were wrong. | Memory Recall | `instinct_track_record` | cognitive | N/S | Skews toward S if "instinct wrong" story dominates, N if "against instinct, right" dominates |
| 9 | How do you handle someone consistently late or disrespectful of your time? | SJT / Open | `time_boundary_response` | relationship | — | Boundary enforcement velocity |
| 10 | Relationship with rules: 1 = I follow them even if wrong, 10 = rules are someone else's problem | Scale | `rule_orientation` | cognitive | C (reverse) | High score = low conscientiousness on rule-following specifically |
| 11 | What advice do you actually want from people close to you when you're struggling? Be specific. | Open | `support_preference` | relationship | T/F | Fix-it language → `{"mbti_t": +2}`<br>Listen/validate language → `{"mbti_f": +2}` |
| 12 | What topic can you talk about for 3 hours without getting bored? | Open | `passion_topic` | values | — | Qualitative embedding anchor |
| 13 | Your personal operating system in 3 words — not adjectives you wish described you, actual ones. | Open | `self_concept_words` | values | — | High weight for prompt-injection |
| 14 | How do you feel about people significantly less ambitious than you? | Open | `ambition_judgment` | values | — | Qualitative private flag |
| 15 | What's a belief you held 5 years ago that you now think was completely wrong? | Memory Recall | `belief_evolution` | cognitive | O | Presence of genuine reversal → `{"openness": +2}`<br>"Nothing changed" → `{"openness": -1}` |
| 16 | When you're at your worst — what does that look like? What triggers it? | Open | `worst_state_triggers` | values | N | Qualitative feed for Neuroticism / stress triggers |
| 17 | Do people fundamentally change or fundamentally stay the same? What does that say about you? | Pairwise / Open | `change_philosophy` | values | — | Core worldview vector |
| 18 | What's your relationship with money — tool, scoreboard, security, or something else? | Forced Choice / Open | `money_relationship` | values | — | Financial heuristic vector |
| 19 | How important is being liked vs. being respected? Where do you actually land? | Pairwise Scale | `liked_vs_respected` | values | A | 1 = liked (`{"agreeableness": +2}`), 10 = respected (`{"agreeableness": -2, "dominance": +2}`) |
| 20 | If someone wrote the honest version of your life story right now — what would the chapter titles be? | Open Narrative | `life_narrative_honest` | values | — | Highest narrative value of Module 1 |

---

## Module 2 — Communication Style & Relationship Dynamics (25 items)

*Goal: tone fingerprint, slang, per-relationship addressing (`relationship_addressing` table).*

| # | Item / Scenario | Format | Trait Key | Category | OCEAN / MBTI | Latent Update Guide |
|:---|:---|:---|:---|:---|:---|:---|
| 21 | What do you call your closest friend when greeting them? | Open | `addressing_best_friend` | relationship_addressing | — | Populates `relationship_addressing` (`tier = best_friend`) |
| 22 | What do you want people to call you? Any nickname that feels right vs. wrong? | Open | `addressing_self_preference` | relationship_addressing | — | Populates `how_they_address_me` (e.g. `ok bhai`) |
| 23 | How do you start a message to someone you respect professionally? | Open | `addressing_professional` | relationship_addressing | — | Populates `tier = colleague` |
| 24 | How do you end a conversation with a best friend vs. a colleague? | Open | `sign_off_style` | relationship_addressing | — | Split into two `relationship_addressing` rows |
| 25 | Give an example of something you said recently that you thought was funny — don't explain it, just say it. | Memory Recall | `funny_example_raw` | humor | — | Verbatim capture, high weight |
| 26 | Do you use profanity? In what contexts? 1 = never, 10 = every sentence | Scale | `profanity_frequency` | tone | A (reverse) | Direct tone multiplier |
| 27 | What regional slang or insider vocabulary do you use that outsiders wouldn't understand? | Open | `regional_slang` | slang | — | Build personal lexicon list (`persona_dna`) |
| 28 | How do you disagree with someone you respect? Give an actual example. | Memory Recall | `disagreement_style` | communication | T/F | Directness vs. diplomacy vector |
| 29 | Texting your best friend about something exciting — what does that text look like? Type it out. | Idiolect Sample | `excited_text_sample` | tone | — | Verbatim capture for tone-matching |
| 30 | How do you want people close to you to address you? | Open | `addressing_close_preference` | relationship_addressing | — | Overlaps Q22; keeps both if answers diverge |
| 31 | Do you match someone else's energy in conversation, or hold your own register? | Pairwise | `energy_matching` | tone | E | Match → `{"extraversion": +1, "empathy": +1}`<br>Hold register → `{"extraversion": -1, "autonomy": +2}` |
| 32 | Are your messages typically one line or paragraphs? Does it depend on the person? | Idiolect Spec | `message_length_preference` | tone | — | Feeds response-length calibration directly |
| 33 | Texting style when annoyed: (A) radio silence / (B) short clipped / (C) longer, over-explaining / (D) explosive then fine | Forced Choice | `conflict_texting_style` | tone | N | A → `{"avoidance": +2}`<br>B → `{"cold_anger": +2}`<br>C → `{"anxious_attachment": +2}`<br>D → `{"volatility": +2}` |
| 34 | Do you give compliments easily or reluctantly? Receive them gracefully or deflect? | Pairwise / Open | `compliment_behavior` | tone | E | Social warmth calibration |
| 35 | List 5 words or phrases you use constantly that are very "you." | Idiolect Extraction | `signature_phrases` | slang | — | Direct lexicon feed, highest-weight tone data point |
| 36 | How do you handle someone who talks too much in a meeting or group? | SJT | `overtalker_response` | relationship | — | Group dynamics & boundary control |
| 37 | Written or verbal for serious topics? Why? | Pairwise | `serious_topic_medium` | communication | — | Communication channel preference |
| 38 | Rate your sarcasm level 1–10. Give a sample sarcastic line in your actual voice. | Scale + Sample | `sarcasm_level` | tone | — | Score 1–10 numerically; keep sample line verbatim |
| 39 | What's the fastest way to bore you in conversation? | Open | `boredom_trigger` | values | — | Conversational filter |
| 40 | How do you show you care without saying "I care about you"? | Open | `care_expression_style` | relationship | — | Love language & implicit care extraction |
| 41 | When someone vents, your default mode: (A) fix it / (B) validate & listen / (C) reframe / (D) make them laugh | Forced Choice | `venting_response_default` | relationship | T/F | A/C → `{"mbti_t": +2}`<br>B → `{"mbti_f": +2}`<br>D → `{"humor_deflection": +2}` |
| 42 | How do you apologize when wrong? What do you actually say? | Memory Recall | `apology_style` | communication | A | Accountability vs. defensive deflection |
| 43 | Your tone under high pressure — quieter, louder, funnier, or colder? | Forced Choice | `pressure_tone_shift` | tone | N | Pressure response behavior |
| 44 | Your relationship with eye contact and silence in conversation. | Open | `silence_comfort` | tone | E | Social presence comfort |
| 45 | Do you prefer direct questions, or for people to read between the lines? | Pairwise | `directness_preference` | communication | — | High context vs. low context communication |

---

## Module 3 — Decision-Making & Cognitive Heuristics (20 items)

*Goal: risk tolerance, time orientation, System 1/System 2 heuristics, decision architecture.*

| # | Item / Scenario | Format | Trait Key | Category | OCEAN / MBTI | Latent Update Guide |
|:---|:---|:---|:---|:---|:---|:---|
| 46 | Walk me through the last decision you regret — the process, not the outcome. | Memory Recall | `decision_regret_pattern` | cognitive | — | Post-mortem root cause analysis |
| 47 | More afraid of committing too early or waiting too long? | Pairwise | `commitment_fear_direction` | cognitive | C | Committing early → `{"caution": +2}`<br>Waiting too long → `{"fomo_action": +2}` |
| 48 | Incomplete information: wait for more data, or act on what you have? | Pairwise | `information_threshold` | cognitive | N/S | Data-wait → `{"mbti_s": +2, "system_2": +2}`<br>Act-now → `{"mbti_n": +2, "system_1": +2}` |
| 49 | Is your relationship with risk consistent across domains, or domain-specific? | Open / Ranking | `risk_domain_consistency` | cognitive | — | Domain-specific risk vectors (`financial`, `social`, `career`) |
| 50 | Optimize for reversibility (keep options open) or commitment (burn ships)? | Pairwise | `reversibility_preference` | cognitive | J/P | Reversible → `{"mbti_p": +2}`<br>Committed → `{"mbti_j": +2}` |
| 51 | When gut contradicts data, which wins? Give an example. | Memory Recall | `gut_vs_data` | cognitive | N/S | Gut → `{"intuition": +3}`<br>Data → `{"empiricism": +3}` |
| 52 | How many options do you want when deciding — narrow fast, or exhaustive choices? | Pairwise | `option_breadth_preference` | cognitive | O | Narrow fast → `{"pruning_speed": +2}`<br>Exhaustive → `{"openness": +2}` |
| 53 | How long to move on from a decision — revisit or file it and move? | Pairwise | `decision_closure_speed` | cognitive | N (reverse) | Fast closure → `{"neuroticism": -2, "closure": +2}` |
| 54 | Deadlines: motivating, stressful, irrelevant, or energizing? | Forced Choice | `deadline_relationship` | cognitive | C | Motivating/energizing → `{"conscientiousness": +2}`<br>Stressful/irrelevant → `{"deadline_friction": +2}` |
| 55 | Describe the physical sensation of knowing something is right. Where do you feel certainty? | Somatic Recall | `certainty_sensation` | cognitive | — | Somatic detail; qualitative only |
| 56 | How do you handle advice that contradicts your instincts? | SJT | `contradictory_advice_response` | cognitive | A | Openness to correction vs. defensive autonomy |
| 57 | Which cognitive bias affects you most? (confirmation / sunk cost / FOMO / overconfidence / loss aversion / availability) | Forced Choice | `self_identified_bias` | cognitive | — | Self-report only; flag confidence 0.4 |
| 58 | When stuck: think your way out, talk it out, sleep on it, or work your way out? | Forced Choice | `unstuck_strategy` | cognitive | — | Problem-solving modality |
| 59 | How do you feel about asking for help? Be honest about internal resistance. | Pairwise / Open | `help_asking_resistance` | cognitive | N | Internal friction against vulnerability |
| 60 | Lists and systems, or operate from your head? | Pairwise | `organization_style` | cognitive | C | Lists/systems → `{"conscientiousness": +2}`<br>Head → `{"informal_memory": +2}` |
| 61 | Time horizon when thinking about your life — day / week / year / decade? | Forced Choice | `time_horizon` | cognitive | — | Temporal discount rate calibration |
| 62 | When things go wrong, first instinct — blame self, others, circumstances, or randomness? | Forced Choice | `attribution_style` | cognitive | N | Self-blame → `{"neuroticism": +2, "internal_locus": +2}`<br>Randomness → `{"stoicism": +2}` |
| 63 | A shortcut or heuristic you use that saves time but might be wrong sometimes. | Open | `personal_heuristic` | cognitive | — | System 1 operating heuristic |
| 64 | How do you know when to quit something vs. push through? | SJT | `quit_vs_persist_criteria` | cognitive | C | Sunk cost evaluation threshold |
| 65 | Ideal working environment — time of day, setting, alone/people, music/silence. | Open | `ideal_work_environment` | cognitive | E | Environmental productivity optimization |

---

## Module 4 — Humor, Creativity & Aesthetic DNA (15 items)

*Goal: humor register, creative taste, aesthetic reference points.*

| # | Item / Scenario | Format | Trait Key | Category | OCEAN / MBTI | Latent Update Guide |
|:---|:---|:---|:---|:---|:---|:---|
| 66 | Tell me something genuinely funny that happened — not a joke. | Memory Recall | `funny_real_story` | humor | — | Verbatim humor capture |
| 67 | What kind of humor makes you actually laugh vs. politely smile? | Pairwise | `humor_authenticity_line` | humor | — | Authentic laugh threshold |
| 68 | Humor style: dry/deadpan, absurdist, sharp/roast, self-deprecating, observational, or dark? | Forced Choice | `humor_style` | humor | — | `{"humor_profile": {"dark": +2, "dry": +1}}` |
| 69 | What do you find offensive about most comedy? Where's your actual line? | Open | `humor_boundary` | humor | A | Sensitivity & ethical boundary mapping |
| 70 | What creative field outside your main work do you privately appreciate most? | Open | `secondary_creative_interest` | values | O | Openness to aesthetics |
| 71 | Name 3 creators or thinkers whose work has shaped how you see the world. | Open | `influential_figures` | values | O | Intellectual lineage anchors |
| 72 | What's your aesthetic in design/fashion/environment? 3 concrete reference points. | Open | `aesthetic_reference_points` | values | O | Visual & UI preference profile |
| 73 | How do you feel about people who take themselves too seriously? | Open | `self_seriousness_judgment` | humor | — | Sass & levity baseline |
| 74 | What's the last thing that made you genuinely laugh out loud? | Memory Recall | `recent_genuine_laugh` | humor | — | Time-decaying signal |
| 75 | If a stranger had to describe your humor style, what would they say? | Prediction | `humor_style_external_view` | humor | — | Compare against Q68 for consistency check |
| 76 | Do you prefer niche/obscure references or widely understood ones? | Pairwise | `reference_obscurity_preference` | humor | O | Niche/obscure → `{"openness": +2, "insider_slang": +2}` |
| 77 | What topics are off-limits for humor in your world? | Open | `humor_hard_limits` | humor | — | Absolute boundaries |
| 78 | How do you use humor in tension or conflict? | SJT | `humor_as_conflict_tool` | humor | — | De-escalation vs. weaponization |
| 79 | What film, book, or song best captures your current emotional state? | Open | `current_state_reference_work` | values | — | Time-decaying emotional anchor |
| 80 | If your personality was a genre of music, what would it be and why? | Open | `personality_music_genre` | values | — | Aesthetic summary metaphor |

---

## Module 5 — Continuous Learning Signal (10 items, re-run every 30 days)

*Goal: keep profile current without re-running the full interview (`superseded_by` tracking).*

| # | Item / Scenario | Format | Trait Key | Category | Scoring Note |
|:---|:---|:---|:---|:---|:---|
| 81 | What changed for you in the last month that you didn't expect? | Open | `recent_unexpected_change` | values | Time-stamped; supersedes nothing, adds dated entry |
| 82 | What are you currently obsessed with — intellectually, creatively, professionally? | Open | `current_obsession` | values | Overwrites previous month (`superseded_by`) |
| 83 | Who have you been spending the most time with? How are they influencing you? | Open | `current_social_influence` | relationship | Logs active relationship drift |
| 84 | What opinion have you changed recently? | Memory Recall | `recent_opinion_change` | cognitive | Compare against Q15 for belief-drift trend |
| 85 | What's draining you right now that you haven't addressed? | Open | `current_drain_source` | values | Active cognitive load / stressor |
| 86 | What's the one thing you keep telling yourself you'll do but haven't started? | Open | `stated_unstarted_intention` | cognitive | Procrastination & intention-action gap |
| 87 | How is your relationship with yourself different from 6 months ago? | Open | `self_relationship_delta` | values | Self-concept evolution |
| 88 | What have you said no to recently that you're proud of? | Memory Recall | `recent_boundary_held` | values | Boundary reinforcement evidence |
| 89 | What do you want Atlas to notice that it's been missing about you? | Open | `user_feedback_missing_signal` | meta | Direct system instruction |
| 90 | Is the persona accurate right now? What's off? | Contradiction / Correction | `persona_accuracy_feedback` | meta | Route feedback straight into re-scoring the flagged trait |
