'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Trash2, Star } from 'lucide-react';
import Image from 'next/image';

interface Project {
  id: number;
  title: string;
  description: string;
  images: string[];
  mainImage: string;
}

interface SiteContent {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    backgroundImages: string[];
  };
  projects: Project[];
  quality: {
    title: string;
    description: string;
    image: string;
  };
  about: {
    description: string;
  };
  contact: {
    phone: string;
    email: string;
    instagram: string;
    facebook: string;
  };
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadContent();
    }
  }, [isAuthenticated]);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/content');
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Error loading content:', error);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'wfr092003') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleSave = async () => {
    if (!content) return;
    
    setIsSaving(true);
    setSaveStatus(null);

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return data.path;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const addProjectImage = async (projectId: number, file: File) => {
    const imagePath = await handleImageUpload(file);
    if (imagePath && content) {
      const updatedProjects = content.projects.map((project) => {
        if (project.id === projectId) {
          const newImages = [...project.images, imagePath];
          return {
            ...project,
            images: newImages,
            mainImage: project.mainImage || imagePath,
          };
        }
        return project;
      });
      setContent({ ...content, projects: updatedProjects });
    }
  };

  const removeProjectImage = (projectId: number, imageIndex: number) => {
    if (!content) return;
    
    const updatedProjects = content.projects.map((project) => {
      if (project.id === projectId) {
        const newImages = project.images.filter((_, idx) => idx !== imageIndex);
        return {
          ...project,
          images: newImages,
          mainImage: project.mainImage === project.images[imageIndex] 
            ? (newImages[0] || '') 
            : project.mainImage,
        };
      }
      return project;
    });
    setContent({ ...content, projects: updatedProjects });
  };

  const setMainImage = (projectId: number, imagePath: string) => {
    if (!content) return;
    
    const updatedProjects = content.projects.map((project) => {
      if (project.id === projectId) {
        return { ...project, mainImage: imagePath };
      }
      return project;
    });
    setContent({ ...content, projects: updatedProjects });
  };

  const addBackgroundImage = async (file: File) => {
    const imagePath = await handleImageUpload(file);
    if (imagePath && content) {
      setContent({
        ...content,
        hero: {
          ...content.hero,
          backgroundImages: [...content.hero.backgroundImages, imagePath],
        },
      });
    }
  };

  const removeBackgroundImage = (index: number) => {
    if (!content) return;
    
    const newBackgroundImages = content.hero.backgroundImages.filter((_, idx) => idx !== index);
    setContent({
      ...content,
      hero: {
        ...content.hero,
        backgroundImages: newBackgroundImages,
      },
    });
  };

  const addProject = () => {
    if (!content) return;
    
    const newProject: Project = {
      id: Math.max(...content.projects.map(p => p.id), 0) + 1,
      title: 'New Project',
      description: 'Project description',
      images: [],
      mainImage: '',
    };
    setContent({
      ...content,
      projects: [...content.projects, newProject],
    });
  };

  const removeProject = (projectId: number) => {
    if (!content) return;
    
    setContent({
      ...content,
      projects: content.projects.filter(p => p.id !== projectId),
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2 rounded-lg font-semibold transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <div className="flex gap-4 items-center">
            {saveStatus === 'success' && (
              <span className="text-green-600 font-medium">Saved successfully!</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 font-medium">Error saving changes</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Hero Section</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                type="text"
                value={content.hero.title}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, title: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
              <input
                type="text"
                value={content.hero.subtitle}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, subtitle: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={content.hero.description}
                onChange={(e) => setContent({
                  ...content,
                  hero: { ...content.hero, description: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Background Images
              </label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {content.hero.backgroundImages.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <div className="relative h-32 rounded-lg overflow-hidden">
                      <Image
                        src={img}
                        alt={`Background ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      onClick={() => removeBackgroundImage(idx)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
                <Upload className="w-5 h-5" />
                <span>Add Background Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) addBackgroundImage(file);
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Projects</h2>
            <button
              onClick={addProject}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              Add Project
            </button>
          </div>

          <div className="space-y-6">
            {content.projects.map((project) => (
              <div key={project.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">Project #{project.id}</h3>
                  <button
                    onClick={() => removeProject(project.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={project.title}
                      onChange={(e) => {
                        const updatedProjects = content.projects.map((p) =>
                          p.id === project.id ? { ...p, title: e.target.value } : p
                        );
                        setContent({ ...content, projects: updatedProjects });
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const updatedProjects = content.projects.map((p) =>
                          p.id === project.id ? { ...p, description: e.target.value } : p
                        );
                        setContent({ ...content, projects: updatedProjects });
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Images (Click star to set as main image)
                    </label>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      {project.images.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <div className="relative h-32 rounded-lg overflow-hidden">
                            <Image
                              src={img}
                              alt={`Project ${project.id} - Image ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            onClick={() => setMainImage(project.id, img)}
                            className={`absolute top-2 left-2 p-1 rounded-full transition-all ${
                              project.mainImage === img
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/80 text-slate-400 hover:text-amber-500'
                            }`}
                          >
                            <Star className="w-4 h-4" fill={project.mainImage === img ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => removeProjectImage(project.id, idx)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-500 transition-colors">
                      <Upload className="w-5 h-5" />
                      <span>Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) addProjectImage(project.id, file);
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={content.contact.phone}
                onChange={(e) => setContent({
                  ...content,
                  contact: { ...content.contact, phone: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={content.contact.email}
                onChange={(e) => setContent({
                  ...content,
                  contact: { ...content.contact, email: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instagram</label>
              <input
                type="text"
                value={content.contact.instagram}
                onChange={(e) => setContent({
                  ...content,
                  contact: { ...content.contact, instagram: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
              <input
                type="url"
                value={content.contact.facebook}
                onChange={(e) => setContent({
                  ...content,
                  contact: { ...content.contact, facebook: e.target.value }
                })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                placeholder="https://www.facebook.com/..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}