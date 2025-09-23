'use client';

import { Button, Avatar, Dropdown } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Navigation() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 bg-white border-b shadow-sm">
      <div className="flex items-center gap-6">
        <Link href="/" className="font-bold text-xl text-blue-600">
          Crypto Trading Platform
        </Link>
        <Link href="/strategy-log" className="font-semibold text-gray-700 hover:text-blue-600 transition-colors">
          策略日志
        </Link>
      </div>
    </nav>
  );
}
