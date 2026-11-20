import type { Metadata } from "next";
import Link from "next/link";
import { tours, formatPrice } from "@/data/tours";
import { ArrowLeft, BadgeCheck, ClipboardList, Store, TrendingUp, TriangleAlert } from "lucide-react";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function AdminPage() {
  return <><header className="topbar"><div className="container nav"><Link href="/" className="brand"><span className="brand-mark">✈</span>SafarGo <span style={{fontSize:12,color:"#64748b",fontWeight:700}}>ADMIN DEMO</span></Link><Link href="/" className="text-link"><ArrowLeft size={15} style={{verticalAlign:"middle",marginRight:6}}/>На сайт</Link></div></header>
    <main className="container" style={{paddingTop:36,paddingBottom:60}}>
      <span className="eyebrow">ПАНЕЛЬ УПРАВЛЕНИЯ</span><h1 style={{fontSize:38,letterSpacing:"-1.5px",marginBottom:8}}>Обзор платформы</h1><p className="sub">Демонстрационные данные. В этой версии действия не сохраняются в базе.</p>
      <div className="cards" style={{marginTop:28,marginBottom:32}}>
        <div className="benefit"><div className="benefit-icon"><Store/></div><p className="sub">Агентства</p><h2 style={{margin:"8px 0"}}>4</h2><span className="agency">Демо-значение</span></div>
        <div className="benefit"><div className="benefit-icon"><ClipboardList/></div><p className="sub">Опубликованные туры</p><h2 style={{margin:"8px 0"}}>{tours.length}</h2><span className="agency">Демонстрационный каталог</span></div>
        <div className="benefit"><div className="benefit-icon"><TrendingUp/></div><p className="sub">Заявки за месяц</p><h2 style={{margin:"8px 0"}}>—</h2><span className="agency">Нет подключённой БД</span></div>
      </div>
      <div className="admin-note" style={{marginBottom:28}}><TriangleAlert size={18} style={{verticalAlign:"middle",marginRight:8}}/><strong>Режим макета.</strong> Страница пока не защищена авторизацией и не должна публиковаться как реальная админ-панель. Перед запуском нужно добавить Supabase Auth, проверку роли на сервере и RLS.</div>
      <div className="section-head"><div><h2>Каталог туров</h2><p className="sub">Предпросмотр предложений, которые в рабочей версии будут проходить модерацию</p></div></div>
      <div style={{overflowX:"auto",border:"1px solid #e4eaf0",borderRadius:16}}>
        <table style={{width:"100%",borderCollapse:"collapse",background:"white",fontSize:14}}>
          <thead><tr style={{textAlign:"left",background:"#f7f9fb"}}>{["Тур","Агентство","Цена","Статус"].map(h=><th key={h} style={{padding:14,borderBottom:"1px solid #e4eaf0"}}>{h}</th>)}</tr></thead>
          <tbody>{tours.map(t=><tr key={t.id}><td style={{padding:14,borderBottom:"1px solid #e4eaf0",fontWeight:800}}>{t.title}<div className="agency">{t.country} · {t.days} дней</div></td><td style={{padding:14,borderBottom:"1px solid #e4eaf0"}}>{t.agency}</td><td style={{padding:14,borderBottom:"1px solid #e4eaf0",whiteSpace:"nowrap"}}>{formatPrice(t.price)}</td><td style={{padding:14,borderBottom:"1px solid #e4eaf0"}}><span style={{background:"#fff3d6",color:"#875c00",padding:"6px 9px",borderRadius:99,fontSize:12,fontWeight:800}}>Демо</span></td></tr>)}</tbody>
        </table>
      </div>
      <div style={{marginTop:28}}><Link href="/" className="details-btn">Открыть публичный сайт</Link></div>
    </main>
  </>;
}
