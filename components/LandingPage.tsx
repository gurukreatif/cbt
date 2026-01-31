
import React, { useState, useEffect, useRef } from 'react';
import { 
  LogIn, 
  ArrowRight, 
  ChevronDown, 
  CloudOff, 
  Clock, 
  Zap, 
  Award, 
  Phone, 
  Mail,
  Users,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { LOGO_URL } from '../constants';
import PublicSchoolRegistration from './PublicSchoolRegistration.tsx';

declare const Swiper: any;

interface LandingPageProps {
  onGoToLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin }) => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isBantuanOpen, setIsBantuanOpen] = useState(false);
  const swiperRef = useRef(null);
  
  const clientLogos = [
    "https://png.pngtree.com/png-vector/20230415/ourmid/pngtree-school-logo-design-template-vector-png-image_6705854.png",
    "https://img.freepik.com/vektor-premium/templat-desain-logo-pendidikan-untuk-sekolah-dan-organisasi_731136-111.jpg?semt=ais_hybrid&w=740&q=80",
    "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/education-logo%2C-school-logo-templates-design-e6c3cb98f660e9173cb00e5deac79755_screen.jpg?ts=1668240225",
    "https://marketplace.canva.com/EAGVz4R0MRo/1/0/1600w/canva-biru-oranye-modern-bimbingan-belajar-logo-SpO4wb3Y_PE.jpg",
    "https://img.freepik.com/vektor-gratis/logo-sekolah-dasar-buku-yang-digambar-tangan_23-2149689287.jpg?semt=ais_hybrid&w=740&q=80",
    "https://d1csarkz8obe9u.cloudfront.net/posterpreviews/abroad-study-logo%2C-education-logo-for-schools-design-template-766fdb99d8af3ff442bde385997bf07d_screen.jpg?ts=1678215639",
    "https://png.pngtree.com/png-vector/20230315/ourmid/pngtree-education-school-logo-design-symbol-badge-book-vector-png-image_50796824.jpg",
  ];

  const testimonials = [
    { 
      quote: "Alhamdulillah banget ketemu Emes CBT, platform ujian paling lengkap dan paling mudah digunakan.", 
      name: "Budi Santoso", 
      title: "Kepala Sekolah SMPN 1 Maju Jaya",
      image: "https://i.imgur.com/xppgW11.jpeg"
    },
    { 
      quote: "Fitur sangat lengkap, user friendly, IT support dan biaya murah. Bintang 5 pokoknya!", 
      name: "Siti Aminah", 
      title: "Proktor, MAN 2 Kota Harapan",
      image: "https://i.imgur.com/fXmFHdu.jpeg"
    },
    { 
      quote: "Cukup puas dengan sistem yang dibuat. Analisis butir soalnya sangat membantu kami dalam evaluasi.", 
      name: "I Gede Pratama", 
      title: "Kepala Sekolah, SMAN 3 Denpasar",
      image: "https://i.imgur.com/oduYA9t.jpeg"
    }
  ];

  useEffect(() => {
    if (swiperRef.current) {
      new Swiper(swiperRef.current, {
        loop: true,
        slidesPerView: 2,
        spaceBetween: 20,
        autoplay: { delay: 2500, disableOnInteraction: false },
        breakpoints: {
          640: { slidesPerView: 3, spaceBetween: 30 },
          768: { slidesPerView: 4, spaceBetween: 40 },
          1024: { slidesPerView: 6, spaceBetween: 50 },
        },
        pagination: { el: '.swiper-pagination', clickable: true },
      });
    }
  }, []);

  const goToReseller = () => {
    window.location.href = '/reseller';
  };

  return (
    <div className="bg-zinc-50 text-zinc-800 font-sans min-h-screen overflow-y-auto scrollbar-hide">
      {isRegisterModalOpen && <PublicSchoolRegistration onClose={() => setIsRegisterModalOpen(false)} />}
      
      <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-200">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <a href="#home" className="flex items-center gap-3 cursor-pointer">
            <img src={LOGO_URL} alt="Logo" className="h-8 w-8 filter brightness-0 invert-[0.5] sepia-[1] saturate-[5] hue-rotate-[100deg]" />
            <span className="text-xl font-black tracking-tighter text-emerald-800">Emes CBT</span>
          </a>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-bold text-zinc-600">
            <a href="#home" className="hover:text-emerald-700 transition-colors">Home</a>
            <a href="#keunggulan" className="hover:text-emerald-700 transition-colors">Keunggulan</a>
            <button onClick={goToReseller} className="hover:text-emerald-700 flex items-center gap-1.5 transition-colors text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs">
              <Share2 size={14}/> Portal Agen
            </button>
            <div className="relative">
              <button onClick={() => setIsBantuanOpen(!isBantuanOpen)} className="flex items-center gap-1 hover:text-emerald-700">
                Bantuan <ChevronDown size={16} className={`transition-transform ${isBantuanOpen ? 'rotate-180' : ''}`}/>
              </button>
              {isBantuanOpen && (
                <div className="absolute top-full mt-3 w-48 bg-white rounded-md shadow-xl border border-zinc-100 py-1 animate-in fade-in zoom-in-95">
                  <a href="#footer" className="block px-4 py-2 text-sm hover:bg-emerald-50">Kontak Kami</a>
                  <a href="#" className="block px-4 py-2 text-sm hover:bg-emerald-50">Panduan Aplikasi</a>
                </div>
              )}
            </div>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onGoToLogin} className="hidden sm:inline-block px-5 py-2 text-emerald-700 font-bold text-xs uppercase hover:bg-emerald-50 transition-colors">
              Login Sekolah
            </button>
            <button onClick={() => setIsRegisterModalOpen(true)} className="px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs uppercase rounded-md shadow-lg hover:bg-emerald-800 transition-all">
              Daftar Sekarang
            </button>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="relative hero-bg-light pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="font-bold text-emerald-700">Ujian Online Cloud Native.</span>
              <h1 className="text-4xl md:text-5xl font-black text-zinc-900 leading-tight mt-2">
                Aplikasi CBT Sekolah Tercanggih di Indonesia.
              </h1>
              <p className="mt-6 text-zinc-600 md:text-lg">
                Daftarkan segera lembaga Anda dan selenggarakan ujian dengan sistem monitoring real-time, analisis butir soal otomatis, dan integrasi cloud tanpa ribet.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4">
                <button onClick={() => setIsRegisterModalOpen(true)} className="w-full sm:w-auto px-8 py-4 bg-emerald-700 text-white font-bold uppercase text-sm rounded-md shadow-xl hover:scale-105 transition-all">
                  Mulai Sekarang
                </button>
                <button onClick={goToReseller} className="w-full sm:w-auto px-8 py-4 bg-emerald-50 text-emerald-700 font-bold uppercase text-sm rounded-md border border-emerald-100 hover:bg-emerald-100 transition-all">
                  Join Program Agen
                </button>
              </div>
            </div>
            <div>
              <img src="https://i.imgur.com/qghfwGT.jpeg" alt="Dashboard Emes CBT" className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl border-8 border-white"/>
            </div>
          </div>
        </section>
        
        <section id="keunggulan" className="py-20 md:py-28 bg-white">
          <div className="container mx-auto px-6 grid lg:grid-cols-3 gap-12 text-center lg:text-left">
            <div className="lg:col-span-1">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900">Kenapa Emes CBT?</h2>
              <div className="w-20 h-1.5 bg-emerald-600 my-4 mx-auto lg:mx-0"></div>
              <p className="text-zinc-500 md:text-lg">
                Solusi ujian yang didesain untuk kebutuhan sekolah di Indonesia dengan fitur melimpah dan biaya yang transparan.
              </p>
            </div>
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
              {[
                { icon: <CloudOff size={32} className="text-emerald-600"/>, title: "Support Semi-Online", desc: "Siswa tetap bisa mengerjakan meskipun koneksi internet terputus di tengah ujian." },
                { icon: <Clock size={32} className="text-emerald-600"/>, title: "Siap 24/7", desc: "Server cloud handal yang siap menangani ribuan peserta ujian secara simultan." },
                { icon: <Zap size={32} className="text-emerald-600"/>, title: "Auto-Grading", desc: "Nilai langsung keluar setelah ujian selesai, lengkap dengan analisis kesukaran soal." },
                { icon: <Award size={32} className="text-emerald-600"/>, title: "E-Certificate & Kartu", desc: "Cetak kartu peserta dan berita acara otomatis dengan format standar nasional." },
              ].map((item, i) => (
                <div key={i} className="flex flex-col lg:flex-row items-center lg:items-start gap-5 p-6 rounded-2xl hover:bg-zinc-50 transition-colors">
                  <div className="p-3 bg-white shadow-sm rounded-xl shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900">{item.title}</h3>
                    <p className="text-sm text-zinc-600 mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer id="footer" className="bg-zinc-900 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3">
                <img src={LOGO_URL} alt="Logo" className="h-10 w-10 logo-inverse" />
                <span className="text-2xl font-black tracking-tighter">Emes CBT</span>
              </div>
              <p className="mt-6 text-zinc-400 max-w-sm">Solusi infrastruktur ujian digital modern untuk mendukung digitalisasi pendidikan di Indonesia.</p>
            </div>
            <div>
              <h4 className="font-bold uppercase text-xs tracking-widest text-emerald-500 mb-6">Pintu Portal</h4>
              <nav className="flex flex-col gap-4 text-sm font-bold">
                <button onClick={onGoToLogin} className="text-left text-zinc-300 hover:text-white">Portal Sekolah</button>
                <button onClick={goToReseller} className="text-left text-emerald-400 hover:text-emerald-300">Portal Agen / Reseller</button>
                <button onClick={() => window.location.href = '/superadmin'} className="text-left text-zinc-600 hover:text-zinc-400">Pusat Bantuan</button>
              </nav>
            </div>
            <div>
              <h4 className="font-bold uppercase text-xs tracking-widest text-emerald-500 mb-6">Hubungi</h4>
              <div className="flex flex-col gap-4 text-sm font-bold text-zinc-300">
                <a href="mailto:support@emescbt.id" className="flex items-center gap-3"><Mail size={16}/> support@emescbt.id</a>
                <a href="#" className="flex items-center gap-3"><Phone size={16}/> +62 812-3456-7890</a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-zinc-800 py-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
          &copy; {new Date().getFullYear()} Emes EduTech Hub. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
