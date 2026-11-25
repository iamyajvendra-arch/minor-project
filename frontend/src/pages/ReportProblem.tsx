import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Header } from '../components/Header';
import { getCategoryLabel, haptics } from '../utils';
import {
  FileText,
  Upload,
  MapPin,
  CheckCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Navigation,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ReportProblem: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('road_pothole');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Geospatial State
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [ward, setWard] = useState('');

  // States & Districts lists loaded from backend
  const [statesList, setStatesList] = useState<{ name: string; code: string }[]>([]);
  const [districtsList, setDistrictsList] = useState<{ id: number; name: string }[]>([]);
  const [citiesList, setCitiesList] = useState<{ id: number; name: string; type: string }[]>([]);

  // AI Assistant Suggestion state
  const [aiSuggestion, setAiSuggestion] = useState<any>(null);
  const [aiSeverity, setAiSeverity] = useState<any>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // 1. Load All 36 States and UTs on mount
  useEffect(() => {
    api.get('/geo/states')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setStatesList(res.data);
          if (!state && res.data.length > 0) {
            setState(res.data[0].name);
          }
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // 2. Cascade load Districts whenever state changes
  useEffect(() => {
    if (state) {
      api.get(`/geo/districts?state=${encodeURIComponent(state)}`)
        .then((res) => {
          if (Array.isArray(res.data)) {
            setDistrictsList(res.data);
            if (res.data.length > 0) {
              setDistrict(res.data[0].name);
            } else {
              setDistrict('');
            }
          }
        })
        .catch(() => setDistrictsList([]));
    }
  }, [state]);

  // 3. Cascade load Cities whenever district changes
  useEffect(() => {
    if (district) {
      api.get(`/geo/cities?district=${encodeURIComponent(district)}`)
        .then((res) => {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setCitiesList(res.data);
            setCity(res.data[0].name);
          } else {
            setCitiesList([]);
          }
        })
        .catch(() => setCitiesList([]));
    }
  }, [district]);

  // Trigger AI Categorization debounce
  useEffect(() => {
    if (description.length > 15 || title.length > 5) {
      const timer = setTimeout(async () => {
        setAiAnalyzing(true);
        try {
          const res = await api.post('/ai/categorize', { title, description });
          setAiSuggestion(res.data);
          if (res.data.predicted_category) {
            setCategory(res.data.predicted_category);
          }

          // Fetch severity projection
          const sevRes = await api.post('/ai/severity', {
            category: res.data.predicted_category || category,
            description,
            latitude: lat,
            longitude: lng,
          });
          setAiSeverity(sevRes.data);
        } catch {
          // ignore
        } finally {
          setAiAnalyzing(false);
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [title, description]);

  // Image Upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      const previews = files.map((f) => URL.createObjectURL(f));
      setImagePreviews(previews);
    }
  };

  // GPS Geolocation detector
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }
    toast.loading('Acquiring satellite GPS position...', { id: 'gps' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setAddress(`GPS Lat: ${pos.coords.latitude.toFixed(5)}, Lng: ${pos.coords.longitude.toFixed(5)}`);
        toast.success('Accurate GPS coordinates verified!', { id: 'gps' });
        haptics.light();
      },
      (err) => {
        toast.error('Unable to retrieve location: ' + err.message, { id: 'gps' });
      },
      { enableHighAccuracy: true }
    );
  };

  // Submit Handler
  const handleSubmit = async () => {
    if (!title || !description) {
      toast.error('Please fill in title and description');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      if (lat) formData.append('latitude', lat.toString());
      if (lng) formData.append('longitude', lng.toString());
      if (address) formData.append('address', address);
      if (state) formData.append('state', state);
      if (district) formData.append('district', district);
      if (city) formData.append('city', city);
      if (ward) formData.append('ward', ward);

      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      haptics.success();
      toast.success(`Grievance Registered! Token ID: ${res.data.complaint_id}`);
      navigate(`/complaints/${res.data.id}`);
    } catch (err: any) {
      haptics.error();
      toast.error(err.response?.data?.detail || 'Failed to submit grievance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Step Progress Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-gov">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-bold text-[#005A9C] uppercase tracking-wider">
                Official Grievance Registration Form
              </span>
              <h1 className="text-base font-bold text-slate-900">
                Step {step} of 4: {step === 1 ? 'Details' : step === 2 ? 'Evidence' : step === 3 ? 'Geographic Location' : 'Final Review'}
              </h1>
            </div>
            {aiAnalyzing && (
              <span className="flex items-center gap-1.5 text-xs text-[#005A9C] bg-blue-50 border border-blue-200 px-3 py-1 rounded-sm font-semibold animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> AI Classifying...
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-[#005A9C]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#005A9C]" /> 1. Grievance Specifics
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Subject / Title *
              </label>
              <input
                type="text"
                placeholder="e.g., Deep pothole causing two-wheeler accidents near main market junction"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Detailed Grievance Description *
              </label>
              <textarea
                rows={4}
                placeholder="Describe the nature of problem, street name, risk to public safety, and how long the issue has persisted..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Municipal Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C]"
              >
                <option value="road_pothole">Roads &amp; Potholes</option>
                <option value="garbage_sanitation">Garbage &amp; Sanitation</option>
                <option value="water_supply">Water Supply</option>
                <option value="drainage_sewage">Drainage &amp; Sewage</option>
                <option value="electricity_streetlight">Electricity &amp; Streetlight</option>
                <option value="public_infrastructure">Public Infrastructure</option>
                <option value="other">General Civic Matter</option>
              </select>
            </div>

            {/* AI Assistant Pill */}
            {aiSuggestion && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#005A9C]" />
                  <div>
                    <span className="font-semibold text-slate-800">AI Suggested Routing: </span>
                    <span className="font-bold text-[#005A9C]">{getCategoryLabel(aiSuggestion.predicted_category)}</span>
                    <span className="text-slate-500 text-[11px] ml-1">
                      ({Math.round(aiSuggestion.confidence * 100)}% match &bull; Dispatches to{' '}
                      {aiSuggestion.suggested_department})
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (title.length < 5 || description.length < 10) {
                    toast.error('Please enter a descriptive title and problem statement');
                    return;
                  }
                  haptics.light();
                  setStep(2);
                }}
                className="flex items-center gap-2 bg-[#005A9C] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#004780] transition-all shadow-xs"
              >
                <span>Proceed to Evidence</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Evidence */}
        {step === 2 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-4">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#005A9C]" /> 2. Upload Photographic Evidence
            </h2>
            <p className="text-xs text-slate-500">
              Clear site photographs accelerate physical on-site inspection and departmental verification.
            </p>

            <div className="border-2 border-dashed border-slate-300 hover:border-[#005A9C] rounded-xl p-8 text-center cursor-pointer bg-slate-50 transition-all">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-9 h-9 text-[#005A9C] mb-2" />
                <span className="text-xs font-bold text-slate-800">Attach site photos</span>
                <span className="text-[11px] text-slate-500 mt-0.5">JPEG, PNG, WEBP (Max 10MB each)</span>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((url, i) => (
                  <div key={i} className="relative h-24 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                    <img src={url} alt="Proof" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => {
                  haptics.light();
                  setStep(3);
                }}
                className="flex items-center gap-2 bg-[#005A9C] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#004780] transition-all shadow-xs"
              >
                <span>Proceed to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Geographic Location Selection */}
        {step === 3 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#005A9C]" /> 3. India-Wide Administrative Location
              </h2>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="flex items-center gap-1.5 text-xs text-[#005A9C] bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" /> Detect Current GPS
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State / UT Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">State / Union Territory *</label>
                <select
                  value={state}
                  onChange={(e) => {
                    setState(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C]"
                >
                  {statesList.map((st) => (
                    <option key={st.code} value={st.name}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Selector (Cascades from State) */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">District / Revenue Division *</label>
                {districtsList.length > 0 ? (
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C]"
                  >
                    {districtsList.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter district name"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C]"
                  />
                )}
              </div>

              {/* City / Municipality */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">City / Municipal Corporation</label>
                {citiesList.length > 0 ? (
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C]"
                  >
                    {citiesList.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name} ({c.type ? c.type.replace('_', ' ') : 'ULB'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g., Central Zone, Town or City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C]"
                  />
                )}
              </div>

              {/* Ward / Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Ward / Zone (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Ward 45, Zone 3"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Specific Landmark / Address Details
              </label>
              <input
                type="text"
                placeholder="e.g., Near Bus Stand, Opp City Hospital"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#005A9C]"
              />
            </div>

            {lat && lng && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                <span>
                  High-Precision Coordinates: Latitude {lat.toFixed(5)}, Longitude {lng.toFixed(5)}
                </span>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => {
                  haptics.light();
                  setStep(4);
                }}
                className="flex items-center gap-2 bg-[#005A9C] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#004780] transition-all shadow-xs"
              >
                <span>Final Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Review and Submit */}
        {step === 4 && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-gov space-y-5">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" /> 4. Review &amp; Official Submission
            </h2>

            {/* AI Severity Gauge Box */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Automated Civic Severity Score (CSS)
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-3xl font-black text-[#005A9C]">
                    {aiSeverity ? aiSeverity.score : 65}/100
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-900 uppercase">
                      {aiSeverity ? aiSeverity.priority : 'High'} Priority
                    </span>
                    <p className="text-[10px] text-slate-500">
                      Evaluated based on hazard nature, urgency, population impact, and location risk.
                    </p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500">Citizen Charter SLA</span>
                <p className="text-xs font-bold text-slate-800">
                  {aiSeverity?.priority === 'critical' ? '24 Hours Mandate' : '48 Hours Mandate'}
                </p>
              </div>
            </div>

            {/* Summary Data Cards */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Subject:</span>
                <p className="font-semibold text-slate-900">{title}</p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-white">
                <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Description:</span>
                <p className="text-slate-800 leading-relaxed">{description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Assigned Category:</span>
                  <p className="font-semibold text-slate-900">{getCategoryLabel(category)}</p>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-500 text-[10px] uppercase font-bold block mb-0.5">Jurisdiction:</span>
                  <p className="font-semibold text-slate-900">
                    {city || district}, {state}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3">
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 px-4 py-2 text-xs font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>
              <button
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-[#005A9C] text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-[#004780] transition-all disabled:opacity-50 shadow-gov active:scale-95"
              >
                {submitting ? 'Transmitting to Municipal Server...' : 'Submit to Municipal Corporation'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
