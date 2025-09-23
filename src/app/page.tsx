'use client';

import React from 'react';
import { Spin, Card, Typography, Button } from 'antd';
import Link from 'next/link';

const { Title, Text } = Typography;

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <Title level={2}>加密货币交易平台</Title>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card
            title="K线分析"
            extra={<Link href="/k_line_analysis">查看</Link>}
            className="hover:shadow-lg transition-shadow"
          >
            <p>查看和分析加密货币的K线图表</p>
          </Card>
          <Card
            title="策略日志"
            extra={<Link href="/strategy-log">查看</Link>}
            className="hover:shadow-lg transition-shadow"
          >
            <p>查看交易策略的执行日志</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
