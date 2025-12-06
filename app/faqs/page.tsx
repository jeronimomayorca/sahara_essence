import FAQSection from '@/components/FAQSection';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes | Sahara Essence',
  description: 'Encuentra respuestas a las preguntas más comunes sobre nuestros productos, envíos, devoluciones y más.',
};

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-background">
      <FAQSection />
    </div>
  );
}