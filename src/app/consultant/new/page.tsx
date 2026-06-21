"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [loadingEntities, setLoadingEntities] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPdfUrl, setExtractedPdfUrl] = useState<string | null>(null);
  const [extractFeedback, setExtractFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [designNa, setDesignNa] = useState(false);
  const [managementNa, setManagementNa] = useState(false);
  const [costNa, setCostNa] = useState(false);

  const [formData, setFormData] = useState({
    contractNumber: "", projectNumber: "", clientReferenceNumber: "", descriptionOfWork: "",
    firmName: "", firmAddress: "",
    pmName: "", pmTelephone: "", pmFax: "", pmCell: "", pmEmail: "",
    awardAmount: "", awardDate: "", finalAmount: "", completionDate: "", amendmentsCount: "",
    design: "", qualityOfResults: "", management: "", time: "", cost: "",
    totalPoints: "", comments: "",
  });

  useEffect(() => {
    setLoadingEntities(true);
    setFetchError("");
    fetch("/api/consultants")
      .then(res => {
        if (!res.ok) throw new Error("Failed to load consultants");
        return res.json();
      })
      .then(data => setConsultants(data))
      .catch(err => setFetchError(err.message))
      .finally(() => setLoadingEntities(false));
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

  const clampScore = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (isNaN(val)) return;
    const clamped = Math.max(0, Math.min(20, val));
    if (clamped !== val) {
      setFormData(prev => ({ ...prev, [e.target.name]: clamped.toString() }));
    }
  };

  const handleNaChange = (field: "design" | "management" | "cost") => {
    if (field === "design") {
      setDesignNa(prev => {
        const next = !prev;
        if (next) setFormData(f => ({ ...f, design: "" }));
        return next;
      });
    } else if (field === "management") {
      setManagementNa(prev => {
        const next = !prev;
        if (next) setFormData(f => ({ ...f, management: "" }));
        return next;
      });
    } else if (field === "cost") {
      setCostNa(prev => {
        const next = !prev;
        if (next) setFormData(f => ({ ...f, cost: "" }));
        return next;
      });
    }
  };

  const getScoreDetails = () => {
    let earned = 0;
    let maxPossible = 100;

    if (designNa) {
      maxPossible -= 20;
    } else {
      earned += parseInt(formData.design) || 0;
    }

    earned += parseInt(formData.qualityOfResults) || 0;

    if (managementNa) {
      maxPossible -= 20;
    } else {
      earned += parseInt(formData.management) || 0;
    }

    earned += parseInt(formData.time) || 0;

    if (costNa) {
      maxPossible -= 20;
    } else {
      earned += parseInt(formData.cost) || 0;
    }

    const scaled = maxPossible > 0 ? Math.round((earned / maxPossible) * 100) : 0;

    return { earned, maxPossible, scaled };
  };

  function formatDateForInput(dateStr?: string): string {
    if (!dateStr) return "";
    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) {
      const match = dateStr.match(/^\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : "";
    }
    const date = new Date(parsed);
    return date.toISOString().split("T")[0];
  }

  const handlePdfExtract = async (selectedFile: File) => {
    setIsExtracting(true);
    setExtractFeedback(null);

    const formDataObj = new FormData();
    formDataObj.append("file", selectedFile);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        body: formDataObj,
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Failed to extract data");
      }

      const result = await res.json();
      if (result.data.type !== "consultant") {
        throw new Error("This PDF appears to be a Contractor evaluation form. Please upload it on the Contractor evaluation page.");
      }

      const ext = result.data;
      
      setDesignNa(!ext.design);
      setManagementNa(!ext.management);
      setCostNa(!ext.cost);

      setFormData({
        contractNumber: ext.contractNumber || "",
        projectNumber: ext.projectNumber || "",
        clientReferenceNumber: ext.clientReferenceNumber || "",
        descriptionOfWork: ext.descriptionOfWork || "",
        firmName: ext.name || "",
        firmAddress: ext.address || "",
        pmName: ext.pmName || "",
        pmTelephone: ext.pmTelephone || "",
        pmFax: ext.pmFax || "",
        pmCell: ext.pmCell || "",
        pmEmail: ext.pmEmail || "",
        awardAmount: ext.awardAmount || "",
        awardDate: formatDateForInput(ext.awardDate),
        finalAmount: ext.finalAmount || "",
        completionDate: formatDateForInput(ext.completionDate),
        amendmentsCount: ext.amendmentsCount || "",
        design: ext.design || "",
        qualityOfResults: ext.qualityOfResults || "",
        management: ext.management || "",
        time: ext.time || "",
        cost: ext.cost || "",
        totalPoints: ext.totalPoints || "",
        comments: ext.comments || "",
      });

      setExtractedPdfUrl(result.originalPdfUrl);
      setExtractFeedback({
        type: "success",
        text: "Data successfully extracted from PDF form! Review the fields below before saving.",
      });
    } catch (err: any) {
      setExtractFeedback({
        type: "error",
        text: err.message,
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    let originalPdfUrl = extractedPdfUrl;

    if (file) {
      const uploadData = new FormData();
      uploadData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadData });
      if (uploadRes.ok) { const result = await uploadRes.json(); originalPdfUrl = result.url; }
    }

    const { scaled } = getScoreDetails();

    const payload = {
      ...formData,
      design: designNa ? null : formData.design,
      management: managementNa ? null : formData.management,
      cost: costNa ? null : formData.cost,
      totalPoints: scaled.toString(),
      originalPdfUrl
    };

    const res = await fetch("/api/consultant", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    if (res.ok) { router.push("/"); } else { alert("Failed to submit"); }
    setIsSubmitting(false);
  };

  const { earned, maxPossible, scaled } = getScoreDetails();

  const inputClass = "block w-full rounded-lg bg-white/70 border border-slate-200 px-3 py-2.5 text-slate-950 text-sm placeholder:text-slate-500 focus:outline-none focus:border-teal-600 transition-colors";
  const labelClass = "block text-xs uppercase tracking-wider font-medium text-slate-500 mb-1.5";
  const disabledClass = `${inputClass} disabled:opacity-50`;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-teal-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-950 mt-2 tracking-tight">New Consultant Evaluation</h1>
      </div>

      {/* PDF Extraction Card */}
      <div className="app-card p-6 mb-6 bg-gradient-to-br from-teal-50/50 to-cyan-50/30 border-teal-100/85">
        <h3 className="text-base font-semibold text-slate-950 flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Quick Pre-fill via PDF Form
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Upload a completed Consultant Evaluation PDF form to automatically extract project info, firm details, and scores.
        </p>

        <div className="flex flex-col gap-4">
          <div className="relative border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-xl p-6 transition-all bg-white/50 text-center cursor-pointer group">
            <input
              type="file"
              accept=".pdf"
              disabled={isExtracting}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handlePdfExtract(f);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {isExtracting ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-teal-600 animate-spin" />
                <span className="text-sm font-semibold text-slate-600">Extracting data...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5 py-1">
                <svg className="w-8 h-8 text-slate-400 group-hover:text-teal-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <span className="text-sm font-medium text-slate-700">
                  <span className="text-teal-700 font-semibold group-hover:underline">Click to upload</span> or drag & drop PDF here
                </span>
                <span className="text-[10px] text-slate-400">Digitally filled PDF only</span>
              </div>
            )}
          </div>

          {extractFeedback && (
            <div className={`flex items-start gap-2.5 rounded-lg border p-3 text-xs leading-relaxed ${
              extractFeedback.type === "success" 
                ? "bg-teal-50/70 border-teal-200 text-teal-800" 
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}>
              {extractFeedback.type === "success" ? (
                <svg className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              )}
              <span>{extractFeedback.text}</span>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Consultant Details */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Consultant Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Select Consultant</label>
              <select value={selectedConsultantId} onChange={handleConsultantSelect} className={inputClass} disabled={loadingEntities}>
                <option value="NEW">{loadingEntities ? "Loading consultants…" : "Create New Consultant"}</option>
                {consultants.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {fetchError && <p className="mt-1.5 text-xs text-rose-500">{fetchError}</p>}
            </div>
            <div>
              <label className={labelClass}>Firm Name</label>
              <input required name="firmName" value={formData.firmName} onChange={handleChange} disabled={selectedConsultantId !== "NEW"} className={disabledClass} />
            </div>
            <div>
              <label className={labelClass}>Business Address</label>
              <input name="firmAddress" value={formData.firmAddress} onChange={handleChange} disabled={selectedConsultantId !== "NEW"} className={disabledClass} />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Contract Number</label>
              <input required name="contractNumber" value={formData.contractNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Project Number</label>
              <input required name="projectNumber" value={formData.projectNumber} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Client Ref. Number</label>
              <input name="clientReferenceNumber" value={formData.clientReferenceNumber} onChange={handleChange} className={inputClass} />
            </div>
          </div>
          <div className="mt-5">
            <label className={labelClass}>Description of Work</label>
            <textarea name="descriptionOfWork" value={formData.descriptionOfWork} onChange={handleChange} rows={3} className={inputClass} />
          </div>
        </div>

        {/* Project Manager */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Project Manager</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Name</label>
              <input name="pmName" value={formData.pmName} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" name="pmEmail" value={formData.pmEmail} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Telephone</label>
              <input name="pmTelephone" value={formData.pmTelephone} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cell</label>
              <input name="pmCell" value={formData.pmCell} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Fax</label>
              <input name="pmFax" value={formData.pmFax} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Contract Information */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Contract Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Award Amount</label>
              <input type="number" step="0.01" name="awardAmount" value={formData.awardAmount} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Award Date</label>
              <input type="date" name="awardDate" value={formData.awardDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Final Amount</label>
              <input type="number" step="0.01" name="finalAmount" value={formData.finalAmount} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Completion Date</label>
              <input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Amendments Count</label>
              <input type="number" min="0" name="amendmentsCount" value={formData.amendmentsCount} onChange={handleChange} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Evaluation Scores */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Evaluation Scores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>Design <span className="text-slate-400">(0-20)</span></label>
              <input type="number" min="0" max="20" name="design" value={formData.design} onChange={handleChange} onBlur={clampScore} disabled={designNa} className={designNa ? disabledClass : inputClass} required={!designNa} />
              <label className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={designNa} onChange={() => handleNaChange("design")} className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5" />
                N/A S/O (Criteria not applicable)
              </label>
            </div>
            <div>
              <label className={labelClass}>Quality of Results <span className="text-slate-400">(0-20)</span></label>
              <input type="number" min="0" max="20" required name="qualityOfResults" value={formData.qualityOfResults} onChange={handleChange} onBlur={clampScore} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Management <span className="text-slate-400">(0-20)</span></label>
              <input type="number" min="0" max="20" name="management" value={formData.management} onChange={handleChange} onBlur={clampScore} disabled={managementNa} className={managementNa ? disabledClass : inputClass} required={!managementNa} />
              <label className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={managementNa} onChange={() => handleNaChange("management")} className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5" />
                N/A S/O (Criteria not applicable)
              </label>
            </div>
            <div>
              <label className={labelClass}>Time <span className="text-slate-400">(0-20)</span></label>
              <input type="number" min="0" max="20" required name="time" value={formData.time} onChange={handleChange} onBlur={clampScore} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cost <span className="text-slate-400">(0-20)</span></label>
              <input type="number" min="0" max="20" name="cost" value={formData.cost} onChange={handleChange} onBlur={clampScore} disabled={costNa} className={costNa ? disabledClass : inputClass} required={!costNa} />
              <label className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={costNa} onChange={() => handleNaChange("cost")} className="rounded text-teal-600 focus:ring-teal-500 h-3.5 w-3.5" />
                N/A S/O (Criteria not applicable)
              </label>
            </div>
            <div className="flex items-end pb-1.5">
              <div className={`w-full rounded-lg p-3 border text-center ${scaled >= 60 ? 'bg-teal-50 border-teal-200' : scaled > 0 ? 'bg-rose-500/10 border-rose-500/20' : 'bg-white/70 border-slate-200'}`}>
                <p className="text-xs text-slate-500 mb-1">Total Score</p>
                <p className={`text-2xl font-bold ${scaled >= 60 ? 'text-teal-700' : scaled > 0 ? 'text-rose-400' : 'text-slate-500'}`}>{earned}<span className="text-sm font-normal text-slate-500">/{maxPossible}</span></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Scaled: {scaled}/100</p>
              </div>
            </div>
          </div>
        </div>

        {/* Comments & Upload */}
        <div className="app-card p-6">
          <h3 className="text-base font-semibold text-slate-950 border-b border-slate-200/70 pb-3 mb-5">Additional Information</h3>
          <div className="space-y-5">
            <div>
              <label className={labelClass}>Comments</label>
              <textarea name="comments" value={formData.comments} onChange={handleChange} rows={4} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Attach Original PDF {extractedPdfUrl && <span className="text-teal-600 font-semibold">(Attached from pre-fill)</span>}</label>
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 file:transition-colors file:cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-teal-700 to-cyan-700 hover:from-teal-800 hover:to-cyan-800 transition-all hover:shadow-lg hover:shadow-cyan-700/20 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? "Saving..." : "Save Evaluation"}
          </button>
        </div>
      </form>
    </div>
  );
}
