import { Context } from 'koishi'
import Schema from 'schemastery'

export const name = 'quark-search-lizard'

export const usage = `
# 开箱即用的夸克网盘资源搜索插件
## 主要功能及示例调用：
- 影视资源搜索：用户可以通过关键词搜索夸克网盘资源，返回夸克网盘链接
  
  - 示例指令：资源搜索 关键词
    - 返回结果：至多5条资源数据以及分页页码，默认第一页
  
  - 示例指令：资源搜索 -p 2 关键词
    - 返回结果：至多5条资源数据以及分页页码的第二页
## todo：
- 解析夸克网盘链接（有生之年大概会做……）

- ……  
`

export interface Config {
  apiUrl: string;
}

export const Config = Schema.object({
  apiUrl: Schema.string()
    .default('https://www.hhlqilongzhu.cn/api/duanju_cat.php')
    .description('默认API请勿更改'),
})

export const searchResourceApi = '?name=';

export function apply(ctx: Context, config: Config) {
  async function fetchResourceByKeyword(keyword: string, page: number) {
    const searchUrl = config.apiUrl + searchResourceApi + encodeURIComponent(keyword);
    ctx.logger.info(`Fetching resource with keyword: ${keyword}`);
    ctx.logger.debug(`Search URL: ${searchUrl}`);

    try {
      const responseString = await ctx.http.get(searchUrl);
      const response = JSON.parse(responseString);

      if (!response || !response.data || !Array.isArray(response.data)) {
        ctx.logger.warn('No matching resource found or unexpected response structure!');
        return '未找到任何匹配的夸克网盘资源！';
      }

      const resourcePerPage = 5;
      const totalResource = response.data.length;
      const totalPages = Math.ceil(totalResource / resourcePerPage);

      if (page > totalPages) {
        return `请勿超出页码范围`;
      }

      const startIndex = (page - 1) * resourcePerPage;
      const paginatedResource = response.data.slice(startIndex, startIndex + resourcePerPage);

      const result = paginatedResource.map((data) => {
        const { title, url } = data;
        return `标题: ${title}\n下载链接: ${url}`;
      });

      return result.join('\n\n') + `\n\n第 ${page} 页，共 ${totalPages} 页`;
    } catch (err) {
      ctx.logger.error('Error fetching resource:', err);
      return `发生错误!; ${err}`;
    }
  }

  // 使用 command 定义搜索命令，并正确解析选项和参数
  ctx.command('资源搜索 <keyword:text>', '搜索夸克网盘资源')
    .option('page', '-p <page:number>', { fallback: 1 })  // 定义分页参数
    .action(async ({ options, session }, keyword) => {
      try {
        if (!keyword) {
          ctx.logger.warn('No keyword provided!');
          return '请提供关键词!';
        }

        const page = options.page || 1;  // 从选项中获取分页参数
        ctx.logger.info(`Searching for resource with keyword: ${keyword} on page ${page}`);
        const result = await fetchResourceByKeyword(keyword, page);
        return result;
      } catch (err) {
        ctx.logger.error('Error during resource search:', err);
        return `发生错误!; ${err}`;
      }
    });
}
