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
# 开箱即用的夸克网盘资源搜索插件
## 主要功能及示例调用：
- 影视资源搜索：用户可以通过关键词搜索夸克网盘资源，返回夸克网盘链接

  - 示例指令：资源搜索 关键词
    - 返回结果：至多5条资源数据以及分页页码，默认第一页
  - 根据提示继续发送页码：2
    - 返回结果：数据的第二页
## 本次更新：
- 优化代码结构，添加手动结束方式
## todo：
- 解析夸克网盘链接（有生之年大概会做……）

- ……
`;
var Config = import_koishi.Schema.object({
  apiUrl: import_koishi.Schema.string().default("https://www.hhlqilongzhu.cn/api/duanju_cat.php").description("默认API请勿更改")
});
var searchResourceApi = "?name=";
function apply(ctx, config) {
  async function fetchResourceByKeyword(keyword) {
    const searchUrl = config.apiUrl + searchResourceApi + encodeURIComponent(keyword);
    try {
      const responseString = await ctx.http.get(searchUrl);
      const response = JSON.parse(responseString);
      if (!response || !response.data || !Array.isArray(response.data)) {
        ctx.logger.warn("No matching resource found or unexpected response structure!");
        return null;
      }
      return response.data;
    } catch (err) {
      ctx.logger.error("Error fetching resource:", err);
      return null;
    }
  }
  __name(fetchResourceByKeyword, "fetchResourceByKeyword");
  async function listenForPageSelection(session, resourceData) {
    const totalPages = Math.ceil(resourceData.length / 5);
    let page = 1;
    const timeoutDuration = 15 * 1e3;
    let errorCount = 0;
    const maxErrorCount = 3;
    let isSearchActive = true;
    const sendPageResults = /* @__PURE__ */ __name((page2) => {
      const paginatedResource = resourceData.slice((page2 - 1) * 5, page2 * 5);
      return paginatedResource.map(({ title, url }) => `标题: ${title}
下载链接: ${url}`).join("\n\n") + `

第 ${page2} 页，共 ${totalPages} 页`;
    }, "sendPageResults");
    const endSearch = /* @__PURE__ */ __name((reason) => {
      isSearchActive = false;
      session.send(reason);
    }, "endSearch");
    const startTimer = /* @__PURE__ */ __name(() => setTimeout(() => {
      if (isSearchActive) {
        endSearch("输入超时，搜索结束！");
      }
    }, timeoutDuration), "startTimer");
    while (isSearchActive && errorCount < maxErrorCount) {
      session.send(sendPageResults(page));
      session.send("请输入页码 (数字)\n\n输入“0”或等待超时以结束搜索");
      const timer = startTimer();
      try {
        const userInput = await session.prompt(timeoutDuration);
        clearTimeout(timer);
        if (userInput === "0") {
          endSearch("搜索已手动结束。");
          return;
        }
        const userPageNumber = parseInt(userInput);
        if (!isSearchActive) return;
        if (!isNaN(userPageNumber) && userPageNumber >= 1 && userPageNumber <= totalPages) {
          page = userPageNumber;
        } else {
          errorCount++;
          if (errorCount >= maxErrorCount) {
            endSearch("错误次数过多，搜索结束！");
          } else {
            session.send("无效的页码，请输入有效的数字！");
          }
        }
      } catch (e) {
        endSearch("输入超时，搜索结束！");
      }
    }
  }
  __name(listenForPageSelection, "listenForPageSelection");
  ctx.command("资源搜索 <keyword:text>", "搜索夸克网盘资源").action(async ({ session }, keyword) => {
    try {
      const resourceData = await fetchResourceByKeyword(keyword);
      if (!resourceData) {
        session.send("未找到任何匹配的夸克网盘资源！");
        return;
      }
      await listenForPageSelection(session, resourceData);
    } catch (err) {
      ctx.logger.error("Error during resource search:", err);
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
