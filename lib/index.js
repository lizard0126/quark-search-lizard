var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  name: () => name,
  searchResourceApi: () => searchResourceApi,
  usage: () => usage
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var name = "quark-search-lizard";
var usage = `
# 📂 夸克网盘资源搜索插件
## 通过关键词搜索夸克网盘资源，返回夸克网盘链接
## API 已默认提供，如有需要可自行更换。
## 请合理使用，避免因滥用导致 API 限制或封禁。
---

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">使用方法</span></strong></summary>

### 🔍 资源搜索
#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">资源搜索 海贼王 // 搜索关键字“海贼王”</pre>

### 📄 如结果分页将监听后续消息
- **e / 下一页** ➝ 查看下一页  
- **q / 上一页** ➝ 查看上一页  
- **0 / 退出** ➝ 结束搜索  

⚠️ **注意**：  
- 每页最多返回的数据，可在配置中调整  
- 输入 **错误指令** 超过 2 次将自动结束搜索  
- **15 秒内无输入** 也会自动结束搜索  
</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">如果要反馈建议或报告问题</span></strong></summary>

<strong>可以[点这里](https://github.com/lizard0126/javbus-lizard/issues)创建议题~</strong>
</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">如果喜欢我的插件</span></strong></summary>

<strong>可以[请我喝可乐](https://ifdian.net/a/lizard0126)，没准就有动力更新新功能了~</strong>
</details>
`;
var Config = import_koishi.Schema.object({
  apiUrl: import_koishi.Schema.string().default("https://www.hhlqilongzhu.cn/api/duanju_cat.php").description("默认API请勿更改"),
  pageSize: import_koishi.Schema.number().default(10).min(1).max(20).description("每页显示的条目数")
});
var searchResourceApi = "?name=";
function apply(ctx, config) {
  async function fetchResourceByKeyword(keyword) {
    const searchUrl = config.apiUrl + searchResourceApi + encodeURIComponent(keyword);
    try {
      const responseString = await ctx.http.get(searchUrl);
      const response = JSON.parse(responseString);
      if (!response?.data?.length) {
        ctx.logger.warn("未找到匹配的资源");
        return null;
      }
      return response.data;
    } catch (err) {
      ctx.logger.error("获取资源失败:", err);
      return null;
    }
  }
  __name(fetchResourceByKeyword, "fetchResourceByKeyword");
  async function listenForPageSelection(session, resourceData) {
    const pageSize = config.pageSize;
    const totalPages = Math.ceil(resourceData.length / pageSize);
    if (totalPages === 1) {
      const result = resourceData.map(({ title, url }) => `标题: ${title}
下载链接: ${url}`).join("\n\n") + `

当前第 1 页，共 1 页`;
      session.send(result);
      return;
    }
    let page = 1;
    let isSearchActive = true;
    let errorCount = 0;
    const maxErrorCount = 2;
    const sendPageResults = /* @__PURE__ */ __name((page2) => {
      const start = (page2 - 1) * pageSize;
      const paginatedResource = resourceData.slice(start, start + pageSize);
      return paginatedResource.map(({ title, url }) => `标题: ${title}
下载链接: ${url}`).join("\n\n") + `

当前第 ${page2} 页，共 ${totalPages} 页
输入【q/上一页】查看上一页
输入【e/下一页】查看下一页
输入【0/退出】退出`;
    }, "sendPageResults");
    while (isSearchActive) {
      session.send(sendPageResults(page));
      const userInput = await session.prompt(15 * 1e3);
      if (userInput === "0" || userInput === "退出") {
        session.send("搜索已手动结束。");
        isSearchActive = false;
      } else if (userInput === "q" && page > 1 || userInput === "上一页" && page > 1) {
        page--;
        errorCount = 0;
      } else if (userInput === "e" && page < totalPages || userInput === "下一页" && page < totalPages) {
        page++;
        errorCount = 0;
      } else if (!userInput) {
        session.send("输入超时，搜索结束！");
        isSearchActive = false;
        return;
      } else {
        errorCount++;
        if (errorCount >= maxErrorCount) {
          session.send("错误次数过多，搜索结束！");
          isSearchActive = false;
        } else {
          session.send(`无效输入！
输入“q”查看上一页
输入“e”查看下一页
输入“0”退出
(剩余 ${maxErrorCount - errorCount} 次尝试)`);
        }
      }
    }
  }
  __name(listenForPageSelection, "listenForPageSelection");
  ctx.command("资源搜索 <keyword:text>", "搜索夸克网盘资源").action(async ({ session }, keyword) => {
    if (!keyword) return session.send("请提供搜索关键词！");
    try {
      const resourceData = await fetchResourceByKeyword(keyword);
      if (!resourceData) return session.send("未找到匹配的夸克网盘资源！");
      await listenForPageSelection(session, resourceData);
    } catch (err) {
      ctx.logger.error("资源搜索过程中发生错误:", err);
      session.send(`发生错误: ${err.message}`);
    }
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  name,
  searchResourceApi,
  usage
});
