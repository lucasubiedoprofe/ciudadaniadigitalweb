# 🌐 Portal de Ciudadanía Digital

> Una plataforma educativa tipo arcade para explorar y jugar juegos interactivos sobre competencias digitales, construida con HTML5, Tailwind CSS y JavaScript vanilla.

[![Ver en vivo](https://img.shields.io/badge/🚀_Ver_en_vivo-GitHub_Pages-blue?style=for-the-badge)](https://lucasubiedoprofe.github.io/ciudadaniadigitalweb/)

---

## ✨ Demo

**👉 [https://lucasubiedoprofe.github.io/ciudadaniadigitalweb/](https://lucasubiedoprofe.github.io/ciudadaniadigitalweb/)**

---

## 📖 Descripción

El **Portal de Ciudadanía Digital** es un hub educativo de juegos interactivos creados en [Genially](https://genially.com), organizados bajo la temática de la ciudadanía digital. Está diseñado para que docentes puedan centralizar y compartir sus actividades con estudiantes de forma atractiva y moderna.

Los juegos cubren temáticas como:

- 🔐 Ciberseguridad y contraseñas
- 🔏 Privacidad y datos personales
- 💬 Netiqueta y comunicación digital
- 📰 Fake news y pensamiento crítico
- 👣 Huella digital e identidad online
- 🤝 Convivencia y ciberacoso

---

## 🗂️ Estructura del proyecto

```
ciudadaniadigitalweb/
├── index.html       # Estructura principal de la app
├── app.js           # Lógica, búsqueda, modal y animaciones
├── img/             # Imágenes de los juegos (1.png, 2.png, …)
└── README.md        # Este archivo
```

---

## ⚙️ Cómo agregar o editar juegos

Todos los juegos se gestionan desde una **hoja de Google Sheets** publicada como TSV. La app obtiene los datos automáticamente desde esa URL pública cada vez que se carga.

### Estructura de columnas

Cada fila de la planilla representa un juego con las siguientes columnas, en este orden:

| Columna          | Descripción |
|------------------|-------------|
| `Autor`          | Nombre/s y apellido/s del autor o autores |
| `Título`         | Nombre del juego |
| `Descripción`    | Descripción breve de qué aprende el estudiante |
| `Etiqueta 1`     | Primera etiqueta temática |
| `Etiqueta 2`     | Segunda etiqueta temática |
| `Etiqueta 3`     | Tercera etiqueta temática |
| `Tiempo de Juego`| Duración estimada (ej: `10 min`) |
| `Dificultad`     | Nivel de dificultad |
| `URL de Genially`| URL del juego en Genially |

### 🖼️ Imágenes de los juegos

Las imágenes **no se gestionan desde el Google Sheets**. Se agregan manualmente a la carpeta `img/` del proyecto, y se nombran según el orden del juego en la planilla:

- El primer juego de la hoja → `img/1.png`
- El segundo juego → `img/2.png`
- Y así sucesivamente...

> ⚠️ Cada vez que se agregue un juego nuevo al Google Sheets, hay que subir la imagen correspondiente a `img/` con el número que le toca según su posición en la planilla.

---

### Valores válidos

| Campo            | Opciones disponibles |
|------------------|----------------------|
| `Dificultad`     | `Fácil` · `Media` · `Alta` |
| `Tiempo de Juego`| `5 min` · `10 min` · `15 min` · `20 min` · `25 min` · `30 min` · `45 min` · `60 min` |
| `Etiqueta 1/2/3` | Ver listado completo abajo |

### 🏷️ Etiquetas disponibles

```
Ciberseguridad · Contraseñas · Phishing · Malware · VPN · WiFi
Privacidad · Datos Personales · Redes Sociales · Configuración de Privacidad
Netiqueta · Comunicación Digital · Respeto Digital · Lenguaje Online
Derechos Digitales · Propiedad Intelectual · Licencias · Ética Digital · Libertad de Expresión
Desinformación · Fake News · Pensamiento Crítico · Verificación de Fuentes
Huella Digital · Identidad Online · Reputación Digital
Ciberacoso · Bullying Digital · Empatía Digital · Convivencia Online
Salud Digital · Tiempo de Pantalla · Adicción Tecnológica · Compras Online · Fraude Digital
```

### 🔗 Cómo publicar la hoja como TSV

1. Abrí el Google Sheets con los juegos
2. Ir a **Archivo → Compartir → Publicar en la web**
3. Seleccionar la hoja correcta y el formato **Valores separados por tabulaciones (.tsv)**
4. Hacer clic en **Publicar** y copiar la URL generada
5. Pegá esa URL en la variable correspondiente dentro de `app.js`

> ⚠️ Cualquier cambio en la planilla se refleja automáticamente en el portal al recargar la página. No es necesario tocar el código.

---

## 🚀 Funcionalidades

- **Tema oscuro cinematográfico** — diseño estilo Steam/YouTube con acentos en cyan y violeta
- **Búsqueda en tiempo real** — filtra por título, descripción, etiquetas o autor mientras escribís
- **Tarjetas animadas** — hover con escala, overlay y efectos de luz
- **Modal detallado** — muestra descripción completa, metadatos, etiquetas y autor
- **Efecto de lanzamiento** — animación al hacer clic en ¡Jugar! antes de abrir Genially
- **100% data-driven** — todo el contenido viene del Google Sheets, sin tocar el HTML
- **Caché local** — los datos del Sheets se guardan en `localStorage`; si el Sheets no está disponible al recargar, la app usa la última versión guardada en el navegador
- **Imagen de respaldo** — si falta el `.png` de un juego en `img/`, se muestra automáticamente una imagen genérica de placeholder

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica y accesible |
| [Tailwind CSS](https://tailwindcss.com) (CDN) | Utilidades de estilo |
| JavaScript ES6+ | Lógica, estado y DOM |
| [Syne](https://fonts.google.com/specimen/Syne) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Tipografía |
| Canvas API | Partículas de fondo animadas |
| [Google Sheets](https://sheets.google.com) (TSV publicado) | Base de datos de juegos |
| [Genially](https://genially.com) | Plataforma de los juegos interactivos |

---

## 👤 Autor

Desarrollado por **Lucas Ubiedo** para el proyecto de Ciudadanía Digital.

---

## 📄 Licencia

Este proyecto es de uso educativo libre. Los juegos enlazados pertenecen a sus respectivos autores.