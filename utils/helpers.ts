
import { JobInfo } from "../types";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const exportToCSV = (jobs: JobInfo[]) => {
  const headers = ["Title", "Company", "Location", "Salary", "URL", "Date Captured", "Status"];
  const rows = jobs.map(job => [
    `"${job.title}"`,
    `"${job.company}"`,
    `"${job.location}"`,
    `"${job.salary}"`,
    `"${job.url}"`,
    `"${job.dateCaptured}"`,
    `"${job.status}"`
  ]);

  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `job_applications_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
