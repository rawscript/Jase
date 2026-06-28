import { z } from "zod";

export const commandSchema = z.object({
  action: z.enum(["NAVIGATE", "FILTER", "INFO", "UNKNOWN"]),
  target: z.string().optional(),
  message: z.string(),
});

export type CommandResponse = z.infer<typeof commandSchema>;

const SYSTEM_PROMPT = `You are the terminal AI for James Mwaura's interactive portfolio map.
Your job is to parse the user's natural language command and output a JSON object representing the action to take.
DO NOT output conversational filler like "Analyzing query...". Output ONLY valid JSON.

Valid Actions:
- NAVIGATE: To zoom/pan the map to a specific project. Targets: "msitubora", "aurora", "mailforge", "nestie"
- FILTER: To show only specific types of pins. Targets: "project", "skill", "infrastructure"
- INFO: To show general information or contact info. Targets: "contact", "about"
- UNKNOWN: If the command is not understood.

JSON Schema:
{
  "action": "NAVIGATE" | "FILTER" | "INFO" | "UNKNOWN",
  "target": "string (optional)",
  "message": "A short, hacker-like terminal confirmation message (e.g., 'Executing: Zooming to Msitubora Forest...')"
}

Examples:
User: "take me to that forest project"
Response: {"action": "NAVIGATE", "target": "msitubora", "message": "Executing: Navigating to Msitubora Forest coordinates."}

User: "show me your cloud skills"
Response: {"action": "FILTER", "target": "infrastructure", "message": "Executing: Filtering map to Cloud Infrastructure layers."}

User: "how do I contact you?"
Response: {"action": "INFO", "target": "contact", "message": "Executing: Displaying contact information."}
`;

export async function processCommand(input: string): Promise<CommandResponse> {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback if no API key is provided
    const lower = input.toLowerCase();
    if (lower.includes('msitubora') || lower.includes('forest')) {
      return { action: "NAVIGATE", target: "msitubora", message: "Navigating to Msitubora Forest." };
    }
    if (lower.includes('cloud') || lower.includes('infrastructure')) {
      return { action: "FILTER", target: "infrastructure", message: "Filtering for cloud infrastructure." };
    }
    return { action: "UNKNOWN", message: "No API key configured. Try typing 'msitubora' or 'cloud'." };
  }

  const isNvidia = !!process.env.NVIDIA_API_KEY;
  const baseUrl = isNvidia
    ? 'https://integrate.api.nvidia.com/v1'
    : 'https://api.openai.com/v1';
  const model = isNvidia ? 'meta/llama-3.1-70b-instruct' : 'gpt-4o-mini';

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: input }
        ],
        temperature: 0.1,
        max_tokens: 150,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('LLM API error:', err);
      return { action: "UNKNOWN", message: "Error communicating with AI service." };
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    
    try {
      const parsed = JSON.parse(content);
      const validated = commandSchema.parse(parsed);
      return validated;
    } catch (parseError) {
      console.error("Failed to parse JSON command response:", content);
      return { action: "UNKNOWN", message: "Error parsing command." };
    }
  } catch (error) {
    console.error('Command error:', error);
    return { action: "UNKNOWN", message: "System error executing command." };
  }
}
