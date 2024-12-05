const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const mongoose = require("mongoose");

// Configuración de MongoDB
const mongoURI = "mongodb://localhost:27017/engine_events_db";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Esquema de MongoDB
const EventSchema = new mongoose.Schema({
  event: String,
  count: Number,
  timestamp: Number,
  data: [
    {
      powerunit_vin: String,
      powerunit_id: String,
      hardware_type: String,
      ignition: Boolean,
      wheels_in_motion: Boolean,
      location: {
        city: String,
        state: String,
        country: String,
        lat: Number,
        lon: Number,
      },
      engine_parameters: {
        rpm: Number,
        odometer: Number,
        speed: Number,
        fuel_level: Number,
        cruise_control_active: Boolean,
        cruise_control_set_speed: Number,
      },
    },
  ],
  created_at: { type: Date, default: Date.now },
});

const EventModel = mongoose.model("Event", EventSchema);

// Configuración del servidor Express
const app = express();
const server = http.createServer(app);

// Configuración de WebSocket
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("Nuevo cliente conectado");

  // Manejo de mensajes recibidos
  ws.on("message", async (message) => {
    console.log("Mensaje recibido:", message);

    try {
      const eventData = JSON.parse(message);
      // Guardar en MongoDB
      const newEvent = new EventModel(eventData);
      await newEvent.save();

      // Enviar a todos los clientes conectados
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(eventData));
        }
      });
    } catch (error) {
      console.error("Error procesando el mensaje:", error);
      ws.send(
        JSON.stringify({
          error: "Invalid data format",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("Cliente desconectado");
  });
});

// Ruta para obtener eventos almacenados
app.get("/events", async (req, res) => {
  try {
    const events = await EventModel.find();
    res.json(events);
  } catch (error) {
    console.error("Error obteniendo eventos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Iniciar servidor
const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
