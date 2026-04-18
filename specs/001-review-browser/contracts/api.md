# API Contract: 酒店评论浏览系统

## 接口概述

基于 Insforge 的 RESTful API，通过 Next.js API Routes 代理或直接调用 Insforge 客户端。

## 接口列表

### GET /api/comments

获取评论列表，支持筛选、搜索、分页。

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| pageSize | integer | 否 | 每页条数，默认 20，最大 100 |
| scoreMin | number | 否 | 最低评分 |
| scoreMax | number | 否 | 最高评分 |
| star | integer | 否 | 整数评分 (1-5) |
| roomType | string | 否 | 房型筛选 |
| travelType | string | 否 | 出行类型筛选 |
| category | string | 否 | 分类标签筛选（匹配 category1/2/3 任一） |
| search | string | 否 | 关键词搜索（匹配评论文本） |
| sortBy | string | 否 | 排序字段，默认 publish_date |
| sortOrder | string | 否 | asc/desc，默认 desc |

**响应示例**:

```json
{
  "data": [
    {
      "id": "uuid",
      "_id": "68027895e3c98b0941765706",
      "comment": "房间非常好...",
      "images": [
        "https://dimg04.c-ctrip.com/images/0230y12000jkw8gdf4A0A_R_150_150_R5_Q70_D.jpg"
      ],
      "score": 5.0,
      "star": 5,
      "publish_date": "2025-04-05",
      "room_type": "豪华大床房",
      "travel_type": "家庭亲子",
      "categories": ["卫生情况", "房间设施", "前台服务"],
      "category1": "卫生情况",
      "category2": "房间设施",
      "category3": "前台服务",
      "comment_len": 320,
      "useful_count": 0,
      "review_count": 7,
      "quality_score": 9
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 2542,
    "totalPages": 128
  }
}
```

### GET /api/comments/stats

获取评论统计数据。

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| roomType | string | 否 | 房型筛选 |
| travelType | string | 否 | 出行类型筛选 |
| category | string | 否 | 分类标签筛选 |
| search | string | 否 | 关键词搜索 |

**响应示例**:

```json
{
  "totalCount": 2542,
  "averageScore": 4.77,
  "averageStar": 4.5,
  "starDistribution": {
    "1": 12,
    "2": 28,
    "3": 156,
    "4": 892,
    "5": 1454
  },
  "roomTypeDistribution": {
    "花园大床房": 879,
    "花园双床房": 836
  },
  "travelTypeDistribution": {
    "家庭亲子": 1353,
    "商务出行": 415
  }
}
```

### GET /api/comments/filters

获取筛选选项列表（房型、出行类型、分类标签等）。

**响应示例**:

```json
{
  "roomTypes": ["花园大床房", "花园双床房", "豪华大床房"],
  "travelTypes": ["家庭亲子", "商务出行", "情侣出游"],
  "categories": {
    "设施类": ["房间设施", "公共设施", "餐饮设施"],
    "服务类": ["前台服务", "客房服务", "退房/入住效率"],
    "位置类": ["交通便利性", "周边配套", "景观/朝向"],
    "价格类": ["性价比", "价格合理性"],
    "体验类": ["整体满意度", "安静程度", "卫生状况"]
  },
  "scoreRange": { "min": 0.5, "max": 5.0 }
}
```
