# 迁移指南：从 Go 后端 + React 前端到 Next.js 全栈

## 迁移步骤

### 第一阶段：项目初始化
1. **创建新的 Next.js 项目**
   ```bash
   npx create-next-app@latest nextjs-chatroom --typescript --tailwind --eslint --app
   cd nextjs-chatroom
   ```

2. **安装依赖**
   ```bash
   npm install pg bcrypt jsonwebtoken @prisma/client @tanstack/react-query zustand
   npm install -D @types/pg @types/bcrypt @types/jsonwebtoken prisma tsx
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   # 编辑 .env.local 填入数据库配置
   ```

### 第二阶段：数据库迁移
1. **初始化 Prisma**
   ```bash
   npx prisma init
   ```

2. **创建数据库模式**
   - 复制 `config-examples.ts` 中的 Prisma schema
   - 运行迁移：`npx prisma db push`

3. **数据迁移**
   - 如果有现有数据，编写迁移脚本
   - 运行种子：`npm run db:seed`

### 第三阶段：API 路由实现
1. **创建 API 路由结构**
   ```
   src/app/api/
   ├── auth/
   │   ├── login/route.ts
   │   ├── register/route.ts
   │   └── logout/route.ts
   ├── rooms/
   │   ├── route.ts
   │   └── [id]/
   │       ├── route.ts
   │       └── messages/route.ts
   └── comments/
       └── route.ts
   ```

2. **实现数据库查询函数**
   - 参考 `database-examples.ts`
   - 替换 Go 的 SQL 查询逻辑

3. **实现认证中间件**
   - 参考 `auth-examples.ts`
   - 配置 JWT 认证

### 第四阶段：前端组件重构
1. **组件架构重新设计**
   ```
   src/components/
   ├── ui/          # 基础组件
   ├── chat/        # 聊天功能组件
   ├── auth/        # 认证组件
   └── layout/      # 布局组件
   ```

2. **状态管理实现**
   - 使用 React Query 管理服务器状态
   - 使用 Zustand 管理客户端状态

3. **路由结构优化**
   ```
   src/app/
   ├── (auth)/
   │   ├── login/
   │   └── register/
   └── (dashboard)/
       └── chat/
   ```

### 第五阶段：功能测试与优化
1. **功能测试**
   - 用户注册/登录
   - 聊天室创建/管理
   - 消息发送/接收
   - 评论系统

2. **性能优化**
   - 实现分页加载
   - 添加缓存策略
   - 优化数据库查询

## 功能对比

### 当前架构 vs 新架构

| 功能 | 当前实现 | 新架构实现 |
|------|----------|------------|
| 用户认证 | Go + Gin + JWT | Next.js API Routes + JWT |
| 数据库操作 | 直接 SQL 查询 | Prisma ORM |
| 前端路由 | React Router | Next.js App Router |
| 状态管理 | useState/useEffect | React Query + Zustand |
| 样式 | CSS Modules | Tailwind CSS |
| 类型安全 | 前后端分离 | 全栈 TypeScript |

### API 端点映射

| Go 端点 | 新的 Next.js 端点 |
|---------|-------------------|
| `POST /register` | `POST /api/auth/register` |
| `POST /login` | `POST /api/auth/login` |
| `GET /room/list` | `GET /api/rooms` |
| `POST /room/add` | `POST /api/rooms` |
| `POST /room/delete` | `DELETE /api/rooms/[id]` |
| `PUT /room/rename` | `PUT /api/rooms/[id]` |
| `GET /room/message/list` | `GET /api/rooms/[id]/messages` |
| `POST /room/message/add` | `POST /api/rooms/[id]/messages` |
| `GET /comment/get` | `GET /api/comments` |
| `POST /comment/add` | `POST /api/comments` |
| `POST /comment/delete` | `DELETE /api/comments/[id]` |

## 最佳实践

### 1. 类型安全
```typescript
// 共享类型定义
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data?: T;
}

// API 客户端
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  
  return response.json();
}
```

### 2. 错误处理
```typescript
// 统一错误处理
export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public data?: any
  ) {
    super(message);
  }
}

// API 路由错误处理
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { code: error.code, msg: error.message, data: error.data },
      { status: error.code }
    );
  }
  
  console.error('Unexpected error:', error);
  return NextResponse.json(
    { code: 500, msg: '服务器内部错误' },
    { status: 500 }
  );
}
```

### 3. 数据验证
```typescript
import { z } from 'zod';

// 验证模式
export const LoginSchema = z.object({
  username: z.string().min(1, '用户名不能为空'),
  password: z.string().min(6, '密码至少6个字符'),
});

// API 路由中使用
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = LoginSchema.parse(body);
    
    // 处理登录逻辑
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { code: 400, msg: error.errors[0].message },
        { status: 400 }
      );
    }
    
    return handleApiError(error);
  }
}
```

### 4. 性能优化
```typescript
// React Query 配置
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟
      retry: 3,
    },
  },
});

// 自定义 Hook
export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: () => apiRequest<Room[]>('/api/rooms'),
    refetchInterval: 30000, // 30 秒自动刷新
  });
}
```

## 部署配置

### Vercel 部署
```json
{
  "build": {
    "env": {
      "DATABASE_URL": "@database_url",
      "JWT_SECRET": "@jwt_secret"
    }
  }
}
```

### Docker 部署
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

这个迁移指南提供了从当前架构到 Next.js 全栈架构的完整路径，确保功能的平滑迁移和性能提升。