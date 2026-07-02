import React, { useMemo } from 'react';
import { useStore, MONTHS } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Wallet, TrendingDown, Users, AlertCircle } from 'lucide-react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function Dashboard() {
  const { payments, expenses, members, monthlyFee } = useStore();

  const metrics = useMemo(() => {
    const totalPemasukan = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalPengeluaran = expenses.reduce((sum, e) => sum + e.amount, 0);
    const saldo = totalPemasukan - totalPengeluaran;

    // Calculate belum bayar (assuming all 12 months are expected for all members eventually)
    // For a more realistic metric, maybe just sum the total expected from members vs total paid.
    const totalExpected = members.length * MONTHS.length * monthlyFee;
    const totalBelumBayar = totalExpected - totalPemasukan;

    return { totalPemasukan, totalPengeluaran, saldo, totalBelumBayar };
  }, [payments, expenses, members, monthlyFee]);

  const chartData = useMemo(() => {
    return MONTHS.map(month => {
      const pemasukan = payments.filter(p => p.month === month).reduce((sum, p) => sum + p.amount, 0);
      return {
        name: month.split('-')[0], // e.g., 'Jul'
        Pemasukan: pemasukan,
      };
    });
  }, [payments]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard Ringkasan</h2>
        <p className="text-slate-500">Ringkasan keuangan tabungan bersama.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Saldo</CardTitle>
            <Wallet className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.saldo)}</div>
            <p className="text-xs text-primary mt-2 font-medium">Saldo saat ini</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Pemasukan</CardTitle>
            <TrendingDown className="w-4 h-4 text-green-500 transform rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(metrics.totalPemasukan)}</div>
            <p className="text-xs text-slate-400 mt-2">Dari pembayaran anggota</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Total Pengeluaran</CardTitle>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{formatCurrency(metrics.totalPengeluaran)}</div>
            <p className="text-xs text-slate-400 mt-2">Seluruh pengeluaran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500">Potensi Belum Bayar</CardTitle>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{formatCurrency(metrics.totalBelumBayar)}</div>
            <p className="text-xs text-rose-500 mt-2 font-medium">Total sisa tagihan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-center w-full">
              <CardTitle className="font-bold">Grafik Arus Kas</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pl-2 flex-1 min-h-[300px]">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    fontWeight={600}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rp ${value / 1000}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  />
                  <Bar dataKey="Pemasukan" fill="#00AA13" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="font-bold">Anggota Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {members.slice(-5).reverse().map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {member.nama.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{member.nama}</p>
                      <p className="text-[10px] text-slate-400">NRP: {member.nrp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
