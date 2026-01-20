import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ResultComparison } from '@/components/common/ResultComparison';
import { Header } from '@/components/layout/Header';
import { Sparkles, Zap, Heart, TrendingUp, Check } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">
                专为 AI 视频博主打造
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              猫猫吃播 AI 提示词
              <br />
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                一键生成爆款视频
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              选择猫咪、食物、风格，自动生成 Nanobanana 图片提示词和 Veo
              视频提示词。专业模板加持，让你的猫猫吃播视频更容易爆款。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-lg px-8"
              >
                <Link href="/create">
                  <Sparkles className="w-5 h-5 mr-2" />
                  立即开始生成
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link href="#examples">查看示例</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              为什么选择我们？
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              专为 AI 视频创作者设计，让提示词生成更简单、更专业
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">一键生成</h3>
              <p className="text-sm text-gray-600">
                选择元素，点击生成，立即获得图片和视频提示词
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">专业模板</h3>
              <p className="text-sm text-gray-600">
                Pro 用户独享爆款公式，提示词质量更高
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">自定义猫咪</h3>
              <p className="text-sm text-gray-600">
                保存你的猫咪角色，每次生成都能用
              </p>
            </Card>
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">爆款建议</h3>
              <p className="text-sm text-gray-600">
                Pro 版提供发布技巧和优化建议
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="examples" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              基础版 vs 专业版
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              看看专业版如何让你的提示词更加详细和专业
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <ResultComparison />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              选择适合你的套餐
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              从免费开始，随时升级到专业版
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">免费版</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">¥0</span>
                <span className="text-gray-600">/月</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>每天 3 次生成</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>基础提示词模板</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>图片和视频提示词</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>保存历史记录</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                当前套餐
              </Button>
            </Card>

            {/* Pro Plan */}
            <Card className="p-6 border-2 border-amber-500 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  推荐
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Pro 版</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">¥29</span>
                <span className="text-gray-600">/月</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="font-medium">每天 5 次生成</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span className="font-medium">独家爆款公式模板</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>更详细的专业提示词</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>爆款建议和发布技巧</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <span>解锁全部食物和场景</span>
                </li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                立即升级
              </Button>
            </Card>

            {/* VIP Plan */}
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-2">VIP 版</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">¥99</span>
                <span className="text-gray-600">/月</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="font-medium">无限次生成</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span className="font-medium">全部 Pro 功能</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span>优先客服支持</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <span>新功能抢先体验</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">
                联系我们
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-500 to-orange-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            准备好创作爆款猫猫吃播了吗？
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            立即开始，免费体验基础版功能
          </p>
          <Button
            asChild
            size="lg"
            className="bg-white text-amber-600 hover:bg-gray-100 text-lg px-8"
          >
            <Link href="/create">
              <Sparkles className="w-5 h-5 mr-2" />
              开始生成提示词
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🐱</span>
                <span className="text-white font-bold">猫猫吃播</span>
              </div>
              <p className="text-sm">
                专为 AI 视频博主打造的提示词生成工具
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">产品</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/create" className="hover:text-white">
                    生成器
                  </Link>
                </li>
                <li>
                  <Link href="#examples" className="hover:text-white">
                    示例
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white">
                    价格
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">支持</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    使用教程
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    常见问题
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    联系我们
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">关于</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white">
                    关于我们
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    隐私政策
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    服务条款
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2026 猫猫吃播. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
