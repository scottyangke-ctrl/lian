'use client';
// components/MACDCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, InputNumber, Row, Col } from 'antd';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MACDCardProps {
  closes: number[];
  defaultFastPeriod?: number;
  defaultSlowPeriod?: number;
  defaultSignalPeriod?: number;
  onSettingsChange?: (fast: number, slow: number, signal: number) => void;
}

const MACDCard: React.FC<MACDCardProps> = ({ 
  closes, 
  defaultFastPeriod = 12, 
  defaultSlowPeriod = 26, 
  defaultSignalPeriod = 9,
  onSettingsChange
}) => {
  const [fastPeriod, setFastPeriod] = useState<number>(defaultFastPeriod);
  const [slowPeriod, setSlowPeriod] = useState<number>(defaultSlowPeriod);
  const [signalPeriod, setSignalPeriod] = useState<number>(defaultSignalPeriod);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempFast, setTempFast] = useState<number>(defaultFastPeriod);
  const [tempSlow, setTempSlow] = useState<number>(defaultSlowPeriod);
  const [tempSignal, setTempSignal] = useState<number>(defaultSignalPeriod);
  const [macdData, setMacdData] = useState<any[]>([]);
  const [currentMacd, setCurrentMacd] = useState<{dif: number, dea: number, macd: number}>({dif: 0, dea: 0, macd: 0});

  // 计算EMA函数
  const calculateEMA = (data: number[], period: number): number[] => {
    const emaValues: number[] = [];
    if (data.length === 0) return emaValues;
    
    const multiplier = 2 / (period + 1);
    
    // 初始EMA为SMA
    let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    emaValues.push(ema);
    
    // 计算后续EMA
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
      emaValues.push(ema);
    }
    
    return emaValues;
  };

  // 计算MACD
  useEffect(() => {
    if (closes.length < slowPeriod + signalPeriod) return;
    
    // 计算快线和慢线EMA
    const fastEMA = calculateEMA(closes, fastPeriod);
    const slowEMA = calculateEMA(closes, slowPeriod);
    
    // 计算DIF（差离值）
    const difValues: number[] = [];
    for (let i = 0; i < slowEMA.length; i++) {
      // 确保索引对齐
      const fastIndex = i + (fastEMA.length - slowEMA.length);
      if (fastIndex >= 0 && fastIndex < fastEMA.length) {
        difValues.push(fastEMA[fastIndex] - slowEMA[i]);
      }
    }
    
    // 计算DEA（信号线）
    const deaValues = calculateEMA(difValues, signalPeriod);
    
    // 计算MACD柱状图
    const macdValues: number[] = [];
    for (let i = 0; i < deaValues.length; i++) {
      // 确保索引对齐
      const difIndex = i + (difValues.length - deaValues.length);
      if (difIndex >= 0 && difIndex < difValues.length) {
        macdValues.push((difValues[difIndex] - deaValues[i]) * 2);
      }
    }
    
    // 准备图表数据
    const chartData = [];
    const startIndex = Math.max(0, macdValues.length - 20);
    
    for (let i = startIndex; i < macdValues.length; i++) {
      const difIndex = i + (difValues.length - macdValues.length);
      const deaIndex = i + (deaValues.length - macdValues.length);
      
      chartData.push({
        index: i,
        DIF: difValues[difIndex] || 0,
        DEA: deaValues[deaIndex] || 0,
        MACD: macdValues[i] || 0
      });
    }
    
    setMacdData(chartData);
    
    // 设置当前MACD值
    if (macdValues.length > 0) {
      const lastIndex = macdValues.length - 1;
      const difIndex = lastIndex + (difValues.length - macdValues.length);
      const deaIndex = lastIndex + (deaValues.length - macdValues.length);
      
      setCurrentMacd({
        dif: difValues[difIndex] || 0,
        dea: deaValues[deaIndex] || 0,
        macd: macdValues[lastIndex] || 0
      });
    }
  }, [closes, fastPeriod, slowPeriod, signalPeriod]);

  // 处理设置确认
  const handleOk = () => {
    // 验证输入
    if (tempFast >= tempSlow) {
      return;
    }
    
    if (tempFast < 5 || tempSlow > 200 || tempSignal < 5 || tempSignal > 50) {
      return;
    }
    
    setFastPeriod(tempFast);
    setSlowPeriod(tempSlow);
    setSignalPeriod(tempSignal);
    
    if (onSettingsChange) {
      onSettingsChange(tempFast, tempSlow, tempSignal);
    }
    
    setIsModalVisible(false);
  };

  // 确定MACD状态
  const getMacdStatus = () => {
    const { dif, dea, macd } = currentMacd;
    
    if (dif > dea && macd > 0) {
      return '多头信号';
    } else if (dif < dea && macd < 0) {
      return '空头信号';
    } else if (dif > dea && macd < 0) {
      return '多头减弱';
    } else if (dif < dea && macd > 0) {
      return '空头减弱';
    }
    return '中性';
  };

  // 获取MACD状态颜色
  const getStatusColor = () => {
    const status = getMacdStatus();
    if (status === '多头信号') return 'text-green-600';
    if (status === '空头信号') return 'text-red-600';
    if (status === '多头减弱') return 'text-yellow-600';
    if (status === '空头减弱') return 'text-orange-600';
    return 'text-gray-600';
  };

  return (
    <Card 
      title={`MACD(${fastPeriod},${slowPeriod},${signalPeriod})`} 
      className="rounded-lg shadow-sm"
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => {
            setTempFast(fastPeriod);
            setTempSlow(slowPeriod);
            setTempSignal(signalPeriod);
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
              <div className="text-sm text-gray-600">DIF</div>
              <div className={`text-lg font-bold ${currentMacd.dif > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentMacd.dif.toFixed(4)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">DEA</div>
              <div className={`text-lg font-bold ${currentMacd.dea > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentMacd.dea.toFixed(4)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">MACD</div>
              <div className={`text-lg font-bold ${currentMacd.macd > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentMacd.macd.toFixed(4)}
              </div>
            </div>
          </Col>
        </Row>
        
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">状态</div>
          <div className={`text-lg font-bold ${getStatusColor()}`}>
            {getMacdStatus()}
          </div>
        </div>
      </div>

      {/* MACD图表 */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={macdData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="index" hide />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="DIF" 
              name="DIF" 
              stroke="#3498db" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="DEA" 
              name="DEA" 
              stroke="#e74c3c" 
              strokeWidth={2} 
              dot={false} 
            />
            <Bar 
              dataKey="MACD" 
              name="MACD柱" 
              fill={currentMacd.macd > 0 ? '#2ecc71' : '#e74c3c'} 
              barSize={4} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 设置模态框 */}
      <Modal 
        title="自定义MACD参数" 
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <div className="space-y-6 py-4">
          <Row gutter={16}>
            <Col span={8}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  快速EMA周期
                </label>
                <InputNumber
                  value={tempFast}
                  onChange={value => value && setTempFast(value)}
                  min={5}
                  max={tempSlow - 1}
                  className="w-full"
                />
              </div>
            </Col>
            <Col span={8}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  慢速EMA周期
                </label>
                <InputNumber
                  value={tempSlow}
                  onChange={value => value && setTempSlow(value)}
                  min={tempFast + 1}
                  max={200}
                  className="w-full"
                />
              </div>
            </Col>
            <Col span={8}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  信号EMA周期
                </label>
                <InputNumber
                  value={tempSignal}
                  onChange={value => value && setTempSignal(value)}
                  min={5}
                  max={50}
                  className="w-full"
                />
              </div>
            </Col>
          </Row>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">MACD指标说明</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium">MACD</span> (Moving Average Convergence Divergence) 是一种趋势跟踪动量指标。</p>
              <p>它由三部分组成：</p>
              <ul className="list-disc pl-5">
                <li><span className="font-medium">DIF</span> (差离值)：快速EMA与慢速EMA的差值</li>
                <li><span className="font-medium">DEA</span> (信号线)：DIF的EMA</li>
                <li><span className="font-medium">MACD柱</span>：DIF与DEA差值的2倍</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">交易信号</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">买入信号</div>
                <ul className="list-disc pl-5">
                  <li>DIF上穿DEA</li>
                  <li>MACD柱由负转正</li>
                  <li>零轴上方金叉</li>
                </ul>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="font-medium">卖出信号</div>
                <ul className="list-disc pl-5">
                  <li>DIF下穿DEA</li>
                  <li>MACD柱由正转负</li>
                  <li>零轴下方死叉</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">常用参数组合</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium">经典组合</div>
                <div>12, 26, 9</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">短线组合</div>
                <div>5, 35, 5</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-medium">长线组合</div>
                <div>20, 50, 10</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default MACDCard;