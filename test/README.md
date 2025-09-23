# 测试文件说明

这个文件夹包含了项目的各种测试文件：

## API测试
- `test-api.js` - 测试API响应格式
- `test-auth.js` - 测试认证相关API（已废弃）

## 数据库测试
- `test-db.js` - 测试数据库连接和操作
- `test-db-connection.js` - 测试数据库连接

## 用户创建脚本
- `create-default-user.js` - 创建默认用户（使用.env中的凭据）
- `create-test-user.js` - 创建测试用户
- `test-create-user.js` - 测试用户创建功能

## 使用方法

运行测试文件：
```bash
node test/test-api.js
node test/test-db.js
# 等等
```

注意：这些测试文件可能需要根据当前项目状态进行更新。
