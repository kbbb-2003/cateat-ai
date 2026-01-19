'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useProfile } from '@/lib/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function MyCatsPage() {
  const { user } = useProfile();
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    color: '',
    personality: '',
    features: '',
  });

  useEffect(() => {
    if (!user) return;
    loadCats();
  }, [user]);

  const loadCats = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('cats')
      .select('*')
      .eq('user_id', user?.id)
      .eq('is_preset', false);

    if (error) {
      console.error('Error loading cats:', error);
    } else {
      setCats(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.breed) {
      toast.error('请填写名字和品种');
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('cats').insert({
      user_id: user?.id,
      name: formData.name,
      breed: formData.breed,
      color: formData.color,
      personality: formData.personality,
      features: formData.features,
      is_preset: false,
    });

    if (error) {
      toast.error('添加失败');
      console.error(error);
    } else {
      toast.success('添加成功');
      setIsDialogOpen(false);
      setFormData({ name: '', breed: '', color: '', personality: '', features: '' });
      loadCats();
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from('cats').delete().eq('id', id);

    if (error) {
      toast.error('删除失败');
    } else {
      toast.success('删除成功');
      loadCats();
    }
  };

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">我的猫咪</h1>
          <p className="text-gray-600">管理你的猫咪角色，生成时快速选择</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              添加猫咪
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加新猫咪</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">名字</label>
                <Input
                  placeholder="例如：肥橘"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">品种</label>
                <Input
                  placeholder="例如：橘猫"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">颜色</label>
                <Input
                  placeholder="例如：橙色"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">性格</label>
                <Input
                  placeholder="例如：贪吃、慵懒"
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">特征</label>
                <Input
                  placeholder="例如：圆滚滚的身材"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full">
                保存
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {cats.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🐱</div>
          <h3 className="font-semibold text-lg mb-2">还没有自定义猫咪</h3>
          <p className="text-sm text-gray-600">点击上方按钮添加你的第一只猫咪</p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {cats.map((cat) => (
            <Card key={cat.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                  <p className="text-sm text-gray-600">{cat.breed}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                {cat.color && (
                  <div>
                    <span className="font-medium">颜色：</span>
                    <span className="text-gray-600">{cat.color}</span>
                  </div>
                )}
                {cat.personality && (
                  <div>
                    <span className="font-medium">性格：</span>
                    <span className="text-gray-600">{cat.personality}</span>
                  </div>
                )}
                {cat.features && (
                  <div>
                    <span className="font-medium">特征：</span>
                    <span className="text-gray-600">{cat.features}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
