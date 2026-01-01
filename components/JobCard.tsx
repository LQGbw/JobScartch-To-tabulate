
import React from 'react';
import { JobInfo } from '../types';

interface JobCardProps {
  job: JobInfo;
  onEdit: (job: JobInfo) => void;
  onDelete: (id: string) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-700';
      case 'interview': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'applied': return '已投递';
      case 'interview': return '面试中';
      case 'rejected': return '未通过';
      default: return '已采集';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow group relative">
      <div className="flex justify-between items-start mb-3">
        <div className="max-w-[70%]">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{job.title}</h3>
          <p className="text-sm font-medium text-slate-500 line-clamp-1">{job.company}</p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider shrink-0 ${getStatusColor(job.status)}`}>
          {getStatusLabel(job.status)}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <i className="fa-solid fa-location-dot w-5 text-indigo-500"></i>
          <span className="truncate">{job.location || '暂无地点信息'}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <i className="fa-solid fa-coins w-5 text-indigo-500"></i>
          <span className="truncate">{job.salary || '薪资面议'}</span>
        </div>
        <div className="flex items-center text-sm text-slate-400 text-[11px]">
          <i className="fa-solid fa-calendar w-5"></i>
          <span>采集日期: {new Date(job.dateCaptured).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-slate-100 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(job)}
          className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <i className="fa-solid fa-pen-to-square mr-1"></i> 编辑
        </button>
        <button 
          onClick={() => {
            if (job.url) window.open(job.url, '_blank');
          }}
          disabled={!job.url}
          className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <i className="fa-solid fa-link mr-1"></i> 官网
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(job.id);
          }}
          className="p-2 text-slate-300 hover:text-red-500 transition-colors flex items-center justify-center rounded-lg hover:bg-red-50"
          title="删除记录"
        >
          <i className="fa-solid fa-trash-can"></i>
        </button>
      </div>
      
      {/* 移动端辅助删除按钮：在触摸屏上常驻或通过长按触发（此处使用 hover 优化） */}
      <div className="absolute top-2 right-2 md:hidden">
         <button 
          onClick={() => onDelete(job.id)}
          className="w-8 h-8 flex items-center justify-center text-slate-300 active:text-red-500"
         >
           <i className="fa-solid fa-ellipsis-vertical"></i>
         </button>
      </div>
    </div>
  );
};

export default JobCard;
