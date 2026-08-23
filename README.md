# Centro de Conciliación Armonía Concertada

Sitio web institucional del **Centro de Conciliación Armonía Concertada**, enfocado en la
resolución alternativa de conflictos, con servicios de conciliación, insolvencia, acuerdos
de apoyo y formación.

Vigilado por el Ministerio de Justicia y del Derecho.

## Tecnologías utilizadas

- HTML5
- Tailwind CSS (CDN)
- CSS personalizado
- JavaScript Vanilla
- Google Fonts (Inter)
- Google Maps Embed
- WhatsApp API

## Estructura del proyecto

```
Pagina Web Armonia/
├── index.html          Página principal (todas las secciones)
├── README.md
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── css/
│   └── styles.css      Estilos personalizados y animaciones
├── img/                Fotos del equipo (equipo-*.jpg) y archivos del logo
├── js/
│   └── main.js         Menú móvil, scroll, formulario, WhatsApp
└── pages/
    └── terminos-y-privacidad.html   Términos y Condiciones + Política de Datos
```

## Cómo ejecutar el proyecto

1. Clona o descarga el repositorio
2. Abre el archivo `index.html` en tu navegador
3. No requiere servidor ni instalación adicional

## Características principales

- Diseño moderno y responsive
- Navegación suave (scroll)
- Menú móvil
- Formulario de contacto validado que se envía por WhatsApp
- Botón flotante de WhatsApp con dos líneas (Insolvencias y Conciliación)
- Integración con Google Maps

## Datos de contacto

- **Teléfono Insolvencias:** 312 6 410 449
- **Teléfono Conciliación:** 313 2 904 984
- **Correo:** contacto@armoniaconcertada.co
- **Dirección:** Oficina 306, Edificio Osaka Trade Center, Bogotá
- **Horario de atención:** Lunes a viernes de 9:00 a.m. a 6:00 p.m.

## Logo

Archivos en `img/`, derivados del logo original (JPG 1024x1024 con fondo blanco),
convertidos a PNG con fondo transparente:

| Archivo | Tamaño | Uso |
|---|---|---|
| `logo-afcjc.png` | 256x252 | Header y footer (emblema: tucán + círculo + AFCJC) |
| `logo-afcjc-completo.png` | 1024x1024 | Versión maestra con el nombre completo, para impresión u otros usos |
| `favicon.png` | 64x63 | Icono de pestaña del navegador |
| `apple-touch-icon.png` | 180x177 | Icono para iOS (con fondo blanco, iOS no admite transparencia) |

El logo es un trazo negro sobre fondo claro, por lo que en el footer (fondo negro) se
monta sobre una placa blanca redondeada para que el círculo y el texto "AFCJC" se lean.

## Notas técnicas

- El proyecto utiliza Tailwind CSS vía CDN para simplicidad.
- El CSS personalizado se encuentra separado para facilitar mantenimiento.
- Los datos de contacto aparecen en la sección "Contáctanos", en el footer y en los
  metadatos del `<head>` de `index.html`. Si cambian, deben actualizarse en esos tres lugares.
- El formulario de contacto no usa backend ni servicio de correo: arma un mensaje de
  WhatsApp y abre la conversación. La línea que recibe los mensajes se cambia en la
  constante `WHATSAPP_FORMULARIO`, al inicio de `js/main.js`.

## Licencia

© 2026 Centro de Conciliación Armonía Concertada
Todos los derechos reservados.

Desarrollado por Maximiliano Jaramillo Malavera.
