import React, { useState } from 'react';
import { useStore, MONTHS, Member } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Check, X, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function Members() {
  const { members, payments, monthlyFee, addMember, deleteMember, addPayment, deletePayment, currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newMember, setNewMember] = useState({ nrp: '', nama: '' });

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Bendahara';

  const filteredMembers = members.filter(m => 
    m.nama.toLowerCase().includes(search.toLowerCase()) || 
    m.nrp.includes(search)
  );

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMember.nrp && newMember.nama) {
      addMember(newMember);
      setNewMember({ nrp: '', nama: '' });
      setIsAddOpen(false);
    }
  };

  const handleTogglePayment = (memberId: string, month: string) => {
    if (!canEdit) return;
    
    const existingPayment = payments.find(p => p.memberId === memberId && p.month === month);
    if (existingPayment) {
      deletePayment(existingPayment.id);
    } else {
      addPayment({
        memberId,
        month,
        amount: monthlyFee
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Data Penabung</h2>
          <p className="text-slate-500">Kelola anggota dan status pembayaran bulanan.</p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsAddOpen(true)} className="bg-primary text-white rounded-lg shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Anggota
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border-slate-200">
        <CardHeader className="pb-3 bg-white rounded-t-2xl">
          <div className="flex items-center max-w-sm relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Cari nama atau NRP..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 bg-slate-50 border-none rounded-lg text-sm focus-visible:ring-primary"
            />
          </div>
        </CardHeader>
        <CardContent className="bg-white rounded-b-2xl p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[50px]">NO</TableHead>
                  <TableHead className="min-w-[80px]">NRP</TableHead>
                  <TableHead className="min-w-[150px]">NAMA</TableHead>
                  {MONTHS.map(m => (
                    <TableHead key={m} className="min-w-[60px] text-center">{m}</TableHead>
                  ))}
                  <TableHead className="min-w-[120px] text-right">TOTAL</TableHead>
                  {canEdit && <TableHead className="min-w-[60px] text-center">AKSI</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={MONTHS.length + 5} className="text-center h-24">
                      Tidak ada data ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member, index) => {
                    const memberPayments = payments.filter(p => p.memberId === member.id);
                    const totalPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);

                    return (
                      <TableRow key={member.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-medium">{member.nrp}</TableCell>
                        <TableCell className="font-semibold text-slate-800">{member.nama}</TableCell>
                        
                        {MONTHS.map(month => {
                          const isPaid = memberPayments.some(p => p.month === month);
                          return (
                            <TableCell key={month} className="text-center px-1 py-2">
                              <button
                                onClick={() => handleTogglePayment(member.id, month)}
                                disabled={!canEdit}
                                className={`w-full h-8 flex items-center justify-center rounded transition-colors ${
                                  isPaid 
                                    ? `bg-primary/10 text-primary ${canEdit ? 'hover:bg-primary/20 cursor-pointer' : 'opacity-80 cursor-default'}` 
                                    : `bg-slate-100 text-slate-400 ${canEdit ? 'hover:bg-slate-200 cursor-pointer' : 'opacity-80 cursor-default'}`
                                }`}
                                title={isPaid ? (canEdit ? 'Sudah Bayar (Klik untuk batal)' : 'Sudah Bayar') : (canEdit ? 'Belum Bayar (Klik untuk bayar)' : 'Belum Bayar')}
                              >
                                {isPaid ? <Check className="w-4 h-4 font-bold" /> : <X className="w-3 h-3 opacity-30" />}
                              </button>
                            </TableCell>
                          );
                        })}
                        
                        <TableCell className="text-right font-bold text-slate-800">
                          {formatCurrency(totalPaid)}
                        </TableCell>
                        
                        {canEdit && (
                          <TableCell className="text-center">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 h-8 w-8"
                              onClick={() => deleteMember(member.id)}
                              title="Hapus Anggota"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Anggota Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMember}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="nrp">NRP</Label>
                <Input 
                  id="nrp" 
                  value={newMember.nrp}
                  onChange={e => setNewMember({...newMember, nrp: e.target.value})}
                  placeholder="Misal: 10189"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nama">Nama Lengkap</Label>
                <Input 
                  id="nama" 
                  value={newMember.nama}
                  onChange={e => setNewMember({...newMember, nama: e.target.value})}
                  placeholder="Misal: JOHN DOE"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
