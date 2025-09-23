'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Card,
  Collapse,
  Row,
  Col,
  Descriptions,
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import type { StrategyLog } from '../api/strategy-log/types';
import { apiClient } from '@/lib/api-client';

const { Option } = Select;
const { Panel } = Collapse;

export default function StrategyLogPage() {
  const [logs, setLogs] = useState<StrategyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState<StrategyLog | null>(null);
  const [filters, setFilters] = useState<Partial<StrategyLog>>({});

  const [searchForm] = Form.useForm();

  async function fetchLogs() {
    setIsLoading(true);
    try {
      const response = await apiClient.get<StrategyLog[]>('/strategy-log');

      if (!response.success) {
        throw new Error(response.message || response.error || 'Failed to fetch logs');
      }

      setLogs(response.data || []);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const strategyIdMatch = filters.strategy_id ? log.strategy_id === filters.strategy_id : true;
      const actionMatch = filters.action ? log.action.toLowerCase().includes(filters.action.toLowerCase()) : true;
      const messageMatch = filters.message ? log.message?.toLowerCase().includes(filters.message.toLowerCase()) : true;
      return strategyIdMatch && actionMatch && messageMatch;
    });
  }, [logs, filters]);

  const handleSearch = (values: Partial<StrategyLog>) => {
    setFilters(values);
  };

  const handleResetSearch = () => {
    searchForm.resetFields();
    setFilters({});
  };

  const showDetailModal = (log: StrategyLog) => {
    setSelectedLog(log);
    setIsDetailModalVisible(true);
  };

  const handleDetailModalCancel = () => {
    setIsDetailModalVisible(false);
    setSelectedLog(null);
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/strategy-log?id=${id}`, { method: 'DELETE' });
      const response = await res.json();

      if (!response.success) {
        throw new Error(response.message || response.error || 'Failed to delete log');
      }

      message.success(response.message || 'Log deleted successfully!');
      fetchLogs();
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'execute':
        return 'blue';
      case 'error':
        return 'red';
      case 'start':
        return 'green';
      case 'stop':
        return 'orange';
      default:
        return 'default';
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a: StrategyLog, b: StrategyLog) => (a.id ?? 0) - (b.id ?? 0) },
    { title: 'Strategy ID', dataIndex: 'strategy_id', key: 'strategy_id', sorter: (a: StrategyLog, b: StrategyLog) => a.strategy_id - b.strategy_id },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleString(),
      sorter: (a: StrategyLog, b: StrategyLog) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime(),
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => (
        <Tag color={getActionColor(action)}>{action.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: 'Action',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: any, record: StrategyLog) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
            size="small"
          >
            View
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this log?"
            onConfirm={() => handleDelete(record.id!)}
          >
            <Button type="link" danger size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const SearchForm = (
    <Form form={searchForm} onFinish={handleSearch}>
      <Row gutter={24}>
        <Col span={8}>
          <Form.Item name="strategy_id" label="Strategy ID">
            <Input placeholder="Enter strategy ID" allowClear />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="action" label="Action">
            <Input placeholder="Enter action" allowClear />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="message" label="Message">
            <Input placeholder="Enter message keyword" allowClear />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24} style={{ textAlign: 'right' }}>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              Search
            </Button>
            <Button onClick={handleResetSearch}>
              Reset
            </Button>
          </Space>
        </Col>
      </Row>
    </Form>
  );

  return (
    <div className="p-8">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Strategy Log Management</h1>
          <Button type="primary" onClick={fetchLogs}>
            Refresh
          </Button>
        </div>

        <Collapse className="mb-6 bg-white">
          <Panel header="Filter Logs" key="1">
            {SearchForm}
          </Panel>
        </Collapse>

        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />

        <Modal
          title="Log Details"
          open={isDetailModalVisible}
          onCancel={handleDetailModalCancel}
          footer={[
            <Button key="close" onClick={handleDetailModalCancel}>
              Close
            </Button>,
          ]}
          width={800}
        >
          {selectedLog && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="Strategy ID">{selectedLog.strategy_id}</Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Action">
                <Tag color={getActionColor(selectedLog.action)}>{selectedLog.action.toUpperCase()}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Message">{selectedLog.message || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Details">
                <pre className="whitespace-pre-wrap">
                  {selectedLog.details ? JSON.stringify(selectedLog.details, null, 2) : 'N/A'}
                </pre>
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Card>
    </div>
  );
}
