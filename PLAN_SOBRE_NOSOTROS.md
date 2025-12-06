# Plan de Implementación: Sección "Sobre Nosotros"

## 📋 Resumen
Transformar la sección "Nuestra Visión" en "Sobre Nosotros" con animaciones dramáticas y llamativas que reflejen la esencia del desierto Sahara.

## 🎯 Objetivos

1. **Cambio Simple**: Agregar padding al botón de chat en `AIChatButton.tsx`
2. **Transformación de Sección**: Convertir "Nuestra Visión" en "Sobre Nosotros" con nuevo contenido
3. **Animaciones de Lujo**: Implementar efectos visuales dramáticos y premium

## 📝 Contenido Nuevo

### Texto Principal (3 párrafos):

**Párrafo 1 - Introducción:**
"En Sahara Essence creemos que un aroma tiene el poder de despertar recuerdos, emociones y sensaciones profundas. Nacimos en Manizales, Colombia, como un proyecto que buscaba algo más que vender perfumes: queríamos crear experiencias olfativas que hicieran sentir especial a cada persona."

**Párrafo 2 - Propuesta de Valor:**
"Hoy somos una tienda virtual que llega a cualquier rincón del país, ofreciendo perfumes de alta calidad, empaques especiales y una experiencia de atención cálida, cercana y memorable. Cada vez que un cliente recibe su fragancia, queremos que sienta que no adquirió solo un perfume: adquirió un momento, una sensación, un detalle."

**Párrafo 3 - Significado del Nombre:**
"Elegimos el nombre Sahara Essence porque el Sahara representa inmensidad, misterio y fuerza. El desierto más grande del mundo es un lugar lleno de contrastes: puede ser cálido e intenso, suave y silencioso, vasto y poderoso. Así como el Sahara guarda historias en cada una de sus arenas, creemos que cada persona guarda una historia en su aroma."

## 🎨 Diseño de Animaciones

### 1. Estructura Visual

```
┌─────────────────────────────────────────────┐
│  [Partículas flotantes doradas/arena]      │
│                                             │
│  ╔═══════════════════════════════════════╗ │
│  ║   "SOBRE NOSOTROS"                    ║ │
│  ║   (Título con efecto de brillo)       ║ │
│  ╚═══════════════════════════════════════╝ │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Párrafo 1                           │   │
│  │ (Reveal letra por letra)            │   │
│  │ [Efecto shimmer al aparecer]        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Párrafo 2                           │   │
│  │ (Reveal con delay)                  │   │
│  │ [Transformación 3D sutil]           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Párrafo 3                           │   │
│  │ (Reveal con delay mayor)            │   │
│  │ [Efecto de arena cayendo]           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [Gradiente animado de fondo]              │
└─────────────────────────────────────────────┘
```

### 2. Animaciones Específicas

#### A. Título "Sobre Nosotros"
- **Efecto**: Aparición con brillo dorado que recorre el texto
- **Técnica**: GSAP con gradiente animado
- **Duración**: 2 segundos
- **Trigger**: Al entrar en viewport (80% visible)

#### B. Texto Letra por Letra
- **Efecto**: Cada letra aparece individualmente con fade-in y scale
- **Técnica**: Split text con GSAP stagger
- **Duración**: 0.05s por letra
- **Efecto adicional**: Shimmer dorado al completar cada palabra

