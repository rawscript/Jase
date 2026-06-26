import { Router } from 'express';
import { llmService } from '../services/llm.service';
import { rateLimit } from '../middleware/rateLimit';
import { validateRequest } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

// Conversation message schema
const conversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
});

// Conversation request schema
const conversationRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  conversationHistory: z.array(conversationMessageSchema).optional().default([]),
  currentDepth: z.number().min(0).max(3).optional().default(0),
  currentTopic: z.string().optional(),
  locations: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    type: z.enum(['skill', 'project', 'experience', 'specialty']),
    color: z.string(),
    details: z.object({
      title: z.string(),
      description: z.string(),
      technologies: z.array(z.string()).optional(),
      timeline: z.string().optional(),
      impact: z.string().optional(),
    }),
  })).optional().default([]),
});

// Start a new conversation
router.post('/start', 
  rateLimit({ windowMs: 60000, max: 10 }), // 10 requests per minute
  validateRequest(conversationRequestSchema.pick({ message: true, locations: true })),
  async (req, res) => {
    try {
      const { message, locations } = req.body;

      const context = {
        locations: locations || [],
        conversationHistory: [],
        currentDepth: 0,
        currentTopic: undefined,
      };

      const response = await llmService.generateResponse(message, context);

      res.json({
        success: true,
        data: {
          response: response.content,
          options: response.options,
          conversationHistory: [
            { role: 'user', content: message },
            { role: 'assistant', content: response.content },
          ],
          currentDepth: 1,
          currentTopic: context.currentTopic,
        },
      });
    } catch (error) {
      console.error('Conversation start error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to start conversation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Continue an existing conversation
router.post('/continue',
  rateLimit({ windowMs: 60000, max: 20 }), // 20 requests per minute
  validateRequest(conversationRequestSchema),
  async (req, res) => {
    try {
      const { message, conversationHistory, currentDepth, currentTopic, locations } = req.body;

      const context = {
        locations: locations || [],
        conversationHistory: conversationHistory || [],
        currentDepth: currentDepth || 0,
        currentTopic: currentTopic || undefined,
      };

      const response = await llmService.generateResponse(message, context);

      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: response.content },
      ];

      res.json({
        success: true,
        data: {
          response: response.content,
          options: response.options,
          conversationHistory: updatedHistory,
          currentDepth: Math.min(currentDepth + 1, 3),
          currentTopic: context.currentTopic,
        },
      });
    } catch (error) {
      console.error('Conversation continue error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to continue conversation',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// Reset conversation
router.post('/reset',
  rateLimit({ windowMs: 60000, max: 5 }),
  async (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'Conversation reset successfully',
        conversationHistory: [],
        currentDepth: 0,
        currentTopic: undefined,
      },
    });
  }
);

// Test LLM connection
router.get('/test', async (req, res) => {
  try {
    const isConnected = await llmService.testConnection();
    
    if (isConnected) {
      res.json({
        success: true,
        message: 'LLM service is connected and working',
        provider: process.env.NVIDIA_API_KEY ? 'NVIDIA API' : 'OpenAI',
        model: process.env.NVIDIA_MODEL || process.env.OPENAI_MODEL,
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'LLM service is not available',
        message: 'Check your API credentials and connection',
      });
    }
  } catch (error) {
    console.error('LLM test error:', error);
    res.status(500).json({
      success: false,
      error: 'LLM test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get conversation templates (predefined questions)
router.get('/templates', async (req, res) => {
  const templates = [
    {
      id: 'geo-spatial-intro',
      text: 'Tell me about Geo Spatial Engineering',
      description: 'Learn about spatial data analysis and GIS expertise',
      depth: 0,
    },
    {
      id: 'cloud-intro',
      text: 'What about Cloud Engineering?',
      description: 'Explore cloud infrastructure and serverless architecture',
      depth: 0,
    },
    {
      id: 'projects-overview',
      text: 'Show me some key projects',
      description: 'Browse impactful projects and their technologies',
      depth: 0,
    },
    {
      id: 'technical-implementation',
      text: 'Tell me about the technical implementation',
      description: 'Dive deeper into technical aspects',
      depth: 1,
    },
    {
      id: 'real-world-examples',
      text: 'Show me practical examples',
      description: 'See how skills are applied in real projects',
      depth: 1,
    },
    {
      id: 'business-impact',
      text: 'What was the business impact?',
      description: 'Understand the value and outcomes',
      depth: 2,
    },
  ];

  res.json({
    success: true,
    data: templates,
  });
});

export default router;