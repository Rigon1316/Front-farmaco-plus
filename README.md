# Farmaco Plus - Sistema de Gestión de Farmacia

Sistema completo de gestión para farmacias desarrollado con React + Vite, que permite administrar medicamentos, clientes, ventas y alertas de inventario.

## 🚀 Características Principales

### 📦 Gestión de Medicamentos

- **Inventario completo**: Registro, edición y eliminación de medicamentos
- **Control de stock**: Seguimiento de cantidades disponibles
- **Categorización**: Organización por categorías de medicamentos
- **Alertas automáticas**: Notificaciones cuando el stock es bajo

### 👥 Gestión de Clientes

- **Base de datos de clientes**: Registro completo de información
- **Historial de compras**: Seguimiento de transacciones por cliente
- **Búsqueda avanzada**: Filtros y búsqueda por nombre, email, etc.

### 💰 Sistema de Ventas

- **Registro de ventas**: Captura completa de transacciones
- **Múltiples productos**: Ventas con múltiples medicamentos
- **Cálculo automático**: Totales y descuentos automáticos
- **Historial detallado**: Consulta de todas las ventas realizadas

### ⚠️ Sistema de Alertas

- **Notificaciones en tiempo real**: Alertas de stock bajo
- **Contador de alertas**: Indicador visual en la interfaz
- **Gestión centralizada**: Control de alertas desde el dashboard

### 🤖 Consultas con IA

- **Asistente inteligente**: Consultas sobre medicamentos y ventas
- **Respuestas contextuales**: Información relevante del sistema
- **Interfaz conversacional**: Chat intuitivo para consultas

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **Iconos**: React Icons (FontAwesome)
- **Enrutamiento**: React Router DOM
- **Estilos**: CSS3 con diseño responsive
- **Estado**: Context API para notificaciones

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Button.jsx      # Botón personalizado
│   ├── Header.jsx      # Encabezado de la aplicación
│   ├── Modal.jsx       # Modal para confirmaciones
│   ├── ConnectionTest.jsx # Prueba de conectividad
│   └── DataTest.jsx    # Prueba de datos
├── pages/              # Páginas principales
│   ├── HomePage.jsx    # Dashboard principal
│   ├── MedicamentosPage.jsx # Gestión de medicamentos
│   ├── ClientesPage.jsx     # Gestión de clientes
│   ├── VentaPage.jsx        # Registro de ventas
│   ├── VentasPage.jsx       # Historial de ventas
│   ├── AlertasPage.jsx      # Sistema de alertas
│   ├── CategoriasPage.jsx   # Gestión de categorías
│   ├── ProductosPage.jsx    # Gestión de productos
│   └── ConsultasIA.jsx      # Chat con IA
├── layouts/            # Layouts de la aplicación
│   └── MainLayout.jsx  # Layout principal
├── config/             # Configuración
│   └── api.js          # Configuración de API
├── utils/              # Utilidades
│   ├── dateUtils.js    # Utilidades de fechas
│   └── NotificationContext.jsx # Contexto de notificaciones
└── assets/             # Recursos estáticos
```

## 🚀 Instalación y Ejecución

### Prerrequisitos

- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**

   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd front-reto
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**

   ```bash
   npm run dev
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 📜 Scripts Disponibles

- `npm run dev`: Levanta el servidor de desarrollo
- `npm run build`: Compila el proyecto para producción
- `npm run preview`: Previsualiza la build de producción

## 🎨 Características de la Interfaz

### Diseño Responsive

- Adaptable a diferentes tamaños de pantalla
- Navegación intuitiva y accesible
- Interfaz moderna con animaciones suaves

### Sistema de Notificaciones

- Alertas visuales para stock bajo
- Contador de notificaciones en tiempo real
- Gestión centralizada de alertas

### Navegación

- Menú lateral con acceso rápido a todas las secciones
- Breadcrumbs para navegación clara
- Enlaces directos desde el dashboard principal

## 🔧 Configuración

### Variables de Entorno

El proyecto utiliza un archivo de configuración en `src/config/api.js` para manejar las URLs de la API.

### Personalización

- Colores y estilos se pueden modificar en los archivos CSS correspondientes
- Iconos se pueden cambiar usando React Icons
- Layouts se pueden personalizar en la carpeta `layouts/`

## 📊 Funcionalidades Destacadas

1. **Dashboard Inteligente**: Vista general con acceso rápido a todas las funciones
2. **Gestión Completa**: CRUD completo para medicamentos, clientes y ventas
3. **Alertas Automáticas**: Sistema de notificaciones para stock bajo
4. **Interfaz Moderna**: Diseño limpio y profesional
5. **Responsive Design**: Funciona en dispositivos móviles y desktop

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado para el sistema de gestión de farmacias Farmaco Plus.

---

**Farmaco Plus** - Simplificando la gestión farmacéutica con tecnología moderna.
