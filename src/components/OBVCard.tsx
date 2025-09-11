// components/OBVCard.tsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, InputNumber, Row, Col } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';

interface OBVCardProps {
  closes: number[];
  volumes: number[];
  onSettingsChange?: () => void;
}

const OBVCard: React.FC<OBVCardProps> = ({ 
  closes, 
  volumes,
  onSettingsChange
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [obvValues, setObvValues] = useState<number[]>([]);
  const [currentObv, setCurrentObv] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);
  const [obvTrend, setObvTrend] = useState<'上升' | '下降' | '平稳'>('平稳');

  // 计算OBV
  useEffect(() => {
    if (closes.length < 2 || volumes.length < 2) return;
    
    let obv = volumes[0];
    const obvValues: number[] = [obv];
    const chartData: any[] = [];
    
    for (let i = 1; i < closes.length; i++) {
      if (closes[i] > closes[i - 1]) {
        obv += volumes[i];
      } else if (closes[i] < closes[i - 1]) {
        obv -= volumes[i];
      }
      obvValues.push(obv);
      
      // 准备图表数据
      if (i >= closes.length - 20) {
        chartData.push({
          index: i,
          OBV: obv,
          Volume: volumes[i]
        });
      }
    }
    
    setObvValues(obvValues);
    setChartData(chartData);
    
    if (obvValues.length > 0) {
      setCurrentObv(obvValues[obvValues.length - 1]);
      
      // 确定趋势
      if (obvValues.length > 5) {
        const last5 = obvValues.slice(-5);
        const trend = last5[last5.length - 1] - last5[0];
        setObvTrend(trend > 0 ? '上升' : trend < 0 ? '下降' : '平稳');
      }
    }
  }, [closes, volumes]);

  // 获取趋势颜色
  const getTrendColor = () => {
    return obvTrend === '上升' ? 'text-green-600' : 
           obvTrend === '下降' ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <Card 
      title="能量潮指标 (OBV)" 
      className="rounded-lg shadow-sm"
      extra={
        <Button 
          type="link" 
          size="small" 
          onClick={() => setIsModalVisible(true)}
        >
          说明
        </Button>
      }
    >
      <div className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">当前OBV</div>
              <div className="text-2xl font-bold text-blue-600">
                {currentObv.toLocaleString()}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">趋势</div>
              <div className={`text-lg font-bold ${getTrendColor()}`}>
                {obvTrend}
              </div>
            </div>
          </Col>
          <Col span={8}>
            <div className="text-center">
              <div className="text-sm text-gray-600">信号</div>
              <div className="text-lg font-bold">
                {obvTrend === '上升' ? '买入' : obvTrend === '下降' ? '卖出' : '观望'}
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* OBV图表 */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="index" hide />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="OBV" 
              name="OBV" 
              stroke="#3498db" 
              strokeWidth={2} 
              dot={false} 
            />
            <Bar 
              yAxisId="right"
              dataKey="Volume" 
              name="成交量" 
              fill="#2ecc71" 
              barSize={4} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 说明模态框 */}
      <Modal 
        title="能量潮指标 (OBV) 说明" 
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-4 py-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">OBV指标原理</h4>
            <div className="text-sm text-gray-600">
              <p>OBV（On-Balance Volume）通过将成交量与价格变动联系起来衡量买卖压力。</p>
              <p>当价格上涨时，成交量被加到OBV；当价格下跌时，成交量从OBV中减去。</p>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">交易信号</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-green-50 p-2 rounded">
                <div className="font-medium">买入信号</div>
                <ul className="list-disc pl-5">
                  <li>OBV上升而价格持平或下跌（看涨背离）</li>
                  <li>OBV突破关键阻力位</li>
                  <li>OBV持续上升</li>
                </ul>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <div className="font-medium">卖出信号</div>
                <ul className="list-disc pl-5">
                  <li>OBV下降而价格上涨（看跌背离）</li>
                  <li>OBV跌破关键支撑位</li>
                  <li>OBV持续下降</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">使用技巧</h4>
            <div className="text-sm text-gray-600">
              <ul className="list-disc pl-5 space-y-1">
                <li>OBV确认价格趋势：当OBV与价格同向移动时，确认当前趋势</li>
                <li>OBV背离：当OBV与价格走势背离时，可能预示趋势反转</li>
                <li>OBV突破：当OBV突破关键水平时，可能预示价格突破</li>
              </ul>
            </div>
          </div>
        </div>
      </Modal>
    </Card>
  );
};

export default OBVCard;