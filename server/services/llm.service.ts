import OpenAI from 'openai';

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ConversationContext {
  locations: Array<{
    id: string;
    name: string;
    description: string;
    type: 'skill' | 'project' | 'experience' | 'specialty';
    color: string;
    details: {
      title: string;
      description: string;
      technologies?: string[];
      timeline?: string;
      impact?: string;
    };
  }>;
  conversationHistory: ConversationMessage[];
  currentDepth: number;
  currentTopic?: string;
}

interface LLMResponse {
  content: string;
  options?: Array<{
    id: string;
    text: string;
    description: string;
    followUpType: 'clarify' | 'deepen' | 'explain' | 'example';
  }>;
}

export class LLMService {
  private client: OpenAI;
  private model: string;
  private temperature: number;
  private topP: number;
  private maxTokens: number;
  private useNVIDIA: boolean;

  constructor() {
    // Check if NVIDIA API key is configured (not the placeholder)
    const nvidiaApiKey = process.env.NVIDIA_API_KEY;
    this.useNVIDIA = nvidiaApiKey && nvidiaApiKey !== 'your_nvidia_api_key_here';
    
    if (this.useNVIDIA) {
      console.log('📱 Using NVIDIA API with DeepSeek V4 Pro');
      // NVIDIA API configuration - OpenAI-compatible
      this.client = new OpenAI({
        baseURL: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
        apiKey: nvidiaApiKey,
      });
      this.model = process.env.NVIDIA_MODEL || 'deepseek-ai/deepseek-v4-pro';
      this.temperature = parseFloat(process.env.NVIDIA_TEMPERATURE || '1.0');
      this.topP = parseFloat(process.env.NVIDIA_TOP_P || '0.95');
      this.maxTokens = parseInt(process.env.NVIDIA_MAX_TOKENS || '16384');
    } else {
      console.log('⚠️  NVIDIA API not configured, using fallback responses');
      // Create a mock client for fallback mode
      this.client = new OpenAI({
        apiKey: 'mock-key-for-fallback',
        baseURL: 'http://mock-url',
      });
      this.model = 'fallback-model';
      this.temperature = 0.7;
      this.topP = 1;
      this.maxTokens = 1000;
    }

    console.log(`LLM Service initialized with ${this.useNVIDIA ? 'NVIDIA API' : 'fallback mode'}, model: ${this.model}`);
  }

  private getSystemPrompt(context: ConversationContext): string {
    const portfolioSpecialties = context.locations
      .filter(loc => loc.type === 'specialty')
      .map(loc => `- ${loc.name}: ${loc.details.description}`)
      .join('\n');

    const portfolioSkills = context.locations
      .filter(loc => loc.type === 'skill')
      .map(loc => `- ${loc.name}: ${loc.details.description} (Technologies: ${loc.details.technologies?.join(', ') || 'N/A'})`)
      .join('\n');

    const portfolioProjects = context.locations
      .filter(loc => loc.type === 'project')
      .map(loc => `- ${loc.name}: ${loc.details.description} (Timeline: ${loc.details.timeline}, Impact: ${loc.details.impact})`)
      .join('\n');

    return `You are a helpful portfolio assistant for Jase, a professional with expertise in Geo Spatial Data Engineering and Cloud Engineering.

# PORTFOLIO CONTEXT:
## Core Specialties:
${portfolioSpecialties}

## Technical Skills:
${portfolioSkills}

## Key Projects:
${portfolioProjects}

# CONVERSATION GUIDELINES:
1. Current conversation depth: ${context.currentDepth} (0-2, where 0=surface, 1=intermediate, 2=deep)
2. Current topic: ${context.currentTopic || 'general exploration'}

# RESPONSE FORMATTING:
- Use **bold** for emphasis and section headers
- Use bullet points for lists
- Include relevant technical details for depth > 0
- For depth 2, include specific examples and impact metrics
- Always maintain a professional, helpful tone

# DEPTH-BASED RESPONSE STRATEGY:
- Depth 0 (Surface): High-level overview, basic concepts, introduction to specialties
- Depth 1 (Intermediate): Technical explanations, specific tools/frameworks, project details
- Depth 2 (Deep): Advanced concepts, business impact, architectural decisions, lessons learned

# OPTION GENERATION:
After your main response, generate 2-4 follow-up options that:
1. Clarify ambiguities or assumptions
2. Deepen understanding of current topic
3. Provide practical examples
4. Explore related topics

Format options as JSON-ready objects with: id, text, description, followUpType

# IMPORTANT: You are talking about REAL expertise and projects. Be specific and accurate based on the portfolio context provided.`;
  }

