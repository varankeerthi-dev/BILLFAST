import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, Client } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Plus, Search, Edit2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';

export function Clients() {
  const { user } = useAuth();
  const orgId = user?.profile?.organisation_id;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: clients, isLoading } = useQuery({
    queryKey: ['clients', orgId],
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('organisation_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    },
  });

  const { data: counts } = useQuery({
    queryKey: ['client-counts', selectedClientId, orgId],
    enabled: !!selectedClientId && !!orgId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    queryFn: async () => {
      const [
        { count: qCount },
        { count: poCount },
        { count: pCount },
        { count: svCount },
        { count: dcCount },
        { count: mCount }
      ] = await Promise.all([
        supabase.from('quotations').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId).eq('organisation_id', orgId),
        supabase.from('purchase_orders').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId).eq('organisation_id', orgId),
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId).eq('organisation_id', orgId),
        supabase.from('site_visits').select('*', { count: 'exact', head: true }).eq('project_id', selectedClientId).eq('organisation_id', orgId),
        supabase.from('delivery_challans').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId).eq('organisation_id', orgId),
        supabase.from('meetings').select('*', { count: 'exact', head: true }).eq('client_id', selectedClientId).eq('organisation_id', orgId),
      ]);

      return {
        quotations: qCount || 0,
        pos: poCount || 0,
        projects: pCount || 0,
        siteVisits: svCount || 0,
        challans: dcCount || 0,
        meetings: mCount || 0,
      };
    },
  });

  useEffect(() => {
    if (clients && clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [clients, selectedClientId]);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    return clients.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.gstin && client.gstin.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clients, searchTerm]);

  const selectedClient = clients?.find(c => c.id === selectedClientId);

  return (
    <div className="flex h-[calc(100vh-8rem)] -m-6 overflow-hidden bg-slate-50">
      {/* Left Sidebar */}
      <div className="w-80 flex flex-col border-r border-slate-200 bg-white">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Clients</h2>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 gap-1"
              // onClick={() => navigate({ to: '/clients/add' })}
            >
              <Plus className="w-4 h-4" /> New
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search client..." 
              className="pl-9 bg-slate-50 border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-slate-500">Loading clients...</div>
          ) : filteredClients.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No clients found</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={cn(
                    "w-full p-4 text-left transition-colors hover:bg-slate-50",
                    selectedClientId === client.id && "bg-blue-50 border-r-2 border-blue-600"
                  )}
                >
                  <p className="font-semibold text-slate-900 truncate">{client.name}</p>
                  <p className="text-xs text-slate-500 mt-1 truncate">{client.city || 'No city'}, {client.state || 'No state'}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                      {client.category || 'Standard'}
                    </span>
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                      client.status === 'Active' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {client.status || 'Lead'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {selectedClient ? (
          <div className="p-8">
            <div className="flex justify-between items-start mb-8 pb-8 border-b border-slate-100">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{selectedClient.name}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {selectedClient.status || 'Lead'}
                  </span>
                  <span>|</span>
                  <span>GSTIN: {selectedClient.gstin || 'Not provided'}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                // onClick={() => navigate(`/clients/edit/${selectedClient.id}`)}
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="bg-slate-100/50 p-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="projects">Projects ({counts?.projects})</TabsTrigger>
                <TabsTrigger value="quotations">Quotations ({counts?.quotations})</TabsTrigger>
                <TabsTrigger value="pos">Purchase Orders ({counts?.pos})</TabsTrigger>
                <TabsTrigger value="communication">Communication</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500">Primary Email</p>
                        <p className="text-sm font-medium text-slate-900">{selectedClient.email || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Phone Number</p>
                        <p className="text-sm font-medium text-slate-900">{selectedClient.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Office Address</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-slate-900">{selectedClient.address_line_1 || selectedClient.address}</p>
                      {selectedClient.address_line_2 && <p className="text-sm text-slate-900">{selectedClient.address_line_2}</p>}
                      <p className="text-sm text-slate-900">
                        {selectedClient.city && `${selectedClient.city}, `}
                        {selectedClient.state} {selectedClient.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Account Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-slate-500">Vendor Code</p>
                        <p className="text-sm font-medium text-slate-900">{selectedClient.vendor_no || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Added On</p>
                        <p className="text-sm font-medium text-slate-900">{new Date(selectedClient.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects">
                <div className="bg-slate-50 rounded-xl p-8 border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-500 font-medium">Project history for this client will appear here.</p>
                </div>
              </TabsContent>

              <TabsContent value="quotations">
                <div className="bg-slate-50 rounded-xl p-8 border-2 border-dashed border-slate-200 text-center">
                  <p className="text-slate-500 font-medium">Quotations sent to this client will appear here.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
            <Search className="w-12 h-12 opacity-20" />
            <p className="text-lg font-medium">Select a client to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
