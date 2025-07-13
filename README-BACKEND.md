# SerMatch - Backend API

## Descripción
Backend para OntoMatch construido con NestJS, PostgreSQL y JWT para autenticación.

## Endpoints de Autenticación

### POST /auth/register
Registra un nuevo usuario.

**Body:**
```json
{
  "name": "Usuario Test",
  "email": "test@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "Usuario Test",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /auth/login
Inicia sesión de un usuario existente.

**Body:**
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "name": "Usuario Test",
    "email": "test@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /auth/profile
Obtiene el perfil del usuario autenticado.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Usuario Test",
  "email": "test@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Configuración

### Base de Datos
- **Tipo:** PostgreSQL
- **Host:** localhost:5432
- **Base de datos:** ontomatch
- **Usuario:** postgres

### JWT
- **Secret:** supersecret
- **Expiración:** 7 días

## Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run start:dev

# Ejecutar en producción
npm run start:prod
```

## Integración con Frontend

El backend está configurado para trabajar con el frontend en `http://localhost:5173`:

- CORS habilitado para el frontend
- Validación de datos con class-validator
- Manejo de errores consistente
- Respuestas en formato JSON

## Pruebas

Usa el archivo `test-api.http` para probar los endpoints con VS Code REST Client o similar. 