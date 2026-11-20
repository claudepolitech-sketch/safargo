import { NextResponse } from "next/server";

type Lead = { name: string; phone: string; email?: string; topic?: string; website?: string };

// Простая защита от частых отправок с одного IP (в памяти процесса; для продакшена нужен Redis/Upstash).
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  return list.length > MAX_HITS;
}

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Слишком много заявок. Попробуйте позже." }, { status: 429 });
  }

  let body: Partial<Lead>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Неверный формат запроса." }, { status: 400 }); }

  // honeypot: скрытое поле, которое заполняют только боты
  if (clean(body.website, 200)) return NextResponse.json({ ok: true });

  const lead = {
    name: clean(body.name, 100),
    phone: clean(body.phone, 30),
    email: clean(body.email, 120),
    topic: clean(body.topic, 200),
  };

  if (lead.name.length < 2) return NextResponse.json({ error: "Укажите имя." }, { status: 400 });
  if (!/^\+?[0-9\s\-()]{7,20}$/.test(lead.phone)) return NextResponse.json({ error: "Проверьте номер телефона." }, { status: 400 });
  if (lead.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) return NextResponse.json({ error: "Проверьте email." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    const res = await fetch(`${url}/rest/v1/leads`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ name: lead.name, phone: lead.phone, email: lead.email || null, topic: lead.topic || null }),
    });
    if (!res.ok) return NextResponse.json({ error: "Не удалось сохранить заявку. Попробуйте позже." }, { status: 502 });
    return NextResponse.json({ ok: true, stored: true });
  }

  // Демо-режим без базы: заявка не сохраняется, но видна в логах сервера.
  console.log("[lead:demo]", { name: lead.name, topic: lead.topic });
  return NextResponse.json({ ok: true, stored: false });
}
