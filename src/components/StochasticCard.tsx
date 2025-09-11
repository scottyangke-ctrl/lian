'use client';
// components/StochasticCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, InputNumber, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StochasticCardProps {
  closes: number[];
  defaultKPeriod?: number;
  defaultDPeriod?: number;
  onSettingsChange?: (kPeriod: number, dPeriod: number) => void;
}

const StochasticCard: React.FC<StochasticCardProps> = ({ 
  closes, 
  defaultKPeriod = 14,
  defaultDPeriod = 3,
  onSettingsChange
}) => {
  const [kPeriod, setKPeriod] = useState<number>(defaultKPeriod);
  const [dPeriod, setDPeriod] = useState<number>(defaultDPeriod);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempKPeriod, setTempKPeriod] = useState<number>(defaultKPeriod);
  const [tempDPeriod, setTempDPeriod] = useState<number>(defaultDPeriod);
  const [kValues, setKValues] = useState<number[]>([]);
  const [dValues, setDValues] = useState<number[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [currentK, setCurrentK] = useState<number>(0);
  const [currentD, setCurrentD] = useState<number>(0);

  // 计算随机指标
  useEffect(() => {
    if (closes.length < kPeriod + dPeriod) return;
    
    // 计算%K
    const kValues: number[] = [];
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const periodCloses = closes.slice(i - kPeriod + 1, i + 1);
      const high = Math.max(...periodCloses);
      const low = Math.min(...periodCloses);
      
      if (high - low === 0) {
        kValues.push(50);
      } else {
        const k = 100 * (closes[i] - low) / (high - low);
        kValues.push(k);
      }
    }
    
    // 计算%D（%K的简单移动平均）
    const dValues: number[] = [];
    for (let i = dPeriod - 1; i < kValues.length; i++) {
      const periodK = kValues.slice(i - dPeriod + 1, i + 1);
      const d = periodK.reduce((sum, val) => sum + val, 0) / dPeriod;
      dValues.push(d);
    }
    
    setKValues(kValues);
    setDValues(dValues);
    
    if (kValues.length > 0 && dValues.length > 0) {
      setCurrentK(kValues[kValues.length - 1]);
      setCurrentD(dValues[dValues.length - 1]);
    }
    
    // 准备图表数据
    const chartData = [];
    const startIndex = Math.max(0, dValues.length - 20);
    
    for (let i = startIndex; i < dValues.length; i++) {
      const kIndex = i + (kValues.length - dValues.length);
      
      chartData.push({
        index: i,
        K: kValues[kIndex] || 50,
        D: dValues[i] || 50
      });
    }
    
    setChartData(chartData);
  }, [closes, kPeriod, dPeriod]);

  // 确定随机指标状态
  const getStochasticStatus = () => {
    if (currentK > 80 && currentD > 80) return '超买';
    if (currentK < 20 && currentD < 20) return '超卖';
    if (currentK > currentD) return '金叉';
    if (currentK < currentD) return '死叉';
    return '中性';
  };

  // 获取状态颜色
  const getStatusColor = () => {
    const status = getStochasticStatus();
    if (status === '超买') return 'text-red-600';
    if (status === '超卖') return 'text-green-600';
    if (status === '金叉') return 'text-blue-600';
    if (status === '死叉') return 'text-yellow-600';
    return 'text-gray-600';
  };

  // 处理设置确认
  const handleOk = () => {
    // 验证输入
    if (tempKPeriod < 5 || tempKPeriod > 50) {
      return;
    }
    
    if (tempDPeriod < 1 || tempDPeriod > 10) {
      return;
    }
    
    setKPeriod(tempKPeriod);
    setDPeriod(tempDPeriod);
    
    if (onSettingsChange) {
      onSettingsChange(tempKPeriod, tempDPeriod);
    }
    
    setIsModalVisible(false);
  };

  return (
    <Card 
      title={`随机指标(%K/%D)`} 
      className="rounded-lg shadow-sm"
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => {
            setTempKPeriod(kPeriod);
            setTempDPeriod(dPeriod);
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
              <div className="text-sm text-gray-600">%K值</div>
              <div className={`text-xl font-bold ${
                currentK > 80 ? 'text-red-600' : 
                currentK < 20 ? 'text-green-600' : 'text-blue-600'
              }`}>
                {currentK.toFixed(2)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">%D值</div>
              <div className={`text-xl font-bold ${
                currentD > 80 ? 'text-red-600' : 
                currentD < 20 ? 'text-green-600' : 'text-blue-600'
              }`}>
                {currentD.toFixed(2)}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">状态</div>
              <div className={`text-lg font-bold ${getStatusColor()}`}>
                {getStochasticStatus()}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 随机指标图表 */}
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
              dataKey="K" 
              name="%K" 
              stroke="#3498db" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="D" 
              name="%D" 
              stroke="#e74c3c" 
              strokeWidth={2} 
              dot={false} 
            />
            <Line 
              type="monotone" 
              dataKey="80" 
              name="超买线" 
              stroke="#e74c3c" 
              strokeWidth={1} 
              dot={false} 
              strokeDasharray="3 3"
            />
            <Line 
              type="monotone" 
              dataKey="20" 
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
        title="自定义随机指标参数" 
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
                  %K周期
                </label>
                <InputNumber
                  value={tempKPeriod}
                  onChange={value => value && setTempKPeriod(value)}
                  min={5}
                  max={50}
                  className="w-full"
                />
              </div>
            </Col>
            <Col span={12}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  %D周期
                </label>
                <InputNumber
                  value={tempDPeriod}
                  onChange={value => value && setTempDPeriod(value)}
                  min={1}
                  max={10}
                  className="w-full"
                />
              </div>
            </Col>
          </Row>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">随机指标说明</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><span className="font-medium">随机指标</span> 比较特定时期的收盘价与价格范围，以确定超买或超卖情况。</p>
              <p>它由两条线组成：%K（快速线）和%D（慢速线）。</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">交易信号</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">买入信号</div>
                <ul className="list-disc pl-5">
                  <li>%K和%D低于20（超卖）</li>
                  <li>%K上穿%D（金叉）</li>
                  <li>底部背离</li>
                </ul>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="font-medium">卖出信号</div>
                <ul className="list-disc pl-5">
                  <li>%K和%D高于80（超买）</li>
                  <li>%K下穿%D（死叉）</li>
                  <li>顶部背离</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">常用参数组合</h4>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-blue-50 p-2 rounded">
                <div className="font-medium">经典组合</div>
                <div>14, 3</div>
              </div>
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">短线组合</div>
                <div>5, 3</div>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <div className="font-medium">长线组合</div>
                <div>21, 5</div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default StochasticCard;