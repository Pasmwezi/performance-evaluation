"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Consultant {
  id: string;
  name: string;
  address: string | null;
}

export default function NewConsultantEvaluation() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState("NEW");

  const [formData, setFormData] = useState({
    contractNumber: "", projectNumber: "", clientReferenceNumber: "", descriptionOfWork: "",
    firmName: "", firmAddress: "",
    pmName: "", pmTelephone: "", pmFax: "", pmCell: "", pmEmail: "",
    awardAmount: "", awardDate: "", finalAmount: "", completionDate: "", amendmentsCount: "",
    design: "", qualityOfResults: "", management: "", time: "", cost: "",
    totalPoints: "", comments: "",
  });

  useEffect(() => {
    fetch("/api/consultants").then(res => res.json()).then(data => setConsultants(data)).catch(console.error);
  }, []);

  const handleConsultantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedConsultantId(val);
    if (val !== "NEW") {
      const selected = consultants.find(c => c.id === val);
      if (selected) { setFormData(prev => ({ ...prev, firmName: selected.name, firmAddress: selected.address || "" })); }
    } else { setFormData(prev => ({ ...prev, firmName: "", firmAddress: "" })); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    const d = parseInt(formData.design) || 0;
    const q = parseInt(formData.qualityOfResults) || 0;
    const m = parseInt(formData.management) || 0;
    const t = parseInt(formData.time) || 0;
    const c = parseInt(formData.cost) || 0;
    return d + q + m + t + c;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let originalPdfUrl = null;
    if (file) {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (uploadRes.ok) { const result = await uploadRes.json(); originalPdfUrl = result.url; }
    }
    const payload = { ...formData, totalPoints: calculateTotal().toString(), originalPdfUrl };
    const res = await fetch("/api/consultant", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push("/"); } else { alert("Failed to submit"); }
    setIsSubmitting(false);
  };

  const total = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-950 mb-6 tracking-tight">New Consultant Evaluation</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consultant Details */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Consultant Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Select Consultant</label>
              <select value={selectedConsultantId} onChange={handleConsultantSelect} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm focus:outline-none focus:border-teal-600 transition-colors">
                <option value="NEW">Create New Consultant</option>
                {consultants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Firm Name</label>
              <input required name="firmName" value={formData.firmName} onChange={handleChange} disabled={selectedConsultantId !== "NEW"} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Business Address</label>
              <input name="firmAddress" value={formData.firmAddress} onChange={handleChange} disabled={selectedConsultantId !== "NEW"} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors disabled:opacity-50" />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Contract Number</label>
              <input required name="contractNumber" value={formData.contractNumber} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Project Number</label>
              <input required name="projectNumber" value={formData.projectNumber} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Client Ref. Number</label>
              <input name="clientReferenceNumber" value={formData.clientReferenceNumber} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Description of Work</label>
            <textarea name="descriptionOfWork" value={formData.descriptionOfWork} onChange={handleChange} rows={3} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
          </div>
        </div>

        {/* Project Manager */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Project Manager</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Name</label>
              <input name="pmName" value={formData.pmName} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Telephone</label>
              <input name="pmTelephone" value={formData.pmTelephone} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Email</label>
              <input type="email" name="pmEmail" value={formData.pmEmail} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Contract Information */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Contract Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Award Amount</label>
              <input type="number" step="0.01" name="awardAmount" value={formData.awardAmount} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Award Date</label>
              <input type="date" name="awardDate" value={formData.awardDate} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Final Amount</label>
              <input type="number" step="0.01" name="finalAmount" value={formData.finalAmount} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Completion Date</label>
              <input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* Evaluation Scores */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Evaluation Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Design <span className="text-slate-600">(0-20)</span></label>
              <input type="number" min="0" max="20" name="design" value={formData.design} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Quality of Results <span className="text-slate-600">(0-20)</span></label>
              <input type="number" min="0" max="20" name="qualityOfResults" value={formData.qualityOfResults} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Management <span className="text-slate-600">(0-20)</span></label>
              <input type="number" min="0" max="20" name="management" value={formData.management} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Time <span className="text-slate-600">(0-20)</span></label>
              <input type="number" min="0" max="20" name="time" value={formData.time} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Cost <span className="text-slate-600">(0-20)</span></label>
              <input type="number" min="0" max="20" name="cost" value={formData.cost} onChange={handleChange} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div className="flex items-end">
              <div className={`w-full rounded-lg p-3 border text-center ${total >= 60 ? 'bg-teal-50 border-teal-200' : total > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/70 border-slate-200'}`}>
                <p className="text-xs text-slate-500 mb-1">Total Score</p>
                <p className={`text-2xl font-bold ${total >= 60 ? 'text-teal-700' : total > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{total}<span className="text-sm font-normal text-slate-500">/100</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Comments & Upload */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Additional Information</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Comments</label>
              <textarea name="comments" value={formData.comments} onChange={handleChange} rows={4} className="block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5">Attach Original PDF</label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 file:transition-colors file:cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-950 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all hover:shadow-lg hover:shadow-cyan-700/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? "Saving..." : "Save Evaluation"}
          </button>
        </div>
      </form>
    </div>
  );
}




