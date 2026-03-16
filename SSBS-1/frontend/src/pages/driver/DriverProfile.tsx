// @ts-nocheck
import { useState } from 'react';
import { Camera, Save, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SnakeCard } from '../../components/ui/SnakeCard';

const DriverProfile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.username || '',
    email: user?.email || '',
    phone: '',
    licenseNumber: '',
    yearsOfExperience: 0,
    assignedBus: '—',
    assignedRoute: '—',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Profile updated successfully!');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswords({ current: '', newPass: '', confirm: '' });
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-300';

  const readOnlyClass = `${inputClass} bg-slate-50 text-slate-400 cursor-not-allowed`;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Avatar section */}
      <SnakeCard index={0}>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(user?.username || 'Driver')}&backgroundColor=c0aede&top=shortHair`}
              alt={user?.username || 'Driver'}
              className="w-20 h-20 rounded-full bg-slate-200"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center border-2 border-white shadow-lg hover:bg-primary-700 transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-lg font-bold text-primary-900">{user?.username || 'Driver'}</h2>
            <p className="text-sm text-slate-400">{user?.email || ''}</p>
            <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-600 border border-sky-200">
              Driver
            </span>
          </div>
        </div>
      </div>
      </SnakeCard>

      {/* Profile form */}
      <SnakeCard index={1}>
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h3 className="text-sm font-bold text-primary-900">Personal Information</h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
            <input type="email" value={form.email} disabled className={readOnlyClass} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+212 6 00 00 00 00"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">License Number</label>
            <input
              type="text"
              value={form.licenseNumber}
              onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1.5">Years of Experience</label>
          <input
            type="number"
            value={form.yearsOfExperience}
            onChange={(e) => setForm({ ...form, yearsOfExperience: Number(e.target.value) })}
            min={0}
            className={inputClass}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Assigned Bus <span className="text-slate-300">(set by admin)</span>
            </label>
            <input type="text" value={form.assignedBus} disabled className={readOnlyClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              Assigned Route <span className="text-slate-300">(set by admin)</span>
            </label>
            <input type="text" value={form.assignedRoute} disabled className={readOnlyClass} />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </form>
      </SnakeCard>

      {/* Change password */}
      <SnakeCard index={2}>
      <form onSubmit={handlePasswordChange} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h3 className="text-sm font-bold text-primary-900">Change Password</h3>

        {(['current', 'newPass', 'confirm'] as const).map((field) => {
          const labels = {
            current: 'Current Password',
            newPass: 'New Password',
            confirm: 'Confirm New Password',
          };
          return (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">{labels[field]}</label>
              <div className="relative">
                <input
                  type={showPasswords[field] ? 'text' : 'password'}
                  value={passwords[field]}
                  onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPasswords[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-[0.98]"
          >
            Update Password
          </button>
        </div>
      </form>
      </SnakeCard>
    </div>
  );
};

export default DriverProfile;
