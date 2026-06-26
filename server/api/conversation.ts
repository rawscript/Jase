/**
 * Conversation helper — calls the NVIDIA NIM API (DeepSeek V3) or
 * falls back to rich pre-written responses about James Mwaura when
 * no API key is configured.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are Jase, an AI assistant representing James Mwaura's portfolio.
James (also called Jase) is a Geo Spatial Data Engineer and Cloud Engineer based in Kenya.

## About James
- Full-stack developer specialising in Geo Spatial data engineering, cloud infrastructure, and AI/ML
- Based in Kenya, building technology for Africa and beyond
- GitHub: github.com/rawscript

## Projects
1. **Msitubora Forest** (msitubora.onrender.com)
   - Kakamega Forest monitoring platform using satellite API integration
   - Tech: Blockchain, IoT, React, TypeScript, Satellite APIs
   - Impact: Enables real-time conservation monitoring of Kakamega Forest

2. **Aurora Energy** (auroraenergy.app)
   - Energy management system optimised for African homes and SMEs
   - Tech: Node.js, ES6, PostgreSQL, React
   - Impact: Helps households track and reduce energy consumption

3. **Mailforge AI** (mailforge.studio)
   - AI-powered text-to-presentation platform for businesses
   - Tech: AI/ML, GenAI, PostgreSQL, React, TypeScript
   - Impact: Generates professional presentations in seconds from plain text

4. **Nestie Homes** (nestie.in)
   - Modern real estate platform with Stripe and M-Pesa (Daraja) payments
   - Tech: Node.js, React, Next.js, Stripe, Daraja API
   - Impact: Simplifies property discovery and rental payments in Kenya

## Skills & Expertise
- **Geo Spatial**: Satellite APIs, GIS, PostGIS, Python, GDAL, remote sensing
- **Cloud**: AWS, GCP, Docker, Kubernetes, CI/CD pipelines
- **Data Engineering**: PostgreSQL, Python, Apache Airflow, ETL pipelines
- **AI/ML**: GenAI, LLM integration, ML Ops, model deployment
- **Full Stack**: React, TypeScript, Node.js, Next.js

## Personality
James is direct, passionate about African tech, and loves building things that solve real problems.
Answer questions naturally, conversationally, and enthusiastically about his work.
Keep responses concise (2–4 paragraphs max) unless asked for detail.
If asked something unrelated to James or tech, gently redirect back to his portfolio.`;

// Hardcoded fallback responses when no API key is configured
const FALLBACK_RESPONSES: Record<string, string> = {
  default: `Hey! I'm Jase — James's AI assistant. I can tell you all about his work as a Geo Spatial Data Engineer and Cloud Engineer. Ask me about any of his projects like Msitubora, Aurora Energy, Mailforge AI, or Nestie Homes. Or ask about his skills in satellite data, cloud infrastructure, or AI/ML!`,
  msitubora: `Msitubora Forest is James's most ambitious environmental project — a real-time monitoring platform for Kakamega Forest in Kenya. It uses satellite API integration combined with blockchain for immutable data records, IoT sensors for ground-truth data, and a React/TypeScript frontend for rangers and researchers. The name "Msitubora" means "good forest" in Swahili. You can check it out at msitubora.onrender.com.`,
  aurora: `Aurora Energy is James's energy management platform built for African homes and SMEs. Given the energy challenges across Africa — from load shedding to expensive grid tariffs — this app helps households track consumption patterns and optimise their energy use. Built with Node.js, PostgreSQL, and React. Live at auroraenergy.app.`,
  mailforge: `Mailforge AI is one of James's AI projects — it takes plain text and transforms it into polished, professional presentations using generative AI. Built for businesses that spend hours formatting slides, it cuts that time to seconds. The stack includes GenAI models, PostgreSQL for persistence, and a full React/TypeScript frontend. Visit mailforge.studio to see it in action.`,
  nestie: `Nestie Homes is a real estate platform targeting the Kenyan market. It integrates both Stripe (international payments) and Daraja (M-Pesa, Kenya's dominant mobile money) for seamless rent payments. Built with Next.js, Node.js, and React. Check it out at nestie.in.`,
  geo: `James's geo spatial expertise covers satellite data processing, GIS analysis using PostGIS, Python scripting with GDAL, and remote sensing. This isn't just theoretical — projects like Msitubora rely on his ability to process and interpret real satellite imagery for environmental monitoring.`,
  cloud: `James is experienced with AWS and GCP for cloud deployment, Docker for containerisation, Kubernetes for orchestration, and CI/CD pipelines for automated deployments. All his projects are fully cloud-deployed with proper DevOps practices.`,
  contact: `You can reach James directly through the Contact tab — your message goes straight to his Gmail inbox. Or find him on GitHub at github.com/rawscript.`,
};

function getFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('msitubora') || msg.includes('forest')) return FALLBACK_RESPONSES.msitubora;
  if (msg.includes('aurora') || msg.includes('energy')) return FALLBACK_RESPONSES.aurora;
  if (msg.includes('mailforge') || msg.includes('presentation')) return FALLBACK_RESPONSES.mailforge;
  if (msg.includes('nestie') || msg.includes('real estate') || msg.includes('home')) return FALLBACK_RESPONSES.nestie;
  if (msg.includes('geo') || msg.includes('satellite') || msg.includes('gis')) return FALLBACK_RESPONSES.geo;
  if (msg.includes('cloud') || msg.includes('aws') || msg.includes('docker')) return FALLBACK_RESPONSES.cloud;
  if (msg.includes('contact') || msg.includes('reach') || msg.includes('email')) return FALLBACK_RESPONSES.contact;
  return FALLBACK_RESPONSES.default;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    return getFallbackResponse(lastUserMessage?.content || '');
  }

  // NVIDIA NIM uses an OpenAI-compatible API
  const isNvidia = !!process.env.NVIDIA_API_KEY;
  const baseUrl = isNvidia
    ? 'https://integrate.api.nvidia.com/v1'
    : 'https://api.openai.com/v1';
  const model = isNvidia ? 'deepseek-ai/deepseek-r1' : 'gpt-4o-mini';

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        temperature: 0.7,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('LLM API error:', err);
      const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
      return getFallbackResponse(lastUserMessage?.content || '');
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return data.choices?.[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error('Chat error:', error);
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    return getFallbackResponse(lastUserMessage?.content || '');
  }
}
