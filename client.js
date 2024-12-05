const WebSocket = require("ws");

// Conexión al WebSocket
const ws = new WebSocket("ws://localhost:8000");

// Enviar datos al abrir la conexión
ws.on("open", () => {
  console.log("Conectado al WebSocket");
  ws.send(
    JSON.stringify({
      event: "engine_events",
      count: 1,
      timestamp: Date.now(),
      data: [
        {
          powerunit_vin: "LEMBERGVIN",
          powerunit_id: "LEMBERGCVD",
          hardware_type: "cvd-605",
          ignition: true,
          wheels_in_motion: true,
          location: {
            city: "La Jolla",
            state: "CA",
            country: "US",
            lat: 32.7831395,
            lon: -117.25234,
          },
          engine_parameters: {
            rpm: 8921.0,
            odometer: 1000.0,
            speed: 27.0,
            fuel_level: 0.98,
            cruise_control_active: true,
            cruise_control_set_speed: 27.0,
          },
        },
      ],
    })
  );
});

// Recibir datos
ws.on("message", (message) => {
  console.log("Mensaje del servidor:", message);
});
