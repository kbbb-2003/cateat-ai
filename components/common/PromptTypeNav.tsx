'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Video } from 'lucide-react';

export function PromptTypeNav() {
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = pathname === '/create-video' ? 'video' : 'image';

  const handleTabChange = (value: string) => {
    if (value === 'video') {
      router.push('/create-video');
    } else {
      router.push('/create');
    }
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="mb-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="image">
          <Camera className="w-4 h-4 mr-2" />
          图片提示词
        </TabsTrigger>
        <TabsTrigger value="video">
          <Video className="w-4 h-4 mr-2" />
          视频提示词
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
