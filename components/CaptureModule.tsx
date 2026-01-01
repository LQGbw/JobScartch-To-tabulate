
import React, { useState, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { fileToBase64 } from '../utils/helpers';
import { identifyCompanyFromUrl } from '../utils/urlDatabase';
import { JobInfo } from '../types';

interface CaptureModuleProps {
  onCapture: (job: Partial<JobInfo>) => void;
}

const CaptureModule: React.FC<CaptureModuleProps> = ({ onCapture }) => {
  const [inputUrl, setInputUrl] = useState('');
  const [inputText, setInputText] = useState('');
  const [useAI, setUseAI] = useState(false); // 默认关闭深度检索
  const [mode, setMode] = useState<'text' | 'ocr'>('text');
  const [loading, setLoading] = useState(false);
  const [identifiedCompany, setIdentifiedCompany] = useState<string | null>(null);

  useEffect(() => {
    setIdentifiedCompany(identifyCompanyFromUrl(inputUrl));
  }, [inputUrl]);

  const handleUrlExtraction = async () => {
    if (!inputUrl) return;
    setLoading(true);
    try {
      let result;
      if (useAI) {
        // 增强模式：联网检索
        result = await geminiService.extractFromUrlAdvanced(inputUrl);
      } else {
        // 基础模式：URL 关键词解析
        result = await geminiService.extractFromUrlBasic(inputUrl, identifiedCompany);
      }
      onCapture({
        ...result,
        url: inputUrl,
        dateCaptured: new Date().toISOString(),
        status: 'captured'
      });
      setInputUrl('');
    } catch (err) {
      alert("解析失败。请尝试开启「AI 增强模式」或粘贴职位描述文本。");
    } finally {
      setLoading(false);
    }
  };

  const handleTextExtraction = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      // 无论开关，文本提取都使用快速 AI 解析
      const result = await geminiService.extractJobFromText(inputText, identifiedCompany);
      onCapture({
        ...result,
        url: inputUrl || '手动粘贴',
        dateCaptured: new Date().toISOString(),
        status: 'captured'
      });
      setInputText('');
    } catch (err) {
      alert("文本提取失败");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const base64 = await fileToBase64(file);
      // OCR 始终可用
      const result = await geminiService.extractJobFromImage(base64);
      onCapture({
        ...result,
        url: inputUrl || '截图识别',
        dateCaptured: new Date().toISOString(),
        status: 'captured'
      });
    } catch (err) {
      alert("截图识别失败，请确保文字清晰");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300">
      <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <i className="fa-solid fa-wand-sparkles text-white text-sm"></i>
          </div>
          <span className="text-white font-bold">采集引擎</span>
        </div>
        <div className="flex items-center gap-3 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter leading-none">AI 深度检索</span>
            <span className="text-[7px] text-slate-500 italic">开启后支持联网抓取</span>
          </div>
          <button 
            onClick={() => setUseAI(!useAI)}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${useAI ? 'bg-indigo-500' : 'bg-slate-600'}`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${useAI ? 'translate-x-5.5' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <div className="p-8 space-y-8">
        <section>
          <div className="flex justify-between items-end mb-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">
              方案 A: 招聘链接解析
            </label>
            {identifiedCompany && (
              <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-bold">
                匹配公司: {identifiedCompany}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <i className="fa-solid fa-link absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text"
                placeholder="在此粘贴企业招聘官网链接..."
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-medium text-sm"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
              />
            </div>
            <button 
              disabled={loading || !inputUrl}
              onClick={handleUrlExtraction}
              className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2 shrink-0 disabled:bg-slate-300"
            >
              {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
              提取职位
            </button>
          </div>
          {!useAI && (
            <p className="mt-2 text-[10px] text-slate-400">
              <i className="fa-solid fa-info-circle mr-1"></i> 提示：当前为本地解析，若无法识别职位名，请开启「深度检索」或粘贴文本。
            </p>
          )}
        </section>

        <div className="relative py-2 flex items-center">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase">备选方案</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <section>
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button onClick={() => setMode('text')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'text' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>粘贴文本内容</button>
            <button onClick={() => setMode('ocr')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${mode === 'ocr' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>上传职位截图</button>
          </div>

          {mode === 'text' ? (
            <div className="space-y-3">
              <textarea 
                rows={4}
                placeholder="粘贴职位描述或职位要求..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <button disabled={loading || !inputText.trim()} onClick={handleTextExtraction} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                解析文本内容
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-indigo-400 transition-all bg-slate-50 relative cursor-pointer">
              <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                <i className="fa-solid fa-camera text-indigo-500 text-xl"></i>
              </div>
              <p className="text-sm font-bold text-slate-700">上传截图进行 OCR 识别</p>
              <p className="text-[10px] text-slate-400 mt-1">AI 将自动从图中提取职位和薪资信息</p>
            </div>
          )}
        </section>
      </div>

      {loading && (
        <div className="bg-indigo-600 text-white px-8 py-3 flex items-center gap-3 animate-pulse">
          <i className="fa-solid fa-microchip animate-spin"></i>
          <span className="text-xs font-bold tracking-tight">AI 引擎正在全力解析中...</span>
        </div>
      )}
    </div>
  );
};

export default CaptureModule;
