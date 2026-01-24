'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import {
  Loader2, Send, Download, Sparkles, Image as ImageIcon,
  Plus, ChevronDown, Edit2, Trash2, RefreshCw, Menu, X,
  Settings, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  image?: string;
  timestamp: Date;
  isEditing?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

interface GenerationSettings {
  model: string;
  output: string;
  aspectRatio: string;
  resolution: string;
  format: string;
}

export default function ImageGeneratorPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const isPremium = profile?.plan_type === 'pro' || profile?.plan_type === 'vip';

  const [conversations, setConversations] = useState<Conversation[]>([
    { id: '1', title: '橘猫吃鱼', lastMessage: '一只橘猫在吃小鱼干', timestamp: new Date() },
    { id: '2', title: '猫咪喝奶', lastMessage: '可爱的小猫咪在喝牛奶', timestamp: new Date() },
  ]);
  const [currentChatId, setCurrentChatId] = useState<string>('1');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [settings, setSettings] = useState<GenerationSettings>({
    model: 'nano-banana-pro',
    output: 'image',
    aspectRatio: '1:1',
    resolution: '1K',
    format: 'png'
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newConv: Conversation = {
      id: newId,
      title: '新对话',
      lastMessage: '',
      timestamp: new Date()
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentChatId(newId);
    setMessages([]);
    toast.success('已创建新对话');
  };

  const handleSwitchChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const prompt = inputText.trim();
    setInputText('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
          format: settings.format,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '图片生成失败');
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: '已为您生成图片',
        image: data.image,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      toast.success('图片生成成功！');
    } catch (error: any) {
      toast.error(error.message || '图片生成失败，请重试');
      console.error('生成错误:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditMessage = (messageId: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, isEditing: true } : msg
    ));
  };

  const handleSaveEdit = (messageId: string, newContent: string) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, content: newContent, isEditing: false } : msg
    ));
    toast.success('已更新提示词');
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast.success('已删除消息');
  };

  const handleRegenerate = async (messageId: string) => {
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1 || messageIndex === 0) return;

    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.role !== 'user') return;

    setMessages(prev => prev.slice(0, messageIndex));
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage.content,
          aspectRatio: settings.aspectRatio,
          resolution: settings.resolution,
          format: settings.format,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '图片生成失败');
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'ai',
        content: '已为您重新生成图片',
        image: data.image,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      toast.success('图片重新生成成功！');
    } catch (error: any) {
      toast.error(error.message || '图片重新生成失败，请重试');
      console.error('重新生成错误:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `cat-mukbang-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('图片已下载');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 左侧边栏 - 对话列表 */}
      <div className={`${leftSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <Button onClick={handleNewChat} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            新建对话
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.map(conv => (
            <Card
              key={conv.id}
              className={`p-3 mb-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                currentChatId === conv.id ? 'bg-orange-50 border-orange-200' : ''
              }`}
              onClick={() => handleSwitchChat(conv.id)}
            >
              <div className="font-medium text-sm truncate">{conv.title}</div>
              <div className="text-xs text-gray-500 truncate mt-1">{conv.lastMessage}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* 中间对话区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            >
              {leftSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Sparkles className="w-5 h-5 text-orange-500" />
            <h1 className="text-lg font-semibold">AI 图片生成器</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          >
            {rightSidebarOpen ? <ChevronRight className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </Button>
        </div>

        {/* 消息显示区 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ImageIcon className="w-16 h-16 mb-4" />
              <p className="text-lg">开始创作你的 AI 图片吧</p>
              <p className="text-sm mt-2">输入提示词，让 AI 为你生成精美图片</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-2xl ${msg.role === 'user' ? 'w-auto' : 'w-full'}`}>
                  {msg.role === 'user' ? (
                    <Card className="bg-orange-500 text-white p-4">
                      {msg.isEditing ? (
                        <div>
                          <Textarea
                            defaultValue={msg.content}
                            className="mb-2 bg-white text-black"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                handleSaveEdit(msg.id, e.currentTarget.value);
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={(e) => {
                              const textarea = e.currentTarget.parentElement?.querySelector('textarea');
                              if (textarea) handleSaveEdit(msg.id, textarea.value);
                            }}
                          >
                            保存
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-orange-600"
                              onClick={() => handleEditMessage(msg.id)}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-orange-600"
                              onClick={() => handleDeleteMessage(msg.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  ) : (
                    <Card className="bg-gray-100 p-4">
                      <p className="text-gray-700 mb-3">{msg.content}</p>
                      {msg.image && (
                        <div className="relative group">
                          <img
                            src={msg.image}
                            alt="Generated"
                            className="w-full rounded-lg shadow-lg"
                          />
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <Button
                              size="sm"
                              className="bg-white text-gray-700 hover:bg-gray-100"
                              onClick={() => handleDownload(msg.image!)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="bg-white text-gray-700 hover:bg-gray-100"
                              onClick={() => handleRegenerate(msg.id)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              </div>
            ))
          )}
          {isGenerating && (
            <div className="flex justify-start">
              <Card className="bg-gray-100 p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                  <span className="text-gray-600">正在生成图片...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 底部输入区 */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-2 mb-2">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="描述你想要生成的图片..."
                className="flex-1 resize-none"
                rows={1}
                disabled={isGenerating}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isGenerating}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>按 Enter 发送，Shift + Enter 换行</span>
              <span>
                今日剩余次数: <span className="text-orange-500 font-semibold">
                  {isPremium ? '无限' : '5'}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧设置面板 */}
      <div className={`${rightSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-white border-l border-gray-200 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-orange-500" />
            生成设置
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 模型选择 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              模型
            </label>
            <Select
              value={settings.model}
              onValueChange={(value) => setSettings({ ...settings, model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nano-banana-pro">Nano Banana Pro</SelectItem>
                <SelectItem value="nano-banana-ultra">Nano Banana Ultra</SelectItem>
                <SelectItem value="stable-diffusion">Stable Diffusion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 输出类型 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              输出类型
            </label>
            <Select
              value={settings.output}
              onValueChange={(value) => setSettings({ ...settings, output: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">图片</SelectItem>
                <SelectItem value="video">视频</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 宽高比 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              宽高比
            </label>
            <Select
              value={settings.aspectRatio}
              onValueChange={(value) => setSettings({ ...settings, aspectRatio: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1:1">1:1 (正方形)</SelectItem>
                <SelectItem value="16:9">16:9 (横屏)</SelectItem>
                <SelectItem value="9:16">9:16 (竖屏)</SelectItem>
                <SelectItem value="4:3">4:3 (标准)</SelectItem>
                <SelectItem value="3:4">3:4 (竖版)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 分辨率 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              分辨率
            </label>
            <Select
              value={settings.resolution}
              onValueChange={(value) => setSettings({ ...settings, resolution: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512">512px</SelectItem>
                <SelectItem value="1K">1K (1024px)</SelectItem>
                <SelectItem value="2K">2K (2048px)</SelectItem>
                <SelectItem value="4K">4K (4096px)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 格式 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              输出格式
            </label>
            <Select
              value={settings.format}
              onValueChange={(value) => setSettings({ ...settings, format: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="webp">WebP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 提示信息 */}
          <div className="mt-6 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-orange-600">提示：</span>
              高分辨率图片生成时间较长，建议先使用 1K 测试效果。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
