import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ShoppingCart, X, MapPin, LogOut, CheckCircle, AlertCircle, 
  ArrowLeft, User, Mail, Phone, Home 
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ full_name: '', contact: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [profilePicture, setProfilePicture] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (!token || !savedUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(savedUser);
    setUser(userData);
    setProfileForm({
      full_name: userData.full_name || '',
      contact: userData.contact || '',
      address: userData.address || ''
    });
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('full_name', profileForm.full_name);
      formData.append('contact', profileForm.contact);
      formData.append('address', profileForm.address);
      if (profilePicture) formData.append('profile_picture', profilePicture);

      const res = await fetch(`https://food-ordering-wq61.onrender.com/api/user/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setNotification({ show: true, message: 'Profile updated successfully', type: 'success' });
    } catch (err) {
      setNotification({ show: true, message: err.message, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      <button onClick={() => navigate('/menu')}><ArrowLeft /> Back to Menu</button>
      <form onSubmit={handleProfileUpdate}>
        <h2>Edit Profile</h2>
        <input 
          type="text" 
          value={profileForm.full_name} 
          onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})} 
        />
        <input 
          type="file" 
          onChange={(e) => setProfilePicture(e.target.files[0])} 
        />
        <button type="submit" disabled={isSubmitting}>Update Profile</button>
      </form>
    </div>
  );
};

export default Profile;