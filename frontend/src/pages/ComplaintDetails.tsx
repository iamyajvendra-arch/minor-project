import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Complaint } from '../types';
import { getStatusBadgeClass, getPriorityBadgeClass, getCategoryLabel, haptics } from '../utils';
import {
  FileText,
  MapPin,
  Clock,
  CheckCircle,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  Star,
  Send,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const ComplaintDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);

  // Status Update state for Admin/Department
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);

  // Feedback State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data);
      setNewStatus(res.data.status);
    } catch {
      toast.error('Failed to load complaint details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!complaint) return;
    setUpdating(true);
    try {
      const res = await api.patch(`/complaints/${complaint.id}`, {
        status: newStatus,
        note: statusNote || `Status updated to ${newStatus}`,
      });
      setComplaint(res.data);
      haptics.success();
      toast.success('Complaint status updated successfully!');
      setStatusNote('');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!complaint) return;
    try {
      await api.post(`/complaints/${complaint.complaint_id}/feedback`, {
        rating,
        comment,
      });
      haptics.success();
      toast.success('Thank you for rating municipal resolution!');
      setFeedbackSubmitted(true);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to record rating');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
        <Header />
        <div className="p-8 text-center text-xs text-[#64748B]">Loading complaint details...</div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
        <Header />
        <div className="p-8 text-center text-xs text-[#64748B]">Complaint not found.</div>
      </div>
    );
  }

  const isStaff = user?.role === 'admin' || user?.role === 'department';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#F4F6F9]">
      <Header />

      <main className="p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Top Breadcrumb & Action */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#1E293B] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to List
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#64748B]">{complaint.complaint_id}</span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full capitalize font-semibold ${getStatusBadgeClass(complaint.status)}`}>
              {complaint.status.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Complaint Main Card */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs space-y-5">
          <div>
            <span className="text-[11px] font-semibold text-[#005A9C] uppercase tracking-wider">
              {getCategoryLabel(complaint.category)}
            </span>
            <h1 className="text-lg font-bold text-[#1E293B] mt-1">{complaint.title}</h1>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed whitespace-pre-line">
              {complaint.description}
            </p>
          </div>

          {/* Evidence Photos */}
          {complaint.image_urls && complaint.image_urls.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#1E293B] mb-2">Photographic Evidence</h3>
              <div className="flex flex-wrap gap-3">
                {complaint.image_urls.map((img, i) => (
                  <a key={i} href={img} target="_blank" rel="noreferrer" className="block w-28 h-24 rounded-xl overflow-hidden border border-[#E2E8F0] hover:opacity-90">
                    <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F4F6F9] border border-[#E2E8F0] text-xs">
            <div>
              <span className="text-[10px] text-[#64748B] block">Priority Tier</span>
              <span className={`font-semibold capitalize ${getPriorityBadgeClass(complaint.priority)} px-1.5 py-0.5 rounded-xs mt-0.5 inline-block`}>
                {complaint.priority}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#64748B] block">Assigned Department</span>
              <span className="font-semibold text-[#1E293B] mt-0.5 block">
                {complaint.department?.name || 'Municipal Admin'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#64748B] block">Location Jurisdiction</span>
              <span className="font-semibold text-[#1E293B] mt-0.5 block truncate">
                {complaint.city || 'India'}, {complaint.state}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#64748B] block">SLA Deadline</span>
              <span className="font-semibold text-[#1E293B] mt-0.5 block">
                {complaint.deadline ? new Date(complaint.deadline).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>

          {/* Duplicate Linked notice if any */}
          {complaint.is_duplicate && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#F1A23A]" />
              <span>
                <strong>Duplicate Cluster:</strong> This grievance is linked with related reports in the same
                vicinity to prevent duplicated municipal dispatch.
              </span>
            </div>
          )}
        </div>

        {/* Staff Management Console (Admin / Dept) */}
        {isStaff && (
          <div className="bg-white p-6 rounded-2xl border border-[#EBF3FA] shadow-cs space-y-4">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#005A9C]" /> Departmental Resolution Console
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#005A9C]"
                >
                  <option value="submitted">Submitted</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="escalated">Escalated</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">Action Note / Resolution Summary</label>
                <input
                  type="text"
                  placeholder="e.g., Road repair crew dispatched, asphalt filled"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-xs text-[#1E293B] focus:outline-none focus:border-[#005A9C]"
                />
              </div>
            </div>

            <button
              disabled={updating}
              onClick={handleStatusUpdate}
              className="bg-[#005A9C] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-[#004780] transition-all disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Save Status Update & Notify Citizen'}
            </button>
          </div>
        )}

        {/* Resolution Timeline */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs space-y-4">
          <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#005A9C]" /> Resolution Audit Trail
          </h3>

          <div className="space-y-4 border-l-2 border-[#EBF3FA] ml-3 pl-4">
            {complaint.history && complaint.history.length > 0 ? (
              complaint.history.map((h, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-[#005A9C] border-2 border-white" />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1E293B] capitalize">
                      {h.new_status.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      {h.created_at ? new Date(h.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                  {h.note && <p className="text-xs text-[#64748B] mt-0.5">{h.note}</p>}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#64748B]">Initial submission recorded.</p>
            )}
          </div>
        </div>

        {/* Citizen Feedback Rating if Resolved */}
        {complaint.status === 'resolved' && user?.role === 'citizen' && !feedbackSubmitted && (
          <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-cs space-y-4">
            <h3 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
              <Star className="w-4 h-4 text-[#F1A23A]" /> Rate the Municipal Resolution
            </h3>
            <p className="text-xs text-[#64748B]">
              Was your grievance resolved satisfactorily by the assigned department?
            </p>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className={`text-lg p-1 transition-all ${
                    s <= rating ? 'text-[#F1A23A]' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs font-bold text-[#1E293B] ml-2">{rating} out of 5</span>
            </div>

            <textarea
              rows={2}
              placeholder="Optional remarks about the work quality..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full bg-[#F4F6F9] border border-[#E2E8F0] rounded-xl p-3 text-xs text-[#1E293B] focus:outline-none focus:border-[#005A9C]"
            />

            <button
              onClick={handleFeedbackSubmit}
              className="bg-[#239B69] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-all"
            >
              Submit Rating
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
