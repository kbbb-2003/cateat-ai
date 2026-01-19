'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TemplateEditPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0',
    system_prompt: '',
    image_prompt_template: '',
    video_prompt_template: '',
    viral_tip_template: '',
    min_plan_type: 'pro',
    is_active: true,
    output_viral_tips: true,
    output_sound_suggestions: true,
  });

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/templates/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData(data);
          setLoading(false);
        })
        .catch(() => {
          toast.error('加载失败');
          setLoading(false);
        });
    }
  }, [params.id, isNew]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew ? '/api/admin/templates' : `/api/admin/templates/${params.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error();

      toast.success(isNew ? '创建成功' : '保存成功');
      router.push('/admin/templates');
    } catch (error) {
      toast.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回列表
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-6">{isNew ? '新增模板' : '编辑模板'}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>
          <div className="space-y-4">
            <div>
              <Label>模板名称 *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            <div>
              <Label>版本号</Label>
              <Input
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">提示词模板</h2>
          <div className="space-y-4">
            <div>
              <Label>系统提示词 *</Label>
              <Textarea
                value={formData.system_prompt}
                onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                rows={10}
                className="font-mono text-sm"
                required
              />
            </div>
            <div>
              <Label>图片提示词模板</Label>
              <Textarea
                value={formData.image_prompt_template}
                onChange={(e) => setFormData({ ...formData, image_prompt_template: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>视频提示词模板</Label>
              <Textarea
                value={formData.video_prompt_template}
                onChange={(e) => setFormData({ ...formData, video_prompt_template: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <Label>爆款提示模板</Label>
              <Textarea
                value={formData.viral_tip_template}
                onChange={(e) => setFormData({ ...formData, viral_tip_template: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">权限设置</h2>
          <div className="space-y-4">
            <div>
              <Label>最低套餐要求</Label>
              <Select
                value={formData.min_plan_type}
                onValueChange={(value) => setFormData({ ...formData, min_plan_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>启用状态</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>输出爆款提示</Label>
              <Switch
                checked={formData.output_viral_tips}
                onCheckedChange={(checked) => setFormData({ ...formData, output_viral_tips: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>输出音效建议</Label>
              <Switch
                checked={formData.output_sound_suggestions}
                onCheckedChange={(checked) => setFormData({ ...formData, output_sound_suggestions: checked })}
              />
            </div>
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? '保存中...' : '保存'}
          </Button>
          <Link href="/admin/templates">
            <Button type="button" variant="outline">
              取消
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
