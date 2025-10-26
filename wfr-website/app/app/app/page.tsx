'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Instagram, Facebook, ChevronLeft, ChevronRight, X } from 'lucide-react';
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

export default function Home() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);

  useEffect(() => {
    fetch('/api/content')
      .then((res) => res.json())
      .then((data) => setContent(data))
      .catch((error) => console.error('Error loading content:', error));
  }, []);

  useEffect(() => {
    if (content?.hero.backgroundImages && content.hero.backgroundImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBgIndex((prev) => 
          (prev + 1) % content.hero.backgroundImages.length
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [content]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProject) return;
      
      if (e.key === 'ArrowLeft') {
        navigateImage('prev');
      } else if (e.key === 'ArrowRight') {
        navigateImage('next');
      } else if (e.key === 'Escape') {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProject, currentImageIndex]);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedProject) return;
    
    setCurrentImageIndex((prev) => {
      if (direction === 'prev') {
        return prev === 0 ? selectedProject.images.length - 1 : prev - 1;
      } else {
        return prev === selectedProject.images.length - 1 ? 0 : prev + 1;
      }
    });
  };

  const openModal = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'abac33bd-b127-481e-b5e1-99d01c78df92',
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          subject: 'New Contact Form Submission - WFR Website',
          from_name: 'WFR Website Contact Form',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
        setTimeout(() => {
          setShowContactForm(false);
          setSubmitStatus(null);
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative h-screen flex items-center justify-center text-white overflow-hidden">
        {content.hero.backgroundImages.map((img, index) => (
          <div
            key={img}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{
              opacity: index === currentBgIndex ? 1 : 0,
              zIndex: 1,
            }}
          >
            <Image
              src={img}
              alt="Background"
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
        
        <div className="absolute inset-0 bg-black/50 z-10" />
        
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">{content.hero.title}</h1>
          <p className="text-2xl md:text-3xl mb-4 text-amber-400">{content.hero.subtitle}</p>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">{content.hero.description}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`tel:${content.contact.phone}`}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call Us
            </a>
            <button
              onClick={() => setShowContactForm(true)}
              className="bg-white hover:bg-slate-100 text-slate-900 px-8 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Email Us
            </button>
          </div>
        </div>
      </section>

      <section id="portfolio" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900">Our Portfolio</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.projects.map((project) => (
              <div
                key={project.id}
                className="group cursor-pointer"
                onClick={() => openModal(project)}
              >
                <div className="relative h-80 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={project.mainImage}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                      <p className="text-sm">{project.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <Image
                src={content.quality.image}
                alt="Quality Work"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 text-slate-900">{content.quality.title}</h2>
              <p className="text-lg text-slate-600 leading-relaxed">{content.quality.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8 text-slate-900">About Us</h2>
          <p className="text-lg text-slate-600 leading-relaxed">{content.about.description}</p>
        </div>
      </section>

      <section id="contact" className="py-20 px-4 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">Get In Touch</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <a
              href={`tel:${content.contact.phone}`}
              className="flex items-center justify-center gap-3 p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Phone className="w-6 h-6 text-amber-400" />
              <span className="text-lg">{content.contact.phone}</span>
            </a>
            
            <a
              href={`mailto:${content.contact.email}`}
              className="flex items-center justify-center gap-3 p-6 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Mail className="w-6 h-6 text-amber-400" />
              <span className="text-lg">Email Us</span>
            </a>
          </div>

          <div className="flex justify-center gap-6">
            <a
              href={`https://instagram.com/${content.contact.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Instagram className="w-6 h-6" />
              <span>{content.contact.instagram}</span>
            </a>
            
            <a
              href={content.contact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Facebook className="w-6 h-6" />
              <span>Facebook</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-slate-950 text-slate-400 py-8 px-4 text-center">
        <p>&copy; 2025 Wood Finishes and Renovations. All rights reserved.</p>
      </footer>

      {selectedProject && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 text-white hover:text-amber-400 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-4 text-white hover:text-amber-400 transition-colors"
          >
            <ChevronLeft className="w-12 h-12" />
          </button>

          <button
            onClick={() => navigateImage('next')}
            className="absolute right-4 text-white hover:text-amber-400 transition-colors"
          >
            <ChevronRight className="w-12 h-12" />
          </button>

          <div className="max-w-6xl w-full">
            <div className="relative h-[70vh] mb-4">
              <Image
                src={selectedProject.images[currentImageIndex]}
                alt={`${selectedProject.title} - Image ${currentImageIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>

            <div className="text-center text-white mb-4">
              <h3 className="text-2xl font-bold mb-2">{selectedProject.title}</h3>
              <p className="text-slate-300">{selectedProject.description}</p>
              <p className="text-sm text-slate-400 mt-2">
                Image {currentImageIndex + 1} of {selectedProject.images.length}
              </p>
            </div>

            {selectedProject.images.length > 1 && (
              <div className="flex gap-2 justify-center overflow-x-auto pb-4">
                {selectedProject.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex
                        ? 'border-amber-400 scale-110'
                        : 'border-transparent opacity-50 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showContactForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowContactForm(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-2xl font-bold mb-6 text-slate-900">Contact Us</h3>

            {submitStatus === 'success' && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg">
                Message sent successfully! We'll get back to you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
                Failed to send message. Please try again or call us directly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}