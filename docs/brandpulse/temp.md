Architecture Diagram
text

Collapse

Wrap

Copy
[Node.js Workers] --> [Kafka: tweets topic] --> [Node.js Consumer] --> [InfluxDB]
       |                                                    |
       |                                                    |
[Control Messages] <-- [Web App (Express + Socket.io)] --> [Real-Time Dashboard]