import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ImagePlus, ListPlus, ChartNoAxesCombined } from "lucide-react";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function AgencyPage(){
  return <><header className="topbar"><div className="container nav"><Link href="/" className="brand"><span className="brand-mark">✈</span>SafarGo <span style={{fontSize:12,color:"#64748b",fontWeight:700}}>PARTNER DEMO</span></Link><Link href="/" className="text-link"><ArrowLeft size={15} style={{verticalAlign:"middle",marginRight:6}}/>На сайт</Link></div></header>
    <main className="container" style={{paddingTop:40,paddingBottom:60}}><span className="eyebrow">КАБИНЕТ ПАРТНЁРА</span><h1 style={{fontSize:40,letterSpacing:"-1.5px"}}>Ваши туры — больше клиентов</h1><p className="sub" style={{maxWidth:680}}>В рабочей версии агентство сможет публиковать предложения, управлять датами и ценами, отвечать на заявки и смотреть статистику.</p>
      <div className="cards" style={{marginTop:28}}><div className="benefit"><div className="benefit-icon"><ListPlus/></div><h3>Добавляйте туры</h3><p>Название, маршрут, даты, цена, питание, отель и включённые услуги.</p></div><div className="benefit"><div className="benefit-icon"><ImagePlus/></div><h3>Загружайте фотографии</h3><p>Изображения и описание проходят модерацию перед публикацией.</p></div><div className="benefit"><div className="benefit-icon"><ChartNoAxesCombined/></div><h3>Управляйте продажами</h3><p>Заявки, статусы бронирований, доступность мест и статистика просмотров.</p></div></div>
      <div className="admin-note" style={{marginTop:28}}>Это демонстрационная страница без входа и сохранения данных. Подключение кабинета требует регистрации агентств, проверки документов, разграничения прав доступа и серверного API.</div>
      <div style={{marginTop:25}}><Link href="/" className="primary" style={{display:"inline-block"}}>Посмотреть сайт</Link></div>
    </main><footer><div className="container footer-brand">SafarGo</div></footer></>
}
