import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, Project, Client, ProjectStatus } from '@/lib/supabase';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Search, MoreHorizontal, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export function Projects() {
  const { user } = useAuth();
  const orgId = user?.profile?.organisation_id;
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [status, setStatus] = useState<ProjectStatus>('draft');
  const [poRequired, setPoRequired] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const queryClient = useQueryClient();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', orgId],
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          clients (name)
        `)
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: clients } = useQuery({
    queryKey: ['clients', orgId],
    enabled: !!orgId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organisation_id', orgId)
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    },
  });

  const addProjectMutation = useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([newProject])
        .select();
      
      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setActiveTab('all');
      toast.success('Project added successfully');
    },
    onError: (error: any) => {
      toast.error(`Error adding project: ${error.message}`);
    },
  });

  const filteredProjects = projects?.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProject = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!orgId) {
      toast.error('Organisation ID not found. Please log in again.');
      return;
    }
    const formData = new FormData(e.currentTarget);
    addProjectMutation.mutate({
      organisation_id: orgId,
      name: formData.get('name') as string,
      client_id: formData.get('client_id') as string,
      location: formData.get('location') as string || '',
      status: status,
      project_type: formData.get('project_type') as string,
      po_value: parseFloat(formData.get('po_value') as string) || 0,
      po_required: poRequired,
      description: formData.get('description') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
    });
  };

  const statusColors: Record<string, string> = {
    'pending': 'bg-slate-100 text-slate-700',
    'draft': 'bg-slate-100 text-slate-700',
    'active': 'bg-blue-100 text-blue-700',
    'completed': 'bg-emerald-100 text-emerald-700',
    'on_hold': 'bg-amber-100 text-amber-700',
    'cancelled': 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500">Manage your active and completed projects.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={cn("h-8 px-3", viewMode === 'grid' && "bg-white shadow-sm")}
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> Grid
            </Button>
            <Button
              variant={viewMode === 'list' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={cn("h-8 px-3", viewMode === 'list' && "bg-white shadow-sm")}
            >
              <List className="w-4 h-4 mr-2" /> List
            </Button>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="new">Add New Project</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {activeTab === 'all' ? (
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search by project name or client..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Execution Completed">Execution Completed</SelectItem>
                <SelectItem value="Financially Closed">Financially Closed</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {projectsLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-500">Loading projects...</p>
            </div>
          ) : viewMode === 'list' ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects?.map((project) => (
                    <TableRow key={project.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.clients?.name}</TableCell>
                      <TableCell>{project.project_type}</TableCell>
                      <TableCell className="text-slate-500 text-sm">
                        {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={cn("font-medium", statusColors[project.status])}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProjects?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                        No projects found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects?.map((project) => (
                <div key={project.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Badge variant="secondary" className={cn("mb-2", statusColors[project.status])}>
                          {project.status}
                        </Badge>
                        <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                        <p className="text-slate-500 text-sm">Client: {project.clients?.name}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="-mr-2">
                        <MoreHorizontal className="w-4 h-4 text-slate-400" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Type:</span>
                        <span className="font-medium">{project.project_type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Value:</span>
                        <span className="font-bold text-blue-600">₹{project.po_value?.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                      <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                      <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProjects?.length === 0 && (
                <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
                  <p className="text-slate-500">No projects found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="max-w-4xl bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <form onSubmit={handleAddProject} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input id="name" name="name" placeholder="Enter project name" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_id">Client</Label>
                  <Select name="client_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients?.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project_type">Project Type</Label>
                  <Input id="project_type" name="project_type" placeholder="e.g. Turnkey, AMC" required />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="po_required" className="cursor-pointer">PO Required</Label>
                    <Switch 
                      id="po_required" 
                      checked={poRequired} 
                      onCheckedChange={setPoRequired} 
                    />
                  </div>
                  {poRequired && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Label htmlFor="po_value">PO Value (₹)</Label>
                      <Input 
                        id="po_value" 
                        name="po_value" 
                        type="number" 
                        placeholder="Enter PO value" 
                        required 
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="status">Current Status</Label>
                  <Select value={status} onValueChange={(val) => val && setStatus(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Execution Completed">Execution Completed</SelectItem>
                      <SelectItem value="Financially Closed">Financially Closed</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input id="start_date" name="start_date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">Estimated End Date</Label>
                    <Input id="end_date" name="end_date" type="date" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Brief project summary" 
                    className="min-h-[120px]"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setActiveTab('all')}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                disabled={addProjectMutation.isPending}
              >
                {addProjectMutation.isPending ? 'Adding Project...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
