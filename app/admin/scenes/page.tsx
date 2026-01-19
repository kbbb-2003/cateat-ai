'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Scene {
  id: string;
  name: string;
  name_en: string;
  description: string;
  is_premium: boolean;
  is_active: boolean;
  usage_count: number;
}

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchScenes = async () => {
    try {
      const res = await fetch('/api/admin/scenes');
      const data = await res.json();
      setScenes(data);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenes();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      name_en: formData.get('name_en'),
      description: formData.get('description'),
      is_premium: formData.get('is_premium') === 'on',
      is_active: formData.get('is_active') === 'on',
    };

    try {
      const url = editingScene ? `/api/admin/scenes/${editingScene.id}` : '/api/admin/scenes';
      const method = editingScene ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      toast.success(editingScene ? '更新成功' : '创建成功');
      setIsDialogOpen(false);
      setEditingScene(null);
      fetchScenes();
    } catch (error) {
      toast.error('保存失败');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/scenes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      toast.success('更新成功');
      fetchScenes();
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const deleteScene = async (id: string) => {
    if (!confirm('确定删除此场景？')) return;
    try {
      await fetch(`/api/admin/scenes/${id}`, { method: 'DELETE' });
      toast.success('删除成功');
      fetchScenes();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">场景管理</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingScene(null)}>
              <Plus className="w-4 h-4 mr-2" />
              新增场景
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingScene ? '编辑场景' : '新增场景'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <Label>名称</Label>
                <Input name="name" defaultValue={editingScene?.name} required />
              </div>
              <div>
                <Label>英文名</Label>
                <Input name="name_en" defaultValue={editingScene?.name_en} required />
              </div>
              <div>
                <Label>描述</Label>
                <Input name="description" defaultValue={editingScene?.description} />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_premium" defaultChecked={editingScene?.is_premium} />
                <Label>付费专属</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" name="is_active" defaultChecked={editingScene?.is_active ?? true} />
                <Label>启用</Label>
              </div>
              <Button type="submit">保存</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>英文名</TableHead>
            <TableHead>使用次数</TableHead>
            <TableHead>付费</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenes.map((scene) => (
            <TableRow key={scene.id}>
              <TableCell className="font-medium">{scene.name}</TableCell>
              <TableCell>{scene.name_en}</TableCell>
              <TableCell>{scene.usage_count}</TableCell>
              <TableCell>{scene.is_premium && <Badge>付费</Badge>}</TableCell>
              <TableCell>
                <Switch
                  checked={scene.is_active}
                  onCheckedChange={() => toggleActive(scene.id, scene.is_active)}
                />
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingScene(scene);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteScene(scene.id)}>
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
