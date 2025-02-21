import { Context, Schema } from 'koishi';
export declare const name = "quark-search-lizard";
export declare const usage = "\n# \uD83D\uDCC2 \u5938\u514B\u7F51\u76D8\u8D44\u6E90\u641C\u7D22\u63D2\u4EF6\n## \u901A\u8FC7\u5173\u952E\u8BCD\u641C\u7D22\u5938\u514B\u7F51\u76D8\u8D44\u6E90\uFF0C\u8FD4\u56DE\u5938\u514B\u7F51\u76D8\u94FE\u63A5\n## API \u5DF2\u9ED8\u8BA4\u63D0\u4F9B\uFF0C\u5982\u6709\u9700\u8981\u53EF\u81EA\u884C\u66F4\u6362\u3002\n## \u8BF7\u5408\u7406\u4F7F\u7528\uFF0C\u907F\u514D\u56E0\u6EE5\u7528\u5BFC\u81F4 API \u9650\u5236\u6216\u5C01\u7981\u3002\n---\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u4F7F\u7528\u65B9\u6CD5</span></strong></summary>\n\n### \uD83D\uDD0D \u8D44\u6E90\u641C\u7D22\n#### \u793A\u4F8B\uFF1A\n<pre style=\"background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;\">\u8D44\u6E90\u641C\u7D22 \u6D77\u8D3C\u738B // \u641C\u7D22\u5173\u952E\u5B57\u201C\u6D77\u8D3C\u738B\u201D</pre>\n\n### \uD83D\uDCC4 \u5982\u7ED3\u679C\u5206\u9875\u5C06\u76D1\u542C\u540E\u7EED\u6D88\u606F\n- **e / \u4E0B\u4E00\u9875** \u279D \u67E5\u770B\u4E0B\u4E00\u9875  \n- **q / \u4E0A\u4E00\u9875** \u279D \u67E5\u770B\u4E0A\u4E00\u9875  \n- **0 / \u9000\u51FA** \u279D \u7ED3\u675F\u641C\u7D22  \n\n\u26A0\uFE0F **\u6CE8\u610F**\uFF1A  \n- \u6BCF\u9875\u6700\u591A\u8FD4\u56DE\u7684\u6570\u636E\uFF0C\u53EF\u5728\u914D\u7F6E\u4E2D\u8C03\u6574  \n- \u8F93\u5165 **\u9519\u8BEF\u6307\u4EE4** \u8D85\u8FC7 2 \u6B21\u5C06\u81EA\u52A8\u7ED3\u675F\u641C\u7D22  \n- **15 \u79D2\u5185\u65E0\u8F93\u5165** \u4E5F\u4F1A\u81EA\u52A8\u7ED3\u675F\u641C\u7D22  \n</details>\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u5982\u679C\u8981\u53CD\u9988\u5EFA\u8BAE\u6216\u62A5\u544A\u95EE\u9898</span></strong></summary>\n\n<strong>\u53EF\u4EE5[\u70B9\u8FD9\u91CC](https://github.com/lizard0126/javbus-lizard/issues)\u521B\u5EFA\u8BAE\u9898~</strong>\n</details>\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u5982\u679C\u559C\u6B22\u6211\u7684\u63D2\u4EF6</span></strong></summary>\n\n<strong>\u53EF\u4EE5[\u8BF7\u6211\u559D\u53EF\u4E50](https://ifdian.net/a/lizard0126)\uFF0C\u6CA1\u51C6\u5C31\u6709\u52A8\u529B\u66F4\u65B0\u65B0\u529F\u80FD\u4E86~</strong>\n</details>\n";
export interface Config {
    apiUrl: string;
    pageSize: number;
}
export declare const Config: Schema<Schemastery.ObjectS<{
    apiUrl: Schema<string, string>;
    pageSize: Schema<number, number>;
}>, Schemastery.ObjectT<{
    apiUrl: Schema<string, string>;
    pageSize: Schema<number, number>;
}>>;
export declare const searchResourceApi = "?name=";
export declare function apply(ctx: Context, config: Config): void;
