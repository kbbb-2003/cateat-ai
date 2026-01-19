'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Emotion {
  id: string;
  name: string;
  name_en: string;
  emoji: string;
  category: string;
  intensity: number;
  is_active: boolean;
  usage_count: number;
}

export default function EmotionsPage() {
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEmotion, setEditingEmotion] = useState<Emotion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchEmotions = async () => {
    try {
      const res = await fetch('/api/admin/emotions');
      const data = await res.json();
      setEmotions(data);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmotions();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      name_en: formData.get('name_en'),
      emoji: formData.get('emoji'),
      category: formData.get('category'),
      intensity: parseInt(formData.get('intensity') as string),
      is_active: formData.get('is_active') === 'on',
    };

    try {
      const url = editingEmotion ? `/api/admin/emotions/${editingEmotion.id}` : '/api/admin/emotions';
      const method = editingEmotion ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success(editingEmotion ? '更新成功' : '创建成功');
      setIsDialogOpen(false);
      setEditingEmotion(null);
      fetchEmotions();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/emotions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      toast.success('更新成功');
      fetchEmotions();
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const deleteEmotion = async (id: string) => {
    if (!confirm('确定删除此情绪？')) return;
    try {
      await fetch(`/api/admin/emotions/${id}`, { method: 'DELETE' });
      toast.success('删除成功');
      fetchEmotions();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  const filteredEmotions = categoryFilter === 'all'
    ? emotions
    : emotions.filter(e => e.category === categoryFilter);

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">情绪管理</h1>
        <div className="flex gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              <SelectItem value="开心">开心</SelectItem>
              <SelectItem value="惊讶">惊讶</SelectItem>
              <SelectItem value="难受">难受</SelectItem>
              <SelectItem value="搞笑">搞笑</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingEmotion(null)}>
                <Plus className="w-4 h-4 mr-2" />
                新增情绪
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingEmotion ? '编辑情绪' : '新增情绪'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label>名称</Label>
                  <Input name="name" defaultValue={editingEmotion?.name} required />
                </div>
                <div>
                  <Label>英文名</Label>
                  <Input name="name_en" defaultValue={editingEmotion?.name_en} required />
                </div>
                <div>
                  <Label>Emoji</Label>
                  <Input name="emoji" defaultValue={editingEmotion?.emoji} required />
                </div>
                <div>
                  <Label>分类</Label>
                  <Input name="category" defaultValue={editingEmotion?.category} required />
                </div>
                <div>
                  <Label>强度 (1-5)</Label>
                  <Input name="intensity" type="number" min="1" max="5" defaultValue={editingEmotion?.intensity || 3} required />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="is_active" defaultChecked={editingEmotion?.is_active ?? true} />
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
            <TableHead>强度</TableHead>
            <TableHead>使用次数</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredEmotions.map((emotion) => (
            <TableRow key={emotion.id}>
              <TableCell className="text-2xl">{emotion.emoji}</TableCell>
              <TableCell className="font-medium">{emotion.name}</TableCell>
              <TableCell>{emotion.category}</TableCell>
              <TableCell>{'⭐'.repeat(emotion.intensity)}</TableCell>
              <TableCell>{emotion.usage_count}</TableCell>
              <TableCell>
                <Switch
                  checked={emotion.is_active}
                  onCheckedChange={() => toggleActive(emotion.id, emotion.is_active)}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingEmotion(emotion);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteEmotion(emotion.id)}>
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
