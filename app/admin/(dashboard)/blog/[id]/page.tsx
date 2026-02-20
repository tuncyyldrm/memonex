'use client';

import { useState, useEffect, use, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { slugify } from '@/lib/utils';
import Link from 'next/link';

// ReactQuill Dinamik Import
const ReactQuill = dynamic(() => import('react-quill-new'), { 
  ssr: false,
  loading: () => <div className="h-[500px] bg-slate-50 animate-pulse rounded-[2rem]" />
});
import 'react-quill-new/dist/quill.snow.css';

export default function BlogEditor({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const quillRef = useRef<any>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 1. VERİ ÇEKME
  useEffect(() => {
    async function fetchPost() {
      if (id !== 'new') {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setTitle(data.title);
          setContent(data.content);
        }
      }
      setIsInitialLoading(false);
    }
    fetchPost();
  }, [id]);

  // 2. GÖRSEL YÜKLEME (media bucket & featured_image uyumlu)
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Dosya ismini temizle (Türkçe karakter fix)
      const cleanFileName = file.name
        .toLowerCase()
        .replace(/[ıİ]/g, 'i')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[üÜ]/g, 'u')
        .replace(/[şŞ]/g, 's')
        .replace(/[öÖ]/g, 'o')
        .replace(/[çÇ]/g, 'c')
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-');

      const filePath = `blog/${Date.now()}-${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('media') 
        .upload(filePath, file);

      if (uploadError) return alert('Yükleme hatası: ' + uploadError.message);

      const { data } = supabase.storage.from('media').getPublicUrl(filePath);

      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, 'image', data.publicUrl);
        quill.setSelection(range.index + 1);
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
      handlers: { image: imageHandler },
    },
  }), []);

  // 3. KAYDETME (DB Şeması ile tam uyumlu)
  const handleSave = async () => {
    if (!title || !content) return alert('Başlık ve içerik gereklidir!');
    
    setLoading(true);
    const slug = slugify(title, { lower: true, strict: true });
    const excerpt = content.replace(/<[^>]*>/g, '').substring(0, 160).trim() + '...';

    // İçerikteki ilk resmi featured_image olarak ayarla
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = content.match(imgRegex);
    const coverImage = match ? match[1] : null;

    const postData = { 
      title, 
      content, 
      slug, 
      excerpt, 
      featured_image: coverImage, // DB'deki isme göre düzeltildi
      published: true,
      updated_at: new Date().toISOString()
    };

    let error;
    if (id === 'new') {
      const result = await supabase.from('blog_posts').insert([postData]);
      error = result.error;
    } else {
      const result = await supabase.from('blog_posts').update(postData).eq('id', id);
      error = result.error;
    }

    if (error) {
      alert('Hata: ' + error.message);
    } else {
      router.push('/admin/blog');
      router.refresh();
    }
    setLoading(false);
  };

  if (isInitialLoading) return <div className="p-20 text-center font-black text-slate-300 animate-pulse">YÜKLENİYOR...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20 p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-100 pb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">
            {id === 'new' ? 'YENİ MAKALE' : 'DÜZENLE'}
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Memonex3D Content Studio</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Link href="/admin/blog" className="flex-1 md:flex-none text-center px-6 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 transition">İPTAL</Link>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-[2] md:flex-none bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl disabled:opacity-50"
          >
            {loading ? 'KAYDEDİLİYOR...' : 'YAYIMLA'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Makale Başlığı..."
          className="w-full p-6 text-2xl md:text-3xl font-black border border-slate-200 rounded-[2rem] outline-none focus:ring-4 focus:ring-blue-50 transition-all"
        />

        <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
          <style>{`
            .ql-toolbar.ql-snow { border: none; border-bottom: 1px solid #f1f5f9; padding: 1.5rem; background: #fafafa; }
            .ql-container.ql-snow { border: none; font-size: 1.1rem; }
            .ql-editor { min-height: 550px; padding: 2.5rem; line-height: 1.8; color: #334155; }
            .ql-editor img { border-radius: 1.5rem; margin: 2rem 0; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); max-width: 100%; height: auto; }
            .ql-editor h2 { font-weight: 800; color: #0f172a; margin-top: 2rem; }
          `}</style>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="İçeriğinizi oluşturun..."
          />
        </div>
      </div>
    </div>
  );
}