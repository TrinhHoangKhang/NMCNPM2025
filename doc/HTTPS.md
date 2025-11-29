# Request guide

## Explanation

In this app, there are 2 type of request

- Stateless Connection (HTTP): The standard "ask and answer" cycle (used for login, submitting forms, loading profiles).
- Persistent Connection (WebSockets): A live, open channel for real-time data (used for chat apps, live games, or tracking maps).

### HTTPS/REST API

#### How it works:

- Client know about Server
- Client make a send a HTTP Method to *Server*
- HTTP Method maybe contain data from *Client*
- Server responds with HTTP Status Codes

#### Use for

- Update/Upload data from/to Server
- Default method for connection between Client, Server

#### Client to Server

##### Requirement

Type

- HTTP Method: What type of request?
- URL or Path(Route): 
- Version: HTTP/2
- Host: Backend url

Header

- Content-Type: "I am sending you JSON data" (application/json).
- Authorization: "Here is my ID card/token" (Bearer eyJhbG...).
- User-Agent: "I am a Chrome browser on Windows."

Body

- For GET requests: The body is usually empty (you ask for data via the URL).
- For POST/PUT requests: This contains the form data, usually in JSON format.

##### Example 

```
POST /api/login HTTP/1.1
Host: api.mysite.com
Content-Type: application/json
Authorization: Bearer <optional_token>

{
  "email": "user@example.com",
  "password": "superSecretPassword123"
}
```

#### HTTP Method send from client

 | Action     | HTTP Method | Endpoint URL      | Body (JSON)                       |
 |------------|-------------|-------------------|-----------------------------------|
 | (Read)     | GET         | /users            | (Empty)                           |
 | (Read One) | GET         | /users/123        | (Empty)                           |
 | (Create)   | POST        | /users            | `{ name: "John", email: "..." }`  |
 | (Update)   | PUT / PATCH | /users/123        | `{ name: "John Doe" }`            |
 | (Delete)   | DELETE      | /users/123        | (Empty)                           |

#### Server to Client

##### Requirement

Header

- Version: HTTP/2
- Status Code: show status of request
- Status Text: show status in text
- Date/Time
- Content-type: "I am sending you back JSON" (application/json).
- Set-Cookie: "Save this session ID in your browser."
- Access-Control-Allow-Origin: "I allow this website to talk to me" (CORS).


##### Example

```
HTTP/1.1 200 OK
Date: Fri, 28 Nov 2025 12:00:00 GMT
Content-Type: application/json

{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1Ni...",
  "userId": 451
}
```

##### HTTP Status Codes send from backend

 | Status Code | Meaning                                           |
 |-------------|---------------------------------------------------|
 | 200         | OK (Request successful)                           |
 | 201         | Created (Resource successfully created)           |
 | 204         | No Content (Request successful, no content to send)|
 | 400         | Bad Request (Client error, e.g., invalid input)   |
 | 401         | Unauthorized (Authentication required/failed)     |
 | 403         | Forbidden (Client doesn't have permission)        |
 | 404         | Not Found (Resource not found)                    |
 | 500         | Internal Server Error (Server-side error)         |


##### Todo

- Create a Gateway Classes to convert data into HTTP method and translate HTTP back into data
- Create Authentication method for checking the correctiveness of data
- Secure data with method like encrypt/decrypt
- The data to send will have limited size, GET /api/drivers?page=1&limit=20


##### Note

- The HTTP method only handle transmition and connectivity of data.
- It should not know about what the data use for. Server will handle that
- The data sen
- When design functions, make sure to k

