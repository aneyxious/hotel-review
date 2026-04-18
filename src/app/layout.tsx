import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '花园酒店评论浏览',
  description: '花园酒店住客评论浏览与分析',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-slate-50">{children}</body>
    </html>
  );
}
