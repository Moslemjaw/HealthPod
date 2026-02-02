#include <Wire.h>
#include <U8g2lib.h>

// -------- OLED (your working driver) --------
U8G2_SSD1306_128X32_UNIVISION_F_HW_I2C u8g2(U8G2_R0, U8X8_PIN_NONE);

// -------- Pins --------
const int SENSOR_PINS[3] = {A1, A2, A3};
const int SERVO_PINS[3]  = {3, 4, 2};


// -------- Sensor thresholds --------
int RAW_FULL   = 800; 
int RAW_MEDIUM = 550; 

enum StockLevel { LOW_LVL, MED_LVL, FULL_LVL };

StockLevel getStockLevel(int raw) {
  if (raw >= RAW_FULL)   return FULL_LVL;
  if (raw >= RAW_MEDIUM) return MED_LVL;
  return LOW_LVL;
}

// -------- Servo control (Extended Range) --------
const int SERVO_FRAME_US = 20000; // 50 Hz

// 🔥 EXTENDED RANGE (Double Rotation Span)
const int SERVO_MIN_US   = 500;   
const int SERVO_MAX_US   = 2500;  

const int SERVO_HOME_DEG[3]   = {0, 0, 0};
const int SERVO_TARGET_DEG[3] = {180, 180, 180};

// Slow movement settings
const int DEG_STEP          = 2;
const int STEP_HOLD_MS      = 18;
const int DISPENSE_HOLD_MS  = 250;
const int BETWEEN_ACTION_MS = 250;

bool busy = false;

int clampInt(int v, int lo, int hi) {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

int degToPulseUs(int deg) {
  deg = clampInt(deg, 0, 180);
  long us = SERVO_MIN_US + (long)(SERVO_MAX_US - SERVO_MIN_US) * deg / 180L;
  return (int)us;
}

void servoPulseUs(int pin, int pulseUs) {
  digitalWrite(pin, HIGH);
  delayMicroseconds(pulseUs);
  digitalWrite(pin, LOW);
  int rest = SERVO_FRAME_US - pulseUs;
  if (rest > 0) delayMicroseconds(rest);
}

void holdAngle(int servoIdx, int deg, int durationMs) {
  int pin = SERVO_PINS[servoIdx];
  int pulse = degToPulseUs(deg);
  unsigned long start = millis();
  while (millis() - start < (unsigned long)durationMs) {
    servoPulseUs(pin, pulse);
  }
}

void slowMove(int servoIdx, int fromDeg, int toDeg) {
  int step = (toDeg >= fromDeg) ? DEG_STEP : -DEG_STEP;
  int deg = fromDeg;

  while (true) {
    holdAngle(servoIdx, deg, STEP_HOLD_MS);
    if (deg == toDeg) break;

    deg += step;
    if (step > 0 && deg > toDeg) deg = toDeg;
    if (step < 0 && deg < toDeg) deg = toDeg;
  }
}

void dispense(uint8_t idx) {
  busy = true;

  int home = SERVO_HOME_DEG[idx];
  int target = SERVO_TARGET_DEG[idx];

  slowMove(idx, home, target);
  holdAngle(idx, target, DISPENSE_HOLD_MS);
  slowMove(idx, target, home);

  delay(BETWEEN_ACTION_MS);
  busy = false;
}

// -------- Sensors + OLED --------
int readSensorRaw(int pin) {
  return analogRead(pin);
}

void drawUI(const int raw[3]) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x12_tr);

  u8g2.setCursor(0, 10);
  u8g2.print("Pill Dispenser");

  u8g2.setCursor(92, 10);
  u8g2.print(busy ? "BUSY" : "OK");

  const int rowY[3] = {16, 24, 31};

  for (int i = 0; i < 3; i++) {
    StockLevel lvl = getStockLevel(raw[i]);

    u8g2.setCursor(0, rowY[i]);
    u8g2.print("C");
    u8g2.print(i + 1);
    u8g2.print(": ");

    if (lvl == FULL_LVL)      u8g2.print("FULL");
    else if (lvl == MED_LVL)  u8g2.print("MED ");
    else                      u8g2.print("LOW ");

    u8g2.setCursor(70, rowY[i]);
    u8g2.print(raw[i]);
  }

  u8g2.sendBuffer();
}

void setup() {
  Serial.begin(115200);

  for (int i = 0; i < 3; i++) {
    pinMode(SERVO_PINS[i], OUTPUT);
    digitalWrite(SERVO_PINS[i], LOW);
    holdAngle(i, SERVO_HOME_DEG[i], 200);
  }

  Wire.begin();
  u8g2.begin();

  Serial.println("Ready. Send 1/2/3 to dispense C1/C2/C3.");
  Serial.println("Extended servo rotation enabled.");
}

void loop() {
  int raw[3];
  for (int i = 0; i < 3; i++) raw[i] = readSensorRaw(SENSOR_PINS[i]);

  drawUI(raw);

  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 1000) {
    lastPrint = millis();
    Serial.print("Raw: ");
    Serial.print(raw[0]); Serial.print("  ");
    Serial.print(raw[1]); Serial.print("  ");
    Serial.println(raw[2]);
  }

  if (Serial.available()) {
    char c = (char)Serial.read();

    if (!busy && c >= '1' && c <= '3') {
      uint8_t idx = (uint8_t)(c - '1');
      dispense(idx);
    }

    if (c == 'f') { RAW_FULL += 10; Serial.print("RAW_FULL="); Serial.println(RAW_FULL); }
    if (c == 'F') { RAW_FULL -= 10; Serial.print("RAW_FULL="); Serial.println(RAW_FULL); }
    if (c == 'm') { RAW_MEDIUM += 10; Serial.print("RAW_MEDIUM="); Serial.println(RAW_MEDIUM); }
    if (c == 'M') { RAW_MEDIUM -= 10; Serial.print("RAW_MEDIUM="); Serial.println(RAW_MEDIUM); }
  }
}
