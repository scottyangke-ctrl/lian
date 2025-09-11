'use client';
// components/EMAMACard.tsx
import React, { useState } from 'react';
import { Card, Button, Modal, InputNumber, Select, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const { Option } = Select;

interface EMAMACardProps {
  closes: number[];
  defaultType?: 'EMA' | 'MA';
  defaultPeriod?: number;
  onSettingsChange?: (type: 'EMA' | 'MA', period: number) => void;
}

const EMAMACard: React.FC<EMAMACardProps> = ({ 
  closes, 
  defaultType = 'EMA', 
  defaultPeriod = 20,
  onSettingsChange
}) => {
  const [type, setType] = useState<'EMA' | 'MA'>(defaultType);
  const [period, setPeriod] = useState<number>(defaultPeriod);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempType, setTempType] = useState<'EMA' | 'MA'>(defaultType);
  const [tempPeriod, setTempPeriod] = useState<number>(defaultPeriod);

  // 计算EMA函数
  const calculateEMA = (data: number[], period: number): number => {
    if (data.length === 0) return 0;
    if (data.length < period) return data[data.length - 1] || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    
    return Number(ema.toFixed(2));
  };

  // 计算MA函数
  const calculateMA = (data: number[], period: number): number => {
    if (data.length === 0) return 0;
    if (data.length < period) return data[data.length - 1] || 0;
    
    const lastPeriod = data.slice(data.length - period);
    return Number((lastPeriod.reduce((sum, val) => sum + val, 0) / period).toFixed(2));
  };

  // 计算移动平均线值
  const value = type === 'EMA' 
    ? calculateEMA(closes, period) 
    : calculateMA(closes, period);
  
  // 生成最近20个周期的移动平均线数据用于图表
  const generateChartData = () => {
    if (closes.length < period) return [];
    
    const chartData = [];
    const startIndex = Math.max(0, closes.length - 20);
    
    for (let i = startIndex; i < closes.length; i++) {
      const end = i + 1;
      const slice = closes.slice(Math.max(0, end - period), end);
      
      const maValue = slice.reduce((sum, val) => sum + val, 0) / slice.length;
      const emaValue = calculateEMA(closes.slice(0, end), period);
      
      chartData.push({
        index: i,
        price: closes[i],
        MA: Number(maValue.toFixed(2)),
        EMA: Number(emaValue.toFixed(2))
      });
    }
    
    return chartData;
  };

  const chartData = generateChartData();

  // 处理设置确认
  const handleOk = () => {
    // 验证输入
    if (tempPeriod < 5 || tempPeriod > 200) {
      return;
    }
    
    setType(tempType);
    setPeriod(tempPeriod);
    
    if (onSettingsChange) {
      onSettingsChange(tempType, tempPeriod);
    }
    
    setIsModalVisible(false);
  };

  return (
    <Card 
      title={`${type}${period}移动平均线`} 
      className="rounded-lg shadow-sm"
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => {
            setTempType(type);
            setTempPeriod(period);
            setIsModalVisible(true);
          }}
        >
          设置
        </Button>
      }
    >
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-blue-600 my-2">
          {value}
        </div>
        <div className="text-sm text-gray-500">
          当前价格: {closes.length > 0 ? closes[closes.length - 1].toFixed(2) : '--'}
        </div>
        <div className={`text-sm font-medium mt-1 ${
          value < (closes[closes.length - 1] || 0) ? 'text-green-600' : 'text-red-600'
        }`}>
          {value < (closes[closes.length - 1] || 0) ? '价格在均线上方' : '价格在均线下方'}
        </div>
      </div>

      {/* 移动平均线图表 */}
      <div className="h-40 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="index" hide />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip 
              formatter={(value: number | string) => [`${value}`, '']}
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
              dataKey="MA" 
              name="MA" 
              stroke="#9b59b6" 
              strokeWidth={1.5} 
              dot={false} 
              strokeDasharray="3 3"
            />
            <Line 
              type="monotone" 
              dataKey="EMA" 
              name="EMA" 
              stroke="#e74c3c" 
              strokeWidth={1.5} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 设置模态框 */}
      <Modal 
        title="自定义移动平均线" 
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
                  移动平均线类型
                </label>
                <Select
                  value={tempType}
                  onChange={(value) => setTempType(value as 'EMA' | 'MA')}
                  className="w-full"
                >
                  <Option value="EMA">指数移动平均线 (EMA)</Option>
                  <Option value="MA">简单移动平均线 (MA)</Option>
                </Select>
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  周期设置
                </label>
                <InputNumber
                  value={tempPeriod}
                  onChange={value => value && setTempPeriod(value)}
                  min={5}
                  max={200}
                  className="w-full"
                />
              </div>
            </Col>
          </Row>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">移动平均线类型说明</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium">EMA (指数移动平均线)</span>: 给予近期价格更高权重，对价格变化更敏感。</p>
              <p><span className="font-medium">MA (简单移动平均线)</span>: 所有价格权重相同，提供更平滑的趋势线。</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">常用周期参考</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium">短期</div>
                <div>5, 9, 12, 20</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">中期</div>
                <div>20, 50, 60</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-medium">长期</div>
                <div>100, 150, 200</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default EMAMACard;