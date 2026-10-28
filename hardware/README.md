# ESP32 USB test

The Water Quality page can read an ESP32 over USB in a browser with Web Serial, such as Chrome or Edge. Use `http://localhost:3000` locally or HTTPS on a hosted frontend. The signed-in browser sends measurements to `POST /api/hardware`; no database credentials or login cookies go onto the ESP32.

1. Upload the existing EcoPrawn sketch. Its settings are DS18B20 data on GPIO 25, HC-SR04 Trigger on GPIO 5 and Echo on GPIO 18, with serial at 115200 baud. The error message saying GPIO 4 should say GPIO 25.
2. Close Arduino Serial Monitor and Serial Plotter. Only one application can open the USB port at a time.
3. Sign in to EcoPrawn, open **Water Quality**, choose **Tank 1**, and press **Connect ESP32**. Choose the CP210x USB serial port, currently COM9 on this computer.
4. A saved reading counter and timestamp confirm successful API/database writes. Move a flat target in front of the ultrasonic sensor and verify that its distance changes. Disconnect and reload the page to confirm the latest reading remains in the database.
5. Keep this browser tab open during the test. You can open Overview using the sidebar while USB continues reading. The Water Level gauge refreshes automatically and shows distance in centimetres until calibration is supplied, then percentage. The USB session stays assigned to the tank chosen when connecting, even when viewing another tank. Disconnect before uploading another sketch or reopening Serial Monitor.

The original human-readable sketch is supported without firmware changes:

```text
--- EcoPrawn Telemetry ---
Water Temperature: 28.25 °C
Water Level Distance: 15.42 cm
-----------------------------------
```

The parser also accepts one JSON object per line, for example `{"temperature":28.25,"distanceCm":15.42}`. A disconnected sensor can report `null`; it is not replaced with a simulated measurement. Frames in which both sensors fail are not saved. Temperature must be -55 to 125 C and distance must be 2 to 400 cm.

The HC-SR04 measures distance, not water level percentage. Leave calibration blank for raw centimetres. To enable percentage, measure sensor-to-water distance with the tank at empty and full levels and enter both before connecting. The backend computes `100 * (emptyDistance - distance) / (emptyDistance - fullDistance)`, clamped to 0–100. This is relative water height; volume percentage requires a tank of constant cross-sectional area.

Overview reads the latest saved hardware measurement for each owned tank. Its Water Level gauge uses calibrated percentage when available, otherwise raw distance with a calibration label. In All tanks mode, uncalibrated distances are averaged only with other uncalibrated distances and identify the contributing tanks; centimetres and percentages are never averaged together. Other parameters still use the existing recorded water dataset. This USB test does not send SMS. Production Wi-Fi ingestion and measured-parameter alerts need their own device authentication and alert integration.

## Wiring checks

- DS18B20: data on GPIO 25, common ground, and a 4.7 kΩ pull-up from data to 3.3 V. Check the specific probe's wire colours against its documentation. The disconnected sentinel `-127` is never stored as a temperature.
- HC-SR04: common ground, Trigger on GPIO 5, and Echo through a voltage divider to GPIO 18. A standard HC-SR04 Echo signal is 5 V and must be reduced before reaching the ESP32. See [Adafruit's pinout guide](https://learn.adafruit.com/ultrasonic-sonar-distance-sensors/pinouts).
- If Arduino reports valid distance but "Sensor disconnected" for temperature, the USB connection can still save distance. Fix the DS18B20 wiring separately.

## Backend setup

`HardwareTelemetry` stores partial hardware readings with an index on tank and timestamp. Access goes through the backend, which checks the verified account's tank ownership for both reads and writes. RLS is enabled and direct public/anon/authenticated table access is revoked on the hosted database.

For an existing hosted `ecoprawn` database, `backend/prisma/add-hardware-telemetry.sql` is the additive schema change. For a fresh local database, use the Prisma schema. Generate the Prisma client and restart the backend after adding the model. Run `bun run test:hardware` in `backend` to check parsing, calibration, validation and account isolation without hardware or SMS.
