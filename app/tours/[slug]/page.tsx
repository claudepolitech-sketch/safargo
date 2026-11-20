import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, CalendarDays, Utensils, Hotel, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { tours, formatPrice } from "@/data/tours";

export function generateStaticParams(){return tours.map(t=>({slug:t.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const tour=tours.find(t=>t.slug===slug);
  if(!tour) return {title:"Тур не найден — SafarGo"};
  return {title:`${tour.title} — SafarGo`,description:tour.description,openGraph:{title:tour.title,description:tour.description,images:[tour.image]}};
}
export default async function TourPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const tour=tours.find(t=>t.slug===slug);
  if(!tour) notFound();
  return <><header className="topbar"><div className="container nav"><Link href="/" className="brand"><span className="brand-mark">✈</span>SafarGo</Link><Link href="/" className="text-link"><ArrowLeft size={15} style={{verticalAlign:"middle",marginRight:6}}/>Все туры</Link></div></header>
    <section className="detail-hero"><div className="container"><span className="eyebrow">{tour.label}</span><h1 style={{fontSize:"clamp(30px,4vw,44px)",marginBottom:8}}>{tour.title}</h1><p className="sub"><MapPin size={15} style={{verticalAlign:"middle"}}/> {tour.city}, {tour.country} · предложение: {tour.agency}</p></div></section>
    <main className="container detail-layout"><div><img className="detail-image" src={tour.image} alt={tour.title}/><h2>О туре</h2><p className="detail-copy">{tour.description}</p><h3>Что указано в предложении</h3><p className="detail-copy">Продолжительность: {tour.days} дней. Проживание: {tour.hotel}. Питание: {tour.meal}. Полный список включённых услуг, перелёт, трансфер, визовые условия и правила отмены должны быть предоставлены агентством до подтверждения заказа.</p><div className="notice">Демонстрационная карточка. Это не подтверждённое предложение и не гарантия наличия мест. Не совершайте оплату по данным этой демоверсии.</div></div>
    <aside className="detail-panel"><div className="tour-meta"><span>Цена от</span><span>На человека</span></div><div className="price" style={{margin:"12px 0"}}>{formatPrice(tour.price)}</div><p className="sub">Демо-цена · итоговую стоимость подтвердит агентство</p><hr style={{border:0,borderTop:"1px solid #e4eaf0",margin:"20px 0"}}/><p><CalendarDays size={16} style={{verticalAlign:"middle",marginRight:8}}/>{tour.days} дней</p><p><Hotel size={16} style={{verticalAlign:"middle",marginRight:8}}/>{tour.hotel}</p><p><Utensils size={16} style={{verticalAlign:"middle",marginRight:8}}/>{tour.meal}</p><a className="primary" href={`/?tour=${encodeURIComponent(tour.title)}#tours`} style={{display:"block",textAlign:"center",marginTop:20}}>Оставить заявку</a><p className="sub" style={{fontSize:12,marginTop:12}}>Заявки и платежи пока не обрабатываются сервером.</p></aside></main>
    <footer><div className="container footer-grid"><div><div className="footer-brand">SafarGo</div><div className="footer-note">Билеты, туры и путешествия в одном месте.</div></div><Link href="/" className="text-link">На главную ↑</Link></div></footer>
  </>;
}
