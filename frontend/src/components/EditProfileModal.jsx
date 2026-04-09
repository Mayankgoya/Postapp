import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    skills: user.skills || '',
    profilePicture: user.profilePicture || '',
    imageFile: null
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      setFormData({ ...formData, imageFile: e.target.files[0], profilePicture: '' });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    data.append('name', formData.name);
    data.append('bio', formData.bio);
    data.append('skills', formData.skills);
    
    if (formData.imageFile) {
      data.append('image', formData.imageFile);
    }

    try {
      let res;
      if (formData.imageFile) {
        res = await api.put('/users/me', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.put('/users/me', {
          name: formData.name,
          bio: formData.bio,
          skills: formData.skills,
          profilePicture: formData.profilePicture
        });
      }
      onUpdate(res.data);
      onClose();
    } catch (err) {
      console.error("Failed to update profile", err);
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Edit Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" name="name" value={formData.name} onChange={handleChange} required
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea 
              name="bio" value={formData.bio} onChange={handleChange} rows="3"
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Tell us about yourself..."
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
            <input 
              type="text" name="skills" value={formData.skills} onChange={handleChange}
              className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="React, Java, Design..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <div className="space-y-3">
              <input 
                type="file" accept="image/*" onChange={handleChange}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              <div className="flex items-center gap-4 text-gray-400">
                <hr className="flex-1" /> <span className="text-[10px] font-bold">OR</span> <hr className="flex-1" />
              </div>
              <input 
                type="text" name="profilePicture" value={formData.profilePicture} onChange={handleChange}
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                placeholder="Paste Image URL..."
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" disabled={loading}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
