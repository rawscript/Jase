import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search as SearchIcon, Send, Bot, User, HelpCircle, ChevronRight, Sparkles } from 'lucide-react';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  depth: number; // 0-2 for three-layer deep conversations
  options?: ConversationOption[];
}

interface ConversationOption {
  id: string;
  text: string;
  description: string;
  followUpType: 'clarify' | 'deepen' | 'explain' | 'example';
}

interface MapLocation {
  id: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  type: 'skill' | 'project' | 'experience' | 'specialty';
  color: string;
  details: {
    title: string;
    description: string;
    technologies?: string[];
    timeline?: string;
    impact?: string;
  };
}

interface ConversationSearchProps {
  isOpen: boolean;
  onClose: () => void;
  locations: MapLocation[];
}

const ConversationSearch: React.FC<ConversationSearchProps> = ({ 
  isOpen, 
  onClose, 
  locations 
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your portfolio guide. I can help you explore Jase's expertise as a **Geo Spatial Data Engineer** and **Cloud Engineer**. What would you like to know about?",
      timestamp: new Date(),
      depth: 0,
      options: [
        {
          id: 'geo-spatial',
          text: 'Tell me about Geo Spatial Engineering',
          description: 'Explore spatial data analysis and GIS expertise',
          followUpType: 'deepen'
        },
        {
          id: 'cloud',
          text: 'What about Cloud Engineering?',
          description: 'Learn about cloud infrastructure and serverless architecture',
          followUpType: 'deepen'
        },
        {
          id: 'projects',
          text: 'Show me some key projects',
          description: 'Browse impactful projects and their technologies',
          followUpType: 'explain'
        },
        {
          id: 'custom',
          text: 'Ask me something specific',
          description: 'Type your own question about any topic',
          followUpType: 'clarify'
        }
      ]
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationDepth, setConversationDepth] = useState(0);
  const [currentContext, setCurrentContext] = useState<string>('general');

  const handleOptionSelect = async (option: ConversationOption) => {
    // Add user message
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: option.text,
      timestamp: new Date(),
      depth: conversationDepth
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/conversation/continue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: option.text,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          currentDepth: conversationDepth,
          currentTopic: currentContext,
          locations: locations,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const aiMessage: ConversationMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          depth: conversationDepth + 1,
          options: data.data.options || []
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setConversationDepth(data.data.currentDepth || conversationDepth + 1);
        setCurrentContext(data.data.currentTopic || currentContext);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Conversation API error:', error);
      // Fallback to local response if API fails
      const aiResponse = generateAIResponse(option, conversationDepth);
      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        depth: conversationDepth + 1,
        options: aiResponse.options
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setConversationDepth(conversationDepth + 1);
      setCurrentContext(option.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      depth: conversationDepth
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const endpoint = messages.length <= 1 ? '/api/conversation/start' : '/api/conversation/continue';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          currentDepth: conversationDepth,
          currentTopic: currentContext,
          locations: locations,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        const aiMessage: ConversationMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          depth: conversationDepth + 1,
          options: data.data.options || []
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setConversationDepth(data.data.currentDepth || conversationDepth + 1);
        setCurrentContext(data.data.currentTopic || currentContext);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Conversation API error:', error);
      // Fallback to local response if API fails
      const aiResponse = generateCustomResponse(inputValue, conversationDepth);
      const aiMessage: ConversationMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        depth: conversationDepth + 1,
        options: aiResponse.options
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setConversationDepth(conversationDepth + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = (option: ConversationOption, depth: number) => {
    const location = locations.find(loc => loc.id === option.id);
    let content = '';
    let options: ConversationOption[] = [];

    switch(option.id) {
      case 'geo-spatial':
        content = `## Geo Spatial Data Engineering
        
As a Geo Spatial Data Engineer, Jase specializes in:
- **Spatial Data Processing**: Analyzing satellite imagery, LiDAR data, and GIS datasets
- **GIS Mapping**: Creating interactive maps and spatial visualizations
- **Cloud Integration**: Processing terabytes of spatial data on AWS/GCP
- **Real-time Analytics**: Building systems for urban planning and disaster response

**Key Technologies**: Python, PostGIS, GDAL, Mapbox, AWS S3, GeoPandas

${depth < 2 ? 'Would you like to dive deeper into a specific aspect?' : 'This represents the core of spatial data engineering expertise.'}`;

        options = depth < 2 ? [
          {
            id: 'spatial-technologies',
            text: 'Which spatial technologies are most important?',
            description: 'Learn about key tools and frameworks',
            followUpType: 'deepen'
          },
          {
            id: 'geo-projects',
            text: 'Show me spatial data projects',
            description: 'Explore real-world applications',
            followUpType: 'example'
          },
          {
            id: 'cloud-spatial',
            text: 'How does cloud computing help spatial analysis?',
            description: 'Understand cloud advantages for GIS',
            followUpType: 'explain'
          }
        ] : [];
        break;

      case 'cloud':
        content = `## Cloud Engineering Expertise
        
Jase's Cloud Engineering focuses on:
- **Infrastructure as Code**: Automated deployment with Terraform and CloudFormation
- **Serverless Architecture**: Building scalable, cost-efficient applications
- **Container Orchestration**: Managing workloads with Kubernetes
- **Cost Optimization**: Reducing cloud expenses by 40%+ through optimization

**Key Platforms**: AWS (EC2, S3, Lambda, RDS), GCP (Compute Engine, Cloud Functions, BigQuery)

${depth < 2 ? 'What aspect of cloud engineering interests you most?' : 'These skills enable scalable, reliable infrastructure.'}`;

        options = depth < 2 ? [
          {
            id: 'serverless',
            text: 'Tell me about serverless architecture',
            description: 'Learn about event-driven, scalable applications',
            followUpType: 'deepen'
          },
          {
            id: 'cost-optimization',
            text: 'How are cloud costs optimized?',
            description: 'Explore cost-saving strategies',
            followUpType: 'explain'
          },
          {
            id: 'kubernetes',
            text: 'What about container orchestration?',
            description: 'Understand Kubernetes and Docker deployments',
            followUpType: 'example'
          }
        ] : [];
        break;

      default:
        content = `I can help you explore various aspects of Jase's portfolio. Would you like to know about:
1. **Technical Skills**: Data pipelines, ML Ops, specific technologies
2. **Projects**: Smart cities platform, disaster response system, climate modeling
3. **Impact**: Business outcomes and measurable results
4. **Connections**: How different skills work together

What specifically interests you?`;
        
        options = [
          {
            id: 'technical',
            text: 'Technical skills and technologies',
            description: 'Explore programming languages, frameworks, tools',
            followUpType: 'clarify'
          },
          {
            id: 'projects-impact',
            text: 'Projects and their impact',
            description: 'See real-world applications and results',
            followUpType: 'example'
          },
          {
            id: 'workflow',
            text: 'How these skills work together',
            description: 'Understand the integrated expertise',
            followUpType: 'explain'
          }
        ];
    }

    return { content, options };
  };

  const generateCustomResponse = (query: string, depth: number) => {
    // Simple keyword matching for demo purposes
    const queryLower = query.toLowerCase();
    let content = '';
    let options: ConversationOption[] = [];

    if (queryLower.includes('data') || queryLower.includes('pipeline')) {
      content = `## Data Pipeline Architecture
      
Jase builds robust ETL/ELT pipelines handling billions of events daily. Key aspects:
- **Real-time Processing**: Apache Kafka for streaming data
- **Batch Processing**: Apache Airflow for scheduled workflows  
- **Modern Data Stack**: dbt, Snowflake, BigQuery integration
- **Monitoring & Alerting**: Comprehensive observability for data quality

This expertise connects spatial data engineering with cloud infrastructure.`;
    } else if (queryLower.includes('map') || queryLower.includes('gis')) {
      content = `## GIS & Mapping Expertise
      
Specialized in:
- **Interactive Web Maps**: Using Mapbox GL JS and Leaflet
- **Spatial Analysis**: Processing vector/raster data with Python
- **3D Visualization**: Terrain analysis and 3D modeling
- **Mobile Mapping**: Real-time location-based services

These skills power the interactive portfolio map you're exploring!`;
    } else if (queryLower.includes('machine learning') || queryLower.includes('ai')) {
      content = `## ML Ops & AI Engineering
      
Production machine learning expertise includes:
- **Model Deployment**: Serving models with TensorFlow Serving, TorchServe
- **Model Monitoring**: Tracking performance drift and data quality
- **Automated Retraining**: CI/CD pipelines for ML models
- **Scalable Infrastructure**: Kubernetes-based model serving

This combines cloud engineering with data science workflows.`;
    } else {
      content = `I understand you're asking about "${query}". As a portfolio assistant, I can help you explore:
      
1. **Technical Skills**: Python, AWS, Kubernetes, PostGIS, etc.
2. **Project Experience**: Smart cities, disaster response, climate modeling
3. **Professional Impact**: Cost savings, efficiency improvements, scalability
4. **Learning Journey**: How different skills complement each other

Could you clarify what specific aspect interests you?`;
      
      options = depth < 2 ? [
        {
          id: 'clarify',
          text: 'Tell me more about the technical skills',
          description: 'Dive deeper into specific technologies',
          followUpType: 'deepen'
        },
        {
          id: 'examples',
          text: 'Show me practical examples',
          description: 'See how skills are applied in projects',
          followUpType: 'example'
        },
        {
          id: 'connections',
          text: 'How do these connect to cloud engineering?',
          description: 'Understand the integrated approach',
          followUpType: 'explain'
        }
      ] : [];
    }

    return { content, options };
  };

  const handleResetConversation = async () => {
    try {
      const response = await fetch('/api/conversation/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: "Hi! I'm your portfolio guide. I can help you explore Jase's expertise as a **Geo Spatial Data Engineer** and **Cloud Engineer**. What would you like to know about?",
              timestamp: new Date(),
              depth: 0,
              options: [
                {
                  id: 'geo-spatial',
                  text: 'Tell me about Geo Spatial Engineering',
                  description: 'Explore spatial data analysis and GIS expertise',
                  followUpType: 'deepen'
                },
                {
                  id: 'cloud',
                  text: 'What about Cloud Engineering?',
                  description: 'Learn about cloud infrastructure and serverless architecture',
                  followUpType: 'deepen'
                },
                {
                  id: 'projects',
                  text: 'Show me some key projects',
                  description: 'Browse impactful projects and their technologies',
                  followUpType: 'explain'
                },
                {
                  id: 'custom',
                  text: 'Ask me something specific',
                  description: 'Type your own question about any topic',
                  followUpType: 'clarify'
                }
              ]
            }
          ]);
          setConversationDepth(0);
          setCurrentContext('general');
        }
      }
    } catch (error) {
      console.error('Reset conversation error:', error);
      // Fallback to local reset
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: "Hi! I'm your portfolio guide. I can help you explore Jase's expertise as a **Geo Spatial Data Engineer** and **Cloud Engineer**. What would you like to know about?",
          timestamp: new Date(),
          depth: 0,
          options: [
            {
              id: 'geo-spatial',
              text: 'Tell me about Geo Spatial Engineering',
              description: 'Explore spatial data analysis and GIS expertise',
              followUpType: 'deepen'
            },
            {
              id: 'cloud',
              text: 'What about Cloud Engineering?',
              description: 'Learn about cloud infrastructure and serverless architecture',
              followUpType: 'deepen'
            },
            {
              id: 'projects',
              text: 'Show me some key projects',
              description: 'Browse impactful projects and their technologies',
              followUpType: 'explain'
            },
            {
              id: 'custom',
              text: 'Ask me something specific',
              description: 'Type your own question about any topic',
              followUpType: 'clarify'
            }
          ]
        }
      ]);
      setConversationDepth(0);
      setCurrentContext('general');
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-light text-gray-900">Portfolio Assistant</h2>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-600 font-light">
                      Exploring {conversationDepth === 0 ? 'Surface Level' : 
                                 conversationDepth === 1 ? 'Intermediate Depth' : 
                                 'Deep Understanding'}
                    </div>
                    <div className="flex gap-0.5">
                      {[0, 1, 2].map((depth) => (
                        <div
                          key={depth}
                          className={`w-1.5 h-1.5 rounded-full ${depth < conversationDepth ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Messages Container */}
            <div
              id="messages-container"
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${message.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-br-none' 
                      : 'bg-gray-50 border border-gray-200 rounded-bl-none'}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {message.role === 'assistant' ? (
                        <Bot className="w-4 h-4 text-purple-500" />
                      ) : (
                        <User className="w-4 h-4 text-white/80" />
                      )}
                      <span className="text-xs font-light opacity-80">
                        {message.role === 'assistant' ? 'Portfolio Assistant' : 'You'}
                      </span>
                    </div>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                      }}
                    />
                    
                    {/* Options for assistant messages */}
                    {message.role === 'assistant' && message.options && message.options.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="text-xs font-light text-gray-600 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          Choose an option to continue:
                        </div>
                        <div className="space-y-2">
                          {message.options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleOptionSelect(option)}
                              className="w-full text-left p-3 rounded-xl border border-gray-300 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group"
                            >
                              <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-colors">
                                  <ChevronRight className="w-3 h-3 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                                    {option.text}
                                  </div>
                                  <div className="text-xs text-gray-600 font-light mt-0.5">
                                    {option.description}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-gray-50 border border-gray-200 rounded-bl-none">
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4 text-purple-500 animate-pulse" />
                      <span className="text-xs font-light text-gray-600">Thinking...</span>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about spatial data, cloud engineering, projects..."
                    className="w-full px-4 py-3 pl-12 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  />
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className={`px-6 py-3 rounded-xl flex items-center gap-2 font-medium transition-all duration-200 ${!inputValue.trim() || isLoading
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/25'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-600 font-light">
                  {conversationDepth === 0 ? 'Start exploring surface-level topics' :
                   conversationDepth === 1 ? 'Diving deeper into specifics' :
                   'Reaching deep understanding - ask follow-up questions'}
                </div>
                <button
                  onClick={handleResetConversation}
                  className="text-xs text-gray-600 hover:text-purple-600 font-light flex items-center gap-1 transition-colors"
                >
                  <HelpCircle className="w-3 h-3" />
                  Reset conversation
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConversationSearch;