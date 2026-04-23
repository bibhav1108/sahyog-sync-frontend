import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import API from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import SkeletonStructure from "../../../components/shared/SkeletonStructure";
import ActionInput from "../../../components/shared/ActionInput";
import { resolveProfileImage } from "../../../utils/imageUtils";
import { formatExternalUrl } from "../../../utils/urlUtils";

const STEPS = {
    BASIC: 1,
    LEGAL: 2,
    ADMIN: 3,
    MANDATORY_DOCS: 4,
    OPTIONAL_DOCS: 5,
    REVIEW: 6
};

const OrgIdentityPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(STEPS.BASIC);
    const [org, setOrg] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOnboarding, setIsOnboarding] = useState(false);
    const [saving, setSaving] = useState(false);
    const { addToast } = useToast();

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        about: "",
        website_url: "",
        ngo_type: "TRUST",
        office_address: "",
        contact_phone: ""
    });

    const uploadLogo = async (file) => {
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append("file", file);
        try {
            setSaving(true);
            const res = await API.post("/organizations/me/logo", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setOrg({ ...org, logo_url: res.data.logo_url });
            addToast("Logo updated successfully!", "success");
        } catch (err) {
            addToast("Failed to upload logo", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleProfileUpdate = async () => {
        setSaving(true);
        try {
            const res = await API.patch("/organizations/me", editData);
            setOrg(res.data);
            setIsEditing(false);
            addToast("Profile updated successfully", "success");
        } catch (err) {
            addToast("Failed to save changes", "error");
        } finally {
            setSaving(false);
        }
    };

    // Form Data
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        ngo_type: "TRUST",
        registration_number: "",
        pan_number: "",
        ngo_darpan_id: "",
        office_address: "",
        about: "",
        website_url: "",
        admin_phone: "",
        id_proof_type: "AADHAAR",
        id_proof_number: ""
    });

    const [documents, setDocuments] = useState([]); // [{type, name, file, url, isMandatory}]

    useEffect(() => {
        fetchOrg();
    }, []);

    const fetchOrg = async () => {
        try {
            const res = await API.get("/organizations/me");
            setOrg(res.data);
            setEditData({
                about: res.data.about || "",
                website_url: res.data.website_url || "",
                ngo_type: res.data.ngo_type || "TRUST",
                office_address: res.data.office_address || "",
                contact_phone: res.data.contact_phone || ""
            });
            if (res.data.status === "DRAFT" || res.data.status === "REJECTED") {
                setIsOnboarding(true);
                // Pre-fill if some data exists
                setFormData(prev => ({
                    ...prev,
                    name: res.data.name || "",
                    phone: res.data.contact_phone || "",
                    email: res.data.contact_email || "",
                    about: res.data.about || "",
                    website_url: res.data.website_url || ""
                }));
            } else {
                setIsOnboarding(false);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                setIsOnboarding(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e, docType, isMandatory = true) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("document_type", docType);
        uploadData.append("is_mandatory", isMandatory);

        setSaving(true);
        try {
            const res = await API.post("/ngo-admin/documents/upload", uploadData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            addToast(`${docType} uploaded successfully`, "success");
            setDocuments(prev => [...prev.filter(d => d.type !== docType), {
                type: docType,
                name: file.name,
                url: res.data.url,
                isMandatory
            }]);
        } catch (err) {
            addToast("Upload failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const saveOnboardingDraft = async (quiet = false) => {
        if (!formData.name || !formData.phone || !formData.email) {
            if (!quiet) addToast("Please fill basic NGO details", "error");
            return false;
        }

        if (!quiet) setSaving(true);
        try {
            const res = await API.post("/ngo-admin/onboard", {
                org_name: formData.name,
                org_phone: formData.phone,
                org_email: formData.email,
                ngo_type: formData.ngo_type,
                registration_number: formData.registration_number,
                pan_number: formData.pan_number,
                ngo_darpan_id: formData.ngo_darpan_id,
                office_address: formData.office_address,
                about: formData.about,
                website_url: formData.website_url,
                admin_phone: formData.admin_phone,
                id_proof_type: formData.id_proof_type,
                id_proof_number: formData.id_proof_number
            });
            
            if (!quiet) addToast("Progress saved", "success");
            
            // Re-fetch to get the new org_id into local state for document uploads
            await fetchOrg();
            return true;
        } catch (err) {
            if (!quiet) addToast(err.response?.data?.detail || "Failed to save draft", "error");
            return false;
        } finally {
            if (!quiet) setSaving(false);
        }
    };

    const handleFinalSubmit = async () => {
        setSaving(true);
        try {
            await API.post("/ngo-admin/submit-verification");
            addToast("Verification request submitted successfully!", "success");
            await fetchOrg();
        } catch (err) {
            addToast(err.response?.data?.detail || "Submission failed", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleNextStep = async () => {
        // Auto-save when leaving Step 3 to ensure org exists for Step 4 uploads
        if (step === STEPS.ADMIN) {
            const success = await saveOnboardingDraft();
            if (!success) return;
        }
        setStep(step + 1);
    };

    if (loading) return (
        <div className="space-y-10">
            <div className="flex items-center gap-6">
                <SkeletonStructure layout={[{type: 'circle', size: 100}]} />
                <SkeletonStructure layout={[{type: 'stack', items: [{type: 'text', width: '40%'}, {type: 'text', width: '20%'}]}]} />
            </div>
            <SkeletonStructure layout={[{type: 'rect', height: 400, className: "rounded-[3.5rem]"}]} />
        </div>
    );

    if (!isOnboarding && org) {
        return (
            <div className="max-w-6xl mx-auto space-y-12 pb-32 selection:bg-primary/10 animate-fadeIn font-outfit">
                {/* HERO BRANDING */}
                <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-on_surface/5 p-10 md:p-14 shadow-soft flex flex-col md:flex-row items-center gap-10">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primaryGradient opacity-5 blur-[100px] -mr-32" />
                    
                    {/* LOGO UPLOAD SECTION */}
                    <div className="group relative">
                        <div 
                            onClick={() => document.getElementById("logo-upload").click()}
                            className="w-40 h-40 rounded-[2rem] bg-surface_high flex items-center justify-center shadow-inner border border-on_surface/5 overflow-hidden relative cursor-pointer ring-4 ring-primary/5 group-hover:ring-primary/20 transition-all duration-500"
                        >
                            {org?.logo_url ? (
                                <img src={resolveProfileImage(org.logo_url)} alt="logo" className="w-full h-full object-cover" />
                            ) : (
                                <span className="material-symbols-outlined text-primary text-[80px] font-black">corporate_fare</span>
                            )}
                            
                            <div className="absolute inset-0 bg-primary/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <span className="material-symbols-outlined text-3xl mb-1">add_a_photo</span>
                                <p className="text-[10px] font-black uppercase tracking-widest text-center px-4">Change Profile Picture</p>
                            </div>
                        </div>
                        <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={(e) => uploadLogo(e.target.files[0])} />
                        
                        <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">verified</span>
                        </div>
                    </div>

                <div className="space-y-2">
                    <p className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
                        NGO Profile
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black text-on_surface tracking-tight leading-tight">Organization Profile</h1>
                    <p className="text-sm md:text-base text-on_surface_variant max-w-lg font-medium leading-relaxed opacity-60">
                        Manage your organization's public details and registration information.
                    </p>
                </div>

                    <div className="flex flex-col gap-3">
                        {!isEditing ? (
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="bg-primaryGradient text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">edit</span>
                                Update info
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleProfileUpdate}
                                    disabled={saving}
                                    className="bg-primaryGradient text-white px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 active:scale-95"
                                >
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData({
                                            about: org.about || "",
                                            website_url: org.website_url || "",
                                            ngo_type: org.ngo_type || "TRUST",
                                            office_address: org.office_address || "",
                                            contact_phone: org.contact_phone || ""
                                        });
                                    }}
                                    className="bg-red-500/10 text-red-500 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-12 lg:col-span-8 space-y-10">
                        <div className="bg-white rounded-[2rem] border border-on_surface/5 shadow-soft overflow-hidden">
                            <div className="bg-surface_high px-10 py-6 border-b border-on_surface/5 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">person</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Basic Profile</span>
                            </div>
                            <div className="p-10 space-y-12">
                                <div className="space-y-4">
                                    <p className="text-xs font-bold uppercase tracking-wider text-primary">About our mission</p>
                                    {isEditing ? (
                                        <textarea
                                            value={editData.about}
                                            onChange={(e) => setEditData({...editData, about: e.target.value})}
                                            className="w-full min-h-[160px] p-6 bg-surface_high border-2 border-transparent focus:border-primary/20 rounded-2xl text-sm font-medium outline-none transition-all shadow-inner"
                                            placeholder="Tell volunteers about your work and mission..."
                                        />
                                    ) : (
                                        <p className="text-base font-medium text-on_surface_variant leading-relaxed opacity-70">
                                            {org?.about || "Add a description to tell volunteers about your organization's work."}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-8 border-t border-on_surface/5">
                                    <div className="space-y-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Website Link</p>
                                        {isEditing ? (
                                            <input 
                                                value={editData.website_url}
                                                onChange={(e) => setEditData({...editData, website_url: e.target.value})}
                                                className="w-full p-4 bg-surface_high border-2 border-transparent focus:border-primary/20 rounded-xl text-sm font-bold outline-none"
                                                placeholder="https://yourwebsite.org"
                                            />
                                        ) : (
                                            <a href={formatExternalUrl(org?.website_url)} target="_blank" rel="noreferrer" className="text-sm font-bold text-primary hover:underline flex items-center gap-2">
                                                <span className="material-symbols-outlined text-xs">link</span>
                                                {org?.website_url || "Not added yet"}
                                            </a>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Registration Type</p>
                                        {isEditing ? (
                                            <select 
                                                value={editData.ngo_type}
                                                onChange={(e) => setEditData({...editData, ngo_type: e.target.value})}
                                                className="w-full p-4 bg-surface_high border-2 border-transparent focus:border-primary/20 rounded-xl text-sm font-bold outline-none appearance-none"
                                            >
                                                <option value="TRUST">Trust</option>
                                                <option value="SOCIETY">Society</option>
                                                <option value="SECTION_8">Section 8 Company</option>
                                            </select>
                                        ) : (
                                            <p className="text-sm font-bold text-on_surface uppercase tracking-wider">{org?.ngo_type || "N/A"}</p>
                                        )}
                                    </div>

                                    <div className="space-y-4 md:col-span-2">
                                        <p className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Office Address</p>
                                        {isEditing ? (
                                            <input 
                                                type="text"
                                                value={editData.office_address}
                                                onChange={(e) => setEditData({...editData, office_address: e.target.value})}
                                                className="w-full p-4 bg-surface_high border-2 border-transparent focus:border-primary/20 rounded-xl text-sm font-bold outline-none"
                                                placeholder="Full street address, city, and state"
                                            />
                                        ) : (
                                            <p className="text-sm font-medium text-on_surface leading-relaxed uppercase tracking-wider">
                                                {org?.office_address || "No address provided"}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-10">
                        <div className="bg-white rounded-[2.5rem] border border-on_surface/5 shadow-soft p-10 space-y-8">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary">description</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Official Info</span>
                            </div>

                            <div className="space-y-2 p-4 bg-surface_high rounded-xl">
                                <p className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Contact Phone</p>
                                {isEditing ? (
                                    <input 
                                        type="tel"
                                        value={editData.contact_phone}
                                        onChange={(e) => setEditData({...editData, contact_phone: e.target.value})}
                                        className="w-full p-2 bg-transparent border-b-2 border-primary/20 text-sm font-bold outline-none"
                                    />
                                ) : (
                                    <p className="text-sm font-bold text-on_surface">{org?.contact_phone}</p>
                                )}
                            </div>

                            <div className="space-y-1 px-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Email Address</p>
                                <p className="text-sm font-medium text-on_surface/60">{org?.contact_email}</p>
                            </div>

                            <div className="space-y-1 px-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Reg Number</p>
                                <p className="text-sm font-medium text-on_surface/60 font-mono tracking-wider">{org?.registration_number}</p>
                            </div>

                            <div className="space-y-1 px-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">PAN Number</p>
                                <p className="text-sm font-medium text-on_surface font-mono tracking-wider">{org?.pan_number}</p>
                            </div>

                            <div className="space-y-1 px-4">
                                <p className="text-xs font-bold uppercase tracking-wider text-on_surface_variant/60">Darpan ID</p>
                                <p className="text-sm font-medium text-on_surface/60">{org?.ngo_darpan_id || "Not available"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="max-w-4xl mx-auto pb-20 font-outfit">
            {/* Header */}
            <div className="max-w-4xl mx-auto py-12">
                <header className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-[1.5rem] text-primary mb-6 animate-bounce">
                        <span className="material-symbols-outlined text-4xl">rocket_launch</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black text-on_surface tracking-tighter leading-[0.9]">Organization Setup</h1>
                    <p className="text-on_surface_variant mt-2 font-medium opacity-60 italic">Complete these simple steps to activate your NGO presence.</p>
                </header>
                
                {/* Progress Bar */}
                <div className="mt-8 flex items-center justify-center gap-2">
                    {Object.values(STEPS).map(s => (
                        <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-12 bg-primary shadow-sm shadow-primary/20' : 'w-4 bg-on_surface/10'}`} />
                    ))}
                </div>
            </div>

            {/* Wizard Content */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-on_surface/5 shadow-soft relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {step === STEPS.BASIC && (
                        <motion.div key="basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">1</span>
                                NGO Fundamentals
                            </h2>
                            <ActionInput label="Organization Legal Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="Helping Hands Foundation" />
                            <div className="grid grid-cols-2 gap-6">
                                <ActionInput label="Contact Email" type="email" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="admin@org.org" />
                                <ActionInput label="Contact Phone" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="+91..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on_surface_variant/40 ml-4">NGO Type</label>
                                <select 
                                    className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none rounded-2xl appearance-none"
                                    value={formData.ngo_type}
                                    onChange={e => setFormData({...formData, ngo_type: e.target.value})}
                                >
                                    <option value="TRUST">Trust</option>
                                    <option value="SOCIETY">Society</option>
                                    <option value="SECTION_8">Section 8 Company</option>
                                </select>
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.LEGAL && (
                        <motion.div key="legal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">2</span>
                                Legal Identity
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <ActionInput label="Registration Number" value={formData.registration_number} onChange={v => setFormData({...formData, registration_number: v})} placeholder="REG/..." />
                                <ActionInput label="NGO PAN Number" value={formData.pan_number} onChange={v => setFormData({...formData, pan_number: v})} placeholder="ABCDE1234F" />
                            </div>
                            <ActionInput label="NGO Darpan ID" value={formData.ngo_darpan_id} onChange={v => setFormData({...formData, ngo_darpan_id: v})} placeholder="KA/..." />
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on_surface_variant/40 ml-4">Registered Office Address</label>
                                <textarea 
                                    className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 focus:outline-none rounded-2xl min-h-[100px]"
                                    value={formData.office_address}
                                    onChange={e => setFormData({...formData, office_address: e.target.value})}
                                    placeholder="Complete address as per registration docs..."
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.ADMIN && (
                        <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">3</span>
                                Admin Verification
                            </h2>
                            <ActionInput label="Admin Personal Phone" value={formData.admin_phone} onChange={v => setFormData({...formData, admin_phone: v})} placeholder="+91..." />
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-on_surface_variant/40 ml-4">ID Proof Type</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-surface_high text-sm font-bold border-2 border-transparent focus:border-primary/20 outline-none rounded-2xl appearance-none"
                                        value={formData.id_proof_type}
                                        onChange={e => setFormData({...formData, id_proof_type: e.target.value})}
                                    >
                                        <option value="AADHAAR">Aadhaar Card</option>
                                        <option value="PAN">PAN Card</option>
                                        <option value="PASSPORT">Passport</option>
                                        <option value="VOTER_ID">Voter ID</option>
                                    </select>
                                </div>
                                <ActionInput label="ID Proof Number" value={formData.id_proof_number} onChange={v => setFormData({...formData, id_proof_number: v})} placeholder="XXXX-XXXX-XXXX" />
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.MANDATORY_DOCS && (
                        <motion.div key="docs-m" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                             <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">4</span>
                                Mandatory Proofs
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UploadCard title="Registration Certificate" type="REG_CERT" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="NGO PAN Card" type="NGO_PAN" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="Type Proof (Deed/Certificate)" type="TYPE_PROOF" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="Admin ID Proof" type="ADMIN_ID" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="Office Address Proof" type="ADD_PROOF" onUpload={handleFileUpload} isMandatory documents={documents} />
                                <UploadCard title="Darpan ID Screenshot" type="DARPAN_PROOF" onUpload={handleFileUpload} isMandatory documents={documents} />
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.OPTIONAL_DOCS && (
                        <motion.div key="docs-o" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                             <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">5</span>
                                High-Trust Documents
                            </h2>
                            <p className="text-xs text-on_surface_variant font-medium -mt-4 bg-primary/5 p-4 rounded-xl border border-primary/10">
                                Optional: These documents increase your trust level and eligibility for corporate funding (CSR).
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <UploadCard title="12A Certificate" type="12A" onUpload={handleFileUpload} isMandatory={false} documents={documents} />
                                <UploadCard title="80G Certificate" type="80G" onUpload={handleFileUpload} isMandatory={false} documents={documents} />
                                <UploadCard title="FCRA Certificate" type="FCRA" onUpload={handleFileUpload} isMandatory={false} documents={documents} />
                                <UploadCard title="Cancelled Cheque" type="CHEQUE" onUpload={handleFileUpload} isMandatory={false} documents={documents} />
                            </div>
                        </motion.div>
                    )}

                    {step === STEPS.REVIEW && (
                        <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                            <h2 className="text-2xl font-black text-on_surface mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg font-black">6</span>
                                Final Review
                            </h2>
                            <div className="p-6 bg-surface_high rounded-2xl border border-on_surface/5 space-y-4">
                                <div className="flex justify-between items-center bg-white p-4 rounded-xl">
                                    <span className="text-[10px] font-black text-on_surface_variant uppercase tracking-widest">Organization</span>
                                    <span className="text-sm font-black text-on_surface">{formData.name}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-4 rounded-xl">
                                    <span className="text-[10px] font-black text-on_surface_variant uppercase tracking-widest">Reg #</span>
                                    <span className="text-sm font-black text-on_surface font-mono">{formData.registration_number}</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-4 rounded-xl">
                                    <span className="text-[10px] font-black text-on_surface_variant uppercase tracking-widest">Documents Uploaded</span>
                                    <span className="text-sm font-black text-primary">{documents.length} Files</span>
                                </div>
                            </div>
                            
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-4">
                                <span className="material-symbols-outlined text-amber-600">report</span>
                                <p className="text-xs font-medium text-amber-800 leading-relaxed italic">
                                    By submitting, you declare that all information and documents provided are genuine. 
                                    Any mismatch found during manual verification may lead to account suspension.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer Actions */}
                <div className="mt-12 pt-8 border-t border-on_surface/5 flex justify-between items-center">
                    <button 
                        disabled={step === 1 || saving}
                        onClick={() => setStep(step - 1)}
                        className="px-8 py-3 text-[11px] font-black uppercase tracking-widest text-on_surface_variant hover:text-primary transition-colors disabled:opacity-30 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Back
                    </button>

                    {step < STEPS.REVIEW ? (
                        <button 
                            disabled={saving}
                            onClick={handleNextStep}
                            className="px-10 py-4 bg-primary text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            Continue
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                    ) : (
                        <button 
                            disabled={saving}
                            onClick={handleFinalSubmit}
                            className="px-12 py-4 bg-primaryGradient text-white text-[11px] font-black uppercase tracking-widest rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        >
                            {saving ? "Processing..." : "Submit for Verification"}
                            <span className="material-symbols-outlined text-[18px]">verified</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const InfoCard = ({ label, value }) => (
    <div className="space-y-1">
        <span className="text-[9px] font-black uppercase tracking-widest text-on_surface_variant/50 ml-1">{label}</span>
        <div className="bg-surface_high p-4 rounded-2xl font-bold text-sm text-on_surface border border-on_surface/5 shadow-sm">
            {value}
        </div>
    </div>
);

const UploadCard = ({ title, type, onUpload, isMandatory, documents }) => {
    const doc = documents.find(d => d.type === type);
    return (
        <div className={`p-5 rounded-2xl border-2 transition-all group ${doc ? 'bg-green-50/50 border-green-200' : 'bg-surface_high border-dashed border-on_surface/10 hover:border-primary/30'}`}>
            <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                    <h4 className="text-xs font-black text-on_surface uppercase">{title}</h4>
                    {isMandatory && !doc && <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter">Required*</span>}
                    {doc && <span className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">check_circle</span> Uploaded</span>}
                </div>
                {doc && (
                    <a href={doc.url} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-on_surface_variant hover:text-primary transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-sm">visibility</span>
                    </a>
                )}
            </div>
            
            <label className={`
                w-full py-4 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all
                ${doc ? 'bg-white/80' : 'bg-white group-hover:bg-primary/5'}
            `}>
                <span className={`material-symbols-outlined text-sm ${doc ? 'text-green-500' : 'text-on_surface_variant opacity-50 group-hover:text-primary group-hover:opacity-100'}`}>
                    {doc ? 'published_with_changes' : 'cloud_upload'}
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">
                    {doc ? 'Change File' : 'Upload Proof'}
                </span>
                <input type="file" className="hidden" onChange={e => onUpload(e, type, isMandatory)} accept=".pdf,image/*" />
            </label>
        </div>
    );
};

export default OrgIdentityPage;
