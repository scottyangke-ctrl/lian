'use client';
// components/EMAComparisonCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, InputNumber, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EMAComparisonCardProps {
  closes: number[];
  defaultPeriod1?: number;
  defaultPeriod2?: number;
  onSettingsChange?: (period1: number, period2: number) => void;
}

const EMAComparisonCard: React.FC<EMAComparisonCardProps> = ({ 
  closes, 
  defaultPeriod1 = 12,
  defaultPeriod2 = 26,
  onSettingsChange
}) => {
  const [period1, setPeriod1] = useState<number>(defaultPeriod1);
  const [period2, setPeriod2] = useState<number>(defaultPeriod2);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempPeriod1, setTempPeriod1] = useState<number>(defaultPeriod1);
  const [tempPeriod2, setTempPeriod2] = useState<number>(defaultPeriod2);
  const [ema1Value, setEma1Value] = useState<number>(0);
  const [ema2Value, setEma2Value] = useState<number>(0);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);

  // 计算EMA函数
  const calculateEMA = (data: number[], period: number): number => {
    if (data.length < period) return data[data.length - 1] || 0;
    
    const multiplier = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      ema = (data[i] - ema) * multiplier + ema;
    }
    
    return ema;
  };

  // 计算EMA和准备图表数据
  useEffect(() => {
    if (closes.length < Math.max(period1, period2)) return;
    
    const ema1 = calculateEMA(closes, period1);
    const ema2 = calculateEMA(closes, period2);
    setEma1Value(ema1);
    setEma2Value(ema2);
    setCurrentPrice(closes[closes.length - 1]);
    
    // 准备图表数据
    const chartData = [];
    const startIndex = Math.max(0, closes.length - 20);
    
    for (let i = startIndex; i < closes.length; i++) {
      const ema1Val = calculateEMA(closes.slice(0, i + 1), period1);
      const ema2Val = calculateEMA(closes.slice(0, i + 1), period2);
      
      chartData.push({
        index: i,
        price: closes[i],
        [`EMA${period1}`]: ema1Val,
        [`EMA${period2}`]: ema2Val
      });
    }
    
    setChartData(chartData);
  }, [closes, period1, period2]);

  // 确定EMA关系
  const getEMARelation = () => {
    if (ema1Value > ema2Value) return '多头排列';
    if (ema1Value < ema2Value) return '空头排列';
    return '交叉点';
  };

  // 获取关系颜色
  const getRelationColor = () => {
    const relation = getEMARelation();
    return relation === '多头排列' ? 'text-green-600' : 
           relation === '空头排列' ? 'text-red-600' : 'text-gray-600';
  };

  // 处理设置确认
  const handleOk = () => {
    // 验证输入
    if (tempPeriod1 < 5 || tempPeriod1 > 200 || tempPeriod2 < 5 || tempPeriod2 > 200) {
      return;
    }
    
    setPeriod1(tempPeriod1);
    setPeriod2(tempPeriod2);
    
    if (onSettingsChange) {
      onSettingsChange(tempPeriod1, tempPeriod2);
    }
    
    setIsModalVisible(false);
  };

  return (
    <Card 
      title={`EMA${period1}/${period2}对比`} 
      className="rounded-lg shadow-sm"
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => {
            setTempPeriod1(period1);
            setTempPeriod2(period2);
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
              <div className="text-sm text-gray-600">EMA{period1}</div>
              <div className="text-xl font-bold text-blue-600">
                {ema1Value.toFixed(2)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">EMA{period2}</div>
              <div className="text-xl font-bold text-purple-600">
                {ema2Value.toFixed(2)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">当前价格</div>
              <div className="text-xl font-bold text-gray-800">
                {currentPrice.toFixed(2)}
              </div>
            </div>
          </Col>
        </Row>
        
        <div className="mt-3 text-center">
          <div className="text-sm text-gray-600">排列状态</div>
          <div className={`text-lg font-bold ${getRelationColor()}`}>
            {getEMARelation()}
          </div>
        </div>
      </div>

      {/* 对比图表 */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="index" hide />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
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
              dataKey={`EMA${period1}`} 
              name={`EMA${period1}`} 
              stroke="#e74c3c" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey={`EMA${period2}`} 
              name={`EMA${period2}`} 
              stroke="#2ecc71" 
              strokeWidth={2} 
              dot={false} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 设置模态框 */}
      <Modal 
        title="自定义EMA周期对比" 
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
                  短期EMA周期
                </label>
                <InputNumber
                  value={tempPeriod1}
                  onChange={value => value && setTempPeriod1(value)}
                  min={5}
                  max={200}
                  className="w-full"
                />
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  长期EMA周期
                </label>
                <InputNumber
                  value={tempPeriod2}
                  onChange={value => value && setTempPeriod2(value)}
                  min={5}
                  max={200}
                  className="w-full"
                />
              </div>
            </Col>
          </Row>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">EMA对比说明</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium">EMA周期对比</span> 通过比较两个不同周期的指数移动平均线来分析趋势。</p>
              <p>当短期EMA上穿长期EMA时，可能形成金叉，是买入信号；当短期EMA下穿长期EMA时，可能形成死叉，是卖出信号。</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">常用组合</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium">经典组合</div>
                <div>12/26</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">短线组合</div>
                <div>5/20</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-medium">长线组合</div>
                <div>50/200</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default EMAComparisonCard;