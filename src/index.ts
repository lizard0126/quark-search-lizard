import { Context, Schema } from 'koishi';
// npm publish --workspace koishi-plugin-quark-search-lizard --access public --registry https://registry.npmjs.org
export const name = 'quark-search-lizard';

export const usage = `
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

export interface Config {
  apiUrl: string;
}

export const Config = Schema.object({
  apiUrl: Schema.string()
    .default('https://www.hhlqilongzhu.cn/api/duanju_cat.php')
    .description('默认API请勿更改'),
});

export const searchResourceApi = '?name=';

export function apply(ctx: Context, config: Config) {
  async function fetchResourceByKeyword(keyword: string) {
    const searchUrl = config.apiUrl + searchResourceApi + encodeURIComponent(keyword);
    //ctx.logger.info(`Fetching resource with keyword: ${keyword}`);
    //ctx.logger.debug(`Search URL: ${searchUrl}`);

    try {
      const responseString = await ctx.http.get(searchUrl);
      const response = JSON.parse(responseString);

      if (!response || !response.data || !Array.isArray(response.data)) {
        ctx.logger.warn('No matching resource found or unexpected response structure!');
        return null;
      }

      return response.data;
    } catch (err) {
      ctx.logger.error('Error fetching resource:', err);
      return null;
    }
  }

  async function listenForPageSelection(session, resourceData) {
    const totalPages = Math.ceil(resourceData.length / 5);
    let page = 1;
    const timeoutDuration = 15 * 1000;
    let errorCount = 0;
    const maxErrorCount = 3;
    let isSearchActive = true;

    const sendPageResults = (page) => {
      const paginatedResource = resourceData.slice((page - 1) * 5, page * 5);
      return paginatedResource.map(({ title, url }) => `标题: ${title}\n下载链接: ${url}`).join('\n\n') +
        `\n\n第 ${page} 页，共 ${totalPages} 页`;
    };

    const endSearch = (reason) => {
      isSearchActive = false;
      //ctx.logger.info(`Ending search: ${reason}`);
      session.send(reason);
    };

    const startTimer = () => setTimeout(() => {
      if (isSearchActive) {
        endSearch('输入超时，搜索结束！');
      }
    }, timeoutDuration);

    while (isSearchActive && errorCount < maxErrorCount) {
      session.send(sendPageResults(page));
      session.send('请输入页码 (数字)\n\n输入“0”或等待超时以结束搜索');

      const timer = startTimer();

      try {
        const userInput = await session.prompt(timeoutDuration);
        clearTimeout(timer);

        if (userInput === '0') {
          endSearch('搜索已手动结束。');
          return;
        }

        const userPageNumber = parseInt(userInput);

        if (!isSearchActive) return;

        if (!isNaN(userPageNumber) && userPageNumber >= 1 && userPageNumber <= totalPages) {
          page = userPageNumber;
        } else {
          errorCount++;
          if (errorCount >= maxErrorCount) {
            endSearch('错误次数过多，搜索结束！');
          } else {
            session.send('无效的页码，请输入有效的数字！');
          }
        }
      } catch (e) {
        endSearch('输入超时，搜索结束！');
      }
    }
  }

  ctx.command('资源搜索 <keyword:text>', '搜索夸克网盘资源')
    .action(async ({ session }, keyword) => {
      try {
        const resourceData = await fetchResourceByKeyword(keyword);
        
        if (!resourceData) {
          session.send('未找到任何匹配的夸克网盘资源！');
          return;
        }

        //ctx.logger.info(`Starting resource search for keyword: ${keyword}`);
        await listenForPageSelection(session, resourceData);
      } catch (err) {
        ctx.logger.error('Error during resource search:', err);
        session.send(`发生错误: ${err.message}`);
      }
    });
}