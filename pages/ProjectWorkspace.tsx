import React, { useState, useEffect, useRef } from 'react';
import { useParams, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { FileText, MessageSquare, Lightbulb, Activity, Send, Wand2, Save, Download } from 'lucide-react';
import { useAppContext } from '../App';
import { streamStrategyGeneration, sendChatMessage, analyzeData } from '../services/geminiService';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Badge, Label } from '../components/UIComponents';
import { ChatMessage, MessageRole } from '../types';

// --- Workspace Sidebar ---
const WorkspaceNav = ({ projectId }: { projectId: string }) => {
  const navItems = [
    { icon: Activity, label: 'Overview', path: 'overview' },
    { icon: Lightbulb, label: 'AI Strategy', path: 'strategy' },
    { icon: MessageSquare, label: 'AI Workshop', path: 'workshop' },
    { icon: FileText, label: 'Assessments', path: 'assessments' },
  ];

  return (
    <div className="w-64 border-r border-slate-200 bg-white min-h-full flex flex-col">
      <div className="p-4 border-b border-slate-100">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Tools</span>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={`/project/${projectId}/${item.path}`}
            className={({ isActive }) => `flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

// --- Strategy Generator Component ---
const StrategyView = ({ projectContext }: { projectContext: string }) => {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mode, setMode] = useState<'form' | 'view'>('form');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMode('view');
    setContent('');
    try {
      await streamStrategyGeneration(projectContext, prompt, (chunk) => {
        setContent(prev => prev + chunk);
      });
    } catch (e) {
      setContent("**Error generating strategy.** Please check your API Key in settings.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Strategy Generator</h2>
          <p className="text-slate-500">Generate comprehensive strategy documents using Gemini 2.5.</p>
        </div>
        <div className="space-x-2">
          {mode === 'view' && (
             <Button variant="outline" onClick={() => setMode('form')}>
               <Wand2 className="mr-2 h-4 w-4" /> New Draft
             </Button>
          )}
          <Button variant="outline" disabled={!content}>
            <Download className="mr-2 h-4 w-4" /> Export PDF
          </Button>
        </div>
      </div>

      {mode === 'form' ? (
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Project Context (Read-Only)</Label>
              <div className="p-3 bg-slate-50 rounded text-sm text-slate-600 border border-slate-100 h-24 overflow-y-auto">
                {projectContext}
              </div>
            </div>
            <div>
              <Label>Focus Area & Requirements</Label>
              <Textarea 
                value={prompt} 
                onChange={(e: any) => setPrompt(e.target.value)} 
                placeholder="E.g., Focus on cost reduction in the cloud infrastructure. Include a SWOT analysis and a 6-month migration roadmap."
                rows={6}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleGenerate} disabled={!prompt || isGenerating}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating ? 'Initializing...' : 'Generate Strategy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardContent className="flex-1 overflow-y-auto p-8 bg-white">
             {isGenerating && !content && (
               <div className="flex items-center justify-center h-full text-blue-600 animate-pulse">
                 Generating insights...
               </div>
             )}
             <div className="markdown-body prose max-w-none">
               <ReactMarkdown>{content}</ReactMarkdown>
             </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// --- Workshop / Chat Component ---
const WorkshopView = ({ projectContext }: { projectContext: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: MessageRole.MODEL, text: 'Hello! I have loaded the project context. How can I help you facilitate this workshop?', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: MessageRole.USER, text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: MessageRole.MODEL, text: '', timestamp: Date.now(), isStreaming: true }]);

    const history = messages.map(m => ({
      role: m.role === MessageRole.USER ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    try {
      let fullText = '';
      await sendChatMessage(history, userMsg.text, projectContext, (chunk) => {
        fullText += chunk;
        setMessages(prev => prev.map(m => 
          m.id === modelMsgId ? { ...m, text: fullText } : m
        ));
      });
    } catch (e) {
       setMessages(prev => prev.map(m => 
          m.id === modelMsgId ? { ...m, text: "Error communicating with AI service." } : m
        ));
    } finally {
      setIsTyping(false);
      setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, isStreaming: false } : m));
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
          <span className="font-semibold text-slate-700">Interactive Workshop</span>
        </div>
        <Badge variant="secondary">Gemini 2.5 Flash</Badge>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg px-4 py-3 ${
              msg.role === MessageRole.USER 
                ? 'bg-blue-600 text-white' 
                : 'bg-slate-100 text-slate-800 border border-slate-200'
            }`}>
              <ReactMarkdown className="text-sm markdown-body">{msg.text}</ReactMarkdown>
              {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <div className="flex space-x-2">
          <Input 
            value={input} 
            onChange={(e: any) => setInput(e.target.value)} 
            onKeyDown={(e: any) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about the project context, risks, or next steps..."
            className="flex-1"
            disabled={isTyping}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Main Project Workspace ---
const ProjectWorkspace = () => {
  const { id } = useParams();
  const { projects } = useAppContext();
  const project = projects.find(p => p.id === id);

  if (!project) return <div className="p-8 text-center">Project not found</div>;

  return (
    <div className="flex h-[calc(100vh-5rem)] -m-4 md:-m-8 bg-slate-50">
      <WorkspaceNav projectId={project.id} />
      <div className="flex-1 p-6 overflow-hidden">
        <Routes>
          <Route path="overview" element={
            <div className="space-y-6">
              <h2 className="text-2xl font-bold mb-4">Project Overview: {project.title}</h2>
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                  <CardContent>
                    <Badge variant="default">{project.status}</Badge>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Progress</CardTitle></CardHeader>
                  <CardContent className="text-2xl font-bold">{project.progress}%</CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Client</CardTitle></CardHeader>
                  <CardContent>{project.client}</CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader><CardTitle>Context</CardTitle></CardHeader>
                <CardContent><p className="text-slate-600">{project.contextSnippet}</p></CardContent>
              </Card>
            </div>
          } />
          <Route path="strategy" element={<StrategyView projectContext={project.contextSnippet} />} />
          <Route path="workshop" element={<WorkshopView projectContext={project.contextSnippet} />} />
          <Route path="assessments" element={<div className="flex items-center justify-center h-full text-slate-400">Assessments Module Coming Soon</div>} />
          <Route path="*" element={<Navigate to="overview" />} />
        </Routes>
      </div>
    </div>
  );
};

export default ProjectWorkspace;