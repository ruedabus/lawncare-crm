"use client";

import Link from "next/link";
import { useState } from "react";

// ── Icons ─────────────────────────────────────────────────────────────────────

function Icon({ path, cls = "h-6 w-6" }: { path: string; cls?: string }) {
  return (
    <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function Check({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.07 7.07a1 1 0 01-1.414 0L3.296 8.85A1 1 0 114.71 7.436l4.217 4.217 6.363-6.363a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

// ── Translations ──────────────────────────────────────────────────────────────

const T = {
  en: {
    nav: { login: "Log in", trial: "Start free trial" },
    hero: {
      badge: "Built for lawn care professionals",
      h1: "Win more jobs.",
      h2: "Get paid faster.",
      h3: "Stay organized.",
      sub: "YardPilot helps lawn care businesses manage leads, customers, scheduling, invoices, and payments in one clean system.",
      cta1: "Start free trial",
      cta2: "Watch demo",
      t1: "14-day free trial",
      t2: "Set up in minutes",
      t3: "Cancel anytime",
      b1t: "5-star rated",
      b1s: "by lawn pros",
      b2t: "500+ crews",
      b2s: "trust YardPilot",
    },
    tour: {
      label: "Product Tour",
      title: "See YardPilot in action",
      sub: "Manage your entire lawn care business — from leads to scheduling to getting paid.",
      dashboard: { title: "Dashboard", desc: "See customers, jobs, invoices, and revenue all in one place." },
      schedule: { title: "Scheduling", desc: "Organize your week and assign jobs to your crew with ease." },
      invoices: { title: "Invoices & Payments", desc: "Send professional invoices and get paid faster." },
      leads: { title: "Lead Tracking", desc: "Capture and track every potential customer from first contact to close." },
    },
    demo: {
      label: "Demo",
      title: "Watch YardPilot in action",
      sub: "See how a lawn care business manages jobs, customers, and payments in under a minute.",
      fallback: "Your browser does not support the video tag.",
    },
    trust: ["Stripe payments built in", "Mobile-ready PWA", "QR lead capture", "Daily tech reminders", "Multi-factor login security"],
    features: {
      label: "Features",
      title: "Everything your crew needs",
      sub: "Built specifically for lawn care — not a generic tool bolted together. Every feature is designed around how you actually work.",
      items: [
        { title: "Invoicing & Payments", desc: "Create polished invoices in seconds and get paid online with Stripe. Customers can pay right from their email." },
        { title: "Lead Management", desc: "Track every lead from first contact to closed job so opportunities never slip through the cracks." },
        { title: "Scheduling", desc: "Schedule jobs, assign techs, and see the week at a glance so the whole crew stays on track." },
        { title: "QR Lead Capture", desc: "Put a QR code on trucks and signs so new customers can scan, submit, and land directly in your CRM." },
        { title: "Estimates", desc: "Send professional estimates fast and convert approved work into scheduled jobs without re-entering everything." },
        { title: "Mobile Ready", desc: "Run the business from the field with a phone-friendly experience your crew can actually use." },
        { title: "Expense Tracking", desc: "Log fuel, blades, equipment, and every business cost. Premier users get full reports and a live P&L so you always know your real profit." },
        { title: "Smart Estimate", desc: "Enter a property's square footage and get an instant price suggestion based on your own tiers — close more jobs faster." },
        { title: "Weather Rescheduling", desc: "Get automatic alerts when bad weather threatens your scheduled jobs so you can reschedule before customers are left waiting." },
        { title: "Payment QR Code", desc: "Show customers a QR code on the spot. They scan, pay, and you're done — no email required." },
        { title: "1099 Tax Reporting", desc: "Track contractor payments all year, flag anyone over the $600 IRS threshold, and export a CSV ready for filing." },
        { title: "Team Management", desc: "Invite technicians and staff, assign roles, and control what each person can see and do inside the app." },
        { title: "Job Templates", desc: "Save your most common jobs as templates so your crew can create new jobs in seconds without re-entering details." },
        { title: "Batch Invoicing", desc: "Select multiple completed jobs and send all their invoices at once — stop billing one job at a time." },
        { title: "Payment Reminders", desc: "Automatically follow up on unpaid invoices at 7 and 14 days so you get paid without the awkward calls." },
        { title: "Customer Tips", desc: "Let happy customers add a tip when they pay online. Every little bit adds up for your crew." },
        { title: "Easy Data Import", desc: "Switching from Jobber, Yardbook, or a spreadsheet? Upload your customer list as a CSV and import hundreds of contacts in seconds \u2014 no manual re-entry required." },
      ],
    },
    testimonial: {
      quote: "\u201cI used to run everything in a notebook and text messages. YardPilot gave me three extra hours a week back and my customers actually pay faster now.\u201d",
      author: "Marcus D. \u2014 Solo lawn care operator, Texas",
    },
    pricing: {
      label: "Pricing",
      title: "Simple, honest pricing",
      sub: "Start free. Scale when you're ready. No hidden fees.",
      bestValue: "\u2B50 Best value",
      popular: "Most popular",
      plans: [
        {
          name: "Basic", price: "$29.99", period: "/mo",
          desc: "Perfect for solo operators getting organized.",
          features: ["Up to 50 customers","Invoices & online payments","Lead management","Job scheduling","QR lead capture","Mobile-ready access","1 user (owner only)","Email support"],
          cta: "Start free trial", href: "/start-trial", highlight: false, premium: false,
        },
        {
          name: "Pro", price: "$39.99", period: "/mo",
          desc: "Best for growing lawn care businesses.",
          features: ["Up to 100 customers","Everything in Basic","Up to 3 users (owner + 2 team)","Multiple technicians","Email tech reminders","Before & after job photos","Automated review requests","Smart Estimate (lot size pricing)","Reusable job templates","Batch invoicing","Automated payment reminders (7 & 14-day)","Customer tips on invoices","Expense tracking","Lead source tracking"],
          cta: "Start free trial", href: "/start-trial", highlight: true, premium: false,
        },
        {
          name: "Premier", price: "$59.99", period: "/mo",
          desc: "For teams that want unlimited scale.",
          features: ["Unlimited customers","Everything included in Pro","Unlimited team users","Expense reports + P&L dashboard","Advanced reporting","Multiple QR codes","Weather-aware rescheduling","Priority support"],
          cta: "Start free trial", href: "/start-trial", highlight: false, premium: true,
        },
      ],
    },
    resources: {
      title: "Resources",
      sub: "Download our guides to get the most out of YardPilot.",
      owner: { title: "Owner & Team Manual", desc: "The complete guide for business owners and their team. Covers every feature — jobs, photos, review requests, team roles, billing, and more.", cta: "Download Owner Manual" },
      customer: { title: "Customer Guide", desc: "A plain-language guide for your customers. Explains how to pay invoices online, leave a Google review, and what to expect after each service.", cta: "Download Customer Guide" },
    },
    cta: {
      title: "Ready to grow your business?",
      sub: "Join lawn care professionals who run their entire operation inside YardPilot. Start your free trial today \u2014 14 days free, card required, cancel anytime.",
      primary: "Start free trial",
      secondary: "Log in",
    },
    footer: {
      features: "Features", pricing: "Pricing", about: "About Us", ownerManual: "Owner Manual",
      customerGuide: "Customer Guide", terms: "Terms of Service",
      privacy: "Privacy Policy", login: "Log in",
    },
  },
  es: {
    nav: { login: "Iniciar sesi\u00f3n", trial: "Prueba gratis" },
    hero: {
      badge: "Hecho para profesionales del cuidado de jardines",
      h1: "Gana m\u00e1s trabajos.",
      h2: "Cobra m\u00e1s r\u00e1pido.",
      h3: "Mant\u00e9n todo organizado.",
      sub: "YardPilot ayuda a los negocios de jardiner\u00eda a administrar clientes, trabajos, facturas y pagos en un solo lugar.",
      cta1: "Prueba gratis",
      cta2: "Ver demo",
      t1: "14 d\u00edas gratis",
      t2: "Listo en minutos",
      t3: "Cancela cuando quieras",
      b1t: "5 estrellas",
      b1s: "de los pros del jard\u00edn",
      b2t: "+500 equipos",
      b2s: "conf\u00edan en YardPilot",
    },
    tour: {
      label: "Recorrido del producto",
      title: "Mira YardPilot en acci\u00f3n",
      sub: "Administra todo tu negocio de jardiner\u00eda \u2014 desde los clientes hasta los cobros.",
      dashboard: { title: "Panel principal", desc: "Ve clientes, trabajos, facturas e ingresos en un solo lugar." },
      schedule: { title: "Programaci\u00f3n", desc: "Organiza tu semana y asigna trabajos a tu equipo f\u00e1cilmente." },
      invoices: { title: "Facturas y pagos", desc: "Env\u00eda facturas profesionales y cobra m\u00e1s r\u00e1pido." },
      leads: { title: "Seguimiento de clientes", desc: "Captura y rastrea a cada cliente potencial desde el primer contacto hasta el cierre." },
    },
    demo: {
      label: "Demo",
      title: "Mira YardPilot en acci\u00f3n",
      sub: "Ve c\u00f3mo un negocio de jardiner\u00eda administra trabajos, clientes y pagos en menos de un minuto.",
      fallback: "Tu navegador no soporta el video.",
    },
    trust: ["Pagos con Stripe incluidos", "Funciona en celular", "Captura de clientes con QR", "Recordatorios diarios al equipo", "Seguridad con doble autenticaci\u00f3n"],
    features: {
      label: "Funciones",
      title: "Todo lo que tu equipo necesita",
      sub: "Hecho especialmente para jardiner\u00eda \u2014 no una herramienta gen\u00e9rica. Cada funci\u00f3n est\u00e1 dise\u00f1ada para c\u00f3mo trabajas en el campo.",
      items: [
        { title: "Facturas y pagos", desc: "Crea facturas profesionales en segundos y cobra en l\u00ednea con Stripe. Tus clientes pueden pagar desde su correo." },
        { title: "Gesti\u00f3n de clientes potenciales", desc: "Rastrea cada cliente desde el primer contacto hasta el trabajo cerrado para que nunca pierdas una oportunidad." },
        { title: "Programaci\u00f3n", desc: "Programa trabajos, asigna t\u00e9cnicos y mira la semana de un vistazo para que todo el equipo est\u00e9 al d\u00eda." },
        { title: "Captura de clientes con QR", desc: "Pon un c\u00f3digo QR en tus camiones y letreros para que nuevos clientes se registren directo en tu CRM." },
        { title: "Cotizaciones", desc: "Env\u00eda cotizaciones r\u00e1pido y conv\u00e9rtelas en trabajos programados sin volver a capturar los datos." },
        { title: "Listo para celular", desc: "Maneja el negocio desde el campo con una app amigable que tu equipo puede usar desde el tel\u00e9fono." },
        { title: "Control de gastos", desc: "Registra gasolina, herramientas y todos los costos del negocio. Los usuarios Premier tienen reportes completos y un resumen de ganancias en tiempo real." },
        { title: "Cotizaci\u00f3n inteligente", desc: "Ingresa los metros cuadrados de la propiedad y obt\u00e9n una sugerencia de precio instant\u00e1nea basada en tus propias tarifas." },
        { title: "Reprogramaci\u00f3n por clima", desc: "Recibe alertas autom\u00e1ticas cuando el mal tiempo amenace tus trabajos programados para que puedas reprogramar antes de que tus clientes se queden esperando." },
        { title: "C\u00f3digo QR de pago", desc: "Mu\u00e9strale a tu cliente un c\u00f3digo QR en el lugar. Escanea, paga y listo \u2014 sin necesidad de correo." },
        { title: "Reportes de impuestos 1099", desc: "Rastrea los pagos a contratistas todo el a\u00f1o, marca a quienes superen los $600 del IRS y exporta un CSV listo para declarar." },
        { title: "Gesti\u00f3n de equipo", desc: "Invita a t\u00e9cnicos y personal, asigna roles y controla lo que cada persona puede ver y hacer dentro de la app." },
        { title: "Plantillas de trabajo", desc: "Guarda tus trabajos m\u00e1s comunes como plantillas para que tu equipo pueda crear nuevos trabajos en segundos sin volver a capturar los datos." },
        { title: "Facturaci\u00f3n en lote", desc: "Selecciona varios trabajos completados y env\u00eda todas sus facturas de una vez \u2014 deja de facturar un trabajo a la vez." },
        { title: "Recordatorios de pago", desc: "Da seguimiento autom\u00e1tico a facturas sin pagar a los 7 y 14 d\u00edas para cobrar sin llamadas inc\u00f3modas." },
        { title: "Propinas de clientes", desc: "Permite que los clientes satisfechos agreguen una propina al pagar en l\u00ednea. Cada d\u00f3lar cuenta para tu equipo." },
        { title: "Importaci\u00f3n de datos", desc: "\u00bfVienes de Jobber, Yardbook o una hoja de c\u00e1lculo? Sube tu lista de clientes en CSV e importa cientos de contactos en segundos \u2014 sin captura manual." },
      ],
    },
    testimonial: {
      quote: "\u201cAntes llevaba todo en un cuaderno y mensajes de texto. YardPilot me devolvi\u00f3 tres horas a la semana y mis clientes ahora pagan m\u00e1s r\u00e1pido.\u201d",
      author: "Marcus D. \u2014 Operador independiente de jardiner\u00eda, Texas",
    },
    pricing: {
      label: "Precios",
      title: "Precios simples y honestos",
      sub: "Empieza gratis. Crece cuando est\u00e9s listo. Sin costos ocultos.",
      bestValue: "\u2B50 Mejor valor",
      popular: "M\u00e1s popular",
      plans: [
        {
          name: "B\u00e1sico", price: "$29.99", period: "/mes",
          desc: "Perfecto para operadores solos que quieren organizarse.",
          features: ["Hasta 50 clientes","Facturas y pagos en l\u00ednea","Gesti\u00f3n de clientes potenciales","Programaci\u00f3n de trabajos","Captura con c\u00f3digo QR","Acceso desde celular","1 usuario (solo due\u00f1o)","Soporte por correo"],
          cta: "Prueba gratis", href: "/start-trial", highlight: false, premium: false,
        },
        {
          name: "Pro", price: "$39.99", period: "/mes",
          desc: "Ideal para negocios de jardiner\u00eda en crecimiento.",
          features: ["Hasta 100 clientes","Todo lo de B\u00e1sico","Hasta 3 usuarios (due\u00f1o + 2 equipo)","M\u00faltiples t\u00e9cnicos","Recordatorios por correo al equipo","Fotos antes y despu\u00e9s del trabajo","Solicitudes autom\u00e1ticas de rese\u00f1as","Cotizaci\u00f3n inteligente por tama\u00f1o","Plantillas de trabajo reutilizables","Facturaci\u00f3n en lote","Recordatorios de pago autom\u00e1ticos (7 y 14 d\u00edas)","Propinas en facturas","Control de gastos","Seguimiento de fuente de clientes"],
          cta: "Prueba gratis", href: "/start-trial", highlight: true, premium: false,
        },
        {
          name: "Premier", price: "$59.99", period: "/mes",
          desc: "Para equipos que quieren escala ilimitada.",
          features: ["Clientes ilimitados","Todo lo incluido en Pro","Usuarios del equipo ilimitados","Reportes de gastos + panel de ganancias","Reportes avanzados","M\u00faltiples c\u00f3digos QR","Reprogramaci\u00f3n por clima","Soporte prioritario"],
          cta: "Prueba gratis", href: "/start-trial", highlight: false, premium: true,
        },
      ],
    },
    resources: {
      title: "Recursos",
      sub: "Descarga nuestras gu\u00edas para aprovechar YardPilot al m\u00e1ximo.",
      owner: { title: "Manual del due\u00f1o y equipo", desc: "La gu\u00eda completa para due\u00f1os y su equipo. Cubre todas las funciones: trabajos, fotos, solicitudes de rese\u00f1as, roles del equipo, facturaci\u00f3n y m\u00e1s.", cta: "Descargar manual del due\u00f1o" },
      customer: { title: "Gu\u00eda para clientes", desc: "Una gu\u00eda sencilla para tus clientes. Explica c\u00f3mo pagar facturas en l\u00ednea, dejar una rese\u00f1a en Google y qu\u00e9 esperar despu\u00e9s de cada servicio.", cta: "Descargar gu\u00eda del cliente" },
    },
    cta: {
      title: "\u00bfListo para hacer crecer tu negocio?",
      sub: "\u00danete a los profesionales del jard\u00edn que manejan toda su operaci\u00f3n dentro de YardPilot. Empieza tu prueba gratis hoy \u2014 14 d\u00edas sin costo, tarjeta requerida, cancela cuando quieras.",
      primary: "Prueba gratis",
      secondary: "Iniciar sesi\u00f3n",
    },
    footer: {
      features: "Funciones", pricing: "Precios", about: "Sobre nosotros", ownerManual: "Manual del due\u00f1o",
      customerGuide: "Gu\u00eda del cliente", terms: "T\u00e9rminos de servicio",
      privacy: "Pol\u00edtica de privacidad", login: "Iniciar sesi\u00f3n",
    },
  },
} as const;

type Lang = keyof typeof T;

// ── Feature icon paths (order matches translation items) ──────────────────────
const FEATURE_ICONS = [
  // Invoicing & Payments
  "M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z",
  // Lead Management
  "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  // Scheduling
  "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5",
  // QR Lead Capture
  "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z",
  // Estimates
  "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  // Mobile Ready
  "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3m-3 3h3m-6 3h.008v.008H6V15z",
  // Expense Tracking
  "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  // Smart Estimate
  "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25",
  // Weather Rescheduling
  "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
  // Payment QR Code
  "M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75z",
  // 1099 Tax Reporting
  "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  // Team Management
  "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  // Job Templates
  "M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6",
  // Batch Invoicing
  "M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3",
  // Payment Reminders
  "M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0",
  // Customer Tips
  "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z",
  // Easy Data Import
  "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
];

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── Nav ─────────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/YardPilot-logo.png" alt="YardPilot" className="h-28 w-auto sm:h-36" />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "en" ? "es" : "en")}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              aria-label="Toggle language"
            >
              <span className="text-base">{lang === "en" ? "🇲🇽" : "🇺🇸"}</span>
              {lang === "en" ? "ES" : "EN"}
            </button>

            <Link href="/about" className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex">
              {lang === "en" ? "About" : "Nosotros"}
            </Link>
            <Link href="/login" className="hidden text-sm font-medium text-slate-600 transition hover:text-slate-900 sm:inline-flex">
              {t.nav.login}
            </Link>
            <Link href="/start-trial" className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(16,185,129,0.25)] transition hover:bg-emerald-500">
              {t.nav.trial}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(15,23,42,0.08),transparent_28%),linear-gradient(to_bottom,#ffffff,rgba(236,253,245,0.9))]" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[-6rem] top-24 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
          <div className="absolute right-[-8rem] top-16 h-80 w-80 rounded-full bg-slate-200/50 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-100/70 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="flex items-center gap-8 xl:gap-12">

            {/* Left photo */}
            <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
              <div className="relative -rotate-2 overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(15,23,42,0.18)] ring-4 ring-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero-worker.png" alt="Lawn care professional" className="h-[480px] w-full object-cover xl:h-[540px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
              </div>
              <div className="ml-4 mt-4 inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-3 py-2 shadow-md">
                <span className="text-lg">⭐</span>
                <div>
                  <p className="text-xs font-bold text-slate-900">{t.hero.b1t}</p>
                  <p className="text-[10px] text-slate-500">{t.hero.b1s}</p>
                </div>
              </div>
            </div>

            {/* Center */}
            <div className="flex-1 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {t.hero.badge}
              </div>

              <h1 className="text-5xl font-extrabold leading-[0.95] tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-6xl xl:text-7xl">
                {t.hero.h1}
                <span className="block text-emerald-600">{t.hero.h2}</span>
                <span className="block text-slate-950">{t.hero.h3}</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">{t.hero.sub}</p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/start-trial" className="inline-flex min-w-[190px] items-center justify-center rounded-2xl bg-emerald-600 px-7 py-4 text-base font-semibold text-white shadow-[0_20px_50px_rgba(16,185,129,0.28)] transition hover:bg-emerald-500">
                  {t.hero.cta1}
                </Link>
                <a href="#demo" className="inline-flex min-w-[190px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50">
                  {t.hero.cta2}
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500">
                {[t.hero.t1, t.hero.t2, t.hero.t3].map((item) => (
                  <span key={item} className="inline-flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-500" />{item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right photo */}
            <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
              <div className="relative rotate-2 overflow-hidden rounded-3xl shadow-[0_30px_80px_rgba(15,23,42,0.18)] ring-4 ring-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/hero-mowing.png" alt="Perfectly mowed lawn" className="h-[480px] w-full object-cover xl:h-[540px]" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent" />
              </div>
              <div className="mr-4 mt-4 flex justify-end">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-white px-3 py-2 shadow-md">
                  <span className="text-lg">🌿</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.hero.b2t}</p>
                    <p className="text-[10px] text-slate-500">{t.hero.b2s}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Product preview */}
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="rounded-[2rem] border border-white/70 bg-white/80 p-3 shadow-[0_30px_100px_rgba(15,23,42,0.14)] ring-1 ring-slate-200/70 backdrop-blur">
              <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/screenshots/dashboard.png" alt="YardPilot dashboard preview" className="w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Screenshots ─────────────────────────────────────────────────────── */}
      <section className="bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{t.tour.label}</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{t.tour.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">{t.tour.sub}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {[
              { img: "dashboard", alt: "YardPilot dashboard", ...t.tour.dashboard },
              { img: "schedule", alt: "YardPilot schedule", ...t.tour.schedule },
              { img: "invoices", alt: "YardPilot invoices", ...t.tour.invoices },
              { img: "leads", alt: "YardPilot leads", ...t.tour.leads },
            ].map((s) => (
              <div key={s.img} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/screenshots/${s.img}.png`} alt={s.alt} className="w-full" />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-950">{s.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo ────────────────────────────────────────────────────────────── */}
      <section id="demo" className="bg-slate-50 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{t.demo.label}</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{t.demo.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{t.demo.sub}</p>
          </div>
          <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-black shadow-xl">
            <video controls preload="metadata" className="w-full" poster="/screenshots/dashboard.png">
              <source src="/demo/yardpilot-demo.mp4" type="video/mp4" />
              {t.demo.fallback}
            </video>
          </div>
        </div>
      </section>

      {/* ── Trust strip ─────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-6 py-5 text-sm font-medium text-slate-500 lg:px-8">
          {t.trust.map((item) => (
            <span key={item} className="inline-flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />{item}
            </span>
          ))}
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="bg-white px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{t.features.label}</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{t.features.title}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{t.features.sub}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {t.features.items.map((f, i) => (
              <div key={f.title} className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-emerald-200 hover:shadow-md">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100">
                  <Icon path={FEATURE_ICONS[i]} />
                </div>
                <h3 className="mb-2 text-base font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm leading-6 text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ─────────────────────────────────────────────────────── */}
      <section className="bg-emerald-700 px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <svg className="mx-auto mb-6 h-10 w-10 text-emerald-300 opacity-60" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M10 8C6.7 8 4 10.7 4 14v10h10V14H7c0-1.7 1.3-3 3-3V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-7c0-1.7 1.3-3 3-3V8z" />
          </svg>
          <p className="text-2xl font-medium leading-relaxed text-white sm:text-3xl">{t.testimonial.quote}</p>
          <p className="mt-8 text-base font-semibold text-emerald-200">{t.testimonial.author}</p>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="bg-slate-50 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">{t.pricing.label}</p>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">{t.pricing.title}</h2>
            <p className="mt-5 text-lg text-slate-600">{t.pricing.sub}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {t.pricing.plans.map((plan) => (
              <div
                key={plan.name}
                className={["relative flex flex-col rounded-2xl border p-8 shadow-sm",
                  plan.premium ? "border-amber-400 bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-[0_20px_60px_rgba(245,158,11,0.35)]"
                  : plan.highlight ? "border-emerald-500 bg-emerald-700 text-white shadow-[0_20px_60px_rgba(16,185,129,0.22)]"
                  : "border-slate-200 bg-white"].join(" ")}
              >
                {plan.premium && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-300 px-4 py-1 text-xs font-semibold text-amber-900 shadow">{t.pricing.bestValue}</span>
                )}
                {plan.highlight && !plan.premium && (
                  <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-4 py-1 text-xs font-semibold text-emerald-900 shadow">{t.pricing.popular}</span>
                )}
                <p className={["text-sm font-semibold uppercase tracking-widest", plan.premium ? "text-amber-100" : plan.highlight ? "text-emerald-300" : "text-emerald-600"].join(" ")}>{plan.name}</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className={["text-5xl font-extrabold", plan.premium || plan.highlight ? "text-white" : "text-slate-950"].join(" ")}>{plan.price}</span>
                  <span className={["mb-1 text-sm", plan.premium ? "text-amber-100" : plan.highlight ? "text-emerald-200" : "text-slate-500"].join(" ")}>{plan.period}</span>
                </div>
                <p className={["mt-2 text-sm", plan.premium ? "text-amber-50" : plan.highlight ? "text-emerald-100" : "text-slate-500"].join(" ")}>{plan.desc}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2 text-sm">
                      <Check className={["mt-0.5 h-4 w-4 shrink-0", plan.premium ? "text-amber-200" : plan.highlight ? "text-emerald-300" : "text-emerald-500"].join(" ")} />
                      <span className={plan.premium ? "text-amber-50" : plan.highlight ? "text-emerald-50" : "text-slate-600"}>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={["mt-8 inline-flex w-full items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition",
                  plan.premium ? "border border-white bg-white !text-amber-700 shadow-md hover:bg-amber-50"
                  : plan.highlight ? "border border-white bg-white !text-slate-900 shadow-md hover:bg-emerald-50"
                  : "bg-emerald-600 text-white hover:bg-emerald-500"].join(" ")}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Resources ───────────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-white px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">{t.resources.title}</h2>
            <p className="mt-2 text-sm text-slate-500">{t.resources.sub}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-6 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">{t.resources.owner.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{t.resources.owner.desc}</p>
              </div>
              <a href="/YardPilot-Owner-Manual.docx" download className="mt-auto inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                {t.resources.owner.cta}
              </a>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950">{t.resources.customer.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-600">{t.resources.customer.desc}</p>
              </div>
              <a href="/YardPilot-Customer-Guide.docx" download className="mt-auto inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-500">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                {t.resources.customer.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-slate-950 px-6 py-24 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{t.cta.title}</h2>
          <p className="mt-5 text-lg text-slate-400">{t.cta.sub}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/start-trial" className="inline-flex min-w-[190px] items-center justify-center rounded-2xl bg-emerald-500 px-7 py-4 text-base font-semibold text-white shadow-[0_20px_50px_rgba(16,185,129,0.22)] transition hover:bg-emerald-400">
              {t.cta.primary}
            </Link>
            <Link href="/login" className="inline-flex min-w-[190px] items-center justify-center rounded-2xl border-2 border-white bg-white px-7 py-4 text-base font-semibold text-slate-900 transition hover:bg-slate-100">
              {t.cta.secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 px-6 pb-10 pt-4 lg:px-8">
        <div className="mx-auto max-w-7xl border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/YardPilot-logo.png" alt="YardPilot" className="h-12 w-auto brightness-0 invert" />
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-400">
              <a href="#features" className="hover:text-white">{t.footer.features}</a>
              <a href="#pricing" className="hover:text-white">{t.footer.pricing}</a>
              <Link href="/about" className="hover:text-white">{t.footer.about}</Link>
              <a href="/YardPilot-Owner-Manual.docx" download className="hover:text-white">{t.footer.ownerManual}</a>
              <a href="/YardPilot-Customer-Guide.docx" download className="hover:text-white">{t.footer.customerGuide}</a>
              <Link href="/terms" className="hover:text-white">{t.footer.terms}</Link>
              <Link href="/privacy" className="hover:text-white">{t.footer.privacy}</Link>
              <Link href="/login" className="hover:text-white">{t.footer.login}</Link>
            </div>
            <p className="text-xs text-slate-600">&copy; {new Date().getFullYear()} YardPilot. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
