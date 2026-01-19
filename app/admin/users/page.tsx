'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  nickname: string;
  plan_type: string;
  daily_usage: number;
  total_generations: number;
  created_at: string;
}

interface HistoryItem {
  id: string;
  created_at: string;
  mode: string;
  input_snapshot: any;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updatePlan = async (userId: string, newPlan: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_type: newPlan }),
      });
      toast.success('更新成功');
      fetchUsers();
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const viewHistory = async (user: User) => {
    setSelectedUser(user);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/history`);
      const data = await res.json();
      setUserHistory(data);
      setShowHistory(true);
    } catch (error) {
      toast.error('加载历史失败');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesEmail = user.email.toLowerCase().includes(searchEmail.toLowerCase());
    const matchesPlan = planFilter === 'all' || user.plan_type === planFilter;
    return matchesEmail && matchesPlan;
  });

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">用户管理</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索邮箱..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部套餐</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>邮箱</TableHead>
            <TableHead>昵称</TableHead>
            <TableHead>套餐</TableHead>
            <TableHead>今日用量</TableHead>
            <TableHead>总生成数</TableHead>
            <TableHead>注册时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{user.nickname || '-'}</TableCell>
              <TableCell>
                <Select
                  value={user.plan_type}
                  onValueChange={(value) => updatePlan(user.id, value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{user.daily_usage}</TableCell>
              <TableCell>{user.total_generations}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => viewHistory(user)}>
                  查看历史
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedUser?.email} 的生成历史</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {userHistory.map((item) => (
              <div key={item.id} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge>{item.mode === 'professional' ? '专业版' : '基础版'}</Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>猫咪: {item.input_snapshot?.cat?.name}</p>
                  <p>风格: {item.input_snapshot?.style?.name}</p>
                  <p>食物: {item.input_snapshot?.foods?.map((f: any) => f.name).join(', ')}</p>
                  <p>情绪: {item.input_snapshot?.emotion?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
