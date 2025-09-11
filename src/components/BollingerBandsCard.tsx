'use client';
// components/BollingerBandsCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, InputNumber, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BollingerBandsCardProps {
  closes: number[];
  defaultPeriod?: number;
  defaultDeviation?: number;
  onSettingsChange?: (period: number, deviation: number) => void;
}

const BollingerBandsCard: React.FC<BollingerBandsCardProps> = ({ 
  closes, 
  defaultPeriod = 20, 
  defaultDeviation = 2,
  onSettingsChange
}) => {
  const [period, setPeriod] = useState<number>(defaultPeriod);
  const [deviation, setDeviation] = useState<number>(defaultDeviation);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempPeriod, setTempPeriod] = useState<number>(defaultPeriod);
  const [tempDeviation, setTempDeviation] = useState<number>(defaultDeviation);
  const [bollingerData, setBollingerData] = useState<any[]>([]);
  const [currentBollinger, setCurrentBollinger] = useState<{
    upper: number;
    middle: number;
    lower: number;
    price: number;
    bandwidth: number;
    percentB: number;
  }>({ upper: 0, middle: 0, lower: 0, price: 0, bandwidth: 0, percentB: 0 });

  // 计算布林带
  useEffect(() => {
    if (closes.length < period) return;
    
    const newData = [];
    
    for (let i = period - 1; i < closes.length; i++) {
      const slice = closes.slice(i - period + 1, i + 1);
      const middle = slice.reduce((sum, val) => sum + val, 0) / period;
      
      // 计算标准差
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - middle, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      
      const upper = middle + deviation * stdDev;
      const lower = middle - deviation * stdDev;
      const bandwidth = (upper - lower) / middle * 100;
      const percentB = (closes[i] - lower) / (upper - lower);
      
      newData.push({
        index: i,
        price: closes[i],
        upper: Number(upper.toFixed(2)),
        middle: Number(middle.toFixed(2)),
        lower: Number(lower.toFixed(2)),
        bandwidth: Number(bandwidth.toFixed(2)),
        percentB: Number(percentB.toFixed(2))
      });
    }
    
    setBollingerData(newData.slice(-20)); // 只保留最近20个数据点
    
    if (newData.length > 0) {
      const last = newData[newData.length - 1];
      setCurrentBollinger({
        upper: last.upper,
        middle: last.middle,
        lower: last.lower,
        price: last.price,
        bandwidth: last.bandwidth,
        percentB: last.percentB
      });
    }
  }, [closes, period, deviation]);

  // 处理设置确认
  const handleOk = () => {
    // 验证输入
    if (tempPeriod < 5 || tempPeriod > 100) {
      return;
    }
    
    if (tempDeviation < 1 || tempDeviation > 5) {
      return;
    }
    
    setPeriod(tempPeriod);
    setDeviation(tempDeviation);
    
    if (onSettingsChange) {
      onSettingsChange(tempPeriod, tempDeviation);
    }
    
    setIsModalVisible(false);
  };

  // 确定布林带状态
  const getBollingerStatus = () => {
    const { price, upper, lower } = currentBollinger;
    
    if (price > upper) {
      return '超买区域';
    } else if (price < lower) {
      return '超卖区域';
    } else if (price > upper * 0.95) {
      return '接近上轨';
    } else if (price < lower * 1.05) {
      return '接近下轨';
    } else if (price > currentBollinger.middle) {
      return '中轨上方';
    } else {
      return '中轨下方';
    }
  };

  // 获取状态颜色
  const getStatusColor = () => {
    const status = getBollingerStatus();
    if (status === '超买区域') return 'text-red-600';
    if (status === '超卖区域') return 'text-green-600';
    if (status === '接近上轨') return 'text-orange-600';
    if (status === '接近下轨') return 'text-yellow-600';
    if (status === '中轨上方') return 'text-blue-600';
    return 'text-gray-600';
  };

  return (
    <Card 
      title={`布林带(${period},${deviation})`} 
      className="rounded-lg shadow-sm"
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => {
            setTempPeriod(period);
            setTempDeviation(deviation);
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
              <div className="text-sm text-gray-600">上轨</div>
              <div className="text-lg font-bold text-purple-600">
                {currentBollinger.upper.toFixed(2)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">中轨</div>
              <div className="text-lg font-bold text-blue-600">
                {currentBollinger.middle.toFixed(2)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">下轨</div>
              <div className="text-lg font-bold text-green-600">
                {currentBollinger.lower.toFixed(2)}
              </div>
            </div>
          </Col>
        </Row>
        
        <Row gutter={16} className="mt-3">
          <Col span={12}>
            <div className="text-center">
              <div className="text-sm text-gray-600">当前价格</div>
              <div className={`text-lg font-bold ${
                currentBollinger.price > currentBollinger.middle 
                  ? 'text-blue-600' 
                  : 'text-gray-600'
              }`}>
                {currentBollinger.price.toFixed(2)}
              </div>
            </div>
          </Col>
          <Col span={12}>
            <div className="text-center">
              <div className="text-sm text-gray-600">带宽</div>
              <div className="text-lg font-bold text-orange-600">
                {currentBollinger.bandwidth.toFixed(2)}%
              </div>
            </div>
          </Col>
        </Row>
        
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">位置状态</div>
          <div className={`text-lg font-bold ${getStatusColor()}`}>
            {getBollingerStatus()}
          </div>
        </div>
      </div>

      {/* 布林带图表 */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={bollingerData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="index" hide />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip 
              formatter={(value, name) => [`${value}`, name]}
              labelFormatter={() => ''}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="price" 
              name="价格" 
              stroke="#3498db" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="upper" 
              name="上轨" 
              stroke="#9b59b6" 
              strokeWidth={1.5} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="middle" 
              name="中轨" 
              stroke="#2ecc71" 
              strokeWidth={1.5} 
              dot={false} 
              strokeDasharray="3 3"
            />
            <Line 
              type="monotone" 
              dataKey="lower" 
              name="下轨" 
              stroke="#e74c3c" 
              strokeWidth={1.5} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 设置模态框 */}
      <Modal 
        title="自定义布林带参数" 
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <div className="space-y-6 py-4">
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  移动平均周期
                </label>
                <InputNumber
                  value={tempPeriod}
                  onChange={value => value && setTempPeriod(value)}
                  min={5}
                  max={100}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  常用周期: 20, 50
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标准差倍数
                </label>
                <InputNumber
                  value={tempDeviation}
                  onChange={value => value && setTempDeviation(value)}
                  min={1}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  常用倍数: 2, 2.5
                </div>
              </div>
            </Col>
          </Row>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">布林带指标说明</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium">布林带</span> (Bollinger Bands) 是由三条线组成的波动性指标：</p>
              <ul className="list-disc pl-5">
                <li><span className="font-medium">中轨</span>: {period}期简单移动平均线</li>
                <li><span className="font-medium">上轨</span>: 中轨 + {deviation}倍标准差</li>
                <li><span className="font-medium">下轨</span>: 中轨 - {deviation}倍标准差</li>
              </ul>
              <p>布林带宽度随市场波动性变化，波动性越大，带越宽。</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">交易信号</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">买入信号</div>
                <ul className="list-disc pl-5">
                  <li>价格触及下轨反弹</li>
                  <li>布林带收窄后扩张</li>
                  <li>价格突破中轨向上</li>
                </ul>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="font-medium">卖出信号</div>
                <ul className="list-disc pl-5">
                  <li>价格触及上轨回落</li>
                  <li>价格跌破中轨向下</li>
                  <li>布林带极度扩张后反转</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">关键概念</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium">布林带宽度</div>
                <p>衡量布林带上下轨之间的距离，计算公式为：(上轨 - 下轨) / 中轨 * 100</p>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-medium">%b指标</div>
                <p>表示价格在布林带中的位置，计算公式为：(价格 - 下轨) / (上轨 - 下轨)</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">市场状态</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">超卖区域</div>
                <p>价格触及下轨，可能反弹</p>
              </div>
              <div className="bg-yellow-50 p-2 rounded">
                <div className="font-medium">中性区域</div>
                <p>价格在中轨附近波动</p>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="font-medium">超买区域</div>
                <p>价格触及上轨，可能回落</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default BollingerBandsCard;