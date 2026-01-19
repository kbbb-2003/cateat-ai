'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Food {
  id: string;
  name: string;
  name_en: string;
  emoji: string;
  category: string;
  popularity: number;
  is_premium: boolean;
  is_active: boolean;
  usage_count: number;
}

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/admin/foods');
      const data = await res.json();
      setFoods(data);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      name_en: formData.get('name_en'),
      emoji: formData.get('emoji'),
      category: formData.get('category'),
      popularity: parseInt(formData.get('popularity') as string),
      is_premium: formData.get('is_premium') === 'on',
      is_active: formData.get('is_active') === 'on',
    };

    try {
      const url = editingFood ? `/api/admin/foods/${editingFood.id}` : '/api/admin/foods';
      const method = editingFood ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success(editingFood ? '更新成功' : '创建成功');
      setIsDialogOpen(false);
      setEditingFood(null);
      fetchFoods();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      toast.success('更新成功');
      fetchFoods();
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const deleteFood = async (id: string) => {
    if (!confirm('确定删除此食物？')) return;
    try {
      await fetch(`/api/admin/foods/${id}`, { method: 'DELETE' });
      toast.success('删除成功');
      fetchFoods();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const filteredFoods = categoryFilter === 'all'
    ? foods
    : foods.filter(f => f.category === categoryFilter);

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">食物管理</h1>
        <div className="flex gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              <SelectItem value="主食">主食</SelectItem>
              <SelectItem value="肉类">肉类</SelectItem>
              <SelectItem value="海鲜">海鲜</SelectItem>
              <SelectItem value="零食">零食</SelectItem>
              <SelectItem value="水果">水果</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFood(null)}>
                <Plus className="w-4 h-4 mr-2" />
                新增食物
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFood ? '编辑食物' : '新增食物'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>名称</Label>
                  <Input name="name" defaultValue={editingFood?.name} required />
                </div>
                <div>
                  <Label>英文名</Label>
                  <Input name="name_en" defaultValue={editingFood?.name_en} required />
                </div>
                <div>
                  <Label>Emoji</Label>
                  <Input name="emoji" defaultValue={editingFood?.emoji} required />
                </div>
                <div>
                  <Label>分类</Label>
                  <Input name="category" defaultValue={editingFood?.category} required />
                </div>
                <div>
                  <Label>热度 (1-5)</Label>
                  <Input name="popularity" type="number" min="1" max="5" defaultValue={editingFood?.popularity || 3} required />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="is_premium" defaultChecked={editingFood?.is_premium} />
                  <Label>付费专属</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" defaultChecked={editingFood?.is_active ?? true} />
                  <Label>启用</Label>
                </div>
                <Button type="submit">保存</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Emoji</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>热度</TableHead>
            <TableHead>使用次数</TableHead>
            <TableHead>付费</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFoods.map((food) => (
            <TableRow key={food.id}>
              <TableCell className="text-2xl">{food.emoji}</TableCell>
              <TableCell className="font-medium">{food.name}</TableCell>
              <TableCell>{food.category}</TableCell>
              <TableCell>{'⭐'.repeat(food.popularity)}</TableCell>
              <TableCell>{food.usage_count}</TableCell>
              <TableCell>{food.is_premium && <Badge>付费</Badge>}</TableCell>
              <TableCell>
                <Switch
                  checked={food.is_active}
                  onCheckedChange={() => toggleActive(food.id, food.is_active)}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingFood(food);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteFood(food.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