  async generateResponse(
    userMessage: string,
    context: ConversationContext
  ): Promise<LLMResponse> {
    // If NVIDIA API is not configured, use fallback immediately
    if (!this.useNVIDIA) {
      console.log('Using fallback response (NVIDIA API not configured)');
      return this.getFallbackResponse(userMessage, context);
    }

    try {
      const messages: Array<OpenAI.ChatCompletionMessageParam> = [
        {
          role: 'system',
          content: this.getSystemPrompt(context),
        },
        ...context.conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: 'user',
          content: userMessage,
        },
      ];

      console.log(`Generating LLM response (depth: ${context.currentDepth}, model: ${this.model})`);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature: this.temperature,
        top_p: this.topP,
        max_tokens: this.maxTokens,
        stream: false,
        extra_body: {
          chat_template_kwargs: {
            thinking: false
          }
        },
      });

      const content = completion.choices[0].message.content || 'I apologize, but I could not generate a response.';

      console.log(`LLM Response received: ${content.substring(0, 100)}...`);

      // Parse options from the response if present
      const options = this.extractOptions(content);

      return {
        content: this.cleanContent(content),
        options: options.length > 0 ? options : this.generateDefaultOptions(context),
      };
    } catch (error: any) {
      console.error('LLM API Error:', error.message || error);
      console.error('Error details:', error.response?.data || error);
      return this.getFallbackResponse(userMessage, context);
    }
  }

  private extractOptions(content: string): LLMResponse['options'] {
    try {
      // Look for JSON-like option section
      const optionMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                          content.match(/OPTIONS:\s*\n([\s\S]*?)(?=\n\n|$)/);
      
      if (optionMatch) {
        const optionsText = optionMatch[1].trim();
        const options = JSON.parse(optionsText);
        
        if (Array.isArray(options) && options.length > 0) {
          return options.map((opt: any) => ({
            id: opt.id || `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: opt.text || 'Follow up question',
            description: opt.description || 'Learn more about this topic',
            followUpType: (opt.followUpType || 'deepen') as 'clarify' | 'deepen' | 'explain' | 'example',
          }));
        }
      }
    } catch (error) {
      console.log('Could not parse options from response, using defaults');
    }
    
    return [];
  }

  private cleanContent(content: string): string {
    // Remove option JSON section if present
    return content.replace(/```json\n[\s\S]*?\n```/g, '').trim();
  }

  private generateDefaultOptions(context: ConversationContext): LLMResponse['options'] {
    const baseOptions = [
      {
        id: 'technical-details',
        text: 'Tell me more about the technical implementation',
        description: 'Dive deeper into the technical aspects',
        followUpType: 'deepen' as const,
      },
      {
        id: 'real-world-examples',
        text: 'Show me practical examples',
        description: 'See how these skills are applied in real projects',
        followUpType: 'example' as const,
      },
      {
        id: 'business-impact',
        text: 'What was the business impact?',
        description: 'Understand the value and outcomes',
        followUpType: 'explain' as const,
      },
    ];

    if (context.currentDepth === 0) {
      // Surface level - introduce topics
      return [
        {
          id: 'geo-spatial-intro',
          text: 'Tell me about Geo Spatial Engineering',
          description: 'Learn about spatial data analysis and GIS expertise',
          followUpType: 'deepen' as const,
        },
        {
          id: 'cloud-intro',
          text: 'What about Cloud Engineering?',
          description: 'Explore cloud infrastructure and serverless architecture',
          followUpType: 'deepen' as const,
        },
        {
          id: 'projects-overview',
          text: 'Show me some key projects',
          description: 'Browse impactful projects and technologies',
          followUpType: 'example' as const,
        },
      ];
    }

    return baseOptions;
  }

  private getFallbackResponse(userMessage: string, context: ConversationContext): LLMResponse {
    console.log('Using fallback response');
    
    const lowerMessage = userMessage.toLowerCase();
    const geoKeywords = ['geo', 'spatial', 'gis', 'map', 'satellite', 'lidar'];
    const cloudKeywords = ['cloud', 'aws', 'gcp', 'azure', 'serverless', 'kubernetes', 'docker'];
    const dataKeywords = ['data', 'pipeline', 'etl', 'database', 'warehouse'];
    const mlKeywords = ['machine learning', 'ai', 'ml', 'model', 'deep learning'];

    let content = '';
    let topic = 'general';

    if (geoKeywords.some(keyword => lowerMessage.includes(keyword))) {
      topic = 'geo-spatial';
      content = `## Geo Spatial Data Engineering

As a Geo Spatial Data Engineer, Jase specializes in processing and analyzing spatial data. Key areas include:

- **Spatial Data Processing**: Working with satellite imagery, LiDAR data, and GIS datasets
- **GIS Mapping**: Creating interactive maps and spatial visualizations using tools like QGIS and Mapbox
- **Cloud Integration**: Processing terabytes of spatial data on AWS/GCP platforms
- **Real-time Analytics**: Building systems for urban planning, disaster response, and environmental monitoring

**Technologies**: Python, PostGIS, GDAL, GeoPandas, Mapbox, AWS S3, Google Earth Engine

Would you like to dive deeper into any specific aspect of spatial data engineering?`;
    } else if (cloudKeywords.some(keyword => lowerMessage.includes(keyword))) {
      topic = 'cloud';
      content = `## Cloud Engineering Expertise

Jase's Cloud Engineering focuses on scalable, reliable infrastructure:

- **Infrastructure as Code**: Automated deployment with Terraform and CloudFormation
- **Serverless Architecture**: Building event-driven, cost-efficient applications
- **Container Orchestration**: Managing workloads with Kubernetes and Docker
- **Multi-Cloud Strategy**: Experience with AWS, GCP, and hybrid cloud environments
- **Cost Optimization**: Reducing cloud expenses through strategic optimization

**Key Platforms**: AWS (EC2, S3, Lambda, RDS), GCP (Compute Engine, Cloud Functions, BigQuery)

What specific aspect of cloud engineering interests you?`;
    } else if (dataKeywords.some(keyword => lowerMessage.includes(keyword))) {
      topic = 'data-pipeline';
      content = `## Data Pipeline Architecture

Expertise in building robust data pipelines:

- **ETL/ELT Pipelines**: Designing and implementing data transformation workflows
- **Real-time Processing**: Using Apache Kafka for streaming data
- **Batch Processing**: Scheduling workflows with Apache Airflow
- **Modern Data Stack**: Integration with dbt, Snowflake, BigQuery
- **Data Quality**: Implementing monitoring and validation checks

These pipelines handle billions of events daily with high reliability.`;
    } else if (mlKeywords.some(keyword => lowerMessage.includes(keyword))) {
      topic = 'ml-ops';
      content = `## ML Ops & AI Engineering

Production machine learning expertise includes:

- **Model Deployment**: Serving models with TensorFlow Serving, TorchServe
- **Model Monitoring**: Tracking performance drift and data quality
- **Automated Retraining**: CI/CD pipelines for ML models
- **Scalable Infrastructure**: Kubernetes-based model serving
- **Experiment Tracking**: Using MLflow for reproducible experiments

This combines cloud engineering with data science workflows for production ML systems.`;
    } else {
      content = `I can help you explore Jase's portfolio expertise. Key areas include:

1. **Geo Spatial Data Engineering**: Spatial data analysis, GIS mapping, satellite imagery processing
2. **Cloud Engineering**: AWS/GCP infrastructure, serverless architecture, containerization
3. **Data Pipeline Architecture**: ETL/ELT pipelines, real-time data processing
4. **ML Ops**: Machine learning deployment, model serving, monitoring
5. **Project Experience**: Smart cities platform, disaster response system, climate modeling infrastructure

What would you like to learn more about?`;
    }

    return {
      content,
      options: this.generateDefaultOptions({ ...context, currentTopic: topic }),
    };
  }

  // Utility method for testing
  async testConnection(): Promise<boolean> {
    // If NVIDIA API is not configured, return false for test
    if (!this.useNVIDIA) {
      console.log('NVIDIA API not configured, connection test returns false');
      return false;
    }

    try {
      console.log('Testing NVIDIA API connection...');
      await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 10,
        extra_body: {
          chat_template_kwargs: {
            thinking: false
          }
        },
      });
      console.log('✅ NVIDIA API connection test successful');
      return true;
    } catch (error: any) {
      console.error('❌ NVIDIA API Connection Test Failed:', error.message || error);
      console.error('Error details:', error.response?.data || error);
      return false;
    }
  }
}

// Singleton instance
export const llmService = new LLMService();