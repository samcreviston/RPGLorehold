# Lair Co-Dragon AI workflow

## Request flow

1. An authenticated user enters a request in the Lair Co-Dragon sidebar.
2. The client submits `category`, `templateId`, and `prompt` to `POST /api/ai/generate`.
3. The server rejects prompts longer than 6,000 characters, unknown templates, and users above the 10-request-per-minute limit.
4. The prompt builder selects the template instructions below and combines them with the shared system instructions.
5. `openAIService` is the only code that sends a request to OpenAI. It applies the template's output-token cap.
6. Text responses are returned to chat. Structured responses are parsed and validated before being returned.
7. If structured JSON fails validation, the server makes one corrective retry. If it still fails, the user receives an error and no preview is rendered.
8. Valid generated content opens locally in the Content Window; it is not saved to the database.

Every request is logged to the server process output as sanitized metadata: timestamp, user ID, template, prompt length, output-token cap, provider token usage when available, elapsed time, and outcome. Prompt and generated-content bodies are not logged.

## Shared system instructions

Every request begins with this system instruction:

> You are Lair Co-Dragon, a helpful Dungeons & Dragons 5e writing assistant. [Template instruction] [Output contract] Do not claim content is official D&D material.

Text templates also add:

> Do not include analysis, notes, or markdown fences.

Structured templates also add:

> Return valid JSON only. Never use markdown fences.

The user's request is sent as the user message without modification, except for the single corrective retry described below.

## Writing templates

| Template | Backend instruction | Output cap |
| --- | --- | ---: |
| Edit Paragraph | Edit the supplied paragraph for clarity, grammar, and evocative fantasy prose. Return only the revised paragraph. | 800 |
| Edit Adventure | Edit the supplied adventure material for clarity, structure, consistency, and table usability. Return only the revised adventure text. | 2,000 |
| Generate Paragraph | Write one polished, game-ready fantasy paragraph satisfying the request. Return only that paragraph. | 800 |
| Generate Adventure | Generate concise, playable fantasy adventure material satisfying the request. Return only the adventure text. | 2,000 |

## Content-creation templates

All content templates return JSON only. The resulting JSON is validated before it reaches the browser.

| Template | Backend instruction | Output cap |
| --- | --- | ---: |
| Non-Magic Item Creation | Determine whether this is a general item, weapon, or armor. Return the matching JSON object only. | 300 |
| Magic Item Creation | Determine whether this is a general item, weapon, or armor. Return the matching JSON object only. | 300 |
| Cursed Item Creation | Determine whether this is a general item, weapon, or armor. Include its curse in effects. Return the matching JSON object only. | 300 |
| Monster Creation | Return a complete 5e-compatible monster stat block JSON object only. Do not omit any required fields, do not use markdown, and do not include commentary. If a detail is unspecified, infer a reasonable fantasy value rather than leaving it blank. | 800 |
| NPC (Story-only) Creation | Return an NPC story profile JSON object only. | 500 |
| NPC (Stats-only) Creation | Return a complete 5e-compatible NPC stat block JSON object only. Do not omit any required fields, do not use markdown, and do not include commentary. If a detail is unspecified, infer a reasonable fantasy value rather than leaving it blank. | 800 |
| NPC (Stats & Story) Creation | Return an NPC JSON object with story and a complete 5e-compatible stat block only. Do not omit any required fields, do not use markdown, and do not include commentary. If a detail is unspecified, infer a reasonable fantasy value rather than leaving it blank. | 1,000 |
| Spell Creation | Return a 5e-compatible spell JSON object only. | 500 |

### Content JSON contracts

- **Item:** `itemType`, `name`, `rarity`, `description`, and `effects`. `itemType` must be `item`, `weapon`, or `armor`. Weapons also require `damageDice` and `damageType`; armor requires `armorClass`.
- **Monster / NPC stats:** `name`, `size`, `type`, `alignment`, `armorClass`, `hitPoints`, `speed`, `abilityScores`, `description`, `effects`, and `actions`. `abilityScores` includes strength, dexterity, constitution, intelligence, wisdom, and charisma.
- **NPC story:** `name`, `description`, `personality`, `ideals`, `bonds`, `flaws`, and `effects`.
- **NPC stats & story:** the NPC-story fields plus `stats`, which follows the full stat-block contract.
- **Spell:** `name`, `level`, `school`, `castingTime`, `range`, `duration`, `components`, `description`, and `effects`.
- **Effects and actions:** arrays of `{ "name": "...", "description": "..." }`.

## Idea and name templates

| Template | Backend instruction | Output cap |
| --- | --- | ---: |
| Adventure Idea Generator | Generate concise, playable adventure ideas. Return only the ideas. | 300 |
| Module Idea Generator | Generate concise tabletop module ideas. Return only the ideas. | 300 |
| Item Name Generator | Generate evocative item names. Return only the names. | 300 |
| Monster Name Generator | Generate evocative monster names. Return only the names. | 300 |
| Familiar Name Generator | Generate evocative familiar names. Return only the names. | 300 |
| Race Name Generator | Generate evocative fantasy ancestry names. Return only the names. | 300 |
| Setting Idea Generator | Generate concise fantasy setting ideas. Return only the ideas. | 500 |
| Location Idea Generator | Generate concise fantasy location ideas. Return only the ideas. | 500 |

## Corrective retry prompt

Only structured generation can retry. If the first output is invalid JSON or fails its contract, the same template/system instructions are sent with this user message:

> [Original user request]
>
> Your prior response failed validation: [validation error]. Return a corrected JSON object only that follows all required fields.

There is one retry maximum.
