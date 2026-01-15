# Bun AI API

API REST/Server-Sent Events (SSE) para chat con múltiples servicios de inteligencia artificial (IA), construida con [Bun](https://bun.sh/) y desplegada con [Coolify](https://coolify.io/).

---

## Funcionalidades

* Chat con **múltiples servicios de IA**:

  * **Groq**
  * **Cerebras**
* Rotación automática entre servicios para balancear la carga.
* Generación de un **Request ID único** por cada petición, útil para seguimiento y depuración.
* Medición de **latencia de respuesta** de cada servicio.
* Soporte para **event-stream** (SSE) para obtener respuestas en tiempo real.

---

## Endpoints

### `POST /chat`

* **Descripción:** Envía un mensaje al sistema de IA y recibe la respuesta en tiempo real.
* **Headers requeridos:**

  ```http
  Content-Type: application/json
  ```
* **Body (JSON):**

  ```json
  {
    "messages": [
      {
        "role": "user",
        "content": "Tu mensaje aquí"
      }
    ]
  }
  ```
* **Respuesta:** `text/event-stream`

  * Contiene la respuesta generada por el servicio de IA.
  * Cada petición se loguea con su **requestId** y tiempo de respuesta.

---

## Configuración requerida para usar la API

1. **Despliegue en Coolify**

   * Base Directory: `/`
   * Dockerfile Location: `/Dockerfile`
   * Hostname: `"0.0.0.0"` ✅ (necesario para que Traefik enrute correctamente)
   * Port: `3000`

2. **Desde otra aplicación**

   * Realizar peticiones HTTP POST al endpoint `/chat` usando la **IP pública** o el dominio asignado por Coolify.
   * Asegurarse de enviar **JSON válido** con la propiedad `messages` como un arreglo de objetos.
   * Ejemplo en JavaScript:

     ```javascript
     const response = await fetch("http://TU_API:3000/chat", {
       method: "POST",
       headers: {
         "Content-Type": "application/json"
       },
       body: JSON.stringify({
         messages: [
           { role: "user", content: "Hola, prueba desde otra app" }
         ]
       })
     });

     const data = await response.text();
     console.log(data);
     ```

---

## Logs y monitoreo

Cada petición se registra en los logs de Coolify:

```
[<requestId>] Recibida petición con <n> mensajes
[<requestId>] Servicio usado: <NombreServicio>, tiempo: <ms>
```

* `requestId`: UUID único de la petición.
* `NombreServicio`: El servicio de IA que respondió (Groq o Cerebras).
* `tiempo`: Latencia en milisegundos.

---

## Notas importantes

* **Siempre enviar JSON válido con `messages`**; de lo contrario, la API responderá con `400 Bad Request`.
* La API está diseñada para **respuestas en tiempo real**, así que es recomendable usar clientes que soporten **SSE** o leer la respuesta como texto continuo.
* La IP `0.0.0.0` es necesaria para que Coolify/Traefik enruten correctamente. No modificar.

---

## Ejemplo de petición usando `curl`

```bash
curl -v -X POST http://TU_API:3000/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Hola, prueba final" }
    ]
  }'
```

---

## Licencia

MIT
