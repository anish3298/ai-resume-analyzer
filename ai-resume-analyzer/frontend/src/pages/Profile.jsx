import { useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.profile?.phone || '',
    targetRole: user?.profile?.targetRole || '',
  });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await userAPI.updateProfile(form);
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSavingPassword(true);
    try {
      await userAPI.changePassword(passwordForm);
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      <form onSubmit={handleProfileSubmit} className="card space-y-4">
        <h2 className="font-semibold">Personal Information</h2>
        <input
          type="text"
          placeholder="Full name"
          className="input-field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone number"
          className="input-field"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <input
          type="text"
          placeholder="Target job role (e.g. Backend Developer)"
          className="input-field"
          value={form.targetRole}
          onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
        />
        <button type="submit" disabled={savingProfile} className="btn-primary">
          {savingProfile ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4">
        <h2 className="font-semibold">Change Password</h2>
        <input
          type="password"
          placeholder="Current password"
          required
          className="input-field"
          value={passwordForm.currentPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
        />
        <input
          type="password"
          placeholder="New password"
          required
          minLength={6}
          className="input-field"
          value={passwordForm.newPassword}
          onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
        />
        <button type="submit" disabled={savingPassword} className="btn-secondary">
          {savingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