#### C. Partículas Flotantes
- **Cantidad**: 20-30 partículas
- **Colores**: Dorado (#D4AF37), Ámbar (#FFBF00), Arena (#C2B280)
- **Movimiento**: Float aleatorio con CSS animations
- **Tamaño**: Variable (2px - 8px)
- **Opacidad**: 0.3 - 0.7

#### D. Transformaciones 3D
- **Efecto**: Rotación sutil en eje Y al hacer scroll
- **Rango**: -5deg a 5deg
- **Trigger**: ScrollTrigger con scrub
- **Perspectiva**: 1000px

#### E. Gradiente Animado de Fondo
- **Colores**: 
  - Inicio: `from-amber-50/30 via-orange-50/20 to-yellow-50/30`
  - Dark: `from-amber-950/10 via-orange-950/5 to-yellow-950/10`
- **Animación**: Movimiento ondulante (keyframes)
- **Duración**: 15s loop infinito

#### F. Efecto Shimmer
- **Técnica**: Pseudo-elemento con gradiente lineal animado
- **Colores**: Transparente → Dorado → Transparente
- **Duración**: 1.5s
- **Timing**: Después de completar reveal de cada párrafo

### 3. Interactividad

#### Hover en Párrafos
- **Efecto**: Elevación 3D con sombra
- **Transform**: `translateZ(20px) rotateX(2deg)`
- **Transición**: 0.3s ease-out
- **Sombra**: Aumenta y se vuelve más dorada

## 🛠️ Implementación Técnica

### Cambios en `components/AIChatButton.tsx`

```typescript
// Línea 221 - Agregar padding
className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-5 rounded-full shadow-lg hover:shadow-xl transition-all"
// Cambiar p-4 a p-5
```

### Cambios en `app/page.tsx`

#### 1. Imports Adicionales
```typescript
import { useRef, useState, useEffect } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
```

#### 2. Nueva Sección "Sobre Nosotros"

**Estructura HTML:**
```tsx
<section className="relative py-32 px-4 overflow-hidden">
  {/* Partículas flotantes */}
  <div className="absolute inset-0 pointer-events-none">
    {/* 30 partículas con posiciones aleatorias */}
  </div>
  
  {/* Gradiente animado de fondo */}
  <div className="absolute inset-0 bg-gradient-animated" />
  
  {/* Contenido */}
  <div className="max-w-4xl mx-auto relative z-10">
    <h2 className="title-with-shine">Sobre Nosotros</h2>
    
    <div className="space-y-8">
      <p className="paragraph-reveal paragraph-1">{/* Párrafo 1 */}</p>
      <p className="paragraph-reveal paragraph-2">{/* Párrafo 2 */}</p>
      <p className="paragraph-reveal paragraph-3">{/* Párrafo 3 */}</p>
    </div>
  </div>
</section>
```

#### 3. Animaciones GSAP

```typescript
useEffect(() => {
  const ctx = gsap.context(() => {
    // Título con brillo
    gsap.from(".title-with-shine", {
      opacity: 0,
      y: 50,
      duration: 1,
      scrollTrigger: {
        trigger: ".title-with-shine",
        start: "top 80%",
      }
    });
    
    // Texto letra por letra
    const paragraphs = gsap.utils.toArray(".paragraph-reveal");
    paragraphs.forEach((paragraph, index) => {
      const chars = paragraph.textContent.split("");
      paragraph.innerHTML = chars.map(char => 
        `<span class="char">${char}</span>`
      ).join("");
      
      gsap.from(paragraph.querySelectorAll(".char"), {
        opacity: 0,
        y: 20,
        scale: 0.8,
        stagger: 0.05,
        duration: 0.5,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: paragraph,
          start: "top 75%",
        }
      });
    });
    
    // Transformación 3D en scroll
    gsap.to(".paragraph-reveal", {
      rotationY: 5,
      scrollTrigger: {
        trigger: ".sobre-nosotros-section",
        start: "top center",
        end: "bottom center",
        scrub: 1,
      }
    });
  });
  
  return () => ctx.revert();
}, []);
```

#### 4. CSS Personalizado

```css
/* Partículas flotantes */
@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(-10px); }
  75% { transform: translateY(-30px) translateX(5px); }
}

/* Gradiente animado */
@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* Efecto shimmer */
@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}

/* Brillo en título */
@keyframes title-shine {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
```

## 📱 Responsive Design

### Mobile (< 768px)
- Reducir cantidad de partículas a 15
- Simplificar animaciones 3D
- Texto más grande y espaciado
- Animaciones más rápidas (0.03s por letra)

### Tablet (768px - 1024px)
- 20 partículas
- Animaciones completas pero optimizadas
- Ajustar perspectiva 3D

### Desktop (> 1024px)
- Todas las animaciones completas
- 30 partículas
- Efectos de hover más pronunciados

## ⚡ Optimización de Performance

1. **GPU Acceleration**: Usar `transform` y `opacity` para animaciones
2. **Will-change**: Aplicar a elementos animados
3. **Lazy Loading**: Iniciar animaciones solo cuando la sección es visible
4. **Throttle**: Limitar actualizaciones en scroll
5. **Reduce Motion**: Respetar preferencias de accesibilidad

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🎭 Modos de Color

### Light Mode
- Partículas: Dorado brillante (#D4AF37)
- Fondo: Gradiente cálido suave
- Texto: Gris oscuro con sombra sutil

### Dark Mode
- Partículas: Dorado más tenue (#B8860B)
- Fondo: Gradiente oscuro con toques dorados
- Texto: Blanco/gris claro con glow dorado

## ✅ Checklist de Implementación

- [ ] Modificar padding en AIChatButton.tsx
- [ ] Crear componente de partículas flotantes
- [ ] Implementar animación de título con brillo
- [ ] Crear función de split text para reveal letra por letra
- [ ] Agregar gradiente animado de fondo
- [ ] Implementar transformaciones 3D con ScrollTrigger
- [ ] Agregar efectos shimmer
- [ ] Crear estilos hover interactivos
- [ ] Optimizar para mobile
- [ ] Probar en dark mode
- [ ] Verificar performance
- [ ] Probar accesibilidad (reduced motion)

## 🚀 Próximos Pasos

1. **Aprobar este plan**
2. **Cambiar a modo Code** para implementación
3. **Realizar cambios iterativamente**
4. **Probar en navegador**
5. **Ajustar según feedback**

---

**Nota**: Este plan prioriza animaciones dramáticas y llamativas manteniendo la performance y accesibilidad. Las animaciones están diseñadas para evocar la majestuosidad del desierto Sahara con efectos dorados, movimientos fluidos y revelaciones impactantes.