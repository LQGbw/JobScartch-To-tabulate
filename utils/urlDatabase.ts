
export const recruitmentMap: Record<string, string> = {
  'tencent.com': 'Tencent (腾讯)',
  'careers.tencent.com': 'Tencent (腾讯)',
  'alibaba.com': 'Alibaba (阿里巴巴)',
  'talent.alibaba.com': 'Alibaba (阿里巴巴)',
  'bytedance.com': 'ByteDance (字节跳动)',
  'jobs.bytedance.com': 'ByteDance (字节跳动)',
  'huawei.com': 'Huawei (华为)',
  'career.huawei.com': 'Huawei (华为)',
  'google.com': 'Google',
  'apple.com': 'Apple',
  'amazon.jobs': 'Amazon',
  'careers.microsoft.com': 'Microsoft',
  'tesla.com': 'Tesla',
  'jobs.meituan.com': 'Meituan (美团)',
  'campus.kuaishou.cn': 'Kuaishou (快手)',
  'jobs.58.com': '58.com (58同城)',
  'zhaopin.com': 'Zhaopin (智联招聘)',
  'lagou.com': 'Lagou (拉勾)',
  'bosszhipin.com': 'Boss Zhipin (Boss直聘)',
  'linkedin.com': 'LinkedIn (领英)',
};

export const identifyCompanyFromUrl = (url: string): string | null => {
  if (!url) return null;
  
  // 处理没有协议的情况
  let cleanUrl = url.trim().toLowerCase();
  if (!cleanUrl.startsWith('http')) {
    cleanUrl = 'https://' + cleanUrl;
  }

  try {
    const urlObj = new URL(cleanUrl);
    const hostname = urlObj.hostname;
    
    // 1. 优先尝试精确匹配和子域名匹配
    for (const [domain, company] of Object.entries(recruitmentMap)) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return company;
      }
    }

    // 2. 如果没匹配到，尝试提取二级域名并转换格式
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      // 找到倒数第二个部分 (例如 'google' in 'www.google.com')
      const mainPartIndex = parts.length - 2;
      const mainDomain = parts[mainPartIndex];
      
      // 过滤掉一些太通用的名称
      if (['com', 'cn', 'net', 'org', 'careers', 'jobs', 'talent'].includes(mainDomain)) {
        if (mainPartIndex > 0) {
          const alternative = parts[mainPartIndex - 1];
          return alternative.charAt(0).toUpperCase() + alternative.slice(1);
        }
      }
      return mainDomain.charAt(0).toUpperCase() + mainDomain.slice(1);
    }
    
    return null;
  } catch {
    // 如果 URL 不合法，尝试用正则暴力匹配关键词
    for (const [domain] of Object.entries(recruitmentMap)) {
      if (url.toLowerCase().includes(domain.split('.')[0])) {
        return recruitmentMap[domain];
      }
    }
    return null;
  }
};
