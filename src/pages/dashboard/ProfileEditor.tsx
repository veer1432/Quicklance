import React, { useState } from 'react';
import { 
  Save, 
  Plus, 
  Trash2, 
  Award, 
  Briefcase, 
  GraduationCap, 
  CheckCircle2,
  AlertCircle,
  Zap,
  ZapOff,
  FileText,
  Upload,
  Info
} from 'lucide-react';
import { useFirebase } from '@/src/contexts/FirebaseContext';
import { useCurrency } from '@/src/contexts/CurrencyContext';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { CATEGORIES, Experience, Certificate } from '@/src/types';

export default function ProfileEditor() {
  const { profile, updateProfile, user, uploadFile } = useFirebase();
  const { currency, formatPrice } = useCurrency();
  const [isSaving, setIsSaving] = useState(false);
  const [fileUploading, setFileUploading] = useState<number | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  
  const isExpert = profile?.role === 'expert';
  const isClient = profile?.role === 'client';

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || '',
    photoURL: profile?.photoURL || '',
    bio: profile?.bio || '',
    hourlyRate: profile?.hourlyRate || 250,
    role: profile?.role || 'client',
    skills: profile?.skills || [],
    experience: profile?.experience || [],
    certificates: profile?.certificates || [],
    isAvailable: profile?.isAvailable !== false,
    phoneNumber: profile?.phoneNumber || '',
    isFresher: profile?.isFresher || false,
    declarationAccepted: profile?.declarationAccepted || false,
  });

  const [newSkill, setNewSkill] = useState('');

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploadingPhoto(true);
      try {
        const path = `users/${user.uid}/profile_${Date.now()}_${file.name}`;
        const url = await uploadFile(file, path);
        setFormData({ ...formData, photoURL: url } as any);
      } catch (err) {
        console.error("Photo upload error:", err);
        alert("Failed to upload photo.");
      } finally {
        setIsUploadingPhoto(false);
      }
    }
  };

  const handleSave = async () => {
    if (isExpert && !formData.declarationAccepted) {
      alert("Please accept the declaration before saving.");
      return;
    }
    setIsSaving(true);
    try {
      const updateData: any = {
        ...formData,
      };

      // If previously rejected, set back to pending for review
      if (profile?.status === 'rejected' && profile?.role === 'expert') {
        updateData.status = 'pending';
      }

      await updateProfile(updateData);
      alert(profile?.status === 'rejected' ? 'Profile resubmitted for review!' : 'Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = (skill: string) => {
    const s = skill.trim();
    if (s && !formData.skills.includes(s)) {
      setFormData({ ...formData, skills: [...formData.skills, s] });
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({ ...formData, skills: formData.skills.filter(s => s !== skill) });
  };

  const addExperience = () => {
    const newExp: Experience = { company: '', role: '', duration: '', description: '' };
    setFormData({ ...formData, experience: [...formData.experience, newExp] });
  };

  const updateExperience = (idx: number, data: Partial<Experience>) => {
    const newExp = [...formData.experience];
    newExp[idx] = { ...newExp[idx], ...data };
    setFormData({ ...formData, experience: newExp });
  };

  const removeExperience = (idx: number) => {
    setFormData({ ...formData, experience: formData.experience.filter((_, i) => i !== idx) });
  };

  const addCertificate = () => {
    const newCert: Certificate = { name: '', issuer: '', year: '', type: 'certificate' };
    setFormData({ ...formData, certificates: [...formData.certificates, newCert] });
  };

  const updateCertificate = (idx: number, data: Partial<Certificate>) => {
    const newCerts = [...formData.certificates];
    newCerts[idx] = { ...newCerts[idx], ...data };
    setFormData({ ...formData, certificates: newCerts });
  };

  const removeCertificate = (idx: number) => {
    setFormData({ ...formData, certificates: formData.certificates.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-12 transition-colors duration-300">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100">
            {isExpert ? 'Expert Profile' : 'My Profile'}
          </h1>
          <p className="mt-2 text-lg text-gray-500 dark:text-gray-400 font-medium">
            {isExpert 
              ? 'Manage your professional identity on Quiklance.' 
              : 'Manage your personal information and preferences.'}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-blue-200 dark:shadow-blue-900/40">
          {isSaving ? 'Saving...' : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {profile?.status === 'rejected' ? 'Resubmit for Review' : 'Save Changes'}
            </>
          )}
        </Button>
      </header>

      {profile?.status === 'rejected' && (
        <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-900/40">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900 dark:text-red-100">Profile Rejected</h3>
              <p className="mt-1 text-red-700 dark:text-red-300 font-medium leading-relaxed">
                Your application was rejected by the admin. Please address the following remarks and resubmit your profile:
              </p>
              <div className="mt-3 p-4 bg-white dark:bg-gray-950 rounded-xl border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 font-bold italic">
                "{profile.rejectionRemarks || 'No specific reason provided.'}"
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-10 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Basic Information
            </h2>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group">
                <div className="h-32 w-32 rounded-3xl bg-gray-100 dark:bg-gray-800 overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl">
                  {formData.photoURL ? (
                    <img src={formData.photoURL} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <Upload className="h-8 w-8" />
                    </div>
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Plus className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => document.getElementById('photo-upload')?.click()}
                  className="absolute -bottom-2 -right-2 h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                </button>
                <input 
                  type="file" 
                  id="photo-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>

              <div className="flex-1 w-full grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mobile Number</label>
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="10-digit mobile number"
                    className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {profile?.role === 'expert' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Session Rate ({currency.symbol} per 30 min)</label>
                <input 
                  type="number" 
                  min={250}
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: Math.max(250, Number(e.target.value)) })}
                  className="h-14 w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-6 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
                />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Minimum standard rate is {formatPrice(250)} per 30 minutes.</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {isExpert ? 'Professional Bio' : 'About Me'}
              </label>
              <textarea 
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={isExpert 
                  ? "Describe your expertise and how you can help clients..." 
                  : "Tell us a bit about yourself..."}
                className="w-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 p-6 font-medium text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none transition-all"
              />
            </div>
          </Card>

          {profile?.role === 'expert' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Are you a Fresher?</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle this if you don't have prior work experience.</p>
                </div>
                <button
                  onClick={() => setFormData({ ...formData, isFresher: !formData.isFresher, experience: !formData.isFresher ? [] : formData.experience })}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.isFresher ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out ${
                      formData.isFresher ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {!formData.isFresher && (
                <Card className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                      <Briefcase className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      Work Experience
                    </h2>
                    <Button variant="outline" size="sm" onClick={addExperience}>
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-6">
                    {formData.experience.map((exp, idx) => (
                      <div key={idx} className="relative rounded-3xl bg-gray-50 dark:bg-gray-900/50 p-8 space-y-4 border border-gray-100 dark:border-gray-800">
                        <button 
                          onClick={() => removeExperience(idx)}
                          className="absolute right-6 top-6 text-gray-400 dark:text-gray-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <input 
                            placeholder="Company Name"
                            value={exp.company}
                            onChange={(e) => updateExperience(idx, { company: e.target.value })}
                            className="h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          />
                          <input 
                            placeholder="Role"
                            value={exp.role}
                            onChange={(e) => updateExperience(idx, { role: e.target.value })}
                            className="h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <input 
                            placeholder="Duration (e.g. 2020 - 2023)"
                            value={exp.duration}
                            onChange={(e) => updateExperience(idx, { duration: e.target.value })}
                            className="h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <textarea 
                          placeholder="Description of your work..."
                          value={exp.description}
                          onChange={(e) => updateExperience(idx, { description: e.target.value })}
                          className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4 font-medium text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                    ))}
                    {formData.experience.length === 0 && (
                      <p className="text-center py-8 text-gray-400 dark:text-gray-600 font-medium italic">No experience added yet.</p>
                    )}
                  </div>
                </Card>
              )}

              {/* Documents & Proof */}
              <Card className="p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    {formData.isFresher ? 'Certificates & Proof' : 'Experience Proof & Certificates'}
                  </h2>
                  <Button variant="outline" size="sm" onClick={addCertificate}>
                    <Plus className="mr-1 h-4 w-4" />
                    Add Document
                  </Button>
                </div>

                <div className="space-y-6">
                  {formData.certificates.map((cert, idx) => (
                    <div key={idx} className="relative rounded-3xl bg-gray-50 dark:bg-gray-900/50 p-8 space-y-4 border border-gray-100 dark:border-gray-800">
                      <button 
                        onClick={() => removeCertificate(idx)}
                        className="absolute right-6 top-6 text-gray-400 dark:text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Document Type</label>
                          <select
                            value={cert.type}
                            onChange={(e) => updateCertificate(idx, { type: e.target.value as any })}
                            className="h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          >
                            <option value="certificate">Certificate</option>
                            {!formData.isFresher && (
                              <>
                                <option value="experience">Experience Letter</option>
                                <option value="offer-letter">Offer Letter</option>
                                <option value="appraisal">Appraisal Letter</option>
                                <option value="salary-slip">Salary Slip</option>
                                <option value="bank-statement">Bank Statement (with Employer Name)</option>
                              </>
                            )}
                            <option value="other">Other Proof</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Document Name / Title</label>
                          <input 
                            placeholder="e.g. AWS Certified Developer"
                            value={cert.name}
                            onChange={(e) => updateCertificate(idx, { name: e.target.value })}
                            className="h-12 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {!formData.isFresher && (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <input 
                            placeholder="Issuing Organization"
                            value={cert.issuer}
                            onChange={(e) => updateCertificate(idx, { issuer: e.target.value })}
                            className="h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          />
                          <input 
                            placeholder="Year"
                            value={cert.year}
                            onChange={(e) => updateCertificate(idx, { year: e.target.value })}
                            className="h-12 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 font-bold text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      )}

                      <div className="pt-2">
                        <div className="flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
                          <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                            {fileUploading === idx ? <Plus className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                              {cert.fileName || 'Upload Document Proof'}
                            </p>
                            <p className="text-xs text-gray-500">PDF, JPG or PNG (Max 5MB)</p>
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            id={`file-${idx}`}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file && user) {
                                setFileUploading(idx);
                                try {
                                  const path = `experts/${user.uid}/documents/${Date.now()}_${file.name}`;
                                  const url = await uploadFile(file, path);
                                  updateCertificate(idx, { fileName: file.name, fileUrl: url });
                                } catch (err) {
                                  console.error("Upload error:", err);
                                  alert("Failed to upload file.");
                                } finally {
                                  setFileUploading(null);
                                }
                              }
                            }}
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            disabled={fileUploading === idx}
                            onClick={() => document.getElementById(`file-${idx}`)?.click()}
                          >
                            {fileUploading === idx ? 'Uploading...' : 'Choose File'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.certificates.length === 0 && (
                    <p className="text-center py-8 text-gray-400 dark:text-gray-600 font-medium italic">No documents added yet.</p>
                  )}
                </div>
              </Card>

              {/* Declaration */}
              <Card className="p-8 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30">
                <div className="flex items-start gap-4">
                  <div className="h-6 w-6 mt-1">
                    <input 
                      type="checkbox"
                      checked={formData.declarationAccepted}
                      onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100">Declaration</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      I hereby declare that all the information provided above is true to the best of my knowledge and belief. I understand that any false information may lead to the rejection of my profile or suspension of my account.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar: Skills & Availability */}
        <div className="space-y-8">
          {profile?.role === 'expert' && (
            <>
              <Card className={`p-8 space-y-6 border-2 transition-all ${
                formData.isAvailable 
                  ? 'border-green-100 dark:border-green-900/30 bg-green-50/30 dark:bg-green-900/10' 
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/10'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Availability</h2>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    formData.isAvailable ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600'
                  }`}>
                    {formData.isAvailable ? <Zap className="h-5 w-5 fill-green-600 dark:fill-green-400" /> : <ZapOff className="h-5 w-5" />}
                  </div>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  When enabled, clients can see you as "Available Now" and start instant video calls.
                </p>

                <button
                  onClick={() => setFormData({ ...formData, isAvailable: !formData.isAvailable })}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    formData.isAvailable ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white dark:bg-gray-200 shadow ring-0 transition duration-200 ease-in-out ${
                      formData.isAvailable ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${formData.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-600'}`}>
                    {formData.isAvailable ? 'Currently Available' : 'Currently Offline'}
                  </span>
                </div>
              </Card>

              <Card className="p-8 space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Technical Skills</h2>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Add custom skill or software..."
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSkill(newSkill)}
                      className="h-10 flex-grow rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 px-4 text-sm font-medium text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none"
                    />
                    <Button size="sm" onClick={() => addSkill(newSkill)}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map(skill => (
                      <span key={skill} className="flex items-center gap-1 rounded-xl bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
                        {skill}
                        <button onClick={() => removeSkill(skill)} className="hover:text-blue-800 dark:hover:text-blue-200">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Add from categories</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => addSkill(cat)}
                        className="rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <Card className="p-8 bg-gray-900 dark:bg-gray-800 text-white">
                <CheckCircle2 className="h-10 w-10 mb-4 text-green-400 dark:text-green-500" />
                <h3 className="text-xl font-bold mb-2">Profile Strength</h3>
                <div className="h-2 w-full bg-gray-800 dark:bg-gray-700 rounded-full mb-4">
                  <div className="h-full bg-green-400 dark:bg-green-500 rounded-full" style={{ width: '85%' }} />
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-400 leading-relaxed">
                  Your profile is looking great! Adding more certificates can increase your credibility by 25%.
                </p>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
