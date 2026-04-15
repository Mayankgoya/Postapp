import React, { useState } from 'react';
import { Camera, Save, X } from 'lucide-react';
import api from '../services/api';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import TextArea from './ui/TextArea';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    skills: user.skills || '',
    profilePicture: user.profilePicture || '',
    coverPicture: user.coverPicture || '',
    location: user.location || '',
    imageFile: null,
    coverFile: null
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    if (e.target.type === 'file') {
      if (e.target.name === 'imageFile') {
        setFormData({ ...formData, imageFile: e.target.files[0], profilePicture: '' });
      } else {
        setFormData({ ...formData, coverFile: e.target.files[0], coverPicture: '' });
      }
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
    data.append('location', formData.location);
    
    if (formData.imageFile) {
      data.append('image', formData.imageFile);
    }
    if (formData.coverFile) {
      data.append('cover', formData.coverFile);
    }

    try {
      let res;
      if (formData.imageFile || formData.coverFile) {
        res = await api.put('/users/me', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        res = await api.put('/users/me', {
          name: formData.name,
          bio: formData.bio,
          skills: formData.skills,
          location: formData.location,
          profilePicture: formData.profilePicture,
          coverPicture: formData.coverPicture
        });
      }
      onUpdate(res.data);
      onClose();
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Professional Profile Update"
      maxWidth="max-w-xl"
      footer={
        <>
          <Button onClick={handleSubmit} disabled={loading} loading={loading} className="flex-1" leftIcon={Save}>
            Save Modifications
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Abort
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest pl-1">Full Identity Name</label>
          <Input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required 
            placeholder="Your legal or brand name"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest pl-1">Professional Narrative</label>
          <TextArea 
            name="bio" 
            value={formData.bio} 
            onChange={handleChange} 
            rows="4"
            placeholder="Describe your professional journey and value proposition..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest pl-1">Hard & Soft Skills</label>
          <Input 
            type="text" 
            name="skills" 
            value={formData.skills} 
            onChange={handleChange}
            placeholder="React, Growth Hacking, Distributed Systems..."
          />
          <p className="text-[10px] text-surface-400 font-medium italic mt-1">Separate keywords with commas for optimal indexing.</p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest pl-1">Primary Location</label>
          <Input 
            type="text" 
            name="location" 
            value={formData.location} 
            onChange={handleChange}
            placeholder="Ex: Silicon Valley, CA or Remote"
          />
        </div>

        <div className="space-y-4 pt-2">
          <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest pl-1 flex items-center gap-2">
            <Camera size={14} className="text-brand-600" /> Identity Visualization
          </label>
          <div className="bg-surface-50 border-2 border-dashed border-surface-200 rounded-2xl p-6 transition-all hover:bg-white hover:border-brand-200 group">
            <input 
              type="file" 
              name="imageFile"
              accept="image/*" 
              onChange={handleChange}
              className="hidden"
              id="modal-avatar-upload"
            />
            <label 
              htmlFor="modal-avatar-upload"
              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-surface-400 group-hover:text-brand-600 transition-colors">
                <Camera size={24} />
              </div>
              <span className="text-xs text-surface-500 font-bold">
                {formData.imageFile ? formData.imageFile.name : 'Upload New Portrait'}
              </span>
            </label>
          </div>
          
          <div className="relative flex items-center gap-4 py-2">
            <hr className="flex-1 border-surface-100" />
            <span className="text-[10px] font-black text-surface-300 uppercase tracking-widest">OR</span>
            <hr className="flex-1 border-surface-100" />
          </div>

          <Input 
            type="text" 
            name="profilePicture" 
            value={formData.profilePicture} 
            onChange={handleChange}
            placeholder="Digital Image Direct URL (CDN Link)"
            className="text-xs"
          />
        </div>

        <div className="space-y-4 pt-4">
          <label className="text-[10px] font-black text-surface-400 uppercase tracking-widest pl-1 flex items-center gap-2">
            <Camera size={14} className="text-brand-600" /> Background Cover Visualization
          </label>
          <div className="bg-surface-50 border-2 border-dashed border-surface-200 rounded-2xl p-6 transition-all hover:bg-white hover:border-brand-200 group">
            <input 
              type="file" 
              name="coverFile"
              accept="image/*" 
              onChange={handleChange}
              className="hidden"
              id="modal-cover-upload"
            />
            <label 
              htmlFor="modal-cover-upload"
              className="flex flex-col items-center justify-center gap-2 cursor-pointer"
            >
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-surface-400 group-hover:text-brand-600 transition-colors">
                <Camera size={24} />
              </div>
              <span className="text-xs text-surface-500 font-bold">
                {formData.coverFile ? formData.coverFile.name : 'Upload New Background'}
              </span>
            </label>
          </div>
          
          <div className="relative flex items-center gap-4 py-2">
            <hr className="flex-1 border-surface-100" />
            <span className="text-[10px] font-black text-surface-300 uppercase tracking-widest">OR</span>
            <hr className="flex-1 border-surface-100" />
          </div>

          <Input 
            type="text" 
            name="coverPicture" 
            value={formData.coverPicture} 
            onChange={handleChange}
            placeholder="Cover Image Direct URL"
            className="text-xs"
          />
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
