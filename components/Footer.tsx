'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const faqLinks = [
    { title: 'Preguntas Frecuentes', href: '/faqs#preguntas-frecuentes' },
    { title: 'Política de Devoluciones', href: '/faqs#politica-devoluciones' },
    { title: 'Información de Envíos', href: '/faqs#informacion-envios' },
    { title: 'Términos de Descuentos', href: '/faqs#terminos-descuentos' },
    { title: 'Términos y Condiciones', href: '/faqs#terminos-condiciones' },
  ];

  const quickLinks = [
    { title: 'Inicio', href: '/' },
    { title: 'Catálogo', href: '/catalog' },
    { title: 'Sobre Nosotros', href: '/#sobre-nosotros' },
  ];

  const socialLinks = [
    { icon: Instagram, href: 'https://www.instagram.com/saharaessence_oficial/', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-background to-muted/30 border-t border-border">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <h3 className="font-cormorant text-3xl font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Sahara Essence
            </h3>
            <p className="font-inter text-sm text-muted-foreground leading-relaxed">
              Experiencias olfativas únicas que despiertan emociones y crean momentos inolvidables.
            </p>
            <div className="flex gap-4 pt-2">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  aria-label={social.label}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 transition-colors"
                >
                  <social.icon size={20} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* FAQ Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-inter font-semibold text-lg mb-4 text-foreground">
              Ayuda e Información
            </h4>
            <ul className="space-y-3">
              {faqLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="font-inter text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors inline-flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-amber-600 dark:bg-amber-400 transition-all duration-300 mr-0 group-hover:mr-2" />
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h4 className="font-inter font-semibold text-lg mb-4 text-foreground">
              Contacto
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Manizales, Caldas, Colombia</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Mail size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <a href="mailto:saharaessence.oficial@gmail.com" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  saharaessence.oficial@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <Phone size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <a href="tel:+573001234567" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                  +57 321 697 4038
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="pt-8 border-t border-border"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-inter text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Sahara Essence. Todos los derechos reservados.
            </p>
            <div className="flex gap-6">
              <Link
                href="/faqs#politica-devoluciones"
                className="font-inter text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/faqs#terminos-condiciones"
                className="font-inter text-sm text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                Términos de Uso
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}