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
├── games.json       # Base de datos de juegos (editable)
└── README.md        # Este archivo
```

---

## ⚙️ Cómo agregar o editar juegos

Todos los juegos se gestionan desde el archivo **`games.json`**. Cada juego tiene esta estructura:

```json
{
  "id": 9,
  "title": "Nombre del juego",
  "description": "Descripción breve de qué aprende el estudiante.",
  "author": "Nombre Apellido",
  "tags": ["Etiqueta 1", "Etiqueta 2", "Etiqueta 3"],
  "playtime": "15 min",
  "difficulty": "Media",
  "thumbnail": "https://url-de-la-imagen-miniatura.jpg",
  "screenshot": "https://url-de-la-imagen-grande.jpg",
  "geniallyUrl": "https://view.genially.com/tu-juego"
}
```

### Valores válidos

| Campo        | Opciones disponibles |
|--------------|----------------------|
| `difficulty` | `Fácil` · `Media` · `Alta` |
| `playtime`   | `5 min` · `10 min` · `15 min` · `20 min` · `25 min` · `30 min` · `45 min` · `60 min` |
| `tags`       | Ver listado completo abajo |

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

---

## 🚀 Funcionalidades

- **Tema oscuro cinematográfico** — diseño estilo Steam/YouTube con acentos en cyan y violeta
- **Búsqueda en tiempo real** — filtra por título, descripción o etiquetas mientras escribís
- **Tarjetas animadas** — hover con escala, overlay y efectos de luz
- **Modal detallado** — muestra descripción completa, metadatos, etiquetas y autor
- **Efecto de lanzamiento** — animación glitch al hacer clic en ¡Jugar! antes de abrir Genially
- **100% data-driven** — todo el contenido viene de `games.json`, sin tocar el HTML
- **Fallback integrado** — si `games.json` no carga, la app usa los datos embebidos en `app.js`

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura semántica y accesible |
| [Tailwind CSS](https://tailwindcss.com) (CDN) | Utilidades de estilo |
| JavaScript ES6+ | Lógica, estado y DOM |
| [Syne](https://fonts.google.com/specimen/Syne) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) | Tipografía |
| Canvas API | Partículas de fondo animadas |
| [Genially](https://genially.com) | Plataforma de los juegos interactivos |

---

## 📋 Hoja de carga para docentes

Para facilitar la carga de nuevos juegos, existe una **planilla Excel** con menús desplegables para etiquetas, dificultad y tiempo de juego. Pedísela al administrador del portal.

---

## 👤 Autor

Desarrollado por **Lucas Ubiedo** para el proyecto de Ciudadanía Digital.

---

## 📄 Licencia

Este proyecto es de uso educativo libre. Los juegos enlazados pertenecen a sus respectivos autores.
