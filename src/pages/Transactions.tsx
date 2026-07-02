import React, { useState, useMemo } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Transactions() {
  const { payments, expenses, members, currentUser, addExpense, deleteExpense } = useStore();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '' });

  const canEdit = currentUser?.role === 'Admin' || currentUser?.role === 'Bendahara';

  // Combine payments and expenses into a single unified ledger
  const allTransactions = useMemo(() => {
    const list: any[] = [];
    
    payments.forEach(p => {
      const member = members.find(m => m.id === p.memberId);
      list.push({
        id: p.id,
        date: new Date(p.paidAt),
        description: `Setoran Tabungan - ${member?.nama || 'Unknown'} (${p.month})`,
        pemasukan: p.amount,
        pengeluaran: 0,
        type: 'IN',
        originalId: p.id
      });
    });

    expenses.forEach(e => {
      list.push({
        id: e.id,
        date: new Date(e.date),
        description: e.description,
        pemasukan: 0,
        pengeluaran: e.amount,
        type: 'OUT',
        originalId: e.id
      });
    });

    // Sort chronologically
    list.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate running balance
    let runningBalance = 0;
    return list.map(item => {
      runningBalance = runningBalance + item.pemasukan - item.pengeluaran;
      return { ...item, saldo: runningBalance };
    });
  }, [payments, expenses, members]);

  // Sort descending for display (newest first)
  const displayTransactions = [...allTransactions].reverse();

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.description && newExpense.amount) {
      addExpense({
        description: newExpense.description,
        amount: Number(newExpense.amount),
        date: new Date().toISOString()
      });
      setNewExpense({ description: '', amount: '' });
      setIsAddOpen(false);
    }
  };

  const renderTable = (data: any[]) => (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead className="w-[120px]">Tanggal</TableHead>
            <TableHead>Keterangan</TableHead>
            <TableHead className="text-right">Pemasukan</TableHead>
            <TableHead className="text-right">Pengeluaran</TableHead>
            <TableHead className="text-right">Saldo</TableHead>
            {canEdit && <TableHead className="w-[80px] text-center">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                Tidak ada data rincian.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>{data.length - index}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {format(item.date, 'dd MMM yyyy')}
                </TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell className="text-right text-green-600">
                  {item.pemasukan > 0 ? formatCurrency(item.pemasukan) : '-'}
                </TableCell>
                <TableCell className="text-right text-red-600">
                  {item.pengeluaran > 0 ? formatCurrency(item.pengeluaran) : '-'}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.saldo)}
                </TableCell>
                {canEdit && (
                  <TableCell className="text-center">
                    {item.type === 'OUT' ? (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        onClick={() => deleteExpense(item.originalId)}
                        title="Hapus Pengeluaran"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400" title="Hapus dari Data Penabung">Otomatis</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Rincian Transaksi</h2>
          <p className="text-slate-500">Catatan pemasukan, pengeluaran, dan saldo kas.</p>
        </div>
        {canEdit && (
          <Button onClick={() => setIsAddOpen(true)} className="bg-primary text-white rounded-lg shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Catat Pengeluaran
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border-slate-200">
        <CardContent className="pt-6">
          <Tabs defaultValue="semua" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="semua">Semua Transaksi</TabsTrigger>
              <TabsTrigger value="pemasukan">Pemasukan</TabsTrigger>
              <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
            </TabsList>
            
            <TabsContent value="semua">
              {renderTable(displayTransactions)}
            </TabsContent>
            
            <TabsContent value="pemasukan">
              {renderTable(displayTransactions.filter(t => t.type === 'IN'))}
            </TabsContent>
            
            <TabsContent value="pengeluaran">
              {renderTable(displayTransactions.filter(t => t.type === 'OUT'))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Catat Pengeluaran Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddExpense}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="desc">Keterangan</Label>
                <Input 
                  id="desc" 
                  value={newExpense.description}
                  onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  placeholder="Misal: Beli ATK"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input 
                  id="amount" 
                  type="number"
                  min="0"
                  value={newExpense.amount}
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="50000"
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
