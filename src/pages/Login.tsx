import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, Role } from '@/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function Login() {
  const { login, currentUser } = useStore();
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<Role>('Admin');

  React.useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(role, name);
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC]">
      <Card className="w-full max-w-md rounded-2xl border-slate-200 shadow-sm p-2">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">Login Tabungan</CardTitle>
          <CardDescription className="text-slate-500">Aplikasi Tabungan Bersama Group C</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-semibold">Nama Lengkap</Label>
              <Input 
                id="name" 
                placeholder="Masukkan nama Anda..." 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="rounded-lg bg-slate-50 border-slate-200 h-11"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700 font-semibold">Pilih Role</Label>
              <select 
                id="role"
                className="flex h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="Admin">Admin</option>
                <option value="Bendahara">Bendahara</option>
                <option value="User">User</option>
              </select>
            </div>

            <Button type="submit" className="w-full mt-8 bg-primary hover:bg-primary/90 text-white rounded-lg h-11 font-semibold text-base shadow-sm">
              Masuk ke Dashboard
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
