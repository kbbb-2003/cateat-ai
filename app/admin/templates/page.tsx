'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  version: string;
  min_plan_type: string;
  usage_count: number;
  is_active: boolean;
  is_default: boolean;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/admin/templates');
      const data = await res.json();
      setTemplates(data);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      toast.success('更新成功');
      fetchTemplates();
    } catch (error) {
      toast.error('更新失败');
    }
  };

  const setDefault = async (id: string) => {
    if (!confirm('确定设为默认模板？')) return;
    try {
      await fetch(`/api/admin/templates/${id}/set-default`, {
        method: 'POST',
      });
      toast.success('设置成功');
      fetchTemplates();
    } catch (error) {
      toast.error('设置失败');
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm('确定删除此模板？此操作不可恢复！')) return;
    try {
      await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
      });
      toast.success('删除成功');
      fetchTemplates();
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">专业模板管理</h1>
        <Link href="/admin/templates/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            新增模板
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名称</TableHead>
            <TableHead>版本</TableHead>
            <TableHead>最低套餐</TableHead>
            <TableHead>使用次数</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>默认</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.name}</TableCell>
              <TableCell>{template.version}</TableCell>
              <TableCell>
                <Badge variant={template.min_plan_type === 'vip' ? 'default' : 'secondary'}>
                  {template.min_plan_type.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{template.usage_count}</TableCell>
              <TableCell>
                <Switch
                  checked={template.is_active}
                  onCheckedChange={() => toggleActive(template.id, template.is_active)}
                />
              </TableCell>
              <TableCell>
                {template.is_default ? (
                  <Badge>默认</Badge>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setDefault(template.id)}>
                    设为默认
                  </Button>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/admin/templates/${template.id}`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTemplate(template.id)}
                  >
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
