#include <ESP8266WiFi.h>
#include <WiFiClient.h> 
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include<Servo.h>

Servo servo;

int buzzer=D1;

const char *ssid =  "SRM-Event";     // replace with your wifi ssid and wpa2 key
const char *pass =  "SRMist#3333";
String postStr;

int baricade=0;
int ambulance=0;

String token="32b2fdda1091d026ce83267aad75078a740c07c9";

WiFiClient client;

void setup() 
{
      servo.attach(D2);
      servo.write(0);

      pinMode(buzzer,OUTPUT);
      
      // Open serial communications and wait for port to open:
      Serial.begin(115200);
      while (!Serial) 
      {
         ; // wait for serial port to connect. Needed for native USB port only
      }
     
      delay(10);
 
      Serial.println("Connecting to ");
      Serial.println(ssid);
 
 
      WiFi.begin(ssid, pass);
 
      while (WiFi.status() != WL_CONNECTED) 
      {
            delay(500);
            Serial.print(".");
      }
      Serial.println("");
      Serial.println("WiFi connected");
 
}
 
void loop() 
{
    HTTPClient http;    //Declare object of class HTTPClient
    
    http.begin("http://10.4.62.24:8000/api/save-data/");              //Specify request destination

    char postStr[1000] = "";
    char recv;
    int i = 0;

    while(!Serial.available())
    {
      Serial.print(".");
    }
    
    while(Serial.available()) {
      recv = char(Serial.read());
      //Serial.println(recv);
      postStr[i] = recv;
      i++;
    }
    
    http.addHeader("Authorization", "Token "+token);

    //Serial.println(postStr);
    
    int httpCode = http.POST(postStr+String("Token")+token);   //Send the request
      

    String payload = http.getString();    //Get the response payload

    
    //Serial.println(payload);    //Print request response payload
    //Serial.println(httpCode);   //Print HTTP return code

    baricade=payload[1];
    ambulance=payload[4];

    //Serial.println(baricade);
    //Serial.println(ambulance);

    if(baricade==49)
    {
        servo.write(90);
    }

    else if(baricade==48)
    {
        servo.write(0);
    }

    if(ambulance==49)
    {
      Serial.println("Ambulance Approaching");
      Serial.println("Clear the Right Lane");
      digitalWrite(buzzer,HIGH);
    }

    else if(ambulance==48)
    {
      digitalWrite(buzzer,LOW);
    }

    delay(5000);

    http.end();  //Close connection
    Serial.println("Sending");
}
