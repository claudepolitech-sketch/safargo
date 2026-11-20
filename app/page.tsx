"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, PlaneTakeoff, MapPin, ShieldCheck, HeartHandshake, Search, CalendarDays, Users, Menu } from "lucide-react";
import { tours, formatPrice } from "@/data/tours";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"Туры"|"Авиабилеты"|"Отели">("Туры");
  const [category, setCategory] = useState("Все");
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("any");
  const [departure, setDeparture] = useState("Душанбе");
  const [date, setDate] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [requestTour, setRequestTour] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [stored, setStored] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const filtered = useMemo(() => tours.filter(t => {
    const matchesCategory = category === "Все" || t.category === category;
    const matchesDestination = !destination || `${t.country} ${t.city} ${t.title}`.toLowerCase().includes(destination.toLowerCase());
    const matchesBudget = budget === "any" || (budget === "low" ? t.price < 3000 : budget === "mid" ? t.price >= 3000 && t.price < 6000 : t.price >= 6000);
    return matchesCategory && matchesDestination && matchesBudget;
  }), [category, destination, budget]);
  const openRequest = (title:string) => { setRequestTour(title); setSent(false); setFormError(""); setShowRequest(true); };
  const submitLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSending(true); setFormError("");
    try {
      const res = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.get("name"), phone: f.get("phone"), email: f.get("email"), topic: requestTour, website: f.get("website") }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setFormError(data.error || "Не удалось отправить заявку."); return; }
      setStored(Boolean(data.stored)); setSent(true);
    } catch { setFormError("Нет связи с сервером. Проверьте интернет и попробуйте снова."); }
    finally { setSending(false); }
  };
  return <>
    <header className="topbar"><div className="container nav">
      <Link href="/" className="brand"><span className="brand-mark"><PlaneTakeoff size={22}/></span>SafarGo</Link>
      <nav className="links"><a href="#flights" className={activeTab==="Авиабилеты"?"active":""} onClick={()=>setActiveTab("Авиабилеты")}>Авиабилеты</a><a href="#tours" className={activeTab==="Туры"?"active":""} onClick={()=>setActiveTab("Туры")}>Туры</a><a href="#why">Как это работает</a></nav>
      <button className="nav-cta" onClick={()=>openRequest("Размещение туров для агентства")}>Для агентств <ArrowRight size={14} style={{verticalAlign:"middle",marginLeft:4}}/></button>
    </div></header>
    <main>
      <section className="hero"><div className="container hero-grid">
        <div><span className="eyebrow">✦ ПУТЕШЕСТВУЙТЕ ПРОЩЕ</span><h1>Ваш следующий отпуск <span>начинается здесь</span></h1><p>Сравнивайте туры, находите выгодные предложения и планируйте путешествия из Таджикистана — в одном месте.</p>
          <div className="search-panel" id="flights">
            <div className="tabs">{(["Туры","Авиабилеты","Отели"] as const).map(tab=><button key={tab} className={`tab ${activeTab===tab?"selected":""}`} onClick={()=>setActiveTab(tab)}>{tab}</button>)}</div>
            {activeTab==="Туры" ? <div className="search-grid">
              <div className="field"><label>КУДА ХОТИТЕ?</label><input value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Страна или город"/></div>
              <div className="field"><label title="Пока не влияет на выдачу">ВЫЛЕТ ИЗ</label><input value={departure} onChange={e=>setDeparture(e.target.value)} placeholder="Душанбе"/></div>
              <div className="field"><label>ДАТА ВЫЛЕТА</label><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></div>
              <div className="field"><label>БЮДЖЕТ</label><select value={budget} onChange={e=>setBudget(e.target.value)}><option value="any">Любой</option><option value="low">До 3 000</option><option value="mid">3–6 тыс.</option><option value="high">От 6 000</option></select></div>
              <button className="primary" onClick={()=>document.getElementById("tours")?.scrollIntoView({behavior:"smooth"})}><Search size={16} style={{verticalAlign:"middle",marginRight:5}}/> Найти</button>
            </div> : <div className="admin-note"><strong>{activeTab==="Авиабилеты"?"Поиск авиабилетов":"Поиск отелей"}</strong><br/>Этот раздел подготовлен для интеграции с поставщиком данных. Сейчас можно изучить каталог туров ниже.</div>}
          </div>
        </div>
        <div className="hero-art" aria-label="Иллюстрация путешествия"><div className="sun"/><div className="mountain"/><div className="mountain2"/><div className="plane-card"><PlaneTakeoff size={18} style={{verticalAlign:"middle",marginRight:8,color:"#0c7c86"}}/>Новое путешествие ждёт</div></div>
      </div></section>
      <section className="section" id="tours"><div className="container">
        <div className="section-head"><div><h2>Популярные туры</h2><p className="sub">Выберите путешествие под настроение и бюджет</p></div><a className="text-link" href="#all-tours">Все предложения →</a></div>
        <div className="chips">{["Все","Пляжный","Экскурсионный","Приключения"].map(c=><button key={c} className={`chip ${category===c?"active":""}`} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="cards" id="all-tours">{filtered.map(t=><article className="tour-card" key={t.id}>
          <div className="tour-photo"><img src={t.image} alt={t.title}/><span className="tag">{t.label}</span><button className="heart" aria-label="Добавить в избранное" onClick={()=>setFavorites(f=>f.includes(t.id)?f.filter(id=>id!==t.id):[...f,t.id])}>{favorites.includes(t.id)?"♥":"♡"}</button></div>
          <div className="tour-body"><div className="tour-meta"><span><MapPin size={13} style={{verticalAlign:"middle"}}/> {t.country}</span><span>{t.days} дней</span></div><h3>{t.title}</h3><div className="agency">{t.agency}</div><div className="tour-foot"><div className="price">{formatPrice(t.price)}<br/><small>за человека · демо-цена</small></div><Link className="details-btn" href={`/tours/${t.slug}`}>Подробнее</Link></div>
        </div></article>)}</div>
        {filtered.length===0&&<div className="empty">Ничего не найдено. Попробуйте изменить направление или бюджет.</div>}
        <p className="sub" style={{fontSize:12,marginTop:18}}>Важно: предложения, названия агентств и цены в этой версии демонстрационные. Перед продажей данные должны быть подтверждены поставщиками.</p>
      </div></section>
      <section className="section soft" id="why"><div className="container"><div className="section-head"><div><h2>Путешествия без лишних хлопот</h2><p className="sub">Платформа, которая объединяет путешественников и проверенные агентства</p></div></div>
        <div className="benefits"><div className="benefit"><div className="benefit-icon"><Search/></div><h3>Сравнивайте</h3><p>Изучайте предложения разных агентств и выбирайте вариант по цене, направлению и формату отдыха.</p></div><div className="benefit"><div className="benefit-icon"><ShieldCheck/></div><h3>Проверяйте детали</h3><p>В карточке тура будут указаны продавец, состав пакета, условия оплаты и отмены.</p></div><div className="benefit"><div className="benefit-icon"><HeartHandshake/></div><h3>Находите своего агента</h3><p>Туристические компании смогут размещать предложения и получать заявки через платформу.</p></div></div>
      </div></section>
      <section className="section"><div className="container"><div className="cta"><div><h2>Вы туристическое агентство?</h2><p>Размещайте туры, находите клиентов и развивайте продажи вместе с SafarGo.</p></div><button className="primary" onClick={()=>openRequest("Размещение туров для агентства")}>Стать партнёром <ArrowRight size={16} style={{verticalAlign:"middle",marginLeft:6}}/></button></div></div></section>
    </main>
    <footer><div className="container footer-grid"><div><div className="footer-brand">SafarGo</div><div className="footer-note">Билеты, туры и путешествия в одном месте.</div></div><div><strong>Путешественникам</strong><div className="footer-note">Туры · Поддержка · Условия бронирования</div></div><div><strong>Партнёрам</strong><div className="footer-note">Размещение предложений · Сотрудничество</div></div></div><div className="container footer-note">© 2026 SafarGo. Рабочее название проекта. Демонстрационная версия.</div></footer>
    {showRequest&&<div className="modal-backdrop" onClick={()=>setShowRequest(false)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" aria-label="Закрыть" onClick={()=>setShowRequest(false)}>×</button>{sent?<div className="success"><strong>{stored?"Заявка отправлена.":"Заявка принята (демо-режим)."}</strong><br/>{stored?"Менеджер свяжется с вами по указанному телефону.":"База данных ещё не подключена, поэтому заявка не сохранена."}</div>:<><h2>{requestTour==="Размещение туров для агентства"?"Стать партнёром":"Заявка на тур"}</h2><p className="sub">Оставьте контакты — в полноценной версии заявка будет передана менеджеру.</p><form onSubmit={submitLead}><input required name="name" minLength={2} maxLength={100} placeholder="Ваше имя" autoComplete="name"/><input required name="phone" placeholder="Телефон / WhatsApp" type="tel" autoComplete="tel"/><input name="email" placeholder="Email (необязательно)" type="email" autoComplete="email"/><input value={requestTour} onChange={e=>setRequestTour(e.target.value)} maxLength={200} placeholder="Интересующий тур или тема"/><input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position:"absolute",left:"-9999px",opacity:0}}/>{formError&&<p role="alert" style={{color:"#b42318",fontSize:14,margin:"4px 0"}}>{formError}</p>}<button className="primary" type="submit" disabled={sending}>{sending?"Отправляем…":"Отправить заявку"}</button></form></>}</div></div>}
  </>;
}
