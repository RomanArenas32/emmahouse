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
  return (
    <section className="relative w-full h-[420px] md:h-[560px] bg-brand-100 overflow-hidden flex items-center">
      {heroImagen ? (
        <>
          <Image src={heroImagen} alt="Banner" fill className="object-cover object-center" priority sizes="100vw" />
          <div className="absolute inset-0 bg-black/70 z-10" />
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
        className="relative z-20 max-w-6xl mx-auto px-8 md:px-16"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p variants={item} className={`text-xs tracking-[0.3em] uppercase mb-3 ${heroImagen ? 'text-white/70' : 'text-brand-500'}`}>
          Nueva colección
        </motion.p>
        <motion.h1
          variants={item}
          className={`text-4xl md:text-6xl font-bold leading-tight mb-6 max-w-lg ${heroImagen ? 'text-white' : 'text-brand-900'}`}
        >
          Todo para<br />tu hogar
        </motion.h1>
        <motion.a
          variants={item}
          href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : '#productos'}
          target={whatsappNumber ? '_blank' : undefined}
          rel="noopener noreferrer"
          className={`inline-block px-8 py-3 text-xs tracking-widest uppercase font-medium transition-colors ${heroImagen ? 'border border-white text-white hover:bg-white hover:text-brand-900' : 'border border-brand-800 text-brand-800 hover:bg-brand-800 hover:text-white'}`}
        >
          Consultar
        </motion.a>
      </motion.div>
    </section>
  )
}
