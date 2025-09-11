'use client';
// components/RSICard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, InputNumber, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RSICardProps {
  closes: number[];
  defaultPeriod?: number;
  onSettingsChange?: (period: number) => void;
}

const RSICard: React.FC<RSICardProps> = ({ 
  closes, 
  defaultPeriod = 14,
  onSettingsChange
}) => {
  const [period, setPeriod] = useState<number>(defaultPeriod);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempPeriod, setTempPeriod] = useState<number>(defaultPeriod);
  const [rsiValues, setRsiValues] = useState<number[]>([]);
  const [currentRsi, setCurrentRsi] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);

  // 计算RSI
  useEffect(() => {
    if (closes.length < period + 1) return;
    
    const gains: number[] = [];
    const losses: number[] = [];
    
    // 计算初始平均值
    for (let i = 1; i <= period; i++) {
      const change = closes[i] - closes[i - 1];
      gains.push(Math.max(change, 0));
      losses.push(Math.max(-change, 0));
    }
    
    let avgGain = gains.reduce((sum, val) => sum + val, 0) / period;
    let avgLoss = losses.reduce((sum, val) => sum + val, 0) / period;
    
    const rsiValues: number[] = [];
    const chartData: any[] = [];
    
    // 计算后续值
    for (let i = period + 1; i < closes.length; i++) {
      const change = closes[i] - closes[i - 1];
      const currentGain = Math.max(change, 0);
      const currentLoss = Math.max(-change, 0);
      
      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
      
      // 避免除以零
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      rsiValues.push(rsi);
      
      // 准备图表数据
      if (i >= closes.length - 20) {
        chartData.push({
          index: i,
          RSI: Number(rsi.toFixed(2))
        });
      }
    }
    
    setRsiValues(rsiValues);
    setChartData(chartData);
    
    if (rsiValues.length > 0) {
      setCurrentRsi(rsiValues[rsiValues.length - 1]);
    }
  }, [closes, period]);

  // 确定RSI状态
  const getRsiStatus = () => {
    if (currentRsi > 70) return '超买';
    if (currentRsi < 30) return '超卖';
    if (currentRsi > 60) return '强势';
    if (currentRsi < 40) return '弱势';
    return '中性';
  };

  // 获取状态颜色
  const getStatusColor = () => {
    const status = getRsiStatus();
    if (status === '超买') return 'text-red-600';
    if (status === '超卖') return 'text-green-600';
    if (status === '强势') return 'text-blue-600';
    if (status === '弱势') return 'text-yellow-600';
    return 'text-gray-600';
  };

  // 处理设置确认
  const handleOk = () => {
    // 验证输入
    if (tempPeriod < 5 || tempPeriod > 50) {
      return;
    }
    
    setPeriod(tempPeriod);
    
    if (onSettingsChange) {
      onSettingsChange(tempPeriod);
    }
    
    setIsModalVisible(false);
  };

  return (
    <Card 
      title={`RSI(${period})`} 
      className="rounded-lg shadow-sm"
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => {
            setTempPeriod(period);
            setIsModalVisible(true);
          }}
        >
          设置
        </Button>
      }
    >
      <div className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">当前RSI</div>
              <div className={`text-2xl font-bold ${
                currentRsi > 70 ? 'text-red-600' : 
                currentRsi < 30 ? 'text-green-600' : 'text-blue-600'
              }`}>
                {currentRsi.toFixed(2)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">状态</div>
              <div className={`text-lg font-bold ${getStatusColor()}`}>
                {getRsiStatus()}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">信号</div>
              <div className="text-lg font-bold">
                {currentRsi > 70 ? '卖出' : currentRsi < 30 ? '买入' : '持有'}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* RSI图表 */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="index" hide />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="RSI" 
              name="RSI" 
              stroke="#3498db" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="70" 
              name="超买线" 
              stroke="#e74c3c" 
              strokeWidth={1} 
              dot={false} 
              strokeDasharray="3 3"
            />
            <Line 
              type="monotone" 
              dataKey="30" 
              name="超卖线" 
              stroke="#2ecc71" 
              strokeWidth={1} 
              dot={false} 
              strokeDasharray="3 3"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 设置模态框 */}
      <Modal 
        title="自定义RSI参数" 
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <div className="space-y-6 py-4">
          <Row gutter={16}>
            <Col span={24}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RSI周期
                </label>
                <InputNumber
                  value={tempPeriod}
                  onChange={value => value && setTempPeriod(value)}
                  min={5}
                  max={50}
                  className="w-full"
                />
              </div>
            </Col>
          </Row>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">RSI指标说明</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium">RSI</span> (相对强弱指数) 是衡量价格变动速度和变化的动量振荡器。</p>
              <p>它比较近期涨幅和跌幅的大小，以评估资产的超买或超卖情况。</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">交易信号</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">买入信号</div>
                <ul className="list-disc pl-5">
                  <li>RSI低于30（超卖）</li>
                  <li>RSI从超卖区反弹</li>
                  <li>底部背离（价格新低，RSI未新低）</li>
                </ul>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="font-medium">卖出信号</div>
                <ul className="list-disc pl-5">
                  <li>RSI高于70（超买）</li>
                  <li>RSI从超买区回落</li>
                  <li>顶部背离（价格新高，RSI未新高）</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">常用周期</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium">短期</div>
                <div>9, 10, 14</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">中期</div>
                <div>14, 20, 25</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-medium">长期</div>
                <div>30, 50</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default RSICard;