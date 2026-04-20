import React, { useState } from 'react';
import { ItemUnit } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Search, 
  MoreHorizontal,
  Edit2,
  Trash2,
  RefreshCw
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

export function UnitList() {
  const { queries, mutations } = useMaterialsData();
  const { data: units, isLoading } = queries.units;

  const [searchTerm, setSearchTerm] = useState('');
  const [hideInactive, setHideInactive] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<ItemUnit | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const unitData = {
      unit_name: data.name as string,
      unit_code: data.item_code as string,
      description: data.display_name as string,
      is_active: true
    };

    if (editingUnit) {
      mutations.updateUnit.mutate({ id: editingUnit.id, ...unitData }, {
        onSuccess: () => setIsDialogOpen(false)
      });
    } else {
      mutations.addUnit.mutate(unitData, {
        onSuccess: () => setIsDialogOpen(false)
      });
    }
  };

  const filteredUnits = units?.filter(u => {
    const matchesSearch = (u.unit_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (u.unit_code || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !hideInactive || u.is_active;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search units..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 md:h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox 
              id="hide-inactive-units" 
              checked={hideInactive} 
              onCheckedChange={(checked) => setHideInactive(!!checked)} 
            />
            <Label htmlFor="hide-inactive-units" className="text-sm cursor-pointer">Hide Inactive</Label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={() => mutations.preloadUnits.mutate()}
            disabled={mutations.preloadUnits.isPending}
          >
            <RefreshCw className={cn("w-4 h-4", mutations.preloadUnits.isPending && "animate-spin")} />
            Preload Units
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 gap-2 h-11 md:h-9"
            onClick={() => {
              setEditingUnit(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add Unit
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUnit ? 'Edit' : 'Add New'} Unit</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Unit Name *</Label>
              <Input 
                id="name" 
                name="name" 
                defaultValue={editingUnit?.unit_name || ''} 
                placeholder="e.g. Numbers" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="item_code">Unit Code *</Label>
              <Input 
                id="item_code" 
                name="item_code" 
                defaultValue={editingUnit?.unit_code || ''} 
                placeholder="e.g. Nos" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Description</Label>
              <Input 
                id="display_name" 
                name="display_name" 
                defaultValue={editingUnit?.description || ''} 
                placeholder="Short description" 
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                {editingUnit ? 'Update' : 'Save'} Unit
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unit Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Unit Code</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : filteredUnits?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-slate-500">No units found</TableCell>
              </TableRow>
            ) : (
              filteredUnits?.map((unit) => (
                <TableRow key={unit.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-semibold text-slate-900">{unit.unit_name}</TableCell>
                  <TableCell className="text-slate-600 uppercase">{unit.unit_code}</TableCell>
                  <TableCell className="text-slate-600">{unit.description || '-'}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      unit.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                    )}>
                      {unit.is_active ? 'Active' : 'Inactive'}
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
                        <DropdownMenuItem onClick={() => { setEditingUnit(unit); setIsDialogOpen(true); }} className="gap-2">
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => { if(confirm('Delete this unit?')) mutations.deleteUnit.mutate(unit.id); }}
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
