
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ExtractionResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  /**
   * 1. 联网深度识别 (AI 增强模式)
   * 使用 Pro 模型 + Google Search 解决动态加载页面
   */
  async extractFromUrlAdvanced(url: string): Promise<ExtractionResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `你是一个专业的招聘数据提取助手。
        任务：识别此 URL 中的职位名称、公司、地点、薪资。
        URL: ${url}
        注意：如果页面内容难以直接抓取，请使用搜索工具辅助。
        必须以 JSON 格式返回。`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "company"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Advanced extraction failed", error);
      throw error;
    }
  }

  /**
   * 2. 基础链接分析 (非增强模式)
   * 即使不联网，也通过 AI 分析 URL 字符串特征来推断职位
   */
  async extractFromUrlBasic(url: string, suggestedCompany?: string | null): Promise<ExtractionResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `分析以下招聘链接，推测其职位名称和公司。
        链接: ${url}
        已知公司参考: ${suggestedCompany || '未知'}
        要求：观察 URL 路径中的关键词（如 web_developer, hr_manager 等）。
        如果实在无法确定职位，职位名请返回 "官网职位 (请手动填写)"。`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING }
            }
          }
        }
      });
      const data = JSON.parse(response.text || "{}");
      return {
        title: data.title || "待补充职位",
        company: data.company || suggestedCompany || "未知企业",
        location: data.location || ""
      };
    } catch (error) {
      return { title: "手动填写的职位", company: suggestedCompany || "未知企业" };
    }
  }

  /**
   * 3. 基础 OCR / 文本解析 (核心功能，始终可用)
   */
  async extractJobFromText(text: string, suggestedCompany?: string | null): Promise<ExtractionResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `从以下文本中提取招聘信息。公司名称参考: ${suggestedCompany || ''} \n\n文本内容: ${text}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      return { title: text.substring(0, 20), company: suggestedCompany || "未知" };
    }
  }

  async extractJobFromImage(base64Image: string): Promise<ExtractionResult> {
    try {
      const data = base64Image.includes(",") ? base64Image.split(",")[1] : base64Image;
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { 
          parts: [
            { inlineData: { mimeType: "image/png", data } },
            { text: "这是一个招聘页面的截图，请识别并提取：职位名称、公司名称、工作地点、薪资范围。请以中文 JSON 格式返回。" }
          ] 
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING }
            }
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("OCR failed", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
