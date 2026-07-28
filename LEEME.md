# ERP Huevos — Cómo publicarlo (sin terminal)

Hola Patricio. Este proyecto ya está listo. Seguí estos pasos en orden.
NO necesitás terminal ni instalar nada en tu compu.

---

## PASO 1 — Subir a GitHub

1. Descomprimí el archivo `erp-huevos.zip` que te di.
2. Entrá a github.com → botón "New" (repositorio nuevo).
3. Ponele un nombre, por ejemplo: `erp-huevos`. Dejalo en "Private".
4. Arrastrá TODOS los archivos de la carpeta descomprimida adentro del repo
   (o usá "uploading an existing file" y soltá todo).
5. Confirmá con "Commit changes".

Listo, ya está en GitHub como tus otros proyectos.

---

## PASO 2 — Crear la memoria en Supabase

1. Entrá a supabase.com → "New project".
2. Elegí un nombre y una contraseña (anotala en algún lado).
3. Esperá 1–2 minutos a que se cree.
4. Cuando esté listo, andá al menú izquierdo → "SQL Editor" → "New query".
5. Copiá y pegá TODO el contenido del archivo `supabase-tablas.sql`
   (está en esta misma carpeta) y apretá "Run".
   Esto crea las tablas donde se guardan las ventas.
6. Ahora andá a "Project Settings" (el engranaje) → "API".
   Copiá y guardá estos dos datos, los vas a necesitar en el Paso 3:
      - Project URL
      - anon public (una clave larga)

---

## PASO 3 — Conectar en Vercel

1. Entrá a vercel.com → "Add New" → "Project".
2. Importá el repositorio `erp-huevos` de GitHub.
3. ANTES de darle Deploy, buscá la sección "Environment Variables"
   y agregá estas dos (con los datos que copiaste de Supabase):

      Nombre:  VITE_SUPABASE_URL
      Valor:   (pegá el Project URL)

      Nombre:  VITE_SUPABASE_ANON_KEY
      Valor:   (pegá la clave anon public)

4. Apretá "Deploy".
5. Esperá ~1 minuto. Te da una URL pública. ¡Esa es tu app online!

---

## IMPORTANTE — Seguridad

Por ahora la app no tiene contraseña de entrada.
- NO compartas la URL de Vercel con nadie todavía.
- NO cargues datos sensibles reales (teléfonos de clientes, etc.).
Cuando quieras, Claude te agrega un login en 10 minutos y queda protegida.

---

## Nota

El dashboard todavía muestra números de ejemplo (inventados).
El próximo paso es conectar la pantalla de Ventas a Supabase para que
muestre datos reales. Eso lo hacés con Claude cuando esto ya esté online.
