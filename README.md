[<img src="https://img-hxy021.didistatic.com/static/starimg/img/j8lBA6yy201698840712358.jpg"  width="300" />](https://xiaojusurvey.didi.cn)

**XiaoJuSurvey**是一套轻量、安全的问卷系统，提供面向个人和企业的一站式产品级解决方案，快速满足各类线上调研场景。

## 简介
平台在集团内部已沉淀了**40+**种题型，累积精选模板**100+**，适用于市场调研、客户满意度调研、在线考试、投票、报道、测评等众多场景。数据能力上，沉淀了数据表格、分题统计、交叉分析、多渠道分析等在线报表能力，快速满足回收数据专业化线上分析，协助业务挖掘数据价值。

本次开源主要围绕问卷生命周期提供了完整的产品化能力：

- 问卷管理：创、编、投、收、数据分析

- 多样化题型：单行输入框、多行输入框、单项选择、多项选择、判断题、评分、投票
  _(更多题型将陆续开放，也欢迎您参与共建提交自定义题型)_

- 用户管理：登录、注册、权限管理

- 数据安全：传输加密、脱敏等

<img src="https://img-hxy021.didistatic.com/static/starimg/img/nJ5fyGhocH1698903177499.png"  width="900" />

_**(个人和企业用户均可快速构建特定领域的调研类解决方案。)**_

## 项目优势
**一、具备全面的综合性和专业性**

- [制定了问卷标准化协议规范](https://xiaojusurvey.didi.cn/docs/agreement/%E3%80%8A%E9%97%AE%E5%8D%B7Meta%E5%8D%8F%E8%AE%AE%E3%80%8B)

  领域标准保障概念互通，是全系统的基础和核心。基于实际业务经验，沉淀了两大类：
  - 业务描述：问卷协议、题型协议
  - 物料描述：题型物料协议，包含题型和设置器 

- [制定了问卷UI/UX规范](https://xiaojusurvey.didi.cn/docs/design/%E3%80%8A%E8%AE%BE%E8%AE%A1%E8%A7%84%E8%8C%83%E3%80%8B)

  设计语言是系统灵活性、一致性的基石，保障系统支撑的实际业务运转拥有极高的用户体验。包含两部分：
  - 设计规范：灵活、降噪、统一
  - 交互规范：遵循用户行为特征，遵循产品定位，遵循成熟的用户习惯

- [所见即所得，搭建渲染一致性高](https://xiaojusurvey.didi.cn/docs/document/%E8%AE%BE%E8%AE%A1%E5%8E%9F%E7%90%86/%E9%A2%98%E5%9E%8B%E5%9C%BA%E6%99%AF%E5%8C%96%E8%AE%BE%E8%AE%A1)

  实际业务使用上包含问卷生成和投放使用，即对于系统的搭建端和渲染端。我们将题型场景化设计，以满足一份问卷从加工生产到投放应用的高度一致。

- [题型物料化设计，自由定制扩展](https://xiaojusurvey.didi.cn/docs/document/%E8%AE%BE%E8%AE%A1%E5%8E%9F%E7%90%86/%E9%A2%98%E5%9E%8B%E7%89%A9%E6%96%99%E5%8C%96%E8%AE%BE%E8%AE%A1/%E5%9F%BA%E7%A1%80%E8%AE%BE%E8%AE%A1)

  题型是问卷最核心的组成部分，而题型可配置化能力决定了上层业务可扩展的场景以及系统自身可复用的场景。
题型架构设计上，主打每一类题型拥有通用基础能力，每一种题型拥有原子化特性能力，并保障高度定制化。

- [合规建设沉淀积累，安全能力拓展性高](https://xiaojusurvey.didi.cn/docs/document/%E6%95%B0%E6%8D%AE%E5%AE%89%E5%85%A8)

  数据加密传输、敏感信息精细化检测、投票防刷等能力，保障问卷发布、数据回收链路安全性。

**二、轻量化设计，快速接入、灵活扩展**
- [产品级开源方案，快速产出一套调研流程](https://xiaojusurvey.didi.cn/docs/document/%E4%BA%A7%E5%93%81%E6%89%8B%E5%86%8C/%E6%A6%82%E8%BF%B0)

  围绕问卷生命周期提供了完整的产品化能力，包含用户管理: 登录、注册、问卷权限，问卷管理: 创、编、投、收、数据分析，可快速构建特定领域的调研类解决方案。

- [问卷设计开箱即用，降低领域复杂度](https://xiaojusurvey.didi.cn/docs/document/%E8%AE%BE%E8%AE%A1%E5%8E%9F%E7%90%86/%E9%97%AE%E5%8D%B7%E6%90%AD%E5%BB%BA%E9%A2%86%E5%9F%9F%E5%8C%96%E8%AE%BE%E8%AE%A1)

  问卷组成具有高灵活性，此业务特征带来问卷编辑能力的高复杂性设计。我们将问卷编辑划分为五大子领域，进行产品能力聚类，同时指导系统模块化设计和开发。基于模块编排和管理，能够开箱即用。

- [二次开发成本低，轻松定制专属调研系统](https://xiaojusurvey.didi.cn/docs/document/%E5%BC%80%E5%8F%91%E6%89%8B%E5%86%8C/%E5%B7%A5%E7%A8%8B%E9%85%8D%E7%BD%AE%E5%8C%96)

  全系统设计原则基于协议标准化、功能模块化、管理配置化，并提供了一些列完整的文档和开发及扩展手册。

- [部署成本低，快速上线](https://xiaojusurvey.didi.cn/docs/document/%E5%B7%A5%E7%A8%8B%E9%83%A8%E7%BD%B2)

  前后端分离，提供Docker化方案，提供了完善的部署指导手册。

## 快速启动

### 复制工程
```shell
git clone http://github.com/didi/xiaoju-survey
```

## 启动

### 后端启动

#### 安装数据库
详情查看 [环境准备](https://xiaojusurvey.didi.cn/docs/document/%E6%A6%82%E8%BF%B0/%E5%BF%AB%E9%80%9F%E5%BC%80%E5%A7%8B#%E5%AE%89%E8%A3%85%E6%95%B0%E6%8D%AE%E5%BA%93)

#### 安装依赖
```shell
cd server
sh init.sh
```

#### 启动
```shell
npm run dev
```

### 前端启动
#### 安装依赖
```shell
cd web
npm install
```
#### 启动
```shell
npm run serve
```

## 访问
### 问卷管理端

[http://localhost:8080/management](http://localhost:8080)

### 问卷投放端
创建并发布问卷：

[http://localhost:8080/render/:surveyPath](http://localhost:8080/render/:surveyPath)

## 交流群
[<img src="https://img-hxy021.didistatic.com/static/starimg/img/NSVCeskQL81698905740736.png"  width="200" />](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=P61UJI_q8AzizyBLGOm-bUvzNrUnSQq-&authKey=yZFtL9biGB5yiIME3%2Bi%2Bf6XMOdTNiuf0pCIaviEEAIryySNzVy6LJ4xl7uHdEcrM&noverify=0&group_code=920623419)