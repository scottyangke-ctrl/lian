import OpenAI from "openai";

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: "sk-bf1f3307598c4226a101e819ddb056d9",
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

async function main(text: string) {
    if (!text) {
        throw new Error("缺少必要参数");
    }
    const response = await openai.chat.completions.create({
        model: "qwen-vl-max", // 此处以qwen-vl-max为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: [
            { role: "system", content: `
                你是一个经验丰富的加密货币分析师,请分析这来之binance交易所的74条12小时的数据的指标,并给出未来一段时间的预测。
                如果可以请告诉我下一个12小时有多大的概率上涨,多大的概率下跌,
                如果是上涨的概率大,就告诉我多少的点位做多买入合适。
                如果是下跌的概率大,就告诉我多少的点位做空买入合适。
                我会发给你一份json数据,请你根据数据来分析,不要编造数据,也不要假设数据,只根据我给你的数据来分析。
                我不需要你的分析过程,我只需要你的结论和建议,请直接给我结论和建议,不要解释过程。
                请用json格式返回,格式如下:
                {
                    "probability_up": x.xx,
                    "probability_down": x.xx,
                    "action": "buy or sell",
                    "entry_price": xx.xx
                }
            ` },
            { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
    });
    return response;
}

export const qwenMax = main;

export const deepseek = async (text: string) => {
    if (!text) {
        throw new Error("缺少必要参数");
    }

    const completion = await openai.chat.completions.create({
        model: "deepseek-v3.1",  // 此处以 deepseek-v3.1 为例，可按需更换模型名称。
            messages: [
                { role: "user", content: `
                    你是一个经验丰富的加密货币分析师,
                    我会给你一堆我计算好的技术指标数据。
                    如果可以请告诉我下一个12小时有多大的概率上涨,多大的概率下跌,
                    如果是上涨的概率大,就告诉我多少的点位做多买入合适。
                    如果是下跌的概率大,就告诉我多少的点位做空买入合适。
                    我会发给你一份json数据,请你根据数据来分析,不要编造数据,也不要假设数据,只根据我给你的数据来分析。
                    ${text}
                    请用json格式返回,格式如下:
                    {
                        "probability_up": x.xx,
                        "probability_down": x.xx,
                        "action": "buy or sell",
                        "entry_price": xx.xx,
                        ""reason": "the reason for your action"
                    }
                ` },
                // { role: "user", content: text },
            ],
            response_format: { type: "json_object" },
    });

    return completion.choices[0].message.content;
}



/***
 * 
 * 
 *                     你是一个经验丰富的加密货币分析师,请分析这来之binance交易所的74条12小时的数据的走势,并给出未来一段时间的预测。
                    如果可以请告诉我下一个12小时有多大的概率上涨,多大的概率下跌,
                    如果是上涨的概率大,就告诉我多少的点位做多买入合适。
                    如果是下跌的概率大,就告诉我多少的点位做空买入合适。
                    我会发给你一份json数据,请你根据数据来分析,不要编造数据,也不要假设数据,只根据我给你的数据来分析。
                    我不需要你的分析过程,我只需要你的结论和建议,请直接给我结论和建议,不要解释过程。
 */

// export { main };