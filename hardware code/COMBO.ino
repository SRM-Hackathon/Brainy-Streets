//ARDUINO-1

//MQ6 pins aout connected to A5, vcc to vcc and gnd to gnd and run the below code

//Sensor 1(for speed) Output Pin connected on Arduino Pin 2 and Sensor 3(for speed) Output Pin connected on Arduino Pin 3

#include <SoftwareSerial.h>
#include<LiquidCrystal.h>
#include<Servo.h>

Servo servo;

LiquidCrystal lcd(22, 23, 24, 25, 26, 28);

int hits=0;
int sensor1 = 52;
int sensor2 = 51;

int count=0;

int Time1;
int Time2;
int Time;
int flag = 0;

String str;

int distance =5;

int Speed;
int gasPin = A5; //GAS sensor output pin to Arduino analog A5 pin
int sensorPin = A0; // select the input pin for the LDR

float state=0;
int emergengy_led=11;

int sensorValue = 0; // variable to store the value coming from the sensor

int IR1=52;
int IR2=51;
int IR3=16;
int IR4=17;
int IR5=26;
int IR6=47;

int l1=8;
int l2=9;
int l3=10;
int l4=43;
int l5=46;

void setup()
{
  servo.attach(49);
  servo.write(0);

  pinMode(l1,OUTPUT);
  pinMode(l2,OUTPUT);
  pinMode(l3,OUTPUT);
  pinMode(l4,OUTPUT);
  pinMode(l5,OUTPUT);

  pinMode(IR1,INPUT);
  pinMode(IR2,INPUT);
  pinMode(IR3,INPUT);
  pinMode(IR4,INPUT);
  pinMode(IR5,INPUT);
  pinMode(IR6,INPUT);

  pinMode(sensorPin,INPUT);
  pinMode(gasPin,INPUT);

  pinMode(emergengy_led,OUTPUT);
  Serial.begin(115200); //Initialize serial port - 9600 bps
  Serial1.begin(115200);

  attachInterrupt(4,fun1,RISING);
  attachInterrupt(3,fun2,FALLING);
  //lcd.clear();
  lcd.begin(16,2);
  lcd.clear();
  //lcd.print("SPEED MEASURMENT");
}

void fun1()
{
  Time1 = millis();
  if (flag == 0) {flag = 1;}
  else {flag = 0;}
}

void fun2()
{
  Time2 = millis();
  if (flag == 0) {flag = 1;}
  else {flag = 0;}
}

void loop()
{
   //Serial.println(Time1);
   //Serial.println(Time2);

   attachInterrupt(4,fun1,RISING);
   attachInterrupt(3,fun2,RISING);

   if(flag == 0)
   {
      if(Time1 > Time2)
      {
        Time = Time1 - Time2;
        Speed = (distance*1000)/Time;
      }
      else if(Time2 > Time1)
      {
        Time = Time2 - Time1;
        Speed = (distance*1000)/Time;
      }
      else
      {
        Speed = 0;
      }
    }

    if(Speed == 0)
    {
      //Serial.println(Speed);
      //lcd.setCursor(0, 0);
      //lcd.cursor();
      //lcd.print("BRAINY STREETS");
      //lcd.scrollDisplayLeft();
    }

    else
    {
      if(Speed>=50)
      {
        lcd.setCursor(0, 0);
        lcd.cursor();
        lcd.print(Speed);
        Serial.println(Speed);
        lcd.print(" cm/sec");
        lcd.setCursor(0, 1);
        lcd.cursor();
        lcd.print("SLOW DOWN !!");
        //lcd.scrollDisplayLeft();
        lcd.noCursor();

        servo.write(30);
      }

      else if(Speed<50)
      {
        servo.write(30);
        lcd.setCursor(0, 0);
        lcd.cursor();
        lcd.print(Speed);
        Serial.println(Speed);
        lcd.print(" cm/sec");
        lcd.setCursor(0, 1);
        lcd.cursor();
        lcd.print("SPEED OKAY !!");
        //lcd.scrollDisplayLeft();
        lcd.noCursor();
      }

      Time1 = 0;
      Time2 = 0;
    }

    int t1 = digitalRead(IR1);
    int t2 = digitalRead(IR2);
    int t3 = digitalRead(IR3);
    int t4 = digitalRead(IR4);
    int t5 = digitalRead(IR5);
    int t6 = digitalRead(IR6);

    state=0;
    state=analogRead(gasPin);

    //Serial.println(state);
    if(state>250)
    {
      digitalWrite(emergengy_led,HIGH);
    }

    else if(state<250)
    {
      digitalWrite(emergengy_led,LOW);
    }

    sensorValue = analogRead(sensorPin);
    //Serial.println(sensorValue);

    if(sensorValue>200)
    {
        digitalWrite(l1, LOW);
        digitalWrite(l2, LOW);
        digitalWrite(l3, LOW);
        digitalWrite(l4, LOW);
        digitalWrite(l5, LOW);
    }

    if(t1!=1)
    {
        hits=hits+1;
    }

    if(t1!=1 && sensorValue < 200) // 1st IR detects //
    {
        digitalWrite(l1, HIGH);
        digitalWrite(l2, HIGH);
    }

    else if(t1==1 && t2!=1 && sensorValue < 200) // 1st IR doesnt detect and 2nd IR detects //
    {
        digitalWrite(l1, LOW);
        digitalWrite(l2, LOW);
    }

    if(t2!=1 && sensorValue < 200)
    {
        digitalWrite(l2, HIGH);
        digitalWrite(l3, HIGH);
    }


    else if(t2==1 && t3!=1 && sensorValue < 200)
    {
        digitalWrite(l2, LOW);
        digitalWrite(l3, LOW);
    }

    if(t3!=1 && sensorValue < 200)
    {
        digitalWrite(l3, HIGH);
        digitalWrite(l4, HIGH);
    }


    else if(t3==1 && t4!=1 && sensorValue < 200)
    {
         digitalWrite(l3, LOW);
         digitalWrite(l4, LOW);

    }

    if(t4!=1 && sensorValue < 200)
    {
        digitalWrite(l4, HIGH);
        digitalWrite(l5, HIGH);
    }

    else if(t4==1 && t5!=1 && sensorValue < 200)
    {
        digitalWrite(l4, LOW);
        digitalWrite(l5, LOW);
    }

     if(t5!=1 && sensorValue < 200)
    {
        digitalWrite(l5, HIGH);
        //digitalWrite(l6, HIGH);
    }

    else if(t5==1 && sensorValue < 200)
    {
        digitalWrite(l5, LOW);
        //digitalWrite(l6, LOW);
    }

    count++;
    if(count>=5000)
    {
      str=String(int(state*100))+String("$")+String(sensorValue)+String("$")+String(hits)+String("$")+String(int(Speed));
      //Serial.println(str);
      Serial1.println(str);

      hits=0;
      state=0;
      sensorValue=0;
      count=0;
    }

    //delay(5000);
}
