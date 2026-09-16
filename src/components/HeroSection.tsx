'use client'
import Image from 'next/image'
import { motion } from 'motion/react'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
}

const item = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65 } },
}

export function HeroSection({ whatsappNumber, heroImagen }: { whatsappNumber: string; heroImagen?: string }) {
  const ctaHref = whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#productos'

  return (
    <>
      {/* ── Mobile ── */}
      <section className="md:hidden w-full bg-brand-50">
        {heroImagen ? (
          <Image src={heroImagen} alt="Banner" width={1200} height={600} className="w-full h-auto block" priority sizes="100vw" />
        ) : (
          <div className="relative w-full h-48 bg-brand-100 overflow-hidden flex items-end justify-center">
            <span className="text-[12rem] font-black text-brand-300 leading-none opacity-20 select-none">E</span>
          </div>
        )}
        <motion.div
          className="px-6 py-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={item} className="text-xs tracking-[0.3em] uppercase mb-2 text-brand-500">
            Nueva colección
          </motion.p>
          <motion.h1 variants={item} className="text-2xl font-bold leading-tight mb-5 text-brand-900">
            Todo para tu hogar
          </motion.h1>
          <motion.a
            variants={item}
            href={ctaHref}
            target={whatsappNumber ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="inline-block px-7 py-2.5 text-xs tracking-widest uppercase font-medium border border-brand-800 text-brand-800 hover:bg-brand-800 hover:text-white transition-colors"
          >
            Consultar
          </motion.a>
        </motion.div>
      </section>

      {/* ── Desktop ── */}
      <section className="hidden md:flex relative w-full h-[560px] bg-brand-100 overflow-hidden items-start">
        {heroImagen ? (
          <>
            <Image src={heroImagen} alt="Banner" fill className="object-cover object-center" priority sizes="100vw" />
            <div className="absolute inset-0 bg-black/80 z-10" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-200/80 via-brand-100/60 to-transparent z-10" />
            <div className="absolute inset-0 flex items-end justify-center pb-8 opacity-10 select-none pointer-events-none">
              <span className="text-[20rem] font-black text-brand-400 leading-none">E</span>
            </div>
          </>
        )}
        <motion.div
          className="relative z-20 max-w-6xl mx-auto px-16 pt-16"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.p variants={item} className={`text-xs tracking-[0.3em] uppercase mb-3 ${heroImagen ? 'text-white/70' : 'text-brand-500'}`}>
            Nueva colección
          </motion.p>
          <motion.h1
            variants={item}
            className={`text-5xl font-bold leading-tight mb-6 ${heroImagen ? 'text-white' : 'text-brand-900'}`}
          >
            Todo para tu hogar
          </motion.h1>
        </motion.div>
      </section>
    </>
  )
}
