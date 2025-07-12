# OntoMatch - Backend Escalable

Backend escalable para OntoMatch construido con NestJS, PostgreSQL y JWT.

## 🚀 Características

- **Autenticación JWT**: Sistema completo de registro y login
- **Base de datos PostgreSQL**: Configurado con TypeORM
- **Arquitectura modular**: Estructura escalable con NestJS
- **Validación de datos**: DTOs con class-validator
- **Encriptación de contraseñas**: Bcrypt para seguridad
- **CORS habilitado**: Para integración con frontend

## 📋 Prerrequisitos

- Node.js (v16 o superior)
- PostgreSQL
- npm o yarn

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd ontomatch-backend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar base de datos**
   - Crear base de datos PostgreSQL llamada `ontomatch`
   - Configurar credenciales en `src/config/typeorm.config.ts`

4. **Variables de entorno**
   Crear archivo `.env` con:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_DATABASE=ontomatch
   JWT_SECRET=supersecret
   JWT_EXPIRES_IN=7d
   PORT=3000
   ```

## 🚀 Ejecución

### Desarrollo
```bash
npm run start:dev
```

### Producción
```bash
npm run build
npm run start:prod
```

## 📚 API Endpoints

### Autenticación
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/login` - Iniciar sesión

### Usuarios
- `GET /users/me` - Obtener perfil del usuario (requiere JWT)

## 🏗️ Estructura del Proyecto

```
src/
├── app.module.ts          # Módulo principal
├── main.ts               # Punto de entrada
├── auth/                 # Módulo de autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   └── strategies/
│       └── jwt.strategy.ts
├── users/                # Módulo de usuarios
│   ├── users.module.ts
│   ├── users.service.ts
│   ├── users.controller.ts
│   └── user.entity.ts
├── common/               # Utilidades comunes
│   └── guards/
│       └── jwt-auth.guard.ts
└── config/               # Configuraciones
    └── typeorm.config.ts
```

## 🔧 Scripts Disponibles

- `npm run start:dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar para producción
- `npm run start:prod` - Ejecutar en modo producción
- `npm run test` - Ejecutar tests
- `npm run lint` - Linting del código

## 🔐 Seguridad

- Contraseñas encriptadas con bcrypt
- JWT para autenticación
- Validación de datos con DTOs
- Guards para proteger rutas

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.
