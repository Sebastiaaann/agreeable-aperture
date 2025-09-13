# Fletes Marcelo

Sitio web estático construido con **Astro** para presentar los servicios de transporte, fletes y mudanzas de "Fletes Marcelo" en Puerto Montt y la Región de Los Lagos (Chile).

## � Estructura del Proyecto
```
public/
	favicon.svg
	global.css        # Estilos globales
src/
	layouts/BaseLayout.astro
	pages/index.astro
	components/
		Header.astro
		Hero.astro
		About.astro
		Services.astro
		ContactForm.astro
		Footer.astro
```

## 🧞 Scripts
| Comando | Descripción |
|---------|-------------|
| `npm install` | Instala dependencias |
| `npm run dev` | Inicia servidor de desarrollo (http://localhost:4321) |
| `npm run build` | Genera la versión para producción en `dist/` |
| `npm run preview` | Previsualiza el build localmente |

## ✅ Requisitos Previos
- Node.js 18+ (LTS recomendado)
- npm (incluido con Node)

## 🚀 Inicio Rápido
```bash
npm install
npm run dev
```
Abre: http://localhost:4321

## 🔧 Personalización Rápida
Actualiza datos de contacto (WhatsApp, correo):
- Buscar `569XXXXXXXX` y `fletesmarcelo@email.com` en componentes.

Imágenes:
- Reemplaza `public/hero-placeholder.jpg` por una imagen panorámica (ej. camión / carretera). Tamaño ideal ~1800×900 comprimido.
- Reemplaza `public/marcelo-placeholder.jpg` por la foto real (optimizar a 150–300 KB).

Colores / estilos: editar variables CSS en `public/global.css`.

## 📬 Formulario de Contacto
Actualmente simula el envío en el navegador. Opciones para hacerlo real:
1. Formspree / Getform / Basin (sin backend propio).
2. Función serverless (Netlify / Vercel) + servicio de correo (Resend, SendGrid, Mailgun).
3. Backend propio (Node, etc.).

Ejemplo con Formspree (reemplaza el formulario en `ContactForm.astro`):
```html
<form action="https://formspree.io/f/tu_codigo" method="POST" class="contact-form">
	<input name="name" required />
	<input type="email" name="email" required />
	<textarea name="message" required></textarea>
	<button type="submit" class="btn btn-primary">Enviar Consulta</button>
</form>
```
Elimina el `<script>` de simulación al usar un servicio real.

## 📦 Deploy
| Plataforma | Notas |
|------------|-------|
| Netlify | Build command: `npm run build` – Publish: `dist` |
| Vercel | Detecta Astro automáticamente |
| GitHub Pages | Ejecutar build y subir carpeta `dist` |

## ⚙️ Optimización Recomendada
- Comprimir imágenes (TinyPNG / Squoosh).
- Agregar meta tags Open Graph y favicon PNG 512x512.
- Integrar analítica ligera (Plausible / Umami).
- Implementar sitemap y robots.txt (Astro add integraciones si se requiere).

## � Próximas Mejores (ideas)
- Integrar envío real de formulario.
- Página separada de tarifas o calculadora simple.
- Testimonios de clientes.
- Botón flotante de WhatsApp.

## © Licencia
Uso interno / propietario. Ajustar según se necesite.

---
Hecho con ❤️ usando Astro.
