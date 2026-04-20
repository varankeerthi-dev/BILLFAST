import React, { useState } from 'react';
import { Warehouse } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit2,
  Trash2,
  Warehouse as WarehouseIcon
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { useMaterialsData } from './hooks/useMaterials';
import { cn } from '@/lib/utils';

export function WarehouseList() {
  const { queries, mutations } = useMaterialsData();
  const { data: warehouses, isLoading } = queries.warehouses;

  const [searchTerm, setSearchTerm] = useState('');
  const [hideInactive, setHideInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const warehouseData = {
      warehouse_name: data.name as string,
      warehouse_code: data.item_code as string || null,
      location: data.display_name as string,
      is_active: true,
      is_default: editingWarehouse?.is_default || false
    };

    if (editingWarehouse) {
      mutations.updateWarehouse.mutate({ id: editingWarehouse.id, ...warehouseData }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      mutations.addWarehouse.mutate(warehouseData, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  const filteredWarehouses = warehouses?.filter(w => {
    const matchesSearch = (w.warehouse_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (w.warehouse_code?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = !hideInactive || w.is_active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search warehouses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 md:h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="hide-inactive-warehouses" 
              checked={hideInactive} 
              onCheckedChange={(checked) => setHideInactive(!!checked)} 
            />
            <Label htmlFor="hide-inactive-warehouses" className="text-sm cursor-pointer">Hide Inactive</Label>
          </div>
        </div>

        <Button 
          className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 md:h-9"
          onClick={() => {
            setEditingWarehouse(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> Add Warehouse
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? 'Edit' : 'Add New'} Warehouse</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Warehouse Name *</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={editingWarehouse?.warehouse_name || ''} 
                placeholder="e.g. Main Warehouse" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item_code">Warehouse Code</Label>
              <Input 
                id="item_code" 
                name="item_code" 
                defaultValue={editingWarehouse?.warehouse_code || ''} 
                placeholder="e.g. WH-001" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Location</Label>
              <Input 
                id="display_name" 
                name="display_name" 
                defaultValue={editingWarehouse?.location || ''} 
                placeholder="e.g. Mumbai, India" 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingWarehouse ? 'Update' : 'Save'} Warehouse
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Warehouse Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Code</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Default</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : filteredWarehouses?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-slate-500">No warehouses found</TableCell>
              </TableRow>
            ) : (
              filteredWarehouses?.map((warehouse) => (
                <TableRow key={warehouse.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">
                    <div className="flex items-center gap-2">
                      <WarehouseIcon className="w-4 h-4 text-slate-400" />
                      {warehouse.warehouse_name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{warehouse.warehouse_code}</TableCell>
                  <TableCell className="text-slate-600">{warehouse.location || '-'}</TableCell>
                  <TableCell>
                    {warehouse.is_default && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-bold uppercase">Default</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      warehouse.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {warehouse.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuItem onClick={() => { setEditingWarehouse(warehouse); setIsDialogOpen(true); }} className="gap-2">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => { if(confirm('Delete this warehouse?')) mutations.deleteWarehouse.mutate(warehouse.id); }}
                          className="gap-2 text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
