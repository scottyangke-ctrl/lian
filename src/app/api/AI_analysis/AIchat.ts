import OpenAI from "openai";

const openai = new OpenAI(
    {
        // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
        apiKey: "sk-bf1f3307598c4226a101e819ddb056d9",
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
);

async function main(url: string, text: string) {
    if (!url || !text) {
        throw new Error("缺少必要参数");
    }
    const response = await openai.chat.completions.create({
        model: "qwen-vl-max", // 此处以qwen-vl-max为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: [{role: "user",content: [
            { type: "image_url",image_url: {"url": url} },
            { type: "text", text: text },
        ]}],
        response_format:{type:"json_object"},
    });
    return response;
}

export const qwenMax = main;
// export { main };