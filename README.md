
Steps to Run the Application

1. Open Commandline prompt and go the the project folder
2. run the command, npm i
3. create a .env file with two fields with the name
    - PORT=5000
      # SECRETS
    - ACCESS_TOKEN_SECRET
    - REFRSH_TOKEN_SECRET
 ( You can use the following JS code to generate the above SECRETS for local purpose )
 - require('crypto').randomBytes(64).toString('hex')

4. Use `npm start` to run the application.

5. Use postman to test the application. The postman collection and database will be 
   available at postman-collection folder