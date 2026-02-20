import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import PrintButton from "@/components/PrintButton";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );

  const { data: page } = await supabase.from("pages").select("title").eq("slug", slug).single();
  return { title: page ? `${page.title} | Memonex3D` : "Sayfa Bulunamadı" };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get(name) { return cookieStore.get(name)?.value } } }
  );

  const { data: page } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!page) notFound();

  return (
    <main className="bg-white min-h-screen relative overflow-hidden">
      {/* Dekoratif Arka Plan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-[100px] -z-10" />
      
      <article className="max-w-4xl mx-auto px-6 py-32">
        <header className="mb-16">
          <div className="inline-block px-3 py-1 mb-6 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Kurumsal Bilgi
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase text-slate-900 mb-6 leading-[0.9]">
            {page.title}
          </h1>
          <div className="w-24 h-2 bg-blue-600 rounded-full" />
        </header>

        {/* İçerik Alanı */}
        <div 
          className="prose prose-slate prose-lg max-w-none 
          prose-headings:text-slate-900 prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter
          prose-p:text-slate-600 prose-p:leading-relaxed prose-p:font-medium
          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-slate-900 prose-a:transition-colors
          prose-strong:text-slate-900 prose-strong:font-black
          prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:border prose-img:border-slate-100"
          dangerouslySetInnerHTML={{ __html: page.content }} 
        />
        
        <footer className="mt-20 pt-10 border-t border-slate-100 flex justify-between items-center">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Memonex3D © 2026</p>
          <PrintButton /> 
        </footer>
      </article>
    </main>
  );
}