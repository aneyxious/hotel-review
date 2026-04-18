# Implementation Plan: 酒店评论浏览网页

**Branch**: `001-review-browser` | **Date**: 2026-04-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-review-browser/spec.md`

## Summary

基于花园酒店住客评论数据集（enriched_comments.csv，2542 条记录），构建一个现代化的评论浏览网页应用。前端采用 Next.js + Tailwind CSS，后端采用 Insforge（PostgreSQL），实现评论列表展示、多维度筛选、关键词搜索、图片查看、统计汇总等功能。

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 14 (App Router)  
**Primary Dependencies**: React 18, Tailwind CSS, @insforge/sdk, lucide-react  
**Storage**: Insforge PostgreSQL（comments 表）  
**Testing**: Jest + React Testing Library（测试可选，按宪章要求核心模块覆盖 ≥80%）  
**Target Platform**: Web 浏览器（桌面端 + 移动端响应式）  
**Project Type**: web-service（前后端一体，Next.js Full Stack）  
**Performance Goals**: 首屏加载 < 2s，搜索响应 < 500ms，支持 2542 条记录流畅渲染  
**Constraints**: 静态 CSV 数据源无需实时更新；图片为外部 URL  
**Scale/Scope**: 2542 条评论记录，单表查询，无复杂关联

## Constitution Check

- ✅ **代码质量**: Next.js + TypeScript 提供静态类型检查；Tailwind 确保样式一致性
- ✅ **测试标准**: 核心筛选逻辑和 API 接口需配备单元测试；组件交互需配备集成测试
- ✅ **用户体验一致性**: 统一设计系统（Tailwind 配色 + shadcn/ui 组件风格）；筛选器布局统一
- ✅ **性能需求**: 服务端分页避免大数据量渲染；数据库索引覆盖所有筛选字段
- ✅ **文档与可维护性**: 全部文档中文书写；API 契约和数据模型已文档化

## Project Structure

### Documentation (this feature)

```text
specs/001-review-browser/
├── plan.md              # 本文件
├── spec.md              # 功能规范
├── data-model.md        # 数据模型设计
├── quickstart.md        # 快速开始指南
├── contracts/
│   └── api.md           # API 契约
└── checklists/
    └── requirements.md  # 规范质量检查清单
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── comments/
│   │   │   ├── route.ts          # GET /api/comments
│   │   │   └── stats/
│   │   │       └── route.ts      # GET /api/comments/stats
│   │   └── filters/
│   │       └── route.ts          # GET /api/filters
│   ├── page.tsx                  # 主页面
│   └── layout.tsx                # 根布局
├── components/
│   ├── ui/                       # 基础 UI 组件（Button, Input, Badge 等）
│   ├── CommentCard.tsx           # 评论卡片
│   ├── CommentList.tsx           # 评论列表（含分页）
│   ├── FilterPanel.tsx           # 筛选面板
│   ├── ImageViewer.tsx           # 图片查看器（Lightbox）
│   ├── SearchBar.tsx             # 搜索栏
│   ├── StatsPanel.tsx            # 统计面板
│   └── CategoryFilter.tsx        # 分类筛选（按大类/小类）
├── hooks/
│   └── useComments.ts            # 评论数据获取 Hook
├── lib/
│   ├── insforge.ts               # Insforge 客户端
│   └── utils.ts                  # 工具函数
├── types/
│   └── comment.ts                # TypeScript 类型定义
└── scripts/
    └── import-data.ts            # 数据导入脚本
```

## Data Flow Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js App   │────▶│  Next.js API    │────▶│  Insforge DB    │
│   (Frontend)    │◄────│   Routes        │◄────│  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │
        ▼
┌─────────────────┐
│  筛选/搜索条件   │
│  (URL Query)    │
└─────────────────┘
```

- 前端通过 Next.js API Routes 与 Insforge 交互
- 筛选和搜索条件通过 URL Query Parameters 传递，支持分享和刷新保持状态
- 分页采用服务端分页，每页默认 20 条

## Key Design Decisions

### 1. 筛选条件 URL 化

所有筛选条件（评分、房型、出行类型、分类、搜索词）均编码到 URL Query 中，实现：
- 筛选结果可分享（复制链接即可）
- 浏览器前进/后退可保持状态
- 刷新页面不丢失筛选条件

### 2. 分类筛选设计

分类采用两级结构：
- 大类（设施类、服务类、位置类、价格类、体验类）
- 小类（具体标签，如 "卫生状况"、"前台服务"）

UI 展示时按大类分组，用户可选择小类进行筛选。数据库存储层面使用 category1/2/3 三个字段便于 SQL 查询。

### 3. 图片查看器

采用 Lightbox 模式：
- 列表中显示缩略图网格（最多显示前 4 张，超出显示 +N 标识）
- 点击缩略图打开全屏查看器，支持左右切换和关闭
- 图片懒加载优化性能

### 4. 统计面板

统计面板始终显示当前筛选条件下的汇总数据：
- 评论总数
- 平均评分
- 评分分布（1-5 星柱状图）
- 各房型/出行类型占比（Top 5）

## Complexity Tracking

> 无宪章违规，复杂度合理。

| 决策 | 说明 |
|------|------|
| 单表设计 | comments 表无关联表，查询简单直接 |
| 服务端分页 | 2542 条记录无需复杂分页策略 |
| URL 状态管理 | 用 Next.js useSearchParams 实现，无需额外状态管理库 |

## Phase 划分

### Phase 1: 基础设施（Setup）
- T001: 初始化 Next.js 项目（含 Tailwind）
- T002: 安装依赖（@insforge/sdk, lucide-react）
- T003: 配置 Insforge 客户端和环境变量

### Phase 2: 数据库基础（Foundational）
- T004: 创建 comments 表（含索引和 RLS）
- T005: 编写并执行数据导入脚本（CSV → Insforge）
- T006: 验证数据导入完整性（2542 条记录）

### Phase 3: API 层（Foundational）
- T007: 实现 GET /api/comments（筛选 + 分页）
- T008: 实现 GET /api/comments/stats（统计）
- T009: 实现 GET /api/filters（筛选选项）

### Phase 4: 前端核心（User Story 1 + 2）
- T010: 创建基础 UI 组件（Button, Input, Badge, Select）
- T011: 实现 CommentCard 组件
- T012: 实现 CommentList + 分页组件
- T013: 实现 FilterPanel（评分/房型/出行类型/分类）
- T014: 实现 SearchBar 组件
- T015: 实现主页面布局和状态管理（URL Query）

### Phase 5: 高级功能（User Story 3 + 4）
- T016: 实现 ImageViewer（Lightbox）
- T017: 实现 StatsPanel（统计面板）
- T018: 实现响应式布局优化（移动端适配）

### Phase 6: 测试与优化
- T019: 编写 API 路由单元测试
- T020: 编写组件集成测试
- T021: 性能优化（图片懒加载、数据缓存）
- T022: 端到端测试（关键用户流程）
