import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowRight, TrendingUp, Users, Zap } from 'lucide-react';
import { useAppContext } from '../App';
import { Project } from '../types';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Input, Modal, Label, Textarea } from '../components/UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProjectCard = ({ project }: { project: Project }) => {
  const navigate = useNavigate();

  const statusColors: any = {
    'Active': 'default',
    'Completed': 'success',
    'Planning': 'secondary',
    'Review': 'outline',
    'Archived': 'outline'
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => {}}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <Badge variant={statusColors[project.status]}>{project.status}</Badge>
          <span className="text-xs text-slate-500 font-mono">{project.dueDate}</span>
        </div>
        <CardTitle className="text-lg mt-2">{project.title}</CardTitle>
        <p className="text-sm text-slate-500 mt-1">{project.client}</p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
          {project.description}
        </p>
        
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1 text-slate-500">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>

        <Button 
          className="w-full" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/project/${project.id}/overview`);
          }}
        >
          Open Workspace <ArrowRight className="ml-2 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
};

const AnalyticsSummary = () => {
  const data = [
    { name: 'Mon', aiCalls: 40, strategies: 24 },
    { name: 'Tue', aiCalls: 30, strategies: 13 },
    { name: 'Wed', aiCalls: 20, strategies: 58 },
    { name: 'Thu', aiCalls: 27, strategies: 39 },
    { name: 'Fri', aiCalls: 18, strategies: 48 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="p-3 bg-blue-100 rounded-full mr-4">
            <Zap className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">AI Credits Used</p>
            <h4 className="text-2xl font-bold">2,450</h4>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +12% this week
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center p-6">
          <div className="p-3 bg-green-100 rounded-full mr-4">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Clients</p>
            <h4 className="text-2xl font-bold">14</h4>
            <p className="text-xs text-slate-400 mt-1">Across 3 regions</p>
          </div>
        </CardContent>
      </Card>
      <Card className="md:col-span-1 hidden md:block">
        <CardContent className="p-4 h-full flex flex-col justify-center">
             <p className="text-sm font-medium text-slate-500 mb-2">Weekly AI Activity</p>
             <div className="h-20 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <Bar dataKey="aiCalls" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             </div>
        </CardContent>
      </Card>
    </div>
  );
}

const Dashboard = () => {
  const { projects, addProject } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', client: '', description: '' });

  const handleCreate = () => {
    addProject({
      id: `p${Date.now()}`,
      title: newProject.title,
      client: newProject.client,
      description: newProject.description,
      status: 'Planning',
      dueDate: new Date().toISOString().split('T')[0],
      progress: 0,
      contextSnippet: 'New project context...'
    });
    setIsModalOpen(false);
    setNewProject({ title: '', client: '', description: '' });
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, Alex. Here's what's happening today.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      <AnalyticsSummary />

      <h2 className="text-xl font-semibold mb-4 text-slate-800">Active Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} />
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <div className="space-y-4">
          <div>
            <Label>Project Title</Label>
            <Input 
              value={newProject.title} 
              onChange={(e: any) => setNewProject({...newProject, title: e.target.value})} 
              placeholder="e.g. Global Cloud Strategy"
            />
          </div>
          <div>
            <Label>Client Name</Label>
            <Input 
              value={newProject.client} 
              onChange={(e: any) => setNewProject({...newProject, client: e.target.value})} 
              placeholder="e.g. Wayne Enterprises"
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea 
              value={newProject.description} 
              onChange={(e: any) => setNewProject({...newProject, description: e.target.value})} 
              placeholder="Short project summary..."
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleCreate}>Create Project</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
