
import React, { useState, useEffect } from 'react';
import { JobInfo } from './types';
import JobCard from './components/JobCard';
import CaptureModule from './components/CaptureModule';
import { exportToCSV } from './utils/helpers';

const App: React.FC = () => {
  const [jobs, setJobs] = useState<JobInfo[]>([]);
  const [editingJob, setEditingJob] = useState<JobInfo | null>(null);
  const [activeTab, setActiveTab] = useState<'capture' | 'history'>('capture');
  const [searchQuery, setSearchQuery] = useState('');

  // 加载数据
  useEffect(() => {
    const saved = localStorage.getItem('jobcollector_v3_stable');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setJobs(parsed);
      } catch (e) {
        console.error("Storage load error", e);
      }
    }
  }, []);

  // 监听 jobs 变化，自动保存
  useEffect(() => {
    localStorage.setItem('jobcollector_v3_stable', JSON.stringify(jobs));
  }, [jobs]);

  const handleCapture = (newJob: Partial<JobInfo>) => {
    // 使用更高强度的唯一 ID
    const uniqueId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const job: JobInfo = {
      id: uniqueId,
      title: newJob.title || '待完善职位',
      company: newJob.company || '未知企业',
      location: newJob.location || '',
      salary: newJob.salary || '',
      url: newJob.url || '',
      description: newJob.description || '',
      requirements: newJob.requirements || [],
      dateCaptured: new Date().toISOString(),
      status: 'captured',
      ...newJob
    };
    setJobs(prev => [job, ...prev]);
    setActiveTab('history');
  };

  const handleDelete = (id: string) => {
    // 显式弹窗确认
    if (window.confirm("确定要永久删除这条投递记录吗？")) {
      setJobs(prev => {
        const updated = prev.filter(j => j.id !== id);
        return [...updated]; // 确保返回新引用触发重绘
      });
    }
  };

  const handleUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingJob) {
      setJobs(prev => prev.map(j => j.id === editingJob.id ? editingJob : j));
      setEditingJob(null);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <i className="fa-solid fa-rocket text-xl"></i>
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight">JobCollector</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">智能求职管理系统</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('capture')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'capture' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-plus-circle"></i> 采集新职位
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <i className="fa-solid fa-box-archive"></i> 投递历史
            {jobs.length > 0 && (
              <span className="ml-auto bg-slate-700 text-[10px] px-2 py-0.5 rounded-full">{jobs.length}</span>
            )}
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button onClick={() => exportToCSV(jobs)} className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl text-sm font-bold transition-all border border-slate-700">
            <i className="fa-solid fa-download"></i> 导出 CSV
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {activeTab === 'capture' ? (
          <div className="max-w-2xl mx-auto py-10">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-black text-slate-800 mb-2">智能采集</h2>
              <p className="text-slate-500">支持链接解析、文本识别及截图 OCR。</p>
            </div>
            <CaptureModule onCapture={handleCapture} />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800">投递清单</h2>
                <p className="text-slate-500 text-sm">已存储 {jobs.length} 条记录。点击卡片右下角图标可删除。</p>
              </div>
              <div className="relative">
                <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="text" 
                  placeholder="搜索职位或公司..."
                  className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-full md:w-64 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onEdit={setEditingJob} 
                    onDelete={handleDelete} 
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-magnifying-glass text-slate-300 text-4xl"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">没有发现记录</h3>
                <p className="text-slate-500 mb-6">快去采集你的第一份岗位吧！</p>
                <button onClick={() => setActiveTab('capture')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold">
                  开始采集
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-black text-slate-800">手动修改</h3>
              <button onClick={() => setEditingJob(null)} className="text-slate-400 hover:text-slate-600"><i className="fa-solid fa-times text-xl"></i></button>
            </div>
            <form onSubmit={handleUpdateJob} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">职位名称</label>
                  <input type="text" value={editingJob.title} onChange={(e) => setEditingJob({...editingJob, title: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">公司</label>
                  <input type="text" value={editingJob.company} onChange={(e) => setEditingJob({...editingJob, company: e.target.value})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">投递状态</label>
                  <select value={editingJob.status} onChange={(e) => setEditingJob({...editingJob, status: e.target.value as any})} className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="captured">已采集</option>
                    <option value="applied">已投递</option>
                    <option value="interview">面试中</option>
                    <option value="rejected">未通过</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingJob(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl">取消</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200">完成保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
