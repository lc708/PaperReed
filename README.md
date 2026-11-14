# Mail Desktop（暂定名）

一个面向 macOS 的开源邮件客户端探索：重视阅读、写信与日常整理的品质，并让 Claude Code、Codex、OpenCode 等外部 Agent 方便地处理邮件。

## 当前状态

**设计尚未通过；整体架构和技术选型尚未最终确定。** 本次提交保存研究与设计过程，不代表批准当前界面、选定 Mailspring 底座或启动产品实现。

- 产品方向：美观、克制的 macOS 邮件客户端，支持多邮箱、统一收件箱、快捷键与邮件整理。
- 能力优先级：优先支持外部 Agent，通过 CLI 等入口共用邮件能力；内置 AI 后续考虑。
- UI：正在迭代。当前原型与历史版本均为候选，不是验收通过的设计。
- 技术：Mailspring、Zero 的代码研究已保存；Electron / React / TypeScript 等仅为现有候选方案。
- 实现：目前只有使用示例数据的 HTML 交互原型，没有可用的邮件客户端、真实 CLI、邮箱授权或同步服务。
- 仓库：先以私有仓库保存；项目名称、公开发布时机与许可证待确定。

## 阅读入口

| 内容 | 入口 |
| --- | --- |
| 当前交互原型（未通过设计评审） | [design/direction.html](design/direction.html) |
| 独立页面目录 | [design/PAGES.md](design/PAGES.md) |
| 界面探索与迭代说明 | [design/INTERFACE.md](design/INTERFACE.md) |
| UI/UX 评审记录 | [design/UX-REVIEW.md](design/UX-REVIEW.md) |
| 技术选型与架构候选 | [design/ARCHITECTURE.md](design/ARCHITECTURE.md) |
| Agent 交接候选 | [design/AGENT-HANDOFF.md](design/AGENT-HANDOFF.md) |
| 源码研究与验证边界 | [research/README.md](research/README.md) |
| 视觉参考来源 | [design/REFERENCES.md](design/REFERENCES.md) |

## 查看原型

用浏览器直接打开 `design/direction.html`，无需构建或启动服务器。全部邮件及连接状态均为演示；刷新会恢复初始状态，不会安装 CLI、唤起 Agent 或发送邮件。

修改主原型后，重新生成独立页面：

```sh
python3 design/build-previews.py
```

`design/direction-v*.html` 与 `design/INTERFACE-v*.md` 是历史探索快照，不是当前规范。历史文案如有“已确认”“既定”等表述，以本文件的未定稿状态为准。

## 后续待确定

继续评审视觉与交互；比较并最终确定技术底座、同步与存储方案、CLI / Agent 接入机制；在选定路线后验证真实邮箱闭环、打包与授权。现有模拟检查通过不等于设计获得认可或工程路线已经成立。
